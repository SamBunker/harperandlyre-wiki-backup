import { useEffect, useRef, useState } from "react";
import { api, type Infobox, type PageSummary } from "../lib/api";

type Props = {
  infobox: Infobox | null;
  categories: string[];
  onInfoboxChange: (next: Infobox | null) => void;
  onCategoriesChange: (next: string[]) => void;
};

export function InfoboxEditor({ infobox, categories, onInfoboxChange, onCategoriesChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rows = infobox?.rows ?? [];
  const [pages, setPages] = useState<PageSummary[]>([]);

  useEffect(() => {
    api.listPages().then(setPages).catch(() => setPages([]));
  }, []);

  const updateRow = (index: number, field: "label" | "value" | "link", value: string) => {
    const next = rows.map((r, i) => (i === index ? { ...r, [field]: value || undefined } : r));
    onInfoboxChange({ image: infobox?.image, rows: next });
  };

  const addRow = () => {
    onInfoboxChange({ image: infobox?.image, rows: [...rows, { label: "", value: "" }] });
  };

  const removeRow = (index: number) => {
    onInfoboxChange({ image: infobox?.image, rows: rows.filter((_, i) => i !== index) });
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

      {rows.length === 0 && <p className="infobox-editor-empty">No fields yet.</p>}

      {rows.map((row, i) => (
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
            placeholder="Value (e.g. Bamboo Heights)"
            value={row.value}
            onChange={(e) => updateRow(i, "value", e.target.value)}
          />
          <select value={row.link ?? ""} onChange={(e) => updateRow(i, "link", e.target.value)}>
            <option value="">No link</option>
            {pages.map((p) => (
              <option key={p.slug} value={p.slug}>
                Link to: {p.title}
              </option>
            ))}
          </select>
        </div>
      ))}
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
