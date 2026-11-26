"use client";

import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef3f8] px-4">
      <div className="w-full max-w-sm rounded-[26px] border border-slate-200 bg-white p-8 text-center shadow-xl">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
          <ShieldX size={26} />
        </span>
        <h1 className="mt-4 text-[19.5px] font-extrabold">Account suspended</h1>
        <p className="mt-1.5 text-[12px] font-medium text-slate-500">
          Your SDK Pay account has been suspended by our team. If you believe this is a mistake,
          please contact support@sdkpay.com.
        </p>
        <Link
          href="/login"
          className="mt-5 block rounded-full bg-slate-900 py-3.5 text-[12.5px] font-extrabold text-white"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
