"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck, Hourglass, ShieldX, IdCard, BookUser, CarFront, Camera, Upload, Check, ChevronLeft, ChevronRight,
  RefreshCw, Loader2, X, FileCheck2, ImageIcon, UserRound,
} from "lucide-react";
import { submitKycDocuments } from "@/lib/actions";

export type KycSubmissionView = {
  docType: string; docNumber: string; fullName: string; dateOfBirth: string | null;
  frontImage: string; backImage: string | null; selfieImage: string; createdAt: string;
};

const DOC_TYPES = [
  { id: "national_id", label: "National ID", sub: "CNI / Carte nationale", icon: IdCard, needsBack: true },
  { id: "passport", label: "Passport", sub: "Travel document", icon: BookUser, needsBack: false },
  { id: "driver_license", label: "Driver's licence", sub: "Permis de conduire", icon: CarFront, needsBack: true },
] as const;

async function resizeImage(file: File, max = 1280, quality = 0.78): Promise<string> {
  const img = new Image();
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unavailable"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

/* ---------------- dropzone ---------------- */
function Dropzone({ label, hint, value, onChange, required = true }: { label: string; hint: string; value: string | null; onChange: (v: string | null) => void; required?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try { onChange(await resizeImage(file)); } finally { setBusy(false); }
  };
  return (
    <div>
      <p className="text-[12px] font-extrabold uppercase tracking-widest text-slate-400">{label}{required && <span className="text-red-500"> *</span>}</p>
      <div
        role="button" tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]); }}
        onDragOver={(e) => e.preventDefault()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className="mt-1.5 flex min-h-36 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 text-center transition hover:border-gold"
      >
        {busy ? (
          <Loader2 className="animate-spin text-slate-400" size={28} />
        ) : value ? (
          <span className="relative block w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={label} className="h-36 w-full object-contain" />
            <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white"><Check size={15} strokeWidth={3.5} /></span>
            <span
              role="button" tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onChange(null); } }}
              className="absolute left-2 top-2 rounded-lg bg-navy2/80 p-1.5 text-white backdrop-blur transition hover:bg-navy2" aria-label="Remove image"
            ><X size={14} /></span>
          </span>
        ) : (
          <>
            <span className="rounded-2xl bg-slate-100 p-3 text-slate-400"><ImageIcon size={24} /></span>
            <span className="mt-2 text-[13px] font-bold text-ink">Drag an image here</span>
            <span className="mt-0.5 text-[11px] text-slate-400">{hint}</span>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}

/* ---------------- selfie capture ---------------- */
function SelfieCapture({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 720 } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      setCameraError("Camera unavailable or permission denied — upload a photo instead.");
    }
  };

  useEffect(() => () => stopCamera(), [stopCamera]);

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    onChange(canvas.toDataURL("image/jpeg", 0.82));
    stopCamera();
  };

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Selfie" className="h-56 w-full object-cover" />
        <button onClick={() => onChange(null)} className="absolute right-2 top-2 flex items-center gap-1.5 rounded-xl bg-navy2/80 px-3 py-1.5 text-[12px] font-bold text-white backdrop-blur transition hover:bg-navy2"><RefreshCw size={13} /> Retake</button>
      </div>
    );
  }

  if (cameraOn) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-navy2">
        <video ref={videoRef} autoPlay playsInline muted className="h-56 w-full object-cover" />
        <div className="flex items-center justify-center gap-2 p-3">
          <button onClick={stopCamera} className="rounded-xl border border-white/20 px-4 py-2 text-[12px] font-bold text-white/80">Cancel</button>
          <button onClick={capture} className="flex items-center gap-2 rounded-xl bg-gold px-5 py-2 text-[13px] font-extrabold text-navy2"><Camera size={16} /> Take selfie</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400"><UserRound size={30} /></span>
      <p className="mt-3 text-[14px] font-extrabold text-ink">Look straight at the camera</p>
      <p className="mx-auto mt-1 max-w-[16rem] text-[11.5px] text-slate-500">Remove glasses and hat, face a light source, and hold the phone at eye level.</p>
      {cameraError && <p className="mt-2 text-[11.5px] font-semibold text-amber-700">{cameraError}</p>}
      <div className="mt-4 flex justify-center gap-2">
        <button onClick={startCamera} className="flex h-11 items-center gap-2 rounded-xl bg-navy px-4 text-[13px] font-bold text-white transition hover:bg-navy3"><Camera size={16} /> Use camera</button>
        <button onClick={() => inputRef.current?.click()} className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-600 transition hover:border-slate-300"><Upload size={16} /> Upload</button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) onChange(await resizeImage(f, 720, 0.8)); }} />
    </div>
  );
}

/* ================= main flow ================= */
export default function KycFlow({
  status, fullName, rejectionReason, latest,
}: { status: string; fullName: string; phone: string | null; rejectionReason: string | null; latest: KycSubmissionView | null }) {
  const router = useRouter();
  const [mode, setMode] = useState<"status" | "wizard">(status === "none" || status === "rejected" ? "wizard" : "status");
  const [step, setStep] = useState(1);
  const [name, setName] = useState(fullName);
  const [dob, setDob] = useState("");
  const [docType, setDocType] = useState<(typeof DOC_TYPES)[number]["id"]>("national_id");
  const [docNumber, setDocNumber] = useState("");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  const selected = DOC_TYPES.find((d) => d.id === docType)!;
  const canNext =
    step === 1 ? name.trim().length > 2 && docNumber.trim().length >= 4 :
    step === 2 ? !!frontImage && (!selected.needsBack || !!backImage) :
    step === 3 ? !!selfie :
    confirm;

  const submit = () =>
    start(async () => {
      setError(null);
      const fd = new FormData();
      fd.set("docType", docType); fd.set("docNumber", docNumber); fd.set("fullName", name); fd.set("dateOfBirth", dob);
      fd.set("frontImage", frontImage ?? ""); if (backImage) fd.set("backImage", backImage); fd.set("selfieImage", selfie ?? "");
      const res = await submitKycDocuments(fd);
      if (res.ok) setDone(true);
      else setError(res.error ?? "Submission failed");
    });

  /* ---------- status views ---------- */
  if (mode === "status" && !done) {
    if (status === "verified") {
      return (
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-28 w-28 items-center justify-center">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <polygon fill="#2f9df0" points="50,2 61,13 75,11 81,25 94,32 92,47 101,58 91,70 93,85 77,90 70,103 55,100 44,109 30,100 13,102 8,86 -4,77 1,62 -6,49 5,38 3,23 19,18 24,4 39,9" transform="translate(3 0) scale(0.94)" />
              <path d="M34 51.5 45 62 68 38" stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h1 className="mt-2 text-[24px] font-black tracking-tight text-ink">Account already verified</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-slate-500">Your identity has been verified. Some features may require additional authorization.</p>
          <p className="mt-4 text-[13.5px] font-semibold text-slate-600">Would you like to update your KYC information?</p>
          <div className="mt-4 space-y-2.5">
            <button onClick={() => router.push("/dashboard")} className="w-full rounded-2xl border border-slate-200 py-3.5 text-[15px] font-bold text-ink transition hover:border-slate-300">No, return to dashboard</button>
            <button onClick={() => { setMode("wizard"); setStep(1); }} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold to-gold2 py-3.5 text-[15px] font-extrabold text-navy2 shadow transition hover:brightness-105"><RefreshCw size={17} /> Yes, update</button>
          </div>
        </div>
      );
    }
    if (status === "pending" && latest) {
      return (
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-50"><Hourglass size={44} strokeWidth={1.6} className="text-amber-500" /></span>
          <h1 className="mt-4 text-[22px] font-extrabold text-ink">Verification in review</h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">Submitted {new Date(latest.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · {DOC_TYPES.find((d) => d.id === latest.docType)?.label} · <span className="font-mono">{latest.docNumber}</span></p>
          <div className="mt-4 flex justify-center gap-2">
            {[latest.frontImage, latest.backImage, latest.selfieImage].filter(Boolean).map((src, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={i} src={src as string} alt="" className="h-16 w-16 rounded-xl border border-slate-200 object-cover" />
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-2.5 text-[12px] font-semibold text-amber-800">Our compliance team reviews documents within 24 business hours. You&apos;ll get a push and SMS notification.</p>
          <button onClick={() => setMode("wizard")} className="mt-4 text-[12.5px] font-bold text-blue-600 hover:underline">Need to update your documents? Resubmit</button>
        </div>
      );
    }
  }

  /* ---------- done screen ---------- */
  if (done) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg"><FileCheck2 size={36} /></span>
        <h1 className="mt-4 text-[22px] font-extrabold text-emerald-900">Documents submitted</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-emerald-800">Your identity documents are now with our compliance team. Review usually takes less than 24 business hours — we&apos;ll notify you by SMS and in the app.</p>
        <button onClick={() => router.push("/dashboard")} className="mt-5 w-full rounded-2xl bg-navy py-3.5 text-[14.5px] font-bold text-white transition hover:bg-navy3">Back to dashboard</button>
      </div>
    );
  }

  if (status === "rejected" && mode === "status") {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-500"><ShieldX size={38} /></span>
        <h1 className="mt-4 text-[22px] font-extrabold text-red-700">Verification rejected</h1>
        <p className="mt-2 rounded-2xl bg-white px-4 py-3 text-[13px] font-semibold leading-snug text-red-700">{rejectionReason ?? "Your documents could not be verified."}</p>
        <button onClick={() => setMode("wizard")} className="mt-5 w-full rounded-2xl bg-gradient-to-b from-gold to-gold2 py-3.5 text-[15px] font-extrabold text-navy2 shadow transition hover:brightness-105"><span className="flex items-center justify-center gap-2"><RefreshCw size={17} /> Resubmit documents</span></button>
      </div>
    );
  }

  /* ---------- wizard ---------- */
  const stepTitles = ["Identity & document", "Photos of your document", "Take a selfie", "Review & submit"];
  const progress = ((step - 1) / 4) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      {status === "rejected" && mode === "wizard" && rejectionReason && (
        <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] font-semibold text-red-700"><ShieldX size={16} className="mt-0.5 shrink-0" /> Previous submission rejected: {rejectionReason}</div>
      )}

      {/* stepper */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Step {step} of 4</p>
          <p className="text-[12px] font-extrabold text-navy2">{stepTitles[step - 1]}</p>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold2 transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        {/* STEP 1 — identity & doc type */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="kyc-name" className="text-[13px] font-bold text-ink">Full name (as on document) <span className="text-red-500">*</span></label>
              <input id="kyc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Raymond Mensah" className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 px-4 text-[14.5px] outline-none focus:border-gold" />
            </div>
            <div>
              <label htmlFor="kyc-dob" className="text-[13px] font-bold text-ink">Date of birth</label>
              <input id="kyc-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 px-4 text-[14px] outline-none focus:border-gold" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-ink">Document type <span className="text-red-500">*</span></p>
              <div className="mt-1.5 grid grid-cols-3 gap-2.5">
                {DOC_TYPES.map((d) => {
                  const Icon = d.icon;
                  const active = docType === d.id;
                  return (
                    <button key={d.id} type="button" onClick={() => setDocType(d.id)} aria-pressed={active} className={`rounded-2xl border p-3.5 text-center transition ${active ? "border-gold bg-amber-50/50 ring-2 ring-gold/40" : "border-slate-200 hover:border-slate-300"}`}>
                      <Icon size={26} className={`mx-auto ${active ? "text-gold2" : "text-slate-400"}`} strokeWidth={1.7} />
                      <span className="mt-2 block text-[12px] font-extrabold leading-tight text-ink">{d.label}</span>
                      <span className="mt-0.5 hidden text-[9.5px] leading-tight text-slate-400 sm:block">{d.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label htmlFor="kyc-docnum" className="text-[13px] font-bold text-ink">{docType === "passport" ? "Passport number" : docType === "driver_license" ? "Licence number" : "CNI number"} <span className="text-red-500">*</span></label>
              <input id="kyc-docnum" value={docNumber} onChange={(e) => setDocNumber(e.target.value.toUpperCase())} placeholder={docType === "passport" ? "A12345678" : "CNI-000000000"} className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 px-4 font-mono text-[14px] outline-none placeholder:text-slate-300 focus:border-gold" />
            </div>
          </div>
        )}

        {/* STEP 2 — document photos */}
        {step === 2 && (
          <div className="space-y-4">
            <Dropzone label={`Front of ${selected.label}`} hint="PNG or JPG · up to 5MB · keep all 4 corners visible" value={frontImage} onChange={setFrontImage} />
            {selected.needsBack && (
              <Dropzone label={`Back of ${selected.label}`} hint="MRZ / barcode must be readable" value={backImage} onChange={setBackImage} />
            )}
            <p className="text-[11px] leading-snug text-slate-400">Photos are encrypted, stored securely and visible only to SDK Pay compliance officers. They are never shared with third parties except as required by law.</p>
          </div>
        )}

        {/* STEP 3 — selfie */}
        {step === 3 && <SelfieCapture value={selfie} onChange={setSelfie} />}

        {/* STEP 4 — review */}
        {step === 4 && (
          <div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <dl className="grid gap-2 text-[12.5px] sm:grid-cols-2">
                {[["Full name", name], ["Document", selected.label], ["Number", docNumber], ["Date of birth", dob || "—"]].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5"><dt className="text-slate-400">{k}</dt><dd className="text-right font-bold text-ink">{v}</dd></div>
                ))}
              </dl>
              <div className="mt-3 flex justify-center gap-2">
                {[frontImage, backImage, selfie].filter(Boolean).map((src, i) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={i} src={src as string} alt="" className="h-24 w-24 rounded-xl border border-slate-200 object-cover" />
                ))}
              </div>
            </div>
            <label className="mt-4 flex items-start gap-2.5 text-[12px] leading-snug text-slate-600">
              <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#f6c21a]" />
              <span>The information above is accurate and belongs to me. I consent to SDK Pay verifying my identity with official databases and credit bureaus as required for payment services.</span>
            </label>
            {error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[12.5px] font-semibold text-red-600">{error}</p>}
          </div>
        )}
      </div>

      {/* footer */}
      <div className="mt-4 flex items-center gap-3">
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="flex h-13 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-[15px] font-bold text-slate-600"><ChevronLeft size={18} /> Back</button>
        ) : (
          <button onClick={() => router.push("/dashboard")} className="h-13 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-[15px] font-bold text-slate-600">Later</button>
        )}
        {step < 4 ? (
          <button disabled={!canNext} onClick={() => setStep(step + 1)} className="flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold to-gold2 py-3.5 text-[15px] font-extrabold text-navy2 shadow transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40">Continue <ChevronRight size={18} strokeWidth={2.5} /></button>
        ) : (
          <button disabled={!canNext || pending} onClick={submit} className="flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-gold to-gold2 py-3.5 text-[15px] font-extrabold text-navy2 shadow transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40">
            {pending ? <Loader2 size={18} className="animate-spin" /> : <FileCheck2 size={18} />} Submit for review
          </button>
        )}
      </div>
    </div>
  );
}
