import Link from "next/link";
import { ArrowRight, Code2, KeyRound, ShieldCheck, Webhook } from "lucide-react";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Documentation API | SDK Pay" };

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fd]">
      <header className="border-b border-[#e8edf6] bg-white">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5">
          <Logo size="md" />
          <div className="flex items-center gap-3 text-[12px] font-bold"><Link href="/" className="text-[#5d6882] hover:text-[#e5a300]">Accueil</Link><Link href="/signup" className="brand-btn rounded-lg px-4 py-2 text-white">Créer un compte</Link></div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-12">
        <span className="chip"><Code2 size={11} /> API REST</span>
        <h1 className="font-display mt-4 text-[34px] font-extrabold text-[#111b36] sm:text-[46px]">Documentation API SDK Pay</h1>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[#6c7892]">Collectez des paiements Mobile Money dans vos applications. Cette API est compatible avec Postgres/Supabase et déployée sur Vercel.</p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-2xl border border-[#e6ebf5] bg-white p-5 text-[13px] font-semibold text-[#4b5875]">
            <p className="mb-3 text-[10px] font-extrabold tracking-widest text-[#8b96b0]">SOMMAIRE</p>
            {[["#auth", "Authentification"], ["#collect", "POST /v1/collect"], ["#links", "Liens de paiement"], ["#webhooks", "Webhooks"], ["#security", "Sécurité & AML/CFT"]].map(([href, label]) => <a key={href} href={href} className="block rounded-lg px-2 py-2 hover:bg-[#fff5dc] hover:text-[#c28a05]">{label}</a>)}
          </aside>
          <div className="space-y-6">
            <section id="auth" className="rounded-2xl border border-[#e6ebf5] bg-white p-6">
              <h2 className="flex items-center gap-2 text-[19px] font-extrabold text-[#17213d]"><KeyRound size={18} className="text-[#e5a300]" /> Authentification</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-[#6c7892]">Récupérez votre clé API dans <Link href="/dashboard/accounts" className="font-bold text-[#e5a300]">Dashboard → Accounts</Link> et envoyez-la dans l&apos;en-tête Authorization.</p>
              <pre className="code-window mt-4 overflow-x-auto p-4 text-[11px] leading-relaxed"><code>{`Authorization: Bearer sk_test_VOTRE_CLE_API
Content-Type: application/json`}</code></pre>
              <p className="mt-3 text-[11px] text-[#8b96b0]">Compte de démonstration : demo@sdkpay.com / demo1234 · clé sk_test_demo_sdkpay_2026</p>
            </section>
            <section id="collect" className="rounded-2xl border border-[#e6ebf5] bg-white p-6">
              <h2 className="text-[19px] font-extrabold text-[#17213d]">POST /api/v1/collect</h2>
              <p className="mt-2 text-[13px] text-[#6c7892]">Initie un encaissement Mobile Money et crédite le wallet marchand.</p>
              <pre className="code-window mt-4 overflow-x-auto p-5 text-[11px] leading-[1.8]"><code>{`curl -X POST https://votre-app.vercel.app/api/v1/collect \\
  -H "Authorization: Bearer sk_test_demo_sdkpay_2026" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 2500,
    "currency": "XAF",
    "phone": "23700000000",
    "operator": "MTN Money",
    "reference": "ORDER-123"
  }'`}</code></pre>
              <p className="mt-4 text-[13px] font-bold text-[#17213d]">Réponse 201</p>
              <pre className="code-window mt-2 overflow-x-auto p-4 text-[11px] leading-[1.8]"><code>{`{
  "status": "success",
  "transaction_id": "SDK-...",
  "amount": 2500,
  "currency": "XAF",
  "new_balance": 2509
}`}</code></pre>
            </section>
            <section id="providers" className="rounded-2xl border border-[#e6ebf5] bg-white p-6">
              <h2 className="flex items-center gap-2 text-[19px] font-extrabold text-[#17213d]"><ShieldCheck size={18} className="text-[#e5a300]" /> Routage des providers Direct API</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-[#6c7892]">Les paiements Mobile Money utilisent <strong>Ashtechpay Direct API</strong> en principal. Si un pays ou un opérateur n&apos;est pas disponible chez Ashtechpay, <strong>Saaspay.me Direct API</strong> prend le relais automatiquement. Les paiements crypto restent exclusivement sur <strong>Ashtechpay Direct API</strong>.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/docs/direct" className="rounded-lg bg-[#ffb800] px-3 py-2 text-[11px] font-bold text-white">Guide Direct API</Link>
                <a href="https://doc.ashtechpay.com" target="_blank" rel="noreferrer" className="rounded-lg border border-[#e6ebf5] px-3 py-2 text-[11px] font-bold text-[#3c4966]">Docs Ashtechpay</a>
                <a href="https://docs.saspay.me/quickstart" target="_blank" rel="noreferrer" className="rounded-lg border border-[#e6ebf5] px-3 py-2 text-[11px] font-bold text-[#3c4966]">Docs Saaspay.me</a>
              </div>
            </section>
            <section id="links" className="rounded-2xl border border-[#e6ebf5] bg-white p-6">
              <h2 className="text-[19px] font-extrabold text-[#17213d]">Liens de paiement & Checkout</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-[#6c7892]">Créez un lien depuis <Link href="/dashboard/links" className="font-bold text-[#e5a300]">My links</Link>, partagez-le, et vos clients paient sur une page checkout optimisée mobile : <code className="rounded bg-[#f5f8ff] px-2 py-1">/pay/[slug]</code>.</p>
              <div className="mt-4 flex flex-wrap gap-2">{[["GET /api/pay/[slug]", "Détails du lien"], ["POST /api/pay/[slug]", "Simuler le paiement"], ["POST /api/links", "Créer un lien"]].map(([a, b]) => <span key={a} className="rounded-lg border border-[#e6ebf5] px-3 py-2 text-[11px] text-[#3c4966]"><strong>{a}</strong> · {b}</span>)}</div>
            </section>
            <section id="webhooks" className="rounded-2xl border border-[#e6ebf5] bg-white p-6">
              <h2 className="flex items-center gap-2 text-[19px] font-extrabold text-[#17213d]"><Webhook size={18} className="text-[#e5a300]" /> Webhooks & événements</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-[#6c7892]">Chaque paiement est enregistré dans la table <code>transactions</code> avec son statut, sa référence et sa méthode. Consultez-les via <code>GET /api/dashboard</code> ou <code>GET /api/transactions</code>. Les événements disponibles : payment.succeeded, payin.completed, payout.completed, link.created.</p>
            </section>
            <section id="security" className="rounded-2xl border border-[#e6ebf5] bg-white p-6">
              <h2 className="flex items-center gap-2 text-[19px] font-extrabold text-[#17213d]"><ShieldCheck size={18} className="text-[#e5a300]" /> Sécurité & conformité AML/CFT</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-[#6c7892]">Toutes les communications sont chiffrées (HTTPS). Les comptes sont vérifiés (KYC), chaque transaction est journalisée et analysée par le monitoring anti-fraude. SDK Pay applique une politique stricte de lutte contre le blanchiment de capitaux et le financement du terrorisme, conformément aux standards GAFI. Les paiements sont simulés dans cet environnement de démonstration : aucun agrégateur bancaire réel n&apos;est contacté.</p>
            </section>
            <Link href="/signup" className="brand-btn inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[13px]">Obtenir ma clé API <ArrowRight size={15} /></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
