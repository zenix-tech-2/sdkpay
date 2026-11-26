"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  DollarSign,
  Globe,
  Eye,
  Check,
  Link2,
  Info,
  Calendar,
  ExternalLink,
  SlidersHorizontal,
  FileText,
  ChevronDown,
  Copy,
  QrCode,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { COUNTRIES } from "@/data/countries";
import QrSheet from "@/components/dashboard/QrSheet";

const NAVY = "#26247e";
const GOLD = "#f0a500";

const STEPS = [
  { title: "Basic information", sub: "Name, description and visual for your link", icon: ImageIcon },
  { title: "Amount & Type", sub: "Define the amount and payment mode", icon: DollarSign },
  { title: "Allowed countries", sub: "Control which countries payments are accepted from", icon: Globe },
  { title: "Review & publish", sub: "Check everything before going live", icon: Eye },
];

const inputCls =
  "w-full rounded-[26px] border border-slate-200 bg-white px-6 py-[16px] text-[15px] font-medium text-slate-800 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition";

export default function NewLinkWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imgErr, setImgErr] = useState("");
  const [fixedAmount, setFixedAmount] = useState(true);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("XAF");
  const [pdfUrl, setPdfUrl] = useState("");
  const [countries, setCountries] = useState("ALL");
  const [customSlug, setCustomSlug] = useState("");
  const [expiry, setExpiry] = useState("never");
  const [customDate, setCustomDate] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [err, setErr] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [created, setCreated] = useState<{ slug: string; title: string } | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pct = step * 25;

  function onFile(f: File | undefined) {
    setImgErr("");
    if (!f) return;
    if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(f.type)) {
      setImgErr("Only PNG or JPG images are allowed.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setImgErr("Image too large (max 5MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      if (data.length > 700_000) {
        setImgErr("Image too heavy after encoding. Please use a smaller image (max ~500KB).");
        return;
      }
      setImage(data);
    };
    reader.readAsDataURL(f);
  }

  function canContinue() {
    if (step === 1) return title.trim().length >= 3;
    if (step === 2) return !fixedAmount || (Number(amount) >= 100);
    return true;
  }

  function next() {
    setErr("");
    if (step === 1 && title.trim().length < 3) {
      setErr("Please give your link a title (min. 3 characters).");
      return;
    }
    if (step === 2 && fixedAmount && Number(amount) < 100) {
      setErr("Amount must be at least 100.");
      return;
    }
    if (step < 4) setStep(step + 1);
  }

  function expiryDate(): string | null {
    const now = Date.now();
    if (expiry === "24h") return new Date(now + 86400000).toISOString();
    if (expiry === "7d") return new Date(now + 7 * 86400000).toISOString();
    if (expiry === "30d") return new Date(now + 30 * 86400000).toISOString();
    if (expiry === "custom" && customDate) return new Date(customDate).toISOString();
    return null;
  }

  async function publish() {
    setErr("");
    setPublishing(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          amount: fixedAmount ? Number(amount) : null,
          currency,
          description: description.trim() || null,
          customSlug: customSlug.trim() || null,
          imageUrl: image || null,
          pdfUrl: pdfUrl.trim() || null,
          redirectUrl: redirectUrl.trim() || null,
          allowedCountries: countries,
          expiresAt: expiryDate(),
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setErr(d.error || "Failed to create link.");
        return;
      }
      setCreated({ slug: d.link.slug, title: d.link.title });
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setPublishing(false);
    }
  }

  function copyLink() {
    if (!created) return;
    navigator.clipboard.writeText(`${window.location.origin}/pay/${created.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (created) {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/pay/${created.slug}`;
    return (
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <BadgeCheck size={35} className="text-green-600" />
          </span>
          <h1 className="mt-4 text-[23px] font-extrabold">Link published!</h1>
          <p className="mt-1 text-[12.5px] font-medium text-slate-500">« {created.title} » is live. Share it anywhere.</p>
          <p className="mx-auto mt-4 max-w-full truncate rounded-2xl bg-slate-100 px-4 py-3 font-mono text-[11.5px] font-bold">{url}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={copyLink} className="flex items-center justify-center gap-2 rounded-full bg-[#f0a500] py-3.5 text-[13px] font-extrabold text-white">
              {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied!" : "Copy link"}
            </button>
            <button onClick={() => setQrOpen(true)} className="flex items-center justify-center gap-2 rounded-full bg-[#26247e] py-3.5 text-[13px] font-extrabold text-white">
              <QrCode size={15} /> QR code
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <a href={url} target="_blank" className="flex items-center justify-center gap-2 rounded-full border border-slate-200 py-3.5 text-[12.5px] font-extrabold">
              <ExternalLink size={14} /> Open
            </a>
            <Link href="/dashboard/links" className="flex items-center justify-center rounded-full border border-slate-200 py-3.5 text-[12.5px] font-extrabold">
              My links
            </Link>
          </div>
        </div>
        {qrOpen && <QrSheet url={url} onClose={() => setQrOpen(false)} />}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      {/* header */}
      <div className="flex items-center gap-4">
        <button onClick={() => (step === 1 ? router.back() : setStep(step - 1))} className="text-slate-900" aria-label="back">
          <ArrowLeft size={23} />
        </button>
        <h1 className="text-[26.5px] font-extrabold tracking-tight text-slate-900">New payment link</h1>
      </div>

      {/* progress card */}
      <div className="mt-4 rounded-[26px] border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-bold tracking-[0.22em] text-slate-500">STEP {step} OF 4</p>
          <p className="text-[15px] font-bold" style={{ color: NAVY }}>{pct}%</p>
        </div>
        <p className="mt-1 text-[18.5px] font-bold text-slate-900">{STEPS[step - 1].title}</p>
        <div className="mt-4 flex items-center">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const done = n < step;
            const current = n === step;
            const Icon = done ? Check : s.icon;
            return (
              <div key={s.title} className="flex flex-1 items-center last:flex-none">
                <span
                  className="flex h-[46px] w-[46px] items-center justify-center rounded-full"
                  style={done || current ? { background: NAVY, color: "#fff" } : { background: "#f1f5f9", color: "#94a3b8" }}
                >
                  <Icon size={21} strokeWidth={done ? 3 : 2.2} />
                </span>
                {n < 4 && (
                  <span
                    className="mx-2 h-[2.5px] flex-1 rounded-full"
                    style={{ background: n < step ? NAVY : "#e2e8f0" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* step card */}
      <div className="mt-4 overflow-hidden rounded-[26px] border border-slate-200 bg-white">
        <div className="flex items-center gap-4 border-b border-slate-200 p-6">
          <span className="flex h-[56.5px] w-[56.5px] shrink-0 items-center justify-center rounded-2xl bg-yellow-50 text-[#f0a500]">
            {(() => {
              const Icon = STEPS[step - 1].icon;
              return <Icon size={26} />;
            })()}
          </span>
          <div>
            <p className="text-[13px] font-bold tracking-[0.22em] text-slate-500">STEP {step}</p>
            <p className="text-[19.5px] font-bold leading-tight text-slate-900">{STEPS[step - 1].title}</p>
            <p className="text-[13px] font-medium text-slate-500">{STEPS[step - 1].sub}</p>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {err && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-bold text-red-600">{err}</p>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="mb-2.5 block text-[16.5px] font-medium text-slate-900">
                  Title * <span className="text-red-600">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Order payment #123"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-2.5 block text-[16.5px] font-medium text-slate-900">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Payment description..."
                  rows={4}
                  className="w-full rounded-[26px] border border-slate-200 bg-white px-6 py-[16px] text-[15px] font-medium text-slate-800 placeholder:text-slate-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition"
                />
              </div>
              <div>
                <label className="mb-2.5 block text-[16.5px] font-medium text-slate-900">Image (optional)</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
                {image ? (
                  <div className="relative overflow-hidden rounded-[26px] border border-slate-200">
                    <img src={image} alt="preview" className="h-52 w-full object-cover" />
                    <button
                      onClick={() => setImage("")}
                      className="absolute right-3 top-3 rounded-full bg-black/60 px-4 py-1.5 text-[11.5px] font-bold text-white"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      onFile(e.dataTransfer.files?.[0]);
                    }}
                    className="flex w-full flex-col items-center rounded-[26px] border-2 border-dashed border-slate-200 px-6 py-12 hover:border-yellow-400 hover:bg-yellow-50/30"
                  >
                    <span className="flex h-[60px] w-[60px] items-center justify-center rounded-3xl bg-slate-50 text-slate-500">
                      <ImageIcon size={26} />
                    </span>
                    <span className="mt-3 text-[16.5px] font-medium text-slate-900">Drag an image here</span>
                    <span className="mt-1 text-[14px] font-medium text-slate-500">or browse: PNG, JPG up to 5MB</span>
                  </button>
                )}
                {imgErr && <p className="mt-2 text-[11.5px] font-bold text-red-500">{imgErr}</p>}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-3 rounded-[26px] border border-slate-200 p-5">
                <div className="flex-1">
                  <p className="text-[16.5px] font-medium text-slate-900">Amount type</p>
                  <p className="text-[14px] font-medium text-slate-500">
                    {fixedAmount ? "You define the exact amount" : "Customer chooses the amount"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFixedAmount(!fixedAmount)}
                  className={`relative h-[33.5px] w-[60px] shrink-0 rounded-full transition ${fixedAmount ? "bg-[#f0a500]" : "bg-slate-200"}`}
                  aria-label="toggle amount type"
                >
                  <span
                    className={`absolute top-[4px] h-[26.5px] w-[26.5px] rounded-full bg-white shadow transition-all ${fixedAmount ? "right-[4px]" : "left-[4px]"}`}
                  />
                </button>
              </div>

              <div className="flex gap-2">
                {(["XAF", "XOF"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`flex-1 rounded-full border-2 py-2.5 text-[13px] font-extrabold ${currency === c ? "border-[#f0a500] bg-yellow-50 text-slate-900" : "border-slate-200 text-slate-400"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {fixedAmount && (
                <div>
                  <label className="mb-2.5 block text-[16.5px] font-medium text-slate-900">
                    Amount ({currency}) <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[15px] font-bold text-slate-400">{currency}</span>
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      type="number"
                      min={100}
                      placeholder="0"
                      className={`${inputCls} pl-20`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2.5 flex items-center gap-2 text-[16.5px] font-medium text-slate-900">
                  <FileText size={19} className="text-[#f0a500]" /> PDF link (optional)
                </label>
                <div className="relative">
                  <Link2 size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className={`${inputCls} pl-14 text-[14px]`}
                  />
                </div>
                <p className="mt-2.5 flex items-start gap-1.5 text-[14px] font-medium text-[#e8930c]">
                  <Info size={16} className="mt-1 shrink-0" /> Sent automatically after successful payment
                </p>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="relative">
                <Globe size={19} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                <select
                  value={countries}
                  onChange={(e) => setCountries(e.target.value)}
                  className="w-full appearance-none rounded-[26px] border border-slate-200 bg-white py-[17.5px] pl-14 pr-12 text-[16px] font-medium text-slate-900 focus:border-yellow-500"
                >
                  <option value="ALL">All countries allowed</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} only
                    </option>
                  ))}
                </select>
                <ChevronDown size={19} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>

              <div className="rounded-[26px] border border-slate-200 p-5">
                <div className="flex items-center gap-4">
                  <span className="flex h-[53px] w-[53px] shrink-0 items-center justify-center rounded-2xl bg-yellow-50 text-[#f0a500]">
                    <SlidersHorizontal size={25} />
                  </span>
                  <div>
                    <p className="text-[17.5px] font-medium text-slate-900">Advanced options</p>
                    <p className="text-[14px] font-medium text-slate-500">Custom URL, expiry and redirect</p>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-2.5 block text-[16px] font-medium text-slate-900">Custom URL (optional)</label>
                  <div className="flex overflow-hidden rounded-[26px] border border-slate-200">
                    <span className="flex items-center border-r border-slate-200 bg-slate-50 px-5 text-[16px] font-medium text-slate-400">/pay/</span>
                    <input
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="mon-lien-unique"
                      maxLength={50}
                      className="w-full px-5 py-[16px] text-[16px] font-medium placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  <p className="mt-2 text-[14px] font-medium text-slate-500">Leave blank to auto-generate</p>
                </div>

                <div className="mt-4">
                  <label className="mb-2.5 flex items-center gap-2 text-[16px] font-medium text-slate-900">
                    <Calendar size={18} /> Expiry date (optional)
                  </label>
                  <div className="relative">
                    <select
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full appearance-none rounded-[26px] border border-slate-200 bg-white px-6 py-[16px] text-[15px] font-medium text-slate-800 focus:border-yellow-500"
                    >
                      <option value="never">No expiry</option>
                      <option value="24h">24 hours</option>
                      <option value="7d">7 days</option>
                      <option value="30d">30 days</option>
                      <option value="custom">Custom date...</option>
                    </select>
                    <ChevronDown size={19} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                  {expiry === "custom" && (
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 10)}
                      className="mt-2.5 w-full rounded-[26px] border border-slate-200 px-6 py-[14px] text-[14px] font-medium"
                    />
                  )}
                </div>

                <div className="mt-4">
                  <label className="mb-2.5 flex items-center gap-2 text-[16px] font-medium text-slate-900">
                    <ExternalLink size={17} /> Redirect URL after payment (optional)
                  </label>
                  <input
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    placeholder="https://monsite.com/merci"
                    className={inputCls}
                  />
                  <p className="mt-2 text-[14px] font-medium text-slate-500">
                    The customer is redirected here after successful payment
                  </p>
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="overflow-hidden rounded-[22px] text-white" style={{ background: NAVY }}>
                <div className="flex items-center gap-3 p-5">
                  {image ? (
                    <img src={image} alt="" className="h-[46px] w-[46px] rounded-2xl bg-white object-cover" />
                  ) : (
                    <span className="flex h-[46px] w-[46px] items-center justify-center rounded-2xl bg-white/10">
                      <Link2 size={23} />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium">{title || "Untitled link"}</p>
                    <p className="text-[12.5px] text-white/70">
                      {fixedAmount && amount ? `${Number(amount).toLocaleString("fr-FR")} ${currency}` : "Free amount"}
                    </p>
                  </div>
                  <BadgeCheck size={18} className="text-green-400" />
                </div>
                <div className="border-t border-white/15 px-5 py-3 text-[13px] text-white/60">
                  /pay/{customSlug || "auto-generated"}
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  ["Description", description || "—"],
                  ["PDF delivery", pdfUrl ? "Attached ✓" : "—"],
                  ["Countries", countries === "ALL" ? "All countries allowed" : COUNTRIES.find((c) => c.code === countries)?.name ?? countries],
                  ["Expiry", expiry === "never" ? "No expiry" : expiry === "custom" ? customDate || "—" : expiry],
                  ["Redirect", redirectUrl || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-5 py-3.5">
                    <span className="text-[12.5px] font-bold text-slate-400">{k}</span>
                    <span className="truncate text-[13px] font-extrabold text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* bottom buttons */}
      <div className="mt-4 flex gap-3 pb-4">
        {step === 1 ? (
          <button
            onClick={() => router.push("/dashboard/links")}
            className="rounded-full border border-slate-300 bg-white px-8 py-[14px] text-[16.5px] font-medium text-slate-900"
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-3 rounded-full border border-slate-300 bg-white px-8 py-[14px] text-[16.5px] font-medium text-slate-900"
          >
            <ArrowLeft size={18} /> Back
          </button>
        )}
        {step < 4 ? (
          <button
            onClick={next}
            disabled={!canContinue()}
            className="flex flex-1 items-center justify-center gap-3 rounded-full bg-[#f0a500] py-[14px] text-[16.5px] font-bold text-white hover:bg-[#d89400] disabled:opacity-50"
          >
            Continue <ArrowRight size={19} />
          </button>
        ) : (
          <button
            onClick={publish}
            disabled={publishing}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#f0a500] py-[14px] text-[16.5px] font-bold text-white hover:bg-[#d89400] disabled:opacity-60"
          >
            {publishing && <Loader2 size={18} className="animate-spin" />}
            {publishing ? "Publishing..." : "Publish link"}
          </button>
        )}
      </div>
    </div>
  );
}
