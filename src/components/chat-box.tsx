"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Bot, X, User } from "lucide-react";

type Msg = { from: "bot" | "me"; text: string };

const REPLIES: [RegExp, string][] = [
  [/fee|charge|cost/i, "Fees are shown before every confirmation: Mobile Money is 4.00%, crypto deposits 2.5%, and internal transfers are always free. A verified referral gives you 50% off for 5 days."],
  [/withdraw/i, "Withdrawals are processed within 24 business hours. Mobile Money is generally faster — usually a few minutes once approved. Minimum is 550 XAF, maximum 2,000,000 XAF."],
  [/deposit|top.?up/i, "Go to Deposit, pick Mobile Money or Crypto, enter the amount and your number. Approve the prompt on your phone — funds usually land in under a minute."],
  [/link/i, "Payment links let anyone pay you with one URL. Create one from My links → New link, share it anywhere, and track clicks and collections in real time."],
  [/refund/i, "Refunds are issued to the original payment method within 1–3 business days after our team approves the request. Email refunds@sdkpay.com with the transaction reference."],
];

const FALLBACK = "Thanks! I've logged your question for our team — an agent will reply here within a few minutes. For urgent issues, WhatsApp +237 683 677 872.";

export default function ChatBox({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([
    { from: "bot", text: "Hi, I'm the SDK Pay assistant. Ask me anything about deposits, withdrawals, fees or payment links." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  if (!open) return null;

  const send = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "me", text }]);
    setInput("");
    setTyping(true);
    const [, reply] = REPLIES.find(([re]) => re.test(text)) ?? [null, FALLBACK];
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text: reply as string }]);
    }, 750);
  };

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg">
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-navy px-4 py-3 text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"><Bot size={19} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-extrabold">SDK Pay Support</span>
          <span className="flex items-center gap-1.5 text-[10.5px] text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online — replies in a few minutes</span>
        </span>
        <button onClick={onClose} aria-label="Close chat" className="rounded-lg p-1.5 text-white/70 hover:bg-white/10"><X size={17} /></button>
      </div>
      <div className="slim-scroll h-56 space-y-2.5 overflow-y-auto bg-slate-50/60 p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-2 ${m.from === "me" ? "flex-row-reverse" : ""}`}>
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${m.from === "me" ? "bg-gold/40 text-amber-800" : "bg-navy/10 text-navy3"}`}>
              {m.from === "me" ? <User size={13} /> : <Bot size={13} />}
            </span>
            <span className={`max-w-[78%] rounded-2xl px-3 py-2 text-[12.5px] leading-snug ${m.from === "me" ? "rounded-br-md bg-navy text-white" : "rounded-bl-md bg-white text-slate-700 shadow-sm"}`}>{m.text}</span>
          </div>
        ))}
        {typing && (
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy/10 text-navy3"><Bot size={13} /></span>
            <span className="flex gap-1 rounded-2xl bg-white px-3 py-2.5 shadow-sm">{[0, 1, 2].map((i) => <span key={i} className="dot-blink h-1.5 w-1.5 rounded-full bg-slate-400" />)}</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex flex-wrap gap-1.5 border-t border-slate-100 p-2">
        {["Deposit not received", "Fees", "Payment links"].map((q) => (
          <button key={q} onClick={() => send(q)} className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-500 transition hover:border-gold hover:text-amber-800">{q}</button>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-slate-100 p-2.5">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Write a message…" className="h-11 flex-1 rounded-xl border border-slate-200 px-3 text-[13px] outline-none focus:border-gold" aria-label="Chat message" />
        <button onClick={() => send()} aria-label="Send" className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-white transition hover:bg-navy3"><Send size={17} /></button>
      </div>
    </div>
  );
}
