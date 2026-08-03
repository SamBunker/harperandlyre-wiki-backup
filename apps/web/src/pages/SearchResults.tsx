import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, type SearchResult } from "../lib/api";

export function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setResults(null);
    setError(null);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    api.search(q).then(setResults).catch((e) => setError(e.message));
  }, [q]);

  if (error) return <p className="error">{error}</p>;
  if (!results) return <p>Searching…</p>;

  return (
    <div className="search-results">
      <h1>Search results for "{q}"</h1>
      {results.length === 0 ? (
        <p>No pages matched.</p>
      ) : (
        <ul className="page-list">
          {results.map((r) => (
            <li key={r.slug}>
              <div>
                <Link to={`/wiki/${r.slug}`}>{r.title}</Link>
                <p className="search-snippet">{r.snippet}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
