import { Sparkles, Trash2, Radio } from "lucide-react";
import { getReleases } from "@/lib/settings";
import { ReleaseForm, ReleaseDeleteButton } from "@/components/admin-client";

export const dynamic = "force-dynamic";

export default async function AdminUpdatesPage() {
  const releases = await getReleases();
  const sorted = [...releases].sort((a, b) => b.n.localeCompare(a.n));

  return (
    <>
      <p className="flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.3em] text-[#FFBD0D]"><Sparkles size={14} /> App control</p>
      <h1 className="mt-1 text-[28px] font-black tracking-tight text-white sm:text-[32px]">Release notes <span className="text-white/35">· {sorted.length}</span></h1>
      <p className="text-[12px] text-white/40">Published here, served at <code className="rounded bg-black/40 px-1.5 py-0.5 text-[10.5px]">/updates</code> in the app — customers see them instantly.</p>

      <div className="mt-5 grid gap-4 xl:grid-cols-12">
        <section className="xl:col-span-5">
          <ReleaseForm />
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-[11px] leading-relaxed text-white/45">
            <Radio size={15} className="shrink-0 text-emerald-400" />
            Changes are written to <code className="rounded bg-black/40 px-1">app_meta.releases</code> — the app&apos;s Updates screen reads from the same source, newest first.
          </div>
        </section>
        <section className="space-y-2.5 xl:col-span-7">
          {sorted.map((r) => (
            <div key={r.n} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2.5"><span className="rounded-lg bg-[#FFBD0D]/10 px-2 py-1 font-mono text-[11px] font-black text-[#FFBD0D]">{r.n}</span><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">{r.date}</span></p>
                <ReleaseDeleteButton n={r.n} />
              </div>
              <p className="mt-2.5 text-[15px] font-extrabold text-white">{r.title}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-white/55">{r.body}</p>
              {r.items.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {r.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11.5px] text-white/60"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FFBD0D]" />{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {sorted.length === 0 && <p className="rounded-2xl border border-white/[0.06] bg-white/[0.03] py-12 text-center text-[13px] text-white/35">No release notes yet — publish the first one.</p>}
        </section>
      </div>
    </>
  );
}
