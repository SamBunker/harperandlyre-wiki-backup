import { slugify } from "./slugify";

export async function syncPageCategories(db: D1Database, pageId: number, names: string[]) {
  const cleaned = [...new Set(names.map((n) => n.trim()).filter(Boolean))];

  const categoryIds: number[] = [];
  for (const name of cleaned) {
    const slug = slugify(name);
    await db
      .prepare("INSERT INTO categories (name, slug) VALUES (?, ?) ON CONFLICT(name) DO NOTHING")
      .bind(name, slug)
      .run();
    const category = await db.prepare("SELECT id FROM categories WHERE name = ?").bind(name).first<{ id: number }>();
    if (category) categoryIds.push(category.id);
  }

  const statements = [db.prepare("DELETE FROM page_categories WHERE page_id = ?").bind(pageId)];
  for (const categoryId of categoryIds) {
    statements.push(
      db.prepare("INSERT INTO page_categories (page_id, category_id) VALUES (?, ?)").bind(pageId, categoryId)
    );
  }
  await db.batch(statements);
}

export type PageCategory = { name: string; slug: string };

export async function getPageCategories(db: D1Database, pageId: number): Promise<PageCategory[]> {
  const { results } = await db
    .prepare(
      `SELECT c.name, c.slug FROM categories c
       JOIN page_categories pc ON pc.category_id = c.id
       WHERE pc.page_id = ?
       ORDER BY c.name`
    )
    .bind(pageId)
    .all<PageCategory>();
  return results;
}
