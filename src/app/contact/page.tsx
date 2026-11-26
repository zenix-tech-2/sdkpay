"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import Logo from "@/components/Logo";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  return (
    <div className="min-h-screen bg-[#eef3f8]">
      <div className="h-14 bg-[#f6b800]" />
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <div className="flex items-center justify-between pt-5">
          <Logo />
          <Link href="/" className="flex items-center gap-1 text-[10.5px] font-bold text-slate-500 hover:text-slate-800">
            <ArrowLeft size={11.7} /> Accueil
          </Link>
        </div>

        <h1 className="mt-8 text-center text-[24px] font-extrabold tracking-tight">Contact</h1>
        <p className="mt-1 text-center text-[11px] font-medium text-slate-500">Notre équipe répond en moins de 24h, 7j/7</p>

        <div className="mt-8 grid sm:grid-cols-3 gap-3">
          {[
            { icon: Mail, t: "Email", v: "support@sdkpay.com" },
            { icon: Phone, t: "Téléphone", v: "+237 6 83 67 78 72" },
            { icon: MapPin, t: "Adresse", v: "Douala, Cameroun" },
          ].map((c) => (
            <div key={c.t} className="rounded-3xl border border-slate-200 bg-white p-5 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                <c.icon size={15.3} />
              </span>
              <p className="mt-2 text-[10px] font-extrabold text-slate-400">{c.t}</p>
              <p className="text-[11px] font-extrabold">{c.v}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[26px] border border-slate-200 bg-white p-6 sm:p-8 shadow-xl">
          {sent ? (
            <div className="py-8 text-center">
              <CheckCircle2 size={44.1} className="mx-auto text-green-500" />
              <h2 className="mt-3 text-[16px] font-extrabold">Message envoyé !</h2>
              <p className="mt-1 text-[11px] font-medium text-slate-500">Merci {form.name || ""}, notre équipe vous répondra très vite.</p>
              <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }} className="mt-4 rounded-full bg-slate-900 px-6 py-2.5 text-[11px] font-extrabold text-white">
                Nouveau message
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-3">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Votre nom" className="rounded-2xl border border-slate-200 px-4 py-3.5 text-[11px] font-bold focus:border-yellow-500" />
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Votre email" className="rounded-2xl border border-slate-200 px-4 py-3.5 text-[11px] font-bold focus:border-yellow-500" />
              </div>
              <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Sujet : ex. Problème de retrait" className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-[11px] font-bold focus:border-yellow-500" />
              <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Décrivez votre besoin..." rows={5} className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-[11px] font-medium focus:border-yellow-500" />
              <button className="flex w-full items-center justify-center gap-2 rounded-full bg-yellow-400 py-4 text-[11.5px] font-extrabold hover:bg-yellow-300">
                <Send size={13.5} /> Envoyer le message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
