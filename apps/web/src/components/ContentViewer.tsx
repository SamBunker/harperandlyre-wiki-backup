import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

export function ContentViewer({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [StarterKit, Image, Link],
    content: JSON.parse(content),
    editable: false,
  });

  return <EditorContent editor={editor} className="content-viewer" />;
}
