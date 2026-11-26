import Link from "next/link";

export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 64 50" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id="sdk-chain" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="48%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#22b8e6" />
        </linearGradient>
      </defs>
      <g transform="rotate(-38 32 25)" fill="none" stroke="url(#sdk-chain)" strokeWidth="8" strokeLinecap="round">
        <rect x="5" y="12" width="35" height="25" rx="12.5" />
        <rect x="24" y="12" width="35" height="25" rx="12.5" />
      </g>
    </svg>
  );
}

export function Logo({ size = "md", href = "/", light = false }: { size?: "sm" | "md" | "lg" | "xl"; href?: string; light?: boolean }) {
  const scale = { sm: [22, 13, 8], md: [28, 16, 9], lg: [34, 20, 11], xl: [58, 34, 18] }[size];
  return (
    <Link href={href} className="inline-flex items-center gap-1 select-none">
      <BrandMark size={scale[0]} />
      <span className="relative leading-none" style={{ fontSize: scale[1], fontWeight: 800, letterSpacing: "-0.045em", color: light ? "#fff" : "#12213d" }}>
        SDK
        <span className="absolute -bottom-[0.62em] right-[0.02em] font-extrabold tracking-normal" style={{ fontSize: scale[2], color: "#ffb800" }}>Pay</span>
      </span>
    </Link>
  );
}
