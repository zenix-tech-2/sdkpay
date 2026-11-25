"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Global route transition — every page rises in softly on navigation. */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    setShown(false);
    const t = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(t);
  }, [pathname]);

  return (
    <div
      className="transition-all duration-500 ease-out"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(14px)",
      }}
    >
      {children}
    </div>
  );
}
