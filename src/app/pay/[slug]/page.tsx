"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, Loader2, ArrowLeft, FileText, ExternalLink, Clock } from "lucide-react";
import Logo from "@/components/Logo";
import { OperatorSelect } from "@/components/dashboard/WalletForm";

interface LinkData {
  link: {
    title: string;
    slug: string;
    amount: number | null;
    currency: string;
    description: string | null;
    isActive: boolean;
    totalCollected: number;
    paymentsCount: number;
    imageUrl: string | null;
    redirectUrl: string | null;
    expiresAt: string | null;
  };
  merchant: { fullName: string; username: string } | null;
  expired: boolean;
}

export default function PayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<LinkData | null>(null);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [operator, setOperator] = useState("MTN MoMo");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [payErr, setPayErr] = useState("");
  const [done, setDone] = useState<{ reference: string; amount: number; pdfUrl: string | null; redirectUrl: string | null } | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    fetch(`/api/pay/${slug}`)
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) setError(d.error || "Lien introuvable.");
        else setData(d);
      })
      .catch(() => setError("Erreur réseau."));
  }, [slug]);

  useEffect(() => {
    if (done?.redirectUrl) {
      setCountdown(8);
      const id = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(id);
            window.location.href = done.redirectUrl!;
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(id);
    }
  }, [done]);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setPayErr("");
    setLoading(true);
    try {
      const r = await fetch(`/api/pay/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: data?.link.amount ?? Number(amount), operator, phone, name }),
      });
      const d = await r.json();
      if (!r.ok) {
        setPayErr(d.error);
        return;
      }
      setDone(d);
    } catch {
      setPayErr("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  const finalAmount = data?.link.amount ?? Number(amount || 0);
  const disabled = !data?.link.isActive || data?.expired;

  return (
    <div className="min-h-screen bg-[#eef3f8]">
      <div className="h-14 bg-[#f6b800]" />
      <div className="mx-auto max-w-lg px-4 pb-16">
        <div className="flex items-center justify-between pt-5">
          <Logo />
          <Link href="/" className="flex items-center gap-1 text-[11.5px] font-bold text-slate-500 hover:text-slate-800">
            <ArrowLeft size={13} /> Accueil
          </Link>
        </div>

        {error && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-[35px]">🔗</p>
            <h1 className="mt-3 text-[16.5px] font-extrabold">{error}</h1>
            <p className="mt-1 text-[11.5px] font-medium text-slate-500">Vérifiez le lien avec le marchand.</p>
            <Link href="/" className="mt-4 inline-block rounded-full bg-yellow-400 px-6 py-3 text-[12px] font-extrabold">
              Découvrir SDK Pay
            </Link>
          </div>
        )}

        {!error && !data && (
          <div className="mt-8 rounded-3xl bg-white p-10 text-center text-[12.5px] font-bold text-slate-400">
            Chargement du lien de paiement...
          </div>
        )}

        {data && !done && (
          <div className="mt-6 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-xl">
            {data.link.imageUrl && (
              <img src={data.link.imageUrl} alt={data.link.title} className="h-52 w-full object-cover" />
            )}
            <div className="bg-[#23207e] p-6 text-white text-center">
              <p className="text-[10.5px] font-bold text-white/60">MARCHAND</p>
              <p className="text-[15px] font-extrabold">{data.merchant?.fullName ?? "Marchand SDK Pay"}</p>
              <p className="mt-3 text-[10.5px] font-bold text-white/60">{data.link.title}</p>
              {data.link.amount ? (
                <p className="mt-1 text-[35px] font-extrabold tracking-tight">
                  {data.link.amount.toLocaleString("fr-FR")} <span className="text-[16px] text-yellow-400">{data.link.currency}</span>
                </p>
              ) : (
                <div className="mx-auto mt-2 max-w-[220px]">
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    min={100}
                    placeholder="Montant"
                    className="w-full rounded-2xl bg-white/10 px-4 py-3 text-center text-[21px] font-extrabold placeholder:text-white/30 placeholder:text-[13px] focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <p className="mt-1 text-[10.5px] font-bold text-white/50">Montant libre • min. 100 {data.link.currency}</p>
                </div>
              )}
              {data.link.description && <p className="mt-2 text-[11px] font-medium text-white/60">{data.link.description}</p>}
              <p className="mt-2 text-[10px] font-bold text-white/40">
                {data.link.paymentsCount} paiement(s) • {data.link.totalCollected.toLocaleString("fr-FR")} {data.link.currency} collectés
              </p>
            </div>

            <form onSubmit={pay} className="space-y-4 p-6">
              {payErr && <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-[11.5px] font-bold text-red-600">{payErr}</p>}
              {!data.link.isActive && (
                <p className="rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-2.5 text-[11.5px] font-bold text-yellow-700">
                  Ce lien est actuellement désactivé par le marchand.
                </p>
              )}
              {data.expired && (
                <p className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-[11.5px] font-bold text-red-600">
                  <Clock size={14} /> Ce lien a expiré.
                </p>
              )}
              <div>
                <p className="mb-2 text-[11.5px] font-extrabold">Votre nom</p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex. Amina Diallo"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-[12.5px] font-bold focus:border-yellow-500"
                />
              </div>
              <div>
                <p className="mb-2 text-[11.5px] font-extrabold">Moyen de paiement</p>
                <OperatorSelect value={operator} onChange={setOperator} />
              </div>
              <div>
                <p className="mb-2 text-[11.5px] font-extrabold">Numéro {operator.includes("VISA") ? "de carte" : "Mobile Money"}</p>
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex. 237 6 XX XX XX XX"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-[12.5px] font-bold focus:border-yellow-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || disabled}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-yellow-400 py-4 text-[13.5px] font-extrabold shadow-lg shadow-yellow-400/30 hover:bg-yellow-300 disabled:opacity-50"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Paiement en cours..." : `Payer ${finalAmount.toLocaleString("fr-FR")} ${data.link.currency}`}
              </button>
              <p className="flex items-center justify-center gap-1.5 text-center text-[10px] font-bold text-slate-400">
                <ShieldCheck size={12} className="text-green-500" /> Paiement sécurisé SSL • Propulsé par SDK Pay
              </p>
              <p className="text-center text-[10px] font-medium text-slate-400">Mode démo : aucun débit réel ne sera effectué.</p>
            </form>
          </div>
        )}

        {done && (
          <div className="mt-6 rounded-[26px] border border-green-200 bg-white p-8 text-center shadow-xl">
            <CheckCircle2 size={56} className="mx-auto text-green-500" />
            <h1 className="mt-4 text-[19.5px] font-extrabold">Paiement réussi !</h1>
            <p className="mt-1 text-[12.5px] font-semibold text-slate-500">
              {done.amount.toLocaleString("fr-FR")} {data?.link.currency} payés à {data?.merchant?.fullName}.
            </p>
            <p className="mt-3 inline-block rounded-full bg-slate-100 px-4 py-2 font-mono text-[11px] font-bold">Réf : {done.reference}</p>
            {done.pdfUrl && (
              <a
                href={done.pdfUrl}
                target="_blank"
                className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-blue-50 border border-blue-200 px-4 py-3.5 text-[12.5px] font-extrabold text-blue-700 hover:bg-blue-100"
              >
                <FileText size={16} /> Télécharger votre fichier / reçu (PDF)
              </a>
            )}
            {done.redirectUrl && (
              <a
                href={done.redirectUrl}
                className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-[12.5px] font-extrabold text-white hover:bg-slate-800"
              >
                <ExternalLink size={15} /> Continuer vers le site marchand {countdown > 0 && `(${countdown}s)`}
              </a>
            )}
            <div className="mt-5">
              <Link href="/" className="inline-block rounded-full bg-yellow-400 px-6 py-3 text-[12px] font-extrabold">
                Créer mon propre lien SDK Pay
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
