import { useEffect, useMemo, useRef, useState } from "react";
import { api, type Infobox, type InfoboxRow, type PageSummary } from "../lib/api";

type Props = {
  infobox: Infobox | null;
  categories: string[];
  onInfoboxChange: (next: Infobox | null) => void;
  onCategoriesChange: (next: string[]) => void;
};

function matchLinks(value: string, pages: PageSummary[]): (string | null)[] {
  const titleMap = new Map(pages.map((p) => [p.title.toLowerCase(), p.slug]));
  return value.split(",").map((part) => titleMap.get(part.trim().toLowerCase()) ?? null);
}

function rowWithValue(row: InfoboxRow, value: string, pages: PageSummary[]): InfoboxRow {
  return { label: row.label, value, links: matchLinks(value, pages) };
}

export function InfoboxEditor({ infobox, categories, onInfoboxChange, onCategoriesChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rows = infobox?.rows ?? [];
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [pageSearch, setPageSearch] = useState("");

  useEffect(() => {
    api.listPages().then(setPages).catch(() => setPages([]));
  }, []);

  const searchResults = useMemo(() => {
    const q = pageSearch.trim().toLowerCase();
    if (!q) return [];
    return pages.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 8);
  }, [pageSearch, pages]);

  const updateRow = (index: number, field: "label" | "value", value: string) => {
    const next = rows.map((r, i) => {
      if (i !== index) return r;
      return field === "value" ? rowWithValue(r, value, pages) : { ...r, label: value };
    });
    onInfoboxChange({ image: infobox?.image, rows: next });
  };

  const addRow = () => {
    onInfoboxChange({ image: infobox?.image, rows: [...rows, { label: "", value: "" }] });
  };

  const removeRow = (index: number) => {
    onInfoboxChange({ image: infobox?.image, rows: rows.filter((_, i) => i !== index) });
  };

  const insertPageIntoRow = (title: string) => {
    const index = activeRow ?? rows.length - 1;
    if (index < 0) {
      onInfoboxChange({ image: infobox?.image, rows: [{ label: "", value: title, links: matchLinks(title, pages) }] });
      setActiveRow(0);
      return;
    }
    const row = rows[index];
    const nextValue = row.value ? `${row.value}, ${title}` : title;
    updateRow(index, "value", nextValue);
  };

  const uploadImage = async (file: File) => {
    const { key } = await api.uploadImage(file);
    onInfoboxChange({ image: key, rows });
  };

  return (
    <div className="infobox-editor">
      <h4>Infobox</h4>

      <div className="infobox-editor-image">
        {infobox?.image ? (
          <img src={api.imageUrl(infobox.image)} alt="" />
        ) : (
          <div className="infobox-editor-image-placeholder">No image</div>
        )}
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          {infobox?.image ? "Replace image" : "Add image"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file);
            e.target.value = "";
          }}
        />
      </div>

      <div className="infobox-editor-search">
        <p className="infobox-editor-hint">
          Values link automatically when they exactly match an existing page title. Search here
          and click a result to insert it into the focused field below (comma-separate multiple
          per field).
        </p>
        <input
          placeholder="Search pages to link…"
          value={pageSearch}
          onChange={(e) => setPageSearch(e.target.value)}
        />
        {searchResults.length > 0 && (
          <ul className="infobox-editor-search-results">
            {searchResults.map((p) => (
              <li key={p.slug}>
                <button type="button" onClick={() => insertPageIntoRow(p.title)}>
                  {p.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {rows.length === 0 && <p className="infobox-editor-empty">No fields yet.</p>}

      {rows.map((row, i) => {
        const parts = row.value.split(",").map((p) => p.trim()).filter(Boolean);
        return (
          <div className="infobox-editor-row" key={i}>
            <div className="infobox-editor-row-header">
              <span>Field {i + 1}</span>
              <button type="button" onClick={() => removeRow(i)} aria-label="Remove row">
                ✕
              </button>
            </div>
            <input
              placeholder="Label (e.g. World)"
              value={row.label}
              onChange={(e) => updateRow(i, "label", e.target.value)}
            />
            <input
              placeholder="Value (e.g. Bamboo Heights, Mist Side Castle)"
              value={row.value}
              onFocus={() => setActiveRow(i)}
              onChange={(e) => updateRow(i, "value", e.target.value)}
            />
            {parts.length > 0 && (
              <div className="infobox-editor-link-preview">
                {parts.map((part, j) => (
                  <span
                    key={j}
                    className={row.links?.[j] ? "infobox-editor-chip linked" : "infobox-editor-chip"}
                    title={row.links?.[j] ? `Links to matching page: ${part}` : "No page matches this title yet"}
                  >
                    {part}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <button type="button" className="infobox-editor-add" onClick={addRow}>
        + Add row
      </button>

      <h4>Categories</h4>
      <input
        placeholder="Comma-separated categories"
        defaultValue={categories.join(", ")}
        onChange={(e) => onCategoriesChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
      />
    </div>
  );
}
