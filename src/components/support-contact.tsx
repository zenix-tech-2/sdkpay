"use client";

import { useState } from "react";
import ChatBox from "@/components/chat-box";
import { MessageCircle, Mail, ChevronRight } from "lucide-react";

export default function SupportContact({ children }: { children?: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);

  const channels = [
    { icon: <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-emerald-400"><MessageCircle size={22} className="text-white" /></span>, title: "Live chat", sub: "Response in a few minutes", action: () => setChatOpen((v) => !v) },
    { icon: <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200"><Mail size={22} className="text-red-500" /></span>, title: "Email", sub: "support@sdkpay.com", href: "mailto:support@sdkpay.com" },
    { icon: <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#25D366]"><svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.1.55 4.14 1.6 5.95L2.05 22l4.33-1.13c1.73.94 3.68 1.44 5.66 1.44h.01c5.46 0 9.9-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.52 14.12c-.24.67-1.4 1.28-1.93 1.36-.49.07-1.12.1-1.8-.11-.42-.13-.95-.31-1.63-.6-2.88-1.24-4.75-4.14-4.9-4.34-.14-.2-1.16-1.55-1.16-2.95 0-1.4.73-2.09 1-2.38.26-.29.57-.36.76-.36h.55c.17 0 .4-.07.63.48.24.57.81 1.98.88 2.13.07.14.12.31.02.5-.1.2-.15.31-.3.48-.14.17-.3.37-.43.5-.15.14-.3.3-.13.58.17.29.77 1.27 1.66 2.06 1.14 1.01 2.1 1.32 2.4 1.47.29.15.46.12.63-.07.17-.2.73-.86.93-1.15.19-.29.38-.24.64-.14.26.1 1.68.79 1.97.93.29.15.48.22.55.34.07.12.07.68-.17 1.34z"/></svg></span>, title: "WhatsApp", sub: "+237 683 677 872", href: "https://wa.me/237683677872" },
  ];

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {channels.map((c, i) => {
          const inner = (
            <>
              {c.icon}
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-extrabold text-ink">{c.title}</span>
                <span className="block text-[12.5px] text-slate-500">{c.sub}</span>
              </span>
              <ChevronRight size={18} className="text-slate-300" />
            </>
          );
          const cls = `flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-slate-50 ${i > 0 ? "border-t border-slate-100" : ""}`;
          return c.href ? (
            <a key={c.title} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={cls}>{inner}</a>
          ) : (
            <button key={c.title} onClick={c.action} className={cls}>{inner}</button>
          );
        })}
      </div>

      <ChatBox open={chatOpen} onClose={() => setChatOpen(false)} />
      {children}
    </div>
  );
}
