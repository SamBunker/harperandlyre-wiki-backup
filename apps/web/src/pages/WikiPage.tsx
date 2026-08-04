import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError, type Page, type Infobox as InfoboxData } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import { ContentViewer } from "../components/ContentViewer";
import { Infobox } from "../components/Infobox";

type WikiPageProps = {
  /** Overrides the :slug route param — used to render a fixed page (e.g. the homepage) at another route. */
  slugOverride?: string;
  /** Rendered instead of the default "not found" message when the page doesn't exist. */
  notFoundFallback?: ReactNode;
};

export function WikiPage({ slugOverride, notFoundFallback }: WikiPageProps = {}) {
  const { slug: slugParam = "" } = useParams();
  const slug = slugOverride ?? slugParam;
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setPage(null);
    setError(null);
    setNotFound(false);
    api.getPage(slug).then(setPage).catch((e) => {
      if (e instanceof ApiError && e.status === 404) setNotFound(true);
      else setError(e.message);
    });
  }, [slug]);

  const deletePage = async () => {
    if (!page) return;
    if (!window.confirm(`Delete "${page.title}"? This can't be undone.`)) return;
    setDeleting(true);
    try {
      await api.deletePage(slug);
      navigate("/all-pages");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setDeleting(false);
    }
  };

  if (notFound) {
    if (notFoundFallback !== undefined) return <>{notFoundFallback}</>;
    return <p>Page not found.</p>;
  }
  if (error) return <p className="error">{error}</p>;
  if (!page) return <p>Loading…</p>;

  const infobox: InfoboxData | null = page.infobox ? JSON.parse(page.infobox) : null;

  return (
    <article className="wiki-page">
      {infobox && <Infobox data={infobox} />}
      {!page.published && user && <p className="hidden-banner">This page is hidden from the public.</p>}
      <header>
        <h1>{page.title}</h1>
        <div className="wiki-page-actions">
          <Link to={`/wiki/${slug}/history`}>History</Link>
          {user && <Link to={`/wiki/${slug}/edit`}>Edit</Link>}
          {user && (
            <button type="button" className="link-button" onClick={deletePage} disabled={deleting}>
              Delete
            </button>
          )}
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
