type TiptapNode = {
  text?: string;
  content?: TiptapNode[];
};

function extractFromTiptapDoc(doc: unknown): string {
  const parts: string[] = [];

  function walk(node: unknown) {
    if (!node || typeof node !== "object") return;
    const n = node as TiptapNode;
    if (typeof n.text === "string") parts.push(n.text);
    if (Array.isArray(n.content)) {
      for (const child of n.content) walk(child);
    }
  }

  walk(doc);
  return parts.join(" ");
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Page content is either legacy TipTap ProseMirror JSON (old pages) or an
 * HTML string (new pages, saved by CKEditor) — handle both for search indexing.
 */
export function extractPlainText(content: string): string {
  const trimmed = content.trim();
  if (trimmed.startsWith("{")) {
    try {
      return extractFromTiptapDoc(JSON.parse(trimmed));
    } catch {
      // not valid JSON — fall through to HTML stripping
    }
  }
  return stripHtml(content);
}
