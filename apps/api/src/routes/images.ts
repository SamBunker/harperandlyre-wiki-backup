import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { requireEditor } from "../lib/middleware";

const images = new Hono<{ Bindings: Env; Variables: Variables }>();

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

images.post("/", requireEditor, async (c) => {
  const form = await c.req.formData();
  // workers-types mistypes FormData#get as string | null; at runtime it's a File for file fields.
  const file = form.get("file") as unknown as File | null;
  if (!file || typeof file === "string") return c.json({ error: "Missing file" }, 400);

  if (!ALLOWED_TYPES.has(file.type)) {
    return c.json({ error: "Unsupported image type" }, 415);
  }
  if (file.size > MAX_SIZE_BYTES) {
    return c.json({ error: "Image too large (max 8MB)" }, 413);
  }

  const editor = c.get("editorName")!;
  const ext = file.type.split("/")[1];
  const key = `${crypto.randomUUID()}.${ext}`;

  await c.env.IMAGES.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  await c.env.DB.prepare("INSERT INTO images (id, uploaded_by) VALUES (?, ?)").bind(key, editor).run();

  return c.json({ key, url: `/api/images/${key}` }, 201);
});

images.get("/:key", async (c) => {
  const key = c.req.param("key");
  const object = await c.env.IMAGES.get(key);
  if (!object) return c.json({ error: "Not found" }, 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
});

export default images;
