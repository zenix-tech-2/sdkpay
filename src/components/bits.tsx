"use client";

import { useState, useTransition } from "react";
import { Copy, Check, ChevronDown } from "lucide-react";

export function CopyButton({ text, className = "", label }: { text: string; className?: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={label ?? "Copy"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className={`inline-flex items-center justify-center rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 ${className}`}
    >
      {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
    </button>
  );
}

export function Toggle({ defaultChecked = false, onChange, accent = true }: { defaultChecked?: boolean; onChange?: (v: boolean) => void; accent?: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => {
        setOn(!on);
        onChange?.(!on);
      }}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${
        on ? (accent ? "bg-gold" : "bg-navy") : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

export function Accordion({
  title,
  icon,
  defaultOpen = false,
  right,
  children,
}: {
  title: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-slate-50">
        {icon && <span className="shrink-0">{icon}</span>}
        <span className="flex-1 font-semibold text-ink">{title}</span>
        {right}
        <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-slate-100 px-4 py-4">{children}</div>}
    </div>
  );
}

export function PendingButton({ label, pendingLabel }: { label: string; pendingLabel?: string }) {
  const [pending] = useTransition();
  return <span>{pending ? pendingLabel ?? label : label}</span>;
}
