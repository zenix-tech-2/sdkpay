# SDK Pay

Application de paiement en ligne (Next.js App Router + PostgreSQL/Drizzle ORM) pour encaisser des paiements via Mobile Money, liens de paiement et API REST.

## Fonctionnalités
- Landing page française complète (solutions, pays, opérateurs, wallet, sécurité, API REST)
- Inscription avec sélecteur de pays/indicatif, code de parrainage, mots de passe hachés (scrypt)
- Connexion par session HTTP-only, déconnexion
- Dashboard marchand : solde, quick actions, statistiques, activité, conversion, notifications, support
- Liens de paiement + page checkout publique `/pay/[slug]`
- Dépôt, retrait et envoi avec ledger transactionnel et calcul du solde
- Transactions filtrables + export CSV et fiches détaillées (références, frais 4%, historique du solde)
- Nouvel écran "Top up my account" : Mobile Money / Crypto (USDT), pays et devises, opérateurs, confirmation avec frais et montant crédité
- Dépôt Mobile Money avec écran "Processing", compte à rebours, référence copiable et confirmation
- Dépôt crypto avec génération d'adresse USDT.TRC20, QR code, frais 2,5%, timer blockchain et confirmation
- Nouveaux écrans de retrait Mobile Money / Crypto (min/max, destination, réseau, adresse, payeur des frais)
- Nouvel écran "Send money" avec modes Mobile Money, Internal et Crypto
- Soldes XAF et USDT, transactions en attente, transferts internes et retraits crypto persistés en base
- Nouveaux onglets Internal (sans frais) et Crypto pour "Send money"
- "My Accounts" avec portefeuilles multiples, compte primaire XAF, conversion et "Add account" (recherche de devise, création en base)
- Parrainage repensé : lien personnel, copie/partage, période de frais réduits, réseau d'invités et offre 50%
- KYC "Account already verified" avec demande de mise à jour persistée
- Support avec Live chat, Email, WhatsApp, channel WhatsApp et FAQ
- Intégrations : Hosted Checkout / Direct API, clé API régénérable, secret webhook, exemple rapide
- Comptes / clé API, parrainages
- API REST `POST /api/v1/collect` authentifiée par clé Bearer
- Routage Direct API : Ashtechpay principal pour Mobile Money, Saaspay.me en backup si pays/opérateur indisponible, Ashtechpay exclusif pour crypto
- Settings complets : profil, thème, préférences de notifications, conversion automatique, appareils connectés, mot de passe, PIN, suppression de compte
- Centre de notifications avec lecture/suppression individuelle ou globale
- Documentation `/docs` et guide développeur `/docs/direct`

## Base de données
Le schéma Drizzle se trouve dans `src/db/schema.ts`. Les tables sont créées automatiquement au premier accès (`src/lib/ensure-schema.ts`), ou via `npx drizzle-kit push`.

### Supabase
1. Créez un projet Supabase.
2. Dans **Project Settings → Database → Connection string**, copiez l'URI Postgres (mode *Transaction pooler* ou *Session pooler*).
3. Définissez `DATABASE_URL` avec cette URI (ajoutez `?sslmode=require` si nécessaire).
4. Le schéma est compatible avec Supabase Postgres sans modification.

### Vercel
1. Importez le dépôt dans Vercel.
2. Ajoutez la variable d'environnement `DATABASE_URL` (Production + Preview).
3. Déployez : Next.js App Router, routes API et assets statiques sont pris en charge nativement.

### Développement local
```bash
npm install
npx drizzle-kit push
npm run dev
```

## Démonstration
- Compte : `demo@sdkpay.com` / `demo1234`
- Clé API : `sk_test_demo_sdkpay_2026`
- Exemple : `POST /api/v1/collect` avec `{"amount":2500,"phone":"23700000000","operator":"MTN Money","reference":"ORDER-123"}`

## Direct API providers

Le routage est implémenté côté serveur dans `src/lib/payment-providers.ts` :

1. **Mobile Money** : appel de `POST /v1/collect` sur Ashtechpay avec la clé `ak_...`.
2. **Backup** : si le pays ou l'opérateur est absent du catalogue Ashtechpay, ou si Ashtechpay renvoie une erreur d'indisponibilité, appel de `POST /payments/softpay/` sur `https://api.saspay.me/api/v1` avec `Authorization: Bearer sk_...` et `Idempotency-Key`.
3. **Crypto** : toujours `POST /v1/crypto/collect` sur Ashtechpay, sans fallback Saaspay.

Les clés ne sont jamais exposées au navigateur. Copiez `.env.example` vers `.env` et renseignez :

- `ASHTECHPAY_DIRECT_KEY` (`ak_...`)
- `ASHTECHPAY_BASE_URL`, `ASHTECHPAY_COLLECT_PATH`, `ASHTECHPAY_CRYPTO_COLLECT_PATH`
- `SAASPAY_API_KEY` (`sk_live_...` ou `sk_test_...`)
- `SAASPAY_BASE_URL`, `SAASPAY_COLLECT_PATH`, `SAASPAY_NETWORK_MAP`
- `ASHTECHPAY_SUPPORTED_COUNTRIES`, `ASHTECHPAY_SUPPORTED_OPERATORS` pour affiner le contrôle de disponibilité

`GET /api/providers/status` expose la configuration sans jamais renvoyer de secret. Sans clé, l'application reste en mode démonstration et enregistre le provider choisi dans chaque transaction.

> Les paiements sont simulés tant que les clés provider ne sont pas configurées. Branchez les webhooks signés et vérifiez toujours le statut réel de la transaction avant mise en production.

## Motion design

`src/app/motion.css` fournit les transitions globales : route progress bar, révélations staggerées des pages, fade/slide/pop, bottom sheets, boutons avec shimmer, cartes `hover-lift`, marquee des opérateurs, orbes d'arrière-plan, dots de processing et QR reveal.

- `Settings → Appearance → Motion & transitions` permet d'activer/désactiver les animations via `localStorage` (`sdkpay_motion`).
- `prefers-reduced-motion: reduce` est respecté automatiquement.
- `DashboardShell` applique `page-enter` à chaque changement de route et une barre de progression animée.

## Icônes & logos

Les assets sont **bundlés localement** dans `public/logos` (pas de CDN au runtime). Consultez `public/logos/CREDITS.md` pour les licences et `public/logos/manifest.json` pour les compteurs.

- 70+ marques providers : Mobile Money, agrégateurs, cartes, wallets, crypto.
- 271 drapeaux pays en versions 1x1 et 4x3 (`lipis/flag-icons`).
- 490 icônes de régions/provinces : drapeaux ISO 3166-2 (`amckenna41/iso3166-flags`) + badges générés pour combler les pays sans drapeau de subdivision.
- Logos réels MTN, Orange Money, Wave, Moov, Airtel, Visa, Mastercard, Apple Pay, Google Pay, PayPal, USDT, BTC, ETH, TRX, etc.
- Fallbacks SVG générés avec les couleurs de marque pour tous les providers sans fichier officiel.
- Catalogue TypeScript : `src/lib/icon-catalog.ts`; composants : `src/components/IconAssets.tsx`; galerie : `/dashboard/icons`.
- Sources ouvertes utilisées : `lipis/flag-icons`, `amckenna41/iso3166-flags`, `datatrans/payment-logos`, `aloahmilton/paybrand`, `Yupixi/frontend`, `kouakoumark9-blip/Mybigmarket`, `spothq/cryptocurrency-icons`.

## Admin panel — separate deployment

The admin console lives under **`/admin`** and is intentionally isolated from the merchant app. It is one unified SDK Pay operations console; the uploaded screens were used only as layout and feature inspiration, not as copy.

- Independent cookie: `sdkpay_admin_session`
- Independent tables: `admin_users`, `admin_sessions`, `admin_members`, `admin_kyc_submissions`, `admin_*`
- Independent API namespace: `/api/admin/*`
- Own layout, navigation, session guard and audit log (no reuse of `DashboardShell`)
- Responsive dark-navy sidebar with grouped navigation and mobile drawer

### Full feature coverage

- **Overview & analytics:** dashboard, reports, revenue-by-provider charts, CSV export
- **Client app control:** merchant accounts, status/KYC/risk/API-key/balance controls, real client KYC submissions, wallets and balances, client transaction ledger
- **Payments:** admin transactions, payment links, refunds & disputes, withdrawals, provider routing, fee rules
- **Compliance & support:** KYC approvals/decisions, support tickets, support inbox, merchant alerts, reviews
- **Content & operations:** updates & media, notifications, catalog/requests
- **Platform:** monitoring, audit log, feature flags, team & roles, merchant app, docs, settings
- Every mutating action is written to the independent admin audit log.

### Demo admin

- URL: `/admin/login`
- Email: `admin@sdkpay.com`
- Password: `admin1234`

Override with `ADMIN_EMAIL` and `ADMIN_PASSWORD` in production. The password hash is refreshed at bootstrap from the environment.

### Deploy admin separately on Vercel

1. Create a second Vercel project from the same repository.
2. Set `ADMIN_ONLY_DEPLOYMENT=1`.
3. Set `DATABASE_URL` to the shared DB or `ADMIN_DATABASE_URL` to a dedicated admin DB.
4. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_FULL_NAME`, `ADMIN_SESSION_TTL_DAYS`.
5. Set `NEXT_PUBLIC_CLIENT_APP_URL` to the merchant deployment URL.
6. Keep provider keys (`ASHTECHPAY_*`, `SAASPAY_*`) server-side for monitoring and routing status.

With `ADMIN_ONLY_DEPLOYMENT=1`, middleware redirects all non-admin routes to `/admin` and protects `/api/admin/*`. `/api/health` remains available for health checks. See `.env.example` for the full list.
