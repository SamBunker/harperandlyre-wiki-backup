import DOMPurify from "dompurify";
import { toHtml } from "../lib/content-format";

export function ContentViewer({ content }: { content: string }) {
  const html = DOMPurify.sanitize(toHtml(content));
  return <div className="content-viewer" dangerouslySetInnerHTML={{ __html: html }} />;
}
