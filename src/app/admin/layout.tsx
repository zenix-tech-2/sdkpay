import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./admin.css";

export const metadata: Metadata = {
  title: "SDK Pay Admin | SDK Pay",
  description: "Independent administration console for SDK Pay / SDK Pay operations.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-root">{children}</div>;
}
