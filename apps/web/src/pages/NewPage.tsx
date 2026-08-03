import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import type { Editor as TiptapEditor } from "@tiptap/react";
import { api, type Infobox } from "../lib/api";
import { Editor } from "../components/Editor";
import { InfoboxEditor } from "../components/InfoboxEditor";
import { useAuth } from "../lib/auth-context";

export function NewPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [infobox, setInfobox] = useState<Infobox | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<TiptapEditor | null>(null);

  const save = async () => {
    if (!editorRef.current) return;
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const content = JSON.stringify(editorRef.current.getJSON());
      const page = await api.createPage({ title, content, infobox, categories });
      navigate(`/wiki/${page.slug}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!authLoading && !user) return <Navigate to="/" replace />;

  return (
    <div className="edit-page">
      <input
        className="edit-title"
        placeholder="Page title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="edit-page-layout">
        <Editor content="" onReady={(e) => (editorRef.current = e)} />
        <InfoboxEditor
          infobox={infobox}
          categories={categories}
          onInfoboxChange={setInfobox}
          onCategoriesChange={setCategories}
        />
      </div>
      {error && <p className="error">{error}</p>}
      <button onClick={save} disabled={saving}>
        {saving ? "Creating…" : "Create Page"}
      </button>
    </div>
  );
}
