# GitHub setup (from zero to code on GitHub)

Follow these in order. Takes about 10 minutes.

## 1. Install the tools

- **Git**: https://git-scm.com/downloads (accept the defaults). Check it works: `git --version`
- **Node.js 18+** (only needed to run the site locally): https://nodejs.org

## 2. Tell Git who you are (one time)

```bash
git config --global user.name "Karan Sharma"
git config --global user.email "your-github-email@example.com"
```

Use the same email as your GitHub account.

## 3. Make a GitHub account and an empty repository

1. Sign up at https://github.com/signup.
2. Click **+ → New repository**.
3. Name it `portfolio` (any name works).
4. Choose **Public** or **Private**. Vercel works with both.
5. Leave **Add a README**, **.gitignore** and **license** all **unticked**. The project already has them.
6. Click **Create repository** and keep that page open.

## 4. Unzip the project and check it is safe

```bash
unzip karan-portfolio.zip
cd karan-portfolio
```

Your password file `.env` must never be uploaded. It is already listed in `.gitignore`. After step 5's `git add .`, run `git status` and confirm that **`.env` is not listed**.

## 5. Push the code

Replace `YOUR-USERNAME` and `portfolio` with your own values.

```bash
git init
git add .
git status                      # .env and node_modules must NOT appear
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/portfolio.git
git push -u origin main
```

### Signing in when Git asks

GitHub no longer accepts your account password on the command line. Use one of these:

- **Easiest: GitHub CLI.** Install from https://cli.github.com, then run `gh auth login`, choose GitHub.com, HTTPS, and log in through the browser. After that, `git push` just works.
- **Personal access token.** Go to https://github.com/settings/tokens → **Generate new token (classic)** → tick **repo** → generate. Paste the token when Git asks for a password. Copy it right away, because GitHub shows it only once.

### One-command alternative (GitHub CLI)

Skip steps 3 and 5 and run this inside the project folder:

```bash
git init && git add . && git commit -m "Initial commit"
gh repo create portfolio --private --source=. --push
```

Change `--private` to `--public` if you want it public.

## 6. No Git? Upload in the browser

1. Open your new repository on GitHub and click **uploading an existing file**.
2. Drag in the **contents** of the unzipped `karan-portfolio` folder, including the `public`, `api` and `scripts` folders.
3. Do **not** upload `.env` or `node_modules`.
4. Click **Commit changes**.

## 7. Check it worked

Refresh your repository page. You should see `public/`, `api/`, `vercel.json`, `package.json` and `README.md`. There should be **no** `.env` file.

## 8. Connect to Vercel

Go back to `README.md`, Step 3 (Deploy on Vercel), and import this repository.

## Everyday workflow

Every push to `main` redeploys the site automatically:

```bash
git add .
git commit -m "Describe what you changed"
git push
```

Edits made in the Master panel are stored separately and are not lost when you push.

## If something goes wrong

| Problem | Fix |
| --- | --- |
| `git: command not found` | Install Git (step 1), then reopen your terminal |
| `Authentication failed` | Use `gh auth login` or a personal access token (step 5) |
| `remote origin already exists` | Run `git remote set-url origin https://github.com/YOUR-USERNAME/portfolio.git` |
| `failed to push some refs` | The GitHub repo is not empty. Recreate it without a README, or run `git pull origin main --allow-unrelated-histories` and push again |
| `.env` appears in `git status` | Stop. Run `git rm --cached .env`, make sure `.gitignore` contains `.env`, and commit. If it was already pushed, change `ADMIN_PASSWORD` and `SESSION_SECRET` everywhere |
