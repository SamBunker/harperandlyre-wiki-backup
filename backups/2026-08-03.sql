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
, content_text TEXT NOT NULL DEFAULT '', infobox TEXT);
INSERT INTO "pages" ("id","slug","title","content","created_by","updated_by","created_at","updated_at","content_text","infobox") VALUES(1,'springo','Springo','{"type":"doc","content":[{"type":"image","attrs":{"src":"https://harper-lyre-wiki-api.samuelbunker.workers.dev/api/images/e3fdd0c4-3f47-4be8-9cd5-913b245a19ea.png","alt":null,"title":null}},{"type":"paragraph","content":[{"type":"text","text":"Testing"}]}]}','Sam','Sam','2026-08-03 02:49:18','2026-08-03 03:12:07','Testing','{"image":"1e77e7ca-3945-43b7-a205-4508d64f98b5.png","rows":[{"label":"World","value":"Bamboo Heights","link":"bamboo-heights"}]}');
INSERT INTO "pages" ("id","slug","title","content","created_by","updated_by","created_at","updated_at","content_text","infobox") VALUES(2,'bamboo-heights','Bamboo Heights','{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Welcome to bamboo heights :)"}]}]}','Sam','Sam','2026-08-03 03:11:41','2026-08-03 03:11:41','Welcome to bamboo heights :)','{"rows":[{"label":"World","value":"Bamboo Heights"}]}');
INSERT INTO "pages" ("id","slug","title","content","created_by","updated_by","created_at","updated_at","content_text","infobox") VALUES(3,'mist-side-castle','Mist Side Castle','{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Mist side castle level"}]}]}','Dragonfirebane','Sam','2026-08-03 03:16:50','2026-08-03 03:17:09','Mist side castle level',NULL);
INSERT INTO "pages" ("id","slug","title","content","created_by","updated_by","created_at","updated_at","content_text","infobox") VALUES(4,'trip-trap-tomb','Trip Trap Tomb','{"type":"doc","content":[{"type":"paragraph"}]}','Dragonfirebane','Dragonfirebane','2026-08-03 03:17:33','2026-08-03 03:17:33','',NULL);
INSERT INTO "pages" ("id","slug","title","content","created_by","updated_by","created_at","updated_at","content_text","infobox") VALUES(5,'enemies','Enemies','{"type":"doc","content":[{"type":"paragraph"}]}','Dragonfirebane','Dragonfirebane','2026-08-03 03:18:39','2026-08-03 03:18:39','',NULL);
INSERT INTO "pages" ("id","slug","title","content","created_by","updated_by","created_at","updated_at","content_text","infobox") VALUES(6,'bosses','Bosses','{"type":"doc","content":[{"type":"paragraph"}]}','Dragonfirebane','Dragonfirebane','2026-08-03 03:18:58','2026-08-03 03:18:58','',NULL);
INSERT INTO "pages" ("id","slug","title","content","created_by","updated_by","created_at","updated_at","content_text","infobox") VALUES(7,'harper-and-lyre','Harper and Lyre','{"type":"doc","content":[{"type":"paragraph"}]}','Dragonfirebane','Dragonfirebane','2026-08-03 03:19:13','2026-08-03 03:19:13','',NULL);
INSERT INTO "pages" ("id","slug","title","content","created_by","updated_by","created_at","updated_at","content_text","infobox") VALUES(8,'berry-basket','Berry Basket','{"type":"doc","content":[{"type":"paragraph"}]}','Dragonfirebane','Dragonfirebane','2026-08-03 03:19:53','2026-08-03 03:19:53','',NULL);
CREATE TABLE revisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL REFERENCES pages(id),
  content TEXT NOT NULL,
  edited_by TEXT,
  edited_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "revisions" ("id","page_id","content","edited_by","edited_at") VALUES(1,1,'{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Testing"}]}]}','Sam','2026-08-03 02:50:05');
INSERT INTO "revisions" ("id","page_id","content","edited_by","edited_at") VALUES(2,1,'{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Testing"}]},{"type":"image","attrs":{"src":"https://harper-lyre-wiki-api.samuelbunker.workers.dev/api/images/e3fdd0c4-3f47-4be8-9cd5-913b245a19ea.png","alt":null,"title":null}}]}','Sam','2026-08-03 02:51:01');
INSERT INTO "revisions" ("id","page_id","content","edited_by","edited_at") VALUES(3,1,'{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Testing"}]},{"type":"image","attrs":{"src":"https://harper-lyre-wiki-api.samuelbunker.workers.dev/api/images/e3fdd0c4-3f47-4be8-9cd5-913b245a19ea.png","alt":null,"title":null}}]}','Sam','2026-08-03 03:11:54');
INSERT INTO "revisions" ("id","page_id","content","edited_by","edited_at") VALUES(4,1,'{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Testing"}]},{"type":"image","attrs":{"src":"https://harper-lyre-wiki-api.samuelbunker.workers.dev/api/images/e3fdd0c4-3f47-4be8-9cd5-913b245a19ea.png","alt":null,"title":null}}]}','Sam','2026-08-03 03:12:07');
INSERT INTO "revisions" ("id","page_id","content","edited_by","edited_at") VALUES(5,3,'{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Mist side castle level"}]}]}','Dragonfirebane','2026-08-03 03:17:09');
CREATE TABLE images (
  id TEXT PRIMARY KEY,             -- R2 object key
  page_id INTEGER REFERENCES pages(id),
  uploaded_by TEXT,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT INTO "images" ("id","page_id","uploaded_by","uploaded_at") VALUES('1e77e7ca-3945-43b7-a205-4508d64f98b5.png',NULL,'Sam','2026-08-03 02:49:59');
INSERT INTO "images" ("id","page_id","uploaded_by","uploaded_at") VALUES('e3fdd0c4-3f47-4be8-9cd5-913b245a19ea.png',NULL,'Sam','2026-08-03 02:50:04');
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);
INSERT INTO "categories" ("id","name","slug") VALUES(1,'NPC','npc');
INSERT INTO "categories" ("id","name","slug") VALUES(4,'World','world');
INSERT INTO "categories" ("id","name","slug") VALUES(9,'Enemies','enemies');
INSERT INTO "categories" ("id","name","slug") VALUES(10,'Bosses','bosses');
INSERT INTO "categories" ("id","name","slug") VALUES(11,'Harper and Lyre','harper-and-lyre');
CREATE TABLE page_categories (
  page_id INTEGER NOT NULL REFERENCES pages(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  PRIMARY KEY (page_id, category_id)
);
INSERT INTO "page_categories" ("page_id","category_id") VALUES(2,4);
INSERT INTO "page_categories" ("page_id","category_id") VALUES(1,1);
INSERT INTO "page_categories" ("page_id","category_id") VALUES(3,4);
INSERT INTO "page_categories" ("page_id","category_id") VALUES(4,4);
INSERT INTO "page_categories" ("page_id","category_id") VALUES(5,9);
INSERT INTO "page_categories" ("page_id","category_id") VALUES(6,10);
INSERT INTO "page_categories" ("page_id","category_id") VALUES(7,11);
INSERT INTO "page_categories" ("page_id","category_id") VALUES(8,1);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('pages',8);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('categories',12);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('revisions',5);
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_revisions_page ON revisions(page_id);
CREATE INDEX idx_page_categories_category ON page_categories(category_id);
