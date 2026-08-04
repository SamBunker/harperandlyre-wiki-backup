import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { requireEditor } from "../lib/middleware";
import { slugify } from "../lib/slugify";
import { notifyCategoryDeleted } from "../lib/discord-webhook";

const categories = new Hono<{ Bindings: Env; Variables: Variables }>();

categories.get("/", async (c) => {
  const isEditor = Boolean(c.get("editorName"));
  const query = isEditor
    ? `SELECT c.name, c.slug, COUNT(pc.page_id) AS page_count
       FROM categories c
       LEFT JOIN page_categories pc ON pc.category_id = c.id
       GROUP BY c.id
       ORDER BY c.name`
    : `SELECT c.name, c.slug, COUNT(pc.page_id) AS page_count
       FROM categories c
       LEFT JOIN page_categories pc ON pc.category_id = c.id
       LEFT JOIN pages p ON p.id = pc.page_id AND p.published = 1
       GROUP BY c.id
       ORDER BY c.name`;
  const { results } = await c.env.DB.prepare(query).all();
  return c.json(results);
});

categories.get("/:slug", async (c) => {
  const slug = c.req.param("slug")!;
  const isEditor = Boolean(c.get("editorName"));
  const category = await c.env.DB.prepare("SELECT id, name, slug FROM categories WHERE slug = ?")
    .bind(slug)
    .first<{ id: number; name: string; slug: string }>();
  if (!category) return c.json({ error: "Not found" }, 404);

  const query = isEditor
    ? `SELECT p.id, p.slug, p.title, p.updated_at
       FROM pages p
       JOIN page_categories pc ON pc.page_id = p.id
       WHERE pc.category_id = ?
       ORDER BY p.title`
    : `SELECT p.id, p.slug, p.title, p.updated_at
       FROM pages p
       JOIN page_categories pc ON pc.page_id = p.id
       WHERE pc.category_id = ? AND p.published = 1
       ORDER BY p.title`;
  const { results } = await c.env.DB.prepare(query).bind(category.id).all();

  return c.json({ name: category.name, slug: category.slug, pages: results });
});

categories.patch("/:slug", requireEditor, async (c) => {
  const slug = c.req.param("slug")!;
  const body = await c.req.json<{ name?: string }>();
  const name = body.name?.trim();
  if (!name) return c.json({ error: "name is required" }, 400);

  const category = await c.env.DB.prepare("SELECT id FROM categories WHERE slug = ?")
    .bind(slug)
    .first<{ id: number }>();
  if (!category) return c.json({ error: "Not found" }, 404);

  const newSlug = slugify(name);
  const conflict = await c.env.DB.prepare("SELECT id FROM categories WHERE (name = ? OR slug = ?) AND id != ?")
    .bind(name, newSlug, category.id)
    .first();
  if (conflict) return c.json({ error: "A category with this name already exists" }, 409);

  await c.env.DB.prepare("UPDATE categories SET name = ?, slug = ? WHERE id = ?")
    .bind(name, newSlug, category.id)
    .run();

  return c.json({ name, slug: newSlug });
});

categories.delete("/:slug", requireEditor, async (c) => {
  const slug = c.req.param("slug")!;
  const category = await c.env.DB.prepare("SELECT id, name FROM categories WHERE slug = ?")
    .bind(slug)
    .first<{ id: number; name: string }>();
  if (!category) return c.json({ error: "Not found" }, 404);

  await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM page_categories WHERE category_id = ?").bind(category.id),
    c.env.DB.prepare("DELETE FROM categories WHERE id = ?").bind(category.id),
  ]);

  const editor = c.get("editorName")!;
  c.executionCtx.waitUntil(notifyCategoryDeleted(c.env, { name: category.name, editor }));

  return c.json({ ok: true });
});

export default categories;
