"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Phone, X, Send as SendIcon, ExternalLink, Plus, Loader2, MessageCircle, Star } from "lucide-react";
import { timeAgo } from "@/lib/format";
import { Icon3D } from "@/components/Icon3D";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  createdAt: string;
  replies?: { id: string; author: string; message: string; createdAt: string }[];
}

interface ChatMsg {
  from: "me" | "bot";
  text: string;
}

const FAQS = [
  ["How do I top up my account?", "Go to Deposit and choose your preferred payment method (Mobile Money or Crypto)."],
  ["How long does a withdrawal take?", "Withdrawals are processed within 24 business hours. Mobile Money is generally faster (a few minutes), crypto depends on network confirmations."],
  ["What are the fees?", "Mobile Money deposits, withdrawals, transfers and collections: 4%. Crypto deposits: 2.5%. Crypto withdrawals and transfers: 1 USDT flat. Internal transfers and XAF↔XOF conversions are free."],
  ["How do I verify my account?", "Open KYC from the menu and submit your ID. Verification takes less than 24 business hours."],
];

function botReply(q: string): string {
  const s = q.toLowerCase();
  if (s.includes("withdraw")) return "Withdrawals to Mobile Money usually arrive within minutes (max 24 business hours). Make sure your number is correct and your balance covers amount + 4% fee.";
  if (s.includes("deposit") || s.includes("top up") || s.includes("recharge"))
    return "To top up: go to Deposit → Mobile Money, pick your country and operator, enter your number and approve the prompt on your phone. Anything else I can help with?";
  if (s.includes("fee")) return "Our fees: 4% on Mobile Money operations, 2.5% on crypto deposits, 1 USDT flat on crypto withdrawals. Internal transfers are free!";
  if (s.includes("kyc") || s.includes("verif")) return "KYC verification takes under 24 business hours. You'll get a notification as soon as your documents are reviewed.";
  if (s.includes("link")) return "Create a payment link from My links → New link (4 steps), then share it on WhatsApp, Facebook or Instagram. Funds land in your wallet automatically.";
  if (s.includes("thank")) return "You're welcome! Don't hesitate if you need anything else.";
  return "Thanks for your message! An agent will reply in a few minutes. Meanwhile, you can browse the FAQ below or open a ticket with more details.";
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [modal, setModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");

  async function submitReview() {
    setReviewMsg("");
    const r = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment: reviewComment }),
    });
    if (!r.ok) {
      setReviewMsg("Could not send review.");
      return;
    }
    setReviewMsg("Thanks! Your review was sent for moderation.");
    setReviewComment("");
  }
  const [form, setForm] = useState({ subject: "", category: "general", message: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chat, setChat] = useState<ChatMsg[]>([
    { from: "bot", text: "Hello! Welcome to SDK Pay support. How can we help you today?" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [typing, setTyping] = useState(false);

  async function load() {
    const r = await fetch("/api/support");
    const d = await r.json();
    setTickets(d.tickets ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    setErr("");
    if (!form.subject.trim() || !form.message.trim()) {
      setErr("Subject and message are required.");
      return;
    }
    setLoading(true);
    const r = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) {
      setErr(d.error);
      return;
    }
    setModal(false);
    setForm({ subject: "", category: "general", message: "" });
    load();
  }

  function sendChat() {
    const text = chatInput.trim();
    if (!text) return;
    setChat((c) => [...c, { from: "me", text }]);
    setChatInput("");
    setTyping(true);
    setTimeout(() => {
      setChat((c) => [...c, { from: "bot", text: botReply(text) }]);
      setTyping(false);
    }, 1100);
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-[25px] font-extrabold tracking-tight text-slate-900">Support</h1>
      <p className="text-[15px] font-medium text-slate-500">How can we help you?</p>

      <p className="mt-6 text-[11px] font-bold tracking-[0.2em] text-slate-500">CONTACT US</p>
      <div className="mt-3 overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <button onClick={() => setChatOpen(true)} className="flex w-full items-center gap-4 border-b border-slate-200 p-5 text-left hover:bg-slate-50">
          <span className="relative flex h-[44.5px] w-[44.5px] shrink-0 items-center justify-center">
            <span className="absolute left-1 top-2 h-9 w-9 rounded-full bg-sky-400" />
            <span className="absolute bottom-2 right-1 h-7 w-7 rounded-full bg-green-400 ring-4 ring-white" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-bold text-slate-900">Live chat</span>
            <span className="block text-[12.5px] font-medium text-slate-500">Response in a few minutes</span>
          </span>
          <ChevronRight size={17.1} className="shrink-0 text-slate-300" />
        </button>
        <a href="mailto:support@sdkpay.com" className="flex w-full items-center gap-4 border-b border-slate-200 p-5 hover:bg-slate-50">
          <span className="flex h-[44.5px] w-[44.5px] shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-[27px] font-extrabold">
            <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-600 bg-clip-text text-transparent">M</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-bold text-slate-900">Email</span>
            <span className="block truncate text-[12.5px] font-medium text-slate-500">support@sdkpay.com</span>
          </span>
          <ChevronRight size={17.1} className="shrink-0 text-slate-300" />
        </a>
        <a href="https://wa.me/237683677872" target="_blank" className="flex w-full items-center gap-4 p-5 hover:bg-slate-50">
          <span className="flex h-[44.5px] w-[44.5px] shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
            <Phone size={22.5} fill="currentColor" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-bold text-slate-900">WhatsApp</span>
            <span className="block text-[12.5px] font-medium text-slate-500">+237683677872</span>
          </span>
          <ChevronRight size={17.1} className="shrink-0 text-slate-300" />
        </a>
      </div>

      {/* WhatsApp channel */}
      <div className="mt-4 rounded-[24px] border border-green-200 bg-green-50/60 p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-[44.5px] w-[44.5px] shrink-0 items-center justify-center rounded-2xl bg-[#25D366] text-white">
            <Phone size={22.5} fill="currentColor" />
          </span>
          <div>
            <p className="text-[16.5px] font-bold leading-snug text-slate-900">Join our WhatsApp channel</p>
            <p className="mt-1 text-[13.5px] font-medium leading-snug text-slate-500">
              Stay informed of the latest SDK Pay news and updates
            </p>
          </div>
        </div>
        <a
          href="https://wa.me/237683677872?text=Hello%20SDK%20Pay!"
          target="_blank"
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-green-300 bg-white/60 px-5 py-2.5 text-[15px] font-bold text-green-500"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white">
            <Phone size={12.6} fill="currentColor" />
          </span>
          Join the channel <ExternalLink size={16.2} />
        </a>
      </div>

      <p className="mt-7 text-[11px] font-bold tracking-[0.2em] text-slate-500">FREQUENTLY ASKED QUESTIONS</p>
      <div className="mt-3 overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        {FAQS.map(([q, a], i) => (
          <div key={q} className={`p-5 ${i > 0 ? "border-t border-slate-200" : ""}`}>
            <p className="text-[15px] font-bold text-slate-900">{q}</p>
            <p className="mt-1 text-[13.5px] font-medium leading-snug text-slate-500">{a}</p>
          </div>
        ))}
      </div>

      {/* tickets */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[14.5px] font-extrabold">
          <MessageCircle size={15.3} className="text-[#f0a500]" /> My tickets ({tickets.length})
        </h2>
        <button onClick={() => setModal(true)} className="flex items-center gap-1 rounded-full bg-slate-900 px-4 py-2 text-[10.5px] font-extrabold text-white">
          <Plus size={11.7} /> New ticket
        </button>
      </div>
      <div className="mt-2.5 space-y-2.5 pb-4">
        {tickets.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-[11px] font-semibold text-slate-400">
            No tickets yet. Open one and our team will reply within 24h.
          </p>
        )}
        {tickets.map((tk) => (
          <div key={tk.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <p className="flex-1 truncate text-[11.5px] font-extrabold">{tk.subject}</p>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${tk.status === "open" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                {tk.status.toUpperCase()}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-[10px] font-medium text-slate-500">{tk.message}</p>
            {(tk.replies ?? []).map((rp) => (
              <div key={rp.id} className={`mt-2 rounded-2xl px-3.5 py-2.5 text-[10px] font-medium ${rp.author === "admin" ? "bg-yellow-50 text-slate-800" : "bg-slate-50 text-slate-600"}`}>
                <span className="mb-0.5 block text-[10px] font-extrabold text-slate-400">
                  {rp.author === "admin" ? "Support" : "You"} • {timeAgo(rp.createdAt)}
                </span>
                {rp.message}
              </div>
            ))}
            <p className="mt-1.5 text-[10px] font-bold text-slate-400">{tk.category} • {timeAgo(tk.createdAt)}</p>
          </div>
        ))}
      </div>

      {/* leave a review */}
      <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-6">
        <h2 className="text-[14.5px] font-extrabold">Rate SDK Pay</h2>
        <p className="text-[10.5px] font-medium text-slate-500">Your feedback helps us improve.</p>
        <div className="mt-3 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} onClick={() => setRating(i)} aria-label={`${i} stars`}>
              <Star size={23.4} className={i <= rating ? "text-yellow-500" : "text-slate-200"} fill="currentColor" />
            </button>
          ))}
        </div>
        <textarea
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          placeholder="Tell us what you think (optional)..."
          rows={2}
          className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-medium"
        />
        {reviewMsg && <p className="mt-2 text-[10.5px] font-bold text-green-600">{reviewMsg}</p>}
        <button onClick={submitReview} className="mt-3 w-full rounded-full bg-slate-900 py-3 text-[11px] font-extrabold text-white">
          Send review
        </button>
      </div>

      {/* ticket modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(false)} />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6">
            <button onClick={() => setModal(false)} className="absolute right-4 top-4 text-slate-400"><X size={16.2} /></button>
            <h3 className="text-[15px] font-extrabold">New support ticket</h3>
            {err && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-[10px] font-bold text-red-600">{err}</p>}
            <div className="mt-4 space-y-3">
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-bold focus:border-yellow-500" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-bold">
                <option value="general">General question</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="links">Payment links</option>
                <option value="kyc">KYC verification</option>
                <option value="api">API integration</option>
              </select>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Describe your issue..." rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[11px] font-medium focus:border-yellow-500" />
              <button onClick={create} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#f0a500] py-3.5 text-[11.5px] font-extrabold text-white disabled:opacity-60">
                {loading && <Loader2 size={13.5} className="animate-spin" />} Send ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* live chat */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setChatOpen(false)} />
          <div className="relative flex h-[80vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white sm:h-[443.5px] sm:max-w-md sm:rounded-[28px]">
            <div className="flex items-center gap-3 bg-[#26247e] p-4 text-white">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-yellow-400"><Icon3D name="chat" size={25.2} />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 ring-2 ring-[#26247e]" />
              </span>
              <div className="flex-1">
                <p className="text-[11.5px] font-extrabold">SDK Pay Support</p>
                <p className="text-[10px] font-medium text-white/70">Online • replies in minutes</p>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/70"><X size={17.1} /></button>
            </div>
            <div className="flex-1 space-y-2.5 overflow-y-auto bg-slate-50 p-4">
              {chat.map((m, i) => (
                <div key={i} className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[11px] font-medium ${m.from === "me" ? "ml-auto bg-yellow-400 text-slate-900" : "bg-white text-slate-800 shadow-sm"}`}>
                  {m.text}
                </div>
              ))}
              {typing && (
                <div className="flex w-fit gap-1.5 rounded-2xl bg-white px-4 py-3 shadow-sm">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 border-t border-slate-100 p-3">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Type your message..."
                className="flex-1 rounded-full bg-slate-100 px-4 py-3 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button onClick={sendChat} className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-slate-900">
                <SendIcon size={15.3} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
