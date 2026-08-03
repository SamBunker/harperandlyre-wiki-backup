import { useEditor, EditorContent, type Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useRef, useState } from "react";
import { api } from "../lib/api";

type EditorProps = {
  content: unknown;
  onReady: (editor: TiptapEditor) => void;
};

export function Editor({ content, onReady }: EditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Bumped on every selection/content change so toolbar active-states
  // (bold/italic/link/etc.) reflect the cursor position.
  const [, setTick] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: content ?? "",
    onCreate: ({ editor }) => onReady(editor),
    onTransaction: () => setTick((t) => t + 1),
  });

  if (!editor) return null;

  const insertImage = async (file: File) => {
    const { key } = await api.uploadImage(file);
    editor.chain().focus().setImage({ src: api.imageUrl(key) }).run();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const btn = (active: boolean) => (active ? "is-active" : undefined);

  return (
    <div className="editor">
      <div className="editor-toolbar">
        <button
          type="button"
          className={btn(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          type="button"
          className={btn(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>
        <button
          type="button"
          className={btn(editor.isActive("strike"))}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          Strike
        </button>
        <span className="editor-toolbar-divider" />
        <button
          type="button"
          className={btn(editor.isActive("heading", { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>
        <button
          type="button"
          className={btn(editor.isActive("heading", { level: 3 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </button>
        <span className="editor-toolbar-divider" />
        <button
          type="button"
          className={btn(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          List
        </button>
        <button
          type="button"
          className={btn(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </button>
        <button
          type="button"
          className={btn(editor.isActive("blockquote"))}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Quote
        </button>
        <span className="editor-toolbar-divider" />
        <button
          type="button"
          className={btn(editor.isActive("link"))}
          onClick={setLink}
        >
          Link
        </button>
        <button
          type="button"
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          Unlink
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
        <span className="editor-toolbar-divider" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()}>
          Undo
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()}>
          Redo
        </button>
      </div>
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
