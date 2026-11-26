"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Check, CheckCircle2, Copy, Download, ExternalLink, Eye, Pencil, Plus, Power, QrCode, Trash2, X } from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import { formatNumber } from "@/lib/format";
import type { DashboardLink } from "@/lib/dashboard-types";

export function MyLinksSection() {
  const { data, refresh, t } = useDashboard();
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState("");
  const [qrLink, setQrLink] = useState<DashboardLink | null>(null);

  useEffect(() => setOrigin(window.location.origin), []);

  if (!data) return <div className="h-72 animate-pulse rounded-2xl bg-[#e6ecf7]" />;

  const urlFor = (link: DashboardLink) => `${origin || "https://www.sdkpay.com"}/pay/${link.slug}`;

  function copy(text: string, key: string) {
    void navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1800);
  }

  async function toggle(link: DashboardLink) {
    await fetch(`/api/links/${link.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: link.status === "active" ? "disabled" : "active" }) });
    await refresh();
  }

  async function remove(link: DashboardLink) {
    if (!window.confirm(`${t("Supprimer le lien", "Delete link")} "${link.title}" ?`)) return;
    await fetch(`/api/links/${link.id}`, { method: "DELETE" });
    await refresh();
  }

  function downloadQr(link: DashboardLink) {
    setQrLink(link);
    setTimeout(() => {
      const svg = document.querySelector("#sdk-qr-wrap svg");
      if (!svg) return;
      const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `sdkpay-qr-${link.slug}.svg`;
      anchor.click();
      URL.revokeObjectURL(url);
    }, 120);
  }

  return (
    <div>
      <h1 className="font-display text-[31px] font-extrabold text-[#111b36] sm:text-[38px]">My payment links</h1>
      <button onClick={() => router.push("/dashboard/links/new")} className="brand-btn mt-5 flex h-[62px] w-full items-center justify-center gap-2 rounded-[16px] text-[18px] shadow-[0_8px_20px_rgba(255,184,0,.18)]">
        <Plus size={22} strokeWidth={2.5} /> New link
      </button>

      <h2 className="mt-7 text-[12px] font-extrabold tracking-[.16em] text-[#8b96b0]">RECENT LINKS</h2>
      <div className="mt-4 space-y-4">
        {data.links.length === 0 && <div className="rounded-2xl border border-[#e3e9f4] bg-white p-10 text-center text-[13px] text-[#8b96b0]">{t("Aucun lien. Créez votre premier lien de paiement.", "No links yet. Create your first payment link.")}</div>}
        {data.links.map((link) => {
          const payments = data.transactions.filter((tx) => tx.linkId === link.id && tx.direction === "in" && tx.status === "completed");
          const collected = payments.reduce((sum, tx) => sum + tx.amount, 0);
          const url = urlFor(link);
          return (
            <div key={link.id} className="rounded-[18px] bg-[#1d2a77] px-4 py-4 text-white shadow-[0_8px_24px_rgba(29,42,119,.12)] sm:px-5">
              <div className="flex items-start gap-3">
                <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#30409a] text-[27px]">
                  {link.imageUrl ? <img src={link.imageUrl} alt="" className="h-full w-full object-cover" /> : (link.iconEmoji || "🔗")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><p className="truncate text-[17px] font-bold">{link.title}</p><CheckCircle2 size={17} className="shrink-0 text-[#20c997]" /></div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#bcc7ee]">
                    <span className="flex items-center gap-1"><Eye size={13} /> {link.views} clicks</span>
                    <span>{link.freeAmount ? "Free amount" : `${formatNumber(link.amount)} FCFA`}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right"><p className="text-[17px] font-extrabold">{formatNumber(collected)} FCFA</p><p className="mt-1 text-[11px] text-[#bcc7ee]">{payments.length} pmt.</p></div>
              </div>
              <div className="my-3 h-px bg-white/20" />
              <div className="brand-scroll flex items-center gap-3 overflow-x-auto pb-1 sm:gap-4">
                <span className="min-w-0 flex-1 truncate text-[14px] text-[#cbd4f2]">/pay/{link.slug.length > 7 ? `${link.slug.slice(0, 7)}...` : link.slug}</span>
                <button onClick={() => copy(url, `copy-${link.id}`)} title="Copy" className="shrink-0 text-[#dbe3fa] hover:text-white">{copied === `copy-${link.id}` ? <Check size={19} /> : <Copy size={19} />}</button>
                <button onClick={() => setQrLink(link)} title="QR Code" className="shrink-0 text-[#dbe3fa] hover:text-white"><QrCode size={19} /></button>
                <button onClick={() => downloadQr(link)} title="Download" className="shrink-0 text-[#dbe3fa] hover:text-white"><Download size={19} /></button>
                <Link href={`/pay/${link.slug}`} target="_blank" title="Open" className="shrink-0 text-[#dbe3fa] hover:text-white"><ExternalLink size={19} /></Link>
                <button onClick={() => router.push(`/dashboard/links/new?edit=${link.id}`)} title="Edit" className="shrink-0 text-[#dbe3fa] hover:text-white"><Pencil size={19} /></button>
                <button onClick={() => void toggle(link)} title={link.status === "active" ? "Disable" : "Enable"} className="shrink-0 text-[#ff9b2f] hover:text-[#ffc233]"><Power size={19} /></button>
                <button onClick={() => void remove(link)} title="Delete" className="shrink-0 text-[#ff5f6d] hover:text-[#ff8a94]"><Trash2 size={19} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {qrLink && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45" onClick={() => setQrLink(null)}>
          <div className="animate-pop w-full max-w-[560px] rounded-t-[26px] bg-white px-6 pb-7 pt-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-5 h-[5px] w-[54px] rounded-full bg-[#dfe5f0]" />
            <div className="flex items-start justify-between"><h3 className="font-display text-[22px] font-extrabold text-[#111b36]">QR Code</h3><button onClick={() => setQrLink(null)} className="text-[#ff4d5e]"><X size={24} /></button></div>
            <p className="mt-1 text-[13px] text-[#607095]">Scan this code to access the payment link</p>
            <div id="sdk-qr-wrap" className="my-6 flex justify-center"><QRCodeSVG value={urlFor(qrLink)} size={230} bgColor="#ffffff" fgColor="#000000" level="M" /></div>
            <p className="break-all text-center text-[13px] text-[#607095]">{urlFor(qrLink)}</p>
            <button onClick={() => copy(urlFor(qrLink), "qr")} className="brand-btn mt-5 flex h-[54px] w-full items-center justify-center gap-2 rounded-xl text-[16px]">{copied === "qr" ? <Check size={18} /> : <Copy size={18} />} Copy link</button>
          </div>
        </div>
      )}
    </div>
  );
}
