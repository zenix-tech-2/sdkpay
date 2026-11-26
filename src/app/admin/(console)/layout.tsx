import { redirect } from "next/navigation";
import { adminFromRequest } from "@/lib/admin-auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  const admin = await adminFromRequest();
  if (!admin) redirect("/admin/login");
  return <AdminShell admin={admin}>{children}</AdminShell>;
}
