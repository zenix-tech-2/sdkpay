import Link from "next/link";
import { ChevronLeft, ShieldCheck, TrendingDown, ArrowLeftRight, Sparkles, Radio } from "lucide-react";
import Gate from "@/components/gate";
import { SectionLabel, Panel, BackLink } from "@/components/ui";
import { Accordion } from "@/components/bits";
import { getReleases } from "@/lib/settings";

const releaseIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("secur")) return ShieldCheck;
  if (t.includes("fee")) return TrendingDown;
  if (t.includes("conversion")) return ArrowLeftRight;
  return Sparkles;
};

export default async function UpdatesPage() {
  const releases = await getReleases();
  const sorted = [...releases].sort((a, b) => b.n.localeCompare(a.n));
  const version = "v1.7h ASH";

  return (
    <Gate>
      <BackLink href="/settings" label="Settings" />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">Updates</h1>
          <p className="text-[13px] text-slate-500">What&apos;s new and improved</p>
        </div>
        <span className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-[12px] font-extrabold text-amber-800"><span className="h-2 w-2 rounded-full bg-gold2" />{version}</span>
      </div>

      <SectionLabel><span className="mt-5 block">Release notes</span></SectionLabel>

      <div className="max-w-2xl space-y-3">
        {sorted.map((r, i) => {
          const Icon = releaseIcon(r.title);
          return (
            <Panel key={r.n} className="overflow-hidden border-amber-200/60">
              <Accordion
                defaultOpen={i === 0}
                icon={<span className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-600"><Icon size={20} /></span>}
                title={
                  <span>
                    <span className="block text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">{r.n} — {r.date}</span>
                    <span className="mt-0.5 block text-[15px] font-extrabold text-ink">{r.title}</span>
                  </span>
                }
              >
                <p className="text-[13px] leading-relaxed text-slate-600">{r.body}</p>
                {r.items.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {r.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-[13px] text-slate-600"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />{item}</li>
                    ))}
                  </ul>
                )}
              </Accordion>
            </Panel>
          );
        })}
        {sorted.length === 0 && (
          <Panel className="p-10 text-center">
            <Radio size={30} className="mx-auto text-slate-300" />
            <p className="mt-3 text-[14px] font-bold text-ink">No release notes yet</p>
            <p className="mt-1 text-[12.5px] text-slate-500">New releases are published here by the SDK Pay team.</p>
          </Panel>
        )}
      </div>
    </Gate>
  );
}
