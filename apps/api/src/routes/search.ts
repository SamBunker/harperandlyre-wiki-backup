import { Hono } from "hono";
import type { Env, Variables } from "../types";

const search = new Hono<{ Bindings: Env; Variables: Variables }>();

const SNIPPET_RADIUS = 60;

function buildSnippet(text: string, query: string): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, SNIPPET_RADIUS * 2).trim();
  const start = Math.max(0, idx - SNIPPET_RADIUS);
  const end = Math.min(text.length, idx + query.length + SNIPPET_RADIUS);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}

search.get("/", async (c) => {
  const q = c.req.query("q")?.trim();
  if (!q) return c.json([]);

  const like = `%${q}%`;
  const { results } = await c.env.DB.prepare(
    `SELECT slug, title, content_text FROM pages
     WHERE title LIKE ? OR content_text LIKE ?
     ORDER BY updated_at DESC
     LIMIT 20`
  )
    .bind(like, like)
    .all<{ slug: string; title: string; content_text: string }>();

  const withSnippets = results.map((r) => ({
    slug: r.slug,
    title: r.title,
    snippet: buildSnippet(r.content_text, q),
  }));

  return c.json(withSnippets);
});

export default search;
