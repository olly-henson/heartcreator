"""Reel upload page: phone -> laptop over home Wi-Fi -> auto-edit -> Save + Copy caption.

Start:  py reels\\upload_server.py      (or double-click reels\\Start Reel Upload.bat)
Then on the phone (same Wi-Fi) open the address it prints, e.g. http://192.168.0.12:8800

- Raw uploads land in reels\\inbox\\, finished Reels in reels\\ready\\ (both kept out of git).
- One video is edited at a time with reel_editor.py (same look, trim start/end only).
- Standard library only. State lives in reels\\ready\\reels.json, so a restart keeps the list
  and re-queues anything that was mid-edit.
"""
import json, os, re, socket, subprocess, sys, threading, time, uuid
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, unquote

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
                py = sys.executable.replace("pythonw.exe", "python.exe")
                r = subprocess.run([py, EDITOR, job["raw"], out], stdout=lf, stderr=subprocess.STDOUT,
                                   creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
            if r.returncode != 0 or not os.path.exists(out):
                raise RuntimeError(open(log, encoding="utf-8", errors="replace").read()[-400:])
            plan = out + ".plan.json"
            hook = ""
            try:
                hook = json.load(open(plan, encoding="utf-8"))["hook"][0]
            except Exception:
                pass
            update(job["id"], status="ready", file=job["id"] + ".mp4", hook=hook,
                   caption=caption_for(plan, os.path.splitext(job["raw"])[0] + ".words.json"), finished=time.time())
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
</style></head><body>
<h1>Reel Upload</h1><p class="sub">Pick your raw videos. The laptop edits them one at a time; finished Reels show up below.</p>
<label class="drop">Upload raw videos<small>Choose one or several from Photos</small><input id="f" type="file" accept="video/*" multiple></label>
<div id="msg"></div>
<label class="drop ghost" style="margin-top:10px;padding:14px;font-size:15px">Upload a reference Reel<small style="color:var(--mut)">Your best posted Reels, so the style stays the same. Not edited.</small><input id="rf" type="file" accept="video/*" multiple></label>
<div id="ups"></div>
<h2>Ready to post</h2><div id="ready"></div>
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
function next(){if(busy||!queue.length)return;busy=true;const f=queue.shift();
 const d=document.createElement('div');d.className='card up';d.innerHTML=`<div class="meta">${esc(f.name)} · ${(f.size/1048576).toFixed(0)} MB</div><div class="bar"><i></i></div>`;$('#ups').prepend(d);
 const x=new XMLHttpRequest();x.open('POST',f.ref?'/upload?ref=1':'/upload');x.setRequestHeader('X-Name',encodeURIComponent(f.name));
 x.upload.onprogress=p=>{if(p.lengthComputable)d.querySelector('i').style.width=(100*p.loaded/p.total)+'%'};
 x.onload=()=>{d.querySelector('.meta').textContent+=x.status==200?(f.ref?' · saved as a reference':' · uploaded, queued for editing'):' · upload failed';if(!queue.length)msg(x.status==200?'Sent. The laptop is editing it now (see below).':'Upload failed. Try again.');if(x.status==200)setTimeout(()=>d.remove(),4000);busy=false;refresh();next();};
 x.onerror=()=>{d.querySelector('.meta').textContent+=' · upload failed (still on the same Wi-Fi?)';busy=false;next();};
 x.send(f);}
async function act(id,a){await fetch('/'+a+'/'+id,{method:'POST'});refresh();}
async function copyCap(id,btn){const t=document.getElementById('cap-'+id).value;
 try{await navigator.clipboard.writeText(t)}catch(e){const ta=document.getElementById('cap-'+id);ta.select();document.execCommand('copy')}
 btn.textContent='Copied ✓';setTimeout(()=>btn.textContent='Copy caption',1500);
 fetch('/caption/'+id,{method:'POST',body:t});}
async function saveVid(id,file,btn){
 try{const r=await fetch('/video/'+file);const b=await r.blob();const fl=new File([b],file,{type:'video/mp4'});
  if(navigator.canShare&&navigator.canShare({files:[fl]})){await navigator.share({files:[fl]});return;}}catch(e){if(e.name==='AbortError')return;}
 location.href='/video/'+file+'?dl=1';}
let editing=new Set();
async function refresh(){let items;try{items=await (await fetch('/list')).json()}catch(e){return}
 const r=[],w=[],p=[];
 for(const it of items.slice().reverse()){
  if(it.status==='ready'){if(editing.has(it.id)&&document.getElementById('card-'+it.id)){r.push(document.getElementById('card-'+it.id).outerHTML);continue}
   r.push(`<div class="card" id="card-${it.id}"><div class="hook">${esc(it.hook||it.name)}</div><div class="meta">${esc(it.name)}</div>
   <video src="/video/${it.file}" controls playsinline preload="metadata"></video>
   <textarea id="cap-${it.id}" onfocus="editing.add('${it.id}')" onblur="editing.delete('${it.id}');fetch('/caption/${it.id}',{method:'POST',body:this.value})">${esc(it.caption)}</textarea>
   <div class="row"><button onclick="saveVid('${it.id}','${it.file}',this)">Save to Photos</button><button onclick="copyCap('${it.id}',this)">Copy caption</button></div>
   <div class="row"><button class="ghost" onclick="act('${it.id}','posted')">Mark posted</button></div>
   <div class="tip">Save opens the share sheet: tap <b>Save Video</b>. If it opens the video instead, tap the share icon, then Save Video.</div></div>`);}
  else if(it.status==='posted')p.push(`<div class="card"><div class="hook">${esc(it.hook||it.name)}</div><div class="row"><button class="ghost" onclick="act('${it.id}','unpost')">Move back to ready</button></div></div>`);
  else{const lab={queued:'Waiting',editing:'Editing now',failed:'Failed'}[it.status];
   const mins=it.status==='editing'?` · started ${Math.round((Date.now()/1000-it.started)/60)} min ago (about 7 min for a 3-min Reel)`:'';
   w.push(`<div class="card"><span class="st ${it.status}">${lab}</span> <span class="meta">${esc(it.name)}${mins}</span>${it.status==='failed'?`<div class="err">${esc(it.error)}</div><div class="row"><button class="ghost" onclick="act('${it.id}','retry')">Try again</button></div>`:''}</div>`);}
 }
 $('#ready').innerHTML=r.join('')||'<p class="empty">Nothing ready yet.</p>';
 $('#work').innerHTML=w.join('')||'<p class="empty">Nothing in the queue.</p>';
 $('#posted').innerHTML=p.slice(0,10).join('')||'<p class="empty">None yet.</p>';}
refresh();setInterval(()=>{if(!document.activeElement||document.activeElement.tagName!=='TEXTAREA')refresh()},8000);
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
        m = re.fullmatch(r"/(posted|unpost|retry|caption)/([0-9a-f]{12})", u.path)
        if not m:
            return self.send(404, "not found")
        a, rid = m.groups()
        if a == "posted":
            update(rid, status="posted", posted=time.time())
        elif a == "unpost":
            update(rid, status="ready")
        elif a == "retry":
            update(rid, status="queued", error="")
            wake.set()
        elif a == "caption":
            update(rid, caption=body.decode("utf-8", "replace"))
        self.send(200, "ok")


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
        save(items)
    threading.Thread(target=worker, daemon=True).start()
    print(f"\n  Reel Upload is running.\n  On your phone (same Wi-Fi) open:  http://{lan_ip()}:{PORT}\n  Keep this window open. Close it to stop.\n")
    srv.serve_forever()
