import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { api, type Page, type Infobox } from "../lib/api";
import { Editor } from "../components/Editor";
import { InfoboxEditor } from "../components/InfoboxEditor";
import { useAuth } from "../lib/auth-context";
import { toHtml } from "../lib/content-format";

export function EditPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState<Page | null>(null);
  const [title, setTitle] = useState("");
  const [infobox, setInfobox] = useState<Infobox | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [published, setPublished] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const getContentRef = useRef<(() => string) | null>(null);

  useEffect(() => {
    api
      .getPage(slug)
      .then((p) => {
        setPage(p);
        setTitle(p.title);
        setInfobox(p.infobox ? JSON.parse(p.infobox) : null);
        setCategories(p.categories.map((c) => c.name));
        setPublished(Boolean(p.published));
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  const save = async () => {
    if (!getContentRef.current) return;
    setSaving(true);
    setError(null);
    try {
      const content = getContentRef.current();
      await api.updatePage(slug, { title, content, infobox, categories, published });
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
        <Editor content={toHtml(page.content)} onReady={(get) => (getContentRef.current = get)} />
        <InfoboxEditor
          infobox={infobox}
          categories={categories}
          onInfoboxChange={setInfobox}
          onCategoriesChange={setCategories}
        />
      </div>
      <label className="visibility-toggle">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Visible to public
      </label>
      {error && <p className="error">{error}</p>}
      <button onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
