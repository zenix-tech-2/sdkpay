"use client";

import { useEffect, useState } from "react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export default function PwaInstall() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    try {
      if (localStorage.getItem("pwa-dismissed") === "1") setHidden(true);
    } catch {}
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    const onInstalled = () => setEvt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!evt || hidden) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] mx-auto flex max-w-sm items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="" className="h-11 w-11 rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900">Installer SDK Pay</p>
        <p className="text-xs text-slate-500">Accès rapide depuis votre écran d&apos;accueil</p>
      </div>
      <button
        onClick={async () => {
          await evt.prompt();
          setEvt(null);
        }}
        className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white"
      >
        Installer
      </button>
      <button
        aria-label="Fermer"
        onClick={() => {
          setHidden(true);
          try {
            localStorage.setItem("pwa-dismissed", "1");
          } catch {}
        }}
        className="text-slate-400 px-1 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
