import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, type CategoryDetail } from "../lib/api";

export function CategoryPage() {
  const { slug = "" } = useParams();
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCategory(null);
    setError(null);
    api.getCategory(slug).then(setCategory).catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <p className="error">{error}</p>;
  if (!category) return <p>Loading…</p>;

  return (
    <div className="category-page">
      <h1>Category: {category.name}</h1>
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
