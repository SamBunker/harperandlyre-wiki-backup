import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Category } from "../lib/api";
import { useAuth } from "../lib/auth-context";

export function Sidebar() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[] | null>(null);

  useEffect(() => {
    api.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>Navigation</h3>
        <ul>
          <li>
            <Link to="/">All Pages</Link>
          </li>
          {user && (
            <li>
              <Link to="/new">New Page</Link>
            </li>
          )}
        </ul>
      </div>
      <div className="sidebar-section">
        <h3>Categories</h3>
        {!categories ? (
          <p className="sidebar-loading">Loading…</p>
        ) : categories.length === 0 ? (
          <p className="sidebar-loading">No categories yet</p>
        ) : (
          <ul>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to={`/category/${c.slug}`}>{c.name}</Link>
                <span className="sidebar-count">{c.page_count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
