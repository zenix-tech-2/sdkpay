import Link from "next/link";

export function LogoMark({ size = 34 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo-mark.png" alt="SDK Pay" width={size} height={size} style={{ width: size, height: size }} />;
}

export default function Logo({ height = 40 }: { dark?: boolean; height?: number }) {
  return (
    <Link href="/" className="flex items-center shrink-0" aria-label="SDK Pay">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="SDK Pay" style={{ height, width: "auto" }} />
    </Link>
  );
}

export function LogoLarge() {
  return (
    <div className="flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="SDK Pay" style={{ height: 72, width: "auto" }} />
    </div>
  );
}
