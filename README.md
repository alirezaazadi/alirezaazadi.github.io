# Alireza Azadi's Personal Blog

A personal blog built with **Next.js App Router**, featuring a built-in CMS admin panel, AI-powered translation, an interactive terminal, ADHD-friendly reader mode, and a nerd/geek minimalist design system with monospace accents.

## Features

### Posts

- Markdown-based content stored in `content/posts/`
- Categories, tags, date, reading time, and cover images
- Obsidian-style image sizing: `![alt|400](url)`, `![alt|400x300](url)`, `![alt|x100](url)`
- Video embeds (YouTube, Vimeo, Aparat via custom embed syntax)
- Spotify embeds (tracks, albums, playlists, episodes)
- Configurable default image max-width via admin settings
- Pagination with configurable posts-per-page

### Translation

- AI-powered translation using Google Gemini models (Gemma 3, Gemini Flash, Gemini 2.0 Flash Lite)
- Google Translate as a legacy fallback
- 15 languages supported (configurable per-language in admin settings)
- Translation caching in `localStorage` to avoid repeat API calls
- Inline translation: select any text on a post to translate it on the fly

### ADHD / Reader Mode

- Fullscreen distraction-free reading overlay
- Optional Bionic Reading (bolds first ~40% of each word for faster scanning)
- RTL support for Persian/Arabic content
- Togglable from post action bar

### Archive

- One-click archival of any post to the Wayback Machine (web.archive.org)
- "Archive on Publish" checkbox in the post editor queues archival for the next deployment
- Archival triggers 2 minutes after deploy to allow propagation

### Share

- Share menu with configurable options: LinkedIn, Telegram, Copy Link
- Each option can be individually enabled/disabled in admin settings

### Terminal

- Interactive terminal overlay (toggle with `Ctrl + \``)
- Commands: `ls`, `cd`, `cat`, `grep`, `favs`, `whoami`, `clear`, `exit`, `help`
- Navigate posts, favorites, about, and contact like a file system
- Tab autocomplete and command history (arrow keys)
- Each command can be individually enabled/disabled in admin settings

### Theme System

- Auto theme based on geolocation + time of day (daytime = light, night = dark)
- Falls back to `prefers-color-scheme` if geolocation is unavailable
- Manual toggle persisted in `localStorage`
- Blocking script prevents flash of wrong theme before hydration
- CSS custom properties for all colors, shadows, radii, and transitions

### Other Pages

- **About** (`/about`) -- markdown-based about page
- **Suggestions** (`/suggestions`) -- markdown-based suggestions/recommendations page
- **Favorites sidebar** -- curated links grouped by category (books, music, podcasts, movies, playlists, magazines)
- **Contact sidebar** -- social links and about-me summary

## Admin Panel

Accessible at `/admin` in development mode. A full CMS for managing all blog content and configuration.

### Post Editor

- Create, edit, and delete posts
- Rich markdown editor with Write/Preview toggle
- Toolbar: bold, italic, heading, link, image upload
- Image upload with drag-and-drop, automatic slug-based paths
- Draft/publish toggle
- Cover image support
- "Archive on Publish" checkbox to queue web.archive.org archival

### Site Settings (`/admin/config`)

All settings are stored in `site.config.ts` and editable through the admin UI:

| Setting | Type | Description |
|---------|------|-------------|
| `description` | string | Site subtitle/tagline shown on the homepage |
| `showFavorites` | boolean | Show/hide the favorites sidebar |
| `showContact` | boolean | Show/hide the contact sidebar |
| `showTranslation` | boolean | Enable/disable the translate button on posts |
| `showAdhdMode` | boolean | Enable/disable the ADHD/reader mode button |
| `showArchive` | boolean | Enable/disable the archive button on posts |
| `showShare` | boolean | Enable/disable the share button on posts |
| `showSuggestions` | boolean | Show/hide the suggestions nav link |
| `showAbout` | boolean | Show/hide the about nav link |
| `showTerminal` | boolean | Enable/disable the terminal feature |
| `translateLanguages` | string[] | Which languages appear in the translate picker |
| `shareOptions` | string[] | Which share options to show (linkedin, telegram, copyLink) |
| `terminalCommands` | string[] | Which terminal commands are enabled |
| `defaultImageWidth` | number | Default max-width for post images in px (0 = unlimited) |
| `social` | object | Social media links (key-value pairs) |
| `aboutMe` | string | Markdown content for the about-me section |

### Favorites Manager (`/admin/favorites`)

- Edit the favorites markdown file with grouped sections
- Auto-fetches OG images for new entries on deploy

### Suggestions Editor (`/admin/suggestions`)

- Edit the suggestions page content via rich markdown editor

### Deploy / Publish

Interactive deployment flow with real-time progress:

1. Click "Deploy / Publish" in the sidebar
2. Custom commit message modal (keyboard shortcut: Cmd+Enter to deploy)
3. Streaming progress toast with checklist:
   - **Pre-commit**: strip image metadata, fetch covers, remove dangling images, stage media
   - **Git**: stage changes, commit, push
4. Interactive prompts forwarded to the UI (e.g. confirm dangling image deletion)
5. Cancel button to abort the deploy at any point
6. Web archive scheduling (2-minute delay post-deploy)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the blog, and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

## Configuration

All public site configuration lives in [`site.config.ts`](site.config.ts). This file is the single source of truth -- the admin settings UI reads and writes to it. Changes take effect in dev mode immediately via hot reload, and in production after the next deployment.

## Deployment

The blog deploys via git push. The admin "Deploy / Publish" button handles the full flow:

1. Runs pre-commit hooks (lint-staged, image metadata stripping, cover fetching, dangling image cleanup)
2. Commits with your message
3. Pushes to the remote (triggers Vercel/GitHub Pages deployment)
4. Schedules web.archive.org archival for queued posts (2-minute delay)

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: CSS custom properties, no CSS framework
- **Fonts**: JetBrains Mono, Inter, Vazirmatn (RTL)
- **Translation**: Google Gemini API
- **Deployment**: Vercel
- **Content**: Markdown files in `content/`
