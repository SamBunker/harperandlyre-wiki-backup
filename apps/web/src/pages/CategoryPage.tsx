import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, type CategoryDetail } from "../lib/api";
import { useAuth } from "../lib/auth-context";

export function CategoryPage() {
  const { slug = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCategory(null);
    setError(null);
    setEditing(false);
    api.getCategory(slug).then(setCategory).catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <p className="error">{error}</p>;
  if (!category) return <p>Loading…</p>;

  const startEditing = () => {
    setNameDraft(category.name);
    setEditing(true);
  };

  const saveRename = async () => {
    const name = nameDraft.trim();
    if (!name || name === category.name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const renamed = await api.renameCategory(category.slug, name);
      setEditing(false);
      navigate(`/category/${renamed.slug}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async () => {
    if (!window.confirm(`Delete category "${category.name}"? This removes it from all pages.`)) return;
    setSaving(true);
    try {
      await api.deleteCategory(category.slug);
      navigate("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSaving(false);
    }
  };

  return (
    <div className="category-page">
      <div className="category-page-header">
        {editing ? (
          <div className="category-page-edit">
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveRename()}
              autoFocus
            />
            <button type="button" onClick={saveRename} disabled={saving}>
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </button>
          </div>
        ) : (
          <>
            <h1>Category: {category.name}</h1>
            {user && (
              <div className="category-page-actions">
                <button type="button" onClick={startEditing}>
                  Rename
                </button>
                <button type="button" onClick={deleteCategory} disabled={saving}>
                  Delete
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {category.pages.length === 0 ? (
        <p>No pages in this category yet.</p>
      ) : (
        <ul className="page-list">
          {category.pages.map((p) => (
            <li key={p.slug}>
              <Link to={`/wiki/${p.slug}`}>{p.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
