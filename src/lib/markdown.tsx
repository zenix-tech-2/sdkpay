import type { ReactNode } from "react";

/** Tiny dependency-free markdown renderer for the docs (headings, lists, tables, code, quotes, inline). */

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("`")) {
      out.push(
        <code key={`${key}-${i}`} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-slate-800">
          {tok.slice(1, -1)}
        </code>
      );
    } else if (tok.startsWith("**")) {
      out.push(<strong key={`${key}-${i}`} className="font-bold text-slate-800">{tok.slice(2, -2)}</strong>);
    } else {
      const mm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok)!;
      out.push(
        <a key={`${key}-${i}`} href={mm[2]} className="font-semibold text-blue-600 underline underline-offset-2">
          {mm[1]}
        </a>
      );
    }
    last = m.index + tok.length;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function slugifyHeading(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]);
      i++;
      nodes.push(
        <pre key={k++} className="mt-3 overflow-x-auto rounded-2xl bg-[#0d1117] p-4 font-mono text-[12px] leading-relaxed text-slate-200" data-lang={lang}>
          <code>{buf.join("\n")}</code>
        </pre>
      );
      continue;
    }
    const h = /^(#{2,3})\s+(.*)$/.exec(line);
    if (h) {
      const id = slugifyHeading(h[2]);
      nodes.push(
        h[1].length === 2 ? (
          <h2 key={k++} id={id} className="mt-9 scroll-mt-24 text-[19px] font-extrabold tracking-tight text-slate-900">{h[2]}</h2>
        ) : (
          <h3 key={k++} id={id} className="mt-6 scroll-mt-24 text-[15px] font-extrabold text-slate-900">{h[2]}</h3>
        )
      );
      i++;
      continue;
    }
    if (line.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) buf.push(lines[i++].replace(/^>\s?/, ""));
      nodes.push(
        <div key={k++} className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-[13px] font-medium leading-relaxed text-yellow-900">
          {inline(buf.join(" "), `q${k}`)}
        </div>
      );
      continue;
    }
    if (line.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        if (!cells.every((c) => /^:?-+:?$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      nodes.push(
        <div key={k++} className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[420px] text-left text-[12.5px]">
            <thead className="bg-slate-50">
              <tr>{head.map((c, j) => <th key={j} className="px-3 py-2.5 font-extrabold text-slate-800">{inline(c, `th${j}`)}</th>)}</tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri} className="border-t border-slate-100">
                  {r.map((c, j) => <td key={j} className="px-3 py-2 font-medium text-slate-600">{inline(c, `td${ri}-${j}`)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }
    if (/^(-|\d+\.)\s/.test(line)) {
      const ordered = /^\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && /^(-|\d+\.)\s/.test(lines[i])) items.push(lines[i++].replace(/^(-|\d+\.)\s+/, ""));
      const Tag = ordered ? "ol" : "ul";
      nodes.push(
        <Tag key={k++} className={`mt-3 space-y-1.5 pl-5 text-[14px] font-medium leading-relaxed text-slate-600 ${ordered ? "list-decimal" : "list-disc"}`}>
          {items.map((t, j) => <li key={j}>{inline(t, `li${k}-${j}`)}</li>)}
        </Tag>
      );
      continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{2,3}\s|>|\||-\s|\d+\.\s)/.test(lines[i])) buf.push(lines[i++]);
    nodes.push(<p key={k++} className="mt-3 text-[14px] font-medium leading-relaxed text-slate-600">{inline(buf.join(" "), `p${k}`)}</p>);
  }
  return <>{nodes}</>;
}
