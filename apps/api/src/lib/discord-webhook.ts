import type { Env } from "../types";

type PageChangeEvent = {
  type: "created" | "updated";
  title: string;
  slug: string;
  editor: string;
};

export async function notifyPageChange(env: Env, event: PageChangeEvent) {
  if (!env.DISCORD_WEBHOOK_URL) return;

  const verb = event.type === "created" ? "created" : "edited";
  const content = `**${event.editor}** ${verb} **${event.title}** — ${env.FRONTEND_URL}/wiki/${event.slug}`;

  try {
    await fetch(env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  } catch {
    // Best-effort notification; a failed webhook shouldn't fail the page save.
  }
}
