import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { createSessionCookie, clearSessionCookie } from "../lib/session";
import { timingSafeEqual } from "../lib/timing-safe-equal";

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

auth.post("/login", async (c) => {
  const body = await c.req.json<{ password?: string; name?: string }>().catch(() => ({}) as { password?: string; name?: string });
  const name = body.name?.trim();
  if (!name) return c.json({ error: "Name is required" }, 400);
  if (!body.password || !timingSafeEqual(body.password, c.env.EDIT_PASSWORD)) {
    return c.json({ error: "Incorrect password" }, 401);
  }

  const cookie = await createSessionCookie(name, c.env.SESSION_SECRET);
  c.header("Set-Cookie", cookie);
  return c.json({ name });
});

auth.post("/logout", (c) => {
  c.header("Set-Cookie", clearSessionCookie());
  return c.json({ ok: true });
});

auth.get("/me", (c) => {
  const name = c.get("editorName");
  if (!name) return c.json({ error: "Unauthorized" }, 401);
  return c.json({ name });
});

export default auth;
