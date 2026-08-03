import { Hono } from "hono";
import type { Env, Page, Variables } from "../types";
import { requireEditor } from "../lib/middleware";
import { notifyPageChange } from "../lib/discord-webhook";
import { slugify } from "../lib/slugify";
import { extractPlainText } from "../lib/content-text";
import { syncPageCategories, getPageCategories } from "../lib/categories";

const pages = new Hono<{ Bindings: Env; Variables: Variables }>();

type PageBody = {
  title?: string;
  slug?: string;
  content?: string;
  infobox?: { image?: string; rows: { label: string; value: string }[] } | null;
  categories?: string[];
};

pages.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, slug, title, updated_at, updated_by FROM pages ORDER BY updated_at DESC"
  ).all();
  return c.json(results);
});

pages.get("/:slug", async (c) => {
  const slug = c.req.param("slug")!;
  const page = await c.env.DB.prepare("SELECT * FROM pages WHERE slug = ?").bind(slug).first<Page>();
  if (!page) return c.json({ error: "Not found" }, 404);
  const categories = await getPageCategories(c.env.DB, page.id);
  return c.json({ ...page, categories });
});

pages.get("/:slug/history", async (c) => {
  const slug = c.req.param("slug")!;
  const page = await c.env.DB.prepare("SELECT id FROM pages WHERE slug = ?").bind(slug).first<{ id: number }>();
  if (!page) return c.json({ error: "Not found" }, 404);
  const { results } = await c.env.DB.prepare(
    "SELECT id, edited_by, edited_at FROM revisions WHERE page_id = ? ORDER BY edited_at DESC"
  )
    .bind(page.id)
    .all();
  return c.json(results);
});

pages.post("/", requireEditor, async (c) => {
  const body = await c.req.json<PageBody>();
  if (!body.title || !body.content) {
    return c.json({ error: "title and content are required" }, 400);
  }
  const title = body.title;
  const content = body.content;
  const contentText = extractPlainText(JSON.parse(content));
  const infobox = body.infobox ? JSON.stringify(body.infobox) : null;
  const slug = body.slug ? slugify(body.slug) : slugify(title);
  const editor = c.get("editorName")!;

  const existing = await c.env.DB.prepare("SELECT id FROM pages WHERE slug = ?").bind(slug).first();
  if (existing) return c.json({ error: "A page with this slug already exists" }, 409);

  const result = await c.env.DB.prepare(
    `INSERT INTO pages (slug, title, content, content_text, infobox, created_by, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
  )
    .bind(slug, title, content, contentText, infobox, editor, editor)
    .first<Page>();

  let categories: { name: string; slug: string }[] = [];
  if (result && body.categories) {
    await syncPageCategories(c.env.DB, result.id, body.categories);
    categories = await getPageCategories(c.env.DB, result.id);
  }

  c.executionCtx.waitUntil(notifyPageChange(c.env, { type: "created", title, slug, editor }));

  return c.json({ ...result, categories }, 201);
});

pages.put("/:slug", requireEditor, async (c) => {
  const slug = c.req.param("slug")!;
  const body = await c.req.json<PageBody>();
  if (!body.title || !body.content) {
    return c.json({ error: "title and content are required" }, 400);
  }
  const title = body.title;
  const content = body.content;
  const contentText = extractPlainText(JSON.parse(content));
  const infobox = body.infobox ? JSON.stringify(body.infobox) : null;
  const editor = c.get("editorName")!;

  const page = await c.env.DB.prepare("SELECT * FROM pages WHERE slug = ?").bind(slug).first<Page>();
  if (!page) return c.json({ error: "Not found" }, 404);

  await c.env.DB.batch([
    c.env.DB.prepare("INSERT INTO revisions (page_id, content, edited_by) VALUES (?, ?, ?)").bind(
      page.id,
      page.content,
      page.updated_by
    ),
    c.env.DB.prepare(
      `UPDATE pages SET title = ?, content = ?, content_text = ?, infobox = ?, updated_by = ?,
       updated_at = datetime('now') WHERE id = ?`
    ).bind(title, content, contentText, infobox, editor, page.id),
  ]);

  if (body.categories) {
    await syncPageCategories(c.env.DB, page.id, body.categories);
  }

  const updated = await c.env.DB.prepare("SELECT * FROM pages WHERE id = ?").bind(page.id).first<Page>();
  const categories = await getPageCategories(c.env.DB, page.id);

  c.executionCtx.waitUntil(notifyPageChange(c.env, { type: "updated", title, slug, editor }));

  return c.json({ ...updated, categories });
});

export default pages;
