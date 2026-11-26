"use client";

import { ProviderIcon } from "@/components/IconAssets";

export function OperatorLogo({ name, size = 56 }: { name: string; size?: number }) {
  return <ProviderIcon name={name} size={size} className="motion-pop" />;
}

export function UsdtLogo({ size = 36 }: { size?: number }) {
  return <ProviderIcon name="USDT" size={size} className="rounded-full" />;
}

export function TronLogo({ size = 36 }: { size?: number }) {
  return <ProviderIcon name="Tron" size={size} className="rounded-full" />;
}

export function BitcoinBadge({ size = 40 }: { size?: number }) {
  return <ProviderIcon name="Bitcoin" size={size} className="rounded-full" />;
}
