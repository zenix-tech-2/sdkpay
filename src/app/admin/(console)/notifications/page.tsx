"use client";

import { useEffect, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { PageTitle, agoShort } from "@/components/admin/ui";

export default function AdminNotifications() {
  const [scope, setScope] = useState<"broadcast" | "user">("broadcast");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");
  const [recent, setRecent] = useState<any[]>([]);

  async function load() {
    const r = await fetch("/api/admin/notify");
    const d = await r.json();
    setRecent(d.notifications ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function send() {
    setResult("");
    if (!title.trim() || !message.trim()) {
      setResult("Title and message required.");
      return;
    }
    setSending(true);
    try {
      const r = await fetch("/api/admin/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, email, title, message }),
      });
      const d = await r.json();
      if (!r.ok) {
        setResult(d.error);
        return;
      }
      setResult(`Sent to ${d.count} user${d.count === 1 ? "" : "s"}.`);
      setTitle("");
      setMessage("");
      setEmail("");
      load();
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <PageTitle title="Notifications" sub="Broadcast alerts to merchants" />
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          {(["broadcast", "user"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`rounded-2xl border-2 py-3 text-[12.5px] font-extrabold capitalize ${scope === s ? "border-yellow-400 bg-yellow-50" : "border-slate-200 text-slate-400"}`}
            >
              {s === "broadcast" ? "All users" : "Single user"}
            </button>
          ))}
        </div>
        {scope === "user" && (
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="User email"
            className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[12.5px] font-bold"
          />
        )}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[12.5px] font-bold"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message..."
          rows={3}
          className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-[12.5px] font-medium"
        />
        {result && <p className="mt-2 rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-bold">{result}</p>}
        <button
          onClick={send}
          disabled={sending}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#f0a500] py-3.5 text-[13px] font-extrabold text-white disabled:opacity-60"
        >
          {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          {sending ? "Sending..." : scope === "broadcast" ? "Broadcast to all" : "Send to user"}
        </button>
      </div>

      <p className="mb-2 mt-5 text-[12.5px] font-extrabold">Recently sent</p>
      <div className="space-y-2">
        {recent.map((n) => (
          <div key={n.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-[12.5px] font-extrabold">{n.title}</p>
            <p className="line-clamp-2 text-[11.5px] font-medium text-slate-500">{n.message}</p>
            <p className="mt-1 text-[10px] font-bold text-slate-400">{n.email || "—"} · {agoShort(n.createdAt)} · {n.isRead ? "read" : "unread"}</p>
          </div>
        ))}
        {recent.length === 0 && (
          <p className="rounded-2xl bg-white p-6 text-center text-[11.5px] font-semibold text-slate-400">Nothing sent yet.</p>
        )}
      </div>
    </div>
  );
}
