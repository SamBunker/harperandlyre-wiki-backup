# Harper and Lyre Wiki

Community wiki for the Harper and Lyre game. See
`harper-lyre-wiki-architecture.md` for the full design.

## Setup

```bash
npm install
```

### 1. Create Cloudflare resources

```bash
cd apps/api
npx wrangler d1 create harper-lyre-wiki
# copy the returned database_id into apps/api/wrangler.toml

npx wrangler r2 bucket create harper-lyre-wiki-images
```

Apply the schema (local dev DB, then remote when ready to deploy):

```bash
npm run db:init          # local
npm run db:init:remote   # remote/production
```

Then apply the wiki-features migration (categories, infoboxes, search) on
top of that base schema:

```bash
npm run db:migrate          # local
npm run db:migrate:remote   # remote/production
```

### 2. Auth + Discord notifications

Editing is gated by a single shared password (not per-user login) — anyone
who knows it can edit, and types in a display name for attribution on
revisions. Set secrets for local dev in `apps/api/.dev.vars` (gitignored,
copy from `.dev.vars.example`):

```
EDIT_PASSWORD=choose-a-password
SESSION_SECRET=some-long-random-string
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...   # optional
```

`DISCORD_WEBHOOK_URL` is a channel Incoming Webhook (Discord: channel Settings
→ Integrations → Webhooks → New Webhook → Copy Webhook URL), not a bot or
OAuth app — it just lets the Worker post "so-and-so edited Page X" messages
into that channel. Leave it unset to disable notifications.

For production, set the same secrets via `wrangler secret put <NAME>`.

### 3. Run locally

```bash
npm run dev:api   # Worker on http://localhost:8787
npm run dev:web   # Vite on http://localhost:5173
```

### 4. Deploy

```bash
npm run deploy:api                 # deploys the Worker
npm run build:web                  # then connect apps/web to Cloudflare Pages
```

Set `FRONTEND_URL` in `wrangler.toml` to the production Pages URL before
deploying — it's used both for CORS and in the webhook notification links.

### 5. Backups

`.github/workflows/backup.yml` runs daily (and on manual trigger via the
Actions tab → "D1 Backup" → "Run workflow") and pushes a full SQL dump of the
production D1 database, plus a list of current R2 image keys, to a
`data-backups` branch (`backups/<date>.sql` / `backups/<date>-r2-keys.json`).
The last 90 days are kept; older ones are pruned automatically.

It needs two repo secrets (Settings → Secrets and variables → Actions), which
you create yourself — I never see the values:

- `CLOUDFLARE_API_TOKEN` — a token with **D1: Edit** and **R2: Read** permissions,
  created at https://dash.cloudflare.com/profile/api-tokens
- `CLOUDFLARE_ACCOUNT_ID` — found on the right sidebar of your Cloudflare
  dashboard's Workers & Pages overview page

Optionally add a third secret, `DISCORD_WEBHOOK_URL` (a channel Incoming
Webhook, same kind as the Worker's page-edit notifications — can be the same
URL or a different channel), and the workflow will post a ✅/⚠️ message to
Discord after every backup run, success or failure. Without it, that step is
skipped silently.

**To restore** from a backup: `git checkout data-backups`, then
`npx wrangler d1 execute harper-lyre-wiki --remote --file=backups/<date>.sql`
from `apps/api` (against a fresh D1 database if the original was lost
entirely, or the existing one if you're rolling back specific data). R2
images themselves aren't binary-backed-up by this workflow — only their keys
are recorded — since R2 already replicates data at rest; if you also want a
full binary copy of uploaded images, that'd need a separate `rclone`-based
step using R2's S3-compatible API credentials.

### 6. Dependency updates

`.github/dependabot.yml` opens weekly PRs for npm dependency updates (root
workspace, covering both `apps/api` and `apps/web`) and for GitHub Actions
version bumps. No secrets or setup needed — GitHub runs this automatically
once the config file is on the default branch.
