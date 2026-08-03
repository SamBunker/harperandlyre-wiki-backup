import { useEditor, EditorContent, type Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useRef } from "react";
import { api } from "../lib/api";

type EditorProps = {
  content: unknown;
  onReady: (editor: TiptapEditor) => void;
};

export function Editor({ content, onReady }: EditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit, Image, Link],
    content: content ?? "",
    onCreate: ({ editor }) => onReady(editor),
  });

  if (!editor) return null;

  const insertImage = async (file: File) => {
    const { key } = await api.uploadImage(file);
    editor.chain().focus().setImage({ src: api.imageUrl(key) }).run();
  };

  return (
    <div className="editor">
      <div className="editor-toolbar">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          Heading
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          List
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) insertImage(file);
            e.target.value = "";
          }}
        />
      </div>
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
