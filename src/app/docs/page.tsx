"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

const NAV: { section: string; items: { id: string; label: string }[] }[] = [
  {
    section: "Démarrer",
    items: [
      { id: "welcome", label: "Bienvenue sur SDK Pay" },
      { id: "quickstart", label: "Démarrage rapide" },
      { id: "auth", label: "Authentification" },
    ],
  },
  {
    section: "Checkout",
    items: [{ id: "hosted", label: "Hosted Checkout par redirection" }],
  },
  {
    section: "Direct API",
    items: [
      { id: "direct", label: "Direct API" },
      { id: "momo", label: "Mobile Money" },
      { id: "flow", label: "Flux de paiement Mobile Money" },
      { id: "crypto", label: "Paiements crypto" },
      { id: "wallets", label: "Wallets et conversions" },
      { id: "payouts", label: "Payouts" },
      { id: "webhooks", label: "Webhooks" },
    ],
  },
  {
    section: "Fournisseurs",
    items: [
      { id: "providers", label: "AshTechPay + SasPay" },
      { id: "env", label: "Variables d'environnement" },
    ],
  },
  {
    section: "Référence",
    items: [
      { id: "countries", label: "GET /v1/countries" },
      { id: "transaction", label: "GET /v1/transaction/:id" },
      { id: "fees", label: "GET /v1/fees" },
      { id: "errors", label: "Erreurs et statuts HTTP" },
    ],
  },
  {
    section: "Ressources",
    items: [
      { id: "sandbox", label: "Sandbox et tests" },
      { id: "security", label: "Sécurité" },
    ],
  },
];

function Code({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-2xl bg-[#0d1117] p-5 font-mono text-[12.5px] leading-relaxed text-slate-200">
      {children}
    </div>
  );
}

function H({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-10 scroll-mt-24 text-[22px] font-extrabold tracking-tight first:mt-0">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-2.5 text-[14px] font-medium leading-relaxed text-slate-500">{children}</p>;
}

function C({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[12.5px] font-bold text-slate-800">{children}</code>;
}

export default function DocsPage() {
  const [active, setActive] = useState("welcome");
  const [menu, setMenu] = useState(false);

  function go(id: string) {
    setActive(id);
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const nav = (
    <div className="space-y-5">
      {NAV.map((g) => (
        <div key={g.section}>
          <p className="px-3 text-[13px] font-extrabold text-slate-900">{g.section}</p>
          <div className="mt-1.5 space-y-0.5">
            {g.items.map((it) => (
              <button
                key={it.id}
                onClick={() => go(it.id)}
                className={`block w-full rounded-xl px-3 py-2 text-left text-[15px] font-medium ${
                  active === it.id ? "bg-yellow-50 font-bold text-yellow-600" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {it.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[62px] max-w-6xl items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden items-center gap-1 text-[13px] font-bold text-slate-500 sm:flex">
              <ArrowLeft size={14} /> Accueil
            </Link>
            <Link href="/register" className="rounded-full bg-yellow-400 px-4 py-2 text-[13px] font-extrabold">
              Obtenir une clé API
            </Link>
            <button onClick={() => setMenu(!menu)} className="rounded-lg border border-slate-200 p-2 lg:hidden" aria-label="menu">
              {menu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {menu && <div className="max-h-[60vh] overflow-y-auto border-t border-slate-100 p-4 lg:hidden">{nav}</div>}
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{nav}</div>
        </aside>

        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-[11px] font-extrabold text-yellow-700">
            <BookOpen size={12} /> SDK Pay Developers · API v1
          </span>
          <h1 className="mt-3 text-[30px] font-extrabold tracking-tight">Documentation développeur</h1>
          <p className="mt-2 text-[14px] font-medium text-slate-500">
            Base URL : <C>https://sdkpay.com/v1</C> · Auth Bearer · JSON · 23 pays · Webhooks signés
          </p>

          <H id="welcome">Bienvenue sur SDK Pay</H>
          <P>
            SDK Pay orchestre les paiements Mobile Money et crypto en Afrique via une API REST unique. En
            coulisses, chaque transaction est routée vers <b>AshTechPay Direct</b> (principal) avec{" "}
            <b>SasPay</b> en bascule automatique pour les pays et opérateurs non couverts.
          </P>

          <H id="quickstart">Démarrage rapide</H>
          <P>1. Créez un compte marchand puis générez une clé sur la page Direct API du dashboard.</P>
          <P>2. Encaissez un paiement Mobile Money :</P>
          <Code>
            <p><span className="text-sky-300">POST</span> <span className="text-green-300">/v1/collect</span></p>
            <pre className="mt-2 whitespace-pre-wrap text-[12px]">{`{
  "country_code": "CM",
  "amount": 5000,
  "currency": "XAF",
  "phone": "237600000000",
  "operator": "MTN Money",
  "reference": "ORDER-123"
}`}</pre>
          </Code>
          <P>3. Le client approuve sur son téléphone. 4. Vous recevez le webhook <C>payment.success</C>.</P>

          <H id="auth">Authentification</H>
          <P>Toutes les requêtes authentifiées utilisent votre clé secrète dans l&apos;en-tête Bearer :</P>
          <Code>
            <p className="text-green-300">Authorization: Bearer ak_••••••••••••</p>
            <p className="text-green-300">Content-Type: application/json</p>
          </Code>
          <P>Ne partagez jamais votre clé. Régénérez-la immédiatement en cas de fuite (page Direct API).</P>

          <H id="hosted">Hosted Checkout par redirection</H>
          <P>
            Sans backend : créez un lien depuis le dashboard (<C>/dashboard/links/new</C>) et redirigez vos
            clients vers <C>sdkpay.com/pay/votre-lien</C>. Montant fixe ou libre, QR code, date
            d&apos;expiration et page de succès inclus.
          </P>

          <H id="direct">Direct API</H>
          <P>
            Contrôle total du flux : vos écrans, votre expérience. Collections (Payin), décaissements
            (Payout), statut temps réel, wallets et webhooks signés HMAC-SHA256.
          </P>

          <H id="momo">Mobile Money</H>
          <P>
            23 pays · MTN, Orange, Wave, Moov, Airtel, Free, Celtiis, Coris, M-Pesa et plus. Montant
            minimum 100, devise du pays (XAF / XOF / GHS / NGN…), réglée 1:1 en démo.
          </P>

          <H id="flow">Flux de paiement Mobile Money</H>
          <P>
            <C>pending</C> → le client approuve (push USSD / code PIN) → <C>success</C> (webhook +
            crédit wallet, frais 4 % déduits) ou <C>failed</C> (aucun débit). Interrogez toujours{" "}
            <C>GET /v1/transaction/:id</C> avant de livrer.
          </P>

          <H id="crypto">Paiements crypto</H>
          <P>
            Dépôts USDT via AshTechPay Direct (TRC20 / BEP20 / ERC20, frais 2,5 %) : générez une adresse,
            le client envoie le montant exact, le wallet USDT est crédité après vérification. Retraits :
            1 USDT forfaitaire, le payeur des frais est configurable.
          </P>

          <H id="wallets">Wallets et conversions</H>
          <P>
            Comptes multi-devises (XAF, XOF, USDT + 20 codes pays). Conversions XAF ↔ XOF gratuites à
            parité 1:1, règles de conversion automatique dès 500 FCFA équivalent.
          </P>

          <H id="payouts">Payouts</H>
          <P>
            Envoyez vers Mobile Money (<C>POST /v1/disburse</C>, 4 %) ou USDT. Les échecs provider
            sont automatiquement remboursés sur le wallet. Les payouts SasPay exigent une IP
            sortante autorisée côté SasPay.
          </P>

          <H id="webhooks">Webhooks</H>
          <P>
            Événements <C>payment.success</C>, <C>payment.failed</C>, <C>payout.success</C> vers votre URL.
            Vérifiez <C>X-SDK-Signature</C> (HMAC-SHA256 du corps brut avec votre secret webhook).
          </P>
          <Code>
            <pre className="whitespace-pre-wrap text-[12px]">{`POST {VOTRE_URL}  X-SDK-Signature: <hmac>
{
  "event": "payment.success",
  "data": { "reference": "ORDER-123", "amount": 5000 }
}`}</pre>
          </Code>

          <H id="providers">AshTechPay + SasPay : routage</H>
          <P>
            <b>Règle 1</b> — la crypto passe toujours par AshTechPay Direct. <b>Règle 2</b> — le Mobile
            Money utilise AshTechPay quand le pays + l&apos;opérateur sont couverts. <b>Règle 3</b> —
            sinon (ou en cas d&apos;erreur du principal), SasPay prend automatiquement le relais.{" "}
            <b>Règle 4</b> — sans clés configurées, le routeur simule en mode démo transparent
            (provider <C>demo</C> visible dans le détail de chaque transaction).
          </P>

          <H id="env">Variables d&apos;environnement</H>
          <Code>
            <pre className="whitespace-pre-wrap text-[12px]">{`ASHTECHPAY_API_KEY=...        # clé AshTechPay (live)
ASHTECHPAY_BASE_URL=https://ashtechpay.com/v1
ASHTECHPAY_WEBHOOK_SECRET=...  # vérification webhooks entrants
SASPAY_SECRET_KEY=sk_live_...   # clé SasPay (backup)
SASPAY_BASE_URL=https://api.saspay.me/api/v1
SASPAY_WEBHOOK_SECRET=...       # secret signé SasPay
PROVIDER_MODE=auto              # auto | ashtechpay | saaspay | demo
PUBLIC_BASE_URL=https://sdkpay.com  # URL publique (webhooks)`}</pre>
          </Code>
          <P>
            Webhooks provider à enregistrer : <C>/api/webhooks/ashtechpay</C> et{" "}
            <C>/api/webhooks/saaspay</C>.
          </P>

          <H id="countries">GET /v1/countries</H>
          <P>Liste les pays, devises et opérateurs couverts avec le provider routé pour chacun.</P>

          <H id="transaction">GET /v1/transaction/:id</H>
          <P>Statut temps réel d&apos;une transaction : pending, success ou failed, avec références.</P>

          <H id="fees">GET /v1/fees</H>
          <P>
            Grille : Mobile Money 4 %, crypto dépôt 2,5 %, crypto retrait 1 USDT, transferts internes et
            conversions XAF↔XOF gratuits. Période à frais réduits (−50 %) pour les parrains actifs.
          </P>

          <H id="errors">Erreurs et statuts HTTP</H>
          <P>
            <C>200</C> succès · <C>400</C> paramètres invalides · <C>401</C> clé manquante/invalide ·{" "}
            <C>404</C> introuvable · <C>502</C> erreur provider (avec bascule automatique quand
            possible). Corps : <C>{"{ error: string }"}</C>.
          </P>

          <H id="sandbox">Sandbox et tests</H>
          <P>
            Sans clés : mode démo (approbations simulées en ~15 s). Avec clés <C>sk_test_</C> : bac à
            sable réel des providers. Numéros de test : utilisez vos propres numéros en sandbox.
          </P>

          <H id="security">Sécurité</H>
          <P>
            HTTPS partout, clés hachées SHA-256, PIN à 4 chiffres pour les sorties, sessions
            révocables par appareil, webhooks signés, vérification KYC et conformité AML/CFT.
          </P>

          <div className="mt-10 flex flex-wrap gap-2.5">
            <Link href="/register" className="rounded-xl bg-yellow-400 px-5 py-3 text-[13.5px] font-extrabold">
              Créer un compte marchand
            </Link>
            <Link href="/dashboard/api/direct" className="rounded-xl border border-slate-200 px-5 py-3 text-[13.5px] font-extrabold">
              Ouvrir Direct API
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
