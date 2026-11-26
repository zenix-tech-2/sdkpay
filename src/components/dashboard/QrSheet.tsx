"use client";

import { useEffect, useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { qrDataUrl } from "@/lib/qr";

export default function QrSheet({ url, onClose }: { url: string; onClose: () => void }) {
  const [img, setImg] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    qrDataUrl(url, 640).then(setImg).catch(() => {});
  }, [url]);

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-[28px] sm:rounded-[28px] bg-white px-6 pt-3 pb-6 shadow-2xl sheet-up">
        <div className="mx-auto h-1.5 w-16 rounded-full bg-slate-100" />
        <button onClick={onClose} className="absolute right-5 top-5 text-red-500" aria-label="close">
          <X size={20.7} strokeWidth={3} />
        </button>
        <h3 className="mt-3 text-[19px] font-extrabold tracking-tight text-slate-900">QR Code</h3>
        <p className="mt-0.5 text-[11.5px] font-medium text-slate-500">Scan this code to access the payment link</p>
        <div className="mx-auto mt-5 max-w-[340px]">
          {img ? (
            <img src={img} alt="QR code" className="w-full rounded-xl" />
          ) : (
            <div className="aspect-square w-full animate-pulse rounded-xl bg-slate-100" />
          )}
        </div>
        <p className="mt-4 break-all text-center text-[11.5px] font-medium text-slate-500">{url}</p>
        <button
          onClick={copy}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f0a500] py-4 text-[13.5px] font-extrabold text-white hover:bg-[#d89400]"
        >
          {copied ? <Check size={16.2} /> : <Copy size={16.2} />} {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
