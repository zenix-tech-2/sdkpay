"use client";

import { useEffect, useState } from "react";
import { operatorBrand } from "@/data/countries";
import { logoChain } from "@/data/operator-logos";

/**
 * Operator logo with a resilient online chain:
 * Wikimedia Commons -> Clearbit -> Simple Icons -> branded tile.
 * Never renders a broken image.
 */
export default function OperatorLogo({
  name,
  size = 62,
  radius = 18,
}: {
  name: string;
  size?: number;
  radius?: number;
}) {
  const urls = logoChain(name);
  const [stage, setStage] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setStage(0);
    setLoaded(false);
  }, [name]);

  if (stage < urls.length) {
    return (
      <span
        className="relative flex shrink-0 items-center justify-center overflow-hidden bg-white shadow-sm"
        style={{ width: size, height: size, borderRadius: radius }}
      >
        {!loaded && <span className="skeleton absolute inset-0" />}
        <img
          key={`${name}-${stage}`}
          src={urls[stage]}
          alt={name}
          width={size}
          height={size}
          loading="lazy"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setStage((s) => s + 1);
            setLoaded(false);
          }}
          className="h-full w-full object-contain p-[12%] transition-opacity duration-300"
          style={{ opacity: loaded ? 1 : 0 }}
        />
      </span>
    );
  }

  const b = operatorBrand(name);
  return (
    <span
      className="flex shrink-0 items-center justify-center px-1 text-center font-extrabold leading-tight shadow-sm"
      style={{ width: size, height: size, borderRadius: radius, background: b.bg, color: b.fg, fontSize: size * 0.19 }}
    >
      {b.short}
    </span>
  );
}
