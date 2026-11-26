"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AdminBootstrapData } from "@/lib/admin-types";

type ActionResult = { ok: boolean; error?: string };
type AdminContextValue = {
  data: AdminBootstrapData | null;
  loading: boolean;
  refresh: () => Promise<void>;
  action: (entity: string, action: string, id?: number, payload?: Record<string, unknown>) => Promise<ActionResult>;
  notify: (message: string, tone?: "success" | "error") => void;
  notice: { message: string; tone: "success" | "error" } | null;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin must be used inside AdminProvider");
  return value;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<AdminBootstrapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  const notify = useCallback((message: string, tone: "success" | "error" = "success") => {
    setNotice({ message, tone });
    setTimeout(() => setNotice(null), 3200);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/data", { cache: "no-store" });
      if (res.status === 401) { if (pathname !== "/admin/login") router.push("/admin/login"); return; }
      const json = await res.json();
      if (res.ok) setData(json);
    } finally { setLoading(false); }
  }, [pathname, router]);

  useEffect(() => { void refresh(); }, [refresh]);

  const action = useCallback(async (entity: string, actionName: string, id = 0, payload: Record<string, unknown> = {}) => {
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity, action: actionName, id, payload }),
      });
      const json = await res.json();
      if (!res.ok) { notify(json.error ?? "Action impossible", "error"); return { ok: false, error: json.error }; }
      await refresh();
      notify("✓ Action enregistrée");
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Action impossible";
      notify(message, "error");
      return { ok: false, error: message };
    }
  }, [refresh, notify]);

  const value = useMemo(() => ({ data, loading, refresh, action, notify, notice }), [data, loading, refresh, action, notify, notice]);
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
