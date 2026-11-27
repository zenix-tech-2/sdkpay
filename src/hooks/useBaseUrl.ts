"use client";

import { useEffect, useState } from "react";

/** Client-side: the origin the app is currently served on (SSR renders a neutral placeholder). */
export function useBaseUrl(): string {
  const [base, setBase] = useState("https://your-domain");
  useEffect(() => {
    setBase(window.location.origin);
  }, []);
  return base;
}
