/** 3D illustrated icon served from /public/icons3d/<name>.webp (replaces emojis). */
export type Icon3DName =
  | "topup" | "receive" | "send" | "withdraw" | "payment" | "invoice" | "exchange"
  | "card" | "chart" | "wallet" | "mail" | "phone" | "chat" | "globe";

export function Icon3D({ name, size = 32, className = "" }: { name: Icon3DName; size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/icons3d/${name}.webp`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      draggable={false}
      loading="lazy"
      decoding="async"
      style={{ width: size, height: size }}
      className={`shrink-0 select-none object-contain ${className}`}
    />
  );
}

/** Transaction type -> icon (shared by dashboard list, shell and transactions page). */
export function txIconName(type: string): Icon3DName {
  switch (type) {
    case "deposit": return "receive";
    case "withdraw": return "withdraw";
    case "send_out": return "send";
    case "send_in": return "receive";
    case "payment_received": return "invoice";
    case "conversion": return "exchange";
    case "bonus": return "topup";
    default: return "wallet";
  }
}
