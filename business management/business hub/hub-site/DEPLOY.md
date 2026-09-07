# Deploying the Business Hub to hub.ollyhenson.com

The app is now a normal website, not a Claude Artifact:

```
hub-site/
  public/
    index.html            the whole app (was community-tracker.html)
    manifest.webmanifest   PWA / Add to Home Screen
  functions/
    api/state.js          GET + PUT the shared data record (Cloudflare KV)
  wrangler.toml           project + KV binding config
```

Data no longer lives in the page. It lives in a Cloudflare **KV** store. Every
device that opens the site (behind Cloudflare Access) reads and writes the same
record via `/api/state`. The in-page **Save** button is still the only thing
that syncs — no autosave. `localStorage` is kept as an offline cache so the
page never loads blank on the phone.

---

## One-time setup (you do this in the Cloudflare dashboard + CLI)

### 1. Create the KV namespace

```
cd "C:/Users/Olly/AI OS/heartattractor/business management/business hub/hub-site"
npx wrangler kv namespace create hub-state
```

Copy the `id` it prints into `wrangler.toml` (replace `PASTE_KV_NAMESPACE_ID_HERE`).

### 2. Create the Pages project + deploy

```
npx wrangler pages deploy public --project-name hub-ollyhenson
```

First run will ask you to log in (`npx wrangler login` — opens the browser).
This uploads `public/` and the `functions/`, and gives you a
`hub-ollyhenson.pages.dev` URL. Open it — the app should load with your
current data (seeded from the copy embedded in `index.html`). Click **Save**
once to write that seed into KV.

### 3. Bind the KV namespace to the Pages project

Dashboard → **Workers & Pages** → **hub-ollyhenson** → **Settings** →
**Bindings** → **Add** → **KV namespace**:

- Variable name: `HUB_KV`
- KV namespace: `hub-state`

Add it for **Production** (and Preview if you want). Redeploy after adding:
`npx wrangler pages deploy public --project-name hub-ollyhenson`

Check it worked: visit `https://hub-ollyhenson.pages.dev/api/state` — you should
see JSON like `{"rev":1,...}`. If it says `HUB_KV binding missing`, the binding
didn't take.

### 4. Custom domain

Dashboard → **hub-ollyhenson** → **Custom domains** → **Set up a domain** →
`hub.ollyhenson.com`. Cloudflare adds the DNS record automatically because
ollyhenson.com is already on your Cloudflare account. Wait for it to go active.

### 5. Cloudflare Access (the "log in once" gate)

Dashboard → **Zero Trust** → **Access** → **Applications** → **Add an
application** → **Self-hosted**:

- Application name: `Business Hub`
- Session duration: **1 month** (this is what stops the constant re-login)
- Application domain: `hub.ollyhenson.com`

Then add a **policy**:

- Policy name: `Only me`
- Action: **Allow**
- Include → **Emails** → `olly@ollyhenson.com`

Save. If you want it on your phone with no PIN re-entry for a month, that
session duration is the setting that matters. You can add more emails later
if anyone else needs in.

> Zero Trust is free for up to 50 users. If it asks you to pick a team
> domain on first use, any name is fine — you never see it again here.

### 6. Add to Home Screen

On the phone, open `https://hub.ollyhenson.com` in Safari, do the Access
email PIN once, then Share → **Add to Home Screen**. From now on it opens
full-screen and stays logged in for the session duration you set.

---

## Updating the app later

Edit `public/index.html`, then:

```
npx wrangler pages deploy public --project-name hub-ollyhenson
```

No more "read the live artifact first / publish-conflict" dance — the code and
the data are fully separate now. The data in KV is never touched by a deploy.

## Local testing

```
npx wrangler pages dev public --kv HUB_KV
```

Serves the whole thing at `http://127.0.0.1:8788` with a local in-memory KV
(separate from production data).
