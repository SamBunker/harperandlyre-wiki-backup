import { api, type Infobox as InfoboxData } from "../lib/api";

export function Infobox({ data }: { data: InfoboxData }) {
  return (
    <aside className="infobox">
      {data.image && <img src={api.imageUrl(data.image)} alt="" className="infobox-image" />}
      <table>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i}>
              <th>{row.label}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </aside>
  );
}
