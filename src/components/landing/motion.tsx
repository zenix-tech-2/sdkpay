"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

/* ---------- scroll-triggered reveal ---------- */
export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => { for (const e of entries) if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ ["--d" as string]: `${delay}ms` }}>{children}</div>;
}

/* ---------- animated counter ---------- */
export function Counter({ value, suffix = "", decimals = 0, duration = 1600 }: { value: number; suffix?: string; decimals?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) { setStarted(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(2, -6 * p);
      setDisplay(value * (p === 1 ? 1 : eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, value, duration]);

  return <span ref={ref}>{display.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

/* ---------- landing navigation ---------- */
const LINKS = [
  { href: "#services", label: "Services" },
  { href: "#coverage", label: "Coverage" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#developers", label: "Developers" },
];

export function LandingNav({ openAppHref, openAppLabel }: { openAppHref: string; openAppLabel: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-[#141B3D]/[0.07] bg-[#FBFBF9]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="SDK Pay" className="h-9 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-[13px] font-bold text-[#141B3D]/60 transition hover:text-[#141B3D]">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden h-10 items-center px-4 text-[13px] font-bold text-[#141B3D]/70 transition hover:text-[#141B3D] sm:flex">Sign in</Link>
          <Link href={openAppHref} className="group flex h-11 items-center gap-1.5 rounded-xl bg-[#141B3D] px-5 text-[13px] font-extrabold text-[#FFBD0D] shadow-[0_8px_24px_rgba(20,27,61,0.28)] transition hover:bg-[#1D2450] active:scale-[0.98]">
            {openAppLabel}<ArrowRight size={15} strokeWidth={2.6} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button onClick={() => setOpen(!open)} aria-label="Menu" className="rounded-xl border border-[#141B3D]/10 p-2 text-[#141B3D] md:hidden">{open ? <X size={19} /> : <Menu size={19} />}</button>
        </div>
      </div>
      {open && (
        <div className="border-t border-[#141B3D]/[0.07] bg-[#FBFBF9] px-4 pb-4 pt-2 md:hidden">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3.5 text-[15px] font-bold text-[#141B3D]/80 transition hover:bg-[#141B3D]/5">{l.label}</a>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3.5 text-[15px] font-extrabold text-[#141B3D]">Sign in</Link>
        </div>
      )}
    </header>
  );
}
