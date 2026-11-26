"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronRight, Clock3, Copy, Link2, Plus, Search, Share2, ShieldCheck, Users, X } from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import { formatUsdt } from "@/lib/format";
import { walletCurrencies } from "@/lib/wallet-currencies";

function Skeleton() {
  return <div className="h-72 animate-pulse rounded-2xl bg-[#e6ecf7]" />;
}

export function MyAccountsSection() {
  const { data } = useDashboard();
  const [conversionOpen, setConversionOpen] = useState(false);
  const [convertAmount, setConvertAmount] = useState("1000");
  const [converted, setConverted] = useState(false);
  if (!data) return <Skeleton />;
  const wallets = data.wallets ?? [];

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[31px] font-extrabold text-[#111b36] sm:text-[38px]">My Accounts</h1>
        <Link href="/dashboard/accounts/add" className="flex h-[46px] items-center gap-2 rounded-[14px] border border-[#dce5f3] bg-white px-4 text-[14px] font-bold text-[#17213d]"><Plus size={18} /> Add account</Link>
      </div>

      <div className="mt-6 grid grid-cols-[1fr_1.15fr] gap-4 rounded-[20px] bg-[#1d2a77] px-5 py-6 text-white sm:px-7 sm:py-7">
        <div><p className="text-[16px] text-[#c3cdef]">Wallets</p><p className="font-display mt-2 text-[52px] font-extrabold leading-none">{wallets.length}</p><p className="mt-2 text-[16px] leading-tight text-[#c3cdef]">active<br />account{wallets.length === 1 ? "" : "s"}</p></div>
        <button onClick={() => setConversionOpen(true)} className="flex min-h-[110px] items-center gap-3 self-center rounded-[16px] border border-white/15 bg-[#263484] px-5 text-left text-[18px] font-bold text-[#8f9ed4]"><span className="text-[24px]">💱</span><span>Request<br />conversion</span></button>
      </div>

      <div className="mt-5 space-y-4">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="flex items-center gap-4 rounded-[18px] border border-[#dce5f3] bg-white px-4 py-4">
            <span className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-[#f1f4fa] text-[30px]">{wallet.flag}</span>
            <div><div className="flex flex-wrap items-center gap-2"><span className="text-[20px] font-extrabold text-[#17213d]">{wallet.currency}</span>{wallet.isPrimary && <span className="rounded-full bg-[#fff4d5] px-2.5 py-1 text-[11px] font-extrabold text-[#e5a300]">Primary</span>}</div><p className="mt-0.5 text-[13px] text-[#6d7d9e]">{wallet.countryName}</p></div>
            <div className="ml-auto text-right"><p className="text-[18px] font-extrabold text-[#17213d]">{wallet.currency === "USDT" ? `${formatUsdt(wallet.balance, 2)} USDT` : `${formatUsdt(wallet.balance, 2)} FCFA`}</p></div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff7e5] text-[20px]">👍</span>
          </div>
        ))}
      </div>

      <Link href="/dashboard/accounts/add" className="mt-5 flex items-center gap-4 rounded-[18px] border-2 border-dashed border-[#cbd6ea] bg-white/40 px-5 py-5 text-[17px] font-bold text-[#7c88a3]">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-[#aab7d0]"><Plus size={22} /></span>
        Add account
        <ChevronRight size={22} className="ml-auto" />
      </Link>

      {conversionOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" onClick={() => setConversionOpen(false)}>
          <div className="w-full max-w-[400px] rounded-[20px] bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h2 className="text-[20px] font-extrabold text-[#17213d]">💱 Request conversion</h2><button onClick={() => setConversionOpen(false)}><X size={19} /></button></div>
            <p className="mt-2 text-[13px] text-[#6d7d9e]">Convert your main XAF balance to other currencies.</p>
            <input type="number" value={convertAmount} onChange={(e) => setConvertAmount(e.target.value)} className="mt-4 h-[54px] w-full rounded-[12px] border border-[#dce5f3] px-4 text-[16px] outline-none focus:border-[#ffb800]" />
            <button onClick={() => setConverted(true)} className="brand-btn mt-4 h-[50px] w-full rounded-[12px] text-[15px]">Convert</button>
            {converted && <div className="mt-4 space-y-2 rounded-[12px] bg-[#f5f8ff] p-4 text-[13px] font-semibold text-[#25314d]">{[["EUR", 0.00152], ["USD", 0.00165], ["USDT", 0.00165]].map(([currency, rate]) => <div key={currency as string} className="flex justify-between"><span>{currency}</span><span>{((Number(convertAmount) || 0) * (rate as number)).toFixed(3)}</span></div>)}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export function AddAccountSection() {
  const router = useRouter();
  const { refresh } = useDashboard();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const filtered = useMemo(() => walletCurrencies.filter((item) => `${item.code} ${item.name}`.toLowerCase().includes(search.toLowerCase())), [search]);

  async function create() {
    if (!selected) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/wallets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currency: selected }) });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Impossible de créer le compte"); return; }
      await refresh();
      router.push("/dashboard/accounts");
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <Link href="/dashboard/accounts" className="flex items-center gap-2 text-[14px] font-semibold text-[#6d7d9e]"><ArrowLeft size={19} /> My Accounts</Link>
      <div className="mt-6 flex items-start gap-4">
        <span className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full bg-[#fff5d9] text-[#e5a300]"><Plus size={28} /></span>
        <div><h1 className="font-display text-[30px] font-extrabold text-[#111b36] sm:text-[36px]">Add account</h1><p className="mt-2 text-[15px] leading-relaxed text-[#6d7d9e]">Open a new account in another currency. The account will be initialized with a balance of 0.</p></div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[20px] border border-[#dce5f3] bg-white">
        <div className="p-4">
          <div className="relative"><Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8792ab]" /><input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search for a country or currency..." className="h-[60px] w-full rounded-[14px] border-2 border-[#ffb800] bg-white pl-12 pr-4 text-[16px] outline-none placeholder:text-[#9aa5bd]" /></div>
        </div>
        <div className="brand-scroll max-h-[520px] overflow-y-auto border-t border-[#e5ebf5]">
          {filtered.map((item) => (
            <button key={item.code} onClick={() => setSelected(item.code)} className={`flex w-full items-center gap-4 border-b border-[#edf1f8] px-5 py-4 text-left transition hover:bg-[#f8fbff] ${selected === item.code ? "bg-[#fffaf0]" : ""}`}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f1f4fa] text-[26px]">{item.flag}</span>
              <div><p className="text-[18px] font-extrabold text-[#17213d]">{item.code}</p><p className="text-[13px] text-[#6d7d9e]">{item.name}</p></div>
              <span className={`ml-auto flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 ${selected === item.code ? "border-[#ffb800] bg-[#ffb800]" : "border-[#dce5f3]"}`}>{selected === item.code && <Check size={15} className="text-white" />}</span>
            </button>
          ))}
          {filtered.length === 0 && <p className="py-10 text-center text-[14px] text-[#8b96b0]">No currency found</p>}
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-[#e5ebf5] p-4">
          <button onClick={() => router.push("/dashboard/accounts")} className="h-[56px] rounded-[14px] border border-[#dce5f3] bg-white text-[16px] font-bold text-[#25314d]">Cancel</button>
          <button onClick={() => void create()} disabled={!selected || busy} className={`h-[56px] rounded-[14px] text-[16px] font-extrabold text-white transition ${selected ? "brand-btn" : "cursor-not-allowed bg-[#f7d477]"}`}>{busy ? "..." : "Create"}</button>
        </div>
        {error && <p className="px-4 pb-4 text-[12px] font-semibold text-[#c83c3c]">{error}</p>}
      </div>
    </div>
  );
}

export function ReferralsPage() {
  const { data } = useDashboard();
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  if (!data) return <Skeleton />;
  const link = origin ? `${origin}/signup?ref=${data.user.referralCode}` : `https://www.sdkpay.com/reg/${data.user.referralCode}`;
  const networkCount = data.referrals?.length ?? 0;

  function copy() {
    void navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: "SDK Pay", text: "Join me on SDK Pay", url: link }); return; } catch { /* fall through */ }
    }
    copy();
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <h1 className="font-display text-[31px] font-extrabold text-[#111b36] sm:text-[38px]">Referrals &amp; earnings</h1>
      <div className="mt-5 rounded-[20px] border border-[#dce5f3] bg-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3"><p className="text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">YOUR PERSONAL LINK</p><span className="flex h-[58px] w-[58px] items-center justify-center rounded-[14px] bg-[#fff5d9] text-[#e5a300]"><Link2 size={26} /></span></div>
        <h2 className="font-display mt-3 text-[24px] font-extrabold leading-tight text-[#111b36]">One link, one invited<br />account.</h2>
        <div className="mt-5 truncate rounded-[14px] border border-[#dce5f3] bg-white px-4 py-4 text-[15px] text-[#25314d]">{link}</div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={copy} className="brand-btn flex h-[54px] items-center justify-center gap-2 rounded-[12px] text-[16px]">{copied ? <Check size={18} /> : <Copy size={18} />} Copy</button>
          <button onClick={() => void share()} className="flex h-[54px] items-center justify-center gap-2 rounded-[12px] border border-[#dce5f3] bg-white text-[16px] font-bold text-[#17213d]"><Share2 size={18} /> Share</button>
        </div>
      </div>

      <div className="mt-5 rounded-[20px] border border-[#dce5f3] bg-[#f7f9fd] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3"><p className="text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">REDUCED-FEE PERIOD</p><span className="flex h-[58px] w-[58px] items-center justify-center rounded-[14px] bg-[#fff5d9] text-[#e5a300]"><Clock3 size={26} /></span></div>
        <h2 className="font-display mt-3 text-[24px] font-extrabold text-[#111b36]">Not unlocked</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-[#6d7d9e]">The period starts when your invitee meets the requirements and their account is verified.</p>
        <div className="my-5 h-px bg-[#dce5f3]" />
        <p className="flex items-center gap-2 text-[13px] font-semibold text-[#5d6882]"><ShieldCheck size={17} className="text-[#6d7d9e]" /> Program duration: 5 days</p>
      </div>

      <div className="mt-5 overflow-hidden rounded-[20px] border border-[#dce5f3] bg-white">
        <div className="p-5 sm:p-6"><p className="text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">YOUR NETWORK</p><h2 className="font-display mt-2 text-[24px] font-extrabold text-[#111b36]">Invited people</h2><p className="mt-2 text-[14px] text-[#6d7d9e]">{networkCount} associated accounts</p></div>
        <div className="border-t border-[#e5ebf5] px-5 py-10 text-center">
          {networkCount === 0 ? (
            <><span className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-[18px] bg-[#fff5d9] text-[#e5a300]"><Users size={34} /></span><p className="mt-5 text-[17px] font-extrabold text-[#111b36]">Your network starts here</p></>
          ) : (
            <div className="space-y-3">{data.referrals.map((person) => <div key={person.id} className="flex items-center justify-between rounded-[12px] bg-[#f7f9fd] px-4 py-3 text-[13px]"><span className="font-bold text-[#25314d]">🙂 {person.fullName}</span><span className="text-[#8b96b0]">{new Date(person.createdAt).toLocaleDateString()}</span></div>)}</div>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-[20px] border border-[#dce5f3] bg-white p-5 sm:p-6">
        <h2 className="font-display text-[22px] font-extrabold text-[#111b36]">Get 50% off your fees for 5 days!</h2>
        <p className="mt-4 text-[14px] leading-relaxed text-[#6d7d9e]">Get a 50% discount on fees for each eligible Mobile Money deposit and withdrawal for 5 days.</p>
        <p className="mt-4 text-[14px] leading-relaxed text-[#6d7d9e]">This offer applies only to eligible Mobile Money transactions. It reduces transaction fees; it is not a cash payment. USDT transactions are not included.</p>
      </div>
    </div>
  );
}
