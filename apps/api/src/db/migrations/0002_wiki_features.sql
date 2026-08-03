ALTER TABLE pages ADD COLUMN content_text TEXT NOT NULL DEFAULT '';
ALTER TABLE pages ADD COLUMN infobox TEXT; -- JSON: { image?: string; rows: {label,value}[] }

CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE page_categories (
  page_id INTEGER NOT NULL REFERENCES pages(id),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  PRIMARY KEY (page_id, category_id)
);

CREATE INDEX idx_page_categories_category ON page_categories(category_id);
