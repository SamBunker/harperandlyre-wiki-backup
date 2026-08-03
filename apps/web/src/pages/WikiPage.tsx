import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, type Page, type Infobox as InfoboxData } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import { ContentViewer } from "../components/ContentViewer";
import { Infobox } from "../components/Infobox";

export function WikiPage() {
  const { slug = "" } = useParams();
  const [page, setPage] = useState<Page | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    setPage(null);
    setError(null);
    api.getPage(slug).then(setPage).catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <p className="error">{error}</p>;
  if (!page) return <p>Loading…</p>;

  const infobox: InfoboxData | null = page.infobox ? JSON.parse(page.infobox) : null;

  return (
    <article className="wiki-page">
      {infobox && <Infobox data={infobox} />}
      <header>
        <h1>{page.title}</h1>
        <div className="wiki-page-actions">
          <Link to={`/wiki/${slug}/history`}>History</Link>
          {user && <Link to={`/wiki/${slug}/edit`}>Edit</Link>}
        </div>
      </header>
      <ContentViewer content={page.content} />
      {page.categories.length > 0 && (
        <footer className="wiki-page-categories">
          Categories:{" "}
          {page.categories.map((category, i) => (
            <span key={category.slug}>
              <Link to={`/category/${category.slug}`}>{category.name}</Link>
              {i < page.categories.length - 1 && ", "}
            </span>
          ))}
        </footer>
      )}
    </article>
  );
}
