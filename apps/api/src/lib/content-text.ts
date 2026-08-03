type TiptapNode = {
  text?: string;
  content?: TiptapNode[];
};

export function extractPlainText(doc: unknown): string {
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
