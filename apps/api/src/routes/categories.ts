import { Hono } from "hono";
import type { Env, Variables } from "../types";

const categories = new Hono<{ Bindings: Env; Variables: Variables }>();

categories.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT c.name, c.slug, COUNT(pc.page_id) AS page_count
     FROM categories c
     LEFT JOIN page_categories pc ON pc.category_id = c.id
     GROUP BY c.id
     ORDER BY c.name`
  ).all();
  return c.json(results);
});

categories.get("/:slug", async (c) => {
  const slug = c.req.param("slug")!;
  const category = await c.env.DB.prepare("SELECT id, name, slug FROM categories WHERE slug = ?")
    .bind(slug)
    .first<{ id: number; name: string; slug: string }>();
  if (!category) return c.json({ error: "Not found" }, 404);

  const { results } = await c.env.DB.prepare(
    `SELECT p.id, p.slug, p.title, p.updated_at
     FROM pages p
     JOIN page_categories pc ON pc.page_id = p.id
     WHERE pc.category_id = ?
     ORDER BY p.title`
  )
    .bind(category.id)
    .all();

  return c.json({ name: category.name, slug: category.slug, pages: results });
});

export default categories;
