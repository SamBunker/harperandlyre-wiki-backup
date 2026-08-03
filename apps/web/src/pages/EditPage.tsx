import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import type { Editor as TiptapEditor } from "@tiptap/react";
import { api, type Page, type Infobox } from "../lib/api";
import { Editor } from "../components/Editor";
import { InfoboxEditor } from "../components/InfoboxEditor";
import { useAuth } from "../lib/auth-context";

export function EditPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState<Page | null>(null);
  const [title, setTitle] = useState("");
  const [infobox, setInfobox] = useState<Infobox | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<TiptapEditor | null>(null);

  useEffect(() => {
    api
      .getPage(slug)
      .then((p) => {
        setPage(p);
        setTitle(p.title);
        setInfobox(p.infobox ? JSON.parse(p.infobox) : null);
        setCategories(p.categories.map((c) => c.name));
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  const save = async () => {
    if (!editorRef.current) return;
    setSaving(true);
    setError(null);
    try {
      const content = JSON.stringify(editorRef.current.getJSON());
      await api.updatePage(slug, { title, content, infobox, categories });
      navigate(`/wiki/${slug}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!authLoading && !user) return <Navigate to={`/wiki/${slug}`} replace />;
  if (error && !page) return <p className="error">{error}</p>;
  if (!page) return <p>Loading…</p>;

  return (
    <div className="edit-page">
      <input className="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="edit-page-layout">
        <Editor content={JSON.parse(page.content)} onReady={(e) => (editorRef.current = e)} />
        <InfoboxEditor
          infobox={infobox}
          categories={categories}
          onInfoboxChange={setInfobox}
          onCategoriesChange={setCategories}
        />
      </div>
      {error && <p className="error">{error}</p>}
      <button onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
