"use client";

import { usePathname } from "next/navigation";
import { AdminProvider } from "@/components/admin/AdminProvider";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSection } from "@/components/admin/AdminViews";

function AdminRoutes() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const section = parts[1] ?? "overview";
  return <AdminSection section={section} />;
}

export default function AdminApp() {
  return (
    <AdminProvider>
      <AdminShell><AdminRoutes /></AdminShell>
    </AdminProvider>
  );
}
