import Link from "next/link";
import {
  ArrowRight, ShieldCheck, Zap, Check, ChevronRight, Code2, Star,
  Landmark, CirclePlay, ArrowDownToLine,
} from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { getCoverageCatalog } from "@/lib/catalog";
import { LandingNav, Reveal, Counter } from "@/components/landing/motion";

const VIDEOS = {
  heroMain: {
    src: "https://videos.pexels.com/video-files/39681326/16921036_1080_1920_30fps.mp4",
    poster: "https://images.pexels.com/videos/39681326/pexels-photo-39681326.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=630",
  },
  heroSide: {
    src: "https://videos.pexels.com/video-files/5794430/5794430-uhd_2160_3840_25fps.mp4",
    poster: "https://images.pexels.com/videos/5794430/pexels-photo-5794430.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=630",
  },
  action: [
    { src: "https://videos.pexels.com/video-files/7567650/7567650-hd_1080_1920_25fps.mp4", poster: "https://images.pexels.com/videos/7567650/pexels-photo-7567650.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=630", label: "Pay with your phone, anywhere", tag: "Merchants", time: "0:10" },
    { src: "https://videos.pexels.com/video-files/8541111/8541111-hd_1080_1920_30fps.mp4", poster: "https://images.pexels.com/videos/8541111/abundance-adult-agriculture-apple-8541111.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=630", label: "Markets run on Mobile Money", tag: "Everyday trade", time: "0:17" },
    { src: "https://videos.pexels.com/video-files/6898096/6898096-hd_1080_1920_25fps.mp4", poster: "https://images.pexels.com/videos/6898096/banking-book-buying-cardboard-6898096.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=630", label: "Checkout in seconds, online", tag: "E-commerce", time: "0:14" },
  ],
};

const SERVICES = [
  { img: "/icons3d/deposit.svg", title: "Mobile Money Collection", desc: "MTN, Orange Money, Wave — direct USSD push.", fee: "4.00%", tint: "bg-emerald-50" },
  { img: "/icons3d/withdraw.svg", title: "Instant Payouts", desc: "Pay anyone Mobile Money, 24/7.", fee: "4.00%", tint: "bg-orange-50" },
  { img: "/icons3d/link.svg", title: "Payment Links & QR", desc: "One link for WhatsApp, socials or print.", fee: "4.00%", tint: "bg-violet-50" },
  { img: "/icons3d/send.svg", title: "Send & Internal Transfers", desc: "SDK Pay → SDK Pay, instant and free.", fee: "Free", tint: "bg-sky-50" },
  { img: "/icons3d/chart.svg", title: "USDT Wallet (Tron)", desc: "Accept, hold and convert USDT.", fee: "2.50%", tint: "bg-amber-50" },
  { img: "/icons3d/link.svg", title: "Merchant Dashboard", desc: "Live balance, volume charts, CSV export.", fee: "Included", tint: "bg-rose-50" },
  { img: "/icons3d/chart.svg", title: "Subscriptions", desc: "Collect recurring payments by ID.", fee: "Soon", tint: "bg-cyan-50" },
  { img: "/icons3d/link.svg", title: "Receipts & Invoicing", desc: "Share branded receipts automatically.", fee: "Included", tint: "bg-lime-50" },
];

const NETWORKS = [
  { name: "MTN Money", color: "#ffcb05", text: "#111" },
  { name: "Orange Money", color: "#ff7900", text: "#fff" },
  { name: "Wave", color: "#00aaff", text: "#fff" },
  { name: "Moov Money", color: "#0057a8", text: "#fff" },
  { name: "Airtel Money", color: "#e40000", text: "#fff" },
  { name: "M-Pesa", color: "#4bb748", text: "#fff" },
  { name: "Celtiis", color: "#1b3a6b", text: "#fff" },
  { name: "Flooz", color: "#f47b20", text: "#fff" },
];

export default async function HomePage() {
  const [user, catalog] = await Promise.all([getSessionUser(), getCoverageCatalog()]);
  const openAppHref = user ? "/dashboard" : "/signup";
  const openAppLabel = user ? "Open dashboard" : "Get the app";

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#141B3D]">
      <LandingNav openAppHref={openAppHref} openAppLabel={openAppLabel} />

      {/* ============ HERO — light editorial ============ */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(52rem 36rem at 88% -10%, rgba(255,189,13,0.28), transparent 55%), radial-gradient(40rem 30rem at -10% 40%, rgba(46,107,235,0.10), transparent 55%)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.5]" style={{ backgroundImage: "radial-gradient(rgba(20,27,61,0.08) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pb-20">
          <div className="lg:col-span-6">
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#141B3D]/10 bg-white py-1.5 pl-1.5 pr-4 text-[10.5px] font-extrabold uppercase tracking-[0.2em] text-[#141B3D]/70 shadow-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFBD0D]"><Zap size={11} strokeWidth={3} className="text-[#141B3D]" /></span>
                Integrate · Pay · Grow
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 text-[46px] font-black leading-[0.98] tracking-tight text-[#141B3D] sm:text-[64px] xl:text-[72px]">
                Pay anyone.<br />
                Anywhere.<br />
                <span className="relative inline-block text-[#E0A800]">In seconds.
                  <svg viewBox="0 0 220 14" className="absolute -bottom-2 left-0 w-full" fill="none"><path d="M3 10c60-6 150-7 214 0" stroke="#FFBD0D" strokeWidth="6" strokeLinecap="round" opacity="0.9" /></svg>
                </span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[#141B3D]/65">One account for Mobile Money, USDT, payment links and payouts — with fees shown upfront and settlements in seconds. Built for African businesses of every size.</p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={openAppHref} className="group flex h-14 items-center gap-2 rounded-2xl bg-[#141B3D] px-7 text-[15px] font-extrabold text-[#FFBD0D] shadow-[0_12px_32px_rgba(20,27,61,0.30)] transition hover:bg-[#1D2450] active:scale-[0.98]">
                  {openAppLabel}<ArrowRight size={17} strokeWidth={2.6} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <a href="#services" className="flex h-14 items-center gap-2 rounded-2xl border border-[#141B3D]/15 bg-white px-7 text-[15px] font-bold text-[#141B3D] transition hover:border-[#141B3D]/30">Explore services</a>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2.5">
                  {[["AM", "#FFBD0D"], ["JF", "#141B3D"], ["RK", "#7A2BE2"], ["BS", "#0e9f6e"]].map(([i, bg]) => (
                    <span key={i} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#FBFBF9] text-[10px] font-black text-white" style={{ backgroundColor: bg }}>{i}</span>
                  ))}
                </div>
                <div>
                  <p className="flex items-center gap-1">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} fill="#FFBD0D" className="text-[#FFBD0D]" />)}<span className="ml-1 text-[13px] font-extrabold text-[#141B3D]">4.9</span></p>
                  <p className="text-[11px] font-semibold text-[#141B3D]/50">2,400+ businesses already collecting</p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* hero video cluster */}
          <div className="relative mx-auto w-full max-w-[480px] lg:col-span-6">
            <div className="relative overflow-hidden rounded-[28px] border border-[#141B3D]/10 shadow-[0_40px_80px_-24px_rgba(20,27,61,0.45)]">
              <video className="aspect-[4/5] w-full object-cover sm:aspect-[5/5]" src={VIDEOS.heroMain.src} poster={VIDEOS.heroMain.poster} autoPlay muted loop playsInline preload="metadata" aria-label="Vendors accepting Mobile Money at a market" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0F2C]/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-white backdrop-blur"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FFBD0D]" />Live · Douala market</p>
                  <p className="mt-1.5 text-[15px] font-extrabold leading-tight text-white">Every stall,<br />a payment terminal</p>
                </div>
              </div>
            </div>

            {/* floating secondary video */}
            <div className="absolute -bottom-6 -left-4 w-32 overflow-hidden rounded-2xl border-4 border-[#FBFBF9] shadow-2xl sm:-left-10 sm:w-40">
              <video className="aspect-[9/16] w-full object-cover" src={VIDEOS.heroSide.src} poster={VIDEOS.heroSide.poster} autoPlay muted loop playsInline preload="metadata" aria-label="Customer paying cashless" />
            </div>

            {/* floating stat chips */}
            <div className="absolute -right-2 top-6 flex items-center gap-2 rounded-2xl border border-[#141B3D]/10 bg-white/90 py-2 pl-2 pr-3 shadow-xl backdrop-blur sm:-right-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100"><ArrowDownToLine size={15} className="text-emerald-600" /></span>
              <span><span className="block text-[11.5px] font-extrabold leading-tight text-[#141B3D]">+13 248 FCFA</span><span className="block text-[9px] font-semibold leading-tight text-[#141B3D]/50">Orange Money · 2s</span></span>
            </div>
            <div className="absolute right-6 top-36 hidden items-center gap-2 rounded-2xl border border-[#141B3D]/10 bg-white/90 py-2 pl-2 pr-3 shadow-xl backdrop-blur md:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FEF6DC]"><Zap size={15} className="text-[#E0A800]" /></span>
              <span><span className="block text-[11.5px] font-extrabold leading-tight text-[#141B3D]">Payout sent</span><span className="block text-[9px] font-semibold leading-tight text-[#141B3D]/50">12 710 FCFA → MTN</span></span>
            </div>
          </div>
        </div>

        {/* networks strip */}
        <div className="relative border-t border-[#141B3D]/[0.06] bg-white/60 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-4 sm:px-6 lg:justify-between lg:px-8">
            <p className="text-[9.5px] font-extrabold uppercase tracking-[0.3em] text-[#141B3D]/40">Powered by</p>
            {NETWORKS.map((n) => (
              <span key={n.name} className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-tight text-[#141B3D]/55">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: n.color }} />{n.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section id="services" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-lg">
            <p className="text-[10.5px] font-extrabold uppercase tracking-[0.3em] text-[#E0A800]">Services</p>
            <h2 className="mt-2 text-[34px] font-black leading-[1.02] tracking-tight text-[#141B3D] sm:text-[46px]">Everything you need<br />to <span className="text-[#E0A800]">get paid.</span></h2>
          </div>
          <Link href="/signup" className="group flex items-center gap-1.5 text-[13px] font-extrabold text-[#141B3D] hover:text-[#E0A800] transition-colors">Start free <ArrowRight size={15} strokeWidth={2.6} className="transition-transform group-hover:translate-x-1" /></Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
          {SERVICES.map((s) => (
            <div key={s.title} className="group flex flex-col rounded-3xl border border-[#141B3D]/[0.07] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#FFBD0D] hover:shadow-[0_24px_50px_-20px_rgba(20,27,61,0.35)] lg:p-5">
              <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${s.tint} lg:h-[4.5rem] lg:w-[4.5rem]`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt="" width={52} height={52} className="h-11 w-11 object-contain transition-transform duration-300 group-hover:scale-110 lg:h-12 lg:w-12" />
              </span>
              <h3 className="mt-3 text-[13px] font-extrabold leading-snug tracking-tight text-[#141B3D] lg:text-[14px]">{s.title}</h3>
              <p className="mt-1 flex-1 text-[10.5px] leading-snug text-[#141B3D]/55 lg:text-[11px]">{s.desc}</p>
              <span className="mt-2 inline-flex w-fit rounded-full bg-[#141B3D]/5 px-2.5 py-1 text-[9.5px] font-extrabold text-[#141B3D]/70">{s.fee}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ COVERAGE — live provider data ============ */}
      <section id="coverage" className="border-y border-[#141B3D]/[0.07] bg-[#141B3D] text-white">
        <div className="mx-auto grid max-w-7xl scroll-mt-20 items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-4">
            <p className="text-[10.5px] font-extrabold uppercase tracking-[0.3em] text-[#FFBD0D]">Coverage — live</p>
            <h2 className="mt-2 text-[34px] font-black leading-[1.02] tracking-tight sm:text-[46px]">{catalog.countries.length} countries.<br /><span className="text-white/40">One integration.</span></h2>
            <p className="mt-4 text-[14px] leading-relaxed text-white/60">Fetched live from the provider catalogs{catalog.source === "live" ? ", refreshed hourly" : ""} — {catalog.totalActive} active markets on SasPay alone. AshTech Pay is the primary rail{process.env.ASHTECH_API_KEY ? " (connected)" : ""} with SasPay failover.</p>
            <div className="mt-6 space-y-2 text-[12px] font-semibold text-white/65">
              <p className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> AshTech Pay — primary rail</p>
              <p className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 rounded-full bg-violet-500" /> SasPay — automatic backup</p>
              <p className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 rounded-full bg-[#FFBD0D]" /> Served by both rails</p>
            </div>
            <Link href={openAppHref} className="group mt-7 inline-flex h-12 items-center gap-1.5 rounded-xl bg-[#FFBD0D] px-6 text-[14px] font-extrabold text-[#232054] transition hover:brightness-105">Start collecting <ArrowRight size={16} strokeWidth={2.6} className="transition-transform group-hover:translate-x-1" /></Link>
          </div>
          <div className="lg:col-span-8">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-7">
              {catalog.countries.map((c) => (
                <div key={c.code} className="group rounded-2xl border border-white/[0.06] bg-white/[0.04] p-2.5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.09]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://flagcdn.com/w80/${c.code}.png`} alt={c.name} loading="lazy" className="mx-auto h-5 w-7 rounded-[4px] object-cover shadow" />
                  <p className="mt-1.5 flex items-center justify-center gap-1 text-[10px] font-extrabold uppercase text-white/85">{c.code}<span className={`h-1.5 w-1.5 rounded-full ${c.provider === "both" ? "bg-[#FFBD0D]" : c.provider === "ashtech" ? "bg-orange-500" : "bg-violet-500"}`} /></p>
                  <p className="mt-0.5 text-[8.5px] font-semibold text-white/40">{c.currency}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] font-medium text-white/30">Live · SasPay /countries/{process.env.ASHTECH_API_KEY ? " + AshTech /v1/countries" : ""} · USDT accepted in every market via Tron · network availability varies by country</p>
          </div>
        </div>
      </section>

      {/* ============ SEE IT IN ACTION — mini videos ============ */}
      <section id="how" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[10.5px] font-extrabold uppercase tracking-[0.3em] text-[#E0A800]">See it in action</p>
            <h2 className="mt-2 text-[34px] font-black leading-[1.02] tracking-tight text-[#141B3D] sm:text-[46px]">Payments in<br />the real world.</h2>
          </div>
          <p className="max-w-xs text-[13px] leading-relaxed text-[#141B3D]/55">From open-air markets to checkout counters — SDK Pay moves money where your customers actually are.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {VIDEOS.action.map((v) => (
            <figure key={v.label} className="group relative overflow-hidden rounded-3xl border border-[#141B3D]/10 shadow-lg transition-transform duration-500 hover:-translate-y-1.5">
              <video className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" src={v.src} poster={v.poster} autoPlay muted loop playsInline preload="metadata" aria-label={v.label} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0F2C]/80 via-[#0A0F2C]/10 to-transparent" />
              <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-white/90 backdrop-blur"><CirclePlay size={11} />{v.time}</span>
              <span className="absolute right-4 top-4 rounded-full bg-[#FFBD0D] px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-[#232054]">{v.tag}</span>
              <figcaption className="absolute bottom-4 left-4 right-4 text-[15px] font-extrabold leading-snug text-white">{v.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="border-t border-[#141B3D]/[0.07] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3 md:gap-6">
            {[
              { n: "1", t: "Create your account", d: "2 minutes, no card required. Wallets in XAF, USDT and 20+ currencies.", icon: Landmark },
              { n: "2", t: "Verify your identity", d: "National ID, passport or driver's licence + selfie. Reviewed within 24h.", icon: ShieldCheck },
              { n: "3", t: "Collect everywhere", d: "Payment link, QR code, or the Direct API. Money lands in seconds.", icon: Zap },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.n} className="relative flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#141B3D] text-[16px] font-black text-[#FFBD0D]">{s.n}</span>
                  <span>
                    <span className="flex items-center gap-2 text-[16px] font-extrabold text-[#141B3D]">{s.t}</span>
                    <span className="mt-1 block text-[12.5px] leading-relaxed text-[#141B3D]/60">{s.d}</span>
                  </span>
                  {i < 2 && <ChevronRight size={20} className="absolute -right-4 top-3 hidden text-[#141B3D]/20 md:block" />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="max-w-lg">
          <p className="text-[10.5px] font-extrabold uppercase tracking-[0.3em] text-[#E0A800]">Pricing</p>
          <h2 className="mt-2 text-[34px] font-black leading-[1.02] tracking-tight text-[#141B3D] sm:text-[46px]">No surprises.<br /><span className="text-[#141B3D]/35">Ever.</span></h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="flex flex-col rounded-3xl border-2 border-[#141B3D] bg-[#141B3D] p-6 text-white shadow-[0_25px_60px_-25px_rgba(20,27,61,0.5)]">
            <span className="inline-flex w-fit items-center rounded-full bg-[#FFBD0D] px-3 py-1 text-[9.5px] font-black uppercase tracking-widest text-[#232054]">Most used</span>
            <p className="mt-4 text-[13px] font-extrabold uppercase tracking-[0.2em] text-white/50">Mobile Money</p>
            <p className="mt-2"><span className="text-[56px] font-black leading-none tracking-tight text-[#FFBD0D]">4</span><span className="text-[36px] font-black text-[#FFBD0D]">%</span></p>
            <ul className="mt-4 flex-1 space-y-2 text-[12.5px] text-white/75">{["Deposits, payouts & link collections", "Failed deposits never charged", "Min. 10 FCFA · shown before confirming"].map((i) => <li key={i} className="flex items-start gap-2"><Check size={15} strokeWidth={3.5} className="mt-0.5 shrink-0 text-[#FFBD0D]" />{i}</li>)}</ul>
            <Link href="/signup" className="mt-6 flex h-12 items-center justify-center rounded-xl bg-[#FFBD0D] text-[14px] font-extrabold text-[#232054] transition hover:brightness-105">Create account</Link>
          </div>
          {[
            { name: "Crypto USDT (Tron)", price: "2.5", unit: "%", items: ["USDT deposits & withdrawals", "Network fee 1.00 USDT flat", "Auto-convert to XAF / XOF"], cta: "See fees", href: "/fees" },
            { name: "SDK Pay Internal", price: "0", unit: "FCFA", items: ["Free instant transfers", "Wallet-to-wallet conversions 1%", "No monthly fees, ever"], cta: "See fees", href: "/fees" },
          ].map((p) => (
            <div key={p.name} className="flex flex-col rounded-3xl border border-[#141B3D]/[0.09] bg-white p-6 shadow-sm">
              <p className="text-[13px] font-extrabold uppercase tracking-[0.2em] text-[#141B3D]/50">{p.name}</p>
              <p className="mt-2"><span className="text-[56px] font-black leading-none tracking-tight text-[#141B3D]">{p.price}</span><span className="text-[26px] font-black text-[#141B3D]/40">{p.unit}</span></p>
              <ul className="mt-4 flex-1 space-y-2 text-[12.5px] text-[#141B3D]/70">{p.items.map((i) => <li key={i} className="flex items-start gap-2"><Check size={15} strokeWidth={3.5} className="mt-0.5 shrink-0 text-emerald-600" />{i}</li>)}</ul>
              <Link href={p.href} className="mt-6 flex h-12 items-center justify-center rounded-xl border border-[#141B3D]/15 text-[13px] font-extrabold text-[#141B3D] transition hover:border-[#141B3D]/40">{p.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* ============ DEVELOPERS ============ */}
      <section id="developers" className="border-t border-[#141B3D]/[0.07] bg-[#141B3D] text-white">
        <div className="mx-auto grid max-w-7xl scroll-mt-20 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <p className="text-[10.5px] font-extrabold uppercase tracking-[0.3em] text-[#FFBD0D]">For developers</p>
            <h2 className="mt-2 text-[32px] font-black leading-[1.02] tracking-tight sm:text-[42px]">One <code className="rounded-lg bg-white/10 px-2 text-[0.75em] text-sky-300">POST</code>,<br />money moves.</h2>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-white/60">AshTech Direct API, SasPay automatic failover, no hosted checkout. Idempotent calls, HMAC-signed webhooks, live country and fee catalogs.</p>
            <ul className="mt-6 space-y-2.5 text-[13px] font-semibold text-white/70">
              {["HMAC-SHA256 webhooks with replay protection", "Idempotency keys on every money call", "Live /v1/countries + /v1/fees catalog", "Sandbox keys that never move real funds"].map((t) => (
                <li key={t} className="flex items-start gap-2.5"><Check size={16} strokeWidth={3.5} className="mt-0.5 shrink-0 text-[#FFBD0D]" />{t}</li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/api" className="flex h-12 items-center gap-2 rounded-xl bg-white px-5 text-[13px] font-extrabold text-[#141B3D] transition hover:bg-slate-100"><Code2 size={16} /> API console &amp; docs</Link>
              <a href="mailto:developers@sdkpay.com" className="flex h-12 items-center rounded-xl border border-white/15 px-5 text-[13px] font-bold text-white/75 transition hover:text-white">developers@sdkpay.com</a>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#070B22] shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-white/5 px-5 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              <span className="ml-3 font-mono text-[11px] text-white/35">collect.sh</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[10.5px] leading-[1.8] text-sky-100"><code>{`# 5 000 FCFA — MTN Cameroon (USSD push)
curl -X POST https://www.ashtechpay.com/v1/collect \\
  -H "Authorization: Bearer ak_live_8e7c4f…" \\
  -d '{ "user_id": "…", "amount": 5000,
    "currency": "XAF", "country_code": "CM",
    "operator": "MTN Money", "phone": "651010478",
    "reference": "ORDER-1234",
    "notify_url": "https://you.app/hooks/ashtech" }'
# → 201 { "transaction_id": "ASH-D-…", "status": "pending" }
# Customer approves on phone → you get a signed webhook`}</code></pre>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-[#141B3D] px-6 py-14 text-center sm:px-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mascot.png" alt="" aria-hidden className="pointer-events-none absolute -left-8 bottom-0 hidden w-40 rotate-[-6deg] opacity-95 lg:block" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mascot.png" alt="" aria-hidden className="pointer-events-none absolute -right-8 bottom-0 hidden w-40 rotate-[6deg] opacity-95 lg:block" />
          <p className="text-[10.5px] font-extrabold uppercase tracking-[0.35em] text-[#FFBD0D]">Integrate · Pay · Grow</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-[36px] font-black leading-[1.0] tracking-tight text-white sm:text-[52px]">Ready to get <span className="text-[#FFBD0D]">paid everywhere?</span></h2>
          <p className="mx-auto mt-4 max-w-md text-[14.5px] text-white/60">Join 2,400+ African businesses collecting with SDK Pay. Account in 2 minutes — first payment today.</p>
          <Link href={openAppHref} className="group mx-auto mt-8 flex h-14 w-fit items-center gap-2 rounded-2xl bg-[#FFBD0D] px-9 text-[16px] font-extrabold text-[#232054] shadow-[0_14px_40px_rgba(255,189,13,0.4)] transition hover:brightness-105">{openAppLabel}<ArrowRight size={18} strokeWidth={2.6} className="transition-transform group-hover:translate-x-1" /></Link>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#0A0F2C] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-10">
            <div className="max-w-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="SDK Pay" className="h-9 w-auto rounded-md bg-white p-1.5" />
              <p className="mt-4 text-[12px] leading-relaxed text-white/45">The payment infrastructure for African businesses. Licensed payment service provider, Cameroun.</p>
              <p className="mt-3 flex items-center gap-2 text-[10.5px] font-semibold text-emerald-400"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />All systems operational</p>
            </div>
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
              {[
                { t: "Product", links: [["Top up", "/deposit"], ["Withdraw", "/withdraw"], ["Payment links", "/links"], ["Fees", "/fees"]] },
                { t: "Developers", links: [["API console", "/api"], ["Webhooks", "/api#providers"], ["Docs", "/docs"], ["Health", "/api/health"]] },
                { t: "Company", links: [["Support", "/support"], ["KYC", "/kyc"], ["Updates", "/updates"], ["Referrals", "/referrals"]] },
                { t: "Legal", links: [["Terms", "#"], ["Privacy", "#"], ["AML / KYC", "#"]] },
              ].map((col) => (
                <div key={col.t}>
                  <p className="text-[9.5px] font-extrabold uppercase tracking-[0.25em] text-white/35">{col.t}</p>
                  <ul className="mt-3 space-y-2">{col.links.map(([l, h]) => <li key={l}><Link href={h} className="text-[12.5px] font-medium text-white/55 transition hover:text-[#FFBD0D]">{l}</Link></li>)}</ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-6 text-[11px] text-white/30">
            <p>© 2026 SDK Pay Inc. All rights reserved.</p>
            <p>Integrate · Pay · Grow — <Link href="/login" className="hover:text-white/60">Merchant sign in</Link></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
