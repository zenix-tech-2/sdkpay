"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, CreditCard, Globe2, MapPin, Search, Sparkles, Wallet } from "lucide-react";
import { countryIcons, getCountryFlag, getProviderLogo, getRegionIcon, providerCatalog, regionIcons, resolveProvider } from "@/lib/icon-catalog";

type SizeProps = { size?: number; className?: string };

export function ProviderIcon({ name, size = 56, className = "" }: SizeProps & { name: string }) {
  const entry = resolveProvider(name);
  const [src, setSrc] = useState(entry?.logo ?? getProviderLogo(name));
  useEffect(() => { setSrc(entry?.logo ?? getProviderLogo(name)); }, [name]);
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[14px] shadow-[0_4px_14px_rgba(20,35,70,.10)] ${className}`} style={{ width: size, height: size, background: entry?.bg ?? "#1d2a77" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`${name} logo`} className="h-full w-full object-contain p-[8%]" onError={() => setSrc(entry?.fallback ?? "/logos/providers/generated/sdk-pay.svg")} />
    </span>
  );
}

export function CountryFlag({ code, size = 40, square = true, className = "" }: SizeProps & { code: string; square?: boolean }) {
  const [src, setSrc] = useState(getCountryFlag(code, square));
  useEffect(() => { setSrc(getCountryFlag(code, square)); }, [code, square]);
  return (
    <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e8edf6] bg-[#f1f4fa] ${className}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`${code} flag`} className={square ? "h-full w-full object-cover" : "h-full w-full object-cover"} onError={() => setSrc("/logos/providers/generated/sdk-pay.svg")} />
    </span>
  );
}

export function RegionIcon({ code, size = 48, className = "" }: SizeProps & { code: string }) {
  const [src, setSrc] = useState(getRegionIcon(code));
  useEffect(() => { setSrc(getRegionIcon(code)); }, [code]);
  return (
    <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-[#e8edf6] bg-white ${className}`} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`${code} region`} className="h-full w-full object-contain p-1" onError={() => setSrc("/logos/providers/generated/sdk-pay.svg")} />
    </span>
  );
}

const tabs = [
  { key: "providers", label: "Providers", icon: Sparkles },
  { key: "mobile_money", label: "Mobile Money", icon: Wallet },
  { key: "crypto", label: "Crypto", icon: CreditCard },
  { key: "cards", label: "Cards & Wallets", icon: CreditCard },
  { key: "countries", label: "Countries", icon: Globe2 },
  { key: "regions", label: "Provinces", icon: MapPin },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export function IconGallerySection() {
  const [tab, setTab] = useState<TabKey>("providers");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState("");

  const items = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (tab === "countries") return countryIcons.filter((item) => `${item.code} ${item.name}`.toLowerCase().includes(term)).map((item) => ({ key: item.code, title: item.name, subtitle: item.code, icon: item.icon, path: item.icon, kind: "country" as const, code: item.code }));
    if (tab === "regions") return regionIcons.filter((item) => `${item.code} ${item.name}`.toLowerCase().includes(term)).map((item) => ({ key: item.code, title: item.name, subtitle: item.code, icon: item.icon, path: item.icon, kind: "region" as const, code: item.code }));
    const categories = tab === "providers" ? ["mobile_money", "provider", "card", "wallet", "crypto"] : tab === "mobile_money" ? ["mobile_money"] : tab === "crypto" ? ["crypto"] : ["card", "wallet"];
    return providerCatalog.filter((item) => categories.includes(item.category) && `${item.name} ${item.aliases.join(" ")} ${item.countries.join(" ")}`.toLowerCase().includes(term)).map((item) => ({ key: item.slug, title: item.name, subtitle: `${item.category.replace("_", " ")} · ${item.countries.slice(0, 3).join(", ")}`, icon: item.logo, path: item.logo, kind: "provider" as const, code: item.name }));
  }, [tab, query]);

  function copy(path: string, key: string) {
    void navigator.clipboard?.writeText(path);
    setCopied(key);
    setTimeout(() => setCopied(""), 1600);
  }

  return (
    <div className="motion-fade mx-auto max-w-[980px]">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[12px] font-extrabold tracking-[.15em] text-[#8b96b0]">ASSET LIBRARY</p><h1 className="font-display mt-1 text-[31px] font-extrabold text-[#111b36] sm:text-[38px]">Icons &amp; providers</h1><p className="mt-2 text-[13px] text-[#6d7d9e]">Bundled locally from open-source repositories. {providerCatalog.length} provider marks, {countryIcons.length} country flags and {regionIcons.length} province/region flags.</p></div><a href="/logos/CREDITS.md" target="_blank" rel="noreferrer" className="rounded-[12px] border border-[#dce5f3] bg-white px-4 py-2.5 text-[12px] font-bold text-[#3c4966]">Credits</a></div>
      <div className="mt-6 flex flex-wrap gap-2">{tabs.map((item) => { const Icon = item.icon; return <button key={item.key} onClick={() => setTab(item.key)} className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12px] font-bold transition ${tab === item.key ? "border-[#ffb800] bg-[#fff5d9] text-[#b57d00]" : "border-[#dce5f3] bg-white text-[#5d6882] hover:-translate-y-0.5 hover:border-[#ffd66b]"}`}><Icon size={14} /> {item.label}</button>; })}</div>
      <div className="relative mt-4"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b96b0]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by provider, country, region or code..." className="h-[54px] w-full rounded-[14px] border border-[#dce5f3] bg-white pl-12 pr-4 text-[14px] outline-none focus:border-[#ffb800]" /></div>
      <p className="mt-4 text-[12px] font-semibold text-[#8b96b0]">{items.length} icons available</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item, index) => (
          <button key={item.key} onClick={() => copy(item.path, item.key)} className="motion-up hover-lift flex items-center gap-3 rounded-[16px] border border-[#e3e9f4] bg-white p-3 text-left" style={{ animationDelay: `${Math.min(index, 12) * 28}ms` }}>
            {item.kind === "country" ? <CountryFlag code={item.code} size={44} square /> : item.kind === "region" ? <RegionIcon code={item.code} size={44} /> : <ProviderIcon name={item.code} size={44} />}
            <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-extrabold text-[#17213d]">{item.title}</span><span className="block truncate text-[10px] text-[#8b96b0]">{item.subtitle}</span></span>
            <span className="text-[#8b96b0]">{copied === item.key ? <Check size={15} /> : <Copy size={15} />}</span>
          </button>
        ))}
      </div>
      {items.length === 0 && <p className="rounded-[16px] border border-[#e3e9f4] bg-white p-10 text-center text-[13px] text-[#8b96b0]">No icons match this search.</p>}
    </div>
  );
}
