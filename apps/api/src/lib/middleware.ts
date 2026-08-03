import type { Context, Next } from "hono";
import type { Env, Variables } from "../types";
import { verifySessionCookie } from "./session";

type AppContext = Context<{ Bindings: Env; Variables: Variables }>;

export async function loadEditor(c: AppContext, next: Next) {
  const editorName = await verifySessionCookie(c.req.header("Cookie"), c.env.SESSION_SECRET);
  c.set("editorName", editorName);
  return next();
}

export async function requireEditor(c: AppContext, next: Next) {
  if (!c.get("editorName")) return c.json({ error: "Unauthorized" }, 401);
  return next();
}
