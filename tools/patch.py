"""Safe find-and-replace for big HTML/JS files (Hub, content generator, funnel pages).

Usage:  python patch.py FILE EDITS.json
EDITS.json = [["old text", "new text"], ...]  (each old text must appear exactly once)

- Works on CRLF or LF files (matches on LF, writes back the file's own line endings).
- Nothing is written unless every edit matches exactly once (all or nothing).
- Encodes before writing, so a bad character can never leave the file half-written.
- Keeps FILE.bak until the write succeeds.
"""
import sys, json, shutil, os

def main():
    path, edits_path = sys.argv[1], sys.argv[2]
    edits = json.load(open(edits_path, encoding="utf-8"))
    raw = open(path, encoding="utf-8", newline="").read()
    crlf = "\r\n" in raw
    s = raw.replace("\r\n", "\n")
    for i, (old, new) in enumerate(edits):
        old = old.replace("\r\n", "\n"); new = new.replace("\r\n", "\n")
        n = s.count(old)
        if n != 1:
            sys.exit(f"edit {i}: found {n} times (need 1): {old[:80]!r}")
        s = s.replace(old, new)
    if crlf:
        s = s.replace("\n", "\r\n")
    data = s.encode("utf-8")
    shutil.copyfile(path, path + ".bak")
    with open(path, "wb") as f:
        f.write(data)
    os.remove(path + ".bak")
    print(f"ok: {len(edits)} edit(s) to {os.path.basename(path)}")

if __name__ == "__main__":
    main()
