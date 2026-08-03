export type Env = {
  DB: D1Database;
  IMAGES: R2Bucket;
  EDIT_PASSWORD: string;
  SESSION_SECRET: string;
  DISCORD_WEBHOOK_URL?: string;
  FRONTEND_URL: string;
};

export type Page = {
  id: number;
  slug: string;
  title: string;
  content: string;
  content_text: string;
  infobox: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Revision = {
  id: number;
  page_id: number;
  content: string;
  edited_by: string | null;
  edited_at: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Variables = {
  editorName: string | null;
};
