# Blog Content Repository Guide

This repository holds all the content for the blog. The code (Next.js app) lives in a separate repo.

## Directory Structure

```
blog-content/
├── posts/
│   ├── hello-world.md
│   ├── my-second-post.md
│   └── ...
├── favorites.md
└── README.md
```

## Post Format

Each post is a `.md` file in the `posts/` directory. The filename becomes the URL slug.

### Frontmatter

```markdown
---
title: "Post Title"
summary: "A brief description shown in the post list"
date: "2026-02-12"
categories: ["tech", "personal"]
image: "https://example.com/preview.jpg"
---

Your markdown content here...
```

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Post title |
| `summary` | ✅ | Short description for post cards |
| `date` | ✅ | Publication date (YYYY-MM-DD) |
| `categories` | ❌ | Array of category tags |
| `image` | ❌ | Preview image URL for the post card |

### Supported Markdown Features

- Standard Markdown (headings, bold, italic, links, images)
- GitHub Flavored Markdown (tables, task lists, strikethrough)
- Fenced code blocks with syntax highlighting
- Embedded HTML (YouTube iframes, etc.)
- Obsidian-style image sizing: `![alt|400](url)` or `![alt|400x300](url)`
- RTL content auto-detection (Persian, Arabic, Hebrew)

## Favorites Format

The `favorites.md` file uses a structured format with sections:

```markdown
---
title: "My Favorites"
---

## books

- title: "Clean Code"
  author: "Robert C. Martin"
  cover: "https://example.com/cover.jpg"
  url: "https://goodreads.com/..."

## music

- title: "Bohemian Rhapsody"
  artist: "Queen"
  cover: "https://example.com/cover.jpg"
  url: "https://spotify.com/..."

## podcasts

- title: "Lex Fridman Podcast"
  host: "Lex Fridman"
  cover: "https://example.com/cover.jpg"
  url: "https://spotify.com/..."

## youtube

- title: "3Blue1Brown"
  channel: "3Blue1Brown"
  cover: "https://example.com/cover.jpg"
  url: "https://youtube.com/..."
```

### Sections

| Section | Subtitle Field | Description |
|---------|---------------|-------------|
| `## books` | `author` | Your favorite books |
| `## music` | `artist` | Favorite songs/albums |
| `## podcasts` | `host` | Podcasts you follow |
| `## youtube` | `channel` | YouTube channels |

Each item needs: `title`, subtitle (varies by section), `cover` (image URL), and `url` (link).

## Publishing Workflow

1. Create/edit a `.md` file in the `posts/` directory
2. Commit and push to `main`
3. The blog fetches content from GitHub API — **no rebuild needed**
4. New content appears within minutes (API cache is 5 min)

## Tips

- **Slug = filename**: `my-great-post.md` → `yourblog.com/post/my-great-post`
- **Date order**: Posts are sorted by `date` in the frontmatter (newest first)
- **Categories**: Keep them lowercase and consistent (e.g., "python", not "Python")
- **Images**: Host images externally (Imgur, GitHub raw, Unsplash) — the blog doesn't store images
