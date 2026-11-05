"""Reel upload page: phone -> laptop over home Wi-Fi -> auto-edit -> Save + Copy caption.

Start:  py reels\\upload_server.py      (or double-click reels\\Start Reel Upload.bat)
Then on the phone (same Wi-Fi) open the address it prints, e.g. http://192.168.0.12:8800

- Raw uploads land in reels\\inbox\\, finished Reels in reels\\ready\\ (both kept out of git).
- One video is edited at a time with reel_editor.py (same look, trim start/end only).
- Standard library only. State lives in reels\\ready\\reels.json, so a restart keeps the list
  and re-queues anything that was mid-edit.
"""
import difflib, json, os, re, socket, subprocess, sys, threading, time, uuid
import urllib.request
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, unquote
import ghl_poster as gp

HERE = os.path.dirname(os.path.abspath(__file__))
INBOX = os.path.join(HERE, "inbox")
READY = os.path.join(HERE, "ready")
STATE = os.path.join(READY, "reels.json")
EDITOR = os.path.join(HERE, "reel_editor.py")
PORT = 8800
CHUNK = 1 << 20
os.makedirs(INBOX, exist_ok=True)
os.makedirs(READY, exist_ok=True)
REFS = os.path.join(HERE, "reference")
os.makedirs(REFS, exist_ok=True)

lock = threading.Lock()
wake = threading.Event()
pwake = threading.Event()  # wakes the GHL poster (approve / retry)


def load():
    try:
        return json.load(open(STATE, encoding="utf-8"))
    except Exception:
        return []


def save(items):
    tmp = STATE + ".tmp"
    json.dump(items, open(tmp, "w", encoding="utf-8"), indent=1)
    os.replace(tmp, STATE)


def update(rid, **kw):
    with lock:
        items = load()
        for it in items:
            if it["id"] == rid:
                it.update(kw)
        save(items)


def caption_for(plan_path, words_path):
    """Caption line 1 = the hook (outcome-led header he reads out). Line 2 = the closing CTA sentence."""
    try:
        p = json.load(open(plan_path, encoding="utf-8"))
    except Exception:
        return ""
    hook = p["hook"][0].replace("'", "’").strip()
    try:
        text = " ".join(w["w"] for w in json.load(open(words_path, encoding="utf-8")))
    except Exception:
        text = ""
    sents = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
    cta = next((s for s in reversed(sents) if re.search(r"\b(DM|comment)\b", s, re.I)), "")
    cta = re.sub(r"\b(feeling)\b", "FEELING", cta, flags=re.I) if re.search(r"\b(DM|comment)\b", cta, re.I) else cta
    cta = re.sub(r",\s*(FEELING)", r" \1", cta)
    cta = re.sub(r",\s+(and|or)\b", r" \1", cta)
    cta = cta.replace("'", "’").replace(" - ", " ").replace("—", " ")
    return hook + ("\n\n" + cta if cta else "")


# ── Hub calendar link (2026-11-04) ─────────────────────────────────────────────────────────────────────
# Each upload is matched to a Reel on the Hub calendar by its opening words, so Olly can bulk upload in any order.
# The calendar hook wording goes on screen (no mishearing); captions come from the Hub's Perfect Reel templates;
# Edited / Posted go back to the Hub calendar. Key = reels\.hubkey (git-ignored) = Pages secret REELS_KEY.
HUB_URL = "https://hub.ollyhenson.com/api/track/reels"
PLATS = ["instagram", "facebook", "tiktok", "youtube"]
PH = "VIDEO TITLE GOES HERE"
_hub_cache = {"t": 0, "d": None}
UA = {"User-Agent": "ReelUpload/1.0"}  # Cloudflare blocks Python's default User-Agent with a 403


def hub_key():
    try:
        return open(os.path.join(HERE, ".hubkey"), encoding="utf-8").read().strip()
    except OSError:
        return ""


def hub_get(fresh=False):
    """Calendar Reels not yet published + caption templates, or None if the Hub can't be reached."""
    if not fresh and _hub_cache["d"] and time.time() - _hub_cache["t"] < 60:
        return _hub_cache["d"]
    try:
        with urllib.request.urlopen(urllib.request.Request(HUB_URL + "?key=" + hub_key(), headers=UA), timeout=15) as r:
            d = json.load(r)
        if d.get("ok"):
            _hub_cache.update(t=time.time(), d=d)
            return d
    except Exception as e:
        print("hub get failed:", e)
    return None


def hub_stage(title, stage, slot=None):
    if not title:
        return
    try:
        body = {"title": title, "stage": stage}
        if slot:
            body["slot"] = slot   # the real posting time, so the Hub calendar shows the day it actually goes out (2026-11-05)
        req = urllib.request.Request(HUB_URL + "?key=" + hub_key(), data=json.dumps(body).encode(),
                                     headers={"content-type": "application/json", **UA}, method="POST")
        urllib.request.urlopen(req, timeout=15).read()
        _hub_cache["t"] = 0
    except Exception as e:
        print("hub stage failed:", e)


def norm(t):
    return re.sub(r"[^a-z0-9' ]", " ", t.lower().replace("’", "'")).split()


def match_score(hook, spoken):
    """Share of the hook's words said in order at the start of the video (0-1)."""
    h, sp = norm(hook), norm(spoken)[: len(norm(hook)) + 8]
    if not h or not sp:
        return 0.0
    m = difflib.SequenceMatcher(None, h, sp, autojunk=False)
    return sum(b.size for b in m.get_matching_blocks()) / len(h)


def taken_titles(items, skip_id=None):
    return {it.get("match", "").lower() for it in items if it.get("match") and it["id"] != skip_id and it["status"] != "failed"}


def candidates(hub, items, skip_id=None):
    taken = taken_titles(items, skip_id)
    return [r for r in (hub or {}).get("reels", []) if r["stage"] in ("", "edited") and r["title"].lower() not in taken]


def best_match(spoken, cands):
    scored = sorted(((match_score(r["title"], spoken), r) for r in cands), key=lambda x: -x[0])
    if scored and scored[0][0] >= 0.5:
        return scored[0][1], round(scored[0][0], 2)
    return None, round(scored[0][0], 2) if scored else 0.0


def captions_for(title, offer, hub):
    """The Hub's captions exactly as they are per platform (Olly 2026-11-04: keep the layout); only the CTA set changes."""
    tpl = ((hub or {}).get("captions") or {}).get(offer or "video") or {}
    return {pl: (tpl.get(pl) or "").replace(PH, title) for pl in PLATS}


CTA_VERB = re.compile(r"\b(comment|dm|message|type|write|send)\b")


def spoken_offer(raw):
    """The keyword he actually asked for near the end: ATTRACT -> attract, FEELING / EMOTION -> scale, VIDEO -> video."""
    try:
        words = json.load(open(os.path.splitext(raw)[0] + ".words.json", encoding="utf-8"))
    except Exception:
        return None
    tail = " ".join(w["w"] for w in words[-60:]).lower()
    hits = []
    for k, o in (("attract", "attract"), ("feeling", "scale"), ("emotion", "scale"), ("video", "video")):
        i = tail.rfind(k)
        if i >= 0 and CTA_VERB.search(tail[max(0, i - 60):i]):
            hits.append((i, o))
    return max(hits)[1] if hits else None


def words_only(raw, log):
    py = sys.executable.replace("pythonw.exe", "python.exe")
    r = subprocess.run([py, EDITOR, raw, raw + ".tmp.mp4", "--words-only"], capture_output=True, text=True, encoding="utf-8",
                       errors="replace", creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    log.write(r.stdout + r.stderr)
    m = re.search(r"^FIRSTWORDS (.+)$", r.stdout, re.M)
    if r.returncode != 0 or not m:
        raise RuntimeError((r.stdout + r.stderr)[-400:])
    return json.loads(m.group(1))


def worker():
    while True:
        with lock:
            items = load()
            job = next((it for it in items if it["status"] == "queued"), None)
            if job:
                job["status"] = "editing"
                job["started"] = time.time()
                save(items)
        if not job:
            wake.wait(30)
            wake.clear()
            continue
        out = os.path.join(READY, job["id"] + ".mp4")
        log = os.path.join(READY, job["id"] + ".log")
        try:
            with open(log, "w", encoding="utf-8") as lf:
                hub = hub_get(fresh=True)
                if not job.get("picked"):  # matched by its opening words unless Olly picked the hook himself
                    spoken = words_only(job["raw"], lf)
                    with lock:
                        cands = candidates(hub, load(), job["id"])
                    m, score = best_match(spoken, cands)
                    job["match"], job["offer"], job["spoken"], job["score"] = (m or {}).get("title", ""), (m or {}).get("offer", "video"), spoken, score
                    update(job["id"], match=job["match"], offer=job["offer"], spoken=spoken, score=score, date=(m or {}).get("date", ""))
                lf.flush()
                py = sys.executable.replace("pythonw.exe", "python.exe")
                cmd = [py, EDITOR, job["raw"], out] + (["--hook", job["match"]] if job.get("match") else [])
                r = subprocess.run(cmd, stdout=lf, stderr=subprocess.STDOUT,
                                   creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
            if r.returncode != 0 or not os.path.exists(out):
                raise RuntimeError(open(log, encoding="utf-8", errors="replace").read()[-400:])
            plan = out + ".plan.json"
            hook = ""
            try:
                hook = json.load(open(plan, encoding="utf-8"))["hook"][0]
            except Exception:
                pass
            said = spoken_offer(job["raw"])  # the keyword he said beats the calendar's CTA
            if said:
                job["offer"] = said
            caps = captions_for(hook or job.get("match"), job.get("offer"), hub) if hub and hub.get("captions") else {}
            cap = caps.get("instagram") or caption_for(plan, os.path.splitext(job["raw"])[0] + ".words.json")
            try:  # YouTube only counts it as a Short at 3:00 or under (warning on the page)
                pj = json.load(open(plan, encoding="utf-8"))
                length = round(pj.get("length") or pj["trim"][1] - pj["trim"][0], 1)
            except Exception:
                length = 0
            update(job["id"], status="ready", file=job["id"] + ".mp4", hook=hook, length=length, caption=cap, captions=caps, offer=job.get("offer"), finished=time.time())
            if job.get("match"):
                hub_stage(job["match"], "edited")
        except Exception as e:
            update(job["id"], status="failed", error=str(e)[-400:])


PAGE = r"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Reel Upload</title>
<style>
:root{--bg:#f6f4fb;--card:#fff;--ink:#1d1830;--mut:#6b6580;--pur:#6c3fd1;--grn:#10b956;--red:#d0343f;--line:#e6e1f2}
@media (prefers-color-scheme:dark){:root{--bg:#141220;--card:#1f1c2e;--ink:#f2effa;--mut:#a39dba;--line:#2e2a42}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.4 -apple-system,system-ui,sans-serif;padding:16px 16px 60px}
h1{font-size:22px;margin:4px 0 2px}.sub{color:var(--mut);font-size:14px;margin:0 0 16px}
.drop{display:block;background:var(--pur);color:#fff;text-align:center;border-radius:16px;padding:22px 16px;font-weight:700;font-size:18px}
.drop small{display:block;font-weight:400;opacity:.85;font-size:13px;margin-top:4px}
input[type=file]{position:absolute;opacity:0;width:1px;height:1px;overflow:hidden}
.drop{position:relative}#msg{font-size:14px;color:var(--mut);margin-top:8px;min-height:1em}
.up{margin-top:10px}.bar{height:8px;background:var(--line);border-radius:4px;overflow:hidden;margin-top:6px}.bar i{display:block;height:100%;background:var(--pur);width:0}
h2{font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);margin:26px 0 8px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:12px}
.hook{font-weight:700;margin-bottom:6px}.meta{color:var(--mut);font-size:13px}
.st{display:inline-block;font-size:12px;font-weight:700;padding:2px 8px;border-radius:99px;background:var(--line);color:var(--ink)}
.st.ready{background:var(--grn);color:#fff}.st.failed{background:var(--red);color:#fff}.st.editing{background:var(--pur);color:#fff}
video{width:100%;border-radius:10px;background:#000;margin:10px 0;max-height:60vh}
textarea{width:100%;min-height:96px;border:1px solid var(--line);border-radius:10px;padding:10px;font:inherit;background:var(--bg);color:var(--ink)}
.row{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
button,.btn{flex:1;min-width:120px;border:0;border-radius:10px;padding:12px;font:600 15px system-ui;background:var(--pur);color:#fff;text-align:center;text-decoration:none}
.ghost{background:transparent;border:1px solid var(--line);color:var(--ink)}
.tip{font-size:13px;color:var(--mut);margin-top:8px}.err{color:var(--red);font-size:13px;white-space:pre-wrap;margin-top:6px}
.empty{color:var(--mut);font-size:14px}
.approve{background:var(--grn);font-size:17px;padding:14px}.when{font-weight:700;color:var(--pur);font-size:14px;margin-bottom:4px}
.res{font-size:13px;color:var(--mut);margin-top:4px}
.todo{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:4px 14px}
.todo div{padding:9px 0;border-bottom:1px solid var(--line);font-weight:600}.todo div:last-child{border:0}.todo small{display:block;font-weight:400;color:var(--mut);font-size:12px}
.match{font-size:13px;margin:2px 0 6px;color:var(--grn);font-weight:600}.match.no{color:var(--red)}
select{width:100%;border:1px solid var(--line);border-radius:10px;padding:10px;font:inherit;background:var(--bg);color:var(--ink);margin-top:6px}
.plats{display:flex;gap:6px;margin:4px 0 6px}.plats button{min-width:0;padding:8px 4px;font-size:13px}
</style></head><body>
<h1>Reel Upload</h1><p class="sub">Pick all your raw videos in any order. The laptop matches each one to its hook on the calendar and edits them one at a time.</p>
<label class="drop">Upload raw videos<small>Best way: in Photos run the <b>Send to Reel Upload</b> shortcut and tick them all (Do Not Disturb on, screen on). This button works for one or two short videos</small><input id="f" type="file" accept="video/*" multiple></label>
<div id="msg"></div>
<label class="drop ghost" style="margin-top:10px;padding:14px;font-size:15px">Upload a reference Reel<small style="color:var(--mut)">Your best posted Reels, so the style stays the same. Not edited.</small><input id="rf" type="file" accept="video/*" multiple></label>
<div id="ups"></div>
<h2 id="todoh">Waiting for videos</h2><div id="todo"></div>
<h2>To approve</h2><div id="ready"></div>
<h2>Scheduled</h2><div id="sched"></div>
<h2>Being edited</h2><div id="work"></div>
<h2>Posted</h2><div id="posted"></div>
<script>
const $=s=>document.querySelector(s);
const esc=s=>(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let queue=[],busy=false;
const msg=t=>$('#msg').textContent=t;
$('#f').onclick=()=>msg('Opening Photos... After you tap Add, your iPhone can take a minute to get the video ready. Keep this page open.');
$('#rf').onclick=()=>msg('Opening Photos...');
$('#rf').onchange=e=>{const fs=[...e.target.files];if(!fs.length){msg('');return}msg('Sending '+fs.length+' reference Reel'+(fs.length>1?'s':'')+'...');for(const f of fs){f.ref=1;queue.push(f)}setTimeout(()=>{e.target.value=''},0);next();};
$('#f').onchange=e=>{const fs=[...e.target.files];if(!fs.length){msg('');return}msg(fs.length+' video'+(fs.length>1?'s':'')+' picked. Sending to the laptop...');for(const f of fs)queue.push(f);setTimeout(()=>{e.target.value=''},0);next();};
// Keep the screen on while sending (2026-11-04): iOS stops a web page's upload the moment it locks or you leave it
let wl=null;async function awake(on){try{if(on&&!wl&&navigator.wakeLock){wl=await navigator.wakeLock.request('screen');wl.addEventListener('release',()=>{wl=null})}if(!on&&wl){await wl.release();wl=null}}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&(busy||queue.length))awake(true)});
function next(){if(busy||!queue.length){if(!busy&&!queue.length)awake(false);return}awake(true);busy=true;const f=queue.shift();
 const d=document.createElement('div');d.className='card up';d.innerHTML=`<div class="meta">${esc(f.name)} · ${(f.size/1048576).toFixed(0)} MB</div><div class="bar"><i></i></div>`;$('#ups').prepend(d);
 const x=new XMLHttpRequest();x.open('POST',f.ref?'/upload?ref=1':'/upload');x.setRequestHeader('X-Name',encodeURIComponent(f.name));
 // Watchdog (2026-11-04): leaving the page kills the upload without telling it, which left the page "busy" forever
 // and new picks did nothing. No progress for 20s while visible = give up, say so, move on.
 let last=Date.now(),done=false;const dog=setInterval(()=>{if(done){clearInterval(dog);return}if(document.visibilityState==='visible'&&Date.now()-last>20000){clearInterval(dog);done=true;try{x.abort()}catch(e){}d.querySelector('.meta').textContent+=' · stopped (the page was closed or the phone locked). Pick it again.';busy=false;msg('An upload stopped part way. Pick that video again.');next();}},3000);
 x.upload.onprogress=p=>{last=Date.now();if(p.lengthComputable)d.querySelector('i').style.width=(100*p.loaded/p.total)+'%'};
 x.onabort=()=>{if(!done){done=true;busy=false;next();}};
 x.onload=()=>{done=true;d.querySelector('.meta').textContent+=x.status==200?(f.ref?' · saved as a reference':' · uploaded, queued for editing'):' · upload failed';if(!queue.length)msg(x.status==200?'Sent. The laptop is editing it now (see below).':'Upload failed. Try again.');if(x.status==200)setTimeout(()=>d.remove(),4000);busy=false;refresh();next();};
 x.onerror=()=>{if(done)return;done=true;d.querySelector('.meta').textContent+=' · upload failed (still on the same Wi-Fi?)';busy=false;next();};
 x.send(f);}
async function act(id,a){await fetch('/'+a+'/'+id,{method:'POST'});refresh();}
async function copyCap(id,btn){const t=document.getElementById('cap-'+id).value;
 try{await navigator.clipboard.writeText(t)}catch(e){const ta=document.getElementById('cap-'+id);ta.select();document.execCommand('copy')}
 btn.textContent='Copied ✓';setTimeout(()=>btn.textContent='Copy caption',1500);
 saveCap(id,t);}
async function saveVid(id,file,btn){
 try{const r=await fetch('/video/'+file);const b=await r.blob();const fl=new File([b],file,{type:'video/mp4'});
  if(navigator.canShare&&navigator.canShare({files:[fl]})){await navigator.share({files:[fl]});return;}}catch(e){if(e.name==='AbortError')return;}
 location.href='/video/'+file+'?dl=1';}
let editing=new Set();
let hubReels=null;const capPlat={};const PL={instagram:'Instagram',facebook:'Facebook',tiktok:'TikTok',youtube:'YouTube'};
async function loadHub(){try{const d=await (await fetch('/hub-reels')).json();hubReels=d.ok?d:null}catch(e){hubReels=null}}
function fmtDay(iso){const d=new Date(iso+'T00:00:00');return d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}
function pickOpts(it){const opts=(hubReels&&hubReels.reels||[]).filter(r=>r.stage===''||r.title===it.match);
 return '<option value="">'+(it.match?'Change the hook…':'Pick the hook from the calendar…')+'</option>'+opts.map(r=>`<option value="${esc(r.title)}">${esc(r.title)} (${fmtDay(r.date)})</option>`).join('')+'<option value="__spoken">Use what I said (no calendar hook)</option>';}
async function repick(id,sel){const v=sel.value;if(!v)return;await fetch('/match/'+id,{method:'POST',body:v==='__spoken'?'':v});msg('Re-editing with that hook. It takes about 2 minutes.');refresh();}
function showPlat(id,pl){const it=window._items[id];capPlat[id]=pl;const ta=document.getElementById('cap-'+id);ta.value=(it.captions&&it.captions[pl])||it.caption||'';
 document.querySelectorAll('#plats-'+id+' button').forEach(b=>b.className=b.dataset.p===pl?'':'ghost');}
// Only redraw a list when it actually changed: redrawing every 8s rebuilt the video players and killed playback (2026-11-04)
const lastH={};function setH(sel,h){if(lastH[sel]===h)return;lastH[sel]=h;$(sel).innerHTML=h;}
function whenTxt(iso){if(!iso)return'';return new Date(iso).toLocaleString('en-GB',{timeZone:'Africa/Windhoek',weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
async function delReel(id,btn){if(btn.dataset.sure!=='1'){btn.dataset.sure='1';btn.textContent='Tap again to delete';setTimeout(()=>{btn.dataset.sure='';btn.textContent='Delete'},3000);return}btn.disabled=true;btn.textContent='Deleting…';await fetch('/delete/'+id,{method:'POST'});msg('Deleted. It will not be posted.');refresh();}
async function approve(id,btn){btn.disabled=true;btn.textContent='Scheduling…';await fetch('/approve/'+id,{method:'POST'});msg('Approved. It\'s being uploaded to GHL and booked into the next free slot.');refresh();}
async function unsched(id,btn){if(!confirm('Take this Reel off the schedule? It goes back to To approve.'))return;btn.disabled=true;btn.textContent='Removing…';await fetch('/unschedule/'+id,{method:'POST'});refresh();}
function saveCap(id,t){fetch('/caption/'+id+'?p='+(capPlat[id]||'instagram'),{method:'POST',body:t})}
async function refresh(){let items;try{items=await (await fetch('/list')).json()}catch(e){return}
 window._items={};for(const it of items)window._items[it.id]=it;
 if(!hubReels)await loadHub();
 if(hubReels){const have=new Set(items.filter(it=>it.match&&it.status!=='failed').map(it=>it.match.toLowerCase()));
  const today=new Date().toISOString().slice(0,10);
  const due=hubReels.reels.filter(r=>r.stage===''&&!have.has(r.title.toLowerCase())&&(r.recorded||r.date===today));
  $('#todoh').textContent='Waiting for videos ('+due.length+')';
  // Getting ahead (Olly 2026-11-05): how far the uploads reach, and the next Reels on the calendar to send, in order.
  // Moves on every time an upload matches a hook. (The Hub sends Reels up to 14 days ahead.)
  const open=hubReels.reels.filter(r=>r.stage===''&&!have.has(r.title.toLowerCase())).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
  const loc=x=>x.toLocaleDateString('en-CA'),todayL=loc(new Date());let upto='';if(open.length&&open[0].date>todayL){const d=new Date(open[0].date+'T00:00:00');d.setDate(d.getDate()-1);upto=loc(d)<todayL?'':loc(d);}
  const ahead=open.filter(r=>!due.includes(r)).slice(0,6);
  $('#todo').innerHTML=(due.length?'<div class="todo">'+due.map(r=>`<div>${esc(r.title)}<small>${fmtDay(r.date)}${r.recorded?' · recorded':''}</small></div>`).join('')+'</div>':'<p class="empty">Every recorded Reel on the calendar is uploaded.</p>')
   +(upto?`<p class="empty">Uploaded up to ${upto===todayL?'today':fmtDay(upto)} ✓</p>`:'')
   +(ahead.length?`<h3 style="margin:14px 0 6px;font-size:15px">Next on the calendar</h3><div class="todo">${ahead.map((r,i)=>`<div>${i===0?'<b>Next: </b>':''}${esc(r.title)}<small>${fmtDay(r.date)}</small></div>`).join('')}</div>`:(open.length?'':'<p class="empty">Nothing else on the calendar yet. Add Reels in the content generator.</p>'));}
 else{$('#todoh').textContent='Waiting for videos';$('#todo').innerHTML='<p class="empty">Can\'t reach the Hub calendar right now. Uploads still get edited, using what you said as the hook.</p>';}
 const r=[],w=[],p=[],s=[];
 // Duplicates (Olly 2026-11-05): the same video uploaded twice says so, with one Delete button, instead of "Not matched"
 const dupOf={},seen={},key=t=>String(t||'').toLowerCase().replace(/[^a-z0-9 ]/g,'').split(/\s+/).filter(Boolean).slice(0,25).join(' ');
 for(const it of items.slice().sort((a,b)=>(a.uploaded||0)-(b.uploaded||0))){const k=key(it.spoken);if(k.split(' ').length<8)continue;if(seen[k])dupOf[it.id]=seen[k];else seen[k]=it;}
 for(const it of items.slice().reverse()){
  if(it.status==='ready'&&dupOf[it.id]){const o=dupOf[it.id];
   r.push(`<div class="card" id="card-${it.id}"><div class="hook">${esc(it.hook||it.name)}</div>
   <div class="match no">Duplicate: you've already uploaded this video${o.match?' (“'+esc(o.match)+'”)':''}. Delete this copy?</div>
   <div class="row"><button class="approve" onclick="delReel('${it.id}',this)">Delete duplicate</button></div></div>`);continue}
  if(it.status==='ready'){if(editing.has(it.id)&&document.getElementById('card-'+it.id)){r.push(document.getElementById('card-'+it.id).outerHTML);continue}
   const pl=capPlat[it.id]||'instagram';const hasCaps=it.captions&&it.captions.instagram;
   r.push(`<div class="card" id="card-${it.id}"><div class="hook">${esc(it.hook||it.name)}</div>
   ${it.match?`<div class="match">✓ Matched to the calendar</div>`:`<div class="match no">Not matched to a calendar hook${it.spoken?' (heard: “'+esc(it.spoken.split(' ').slice(0,12).join(' '))+'…”)':''}</div>`}
   <select onchange="repick('${it.id}',this)">${pickOpts(it)}</select>
   <video src="/video/${it.file}?v=${Math.round(it.finished||0)}" controls playsinline preload="metadata"></video>
   ${hasCaps?`<div class="plats" id="plats-${it.id}">${Object.keys(PL).map(k=>`<button data-p="${k}" class="${k===pl?'':'ghost'}" onclick="showPlat('${it.id}','${k}')">${PL[k]}</button>`).join('')}</div>`:''}
   <textarea id="cap-${it.id}" onfocus="editing.add('${it.id}')" onblur="editing.delete('${it.id}');saveCap('${it.id}',this.value)">${esc(hasCaps?it.captions[pl]:it.caption)}</textarea>
   ${it.length>179.5?`<div class="err">This Reel is ${Math.floor(it.length/60)}:${String(Math.round(it.length%60)).padStart(2,'0')} long. YouTube only counts it as a Short at 3:00 or under, so it would go up there as a normal video.</div>`:''}
   <div class="row"><button class="approve" onclick="approve('${it.id}',this)">✓ Approve and schedule</button></div>
   <div class="tip">Approve books the next free slot (your calendar day first) and schedules it on Instagram, Facebook, TikTok and YouTube with each platform's caption.</div>
   <div class="row"><button class="ghost" onclick="saveVid('${it.id}','${it.file}',this)">Save to Photos</button><button class="ghost" onclick="copyCap('${it.id}',this)">Copy caption</button><button class="ghost" onclick="delReel('${it.id}',this)">Delete</button></div></div>`);}
  else if(it.status==='scheduled')s.push(`<div class="card"><div class="when">${whenTxt(it.slot)}</div><div class="hook">${esc(it.hook||it.name)}</div>
   <div class="res">${Object.keys(it.ghl||{}).map(k=>PL[k]).join(' · ')}</div>${it.post_error?`<div class="err">${esc(it.post_error)}</div>`:''}
   <div class="row"><button class="ghost" onclick="unsched('${it.id}',this)">Unschedule</button></div></div>`);
  else if(it.status==='posted')p.push(`<div class="card"><div class="hook">${esc(it.hook||it.name)}</div>${it.slot?`<div class="res">${whenTxt(it.slot)} · ${Object.entries(it.results||{}).map(([k,v])=>(it.links&&it.links[k]?`<a href="${it.links[k]}" target="_blank" rel="noopener">${PL[k]}</a>`:PL[k])+(v==='published'?' ✓':' ✗')).join(' · ')||'marked by hand'}</div>`:''}${it.post_error?`<div class="err">${esc(it.post_error)}</div>`:''}</div>`);
  else{const lab={queued:'Waiting',editing:'Editing now',failed:'Failed',approved:'Waiting to schedule',scheduling:'Uploading to GHL',post_failed:'Scheduling failed'}[it.status];
   const mins=it.status==='editing'?` · started ${Math.round((Date.now()/1000-it.started)/60)} min ago (about 7 min for a 3-min Reel)`:'';
   w.push(`<div class="card"><span class="st ${it.status}">${lab}</span> <span class="meta">${esc(it.match||it.name)}${mins}</span>${it.status==='failed'?`<div class="err">${esc(it.error)}</div><div class="row"><button class="ghost" onclick="act('${it.id}','retry')">Try again</button></div>`:''}${it.status==='post_failed'?`<div class="err">${esc(it.post_error)}</div><div class="row"><button class="ghost" onclick="act('${it.id}','retrypost')">Try again</button><button class="ghost" onclick="unsched('${it.id}',this)">Cancel</button></div>`:''}</div>`);}
 }
 setH('#ready',r.join('')||'<p class="empty">Nothing ready yet.</p>');
 setH('#work',w.join('')||'<p class="empty">Nothing in the queue.</p>');
 s.sort((a,b)=>a.localeCompare(b));
 setH('#sched',items.filter(it=>it.status==='scheduled').sort((a,b)=>(a.slot||'').localeCompare(b.slot||'')).map(it=>s.find(x=>x.includes(`unsched('${it.id}'`))).join('')||'<p class="empty">Nothing scheduled.</p>');
 setH('#posted',p.slice(0,10).join('')||'<p class="empty">None yet.</p>');}
refresh();setInterval(loadHub,60000);setInterval(()=>{if(!document.activeElement||document.activeElement.tagName!=='TEXTAREA')refresh()},8000);
</script></body></html>"""


class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def send(self, code, body=b"", ctype="text/plain; charset=utf-8"):
        if isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        u = urlparse(self.path)
        if u.path == "/":
            return self.send(200, PAGE, "text/html; charset=utf-8")
        if u.path == "/hub-reels":
            d = hub_get()
            return self.send(200, json.dumps({"ok": True, "reels": d["reels"]} if d else {"ok": False}), "application/json")
        if u.path == "/list":
            with lock:
                items = load()
            return self.send(200, json.dumps(items), "application/json")
        m = re.fullmatch(r"/video/([0-9a-f]{12}\.mp4)", u.path)
        if m:
            return self.video(os.path.join(READY, m.group(1)), "dl=1" in u.query)
        self.send(404, "not found")

    def video(self, path, download):
        if not os.path.exists(path):
            return self.send(404, "not found")
        size = os.path.getsize(path)
        start, end = 0, size - 1
        rng = self.headers.get("Range")
        m = re.match(r"bytes=(\d*)-(\d*)", rng or "")
        if m:
            if m.group(1):
                start = int(m.group(1))
                if m.group(2):
                    end = min(int(m.group(2)), size - 1)
            elif m.group(2):
                start = max(0, size - int(m.group(2)))
            self.send_response(206)
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        else:
            self.send_response(200)
        self.send_header("Content-Type", "video/mp4")
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "no-store")  # a re-edit keeps the same file name: never play an old copy
        self.send_header("Content-Length", str(end - start + 1))
        if download:
            self.send_header("Content-Disposition", 'attachment; filename="Reel.mp4"')
        self.end_headers()
        with open(path, "rb") as f:
            f.seek(start)
            left = end - start + 1
            try:
                while left > 0:
                    b = f.read(min(CHUNK, left))
                    if not b:
                        break
                    self.wfile.write(b)
                    left -= len(b)
            except (ConnectionError, OSError):
                pass

    def do_POST(self):
        u = urlparse(self.path)
        n = int(self.headers.get("Content-Length") or 0)
        if u.path == "/upload":
            name = os.path.basename(unquote(self.headers.get("X-Name") or "video.mov"))
            ext = os.path.splitext(name)[1].lower() or ".mov"
            if ext not in (".mov", ".mp4", ".m4v", ".hevc"):
                ext = ".mov"
            rid = uuid.uuid4().hex[:12]
            ref = "ref=1" in u.query
            stem = re.sub(r"[^\w.-]", "_", os.path.splitext(name)[0]) + "-" + rid if ref else rid
            raw = os.path.join(REFS if ref else INBOX, stem + ext)
            part = raw + ".part"
            left = n
            try:
                with open(part, "wb") as f:
                    while left > 0:
                        b = self.rfile.read(min(CHUNK, left))
                        if not b:
                            break
                        f.write(b)
                        left -= len(b)
            except (ConnectionError, OSError):
                pass
            if left > 0 or n == 0:
                try:
                    os.remove(part)
                except OSError:
                    pass
                return self.send(400, "upload incomplete")
            os.replace(part, raw)
            if ref:
                return self.send(200, rid)
            with lock:
                items = load()
                items.append({"id": rid, "name": name, "raw": raw, "status": "queued", "uploaded": time.time()})
                save(items)
            wake.set()
            return self.send(200, rid)
        body = self.rfile.read(n) if n else b""
        m = re.fullmatch(r"/(posted|unpost|retry|caption|match|approve|unschedule|retrypost|delete)/([0-9a-f]{12})", u.path)
        if not m:
            return self.send(404, "not found")
        a, rid = m.groups()
        with lock:
            cur = next((it for it in load() if it["id"] == rid), {})
        if a == "approve" and cur.get("status") == "ready":
            update(rid, status="approved", approved=time.time())
            pwake.set()
        elif a == "retrypost" and cur.get("status") == "post_failed":
            update(rid, status="approved", post_error="")
            pwake.set()
        elif a == "unschedule" and cur.get("status") in ("scheduled", "post_failed"):
            left = gp.unschedule(cur)
            if left:
                update(rid, ghl=left, post_error="Some posts had already gone out: " + ", ".join(left))
            else:  # back to ready; keeps the uploaded media so a re-approve doesn't upload again
                update(rid, status="ready", slot="", ghl={}, post_error="")
                hub_stage(cur.get("match"), "edited")
        elif a == "posted":
            update(rid, status="posted", posted=time.time())
            hub_stage(cur.get("match"), "posted")
        elif a == "unpost":
            update(rid, status="ready")
            hub_stage(cur.get("match"), "edited")
        elif a == "match":  # Olly picked the hook (or "" = use what he said): re-edit with it
            title = body.decode("utf-8", "replace").strip()
            hub = hub_get()
            r = next((x for x in (hub or {}).get("reels", []) if x["title"] == title), None)
            if cur.get("match") and cur.get("match") != title:
                hub_stage(cur["match"], "")
            update(rid, status="queued", picked=True, match=title if r else "", offer=(r or {}).get("offer", "video"), date=(r or {}).get("date", ""), error="")
            wake.set()
        elif a == "delete" and cur.get("status") in ("ready", "failed"):
            with lock:
                items = [it for it in load() if it["id"] != rid]
                save(items)
            for f in (cur.get("raw"), os.path.join(READY, cur.get("file") or "")):
                for g in (f, (f or "") + ".cover.jpg", (f or "") + ".plan.json"):
                    try:
                        if g and os.path.isfile(g):
                            os.remove(g)
                    except OSError:
                        pass
        elif a == "retry":
            update(rid, status="queued", error="")
            wake.set()
        elif a == "caption":
            txt, pl = body.decode("utf-8", "replace"), (re.search(r"p=(\w+)", u.query or "") or [None, "instagram"])[1]
            caps = dict(cur.get("captions") or {})
            if caps and pl in PLATS:
                caps[pl] = txt
            update(rid, captions=caps, **({"caption": txt} if pl == "instagram" or not caps else {}))
        self.send(200, "ok")


# ── GHL poster (2026-11-04): approved Reels -> next free slot -> one scheduled post per platform ─────────────
def taken_slots(items, skip_id=None):
    return {it["slot"] for it in items if it.get("slot") and it["id"] != skip_id and it["status"] in ("scheduling", "scheduled", "posted", "post_failed")}


def poster():
    last_check = 0
    while True:
        with lock:
            items = load()
            job = next((it for it in items if it["status"] == "approved"), None)
            if job:
                job["status"] = "scheduling"
                save(items)
        if job:
            try:
                hub = hub_get(fresh=True) or {}
                counts = {}
                for r in hub.get("reels", []):
                    counts[r["date"]] = counts.get(r["date"], 0) + 1
                out = gp.schedule(job, os.path.join(READY, job["file"]), taken_slots(items, job["id"]), hub.get("targets"), counts)
                update(job["id"], status="scheduled", post_error="", **out)
                hub_stage(job.get("match"), "scheduled", out.get("slot"))
            except Exception as e:
                update(job["id"], status="post_failed", post_error=str(e)[-500:], **getattr(e, "partial", {}))
            continue
        if time.time() - last_check > 600:  # every 10 min: did the scheduled ones go out?
            last_check = time.time()
            now = gp.datetime.now(gp.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
            with lock:
                due = [it for it in load() if it["status"] == "scheduled" and it.get("slot", "9") <= now]
            for it in due:
                res = gp.check(it)
                sts = [s for s, _ in res.values()]
                if any(s in ("scheduled", "in_progress", "unknown", "") for s in sts):
                    continue
                ok = [k for k, (s, _) in res.items() if s == "published"]
                update(it["id"], status="posted" if ok else "post_failed", posted=time.time(),
                       results={k: s for k, (s, _) in res.items()}, links=it.get("_links", {}),
                       post_error="; ".join(f"{k}: {e or s}" for k, (s, e) in res.items() if s != "published"))
                if ok:
                    hub_stage(it.get("match"), "posted")
        pwake.wait(60)
        pwake.clear()


def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("192.168.0.1", 1))
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


class Server(ThreadingHTTPServer):
    # On Windows the default reuse flag lets several copies share the port and answer at random.
    # Exclusive bind: a second copy fails at once instead.
    allow_reuse_address = False

    def server_bind(self):
        if hasattr(socket, "SO_EXCLUSIVEADDRUSE"):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


if __name__ == "__main__":
    if sys.stderr is None:  # started hidden (pythonw): keep messages in a log file instead
        sys.stdout = sys.stderr = open(os.path.join(READY, "server.log"), "a", encoding="utf-8", buffering=1)
    try:
        srv = Server(("0.0.0.0", PORT), H)
    except OSError:
        sys.exit("\n  Reel Upload is already running in another window. Use that one (or close it first).\n")
    with lock:
        items = load()
        for it in items:
            if it["status"] == "editing":
                it["status"] = "queued"
            if it["status"] == "scheduling":
                it["status"] = "approved"
        save(items)
    threading.Thread(target=worker, daemon=True).start()
    threading.Thread(target=poster, daemon=True).start()
    print(f"\n  Reel Upload is running.\n  On your phone (same Wi-Fi) open:  http://{lan_ip()}:{PORT}\n  Keep this window open. Close it to stop.\n")
    srv.serve_forever()
