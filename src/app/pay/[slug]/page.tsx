"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, ChevronDown, Lock, Phone, ShieldCheck, UserRound } from "lucide-react";
import { Logo } from "@/components/Logo";
import { countries } from "@/lib/countries";
import { formatNumber } from "@/lib/format";

type LinkData = {
  link: {
    id: number;
    title: string;
    description: string;
    amount: number;
    currency: string;
    status: string;
    slug: string;
    freeAmount: boolean;
    pdfUrl: string;
    imageUrl: string;
    redirectUrl: string;
    expiryDate: string;
  };
  merchant: { fullName: string; username: string; countryCode: string };
};

export default function CheckoutPage() {
  const params = useParams();
  const slug = String(params?.slug ?? "");
  const [data, setData] = useState<LinkData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [payerName, setPayerName] = useState("");
  const [operator, setOperator] = useState("MTN Money");
  const [countryCode, setCountryCode] = useState("CM");
  const [customAmount, setCustomAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ reference: string; amount: number; title: string; redirectUrl?: string; pdfUrl?: string } | null>(null);

  useEffect(() => {
    fetch(`/api/pay/${slug}`, { cache: "no-store" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Lien introuvable");
        setData(json);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  async function pay(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true); setError("");
    const res = await fetch(`/api/pay/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, payerName, operator, countryCode, countryName: countries.find((item) => item.code === countryCode)?.name ?? "Cameroun", amount: customAmount }),
    });
    const json = await res.json();
    if (res.ok) setSuccess(json);
    else setError(json.error ?? "Paiement impossible");
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-[#f4f8ff]">
      <div className="h-8 bg-[#ffb800]" />
      <div className="mx-auto max-w-[520px] px-4 pb-16 pt-9">
        <div className="flex justify-center"><Logo size="lg" /></div>
        <p className="mt-8 text-center text-[12px] font-semibold text-[#7c87a1]">Paiement sécurisé · SDK Pay Checkout</p>

        {loading && <div className="mt-8 h-64 animate-pulse rounded-2xl bg-[#e6ecf7]" />}
        {error && !success && <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow-sm"><p className="text-[15px] font-bold text-[#c83c3c]">{error}</p><Link href="/" className="mt-4 inline-block text-[12px] font-bold text-[#e5a300]">Retour à l&apos;accueil</Link></div>}

        {data && !success && (
          <div className="mt-7 overflow-hidden rounded-[20px] border border-[#e7edf8] bg-white shadow-[0_14px_40px_rgba(25,40,85,.06)]">
            <div className="bg-[#1d2a77] px-6 py-7 text-center text-white">
              {data.link.imageUrl && <img src={data.link.imageUrl} alt="" className="mx-auto mb-3 h-14 w-14 rounded-xl object-cover" />}
              <p className="text-[12px] text-[#c3cdef]">{data.merchant.fullName}</p>
              <h1 className="font-display mt-2 text-[22px] font-extrabold">{data.link.title}</h1>
              <p className="font-display mt-4 text-[38px] font-extrabold">{data.link.freeAmount ? "Montant libre" : `${formatNumber(data.link.amount)} FCFA`}</p>
            </div>
            <form onSubmit={pay} className="space-y-4 p-6">
              {data.link.description && <p className="rounded-xl bg-[#f5f8ff] p-3 text-[12px] leading-relaxed text-[#5d6882]">{data.link.description}</p>}
              {data.link.freeAmount && <div><label className="label">Montant à payer (FCFA) *</label><input required type="number" min={100} value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} placeholder="2500" className="field pl-4" /></div>}
              <div><label className="label">Votre nom</label><div className="relative"><UserRound size={18} className="field-icon" /><input value={payerName} onChange={(e) => setPayerName(e.target.value)} placeholder="Jean Dupont" className="field" /></div></div>
              <div><label className="label">Opérateur Mobile Money</label><div className="relative"><select value={operator} onChange={(e) => setOperator(e.target.value)} className="field appearance-none pr-10">{["MTN Money", "Orange Money", "Airtel Money", "Wave", "Moov Money", "M-Pesa", "Free Money"].map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7d8aa9]" /></div></div>
              <div><label className="label">Pays</label><div className="relative"><select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="field appearance-none pr-10">{countries.map((country) => <option key={country.code} value={country.code}>{country.flag} {country.name}</option>)}</select><ChevronDown size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7d8aa9]" /></div></div>
              <div><label className="label">Numéro de téléphone</label><div className="relative"><Phone size={18} className="field-icon" /><input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+237 6XX XXX XXX" className="field" /></div></div>
              {error && <p className="rounded-lg bg-[#fff0f0] px-3 py-2 text-[12px] font-semibold text-[#c83c3c]">{error}</p>}
              <button disabled={submitting || data.link.status !== "active" || (!!data.link.expiryDate && Date.parse(data.link.expiryDate) < Date.now())} className="brand-btn h-[54px] w-full rounded-xl text-[15px] disabled:opacity-60">
                {submitting ? "Traitement du paiement..." : data.link.freeAmount ? "Payer" : `Payer ${formatNumber(data.link.amount)} FCFA`}
              </button>
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#8b96b0]"><Lock size={12} /> Paiement chiffré et sécurisé par SDK Pay</p>
            </form>
          </div>
        )}

        {success && (
          <div className="mt-8 rounded-[20px] border border-[#e7edf8] bg-white p-8 text-center shadow-[0_14px_40px_rgba(25,40,85,.06)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e3f6eb] text-[#2e9e63]"><Check size={34} /></div>
            <h1 className="font-display mt-5 text-[24px] font-extrabold text-[#17213d]">Paiement confirmé !</h1>
            <p className="mt-2 text-[13px] text-[#6c7892]">{formatNumber(success.amount)} FCFA payés pour {success.title}.</p>
            <p className="mt-4 rounded-lg bg-[#f5f8ff] px-3 py-2.5 text-[11px] font-semibold text-[#3c4966]">Référence : {success.reference}</p>
            {success.pdfUrl && <a href={success.pdfUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[12px] font-bold text-[#e5a300]">📄 Télécharger votre document PDF</a>}
            {success.redirectUrl && <a href={success.redirectUrl} className="brand-btn mt-5 block rounded-xl px-6 py-3 text-[13px]">Continuer vers le site marchand</a>}
            <Link href="/" className="mt-4 inline-block text-[12px] font-bold text-[#7c87a1]">Retour à l&apos;accueil</Link>
          </div>
        )}

        <div className="mt-7 flex items-center justify-center gap-2 text-[11px] text-[#8b96b0]"><ShieldCheck size={14} /> Transactions protégées · SSL · Monitoring anti-fraude</div>
      </div>
    </main>
  );
}
