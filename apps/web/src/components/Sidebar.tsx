import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Category } from "../lib/api";
import { useAuth } from "../lib/auth-context";

type CategorySort = "name" | "count";

export function Sidebar() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [sort, setSort] = useState<CategorySort>("name");

  useEffect(() => {
    api.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const sortedCategories = useMemo(() => {
    if (!categories) return categories;
    const sorted = [...categories];
    if (sort === "count") {
      sorted.sort((a, b) => b.page_count - a.page_count || a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [categories, sort]);

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>Navigation</h3>
        <ul>
          <li>
            <Link to="/all-pages">All Pages</Link>
          </li>
          {user && (
            <li>
              <Link to="/new">New Page</Link>
            </li>
          )}
        </ul>
      </div>
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <h3>Categories</h3>
          {categories && categories.length > 1 && (
            <select
              className="sidebar-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as CategorySort)}
              aria-label="Sort categories"
            >
              <option value="name">A–Z</option>
              <option value="count">Most pages</option>
            </select>
          )}
        </div>
        {!sortedCategories ? (
          <p className="sidebar-loading">Loading…</p>
        ) : sortedCategories.length === 0 ? (
          <p className="sidebar-loading">No categories yet</p>
        ) : (
          <ul>
            {sortedCategories.map((c) => (
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
