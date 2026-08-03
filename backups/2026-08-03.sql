PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,           -- TipTap JSON, stored as text
  created_by TEXT,                 -- display name the editor typed in
  updated_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL REFERENCES pages(id),
  content TEXT NOT NULL,
  edited_by TEXT,
  edited_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE images (
  id TEXT PRIMARY KEY,             -- R2 object key
  page_id INTEGER REFERENCES pages(id),
  uploaded_by TEXT,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);
DELETE FROM sqlite_sequence;
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_revisions_page ON revisions(page_id);
