import Link from "next/link";

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <path
        d="M24.5 6.5 12 19c-2.6 2.6-2.6 6.9 0 9.5l1.8 1.8c2.6 2.6 6.9 2.6 9.5 0l3.2-3.2"
        stroke="url(#g1)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M15.5 33.5 28 21c2.6-2.6 2.6-6.9 0-9.5L26.2 9.7c-2.6-2.6-6.9-2.6-9.5 0l-3.2 3.2"
        stroke="url(#g2)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="g1" x1="8" y1="8" x2="30" y2="32">
          <stop stopColor="#d946ef" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="g2" x1="32" y1="8" x2="10" y2="30">
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-1.5 shrink-0">
      <LogoMark />
      <span className="leading-none">
        <span className={`block text-[16.5px] font-extrabold tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
          SDK<span className="text-sky-500">Pay</span>
        </span>
        <span className="block text-[10px] font-bold tracking-[0.18em] text-yellow-500 -mt-0.5 ml-[1px]">
          PAY
        </span>
      </span>
    </Link>
  );
}

export function LogoLarge() {
  return (
    <div className="flex items-center justify-center gap-1">
      <LogoMark size={46} />
      <span className="leading-none text-left">
        <span className="block text-[30px] font-extrabold tracking-tight text-slate-900">
          SDK<span className="text-sky-400">Pay</span>
        </span>
        <span className="block text-right text-[14px] font-extrabold text-yellow-400 -mt-1">Pay</span>
      </span>
    </div>
  );
}
