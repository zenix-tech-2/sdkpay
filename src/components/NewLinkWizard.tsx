"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, DollarSign, Eye, FileText, Globe2,
  Image as ImageIcon, Link2, SlidersHorizontal, Upload, X,
} from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";
import { countries } from "@/lib/countries";

const steps = [
  { icon: ImageIcon, title: "Basic information", subtitle: "Name, description and visual for your link" },
  { icon: DollarSign, title: "Amount & Type", subtitle: "Define the amount and payment mode" },
  { icon: Globe2, title: "Allowed countries", subtitle: "Control which countries payments are accepted from" },
  { icon: Eye, title: "Preview", subtitle: "Review your payment link before publishing" },
];

const fieldClass = "h-[58px] w-full rounded-[14px] border border-[#dce5f3] bg-white px-4 text-[16px] text-[#25314d] outline-none transition focus:border-[#ffb800] focus:ring-[3px] focus:ring-[#ffb800]/15 placeholder:text-[#9aa6c0]";

export function NewLinkWizard() {
  const router = useRouter();
  const { data, refresh } = useDashboard();
  const [step, setStep] = useState(1);
  const [editId, setEditId] = useState(0);
  const loadedEdit = useRef(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fixedAmount, setFixedAmount] = useState(true);
  const [amount, setAmount] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [allowedCountries, setAllowedCountries] = useState("all");
  const [customSlug, setCustomSlug] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const value = Number(new URLSearchParams(window.location.search).get("edit"));
    if (Number.isFinite(value) && value > 0) setEditId(value);
  }, []);

  useEffect(() => {
    if (!editId || !data || loadedEdit.current) return;
    const link = data.links.find((item) => item.id === editId);
    if (!link) return;
    loadedEdit.current = true;
    setTitle(link.title);
    setDescription(link.description);
    setImageUrl(link.imageUrl);
    setFixedAmount(!link.freeAmount);
    setAmount(String(link.amount || ""));
    setPdfUrl(link.pdfUrl);
    setAllowedCountries(link.allowedCountries || "all");
    setCustomSlug(link.slug);
    setExpiryDate(link.expiryDate);
    setRedirectUrl(link.redirectUrl);
  }, [editId, data]);

  function readImage(file?: File) {
    if (!file) return;
    if (!/image\/(png|jpeg|jpg)/.test(file.type)) { setError("Format accepté : PNG ou JPG"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("L'image ne doit pas dépasser 5 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => { setImageUrl(String(reader.result)); setError(""); };
    reader.readAsDataURL(file);
  }

  function next() {
    setError("");
    if (step === 1 && !title.trim()) { setError("Veuillez saisir un titre"); return; }
    if (step === 2 && fixedAmount && (!Number(amount) || Number(amount) < 100)) { setError("Le montant minimum est de 100 FCFA"); return; }
    if (step < 4) { setStep(step + 1); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    void submit();
  }

  async function submit() {
    setBusy(true); setError("");
    const payload = {
      title, description, imageUrl,
      amount: fixedAmount ? Number(amount) : 0,
      freeAmount: !fixedAmount,
      pdfUrl, allowedCountries, customSlug, expiryDate, redirectUrl,
      iconEmoji: "🔗",
    };
    try {
      const res = await fetch(editId ? `/api/links/${editId}` : "/api/links", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Impossible d'enregistrer le lien"); return; }
      await refresh();
      router.push("/dashboard/links");
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setBusy(false);
    }
  }

  const percent = step * 25;
  const info = steps[step - 1];
  const StepIcon = info.icon;

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.push("/dashboard/links")} className="text-[#17213d]" aria-label="Retour"><ArrowLeft size={24} /></button>
        <h1 className="font-display text-[30px] font-extrabold text-[#111b36] sm:text-[38px]">New payment link</h1>
      </div>

      <div className="rounded-[18px] border border-[#e3e9f4] bg-white px-5 py-5 shadow-[0_5px_18px_rgba(25,38,80,.035)]">
        <div className="flex items-start justify-between">
          <div><p className="text-[12px] font-bold tracking-[.14em] text-[#6d7d9e]">STEP {step} OF 4</p><p className="mt-1 text-[16px] font-bold text-[#17213d]">{info.title}</p></div>
          <p className="text-[16px] font-extrabold text-[#1d2a77]">{percent}%</p>
        </div>
        <div className="mt-5 flex items-center">
          {steps.map((item, index) => {
            const position = index + 1;
            const done = position < step;
            const active = position === step;
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center">
                <div className={`flex h-[44px] w-[44px] items-center justify-center rounded-full ${done || active ? "bg-[#1d2a77] text-white" : "bg-[#eef1f7] text-[#a5afc4]"}`}>
                  {done ? <Check size={20} /> : <Icon size={20} />}
                </div>
                {position < 4 && <div className={`mx-1 h-[3px] w-[34px] rounded sm:w-[58px] ${position < step ? "bg-[#1d2a77]" : "bg-[#e4e9f2]"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[18px] border border-[#e3e9f4] bg-white shadow-[0_5px_18px_rgba(25,38,80,.035)]">
        <div className="flex gap-4 px-5 py-5">
          <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[14px] bg-[#fff5d9] text-[#e5a300]"><StepIcon size={26} /></div>
          <div><p className="text-[12px] font-bold tracking-[.14em] text-[#6d7d9e]">STEP {step}</p><h2 className="mt-0.5 text-[20px] font-extrabold text-[#17213d]">{info.title}</h2><p className="mt-1 text-[14px] leading-snug text-[#6d7d9e]">{info.subtitle}</p></div>
        </div>
        <div className="h-px bg-[#e8edf6]" />

        {step === 1 && (
          <div className="space-y-6 p-5 sm:p-6">
            <div><p className="mb-3 text-[17px] font-medium text-[#17213d]">Title <span className="text-[#f0475e]">* *</span></p><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Order payment #123" className={fieldClass} /></div>
            <div><p className="mb-3 text-[17px] font-medium text-[#17213d]">Description (optional)</p><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Payment description..." className="h-[140px] w-full rounded-[14px] border border-[#dce5f3] bg-white p-4 text-[16px] text-[#25314d] outline-none focus:border-[#ffb800] placeholder:text-[#9aa6c0]" /></div>
            <div>
              <p className="mb-3 text-[17px] font-medium text-[#17213d]">Image (optional)</p>
              <label
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); readImage(e.dataTransfer.files[0]); }}
                className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-[16px] border-2 border-dashed p-5 text-center ${dragging ? "border-[#ffb800] bg-[#fffaf0]" : "border-[#d7e0ef] bg-white"}`}
              >
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => readImage(e.target.files?.[0])} />
                {imageUrl ? (
                  <div className="relative"><img src={imageUrl} alt="Aperçu" className="mx-auto h-28 w-28 rounded-xl object-cover" /><button type="button" onClick={(e) => { e.preventDefault(); setImageUrl(""); }} className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-[#f0475e] shadow"><X size={14} /></button><p className="mt-3 text-[13px] font-semibold text-[#2e9e63]">Image ajoutée ✓</p></div>
                ) : (
                  <><span className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#f1f4fa] text-[#7d8aa9]"><ImageIcon size={26} /></span><p className="mt-4 text-[17px] font-medium text-[#25314d]">Drag an image here</p><p className="mt-1 text-[14px] text-[#8491ad]">or browse: PNG, JPG up to 5MB</p><span className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#dce5f3] px-3 py-2 text-[12px] font-bold text-[#5d6882]"><Upload size={14} /> Browse</span></>
                )}
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 p-5 sm:p-6">
            <div className="flex items-center justify-between rounded-[16px] border border-[#e3e9f4] px-4 py-4">
              <div><p className="text-[18px] font-bold text-[#17213d]">Amount type</p><p className="mt-1 text-[14px] text-[#6d7d9e]">{fixedAmount ? "You define the exact amount" : "Customer chooses the amount"}</p></div>
              <button type="button" role="switch" aria-checked={fixedAmount} onClick={() => setFixedAmount(!fixedAmount)} className={`relative h-[34px] w-[62px] rounded-full transition ${fixedAmount ? "bg-[#ffb800]" : "bg-[#d7e0ef]"}`}><span className={`absolute top-[4px] h-[26px] w-[26px] rounded-full bg-white shadow transition-all ${fixedAmount ? "left-[32px]" : "left-[4px]"}`} /></button>
            </div>
            {fixedAmount ? (
              <div><p className="mb-3 text-[17px] font-medium text-[#17213d]">Amount (XAF) <span className="text-[#f0475e]">*</span></p><div className="flex h-[58px] items-center rounded-[14px] border border-[#dce5f3] bg-white px-4"><span className="border-r border-[#e2e8f3] pr-4 text-[16px] font-semibold text-[#7d8aa9]">XAF</span><input type="number" min={100} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="h-full w-full bg-transparent pl-4 text-[16px] outline-none" /></div></div>
            ) : (
              <div className="rounded-[14px] bg-[#f5f8ff] p-4 text-[13px] leading-relaxed text-[#5d6882]">Le client saisira librement le montant lors du paiement (minimum 100 FCFA).</div>
            )}
            <div><p className="mb-3 flex items-center gap-2 text-[17px] font-medium text-[#17213d]"><FileText size={18} className="text-[#e5a300]" /> PDF link (optional)</p><div className="relative"><Link2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b96b0]" /><input value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} placeholder="https://drive.google.com/file/d/..." className={`${fieldClass} pl-12`} /></div><p className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-[#e5a300]">ⓘ Sent automatically after successful payment</p></div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 p-5 sm:p-6">
            <div className="relative"><Globe2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6d7d9e]" /><select value={allowedCountries} onChange={(e) => setAllowedCountries(e.target.value)} className={`${fieldClass} appearance-none pl-12 pr-10`}><option value="all">All countries allowed</option>{countries.map((country) => <option key={country.code} value={country.code}>{country.flag} {country.name}</option>)}</select><span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6d7d9e]">⌄</span></div>
            <div className="rounded-[16px] border border-[#e3e9f4] p-5">
              <div className="flex gap-4"><span className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[14px] bg-[#fff5d9] text-[#e5a300]"><SlidersHorizontal size={26} /></span><div><h3 className="text-[20px] font-extrabold text-[#17213d]">Advanced options</h3><p className="mt-1 text-[14px] leading-snug text-[#6d7d9e]">Custom URL, expiry and redirect</p></div></div>
              <div className="mt-6 space-y-5">
                <div><p className="mb-3 text-[17px] font-medium text-[#17213d]">Custom URL (optional)</p><div className="flex h-[58px] items-center rounded-[14px] border border-[#dce5f3] bg-white"><span className="flex h-full items-center rounded-l-[14px] border-r border-[#e2e8f3] bg-[#f7f9fd] px-4 text-[16px] text-[#7d8aa9]">/pay/</span><input value={customSlug} onChange={(e) => setCustomSlug(e.target.value)} placeholder="mon-lien-unique" className="h-full w-full rounded-r-[14px] bg-transparent px-4 text-[16px] outline-none placeholder:text-[#9aa6c0]" /></div><p className="mt-2 text-[13px] text-[#7d8aa9]">Leave blank to auto-generate</p></div>
                <div><p className="mb-3 flex items-center gap-2 text-[17px] font-medium text-[#17213d]"><CalendarDays size={19} /> Expiry date (optional)</p><input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className={fieldClass} /></div>
                <div><p className="mb-3 text-[17px] font-medium text-[#17213d]"><span className="mr-1">↗</span> Redirect URL after payment (optional)</p><input value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} placeholder="https://monsite.com/merci" className={fieldClass} /><p className="mt-2 text-[13px] leading-relaxed text-[#7d8aa9]">The customer is redirected here after successful payment</p></div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="p-5 sm:p-6">
            <div className="rounded-[16px] border border-[#e3e9f4] p-5">
              <div className="flex items-center gap-4">{imageUrl ? <img src={imageUrl} alt="" className="h-16 w-16 rounded-xl object-cover" /> : <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#fff5d9] text-2xl">🔗</span>}<div><p className="text-[20px] font-extrabold text-[#17213d]">{title || "Votre lien"}</p><p className="mt-1 text-[13px] text-[#6d7d9e]">{description || "Aucune description"}</p></div></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[["Amount", fixedAmount ? `${Number(amount || 0).toLocaleString("fr-FR")} FCFA` : "Free amount"], ["Countries", allowedCountries === "all" ? "All countries" : countries.find((c) => c.code === allowedCountries)?.name ?? allowedCountries], ["Custom URL", customSlug ? `/pay/${customSlug}` : "Auto-generated"], ["Expiry", expiryDate || "No expiry"], ["Redirect", redirectUrl || "None"], ["PDF", pdfUrl || "None"]].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-[#f5f8ff] p-3"><p className="text-[11px] font-bold uppercase tracking-wider text-[#8b96b0]">{label}</p><p className="mt-1 truncate text-[13px] font-semibold text-[#25314d]">{value}</p></div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-[12px] leading-relaxed text-[#7d8aa9]">En publiant ce lien, vous pouvez le partager immédiatement et suivre les paiements depuis votre dashboard.</p>
          </div>
        )}
      </div>

      {error && <p className="mt-4 rounded-xl bg-[#fff0f0] px-4 py-3 text-[13px] font-semibold text-[#c83c3c]">{error}</p>}
      <div className="sticky bottom-3 z-10 mt-5 grid grid-cols-[1fr_2fr] gap-3 rounded-2xl bg-[#f4f7fd]/95 p-1 backdrop-blur">
        <button onClick={() => step === 1 ? router.push("/dashboard/links") : setStep(step - 1)} className="flex h-[58px] items-center justify-center gap-2 rounded-[14px] border border-[#dce5f3] bg-white text-[16px] font-bold text-[#25314d]">{step > 1 && <ArrowLeft size={18} />}{step === 1 ? "Cancel" : "Back"}</button>
        <button onClick={next} disabled={busy} className="brand-btn flex h-[58px] items-center justify-center gap-2 rounded-[14px] text-[16px] disabled:opacity-60">{busy ? "..." : step === 4 ? (editId ? "Save changes" : "Create link") : "Continue"}<ArrowRight size={18} /></button>
      </div>
    </div>
  );
}
