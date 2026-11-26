"use client";

import { useEffect, useState } from "react";
import { Icon3D } from "@/components/Icon3D";

/**
 * Country flag with a resilient online chain:
 * flagcdn.com (SVG) -> lipis flag-icons (jsDelivr) -> emoji fallback.
 * Works on all platforms (including Windows, where flag emojis don't render).
 */
export default function CountryFlag({
  code,
  emoji,
  size = 24,
  circle = false,
  className = "",
}: {
  code: string;
  emoji?: string;
  size?: number;
  circle?: boolean;
  className?: string;
}) {
  const cc = (code || "").trim().toLowerCase();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    setStage(0);
  }, [code]);

  if (cc === "usdt" || cc === "₮") {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-full font-extrabold text-white ${className}`}
        style={{ width: size, height: size, background: "#26A17B", fontSize: size * 0.6 }}
      >
        ₮
      </span>
    );
  }

  const isIso = /^[a-z]{2}$/.test(cc);
  const urls = isIso
    ? [
        `/flags/${cc}.svg`,
        `https://flagcdn.com/${cc}.svg`,
        `https://cdn.jsdelivr.net/gh/lipis/flag-icons@main/flags/4x3/${cc}.svg`,
      ]
    : [];

  if (stage < urls.length) {
    if (circle) {
      return (
        <span
          className={`relative block shrink-0 overflow-hidden rounded-full bg-slate-100 ${className}`}
          style={{ width: size, height: size }}
        >
          <img
            key={`${cc}-${stage}`}
            src={urls[stage]}
            alt={cc.toUpperCase()}
            loading="lazy"
            draggable={false}
            onError={() => setStage((s) => s + 1)}
            className="h-full w-full object-cover"
          />
        </span>
      );
    }
    return (
      <img
        key={`${cc}-${stage}`}
        src={urls[stage]}
        alt={cc.toUpperCase()}
        width={Math.round(size)}
        height={Math.round(size * 0.75)}
        loading="lazy"
        draggable={false}
        onError={() => setStage((s) => s + 1)}
        className={`shrink-0 rounded-[4px] object-cover shadow-sm ${className}`}
        style={{ width: size, height: size * 0.75 }}
      />
    );
  }

  return (
    <Icon3D name="globe" size={Math.round(size)} className={className} />
  );
}
