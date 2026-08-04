import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

const LEGACY_EXTENSIONS = [StarterKit, Image, Link];

/** Old pages store TipTap ProseMirror JSON; new pages store CKEditor HTML directly. */
export function isLegacyDoc(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed.startsWith("{")) return false;
  try {
    const parsed = JSON.parse(trimmed);
    return typeof parsed === "object" && parsed !== null && "type" in parsed;
  } catch {
    return false;
  }
}

/** Converts a legacy TipTap JSON doc to HTML so it can be loaded into CKEditor / rendered as HTML. */
export function legacyDocToHtml(content: string): string {
  const doc = JSON.parse(content);
  return generateHTML(doc, LEGACY_EXTENSIONS);
}

/** Returns HTML for the given stored content, converting from the legacy format if needed. */
export function toHtml(content: string): string {
  return isLegacyDoc(content) ? legacyDocToHtml(content) : content;
}
