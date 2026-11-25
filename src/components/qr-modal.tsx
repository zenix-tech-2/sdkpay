"use client";

import { useEffect, useState } from "react";
import { toDataURL } from "qrcode";
import { X, Loader2, Copy } from "lucide-react";

export default function QrModal({ slug, title, onClose }: { slug: string; title: string; onClose: () => void }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const url = typeof window !== "undefined" ? `${window.location.origin}/pay/${slug}` : `https://sdkpay.com/pay/${slug}`;

  useEffect(() => {
    toDataURL(url, { width: 320, margin: 1, color: { dark: "#0E1A38", light: "#ffffff" } })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [url]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-navy2/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 pb-8 shadow-2xl sm:rounded-3xl">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 text-red-500 transition hover:scale-110">
          <X size={26} strokeWidth={2.5} />
        </button>
        <h3 className="text-[20px] font-extrabold text-ink">QR Code</h3>
        <p className="mt-1 text-[13px] text-slate-500">Scan this code to access the payment link</p>
        <div className="mt-5 flex justify-center">
          {dataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={dataUrl} alt={`QR code for ${title}`} className="h-56 w-56 rounded-2xl border border-slate-100 p-2 shadow-sm" />
          ) : (
            <div className="flex h-56 w-56 items-center justify-center rounded-2xl border border-slate-100"><Loader2 className="animate-spin text-slate-300" size={36} /></div>
          )}
        </div>
        <p className="mt-4 break-all text-center font-mono text-[13px] font-semibold text-slate-500">{url}</p>
        <button
          onClick={() => navigator.clipboard.writeText(url)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold to-gold2 py-3.5 text-[15px] font-extrabold text-navy2 shadow-md transition hover:brightness-105"
        >
          <Copy size={18} /> Copy link
        </button>
      </div>
    </div>
  );
}
