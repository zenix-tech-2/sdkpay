"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function FilterSelect({
  param,
  value,
  options,
  className = "",
}: {
  param: string;
  value: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  return (
    <div className={`relative ${className}`}>
      <select
        defaultValue={value}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.value) params.set(param, e.target.value);
          else params.delete(param);
          router.push(`?${params.toString()}`);
        }}
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-9 text-[13.5px] font-semibold text-slate-700 shadow-sm outline-none transition focus:border-gold"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </div>
  );
}
