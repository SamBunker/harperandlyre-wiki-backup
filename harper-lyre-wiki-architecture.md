# Harper and Lyre Wiki — Architecture & Build Plan

A community-editable wiki for the Harper and Lyre indie game, built entirely on
Cloudflare's free tier: Workers (API), Pages (frontend), D1 (content), R2 (images),
Discord OAuth (auth).

---

## 1. Stack Overview

| Layer      | Tech                                      | Purpose                          |
|------------|--------------------------------------------|-----------------------------------|
| Frontend   | React + Vite, deployed to Cloudflare Pages | Wiki UI, page viewer, editor      |
| Editor     | TipTap (rich text)                         | WYSIWYG visual editing            |
| Backend    | Cloudflare Worker (Hono framework)         | API for pages, images, auth       |
| Database   | D1 (SQLite)                                | Page content, revisions, users    |
| Storage    | R2                                         | Uploaded images                   |
| Auth       | Discord OAuth2                             | Login via Harper and Lyre Discord |

Use Hono as the Worker framework — it's lightweight, has first-class Cloudflare
support, and keeps routing/middleware clean.

---

## 2. Project Structure

```
harper-lyre-wiki/
├── apps/
│   ├── web/                 # React + Vite frontend (Pages)
│   │   ├── src/
│   │   │   ├── pages/       # WikiPage, EditPage, PageList, Login
│   │   │   ├── components/  # Editor (TipTap), ImageUploader, Nav
│   │   │   ├── lib/         # api client, auth context
│   │   │   └── main.tsx
│   │   └── vite.config.ts
│   └── api/                 # Cloudflare Worker (Hono)
│       ├── src/
│       │   ├── routes/
│       │   │   ├── pages.ts     # CRUD for wiki pages
│       │   │   ├── images.ts    # R2 upload/serve
│       │   │   ├── auth.ts      # Discord OAuth flow
│       │   │   └── revisions.ts # page history
│       │   ├── db/
│       │   │   └── schema.sql
│       │   └── index.ts
│       └── wrangler.toml
├── package.json              # workspace root (pnpm/npm workspaces)
└── README.md
```

---

## 3. D1 Schema

```sql
-- schema.sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,             -- Discord user id
  username TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'editor',  -- 'editor' | 'admin'
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,           -- TipTap JSON, stored as text
  created_by TEXT REFERENCES users(id),
  updated_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL REFERENCES pages(id),
  content TEXT NOT NULL,
  edited_by TEXT REFERENCES users(id),
  edited_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE images (
  id TEXT PRIMARY KEY,             -- R2 object key
  page_id INTEGER REFERENCES pages(id),
  uploaded_by TEXT REFERENCES users(id),
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_revisions_page ON revisions(page_id);
```

Store TipTap content as JSON text in `content` — it round-trips cleanly and
renders directly back into the editor for edits.

---

## 4. Worker API Routes

| Method | Route                  | Purpose                              | Auth        |
|--------|-------------------------|---------------------------------------|-------------|
| GET    | `/api/pages`            | List all pages                        | public      |
| GET    | `/api/pages/:slug`      | Get one page                          | public      |
| POST   | `/api/pages`            | Create a page                         | editor      |
| PUT    | `/api/pages/:slug`      | Update a page (also writes revision)  | editor      |
| GET    | `/api/pages/:slug/history` | List revisions                     | public      |
| POST   | `/api/images`           | Upload image to R2, returns URL       | editor      |
| GET    | `/api/images/:key`      | Serve image from R2                   | public      |
| GET    | `/api/auth/discord`     | Redirect to Discord OAuth             | public      |
| GET    | `/api/auth/callback`    | Discord OAuth callback, sets session  | public      |
| GET    | `/api/auth/me`          | Current user info                     | session     |

Auth middleware: verify a signed session cookie (JWT or a simple signed value)
on every `editor`-tagged route; reject with 401 if missing/invalid.

---

## 5. Discord OAuth Flow

1. `/api/auth/discord` redirects to Discord's OAuth authorize URL with your
   client ID and `identify` scope.
2. Discord redirects back to `/api/auth/callback` with a `code`.
3. Worker exchanges the code for an access token, fetches the Discord user
   profile, upserts into the `users` table.
4. Worker issues a signed session cookie (HttpOnly, Secure) and redirects
   back to the frontend.
5. Optional: restrict edit access to members of your Harper and Lyre Discord
   server specifically, using the `guilds` scope to check membership before
   granting `editor` role.

Store `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, and a `SESSION_SECRET` as
Worker secrets (`wrangler secret put`), never in code.

---

## 6. wrangler.toml (API worker)

```toml
name = "harper-lyre-wiki-api"
main = "src/index.ts"
compatibility_date = "2026-08-01"

[[d1_databases]]
binding = "DB"
database_name = "harper-lyre-wiki"
database_id = "<generated-on-create>"

[[r2_buckets]]
binding = "IMAGES"
bucket_name = "harper-lyre-wiki-images"
```

---

## 7. Image Upload Flow

1. Frontend editor: user drags/pastes an image into TipTap.
2. Frontend uploads the file to `POST /api/images` as multipart form data.
3. Worker generates a unique key (e.g. `crypto.randomUUID()` + extension),
   writes to R2 via the `IMAGES` binding, inserts a row in `images`.
4. Worker returns the public URL (`/api/images/:key`, served by the Worker,
   or a custom domain pointed at the R2 bucket).
5. Frontend inserts that URL into the TipTap doc as an image node.

---

## 8. Build Order (for Claude Code)

1. Scaffold the monorepo (`apps/web`, `apps/api`), set up npm/pnpm workspaces.
2. Create the D1 database (`wrangler d1 create harper-lyre-wiki`), run
   `schema.sql` against it.
3. Create the R2 bucket (`wrangler r2 bucket create harper-lyre-wiki-images`).
4. Build the Worker API: pages CRUD first (no auth yet), test with curl/Thunder Client.
5. Build the React frontend: page list + page viewer (read-only), wired to the API.
6. Add the TipTap editor + edit page, wired to `POST`/`PUT` routes.
7. Add image upload from the editor.
8. Add Discord OAuth (auth routes + session middleware), then gate edit routes.
9. Add revision history view.
10. Deploy: `wrangler deploy` for the API, connect the `apps/web` repo to
    Cloudflare Pages for the frontend, set Worker secrets in the dashboard.

---

## 9. Free Tier Fit

- D1: 5GB storage, 100K writes/day — a wiki won't come close.
- R2: 10GB storage, zero egress fees — images serve free regardless of traffic.
- Workers: 100K requests/day — fine unless the wiki gets very high traffic.
- Pages: free static hosting, no relevant cap for this use case.
- Cost stays $0 unless the community wiki gets large enough to need the $5/mo
  Workers paid plan — at which point it's a flat fee, not a usage cliff.
