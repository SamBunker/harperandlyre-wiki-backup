import type { Env } from "../types";

const COLORS = {
  created: 0x57f287, // green
  updated: 0xe67e22, // orange
  deleted: 0xed4245, // red
} as const;

type PageChangeEvent = {
  type: "created" | "updated" | "deleted";
  title: string;
  slug: string;
  editor: string;
};

async function postEmbed(webhookUrl: string, description: string, color: number) {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [{ description, color }] }),
    });
  } catch {
    // Best-effort notification; a failed webhook shouldn't fail the request.
  }
}

export async function notifyPageChange(env: Env, event: PageChangeEvent) {
  if (!env.DISCORD_WEBHOOK_URL) return;

  const verb = event.type === "created" ? "created" : event.type === "updated" ? "edited" : "deleted";
  const siteUrl = env.PUBLIC_URL ?? env.FRONTEND_URL;
  // Discord only renders masked `[text](url)` links inside embeds, not plain message content.
  const link = event.type === "deleted" ? "" : ` — [View Here](${siteUrl}/wiki/${event.slug})`;
  const description = `**${event.editor}** ${verb} **${event.title}**${link}`;

  await postEmbed(env.DISCORD_WEBHOOK_URL, description, COLORS[event.type]);
}

export async function notifyCategoryDeleted(env: Env, category: { name: string; editor: string }) {
  if (!env.DISCORD_WEBHOOK_URL) return;

  const description = `**${category.editor}** deleted category **${category.name}**`;
  await postEmbed(env.DISCORD_WEBHOOK_URL, description, COLORS.deleted);
}
