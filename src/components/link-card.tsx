"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toDataURL } from "qrcode";
import { Link2, Eye, BadgeCheck, Copy, QrCode, Download, Share2, Pencil, Power, Trash2, Check, X, Loader2 } from "lucide-react";
import QrModal from "@/components/qr-modal";
import { togglePaymentLink, deletePaymentLink, renamePaymentLink } from "@/lib/actions";
import { fmtAmount } from "@/lib/format";

export type LinkCardData = {
  id: string;
  slug: string;
  title: string;
  amount: number | null;
  currency: string;
  clicks: number;
  paymentsCount: number;
  collected: number;
  active: boolean;
};

export default function LinkCard({ link, baseUrl }: { link: LinkCardData; baseUrl: string }) {
  const [qrOpen, setQrOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(link.title);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const url = `${baseUrl}/pay/${link.slug}`;

  const copy = () => navigator.clipboard.writeText(url);
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: link.title, url }); return; } catch { /* user cancelled */ }
    }
    copy();
  };
  const downloadQr = async () => {
    const dataUrl = await toDataURL(url, { width: 640, margin: 2, color: { dark: "#0E1A38", light: "#ffffff" } });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `sdkpay-qr-${link.slug}.png`;
    a.click();
  };

  return (
    <div className={`overflow-hidden rounded-2xl bg-gradient-to-br from-navy3 via-navy to-navy2 text-white shadow-md transition ${link.active ? "" : "opacity-70 saturate-50"}`}>
      <div className="flex items-center gap-3 p-4 pb-3">
        <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-white/10 p-3 text-white">
          {link.title.toLowerCase().includes("cash") ? <span className="text-[10px] font-black leading-tight text-gold">CF$</span> : <Link2 size={22} />}
        </span>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-1.5">
              <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 w-full rounded-lg border border-white/20 bg-white/10 px-2 text-[13px] font-bold outline-none focus:border-gold" />
              <button onClick={() => startTransition(async () => { await renamePaymentLink(link.id, title); setEditing(false); })} className="rounded-md bg-gold p-1.5 text-navy2" aria-label="Save"><Check size={14} /></button>
              <button onClick={() => { setTitle(link.title); setEditing(false); }} className="rounded-md bg-white/10 p-1.5 text-white/80" aria-label="Cancel"><X size={14} /></button>
            </div>
          ) : (
            <p className="flex items-center gap-1.5 text-[14.5px] font-bold leading-snug">
              <span className="truncate">{link.title}</span>
              <BadgeCheck size={16} className="shrink-0 text-emerald-400" />
            </p>
          )}
          <p className="mt-1 flex items-center gap-2 text-[11px] text-white/60">
            <span className="flex items-center gap-1"><Eye size={12} /> {link.clicks} click{link.clicks === 1 ? "" : "s"}</span>
            <span>·</span>
            <span>{link.amount === null ? "Free amount" : `${fmtAmount(link.amount)} FCFA`}</span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[15px] font-extrabold leading-tight sm:text-[17px]">{fmtAmount(link.collected)} FCFA</p>
          <p className="text-[11px] text-white/55">{link.paymentsCount} pmt.</p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-t border-white/10 px-3 py-2">
        <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-white/70" title={url}>/pay/{link.slug.slice(0, 10)}…</span>
        {pending && <Loader2 size={15} className="animate-spin text-white/60" />}
        <button onClick={copy} title="Copy link" aria-label="Copy link" className="rounded-lg p-2 text-white/80 transition hover:bg-white/10"><Copy size={17} /></button>
        <button onClick={() => setQrOpen(true)} title="QR code" aria-label="QR code" className="rounded-lg p-2 text-white/80 transition hover:bg-white/10"><QrCode size={17} /></button>
        <button onClick={downloadQr} title="Download QR" aria-label="Download QR" className="rounded-lg p-2 text-white/80 transition hover:bg-white/10"><Download size={17} /></button>
        <button onClick={share} title="Share" aria-label="Share" className="rounded-lg p-2 text-white/80 transition hover:bg-white/10"><Share2 size={17} /></button>
        <button onClick={() => setEditing((v) => !v)} title="Rename" aria-label="Rename" className="rounded-lg p-2 text-white/80 transition hover:bg-white/10"><Pencil size={17} /></button>
        <button
          onClick={() => startTransition(() => togglePaymentLink(link.id))}
          title={link.active ? "Deactivate" : "Activate"} aria-label="Toggle link"
          className={`rounded-lg p-2 transition hover:bg-white/10 ${link.active ? "text-orange-400" : "text-white/50"}`}
        >
          <Power size={17} />
        </button>
        <button
          onClick={() => { if (confirm("Delete this payment link? This cannot be undone.")) startTransition(() => deletePaymentLink(link.id)); }}
          title="Delete" aria-label="Delete link"
          className="rounded-lg p-2 text-red-400 transition hover:bg-white/10"
        >
          <Trash2 size={17} />
        </button>
      </div>

      {qrOpen && <QrModal slug={link.slug} title={link.title} onClose={() => setQrOpen(false)} />}
    </div>
  );
}
