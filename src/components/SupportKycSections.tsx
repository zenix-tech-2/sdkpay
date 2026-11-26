"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, ExternalLink, Mail, MessageCircle, Phone, RefreshCw, Send, ShieldCheck, X } from "lucide-react";
import { useDashboard } from "@/components/DashboardShell";

const fieldClass = "h-[52px] w-full rounded-[12px] border border-[#dce5f3] bg-white px-4 text-[14px] text-[#25314d] outline-none focus:border-[#ffb800]";

function BlueBadge() {
  return (
    <div className="mx-auto flex h-[120px] w-[120px] items-center justify-center bg-[#2f9be0]" style={{ clipPath: "polygon(50% 0%, 61% 13%, 76% 7%, 82% 22%, 98% 25%, 91% 39%, 100% 52%, 89% 64%, 94% 80%, 78% 83%, 71% 98%, 56% 90%, 43% 100%, 33% 87%, 17% 91%, 13% 75%, 0% 67%, 8% 52%, 0% 37%, 16% 30%, 14% 14%, 30% 15%, 39% 2%)" }}>
      <Check size={56} strokeWidth={4} className="text-white" />
    </div>
  );
}

function GmailIcon() {
  return <span className="flex h-[42px] w-[42px] items-center justify-center rounded-[10px] border border-[#f1e6c8] bg-white text-[25px] font-black"><span className="text-[#4285F4]">M</span><span className="-ml-[13px] text-[#EA4335]">/</span></span>;
}

function WhatsAppIcon({ size = 42 }: { size?: number }) {
  return <span className="flex shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white" style={{ width: size, height: size }}><Phone size={size * 0.52} fill="white" strokeWidth={1.5} /></span>;
}

export function KycVerifiedSection() {
  const router = useRouter();
  const { data } = useDashboard();
  const [updateOpen, setUpdateOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [documentType, setDocumentType] = useState("National ID");
  const [documentNumber, setDocumentNumber] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (data?.user.fullName) setFullName(data.user.fullName); }, [data?.user.fullName]);
  if (!data) return <div className="h-96 animate-pulse rounded-2xl bg-[#e6ecf7]" />;

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setSent(false);
    const res = await fetch("/api/kyc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName, documentType, documentNumber }) });
    const json = await res.json();
    if (res.ok) { setSent(true); setDocumentNumber(""); }
    else setError(json.error ?? "Impossible d'envoyer la mise à jour");
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="rounded-[20px] border border-[#dce5f3] bg-white px-6 py-10 text-center sm:px-10">
        <BlueBadge />
        <h1 className="font-display mt-8 text-[28px] font-extrabold text-[#111b36] sm:text-[34px]">Account already verified</h1>
        <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-relaxed text-[#6d7d9e]">Your identity has been verified. Some features may require additional authorization.</p>
        <p className="mx-auto mt-6 max-w-[420px] text-[15px] leading-relaxed text-[#6d7d9e]">Would you like to update your KYC information?</p>
        <button onClick={() => router.push("/dashboard")} className="mt-7 h-[58px] w-full rounded-[14px] border border-[#dce5f3] bg-white text-[16px] font-bold text-[#17213d]">No, return to dashboard</button>
        <button onClick={() => setUpdateOpen(!updateOpen)} className="brand-btn mt-3 flex h-[58px] w-full items-center justify-center gap-2 rounded-[14px] text-[16px]"><RefreshCw size={18} /> Yes, update</button>
      </div>

      {updateOpen && (
        <form onSubmit={submit} className="mt-5 rounded-[20px] border border-[#dce5f3] bg-white p-6">
          <h2 className="flex items-center gap-2 text-[18px] font-extrabold text-[#17213d]"><ShieldCheck size={19} className="text-[#e5a300]" /> Update KYC information</h2>
          <div className="mt-4 space-y-3">
            <label className="block text-[13px] font-bold text-[#5d6882]">Full name<input value={fullName} onChange={(e) => setFullName(e.target.value)} className={`${fieldClass} mt-2`} /></label>
            <label className="block text-[13px] font-bold text-[#5d6882]">Document type<select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className={`${fieldClass} mt-2`}><option>National ID</option><option>Passport</option><option>Residence permit</option></select></label>
            <label className="block text-[13px] font-bold text-[#5d6882]">Document number<input value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder="Document number" className={`${fieldClass} mt-2`} /></label>
          </div>
          <button className="brand-btn mt-5 h-[52px] w-full rounded-[12px] text-[15px]">Submit update</button>
          {sent && <p className="mt-3 rounded-lg bg-[#e3f6eb] px-3 py-2 text-[12px] font-bold text-[#218c55]">✓ Your KYC update request has been recorded.</p>}
          {error && <p className="mt-3 text-[12px] font-semibold text-[#c83c3c]">{error}</p>}
        </form>
      )}
    </div>
  );
}

export function SupportHubSection() {
  const { data } = useDashboard();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatSent, setChatSent] = useState(false);

  async function sendChat() {
    if (!chatMessage.trim()) return;
    await fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data?.user.email ?? "support@sdkpay.com", message: chatMessage }) });
    setChatSent(true); setChatMessage("");
    setTimeout(() => setChatSent(false), 4000);
  }

  const rows = [
    { title: "Live chat", subtitle: "Response in a few minutes", icon: <span className="flex h-[42px] w-[42px] items-center justify-center rounded-[10px] border border-[#f1e6c8] bg-white"><span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#34a853] text-white"><MessageCircle size={15} /><span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#4285f4]" /></span></span>, action: () => setChatOpen(true) },
    { title: "Email", subtitle: "support@sdkpay.com", icon: <GmailIcon />, href: "mailto:support@sdkpay.com" },
    { title: "WhatsApp", subtitle: "+237683677872", icon: <WhatsAppIcon />, href: "https://wa.me/237683677872" },
  ];

  return (
    <div className="mx-auto max-w-[760px]">
      <h1 className="font-display text-[31px] font-extrabold text-[#111b36] sm:text-[38px]">Support</h1>
      <p className="mt-1 text-[15px] text-[#6d7d9e]">How can we help you?</p>

      <h2 className="mt-7 text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">CONTACT US</h2>
      <div className="mt-3 divide-y divide-[#e5ebf5] overflow-hidden rounded-[18px] border border-[#dce5f3] bg-white">
        {rows.map((row) => {
          const content = <><span>{row.icon}</span><div className="min-w-0 flex-1"><p className="text-[16px] font-bold text-[#17213d]">{row.title}</p><p className="mt-0.5 text-[13px] text-[#6d7d9e]">{row.subtitle}</p></div><ChevronRight size={20} className="text-[#8b96b0]" /></>;
          return row.href ? (
            <a key={row.title} href={row.href} target={row.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-4 px-5 py-4 hover:bg-[#f8fbff]">{content}</a>
          ) : (
            <button key={row.title} onClick={row.action} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-[#f8fbff]">{content}</button>
          );
        })}
      </div>

      <div className="mt-5 rounded-[20px] border border-[#a9e5c2] bg-[#effbf4] p-5">
        <div className="flex items-start gap-4"><WhatsAppIcon size={54} /><div><h2 className="text-[18px] font-extrabold text-[#17213d]">Join our WhatsApp channel</h2><p className="mt-1 text-[14px] leading-relaxed text-[#5d6882]">Stay informed of the latest SDK Pay news and updates</p></div></div>
        <a href="https://wa.me/237683677872" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-[12px] border border-[#8fd5ad] bg-white/70 px-4 py-3 text-[14px] font-bold text-[#1a9d55]"><Phone size={16} fill="#1a9d55" /> Join the channel <ExternalLink size={15} /></a>
      </div>

      <h2 className="mt-8 text-[12px] font-extrabold tracking-[.15em] text-[#6d7d9e]">FREQUENTLY ASKED QUESTIONS</h2>
      <div className="mt-3 divide-y divide-[#e5ebf5] overflow-hidden rounded-[18px] border border-[#dce5f3] bg-white">
        {[
          ["How do I top up my account?", "Go to Deposit and choose your preferred payment method (Mobile Money or Crypto)."],
          ["How long does a withdrawal take?", "Withdrawals are processed within 24 business hours. Mobile Money is generally faster (a few minutes), while crypto withdrawals depend on the blockchain network."],
          ["How do I use the API?", "Open API → Direct API, copy your API key, and follow the quick example or read the full documentation."],
          ["Are internal transfers free?", "Yes. SDK Pay internal transfers between verified accounts have no fees and are credited instantly."],
        ].map(([question, answer]) => (
          <details key={question} className="group px-5 py-5"><summary className="cursor-pointer list-none text-[16px] font-extrabold text-[#17213d]">{question}</summary><p className="mt-3 text-[14px] leading-relaxed text-[#6d7d9e]">{answer}</p></details>
        ))}
      </div>

      {chatOpen && (
        <div className="fixed bottom-5 right-5 z-[60] w-[320px] rounded-[18px] border border-[#dce5f3] bg-white p-4 shadow-2xl">
          <div className="flex items-center justify-between"><h3 className="text-[15px] font-extrabold text-[#17213d]">Live chat</h3><button onClick={() => setChatOpen(false)}><X size={17} /></button></div>
          <p className="mt-2 rounded-lg bg-[#f5f8ff] p-3 text-[12px] text-[#5d6882]">👋 Hi! Our team usually replies in a few minutes.</p>
          <textarea value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Write your message..." className="mt-3 h-24 w-full resize-none rounded-[12px] border border-[#dce5f3] p-3 text-[13px] outline-none focus:border-[#ffb800]" />
          {chatSent && <p className="mt-2 text-[12px] font-bold text-[#218c55]">✓ Message sent</p>}
          <button onClick={() => void sendChat()} className="brand-btn mt-3 flex h-[46px] w-full items-center justify-center gap-2 rounded-[12px] text-[13px]"><Send size={15} /> Send</button>
        </div>
      )}
    </div>
  );
}
