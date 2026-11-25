"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Check, Image as ImageIcon, CircleDollarSign, Globe, Eye, Upload, X, Search, FileText, SlidersHorizontal, Info, CalendarDays, ExternalLink, Link2, CheckCircle2 } from "lucide-react";
import { createPaymentLink } from "@/lib/actions";
import { WALLET_OPTIONS, flagUrl } from "@/lib/countries";

const STEPS = [
  { n: 1, title: "Basic information", subtitle: "Name, description and visual for your link", icon: ImageIcon },
  { n: 2, title: "Amount & Type", subtitle: "Define the amount and payment mode", icon: CircleDollarSign },
  { n: 3, title: "Allowed countries", subtitle: "Control which countries payments are accepted from", icon: Globe },
  { n: 4, title: "Review & publish", subtitle: "Check everything before your link goes live", icon: Eye },
];

export default function Wizard() {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fixedAmount, setFixedAmount] = useState(true);
  const [amount, setAmount] = useState("");
  const [currency] = useState("XAF");
  const [pdfUrl, setPdfUrl] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]); // empty = all
  const [slug, setSlug] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");

  const filteredCountries = useMemo(
    () => WALLET_OPTIONS.filter((c) => c.name.toLowerCase().includes(countryQuery.toLowerCase()) || c.currency.toLowerCase().includes(countryQuery.toLowerCase())),
    [countryQuery]
  );

  const canContinue = step === 1 ? title.trim().length > 0 : step === 2 ? (!fixedAmount || Number(amount) > 0) : true;
  const current = STEPS[step - 1];
  const StepIcon = current.icon;

  const toggleCountry = (cur: string) =>
    setSelected((s) => (s.includes(cur) ? s.filter((c) => c !== cur) : [...s, cur]));

  return (
    <form action={createPaymentLink}>
      {/* hidden payload */}
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="amount" value={fixedAmount ? amount : ""} />
      <input type="hidden" name="currency" value={currency} />
      <input type="hidden" name="pdfUrl" value={pdfUrl} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="expiresAt" value={expiresAt} />
      <input type="hidden" name="redirectUrl" value={redirectUrl} />

      {/* stepper */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Step {step} of 4</p>
            <p className="mt-0.5 text-[16px] font-bold text-ink">{current.title}</p>
          </div>
          <span className="text-[13px] font-extrabold text-navy2">{step * 25}%</span>
        </div>
        <div className="mt-3 flex items-center">
          {STEPS.map((s, i) => {
            const done = s.n < step;
            const activeStep = s.n === step;
            const Icon = s.icon;
            return (
              <div key={s.n} className="flex flex-1 items-center last:flex-none">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${done || activeStep ? "bg-navy text-white" : "bg-slate-100 text-slate-400"}`}>
                  {done ? <Check size={19} strokeWidth={3} /> : <Icon size={19} />}
                </span>
                {i < STEPS.length - 1 && <span className={`mx-1 h-[3px] flex-1 rounded-full ${s.n < step ? "bg-navy" : "bg-slate-100"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* panel */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-start gap-4 border-b border-slate-100 p-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-gold2"><StepIcon size={26} /></span>
          <span>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Step {step}</span>
            <span className="mt-0.5 block text-[17px] font-extrabold text-ink">{current.title}</span>
            <span className="mt-0.5 block text-[12.5px] text-slate-500">{current.subtitle}</span>
          </span>
        </div>

        <div className="p-5">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label htmlFor="title" className="text-[14px] font-bold text-ink">Title <span className="text-red-500">*</span></label>
                <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Order payment #123" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-[15px] outline-none transition placeholder:text-slate-400 focus:border-gold focus:ring-2 focus:ring-gold/25" />
              </div>
              <div>
                <label htmlFor="desc" className="text-[14px] font-bold text-ink">Description <span className="font-medium text-slate-400">(optional)</span></label>
                <textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Payment description…" rows={3} className="mt-2 w-full resize-none rounded-xl border border-slate-200 p-4 text-[15px] outline-none transition placeholder:text-slate-400 focus:border-gold focus:ring-2 focus:ring-gold/25" />
              </div>
              <div>
                <label className="text-[14px] font-bold text-ink">Image <span className="font-medium text-slate-400">(optional)</span></label>
                {imagePreview ? (
                  <div className="relative mt-2 flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-xl object-cover" />
                    <div className="text-[13px] text-slate-500"><p className="font-bold text-ink">Image attached</p><p>Shown on the hosted checkout page.</p></div>
                    <button type="button" onClick={() => setImagePreview(null)} className="absolute right-3 top-3 rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200" aria-label="Remove image"><X size={16} /></button>
                  </div>
                ) : (
                  <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-8 text-center transition hover:border-gold hover:bg-amber-50/40">
                    <span className="rounded-2xl bg-slate-100 p-3 text-slate-500"><Upload size={22} /></span>
                    <span className="mt-3 text-[14px] font-semibold text-ink">Drag an image here</span>
                    <span className="mt-0.5 text-[12px] text-slate-500">or browse: PNG, JPG up to 5MB</span>
                    <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setImagePreview(URL.createObjectURL(f)); }} />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4">
                <span>
                  <span className="block text-[15px] font-bold text-ink">Amount type</span>
                  <span className="mt-0.5 block text-[12px] text-slate-500">You define the exact amount</span>
                </span>
                <button type="button" role="switch" aria-checked={fixedAmount} onClick={() => setFixedAmount(!fixedAmount)} className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${fixedAmount ? "bg-gold" : "bg-slate-200"}`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${fixedAmount ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>

              {fixedAmount ? (
                <div>
                  <label htmlFor="amount" className="text-[14px] font-bold text-ink">Amount (XAF) <span className="text-red-500">*</span></label>
                  <div className="mt-2 flex h-12 items-center overflow-hidden rounded-xl border border-slate-200 transition focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/25">
                    <span className="px-4 text-[14px] font-extrabold text-slate-400">XAF</span>
                    <input id="amount" type="number" min={0} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="h-full w-full bg-transparent pr-4 text-[15px] outline-none placeholder:text-slate-300" />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] font-semibold text-amber-800">
                  Payer enters the amount — you will see the paid amount in your dashboard and transactions.
                </div>
              )}

              <div>
                <label htmlFor="pdf" className="flex items-center gap-2 text-[14px] font-bold text-ink"><FileText size={17} className="text-amber-500" /> PDF link <span className="font-medium text-slate-400">(optional)</span></label>
                <div className="mt-2 flex h-12 items-center gap-2 overflow-hidden rounded-xl border border-slate-200 px-3 transition focus-within:border-gold">
                  <Link2 size={17} className="shrink-0 text-slate-400" />
                  <input id="pdf" value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} placeholder="https://drive.google.com/file/d/…" className="h-full w-full bg-transparent text-[13.5px] outline-none placeholder:text-slate-400" />
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-amber-600"><Info size={13} /> Sent automatically after successful payment</p>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="relative">
                <button type="button" onClick={() => setCountryOpen(!countryOpen)} className="flex h-14 w-full items-center gap-3 rounded-xl border border-slate-200 px-4 text-left transition hover:border-slate-300">
                  <Globe size={19} className="text-slate-500" />
                  <span className="flex-1 text-[15px] font-semibold text-ink">{selected.length === 0 ? "All countries allowed" : `${selected.length} currenc${selected.length > 1 ? "ies" : "y"} allowed`}</span>
                  <ChevronRight size={18} className={`text-slate-400 transition-transform ${countryOpen ? "rotate-90" : ""}`} />
                </button>
                {countryOpen && (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
                      <Search size={16} className="text-slate-400" />
                      <input autoFocus value={countryQuery} onChange={(e) => setCountryQuery(e.target.value)} placeholder="Search a country or currency…" className="w-full bg-transparent text-[13px] outline-none" />
                    </div>
                    <div className="slim-scroll max-h-64 overflow-y-auto py-1">
                      <button type="button" onClick={() => setSelected([])} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] font-bold text-navy2 hover:bg-slate-50">
                        <span className="flex h-5 w-5 items-center justify-center rounded border border-slate-300 bg-navy text-white">{selected.length === 0 && <Check size={13} strokeWidth={3.5} />}</span> All countries
                      </button>
                      {filteredCountries.map((c) => {
                        const checked = selected.includes(c.currency);
                        return (
                          <button key={c.currency} type="button" onClick={() => toggleCountry(c.currency)} className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] hover:bg-slate-50">
                            <span className={`flex h-5 w-5 items-center justify-center rounded border ${checked ? "border-navy bg-navy text-white" : "border-slate-300"}`}>{checked && <Check size={13} strokeWidth={3.5} />}</span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={flagUrl(c.code, 40)} alt="" className="h-4 w-6 rounded-[3px] object-cover" />
                            <span className="font-semibold text-ink">{c.name}</span>
                            <span className="text-slate-400">· {c.currency}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-gold2"><SlidersHorizontal size={20} /></span>
                  <span><span className="block text-[14.5px] font-extrabold text-ink">Advanced options</span><span className="text-[12px] text-slate-500">Custom URL, expiry and redirect</span></span>
                </div>
                <div className="mt-4">
                  <label htmlFor="slug" className="text-[13px] font-bold text-ink">Custom URL <span className="font-medium text-slate-400">(optional)</span></label>
                  <div className="mt-1.5 flex h-12 items-stretch overflow-hidden rounded-xl border border-slate-200 transition focus-within:border-gold">
                    <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-[13.5px] font-semibold text-slate-500">/pay/</span>
                    <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="mon-lien-unique" className="h-full w-full bg-transparent px-3 text-[13.5px] outline-none placeholder:text-slate-400" />
                  </div>
                  <p className="mt-1 text-[11.5px] text-slate-400">Leave blank to auto-generate</p>
                </div>
                <div className="mt-4">
                  <label htmlFor="expiry" className="flex items-center gap-1.5 text-[13px] font-bold text-ink"><CalendarDays size={15} /> Expiry date <span className="font-medium text-slate-400">(optional)</span></label>
                  <input id="expiry" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 px-4 text-[13.5px] outline-none transition focus:border-gold" />
                </div>
                <div className="mt-4">
                  <label htmlFor="redirect" className="flex items-center gap-1.5 text-[13px] font-bold text-ink"><ExternalLink size={15} /> Redirect URL after payment <span className="font-medium text-slate-400">(optional)</span></label>
                  <input id="redirect" value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} placeholder="https://monsite.com/merci" className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 px-4 text-[13.5px] outline-none transition placeholder:text-slate-400 focus:border-gold" />
                  <p className="mt-1 text-[11.5px] text-slate-400">The customer is redirected here after successful payment</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — review */}
          {step === 4 && (
            <div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-white"><Link2 size={22} /></span>
                  <div>
                    <p className="text-[15px] font-extrabold text-ink">{title || "Untitled link"}</p>
                    <p className="text-[11.5px] text-slate-500">sdkpay.com/pay/{slug || "auto-generated"}</p>
                  </div>
                </div>
                <dl className="mt-4 grid gap-2.5 border-t border-slate-200 pt-4 text-[13px] sm:grid-cols-2">
                  {[
                    ["Amount", fixedAmount ? `${Number(amount || 0).toLocaleString("fr-FR")} XAF` : "Payer enters amount"],
                    ["Countries", selected.length === 0 ? "All countries" : selected.join(", ")],
                    ["Expiry", expiresAt ? new Date(expiresAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "Never"],
                    ["Redirect", redirectUrl || "—"],
                    ["PDF receipt", pdfUrl ? "Attached" : "—"],
                    ["Status", "Active immediately"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5"><dt className="text-slate-400">{k}</dt><dd className="text-right font-bold text-ink">{v}</dd></div>
                  ))}
                </dl>
              </div>
              <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-slate-500"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" /> By publishing, the link becomes available at sdkpay.com/pay/… and any customer can pay you with Mobile Money. You can deactivate it anytime from My links.</p>
            </div>
          )}
        </div>

        {/* footer actions */}
        <div className="flex items-center gap-3 border-t border-slate-100 p-4 sm:p-5">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="flex h-13 items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3.5 text-[15px] font-bold text-slate-600 transition hover:border-slate-300">
              <ChevronLeft size={18} /> Back
            </button>
          ) : (
            <a href="/links" className="flex h-13 items-center rounded-2xl border border-slate-200 px-5 py-3.5 text-[15px] font-bold text-slate-600 transition hover:border-slate-300">Cancel</a>
          )}
          {step < 4 ? (
            <button type="button" disabled={!canContinue} onClick={() => setStep(step + 1)} className="flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold to-gold2 py-3.5 text-[15px] font-extrabold text-navy2 shadow-md shadow-gold/25 transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40">
              Continue <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          ) : (
            <button type="submit" className="flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold to-gold2 py-3.5 text-[15px] font-extrabold text-navy2 shadow-md shadow-gold/25 transition hover:brightness-105">
              <Check size={19} strokeWidth={3} /> Create link
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
