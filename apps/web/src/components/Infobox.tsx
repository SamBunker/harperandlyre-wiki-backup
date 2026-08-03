import { Link } from "react-router-dom";
import { api, type Infobox as InfoboxData } from "../lib/api";

export function Infobox({ data }: { data: InfoboxData }) {
  return (
    <aside className="infobox">
      {data.image && <img src={api.imageUrl(data.image)} alt="" className="infobox-image" />}
      <table>
        <tbody>
          {data.rows.map((row, i) => {
            const parts = row.value.split(",").map((p) => p.trim());
            return (
              <tr key={i}>
                <th>{row.label}</th>
                <td>
                  {parts.map((part, j) => {
                    const slug = row.links?.[j];
                    return (
                      <span key={j}>
                        {j > 0 && ", "}
                        {slug ? <Link to={`/wiki/${slug}`}>{part}</Link> : part}
                      </span>
                    );
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </aside>
  );
}
