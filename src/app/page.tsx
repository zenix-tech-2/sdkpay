import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, ArrowUpDown, BarChart3, Check, Clock3, Code2, CreditCard, Download,
  ExternalLink, FileCheck2, FileText, Globe2, Headphones,
  Laptop, Link2, Lock, Monitor, ShieldAlert, ShieldCheck, Smartphone,
  Sparkles, Store, Users, Wallet, Zap,
} from "lucide-react";
import { LandingHeader } from "@/components/LandingHeader";
import { Logo } from "@/components/Logo";
import { landingCountries } from "@/lib/countries";
import { providerCatalog } from "@/lib/icon-catalog";

const operators = providerCatalog
  .filter((entry) => ["mobile_money", "provider", "card", "crypto"].includes(entry.category))
  .slice(0, 34)
  .map((entry) => ({ name: entry.short, sub: entry.name, logo: entry.logo, bg: entry.bg, color: entry.color }));

const solutions = [
  { icon: <ArrowRight size={19} />, title: "SDK Pay-IN", badge: "TIP", text: "Recevez des paiements en ligne avec les moyens disponibles dans le pays de votre client." },
  { icon: <ArrowUpDown size={19} />, title: "SDK Pay-OUT", text: "Envoyez des paiements groupés à vos clients, salariés et autres bénéficiaires avec les moyens pris en charge." },
  { icon: <Download size={19} />, title: "SDK Pay-Link", badge: "EXCLUSIF", text: "Créez des liens de paiement et partagez-les sur WhatsApp, Facebook, Instagram ou par SMS. Consultez le statut des paiements dans votre compte." },
];

const walletFeatures = [
  { icon: <Wallet size={17} />, title: "Solde en temps réel", text: "Consultez votre solde et vos revenus à tout moment depuis votre tableau de bord." },
  { icon: <Clock3 size={17} />, title: "Historique complet", text: "Retrouvez toutes vos transactions avec des détails complets et des filtres avancés." },
  { icon: <ArrowUpDown size={17} />, title: "Retraits rapides", text: "Retirez vos fonds vers Mobile Money ou banque de manière sécurisée." },
  { icon: <FileText size={17} />, title: "Frais transparents", text: "Aucun frais caché. Vous savez exactement ce que vous payez." },
  { icon: <Link2 size={17} />, title: "Liens de paiement", text: "Créez des liens personnalisés avec montant fixe ou libre, factures PDF, date d'expiration." },
];

const audiences = ["Créateurs de contenu", "Entrepreneurs", "E-commerçants", "Formateurs", "Freelancers", "Startups", "PME africaines"];
const why = [
  { icon: <Zap size={16} />, title: "Transactions rapides", text: "Consultez le statut de vos transferts depuis votre compte." },
  { icon: <ShieldCheck size={16} />, title: "Sécurité renforcée", text: "Les communications entre votre navigateur et nos serveurs sont chiffrées." },
  { icon: <Monitor size={16} />, title: "Interface moderne", text: "Utilisez l'interface sur téléphone, tablette ou ordinateur." },
  { icon: <Globe2 size={16} />, title: "Pays pris en charge", text: "Disponible dans plus de 18 pays africains." },
  { icon: <Globe2 size={16} />, title: "Support réactif", text: "Notre équipe est disponible 24/7 pour répondre à vos questions." },
  { icon: <Headphones size={16} />, title: "Accompagnement", text: "Une équipe locale pour vous aider à chaque étape." },
];
const steps = [
  { n: "01", title: "Créez votre lien de paiement", text: "Ajoutez votre produit, fixez le prix et générez un lien partageable." },
  { n: "02", title: "Partagez le lien", text: "WhatsApp, Facebook, Instagram, email ou site web." },
  { n: "03", title: "Suivez le paiement", text: "Consultez son statut dans votre compte et vérifiez la confirmation avant de livrer votre produit." },
  { n: "04", title: "Retirez quand vous voulez", text: "Mobile Money, banque ou autre méthode locale." },
];
const security = [
  { icon: <Lock size={19} />, title: "Chiffrement SSL (HTTPS)", text: "HTTPS chiffre les communications entre votre navigateur et nos serveurs pour protéger les données pendant leur transmission." },
  { icon: <FileCheck2 size={19} />, title: "Vérification KYC", text: "Chaque compte passe par une vérification d'identité. Seuls les utilisateurs vérifiés peuvent encaisser et retirer." },
  { icon: <ShieldAlert size={19} />, title: "Monitoring anti-fraude", text: "Un système de conformité forme les analyses chaque transaction. Toute activité anormale déclenche une alerte immédiate et un blocage préventif." },
  { icon: <Zap size={19} />, title: "Surveillance des transactions", text: "Consultez les paiements et retraits entrants/sortants dans votre historique, avec date et état du statut." },
  { icon: <Globe2 size={19} />, title: "Politique AML/CFT", text: "SDK Pay applique une politique stricte de lutte contre le blanchiment de capitaux et le financement du terrorisme, conformément aux standards GAFI/PATR." },
  { icon: <Headphones size={19} />, title: "Suivi des opérations", text: "Consultez le statut de vos paiements et retraits depuis votre compte SDK Pay et retrouvez leurs détails dans votre historique." },
];

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="chip mx-auto mb-5 flex w-fit">{children}</span>;
}

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-white">
      <LandingHeader />

      {/* HERO */}
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-16 pt-10 sm:px-6 md:grid-cols-[1.05fr_.95fr] md:gap-12 md:pb-24 md:pt-16">
        <div>
          <h1 className="font-display text-[34px] font-extrabold leading-[1.12] text-[#101a35] sm:text-[46px] lg:text-[54px]">
            Vendez en ligne. <span className="text-[#ffb800]">Recevez vos paiements.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[13px] leading-[1.8] text-[#5d6882] sm:text-[15px]">
            <strong className="font-bold text-[#1d2944]">SDK PAY</strong> permet aux créateurs, entrepreneurs et commerçants de vendre leurs produits physiques ou numériques avec un lien de paiement. Les fonds sont versés après confirmation du paiement.
          </p>
          <ul className="mt-5 space-y-2 text-[12px] font-medium text-[#4d5871] sm:text-[13px]">
            {["Aucun site requis.", "Aucun stress technique.", "Paiements locaux & internationaux."].map((item) => (
              <li key={item} className="flex items-center gap-2"><Check size={14} className="text-[#2e9e63]" /> {item}</li>
            ))}
          </ul>
          <div className="mt-7 flex flex-col gap-3 sm:w-[270px]">
            <Link href="/signup" className="brand-btn rounded-lg py-3.5 text-center text-[13px] shadow-[0_10px_22px_rgba(255,184,0,.22)]">Commencer maintenant</Link>
            <Link href="/login" className="rounded-lg border border-[#e5eaf4] bg-white py-3.5 text-center text-[13px] font-bold text-[#1e2943] transition hover:border-[#ffb800]">Se connecter</Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] bg-[#101010] shadow-[0_22px_55px_rgba(20,25,45,.22)]">
            <Image src="/images/hero-payments.png" alt="Paiements mobiles avec SDK Pay" fill sizes="(max-width: 768px) 100vw, 520px" className="object-cover" priority />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-5 pb-14 pt-8 text-center sm:px-6 md:pb-20">
        <h2 className="font-display text-[26px] font-extrabold text-[#101a35] sm:text-[34px]">Prêt à commencer ?</h2>
        <p className="mx-auto mt-3 max-w-xl text-[12px] leading-relaxed text-[#707b94] sm:text-[14px]">Proposez à vos clients les moyens de paiement Mobile Money disponibles dans leur pays.</p>
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-y-10">
          {[["50000+", "Marchands satisfaits"], ["100+", "Entreprises partenaires"], ["30+", "Opérateurs Mobile Money"], ["22+", "Pays africains"]].map(([value, label]) => (
            <div key={label}>
              <div className="font-display text-[30px] font-extrabold text-[#101a35] sm:text-[38px]">{value.slice(0, -1)}<span className="text-[#ffb800]">+</span></div>
              <div className="mt-1 text-[11px] font-semibold text-[#5d6882] sm:text-[12px]">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COUNTRIES */}
      <section className="border-y border-[#eff1f6] bg-white py-7">
        <p className="text-center text-[11px] font-bold text-[#34405c] sm:text-[12px]">Disponible dans +18 pays africains</p>
        <div className="brand-scroll mx-auto mt-5 flex max-w-7xl gap-2 overflow-x-auto px-5 pb-1 sm:justify-center sm:px-6">
          {landingCountries.map((country) => (
            <div key={country.name} className="flex min-w-[112px] shrink-0 items-center gap-2 rounded-md border border-[#e7ebf3] bg-white px-3 py-2 text-[11px] font-semibold text-[#26324d] sm:min-w-0">
              <span className="text-base leading-none">{country.flag}</span> {country.name}
            </div>
          ))}
        </div>
      </section>

      {/* SOLUTIONS */}
      <section id="solutions" className="surface py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <h2 className="text-center font-display text-[25px] font-extrabold text-[#101a35] sm:text-[32px]">Nos solutions</h2>
          <p className="mt-2 text-center text-[12px] text-[#78829a] sm:text-[13px]">Recevez des paiements par lien ou intégrez l&apos;API à votre site.</p>
          <div className="mx-auto mt-9 grid max-w-5xl gap-4 md:grid-cols-3">
            {solutions.map((item) => (
              <article key={item.title} className="card-soft relative flex min-h-[212px] flex-col p-5">
                <div className="flex items-start justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e7ebf3] text-[#26324d]">{item.icon}</span>
                  {item.badge && <span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold ${item.badge === "TIP" ? "bg-[#ffc633] text-white" : "bg-[#172142] text-white"}`}>{item.badge}</span>}
                </div>
                <h3 className="mt-5 text-[14px] font-bold text-[#18233e]">{item.title}</h3>
                <p className="mt-2 text-[11px] leading-[1.65] text-[#7b849b]">{item.text}</p>
                <Link href="/docs" className="mt-auto inline-flex items-center gap-1 pt-4 text-[11px] font-bold text-[#e9a200] hover:underline">En savoir plus <ExternalLink size={11} /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* LOCAL PAYMENT METHODS */}
      <section className="mx-auto grid max-w-7xl items-center gap-9 px-5 py-16 sm:px-6 md:grid-cols-2 md:py-24">
        <div>
          <Pill><Sparkles size={11} /> Le commerce africain, connecté</Pill>
          <h2 className="font-display text-[25px] font-extrabold leading-[1.18] text-[#101a35] sm:text-[32px]">Proposez les moyens de paiement disponibles dans le pays de vos clients</h2>
          <p className="mt-4 max-w-lg text-[12px] leading-[1.8] text-[#76819a] sm:text-[13px]">Les moyens proposés varient selon le pays et comprennent le Mobile Money et les cartes bancaires pris en charge.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Mobile Money", "Cartes bancaires", "Virements", "USDT"].map((item) => <span key={item} className="rounded-full border border-[#e6ebf5] px-3 py-1.5 text-[11px] font-semibold text-[#3c4966]">{item}</span>)}
          </div>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#e8f1ff]">
          <Image src="/images/merchant.png" alt="Commerçante recevant un paiement en ligne" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" />
        </div>
      </section>

      {/* OPERATORS */}
      <section className="border-y border-[#eff1f6] py-9">
        <p className="text-center text-[10px] font-bold tracking-[.18em] text-[#8590a7]">OPÉRATEURS DE MOBILE MONEY ACCEPTÉS</p>
        <div className="brand-scroll mt-7 overflow-hidden px-5 pb-2 sm:px-6">
          <div className="motion-marquee flex w-max gap-5">
            {[...operators, ...operators].map((op, index) => (
              <div key={`${op.sub}-${index}`} className="icon-tile w-[76px] shrink-0 text-center">
                <div className="mx-auto flex h-[54px] w-[54px] items-center justify-center rounded-full p-2 shadow-sm" style={{ background: op.bg, color: op.color }}>
                  <Image src={op.logo} alt={op.sub} width={42} height={42} unoptimized className="h-full w-full object-contain" />
                </div>
                <p className="mt-2 truncate text-[9px] font-semibold text-[#69748d]">{op.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WALLET */}
      <section id="wallet" className="surface py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <Pill><ShieldCheck size={11} /> Wallet sécurisé</Pill>
          <h2 className="text-center font-display text-[24px] font-extrabold text-[#101a35] sm:text-[31px]">Un wallet sécurisé pour gérer votre argent</h2>
          <p className="mt-2 text-center text-[12px] text-[#78829a] sm:text-[13px]">Tout ce dont vous avez besoin pour encaisser et gérer vos revenus.</p>
          <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {walletFeatures.map((item) => (
              <article key={item.title} className="card-soft p-5">
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-full border border-[#f5e2b0] bg-[#fffaf0] text-[#e5a300]">{item.icon}</div>
                <h3 className="text-[13px] font-bold text-[#18233e]">{item.title}</h3>
                <p className="mt-2 text-[11px] leading-[1.65] text-[#8a93a8]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHO & WHY */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:py-20">
        <Pill><Users size={11} /> Pour qui ?</Pill>
        <h2 className="text-center font-display text-[24px] font-extrabold text-[#101a35] sm:text-[31px]">Pour qui est SDK Pay ?</h2>
        <p className="mt-2 text-center text-[12px] text-[#78829a] sm:text-[13px]">Si vous vendez en ligne, SDK Pay est fait pour vous.</p>
        <div className="mx-auto mt-7 flex max-w-5xl flex-wrap justify-center gap-2">
          {audiences.map((item, index) => (
            <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-[#e8ecf5] bg-white px-3 py-2 text-[10px] font-semibold text-[#374462] shadow-[0_2px_6px_rgba(20,30,60,.03)] sm:text-[11px]">
              <span className="text-[11px]">{["👩‍🎨", "🚀", <Store key="s" size={11} />, "📚", <Laptop key="l" size={11} />, "⚡", "🌍"][index]}</span>{item}
            </span>
          ))}
        </div>
        <h3 className="mt-16 text-center font-display text-[18px] font-extrabold text-[#101a35] sm:text-[22px]">Pourquoi choisir SDK Pay ?</h3>
        <div className="mx-auto mt-8 grid max-w-5xl gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {why.map((item) => (
            <div key={item.title} className="flex gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#f1e0ae] text-[#e5a300]">{item.icon}</span>
              <div><h4 className="text-[12px] font-bold text-[#18233e]">{item.title}</h4><p className="mt-1 text-[10px] leading-relaxed text-[#8992a7]">{item.text}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="comment" className="surface py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <h2 className="text-center font-display text-[23px] font-extrabold sm:text-[31px]"><span className="text-[#ffb800]">COMMENT</span> ça marche ?</h2>
          <p className="mt-2 text-center text-[12px] text-[#78829a] sm:text-[13px]">Commencez à utiliser SDK PAY en 4 étapes simples</p>
          <div className="relative mx-auto mt-12 grid max-w-5xl gap-9 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <div className="absolute left-[10%] right-[10%] top-[22px] hidden h-px bg-[#f7d77e] lg:block" />
            {steps.map((step) => (
              <div key={step.n} className="relative text-center">
                <div className="relative z-10 mx-auto flex h-[46px] w-[46px] items-center justify-center rounded-full border-2 border-[#ffb800] bg-[#f5f8ff] text-[13px] font-bold text-[#e5a300]">{step.n}</div>
                <h4 className="mt-4 text-[12px] font-bold text-[#18233e]">{step.title}</h4>
                <p className="mx-auto mt-2 max-w-[210px] text-[10px] leading-relaxed text-[#8a93a8]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOBILE */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-6 md:grid-cols-2 md:py-24">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-[22px] bg-[#1e120b]">
          <Image src="/images/mobile-pay.png" alt="Paiements conçus pour le mobile" fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/10" />
          <div className="absolute left-6 top-7 max-w-[230px] font-display text-[20px] font-extrabold leading-tight text-white">In a competitive market, every <span className="text-[#ffb800]">transaction counts</span></div>
          <div className="absolute left-5 top-[34%] flex flex-col gap-2">
            {["VISA", "M-PESA", "airtel", "Orange", "MTN"].map((brand, i) => (
              <span key={brand} className={`w-[76px] rounded-full bg-white px-2 py-1.5 text-center text-[9px] font-black shadow ${["text-[#1a1f71]", "text-[#0a8f3c]", "text-[#e5002b]", "text-[#f60]", "text-[#b38b00]"][i]}`}>{brand}</span>
            ))}
          </div>
        </div>
        <div className="md:pl-8">
          <Pill><Smartphone size={11} /> Une expérience pensée pour le mobile</Pill>
          <h2 className="font-display text-[26px] font-extrabold leading-tight text-[#101a35] sm:text-[34px]">Paiements conçus pour le mobile</h2>
          <p className="mt-4 max-w-lg text-[13px] leading-[1.8] text-[#76819a]">Vos clients peuvent payer avec les moyens disponibles dans leur pays. Le parcours de paiement est optimisé pour les petits écrans, sans application à installer.</p>
          <ul className="mt-6 space-y-3 text-[12px] font-medium text-[#465270]">
            {["Checkout responsive en moins de 500 ms", "Confirmation instantanée par Mobile Money", "Aucune redirection compliquée"].map((item) => <li key={item} className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fff4d5] text-[#e5a300]"><Check size={12} /></span>{item}</li>)}
          </ul>
        </div>
      </section>

      {/* SECURITY */}
      <section id="securite" className="bg-[#101935] py-16 text-white md:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <Pill><ShieldCheck size={11} /> Votre confiance est notre priorité</Pill>
          <h2 className="text-center font-display text-[22px] font-extrabold tracking-wide text-[#ffc233] sm:text-[30px]">SÉCURITÉ &amp; CONFORMITÉ</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[11px] font-semibold leading-relaxed text-[#e3e8f6] sm:text-[13px]">SDK PAY applique des standards stricts de sécurité et se conforme régulièrement pour protéger chaque transaction et chaque utilisateur.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {security.map((item) => (
              <article key={item.title} className="rounded-xl border border-[#263156] bg-[#1a2444] p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#2c3559] text-[#ffc233]">{item.icon}</div>
                <h3 className="text-[12px] font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-[10px] leading-[1.7] text-[#9ea9c4]">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-[#263156] bg-[#1a2444] px-5 py-5 text-center text-[10px] text-[#cbd3e8]">
            SDK Pay protège les données des utilisateurs et applique les règles de conformité en vigueur.<br />
            <Link href="/docs" className="mt-1 inline-block font-bold text-[#ffc233] hover:underline">Consulter notre politique AML/CFT complète →</Link>
          </div>
        </div>
      </section>

      {/* API */}
      <section id="api" className="surface py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-6 lg:grid-cols-2">
          <div>
            <Pill><Code2 size={11} /> Intégration développeur</Pill>
            <h2 className="font-display text-[29px] font-extrabold leading-[1.12] text-[#101a35] sm:text-[38px]"><span className="text-[#ffb800]">API REST</span> pensée pour les développeurs africains</h2>
            <p className="mt-4 max-w-lg text-[12px] leading-[1.8] text-[#6d7892] sm:text-[13px]">Intégrez les encaissements (Payin) et les décaissements (Payout) dans votre application. Collectez des paiements Mobile Money et envoyez des retraits Mobile Money ou USDT depuis vos wallets SDK Pay.</p>
            <ul className="mt-5 space-y-2.5 text-[11px] text-[#4d5871]">
              {["Payin : collectez les paiements Mobile Money depuis votre backend", "Payout : envoyez des retraits Mobile Money et USDT depuis vos wallets", "Checkout Page : lien de paiement sans code frontend", "Webhooks temps réel pour chaque événement de paiement", "Dashboard marchand avec statistiques et historique"].map((item) => <li key={item} className="flex gap-2"><span className="mt-0.5 text-[#e5a300]">✦</span>{item}</li>)}
            </ul>
            <div className="mt-7 flex flex-wrap gap-2">
              <Link href="/docs" className="brand-btn inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[11px]"><FileText size={13} /> Documentation API</Link>
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-lg border border-[#dfe6f3] bg-white px-4 py-2.5 text-[11px] font-bold text-[#26324d]"><CreditCard size={13} /> Checkout Page</Link>
              <Link href="/docs" className="inline-flex items-center gap-2 rounded-lg border border-[#dfe6f3] bg-white px-4 py-2.5 text-[11px] font-bold text-[#26324d]"><Sparkles size={13} /> Documentation Payouts</Link>
            </div>
          </div>
          <div>
            <div className="code-window overflow-hidden">
              <div className="flex items-center gap-1.5 border-b border-[#2b2b2b] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 text-[10px] text-[#8d8d8d]">collect.js</span>
              </div>
              <pre className="brand-scroll overflow-x-auto px-5 py-5 text-[10px] leading-[1.85] sm:text-[11px]"><code>{`// Documentation API
// https://doc.sdkpay.com/docs/introduction

// Exemple de requête API (Payin)
const response = await fetch(
  "https://sdkpay.com/v1/collect",
  {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${process.env.SDKPAY_API_KEY}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      user_id: "VOTRE_USER_ID",
      country_code: "CM",
      amount: 2500,
      currency: "XAF",
      phone: "23700000000",
      operator: "MTN Money",
      reference: "ORDER-123"
    })
  }
);`}</code></pre>
              <div className="border-t border-[#2b2b2b] px-5 py-3 text-[9px] text-[#7f8b80]">✦ Exemple d&apos;intégration. <span className="text-[#ffc233]">Consultez la documentation</span> avant tout envoi.</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[["22 pays", "supportés"], ["< 500ms", "latence API"], ["99.9%", "disponibilité"], ["Webhooks", "temps réel"]].map(([v, l]) => (
                <div key={l} className="rounded-xl border border-[#e6ebf5] bg-white py-3 text-center"><div className="text-[13px] font-bold text-[#17213d]">{v}</div><div className="text-[9px] text-[#8d96aa]">{l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-14 text-center">
        <h2 className="font-display text-[24px] font-extrabold text-[#101a35] sm:text-[32px]">Commencez à encaisser aujourd&apos;hui</h2>
        <p className="mt-2 text-[12px] text-[#78829a]">Créez votre compte gratuitement, aucun frais d&apos;installation.</p>
        <Link href="/signup" className="brand-btn mt-6 inline-flex items-center gap-2 rounded-lg px-7 py-3 text-[13px]">Créer mon compte <ArrowRight size={15} /></Link>
      </section>

      {/* FOOTER */}
      <footer id="footer" className="border-t border-[#edf0f6] bg-white pt-14">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-12 sm:px-6 md:grid-cols-4">
          <div>
            <Logo size="md" />
            <p className="mt-6 max-w-[250px] text-[10px] leading-[1.8] text-[#8b94aa]">SDK Pay est une fintech et ne constitue pas une banque. L&apos;accès aux services de paiement est soumis aux conditions d&apos;éligibilité, aux vérifications d&apos;identité requises et aux réglementations applicables.</p>
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold tracking-[.13em] text-[#26324d]">ENTREPRISE</h4>
            <div className="mt-4 space-y-2.5 text-[11px] text-[#7b859c]">
              <a href="#solutions" className="block hover:text-[#e5a300]">A propos</a><a href="#api" className="block hover:text-[#e5a300]">Carrières</a><a href="#comment" className="block hover:text-[#e5a300]">Blog</a>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold tracking-[.13em] text-[#26324d]">SUPPORT</h4>
            <div className="mt-4 space-y-2.5 text-[11px] text-[#7b859c]">
              <a href="mailto:support@sdkpay.com" className="block hover:text-[#e5a300]">Centre d&apos;aide</a><a href="mailto:support@sdkpay.com" className="block hover:text-[#e5a300]">Contact</a><a href="#securite" className="block hover:text-[#e5a300]">FAQ</a>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold tracking-[.13em] text-[#26324d]">LÉGAL</h4>
            <div className="mt-4 space-y-2.5 text-[11px] text-[#7b859c]">
              <a href="/docs" className="block hover:text-[#e5a300]">Conditions d&apos;utilisation</a><a href="#securite" className="block hover:text-[#e5a300]">Politique de confidentialité</a><a href="#securite" className="block hover:text-[#e5a300]">Mentions légales</a>
              <p className="pt-2">support@sdkpay.com<br />+237 6 83 07 79 72</p>
            </div>
          </div>
        </div>
        <div className="border-t border-[#edf0f6] bg-[#f7f9fd] py-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-5 sm:flex-row sm:justify-between sm:px-6">
            <p className="text-[10px] text-[#8b94aa]">© 2026 SDK Pay. Tous droits réservés.</p>
            <div className="flex gap-2">
              {["f", "in", "◎"].map((glyph, i) => <a key={i} href="#footer" className="flex h-7 w-7 items-center justify-center rounded-full border border-[#dce3f0] bg-white text-[11px] font-bold text-[#68738d] hover:text-[#e5a300]">{glyph}</a>)}
            </div>
            <div className="flex gap-3 text-[10px] text-[#8b94aa]"><span className="flex items-center gap-1"><BarChart3 size={11} /> 22 pays</span><span className="flex items-center gap-1"><Users size={11} /> 50 000+ marchands</span><Link href="/admin/login" className="font-bold text-[#6d7d9e] hover:text-[#e5a300]">Admin console</Link></div>
          </div>
        </div>
      </footer>
    </main>
  );
}
