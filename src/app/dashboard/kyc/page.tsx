"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Check, Upload, Loader2, IdCard, RefreshCw } from "lucide-react";

export default function KycPage() {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState("pending");
  const [idType, setIdType] = useState("CNI");
  const [idNumber, setIdNumber] = useState("");
  const [frontName, setFrontName] = useState("");
  const [backName, setBackName] = useState("");
  const [frontUrl, setFrontUrl] = useState("");
  const [backUrl, setBackUrl] = useState("");

  function readDoc(file: File | undefined, setName: (v: string) => void, setUrl: (v: string) => void) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("Only image files are allowed (PNG/JPG).");
      return;
    }
    if (file.size > 600 * 1024) {
      setErr("Image too large (max 600KB each).");
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      setUrl(r.result as string);
      setName(file.name);
      setErr("");
    };
    r.readAsDataURL(file);
  }
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d.user && setStatus(d.user.kycStatus || "pending"))
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!idNumber.trim()) {
      setErr("Please enter your ID number.");
      return;
    }
    if (!frontName) {
      setErr("Please upload the front of your ID document.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idType, idNumber, frontName, backName, frontUrl, backUrl }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.error);
        return;
      }
      setStatus("review");
      setMsg("Documents received! Verification within 24 business hours.");
    } catch {
      setErr("Network error.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "verified" && !updating) {
    return (
      <div className="mx-auto max-w-xl rounded-[26px] border border-slate-200 bg-white p-8 text-center">
        <svg viewBox="0 0 120 120" className="mx-auto h-[103px] w-[103px]" aria-hidden>
          <path
            fill="#2f80ed"
            d="M60 4l9.6 7.2 11.4-3.4 5.7 10.3 11.9 1.3.9 11.9 10.3 5.7-3.4 11.4 7.2 9.6-7.2 9.6 3.4 11.4-10.3 5.7-.9 11.9-11.9 1.3-5.7 10.3-11.4-3.4-9.6 7.2-9.6-7.2-11.4 3.4-5.7-10.3-11.9-1.3-.9-11.9-10.3-5.7 3.4-11.4-7.2-9.6 7.2-9.6-3.4-11.4 10.3-5.7.9-11.9 11.9-1.3 5.7-10.3 11.4 3.4z"
          />
          <path d="M51 76l-14-14 7-7 7 7 19-19 7 7z" fill="#fff" />
        </svg>
        <h1 className="mt-5 text-[24px] font-extrabold tracking-tight text-slate-900">Account already verified</h1>
        <p className="mx-auto mt-2 max-w-md text-[14.5px] font-medium leading-relaxed text-slate-500">
          Your identity has been verified. Some features may require additional authorization.
        </p>
        <p className="mx-auto mt-5 max-w-md text-[14.5px] font-medium leading-relaxed text-slate-500">
          Would you like to update your KYC information?
        </p>
        <div className="mx-auto mt-5 max-w-md space-y-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-[14px] border border-slate-300 bg-white py-3.5 text-[15px] font-medium text-slate-900"
          >
            No, return to dashboard
          </button>
          <button
            onClick={() => setUpdating(true)}
            className="flex w-full items-center justify-center gap-2.5 rounded-[14px] py-3.5 text-[15px] font-bold text-white"
            style={{ background: "#f0a500" }}
          >
            <RefreshCw size={16.2} /> Yes, update
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-[24px] font-extrabold tracking-tight text-slate-900">KYC Verification</h1>
      <p className="text-[10.5px] font-medium text-slate-500">Verify your identity to unlock full limits</p>

      <div
        className={`mt-4 flex items-center gap-3 rounded-[24px] p-5 ${
          status === "verified" ? "bg-green-500" : status === "review" ? "bg-blue-600" : "bg-[#f0a500]"
        } text-white`}
      >
        <ShieldCheck size={23.4} />
        <div>
          <p className="text-[13.5px] font-extrabold">
            {status === "verified" ? "Verified ✓" : status === "review" ? "Under review" : "Not verified"}
          </p>
          <p className="text-[10px] font-medium text-white/80">
            {status === "verified"
              ? "Your account is fully verified. No limits."
              : status === "review"
                ? "Our team is checking your documents."
                : "Complete verification to collect & withdraw without limits."}
          </p>
        </div>
        <span className={`ml-auto rounded-lg px-3 py-1.5 text-[10px] font-extrabold ${status === "verified" ? "bg-white text-green-600" : "bg-white/20 text-white"}`}>
          {status === "verified" ? "Verified" : status === "review" ? "Review" : "Pending"}
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {[
          ["Email verified", true],
          ["Phone verified", true],
          ["ID document", status === "verified"],
          ["Liveness selfie", status === "verified"],
        ].map(([l, done]) => (
          <div key={l as string} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full ${done ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"}`}>
              <Check size={11.7} strokeWidth={3} />
            </span>
            <span className="text-[11.5px] font-bold">{l}</span>
            <span className={`ml-auto text-[10px] font-extrabold ${done ? "text-green-600" : "text-slate-400"}`}>
              {done ? "Done" : "Todo"}
            </span>
          </div>
        ))}
      </div>

      {status !== "verified" && (
        <form onSubmit={submit} className="mt-4 rounded-[26px] border border-slate-200 bg-white p-6">
          <h3 className="flex items-center gap-2 text-[13.5px] font-extrabold">
            <IdCard size={16.2} className="text-[#f0a500]" /> Submit your documents
          </h3>
          {err && <p className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-[10.5px] font-bold text-red-600">{err}</p>}
          {msg && <p className="mt-3 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-[10.5px] font-bold text-green-700">{msg}</p>}
          <div className="mt-4 space-y-3.5">
            <div>
              <p className="mb-2 text-[11px] font-extrabold">ID type</p>
              <div className="grid grid-cols-3 gap-2">
                {["CNI", "Passport", "Driving licence"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setIdType(t)}
                    className={`rounded-2xl border-2 px-2 py-3 text-[10px] font-extrabold ${idType === t ? "border-[#f0a500] bg-yellow-50" : "border-slate-200 text-slate-500"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-extrabold">ID number</p>
              <input
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Ex. 123456789"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-[11px] font-bold focus:border-yellow-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="flex cursor-pointer flex-col items-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 text-center hover:border-yellow-400">
                {frontUrl ? (
                  <img src={frontUrl} alt="ID front" className="h-28 w-full object-cover" />
                ) : (
                  <span className="flex flex-col items-center px-3 py-6">
                    <Upload size={17.1} className="text-slate-400" />
                    <span className="mt-1.5 text-[10px] font-extrabold">ID front *</span>
                  </span>
                )}
                <span className="w-full truncate bg-slate-50 px-2 py-1.5 text-[10px] font-bold text-slate-500">{frontName || "PNG/JPG, max 600KB"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => readDoc(e.target.files?.[0], setFrontName, setFrontUrl)} />
              </label>
              <label className="flex cursor-pointer flex-col items-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 text-center hover:border-yellow-400">
                {backUrl ? (
                  <img src={backUrl} alt="ID back" className="h-28 w-full object-cover" />
                ) : (
                  <span className="flex flex-col items-center px-3 py-6">
                    <Upload size={17.1} className="text-slate-400" />
                    <span className="mt-1.5 text-[10px] font-extrabold">ID back</span>
                  </span>
                )}
                <span className="w-full truncate bg-slate-50 px-2 py-1.5 text-[10px] font-bold text-slate-500">{backName || "PNG/JPG, max 600KB"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => readDoc(e.target.files?.[0], setBackName, setBackUrl)} />
              </label>
            </div>
            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#f0a500] py-4 text-[11.5px] font-extrabold text-white disabled:opacity-60"
            >
              {loading && <Loader2 size={14.4} className="animate-spin" />}
              {loading ? "Submitting..." : "Submit for verification"}
            </button>
            <p className="text-center text-[10px] font-medium text-slate-400">Documents are encrypted and reviewed within 24 business hours.</p>
          </div>
        </form>
      )}
    </div>
  );
}
