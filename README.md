# Karan Sharma · Pixel Arcade Portfolio

A portfolio website with a playable pixel arcade, six display modes (Dark, Light, Craft, Terminal, Neon, Sunset), an avatar maker and a password-protected **master panel** where you edit everything on the site without touching code.

Built as plain HTML, CSS and JavaScript plus a few small serverless functions. No framework and no build step. Deploys to Vercel in a few minutes.

---

## What is in the box

**Pages and features**

- Hero with your pixel avatar beside your name, a player card with stat bars, a skills marquee
- About, Skills ("Loadout"), Projects, Contact
- **Player lab**: visitors build their own avatar and name, saved in their browser
- **Six display modes** with a picker in the header: Dark, Light, Craft (Minecraft-style blocks and dirt), Terminal (green CRT), Neon, Sunset
- **Minecraft touches**: a diamond-sword slash on every click, a creeper, pig, chicken (it lays eggs) and a bow-shooting skeleton in the footer, a chicken, pig and skeleton on your name (click mobs to hit them), spiders that drop from webs, cobwebs in the corners, flickering torches, rising XP orbs, sections that pop in as you scroll, Minecraft-style "Achievement made!" pop-ups and a "Mobs slain" counter. In Craft mode your cursor becomes a diamond sword. Turn all of this off in the Master panel under Site → Effects
- Animations: pixel-dissolve when switching modes, block-break bursts when you click, pixel cursor trail, scroll XP bar, floating pixels (clouds in Craft), card tilt, stepped hover effects, an interactive footer with a moving network and click-and-drag drawing
- **Pixel buddy** beside the intro: idles, blinks, walks, jumps, and waves with a speech bubble ("Hi! Welcome!") when you hover, focus or tap it
- **Animated name**: letters drop in, hop when hovered and ripple in a wave every few seconds
- Easter egg: type the Konami code (up up down down left right left right B A)

**Arcade (6 games)**

| Game | Controls |
| --- | --- |
| Snake | Arrow keys or WASD, swipe, on-screen pad |
| Chess vs bot | Click a piece, then a square. Level 1 about 800 Elo, Level 2 about 1600, Level 3 about 2500 (approximate). Runs real Stockfish in the browser |
| Tic Tac Toe | Click. Easy, Medium, Hard (unbeatable) or two players |
| **Dino Rush** | Space or up arrow to jump, down arrow to duck, tap on phones |
| Memory Match | Click cards |
| Dodge | Arrow keys or A and D, drag on phones |

**Global leaderboard (Hall of fame)**

After a round of Snake, Dino Rush, Dodge or Memory, visitors can submit their score with their Player lab avatar and a name. The top 10 for each game is public. The server (`api/score.js`) checks every submission: it needs a signed run token issued when the round started, the round must have lasted long enough for that score, each token works once, scores are capped per game, and names and avatars are cleaned. Scores come from the visitor's browser, so a determined cheater cannot be fully stopped. Remove anything you do not want in the Master panel's **Scores** tab. Needs `SESSION_SECRET` and the Blob store (the same ones the Master login uses).

**Master panel (admin)**

Log in from the **Master login** link in the footer (or open `/#admin`). After logging in you can edit:

- Name, tagline, about text, player card, facts, stat bars, email
- **Social links**: add, remove and reorder GitHub, LinkedIn, Instagram, X, YouTube, Discord, LeetCode, Codeforces or any custom link. They show in Contact and in the footer
- Skills: add, remove and reorder groups and skills
- Projects: add, remove and reorder, each with description, tags, link and badge
- Your avatar
- Default display mode, which sections are visible, which games are in the arcade, effects on or off

Press **Publish** and everyone sees the change within about a minute.

---

## Folder map

```
karan-portfolio/
├── public/                  The website (served as-is)
│   ├── index.html           The whole page: HTML, CSS and JavaScript
│   ├── site.json            Starting content, used until you publish edits
│   ├── stockfish.js         Chess engine (runs in a Web Worker)
│   ├── favicon.svg, robots.txt
│   └── licenses/            Licenses for bundled components
├── api/                     Serverless functions (Vercel runs these)
│   ├── login.js             Checks the password, sets a signed cookie
│   ├── logout.js, session.js
│   ├── save.js              Saves edited content (admin only)
│   ├── score.js             Leaderboard: issue run token, validate and store a score
│   ├── scores.js            Leaderboard: public top 10 per game
│   ├── scoreadmin.js        Leaderboard: remove scores (admin only)
│   ├── site.js              Returns saved content to visitors
│   └── _lib/                Shared helpers: auth, storage, http
├── scripts/
│   ├── gen-secrets.js       Makes a strong password and secret
│   ├── page-source.html     Editable source of index.html (optional)
│   └── build-page.js        Rebuilds public/index.html from the source
├── dev-server.js            Run the site on your computer
├── vercel.json              Vercel settings and security headers
├── package.json
├── .env.example             Names of the secret settings
├── .gitignore
├── GITHUB_SETUP.md          Step-by-step GitHub guide
├── LICENSE, THIRD_PARTY_NOTICES.md
└── README.md
```

---

## Step 1. Run it on your computer (optional but recommended)

You need [Node.js](https://nodejs.org/) 18 or newer.

```bash
cd karan-portfolio
npm install
npm run secrets          # prints ADMIN_PASSWORD and SESSION_SECRET
```

Create a file named `.env` in the project folder and paste the two printed lines into it:

```
ADMIN_PASSWORD=your-generated-password
SESSION_SECRET=your-generated-secret
```

Start the site:

```bash
npm run dev
```

Open <http://localhost:3000>. Scroll to the footer, click **Master login** and sign in. Locally, your edits are saved to `.data/site.json` (this folder is git-ignored).

---

## Step 2. Put the code on GitHub

> A fuller walkthrough with sign-in help and fixes is in [GITHUB_SETUP.md](GITHUB_SETUP.md).

1. Create a free account at <https://github.com> and install [Git](https://git-scm.com/downloads).
2. On GitHub click **New repository**. Give it a name such as `portfolio`. Choose Public or Private. **Do not** tick "Add a README" because this project already has one. Click **Create repository**.
3. In your project folder run these commands, replacing the address with the one GitHub shows you:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/portfolio.git
git push -u origin main
```

4. If Git asks you to sign in, use a browser sign-in or a [personal access token](https://github.com/settings/tokens) as the password. The [GitHub CLI](https://cli.github.com/) makes this easier: run `gh auth login`, then `gh repo create portfolio --private --source=. --push` instead of steps 2 and 3.

**Check before pushing:** run `git status` and confirm `.env` is **not** listed. It is already in `.gitignore`, and it must never be uploaded because it holds your password.

**No Git installed?** On the repository page click **Add file → Upload files** and drag in the folder contents. Do not upload `.env` or `node_modules`.

---

## Step 3. Deploy on Vercel

1. Go to <https://vercel.com> and sign up with your GitHub account.
2. Click **Add New… → Project**, find your repository and click **Import**.
3. Leave **Framework Preset** as **Other**. Leave Build and Output settings alone, because `vercel.json` already sets them (output folder `public`).
4. Open **Environment Variables** and add two variables (use the values from `npm run secrets`):
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
5. Click **Deploy**. In about a minute you get a live address like `https://your-project.vercel.app`.

---

## Step 4. Create storage so your edits are saved

Vercel's servers cannot write to disk, so edits are stored in a free **Vercel Blob** store.

1. In your Vercel project open the **Storage** tab.
2. Create a **Blob** store. When asked for access, choose **Private** (recommended).
3. Connect the store to your project for all environments. Vercel adds `BLOB_STORE_ID` (newer stores) or `BLOB_READ_WRITE_TOKEN` (older ones) automatically.
4. Go to **Deployments**, open the **⋯** menu on the latest deployment and click **Redeploy** so the new variable is picked up.

If you chose a **Public** store instead, also add the environment variable `BLOB_ACCESS` with the value `public` and redeploy.

> Vercel changes its dashboard wording now and then. If a button has moved, look for **Storage → Blob** in the project, or see <https://vercel.com/docs/vercel-blob>.

---

## Step 5. Log in and edit

1. Open your site and scroll to the footer. Click **Master login** (or visit `https://your-site/#admin`).
2. Enter the password you set in `ADMIN_PASSWORD`.
3. The **Master panel** opens. Use the tabs: Profile, Skills, Projects, Avatar, Site.
4. Press **Publish**. Visitors see your changes within about a minute (a short CDN cache).

The panel also has **Copy JSON**, **Import** and **Reset** for backups. Log out with **Log out** in the panel. You stay logged in for 8 hours.

---

## Updating the site later

Any change you push to the `main` branch deploys automatically:

```bash
git add .
git commit -m "Describe the change"
git push
```

Content edited in the Master panel is stored separately (in Blob), so a new deployment does not erase it. The starting content in `public/site.json` is only used until the first Publish.

## Change the admin password

Vercel project → **Settings → Environment Variables** → edit `ADMIN_PASSWORD` → **Redeploy**. Everyone who was logged in is signed out. Changing `SESSION_SECRET` also signs everyone out.

## Custom domain

Vercel project → **Settings → Domains** → add your domain and follow the DNS steps shown.

## Editing the design or games

- Change colours, fonts and layout in `public/index.html` (the CSS is at the top of the file; each display mode is a `[data-mode="…"]` block).
- Games are in the JavaScript section of the same file, each under a comment such as `/* ---------- DINO RUSH ---------- */`.
- `scripts/page-source.html` is the same page before the chess library is inlined. If you prefer editing that, run `npm run build:page` to regenerate `public/index.html` (it also rewrites `public/site.json` from the defaults inside the source).

---

## How the master login works

- The password lives only in the `ADMIN_PASSWORD` environment variable. It is never in the code or in the browser.
- Logging in sets a signed, `HttpOnly`, `SameSite=Strict` cookie (and `Secure` on https) valid for 8 hours. Changing the password invalidates old cookies.
- Saving requires that cookie plus a custom request header, which blocks cross-site requests.
- A wrong password waits about a second before answering.
- Saved content is limited to 100 KB and is validated on the server. The page renders all saved text as plain text and only allows `http(s)` links.
- Serverless functions are stateless, so there is no lockout counter. Use a long random password (the `npm run secrets` one is fine) and keep it private.

---

## Troubleshooting

| Message or problem | Fix |
| --- | --- |
| "The pattern api/*.js ... doesn't match any Serverless Functions" | Fixed in this version (the `functions` block was removed from `vercel.json`). Also check that `api/` and `vercel.json` sit at the **root** of your GitHub repo, not inside an extra folder. If they are inside one, set **Settings → General → Root Directory** to that folder |
| "Server is not set up yet: ADMIN_PASSWORD is not set" | Add `ADMIN_PASSWORD` and `SESSION_SECRET` in Vercel and redeploy |
| "Storage is not set up" when publishing | Do Step 4: create the Blob store, connect it, redeploy |
| Publishing fails with an access or store error | Your store type does not match. For a Public store add `BLOB_ACCESS=public`, or create a Private store |
| "Wrong password" but you are sure it is right | Check for a space at the start or end when pasting. Remember that you must redeploy after changing environment variables |
| Master login link does not show | The API is not running. On Vercel check the Functions tab for errors. Locally use `npm run dev`, not a plain file server |
| Chess says "Engine: built-in" | `stockfish.js` did not load. Make sure `public/stockfish.js` is committed and the site is served over https or localhost |
| Leaderboard says "server is not running" or "offline" | The `api` folder is not deployed, or `SESSION_SECRET` is missing. See the Master login rows above |
| Edits do not appear right away | Wait up to a minute for the cache, then hard refresh |
| A visitor's saved mode ignores your default | Visitors who picked a mode keep it. They can choose **Site default** in the mode menu |

---

## Licenses

The code written for this project is MIT licensed (see `LICENSE`). The chess bot uses Stockfish (GPL v3) and chess.js (BSD). See `THIRD_PARTY_NOTICES.md` and keep the `public/licenses/` folder.
