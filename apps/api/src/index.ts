import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env, Variables } from "./types";
import { loadEditor } from "./lib/middleware";
import pages from "./routes/pages";
import images from "./routes/images";
import auth from "./routes/auth";
import categories from "./routes/categories";
import search from "./routes/search";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

const DEV_ORIGIN = "http://localhost:5173";

app.use("*", async (c, next) => {
  const extraOrigins = (c.env.ADDITIONAL_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const allowedOrigins = new Set([c.env.FRONTEND_URL, DEV_ORIGIN, ...extraOrigins]);
  const middleware = cors({
    origin: (origin) => (origin && allowedOrigins.has(origin) ? origin : undefined),
    credentials: true,
  });
  return middleware(c, next);
});

app.use("*", loadEditor);

app.route("/api/pages", pages);
app.route("/api/images", images);
app.route("/api/auth", auth);
app.route("/api/categories", categories);
app.route("/api/search", search);

export default app;
