# Builds the GHL AI workflow-builder prompt for "Weekly email (dormant)" from Olly's final saved emails
# (weekly-email-final/w01..w12.json, exported from the copy page's db on 2026-11-05). Output: weekly-email-builder-prompt.txt
import json, os, re, html
D = os.path.dirname(os.path.abspath(__file__))
def paras(h):
    h = re.sub(r'<a [^>]*href="([^"]+)"[^>]*>(.*?)</a>', lambda m: m.group(2) + " (link: " + html.unescape(m.group(1)) + ")", h, flags=re.S)
    out = []
    for p in re.findall(r"<p[^>]*>(.*?)</p>", h, flags=re.S):
        t = html.unescape(re.sub(r"<[^>]+>", "", p.replace("<br>", "\n"))).replace("\xa0", " ").strip()
        if t: out.append(t)
    return out
emails = []
for n in range(1, 13):
    d = json.load(open(os.path.join(D, "weekly-email-final", "w%02d.json" % n), encoding="utf-8"))
    emails.append((d["subject"].strip(), paras(d["html"])))
steps = ['1. Wait: time delay of 1 minute with an advanced window so it only resumes on Sunday between 09:00 and 10:00.']
k = 2
for i, (subj, _) in enumerate(emails, 1):
    steps.append(f'{k}. Send Email, step name "Weekly {i:02d} · {subj}", subject "{subj}", using the email template "Daily Email Template" with its body replaced by EMAIL {i} below.'); k += 1
    steps.append(f"{k}. Wait 7 days."); k += 1
steps.append(f'{k}. If/Else, branch name "Came back": contact has tag "engaged recently" -> end. None branch -> Remove Tag "daily email list".')
prompt = ('Create a workflow called "Weekly email (dormant)".\n\n'
  'Trigger: Contact Tag Removed, tag "engaged recently".\n'
  'Trigger filters: contact has tag "daily email list" AND contact does not have tag "joined heart attractor program".\n'
  'Allow re-entry: ON.\n\n'
  'Goal event: Contact Tag Added "engaged recently". When the goal is reached, the contact exits the workflow.\n\n'
  'Actions in this order:\n' + "\n".join(steps) + "\n\n"
  'Email rules: use the saved template "Daily Email Template" for every email so they look like my daily emails, and replace its placeholder body with the email text. '
  'Keep my wording exactly. Every line below is its own paragraph with a blank line between paragraphs. {{contact.first_name}} is the first name merge field. '
  'Where a line says (link: URL), link the word "here" in that line to that URL. Do not add preview text.\n\n'
  + "\n\n".join(f"===== EMAIL {i} | subject: {subj} =====\n" + "\n\n".join(ps) for i, (subj, ps) in enumerate(emails, 1)))
open(os.path.join(D, "weekly-email-builder-prompt.txt"), "w", encoding="utf-8").write(prompt)
print(len(prompt), "characters")
