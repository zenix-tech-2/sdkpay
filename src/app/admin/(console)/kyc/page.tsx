"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageTitle, Th, Td, Empty, statusPill, agoShort } from "@/components/admin/ui";

const TABS = ["pending", "approved", "rejected", "all"];

export default function AdminKyc() {
  const [rows, setRows] = useState<any[]>([]);
  const [tab, setTab] = useState("pending");

  useEffect(() => {
    fetch(`/api/admin/kyc?status=${tab}`)
      .then((r) => r.json())
      .then((d) => setRows(d.submissions ?? []))
      .catch(() => {});
  }, [tab]);

  return (
    <div>
      <PageTitle title="KYC approvals" sub="Review identity documents and applications" />
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-bold capitalize ${
              tab === t ? "bg-[#10132e] text-white" : "bg-white text-slate-600 shadow-sm"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[680px]">
          <thead>
            <tr className="border-b border-slate-100">
              <Th>Applicant</Th><Th>Document</Th><Th>Country</Th><Th>Submitted</Th><Th>Status</Th><Th right> </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((k) => (
              <tr key={k.id} className="border-b border-slate-50 last:border-0">
                <Td>
                  <span className="block font-bold">{k.fullName}</span>
                  <span className="block text-[12px] text-slate-400">{k.email}</span>
                </Td>
                <Td>{k.idType}</Td>
                <Td>{k.country}</Td>
                <Td>{agoShort(k.createdAt)}</Td>
                <Td>{statusPill(k.status)}</Td>
                <Td right>
                  <Link href={`/admin/kyc/${k.id}`} className="rounded-lg bg-[#10132e] px-3.5 py-1.5 text-[12.5px] font-bold text-white">
                    Review
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <Empty>No {tab} submissions.</Empty>}
      </div>
    </div>
  );
}
