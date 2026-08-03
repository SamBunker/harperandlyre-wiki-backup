import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, type Revision } from "../lib/api";

export function History() {
  const { slug = "" } = useParams();
  const [revisions, setRevisions] = useState<Revision[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getHistory(slug).then(setRevisions).catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <p className="error">{error}</p>;
  if (!revisions) return <p>Loading…</p>;

  return (
    <div className="history">
      <h2>
        History: <Link to={`/wiki/${slug}`}>{slug}</Link>
      </h2>
      {revisions.length === 0 ? (
        <p>No prior revisions.</p>
      ) : (
        <ul>
          {revisions.map((r) => (
            <li key={r.id}>
              {new Date(r.edited_at + "Z").toLocaleString()} — edited by {r.edited_by ?? "unknown"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
