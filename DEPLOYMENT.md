# Deployment Guide

This blog uses a **two-repository architecture**:

| Repo | Purpose | What happens on push? |
|------|---------|----------------------|
| **Code repo** (e.g., `blog`) | Next.js app, components, styles | Vercel auto-redeploys the site |
| **Content repo** (e.g., `blog-content`) | Posts (.md files), favorites | Blog fetches latest content via GitHub API — no redeploy needed |

---

## Step 1: Set Up GitHub Repositories

### 1a. Create the Code Repository

```bash
# From the project root:
git init
git remote add origin https://github.com/YOUR_USERNAME/blog.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 1b. Create the Content Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `blog-content` (public or private)
3. Initialize with this structure:

```
blog-content/
├── posts/
│   └── hello-world.md
├── favorites.md
└── README.md
```

See [CONTENT_GUIDE.md](CONTENT_GUIDE.md) for the post and favorites format.

> [!TIP]
> Copy the contents of the `content/` directory from this repo as a starting point.

---

## Step 2: Configure `site.config.ts`

Update the GitHub settings to point to your content repo:

```typescript
github: {
  contentOwner: "YOUR_GITHUB_USERNAME",
  contentRepo: "blog-content",
  contentBranch: "main",
  postsPath: "posts",
  favoritesPath: "favorites.md",
}
```

Also update `author`, `title`, `email`, and `social` links.

---

## Step 3: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"** → select your **code repo** (e.g., `blog`)
3. Vercel auto-detects Next.js — leave defaults as-is
4. **Add environment variables** before deploying:

| Variable | Required? | Value | Description |
|----------|-----------|-------|-------------|
| `GITHUB_TOKEN` | Yes (if content repo is private) | `ghp_xxxxxxxxxxxx` | GitHub Personal Access Token |
| `GEMINI_API_KEY` | Optional | `AIzaSyXXXXXXXX` | For the AI translation feature |

5. Click **Deploy** — your blog goes live at `your-project.vercel.app`

### How to Get a GitHub Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Name: `blog-reader`
4. Scopes: `repo` (private repos) or `public_repo` (public repos)
5. Copy the token

### How to Get a Gemini API Key

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click **"Create API key"**
3. Copy the key

---

## Step 4: Custom Domain (Optional)

1. In Vercel → your project → **Settings → Domains**
2. Add your domain (e.g., `blog.yourdomain.com`)
3. Update DNS records as instructed

---

## How CI/CD Works

### Code Changes (triggers redeploy)

```
Push to code repo → Vercel webhook → Build & deploy (~1-2 min) → Live
```

Vercel automatically sets up a GitHub webhook when you import the repo. Every push to `main` triggers a new deployment. Preview deploys are created for pull requests.

### Content Changes (no redeploy needed)

```
Push to content repo → Blog fetches new content via GitHub API → Live within 5 min
```

Content is fetched at request time via the GitHub API with a 5-minute ISR cache. No build or deploy is needed for new posts.

---

## Post-Deployment

### Adding a New Post

1. Create `posts/my-new-post.md` in the content repo (see [CONTENT_GUIDE.md](CONTENT_GUIDE.md) for format)
2. `git push` to main
3. Post appears on the blog within ~5 minutes

### Updating Environment Variables

1. Vercel → your project → **Settings → Environment Variables**
2. Add/update variables
3. **Redeploy** for changes to take effect

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Posts not showing | Check `GITHUB_TOKEN` has correct permissions. Check `contentOwner`/`contentRepo` in site.config.ts |
| 403 / rate limit errors | Add a `GITHUB_TOKEN` (unauthenticated = 60 req/hr, authenticated = 5000 req/hr) |
| Translation not working | Check `GEMINI_API_KEY` is set and valid |
| Stale content | Content cache is 5 min. Wait or hard-refresh. |
| Build fails on Vercel | Check build logs. Run `npm run build` locally first to reproduce. |
