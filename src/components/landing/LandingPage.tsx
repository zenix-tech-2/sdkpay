"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Menu,
  X,
  LogIn,
  Mail,
  Globe,
  Smartphone,
  ArrowRight,
  ArrowUpRight,
  LogIn as InIcon,
  LogOut as OutIcon,
  Download,
  Wallet,
  History,
  ArrowDownUp,
  CreditCard,
  Link2,
  Users,
  TrendingUp,
  ShoppingCart,
  Truck,
  Briefcase,
  Zap,
  Building2,
  ShieldCheck,
  Lock,
  MonitorSmartphone,
  Headset,
  BadgeCheck,
  FileCheck,
  Radar,
  Activity,
  Scale,
  Headphones,
  Code2,
  BookOpen,
  Globe2,
  Send,
  ChevronDown,
  Share2,
  AtSign,
  MessageCircle,
} from "lucide-react";
import Logo from "@/components/Logo";
import { COUNTRIES, OPERATORS } from "@/data/countries";
import OperatorLogo from "@/components/dashboard/OperatorLogo";
import CountryFlag from "@/components/CountryFlag";
import { useAutoReveal, CountUp } from "@/components/motion/motion";

type Lang = "fr" | "en";

const T: Record<Lang, Record<string, string>> = {
  fr: {
    login: "Se connecter",
    contact: "Contact",
    start: "Commencer maintenant",
    heroA: "Vendez en ligne.",
    heroB: "Recevez vos paiements.",
    heroDesc:
      "SDK PAY permet aux créateurs, entrepreneurs et commerçants de vendre leurs produits physiques ou numériques avec un lien de paiement. Les fonds sont versés après confirmation du paiement.",
    c1: "Aucun site requis.",
    c2: "Aucun stress technique.",
    c3: "Paiements locaux & internationaux.",
    ready: "Prêt à commencer ?",
    readySub:
      "Proposez à vos clients les moyens de paiement Mobile Money disponibles dans leur pays.",
    merchants: "Marchands satisfaits",
    companies: "Entreprises partenaires",
    operators: "Opérateurs Mobile Money",
    countries: "Pays africains",
    availableIn: "Disponible dans +18 pays africains",
    solutions: "Nos solutions",
    solutionsSub: "Recevez des paiements par lien ou intégrez l'API à votre site.",
    learnMore: "En savoir plus",
    commerce: "Le commerce africain, connecté",
    proposeTitle: "Proposez les moyens de paiement disponibles dans le pays de vos clients",
    proposeDesc:
      "Les moyens proposés varient selon le pays et comprennent le Mobile Money et les cartes bancaires pris en charge.",
    acceptedOps: "OPÉRATEURS DE MOBILE MONEY ACCEPTÉS",
    walletBadge: "Wallet sécurisé",
    walletTitle: "Un wallet sécurisé pour gérer votre argent",
    walletSub: "Tout ce dont vous avez besoin pour encaisser et gérer vos revenus",
    whoBadge: "Pour qui ?",
    whoTitle: "Pour qui est SDK Pay ?",
    whoSub: "Si vous vendez en ligne, SDK Pay est fait pour vous.",
    whyTitle: "Pourquoi choisir SDK Pay ?",
    howA: "COMMENT",
    howB: "ça marche ?",
    howSub: "Commencez à utiliser SDK PAY en 4 étapes simples",
    mobileBadge: "Une expérience pensée pour le mobile",
    mobileTitle: "Paiements conçus pour le mobile",
    mobileSub: "Vos clients peuvent payer avec les moyens disponibles dans leurs pays.",
    secBadge: "Votre confiance est notre priorité",
    secTitle: "SÉCURITÉ & CONFORMITÉ",
    secSub:
      "SDK PAY applique des standards stricts de sécurité et de conformité réglementaire pour protéger chaque transaction et chaque utilisateur.",
    devBadge: "Intégration développeur",
    apiA: "API REST",
    apiB: "pensée pour les développeurs africains",
    apiDesc:
      "Intégrez les encaissements (Payin) et les décaissements (Payout) dans votre application. Collectez des paiements Mobile Money et envoyez des retraits Mobile Money ou USDT depuis vos wallets SDK Pay.",
    docApi: "Documentation API",
    checkout: "Checkout Page",
    docPayout: "Documentation Payouts",
    supported: "supportés",
    latency: "latence API",
    uptime: "disponibilité",
    realtime: "temps réel",
  },
  en: {
    login: "Log in",
    contact: "Contact",
    start: "Get started now",
    heroA: "Sell online.",
    heroB: "Get paid.",
    heroDesc:
      "SDK PAY lets creators, entrepreneurs and merchants sell physical or digital products with a payment link. Funds are released after payment confirmation.",
    c1: "No website required.",
    c2: "No technical stress.",
    c3: "Local & international payments.",
    ready: "Ready to get started?",
    readySub: "Offer your customers the Mobile Money payment methods available in their country.",
    merchants: "Happy merchants",
    companies: "Partner companies",
    operators: "Mobile Money operators",
    countries: "African countries",
    availableIn: "Available in 18+ African countries",
    solutions: "Our solutions",
    solutionsSub: "Receive payments by link or integrate the API into your site.",
    learnMore: "Learn more",
    commerce: "African commerce, connected",
    proposeTitle: "Offer the payment methods available in your customers' country",
    proposeDesc:
      "Available methods vary by country and include supported Mobile Money and bank cards.",
    acceptedOps: "ACCEPTED MOBILE MONEY OPERATORS",
    walletBadge: "Secure wallet",
    walletTitle: "A secure wallet to manage your money",
    walletSub: "Everything you need to collect and manage your revenue",
    whoBadge: "Who is it for?",
    whoTitle: "Who is SDK Pay for?",
    whoSub: "If you sell online, SDK Pay is made for you.",
    whyTitle: "Why choose SDK Pay?",
    howA: "HOW",
    howB: "does it work?",
    howSub: "Start using SDK PAY in 4 simple steps",
    mobileBadge: "A mobile-first experience",
    mobileTitle: "Payments designed for mobile",
    mobileSub: "Your customers can pay with the methods available in their countries.",
    secBadge: "Your trust is our priority",
    secTitle: "SECURITY & COMPLIANCE",
    secSub:
      "SDK PAY applies strict security and regulatory compliance standards to protect every transaction and every user.",
    devBadge: "Developer integration",
    apiA: "REST API",
    apiB: "built for African developers",
    apiDesc:
      "Integrate collections (Payin) and disbursements (Payout) into your app. Collect Mobile Money payments and send Mobile Money or USDT withdrawals from your SDK Pay wallets.",
    docApi: "API Documentation",
    checkout: "Checkout Page",
    docPayout: "Payouts Documentation",
    supported: "supported",
    latency: "API latency",
    uptime: "uptime",
    realtime: "real time",
  },
};

export default function LandingPage() {
  const scopeRef = useAutoReveal<HTMLDivElement>();
  const [lang, setLang] = useState<Lang>("fr");
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [apiTab, setApiTab] = useState<"payin" | "payout">("payin");
  const t = T[lang];

  const solutions =
    lang === "fr"
      ? [
          {
            icon: InIcon,
            badge: "TOP",
            badgeCls: "bg-yellow-400 text-slate-900",
            title: "SDK Pay-IN",
            desc: "Recevez des paiements en ligne avec les moyens disponibles dans le pays de votre client.",
          },
          {
            icon: OutIcon,
            badge: null,
            badgeCls: "",
            title: "SDK Pay-OUT",
            desc: "Envoyez des paiements groupés à vos clients, salariés et autres bénéficiaires avec les moyens pris en charge.",
          },
          {
            icon: Download,
            badge: "EXCLUSIF",
            badgeCls: "bg-slate-900 text-white",
            title: "SDK Pay-Link",
            desc: "Créez des liens de paiement et partagez-les sur WhatsApp, Facebook, Instagram ou par SMS. Consultez le statut des paiements dans votre compte.",
          },
        ]
      : [
          {
            icon: InIcon,
            badge: "TOP",
            badgeCls: "bg-yellow-400 text-slate-900",
            title: "SDK Pay-IN",
            desc: "Receive online payments with the methods available in your customer's country.",
          },
          {
            icon: OutIcon,
            badge: null,
            badgeCls: "",
            title: "SDK Pay-OUT",
            desc: "Send bulk payments to your customers, employees and other beneficiaries with supported methods.",
          },
          {
            icon: Download,
            badge: "EXCLUSIVE",
            badgeCls: "bg-slate-900 text-white",
            title: "SDK Pay-Link",
            desc: "Create payment links and share them on WhatsApp, Facebook, Instagram or by SMS. Track payment status in your account.",
          },
        ];

  const walletCards =
    lang === "fr"
      ? [
          { icon: Wallet, title: "Solde en temps réel", desc: "Consultez votre solde et vos revenus à tout moment depuis votre tableau de bord." },
          { icon: History, title: "Historique complet", desc: "Retrouvez toutes vos transactions avec des détails complets et des filtres avancés." },
          { icon: ArrowDownUp, title: "Retraits rapides", desc: "Retirez vos fonds vers Mobile Money ou banque de manière sécurisée." },
          { icon: CreditCard, title: "Frais transparents", desc: "Aucun frais caché. Vous savez exactement ce que vous payez." },
          { icon: Link2, title: "Liens de paiement", desc: "Créez des liens personnalisés avec montant fixe ou libre, fichiers PDF, date d'expiration." },
        ]
      : [
          { icon: Wallet, title: "Real-time balance", desc: "Check your balance and revenue anytime from your dashboard." },
          { icon: History, title: "Full history", desc: "Find all your transactions with complete details and advanced filters." },
          { icon: ArrowDownUp, title: "Fast withdrawals", desc: "Withdraw your funds to Mobile Money or bank securely." },
          { icon: CreditCard, title: "Transparent fees", desc: "No hidden fees. You know exactly what you pay." },
          { icon: Link2, title: "Payment links", desc: "Create custom links with fixed or open amount, PDF files, expiry date." },
        ];

  const whoPills =
    lang === "fr"
      ? [
          { icon: Users, label: "Créateurs de contenu" },
          { icon: TrendingUp, label: "Entrepreneurs" },
          { icon: ShoppingCart, label: "E-commerçants" },
          { icon: Truck, label: "Formateurs" },
          { icon: Briefcase, label: "Freelancers" },
          { icon: Zap, label: "Startups" },
          { icon: Building2, label: "PME africaines" },
        ]
      : [
          { icon: Users, label: "Content creators" },
          { icon: TrendingUp, label: "Entrepreneurs" },
          { icon: ShoppingCart, label: "E-merchants" },
          { icon: Truck, label: "Trainers" },
          { icon: Briefcase, label: "Freelancers" },
          { icon: Zap, label: "Startups" },
          { icon: Building2, label: "African SMEs" },
        ];

  const whyItems =
    lang === "fr"
      ? [
          { icon: Zap, title: "Transactions rapides", desc: "Consultez le statut de vos transferts depuis votre compte." },
          { icon: ShieldCheck, title: "Sécurité renforcée", desc: "Les communications entre votre navigateur et nos serveurs sont chiffrées." },
          { icon: Smartphone, title: "Interface moderne", desc: "Utilisez l'interface sur téléphone, tablette ou ordinateur." },
          { icon: Globe2, title: "Pays pris en charge", desc: "Disponible dans plus de 18 pays africains." },
          { icon: Headset, title: "Support réactif", desc: "Notre équipe est disponible 24/7 pour répondre à vos questions." },
          { icon: BadgeCheck, title: "Vérification KYC", desc: "Des comptes vérifiés pour des transactions en toute confiance." },
        ]
      : [
          { icon: Zap, title: "Fast transactions", desc: "Track your transfer status from your account." },
          { icon: ShieldCheck, title: "Enhanced security", desc: "Communications between your browser and our servers are encrypted." },
          { icon: Smartphone, title: "Modern interface", desc: "Use the interface on phone, tablet or computer." },
          { icon: Globe2, title: "Supported countries", desc: "Available in 18+ African countries." },
          { icon: Headset, title: "Responsive support", desc: "Our team is available 24/7 to answer your questions." },
          { icon: BadgeCheck, title: "KYC verification", desc: "Verified accounts for fully trusted transactions." },
        ];

  const steps =
    lang === "fr"
      ? [
          { n: "01", title: "Créez votre lien de paiement", desc: "Ajoutez votre produit, fixez le prix et générez un lien partageable." },
          { n: "02", title: "Partagez le lien", desc: "WhatsApp, Facebook, Instagram, email ou site web." },
          { n: "03", title: "Suivez le paiement", desc: "Consultez son statut dans votre compte et vérifiez sa confirmation avant de livrer votre produit." },
          { n: "04", title: "Retirez quand vous voulez", desc: "Mobile Money, banque ou autre méthode locale." },
        ]
      : [
          { n: "01", title: "Create your payment link", desc: "Add your product, set the price and generate a shareable link." },
          { n: "02", title: "Share the link", desc: "WhatsApp, Facebook, Instagram, email or website." },
          { n: "03", title: "Track the payment", desc: "Check its status in your account and verify confirmation before delivering." },
          { n: "04", title: "Withdraw anytime", desc: "Mobile Money, bank or other local method." },
        ];

  const secCards =
    lang === "fr"
      ? [
          { icon: Lock, title: "Chiffrement SSL (HTTPS)", desc: "HTTPS chiffre les communications entre votre navigateur et nos serveurs pour protéger les données pendant leur transmission." },
          { icon: FileCheck, title: "Vérification KYC", desc: "Chaque marchand passe par une vérification d'identité (Know Your Customer) avant activation. Seuls les utilisateurs vérifiés peuvent encaisser et retirer." },
          { icon: ShieldCheck, title: "Monitoring anti-fraude", desc: "Un système de surveillance temps réel analyse chaque transaction. Toute activité anormale déclenche une alerte immédiate et un blocage préventif." },
          { icon: Activity, title: "Surveillance des transactions", desc: "Consultez les paiements et retraits enregistrés dans votre historique, avec leur date et leur statut." },
          { icon: Scale, title: "Politique AML/CFT", desc: "SDK Pay applique une politique stricte de lutte contre le blanchiment de capitaux et le financement du terrorisme, conforme aux standards GAFI/FATF." },
          { icon: Headphones, title: "Suivi des opérations", desc: "Consultez le statut de vos paiements et retraits depuis votre compte SDK Pay et retrouvez leurs détails dans votre historique." },
        ]
      : [
          { icon: Lock, title: "SSL Encryption (HTTPS)", desc: "HTTPS encrypts communications between your browser and our servers to protect data in transit." },
          { icon: FileCheck, title: "KYC Verification", desc: "Every merchant passes identity verification (Know Your Customer) before activation. Only verified users can collect and withdraw." },
          { icon: ShieldCheck, title: "Anti-fraud monitoring", desc: "A real-time monitoring system analyzes every transaction. Any abnormal activity triggers an immediate alert and preventive block." },
          { icon: Activity, title: "Transaction monitoring", desc: "View payments and withdrawals recorded in your history, with their date and status." },
          { icon: Scale, title: "AML/CFT Policy", desc: "SDK Pay applies a strict anti-money laundering and counter-terrorism financing policy, compliant with FATF standards." },
          { icon: Headphones, title: "Operations tracking", desc: "Check the status of your payments and withdrawals from your SDK Pay account and find details in your history." },
        ];

  const apiChecks =
    lang === "fr"
      ? [
          "Payin : collectez des paiements Mobile Money depuis votre backend",
          "Payout : envoyez des retraits Mobile Money et USDT depuis vos wallets",
          "Checkout Page : lien de paiement sans code frontend",
          "Webhooks temps réel pour chaque événement de paiement",
          "Dashboard marchand avec statistiques et historique",
        ]
      : [
          "Payin: collect Mobile Money payments from your backend",
          "Payout: send Mobile Money and USDT withdrawals from your wallets",
          "Checkout Page: payment link with no frontend code",
          "Real-time webhooks for every payment event",
          "Merchant dashboard with statistics and history",
        ];

  return (
    <div ref={scopeRef} className="rv-scope min-h-screen bg-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-[54.5px] items-center justify-between gap-3">
            <Logo />
            <nav className="hidden lg:flex items-center gap-7 text-[12px] font-semibold text-slate-600">
              <a href="#solutions" className="hover:text-slate-900">Solutions</a>
              <a href="#pays" className="hover:text-slate-900">{lang === "fr" ? "Pays" : "Countries"}</a>
              <a href="#wallet" className="hover:text-slate-900">Wallet</a>
              <a href="#comment" className="hover:text-slate-900">{lang === "fr" ? "Comment ça marche" : "How it works"}</a>
              <a href="#api" className="hover:text-slate-900">API</a>
            </nav>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-[11.5px] font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              >
                <LogIn size={12} /> {t.login}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400 px-4 py-2 text-[11.5px] font-extrabold text-slate-900 hover:bg-yellow-300 shadow-sm"
              >
                <Mail size={12} /> {t.contact}
              </Link>
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-2 text-[10.5px] font-extrabold text-slate-700 hover:bg-slate-50"
                >
                  <Globe size={12} /> {lang.toUpperCase()} <ChevronDown size={11} />
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-2 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                    {(["fr", "en"] as Lang[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => {
                          setLang(l);
                          setLangOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-[11.5px] font-bold hover:bg-slate-50 ${lang === l ? "text-yellow-600 bg-yellow-50" : "text-slate-700"}`}
                      >
                        {l === "fr" ? "Français" : "English"}
                        {lang === l && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden rounded-full border border-slate-200 p-2 text-slate-700"
                aria-label="menu"
              >
                {menuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1">
            {[
              [t.login, "/login"],
              [t.start, "/register"],
              [t.contact, "/contact"],
              ["Solutions", "#solutions"],
              ["API", "#api"],
            ].map(([label, href]) => (
              <a
                key={label as string}
                href={href as string}
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-[12.5px] font-bold text-slate-700 hover:bg-slate-50"
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-8 lg:pt-16 lg:pb-14 grid lg:grid-cols-2 gap-10 items-center">
          <div className="hero-anim">
            <h1 className="text-[30px] leading-[1.08] sm:text-[40.5px] lg:text-[47.5px] font-extrabold tracking-tight text-slate-900">
              {t.heroA}{" "}
              <span className="text-yellow-500">{t.heroB}</span>
            </h1>
            <p className="mt-4 max-w-xl text-[12.5px] sm:text-[13px] leading-relaxed text-slate-500 font-medium">
              <span className="font-extrabold text-slate-700">SDK PAY</span>{" "}
              {t.heroDesc.replace(/^SDK PAY\s?/, "")}
            </p>
            <ul className="mt-5 space-y-2">
              {[t.c1, t.c2, t.c3].map((c) => (
                <li key={c} className="flex items-center gap-2 text-[11.5px] font-semibold text-slate-600">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500/15 text-green-600">
                    <Check size={10} strokeWidth={3} />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-yellow-400 px-7 py-3.5 text-[12.5px] font-extrabold text-slate-900 shadow-lg shadow-yellow-400/30 hover:bg-yellow-300 transition"
              >
                {t.start}
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3.5 text-[12.5px] font-extrabold text-slate-800 hover:bg-slate-50 transition"
              >
                {t.login}
              </Link>
            </div>
          </div>

          {/* Hero visual */}
          <div className="hero-visual relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[520px]">
              <div className="absolute -inset-6 bg-gradient-to-tr from-yellow-200/50 via-transparent to-sky-100/60 blur-2xl rounded-full" />
              <div className="relative overflow-hidden rounded-[28px] bg-[#0b1030] shadow-2xl">
                <img
                  src="/images/hero-main.jpg"
                  alt="Marchande africaine"
                  className="h-[264px] sm:h-[317px] w-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0b1030]/90 via-[#0b1030]/30 to-transparent" />
                {/* floating operator chips */}
                <div className="absolute left-4 top-4 bottom-4 flex flex-col justify-between py-1">
                  {["MTN MoMo", "Orange Money", "Wave", "VISA", "Airtel Money"].map((label, i) => (
                    <div key={label} className="animate-floaty" style={{ animationDelay: `${i * 0.5}s` }}>
                      <OperatorLogo name={label} size={39} radius={999} />
                    </div>
                  ))}
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-2xl ring-4 ring-yellow-400/60">
                    <div className="text-center leading-none">
                      <div className="text-[13px] font-extrabold">SDK<span className="text-sky-500">Pay</span></div>
                      <div className="text-[10px] font-extrabold text-yellow-500 tracking-widest">PAY</div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl bg-white/10 backdrop-blur px-4 py-2.5 border border-white/15">
                  <div className="text-white">
                    <div className="text-[10px] font-bold opacity-70">Total encaissé</div>
                    <div className="text-[14px] font-extrabold">2 450 000 XAF</div>
                  </div>
                  <div className="rounded-full bg-green-400 px-3 py-1 text-[10px] font-extrabold text-slate-900">+12,4%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-[24.5px] sm:text-[31.5px] font-extrabold tracking-tight">{t.ready}</h2>
          <p className="mt-2 text-[12px] text-slate-500 font-medium max-w-xl mx-auto">{t.readySub}</p>
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              [50000, t.merchants],
              [100, t.companies],
              [30, t.operators],
              [22, t.countries],
            ].map(([n, label]) => (
              <div key={label as string}>
                <div className="text-[26.5px] sm:text-[33.5px] font-extrabold tracking-tight text-slate-900">
                  <CountUp to={n as number} />
                  <span className="text-yellow-500">+</span>
                </div>
                <div className="text-[10.5px] font-semibold text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COUNTRIES BAR */}
      <section id="pays" className="border-y border-slate-100 bg-slate-50/60 py-6">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-center text-[11px] font-bold text-slate-700">{t.availableIn}</p>
          <div className="no-scrollbar mt-4 flex gap-2.5 overflow-x-auto pb-1 justify-start lg:justify-center">
            {COUNTRIES.slice(0, 14).map((c) => (
              <span
                key={c.code}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10.5px] font-semibold text-slate-700"
              >
                <CountryFlag code={c.code} emoji={c.flag} size={16} /> {c.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section id="solutions" className="py-12 lg:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-[23px] sm:text-[28px] font-extrabold tracking-tight">{t.solutions}</h2>
          <p className="mt-1.5 text-[12px] text-slate-500 font-medium">{t.solutionsSub}</p>
          <div className="mt-8 space-y-4 text-left">
            {solutions.map((s) => (
              <div key={s.title} className="relative rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm hover:shadow-md transition">
                {s.badge && (
                  <span className={`absolute right-5 top-5 rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide ${s.badgeCls}`}>
                    {s.badge}
                  </span>
                )}
                <s.icon size={23} className="text-slate-800" strokeWidth={1.8} />
                <h3 className="mt-3 text-[13px] font-extrabold">{s.title}</h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 font-medium max-w-xl">{s.desc}</p>
                <a href="#api" className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-extrabold text-yellow-500 underline underline-offset-4 hover:text-yellow-600">
                  {t.learnMore} <ArrowUpRight size={11} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROPOSE */}
      <section className="py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-[10px] font-bold text-yellow-700">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" /> {t.commerce}
            </span>
            <h2 className="mt-3 text-[23px] sm:text-[30px] leading-tight font-extrabold tracking-tight max-w-md">
              {t.proposeTitle}
            </h2>
            <p className="mt-3 text-[12px] text-slate-500 font-medium max-w-md leading-relaxed">{t.proposeDesc}</p>
            <Link href="/register" className="mt-5 inline-flex items-center gap-2 text-[11.5px] font-extrabold text-slate-900">
              {t.start} <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400"><ArrowRight size={12} /></span>
            </Link>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl bg-sky-50 border border-sky-100">
              <img
                src="/images/hero-commerce.jpg"
                alt="E-commerce Afrique"
                className="h-[246.5px] sm:h-[299px] w-full object-cover"
              />
              <div className="absolute right-4 top-4 flex gap-1.5">
                {["VISA", "MTN", "Wave"].map((b) => (
                  <span key={b} className="rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-extrabold shadow-lg">{b}</span>
                ))}
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur px-4 py-3 shadow-xl">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-600"><Check size={16} strokeWidth={3} /></span>
                <div>
                  <div className="text-[11.5px] font-extrabold">{lang === "fr" ? "Paiement confirmé" : "Payment confirmed"}</div>
                  <div className="text-[10px] font-semibold text-slate-500">15 000 XAF • MTN MoMo</div>
                </div>
                <span className="ml-auto text-[10px] font-bold text-green-600">✓✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OPERATORS MARQUEE */}
      <section className="border-y border-slate-100 py-8 overflow-hidden">
        <p className="text-center text-[10px] font-extrabold tracking-[0.18em] text-slate-400">{t.acceptedOps}</p>
        <div className="relative mt-6">
          <div className="animate-marquee flex w-max gap-8 px-4">
            {[...OPERATORS, ...OPERATORS].map((op, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 w-[67px] shrink-0">
                <span className="rounded-full ring-2 ring-slate-100">
                  <OperatorLogo name={op.name} size={46} radius={999} />
                </span>
                <span className="text-[10px] font-semibold text-slate-500 text-center leading-tight">{op.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WALLET */}
      <section id="wallet" className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-[10px] font-bold text-yellow-700">
              <Wallet size={11} /> {t.walletBadge}
            </span>
            <h2 className="mt-3 text-[23px] sm:text-[28px] font-extrabold tracking-tight">{t.walletTitle}</h2>
            <p className="mt-1.5 text-[12px] text-slate-500 font-medium">{t.walletSub}</p>
          </div>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {walletCards.map((c) => (
              <div key={c.title} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-md hover:border-yellow-300 transition">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-yellow-300 bg-yellow-50 text-yellow-600">
                  <c.icon size={17} />
                </span>
                <h3 className="mt-4 text-[13px] font-extrabold">{c.title}</h3>
                <p className="mt-1.5 text-[11px] text-slate-500 font-medium leading-relaxed">{c.desc}</p>
              </div>
            ))}
            <div className="rounded-2xl bg-slate-900 p-6 text-white flex flex-col justify-between overflow-hidden relative">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-yellow-400/20 blur-2xl" />
              <div>
                <p className="text-[10.5px] font-bold text-white/60">SDK Pay Wallet</p>
                <p className="mt-1 text-[23px] font-extrabold">1 250 500 <span className="text-[12.5px] text-yellow-400">XAF</span></p>
              </div>
              <Link href="/register" className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-yellow-400 px-5 py-2.5 text-[11.5px] font-extrabold text-slate-900 hover:bg-yellow-300">
                {lang === "fr" ? "Créer mon wallet" : "Create my wallet"} <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHO */}
      <section className="py-10 lg:py-14 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-[10px] font-bold text-yellow-700">
            <Users size={11} /> {t.whoBadge}
          </span>
          <h2 className="mt-3 text-[23px] sm:text-[28px] font-extrabold tracking-tight">{t.whoTitle}</h2>
          <p className="mt-1.5 text-[12px] text-slate-500 font-medium">{t.whoSub}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {whoPills.map((p) => (
              <span key={p.label} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10.5px] font-bold text-slate-700 shadow-sm">
                <p.icon size={11} className="text-yellow-500" /> {p.label}
              </span>
            ))}
          </div>

          <h3 className="mt-12 text-[17.5px] font-extrabold">{t.whyTitle}</h3>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 text-left max-w-6xl mx-auto">
            {whyItems.map((w) => (
              <div key={w.title} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-yellow-500 shadow-sm">
                  <w.icon size={14} />
                </span>
                <div>
                  <div className="text-[12px] font-extrabold">{w.title}</div>
                  <div className="text-[10.5px] text-slate-500 font-medium leading-relaxed">{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="comment" className="py-12 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-[23px] sm:text-[28px] font-extrabold tracking-tight">
            <span className="text-yellow-500">{t.howA}</span> {t.howB}
          </h2>
          <p className="mt-1.5 text-[11.5px] text-slate-500 font-medium">
            {lang === "fr" ? <>Commencez à utiliser <b className="text-slate-700">SDK PAY</b> en 4 étapes simples</> : <>Start using <b className="text-slate-700">SDK PAY</b> in 4 simple steps</>}
          </p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-6 left-[12%] right-[12%] h-px bg-yellow-200" />
            {steps.map((s) => (
              <div key={s.n} className="relative">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-yellow-400 bg-white text-[13px] font-extrabold text-yellow-500 relative z-10">
                  {s.n}
                </div>
                <div className="mt-3 text-[11.5px] font-extrabold">{s.title}</div>
                <div className="mt-1 text-[10px] text-slate-500 font-medium leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOBILE */}
      <section className="py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-8 items-center">
          <div className="relative overflow-hidden rounded-3xl order-2 lg:order-1">
            <img
              src="/images/hero-mobile.jpg"
              alt="Paiement mobile"
              className="h-[281.5px] sm:h-[352px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 to-transparent" />
            <div className="absolute left-5 top-5 max-w-[220px]">
              <p className="text-white text-[17.5px] font-extrabold leading-snug">
                In a competitive market, every <span className="text-yellow-400">transaction counts</span>
              </p>
              <div className="mt-4 space-y-1.5">
                {["VISA", "M-PESA", "airtel", "MTN"].map((b) => (
                  <span key={b} className="mr-1.5 inline-block rounded-full bg-white px-3 py-1 text-[10px] font-extrabold text-slate-800">{b}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-[10px] font-bold text-yellow-700">
              <Smartphone size={11} /> {t.mobileBadge}
            </span>
            <h2 className="mt-3 text-[23px] sm:text-[30px] font-extrabold tracking-tight">{t.mobileTitle}</h2>
            <p className="mt-2 text-[12px] text-slate-500 font-medium">{t.mobileSub}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["MTN MoMo", "Orange Money", "Wave", "Airtel Money", "VISA", "Mastercard"].map((m) => (
                <span key={m} className="rounded-full bg-slate-100 px-3.5 py-1.5 text-[10.5px] font-bold text-slate-700">{m}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section className="mt-8 bg-[#0a1128] py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-[10px] font-bold text-yellow-400">
              <ShieldCheck size={11} /> {t.secBadge}
            </span>
            <h2 className="mt-3 text-[21px] sm:text-[26.5px] font-extrabold tracking-tight text-white">
              <span className="text-yellow-400">{t.secTitle.split("&")[0]}</span>
              <span className="text-white">&</span>
              <span className="text-yellow-400">{t.secTitle.split("&")[1]}</span>
            </h2>
            <p className="mt-2 mx-auto max-w-2xl text-[11px] text-white/60 font-medium"><b className="text-white">SDK PAY</b> {t.secSub.replace(/^SDK PAY\s?/, "")}</p>
          </div>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {secCards.map((c) => (
              <div key={c.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 hover:border-yellow-500/40 transition">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/15 text-yellow-400">
                  <c.icon size={16} />
                </span>
                <h3 className="mt-3 text-[12.5px] font-extrabold text-white">{c.title}</h3>
                <p className="mt-1.5 text-[10.5px] leading-relaxed text-white/55 font-medium">{c.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-yellow-500/25 bg-yellow-500/[0.07] px-6 py-4 text-center">
            <p className="text-[10px] text-white/60 font-medium">
              {lang === "fr" ? "SDK Pay protège les données des utilisateurs et applique les règles de conformité en vigueur." : "SDK Pay protects user data and applies current compliance rules."}{" "}
              <a href="/contact" className="font-bold text-yellow-400 hover:underline">
                {lang === "fr" ? "Consulter notre politique AML/CFT complète →" : "Read our full AML/CFT policy →"}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* API */}
      <section id="api" className="py-12 lg:py-16 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-[10px] font-bold text-yellow-700">
              <Code2 size={11} /> {t.devBadge}
            </span>
            <h2 className="mt-3 text-[24.5px] sm:text-[31.5px] leading-tight font-extrabold tracking-tight">
              <span className="text-yellow-500">{t.apiA}</span> {t.apiB}
            </h2>
            <p className="mt-3 text-[12px] text-slate-500 font-medium leading-relaxed max-w-lg">{t.apiDesc}</p>
            <ul className="mt-5 space-y-2.5">
              {apiChecks.map((c) => (
                <li key={c} className="flex items-start gap-2 text-[11px] font-semibold text-slate-600">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600"><Check size={10} strokeWidth={3} /></span>
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href="/docs" className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-400 px-4 py-2.5 text-[11px] font-extrabold text-slate-900 hover:bg-yellow-300">
                <BookOpen size={12} /> {t.docApi}
              </Link>
              <Link href="/register" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-extrabold text-slate-700 hover:bg-slate-50">
                <Globe size={12} /> {t.checkout}
              </Link>
              <Link href="/docs" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-extrabold text-slate-700 hover:bg-slate-50">
                <Send size={12} /> {t.docPayout}
              </Link>
            </div>
          </div>

          {/* Code window */}
          <div>
            <div className="overflow-hidden rounded-2xl bg-[#0d1117] shadow-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="ml-2 text-[10px] font-mono text-white/40">﹒collect.js</span>
              </div>
              <div className="border-b border-white/10 px-4 py-2.5">
                <p className="text-[10px] font-bold text-white/50">Documentation API</p>
                <p className="text-[10px] font-mono text-green-400 underline">https://doc.sdkpay.com/docs/introduction</p>
              </div>
              <div className="flex gap-2 px-4 py-2.5 border-b border-white/10">
                <button
                  onClick={() => setApiTab("payin")}
                  className={`rounded-md px-3 py-1 text-[10px] font-extrabold ${apiTab === "payin" ? "bg-yellow-400 text-slate-900" : "bg-white/10 text-white/60"}`}
                >
                  Payin
                </button>
                <button
                  onClick={() => setApiTab("payout")}
                  className={`rounded-md px-3 py-1 text-[10px] font-extrabold ${apiTab === "payout" ? "bg-yellow-400 text-slate-900" : "bg-white/10 text-white/60"}`}
                >
                  Payout
                </button>
              </div>
              <div className="px-4 py-2 text-[10px] text-white/40 font-semibold">
                {lang === "fr" ? "Exemple de requête API" : "API request example"} ({apiTab === "payin" ? "Payin" : "Payout"})
              </div>
              <pre className="code-scroll overflow-x-auto px-4 pb-4 font-mono text-[10px] leading-[1.7]">
                <code>
                  <span className="text-sky-300">const</span> <span className="text-white">response</span> <span className="text-white/60">=</span> <span className="text-sky-300">await</span> <span className="text-yellow-200">fetch</span><span className="text-white">(</span>{"\n"}
                  {"  "}<span className="text-green-300">&quot;https://sdkpay.com/v1/{apiTab === "payin" ? "collect" : "disburse"}&quot;</span><span className="text-white">,</span>{"\n"}
                  {"  "}<span className="text-white">{"{"}</span>{"\n"}
                  {"    "}<span className="text-sky-200">method</span><span className="text-white">:</span> <span className="text-green-300">&quot;POST&quot;</span><span className="text-white">,</span>{"\n"}
                  {"    "}<span className="text-sky-200">headers</span><span className="text-white">:</span> <span className="text-white">{"{"}</span>{"\n"}
                  {"      "}<span className="text-green-300">&quot;Authorization&quot;</span><span className="text-white">:</span> <span className="text-green-300">`Bearer ${"{process.env.SDKPAY_API_KEY}"}`</span><span className="text-white">,</span>{"\n"}
                  {"      "}<span className="text-green-300">&quot;Content-Type&quot;</span><span className="text-white">:</span> <span className="text-green-300">&quot;application/json&quot;</span>{"\n"}
                  {"    "}<span className="text-white">{"}"}</span><span className="text-white">,</span>{"\n"}
                  {"    "}<span className="text-sky-200">body</span><span className="text-white">:</span> <span className="text-yellow-200">JSON.stringify</span><span className="text-white">({"{"}</span>{"\n"}
                  {"      "}<span className="text-white">user_id:</span> <span className="text-green-300">&quot;VOTRE_USER_ID&quot;</span><span className="text-white">,</span>{"\n"}
                  {"      "}<span className="text-white">country_code:</span> <span className="text-green-300">&quot;CM&quot;</span><span className="text-white">,</span>{"\n"}
                  {"      "}<span className="text-white">amount:</span> <span className="text-orange-300">5000</span><span className="text-white">,</span>{"\n"}
                  {"      "}<span className="text-white">currency:</span> <span className="text-green-300">&quot;XAF&quot;</span><span className="text-white">,</span>{"\n"}
                  {"      "}<span className="text-white">phone:</span> <span className="text-green-300">&quot;237600000000&quot;</span><span className="text-white">,</span>{"\n"}
                  {"      "}<span className="text-white">operator:</span> <span className="text-green-300">&quot;MTN Money&quot;</span><span className="text-white">,</span>{"\n"}
                  {"      "}<span className="text-white">reference:</span> <span className="text-green-300">&quot;ORDER-123&quot;</span>{"\n"}
                  {"    "}<span className="text-white">{"}"}</span><span className="text-white">)</span>{"\n"}
                  {"  "}<span className="text-white">{"}"}</span><span className="text-white">)</span><span className="text-white">;</span>
                </code>
              </pre>
              <div className="border-t border-white/10 bg-green-500/10 px-4 py-2">
                <p className="font-mono text-[10px] text-green-400">● {lang === "fr" ? "Exemple d'intégration. Consultez la documentation avant tout envoi." : "Integration example. Read the docs before sending."}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                ["22 pays", t.supported],
                ["< 500ms", t.latency],
                ["99.9%", t.uptime],
                ["Webhooks", t.realtime],
              ].map(([a, b]) => (
                <div key={a} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center">
                  <div className="text-[12.5px] font-extrabold">{a}</div>
                  <div className="text-[10px] font-semibold text-slate-400">{b}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Logo />
          <p className="mt-4 max-w-md text-[10px] leading-relaxed text-slate-400 font-medium">
            {lang === "fr"
              ? "SDK Pay est une fintech et ne constitue pas une institution bancaire. L'accès aux services de paiement est soumis aux conditions d'utilisation, aux vérifications d'identité requises et aux réglementations applicables."
              : "SDK Pay is a fintech and is not a banking institution. Access to payment services is subject to terms of use, required identity verifications and applicable regulations."}
          </p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.14em] text-slate-500">ENTREPRISE</p>
              <ul className="mt-3 space-y-2.5 text-[10.5px] font-semibold text-slate-500">
                <li><a href="#" className="hover:text-slate-900">À propos</a></li>
                <li><a href="#" className="hover:text-slate-900">Carrières</a></li>
                <li><a href="#" className="hover:text-slate-900">Blog</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.14em] text-slate-500">SUPPORT</p>
              <ul className="mt-3 space-y-2.5 text-[10.5px] font-semibold text-slate-500">
                <li><a href="#" className="hover:text-slate-900">{lang === "fr" ? "Centre d'aide" : "Help center"}</a></li>
                <li><Link href="/contact" className="hover:text-slate-900">Contact</Link></li>
                <li><a href="#" className="hover:text-slate-900">FAQ</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.14em] text-slate-500">LÉGAL</p>
              <ul className="mt-3 space-y-2.5 text-[10.5px] font-semibold text-slate-500">
                <li><a href="#" className="hover:text-slate-900">{lang === "fr" ? "Conditions d'utilisation" : "Terms of use"}</a></li>
                <li><a href="#" className="hover:text-slate-900">{lang === "fr" ? "Politique de confidentialité" : "Privacy policy"}</a></li>
                <li><a href="#" className="hover:text-slate-900">{lang === "fr" ? "Mentions légales" : "Legal notice"}</a></li>
                <li className="pt-1">support@sdkpay.com</li>
                <li>+237 6 83 67 78 72</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-3 border-t border-slate-100 pt-6">
            <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-yellow-100 hover:text-yellow-700"><Share2 size={12} /></a>
            <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-yellow-100 hover:text-yellow-700"><AtSign size={12} /></a>
            <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-yellow-100 hover:text-yellow-700"><MessageCircle size={12} /></a>
          </div>
          <p className="mt-4 text-center text-[10px] font-semibold text-slate-400">© 2026 SDK Pay. {lang === "fr" ? "Tous droits réservés." : "All rights reserved."}</p>
        </div>
      </footer>
    </div>
  );
}
