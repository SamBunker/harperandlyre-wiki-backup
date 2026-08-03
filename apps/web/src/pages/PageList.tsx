import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type PageSummary } from "../lib/api";

export function PageList() {
  const [pages, setPages] = useState<PageSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listPages().then(setPages).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!pages) return <p>Loading…</p>;
  if (pages.length === 0) return <p>No pages yet. Be the first to create one!</p>;

  return (
    <ul className="page-list">
      {pages.map((p) => (
        <li key={p.id}>
          <Link to={`/wiki/${p.slug}`}>{p.title}</Link>
          <span className="page-list-updated">{new Date(p.updated_at + "Z").toLocaleDateString()}</span>
        </li>
      ))}
    </ul>
  );
}
