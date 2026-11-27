import { COUNTRIES } from "@/data/countries";

export type Lang = "fr" | "en";
type L = Record<Lang, string>;

export interface DocPage {
  slug: string;
  section: L;
  title: L;
  summary: L;
  body: L;
}

export const SITE = {
  name: "SDK Pay",
  support: "support@sdkpay.com",
  tagline: {
    en: "Mobile Money and crypto payments for Africa: payment links, multi-currency wallets, payouts.",
    fr: "Paiements Mobile Money et crypto pour l'Afrique : liens de paiement, wallets multi-devises, retraits.",
  } as L,
};

export const DOC_PAGES: DocPage[] = [
  {
    slug: "introduction",
    section: { en: "Start here", fr: "Démarrer" },
    title: { en: "Introduction", fr: "Introduction" },
    summary: {
      en: "What SDK Pay is and what you can do with it.",
      fr: "Ce qu'est SDK Pay et ce que vous pouvez en faire.",
    },
    body: {
      en: `SDK Pay lets creators, entrepreneurs and shops get paid across Africa with **Mobile Money** and **crypto (USDT)**. You share a payment link, your customer pays from their phone, and the money lands in your SDK Pay wallet.

## What you can do

- Create **payment links** (fixed or free amount, QR code, expiry date, success page or file delivery).
- Collect **Mobile Money** payments in dozens of countries (MTN, Orange, Wave, Moov, Airtel, M-Pesa and more).
- Accept **USDT** deposits on TRC20, BEP20 and ERC20.
- Hold balances in several **wallets** (XAF, XOF, GHS, NGN, KES, USDT and others) and convert between them.
- **Send** money to other SDK Pay users, **withdraw** to Mobile Money or to a crypto address.
- Follow everything in real time from the dashboard: transactions, fees, KYC, referrals.

## How a payment flows

1. The customer opens your link at \`{{BASE_URL}}/pay/your-link\`.
2. They enter their phone number and operator, then approve the request on their phone.
3. The payment stays **pending** until the payment network confirms it.
4. It becomes **success** (your wallet is credited, fees deducted) or **failed** (nothing is debited).

> SDK Pay routes each payment through the best available payment partner and automatically switches to a backup partner when the first one cannot handle a country, an operator or a request. You do not need to configure anything for this.

## Where to go next

- New here? Read [Getting started](/docs/getting-started).
- Want to sell now? Read [Payment links](/docs/payment-links).
- Building your own checkout? Read [Developers](/docs/developers).
- Using an AI assistant? Read [AI access](/docs/ai-access).`,
      fr: `SDK Pay permet aux créateurs, entrepreneurs et commerçants d'être payés partout en Afrique par **Mobile Money** et **crypto (USDT)**. Vous partagez un lien de paiement, votre client paie depuis son téléphone, et l'argent arrive dans votre wallet SDK Pay.

## Ce que vous pouvez faire

- Créer des **liens de paiement** (montant fixe ou libre, QR code, date d'expiration, page de succès ou livraison d'un fichier).
- Encaisser en **Mobile Money** dans des dizaines de pays (MTN, Orange, Wave, Moov, Airtel, M-Pesa et plus).
- Accepter des dépôts **USDT** sur TRC20, BEP20 et ERC20.
- Détenir des soldes dans plusieurs **wallets** (XAF, XOF, GHS, NGN, KES, USDT et autres) et convertir entre eux.
- **Envoyer** de l'argent à d'autres utilisateurs SDK Pay, **retirer** vers Mobile Money ou une adresse crypto.
- Suivre tout en temps réel depuis le dashboard : transactions, frais, KYC, parrainage.

## Déroulement d'un paiement

1. Le client ouvre votre lien \`{{BASE_URL}}/pay/votre-lien\`.
2. Il saisit son numéro et son opérateur, puis approuve la demande sur son téléphone.
3. Le paiement reste **pending** (en attente) jusqu'à confirmation du réseau de paiement.
4. Il passe à **success** (wallet crédité, frais déduits) ou **failed** (aucun débit).

> SDK Pay oriente chaque paiement vers le meilleur partenaire disponible et bascule automatiquement vers un partenaire de secours quand le premier ne peut pas traiter un pays, un opérateur ou une requête. Aucune configuration n'est nécessaire de votre côté.

## Pour continuer

- Nouveau ? Lisez [Prise en main](/docs/getting-started).
- Vendre maintenant ? Lisez [Liens de paiement](/docs/payment-links).
- Vous créez votre propre checkout ? Lisez [Développeurs](/docs/developers).
- Vous utilisez un assistant IA ? Lisez [Accès IA](/docs/ai-access).`,
    },
  },
  {
    slug: "getting-started",
    section: { en: "Start here", fr: "Démarrer" },
    title: { en: "Getting started", fr: "Prise en main" },
    summary: {
      en: "Create your account, verify your identity and receive your first payment.",
      fr: "Créez votre compte, vérifiez votre identité et recevez votre premier paiement.",
    },
    body: {
      en: `## 1. Create your account

Go to [Register]({{BASE_URL}}/register), choose your country and create your account. Your country sets your main wallet currency (for example XAF for Cameroon, XOF for Senegal).

## 2. Verify your identity (KYC)

Open **Dashboard → KYC** and submit the requested information. Verification builds trust on your account and may be required for some operations. You can update your details later from the same page.

## 3. Set your PIN

Set a 4-digit PIN in **Settings**. The PIN protects withdrawals and transfers.

## 4. Create your first payment link

1. Open **Dashboard → Links → New**.
2. Give it a title, choose the currency, and set an amount (or leave it empty so the customer chooses).
3. Optionally add an image, a file to deliver after payment, an expiry date and a redirect page.
4. Share the link or its QR code.

## 5. Get paid

When a customer pays, the transaction appears in **Dashboard → Transactions** as pending, then success. Your wallet is credited with the amount minus the fee.

## 6. Cash out

Use **Withdraw** to send money to your Mobile Money number, or **Send** to pay another SDK Pay user. See [Sending and withdrawing](/docs/sending-withdrawing).`,
      fr: `## 1. Créez votre compte

Allez sur [Inscription]({{BASE_URL}}/register), choisissez votre pays et créez votre compte. Votre pays définit la devise de votre wallet principal (par exemple XAF pour le Cameroun, XOF pour le Sénégal).

## 2. Vérifiez votre identité (KYC)

Ouvrez **Dashboard → KYC** et envoyez les informations demandées. La vérification renforce la confiance dans votre compte et peut être exigée pour certaines opérations. Vous pouvez mettre à jour vos informations depuis la même page.

## 3. Définissez votre code PIN

Définissez un PIN à 4 chiffres dans **Paramètres**. Il protège les retraits et les transferts.

## 4. Créez votre premier lien de paiement

1. Ouvrez **Dashboard → Liens → Nouveau**.
2. Donnez un titre, choisissez la devise et fixez un montant (ou laissez vide pour que le client choisisse).
3. Ajoutez au besoin une image, un fichier livré après paiement, une date d'expiration et une page de redirection.
4. Partagez le lien ou son QR code.

## 5. Encaissez

Quand un client paie, la transaction apparaît dans **Dashboard → Transactions** en attente, puis réussie. Votre wallet est crédité du montant moins les frais.

## 6. Retirez vos fonds

Utilisez **Retrait** pour envoyer vers votre numéro Mobile Money, ou **Envoyer** pour payer un autre utilisateur SDK Pay. Voir [Envoyer et retirer](/docs/sending-withdrawing).`,
    },
  },
  {
    slug: "payment-links",
    section: { en: "Accept payments", fr: "Encaisser" },
    title: { en: "Payment links", fr: "Liens de paiement" },
    summary: {
      en: "Create, share and track hosted payment pages.",
      fr: "Créer, partager et suivre des pages de paiement hébergées.",
    },
    body: {
      en: `A payment link is a hosted checkout page. You do not need a website or any code.

## Link address

Every link lives at:

\`\`\`
{{BASE_URL}}/pay/<slug>
\`\`\`

The address always follows the domain SDK Pay is served on, so links keep working if you switch domains. Slugs are generated from the title, or you can choose a custom one (at least 3 characters, must be unique).

## Options

| Option | Description |
|---|---|
| Title | Shown to the customer (required) |
| Amount | Fixed amount, or empty for a free amount (minimum 100) |
| Currency | The wallet currency that receives the payment (XAF, XOF, GHS, ...) |
| Description | Short text shown on the page |
| Image | Product or brand image |
| Expiry date | After this date the link refuses payments |
| File (PDF) | Delivered to the customer after a successful payment |
| Redirect URL | Where the customer is sent after a successful payment |
| Allowed countries | Limit who can pay (default: all) |

## Customer experience

1. The customer enters their phone number **with the country code** (for example \`+237...\`), picks the operator and, for free-amount links, the amount.
2. They approve the payment on their phone (USSD prompt or PIN).
3. The page polls for the result and shows success or failure. Pending requests expire after 8 minutes.

> A link only accepts payments in its own currency. A XAF link rejects a number from an XOF country.

## Tracking

The links page shows views, number of payments and total collected for each link. You can deactivate a link at any time; a deactivated or expired link rejects payments.

## Fees

Mobile Money payments cost 4% (see [Fees and limits](/docs/fees-limits)). The fee is deducted from the amount credited to you.`,
      fr: `Un lien de paiement est une page de paiement hébergée. Aucun site web ni code n'est nécessaire.

## Adresse du lien

Chaque lien se trouve à :

\`\`\`
{{BASE_URL}}/pay/<slug>
\`\`\`

L'adresse suit toujours le domaine sur lequel SDK Pay est servi : vos liens continuent de fonctionner si vous changez de domaine. Le slug est généré depuis le titre, ou vous pouvez en choisir un (3 caractères minimum, unique).

## Options

| Option | Description |
|---|---|
| Titre | Affiché au client (obligatoire) |
| Montant | Montant fixe, ou vide pour un montant libre (minimum 100) |
| Devise | Devise du wallet qui reçoit le paiement (XAF, XOF, GHS, ...) |
| Description | Court texte affiché sur la page |
| Image | Image du produit ou de la marque |
| Date d'expiration | Après cette date, le lien refuse les paiements |
| Fichier (PDF) | Livré au client après un paiement réussi |
| URL de redirection | Page vers laquelle le client est envoyé après un paiement réussi |
| Pays autorisés | Limiter qui peut payer (par défaut : tous) |

## Expérience client

1. Le client saisit son numéro **avec l'indicatif pays** (par exemple \`+237...\`), choisit l'opérateur et, pour un montant libre, le montant.
2. Il approuve le paiement sur son téléphone (USSD ou code PIN).
3. La page attend le résultat et affiche succès ou échec. Les demandes en attente expirent après 8 minutes.

> Un lien n'accepte que les paiements dans sa propre devise. Un lien XAF refuse un numéro d'un pays XOF.

## Suivi

La page des liens affiche les vues, le nombre de paiements et le total encaissé par lien. Vous pouvez désactiver un lien à tout moment ; un lien désactivé ou expiré refuse les paiements.

## Frais

Les paiements Mobile Money coûtent 4 % (voir [Frais et limites](/docs/fees-limits)). Les frais sont déduits du montant crédité.`,
    },
  },
  {
    slug: "mobile-money",
    section: { en: "Accept payments", fr: "Encaisser" },
    title: { en: "Mobile Money", fr: "Mobile Money" },
    summary: {
      en: "Supported countries, operators, currencies and the payment lifecycle.",
      fr: "Pays, opérateurs, devises supportés et cycle de vie d'un paiement.",
    },
    body: {
      en: `## Supported countries and operators

{{COUNTRIES_TABLE}}

Availability of each operator can change. If a combination is not available, the customer sees: "Mobile Money is not available for this country or operator right now. Please try another option. No amount was debited."

## Payment lifecycle

| Status | Meaning |
|---|---|
| \`pending\` | Waiting for the customer to approve on their phone |
| \`success\` | Confirmed by the payment network. Wallet credited. |
| \`failed\` | Refused, cancelled or expired. Nothing was debited. |

A pending payment is never credited without confirmation from the payment network. If the customer does not approve within 8 minutes, the payment expires and becomes \`failed\`.

## Phone numbers

Use the international format with the country code, for example \`+237670000000\` or \`237670000000\`. Spaces are ignored.

## Limits

The minimum Mobile Money payment is 100 in the wallet currency. See [Fees and limits](/docs/fees-limits).`,
      fr: `## Pays et opérateurs supportés

{{COUNTRIES_TABLE}}

La disponibilité de chaque opérateur peut évoluer. Si une combinaison n'est pas disponible, le client voit : « Mobile Money is not available for this country or operator right now. Please try another option. No amount was debited. »

## Cycle de vie d'un paiement

| Statut | Signification |
|---|---|
| \`pending\` | En attente d'approbation du client sur son téléphone |
| \`success\` | Confirmé par le réseau de paiement. Wallet crédité. |
| \`failed\` | Refusé, annulé ou expiré. Aucun débit. |

Un paiement en attente n'est jamais crédité sans confirmation du réseau de paiement. Sans approbation sous 8 minutes, le paiement expire et passe à \`failed\`.

## Numéros de téléphone

Utilisez le format international avec l'indicatif, par exemple \`+237670000000\` ou \`237670000000\`. Les espaces sont ignorés.

## Limites

Le paiement Mobile Money minimum est de 100 dans la devise du wallet. Voir [Frais et limites](/docs/fees-limits).`,
    },
  },
  {
    slug: "crypto",
    section: { en: "Accept payments", fr: "Encaisser" },
    title: { en: "Crypto (USDT)", fr: "Crypto (USDT)" },
    summary: {
      en: "Deposit and withdraw USDT on TRC20, BEP20 and ERC20.",
      fr: "Déposer et retirer des USDT sur TRC20, BEP20 et ERC20.",
    },
    body: {
      en: `## Deposit USDT

1. Open **Dashboard → Deposit → Crypto (USDT)**.
2. Choose your country, the network (TRC20, BEP20 or ERC20) and the amount (minimum 1 USDT).
3. SDK Pay shows a deposit address. Send **the exact amount** on **the selected network** only.
4. Once the network confirms the transfer, your USDT wallet is credited (deposit fee 2.5%).

> Sending on the wrong network or to an old address can lose funds permanently. Always copy the address shown for the current deposit.

## Withdraw USDT

1. Open **Dashboard → Withdraw → Crypto**.
2. Enter the destination address, the network and the amount.
3. Confirm with your PIN.

Withdrawals cost a flat **1 USDT**. You choose whether you or the recipient pays that fee. The minimum is 1 USDT and the amount must be higher than the fee.

## Statuses

Crypto deposits follow the same statuses as Mobile Money: \`pending\`, \`success\`, \`failed\`.`,
      fr: `## Déposer des USDT

1. Ouvrez **Dashboard → Dépôt → Crypto (USDT)**.
2. Choisissez votre pays, le réseau (TRC20, BEP20 ou ERC20) et le montant (minimum 1 USDT).
3. SDK Pay affiche une adresse de dépôt. Envoyez **le montant exact** sur **le réseau choisi** uniquement.
4. Une fois le transfert confirmé par le réseau, votre wallet USDT est crédité (frais de dépôt 2,5 %).

> Envoyer sur un mauvais réseau ou vers une ancienne adresse peut faire perdre les fonds définitivement. Copiez toujours l'adresse affichée pour le dépôt en cours.

## Retirer des USDT

1. Ouvrez **Dashboard → Retrait → Crypto**.
2. Saisissez l'adresse de destination, le réseau et le montant.
3. Confirmez avec votre PIN.

Les retraits coûtent **1 USDT** forfaitaire. Vous choisissez si c'est vous ou le destinataire qui paie ces frais. Le minimum est de 1 USDT et le montant doit dépasser les frais.

## Statuts

Les dépôts crypto suivent les mêmes statuts que le Mobile Money : \`pending\`, \`success\`, \`failed\`.`,
    },
  },
  {
    slug: "wallets",
    section: { en: "Manage money", fr: "Gérer l'argent" },
    title: { en: "Wallets and conversions", fr: "Wallets et conversions" },
    summary: {
      en: "Multi-currency balances and converting between them.",
      fr: "Soldes multi-devises et conversions entre eux.",
    },
    body: {
      en: `Your account holds one balance per wallet. Open **Dashboard → Accounts** to see them all and create new ones.

## Wallet types

- **Local currency wallets**: XAF, XOF and one wallet per supported country (for example GHS, NGN, KES, GNF, CDF).
- **USDT wallet**: for crypto deposits and withdrawals.

## Conversions

Use **Convert** to move money between your wallets. XAF ↔ XOF conversions are free at a 1:1 rate. The minimum conversion is 100.

## Automatic conversion

You can create rules that convert incoming funds automatically, for example when a foreign-currency payment arrives. Rules apply from 500 in equivalent value.

## Balances

The balance shown on the dashboard is the amount available now. Pending payments and pending withdrawals are not counted until they are settled.`,
      fr: `Votre compte contient un solde par wallet. Ouvrez **Dashboard → Comptes** pour tous les voir et en créer de nouveaux.

## Types de wallets

- **Wallets en devise locale** : XAF, XOF et un wallet par pays supporté (par exemple GHS, NGN, KES, GNF, CDF).
- **Wallet USDT** : pour les dépôts et retraits crypto.

## Conversions

Utilisez **Convertir** pour déplacer de l'argent entre vos wallets. Les conversions XAF ↔ XOF sont gratuites à parité 1:1. La conversion minimale est de 100.

## Conversion automatique

Vous pouvez créer des règles qui convertissent automatiquement les fonds entrants, par exemple à l'arrivée d'un paiement en devise étrangère. Les règles s'appliquent à partir de 500 en valeur équivalente.

## Soldes

Le solde affiché sur le dashboard est le montant disponible maintenant. Les paiements et retraits en attente ne sont pas comptés tant qu'ils ne sont pas réglés.`,
    },
  },
  {
    slug: "sending-withdrawing",
    section: { en: "Manage money", fr: "Gérer l'argent" },
    title: { en: "Sending and withdrawing", fr: "Envoyer et retirer" },
    summary: {
      en: "Pay other SDK Pay users and cash out to Mobile Money or crypto.",
      fr: "Payer d'autres utilisateurs SDK Pay et retirer vers Mobile Money ou crypto.",
    },
    body: {
      en: `## Send

**Dashboard → Send** transfers money instantly to another SDK Pay user. Internal transfers are free. The minimum is 100 (or 1 USDT for USDT transfers). Confirm with your PIN.

## Withdraw to Mobile Money

**Dashboard → Withdraw** pays out to a Mobile Money number.

- Minimum 550, maximum 2,000,000 per withdrawal (in the wallet currency).
- Fee: 4%.
- Confirm with your PIN.
- If the payout fails at the payment network, the amount is automatically returned to your wallet.
- Some withdrawals may be held for review before they are sent. They stay pending until approved.

## Withdraw crypto

See [Crypto (USDT)](/docs/crypto). Flat fee of 1 USDT, maximum 1,500 USDT per withdrawal.

## History

Every movement appears in **Dashboard → Transactions** with its reference, status, fee and balance before and after.`,
      fr: `## Envoyer

**Dashboard → Envoyer** transfère instantanément de l'argent vers un autre utilisateur SDK Pay. Les transferts internes sont gratuits. Le minimum est de 100 (ou 1 USDT pour les transferts USDT). Confirmez avec votre PIN.

## Retirer vers Mobile Money

**Dashboard → Retrait** envoie vers un numéro Mobile Money.

- Minimum 550, maximum 2 000 000 par retrait (dans la devise du wallet).
- Frais : 4 %.
- Confirmez avec votre PIN.
- Si le retrait échoue côté réseau de paiement, le montant est automatiquement remboursé sur votre wallet.
- Certains retraits peuvent être mis en revue avant envoi ; ils restent en attente jusqu'à validation.

## Retirer en crypto

Voir [Crypto (USDT)](/docs/crypto). Frais forfaitaires de 1 USDT, maximum 1 500 USDT par retrait.

## Historique

Chaque mouvement apparaît dans **Dashboard → Transactions** avec sa référence, son statut, ses frais et les soldes avant et après.`,
    },
  },
  {
    slug: "fees-limits",
    section: { en: "Manage money", fr: "Gérer l'argent" },
    title: { en: "Fees and limits", fr: "Frais et limites" },
    summary: {
      en: "What each operation costs and the minimum and maximum amounts.",
      fr: "Coût de chaque opération, montants minimum et maximum.",
    },
    body: {
      en: `## Fees

| Operation | Fee |
|---|---|
| Mobile Money payment received | 4% |
| Mobile Money withdrawal / payout | 4% |
| Crypto (USDT) deposit | 2.5% |
| Crypto (USDT) withdrawal | 1 USDT flat |
| Transfer between SDK Pay users | Free |
| XAF ↔ XOF conversion | Free |

Fees are deducted from the amount. The transaction detail always shows the fee and the balance before and after.

## Reduced fees

Active referrers can get a period with **50% off** Mobile Money fees (2% instead of 4%). See **Dashboard → Referrals**.

## Limits

| Operation | Minimum | Maximum |
|---|---|---|
| Mobile Money payment / deposit | 100 | - |
| Mobile Money withdrawal | 550 | 2,000,000 |
| Transfer to a user | 100 | - |
| Conversion | 100 | - |
| Crypto deposit | 1 USDT | - |
| Crypto withdrawal | 1 USDT (above the fee) | 1,500 USDT |

Amounts are in the wallet currency. Limits and fees can be adjusted by SDK Pay; the dashboard always shows the current values.`,
      fr: `## Frais

| Opération | Frais |
|---|---|
| Paiement Mobile Money reçu | 4 % |
| Retrait / payout Mobile Money | 4 % |
| Dépôt crypto (USDT) | 2,5 % |
| Retrait crypto (USDT) | 1 USDT forfaitaire |
| Transfert entre utilisateurs SDK Pay | Gratuit |
| Conversion XAF ↔ XOF | Gratuit |

Les frais sont déduits du montant. Le détail d'une transaction affiche toujours les frais et les soldes avant et après.

## Frais réduits

Les parrains actifs peuvent obtenir une période à **−50 %** sur les frais Mobile Money (2 % au lieu de 4 %). Voir **Dashboard → Parrainage**.

## Limites

| Opération | Minimum | Maximum |
|---|---|---|
| Paiement / dépôt Mobile Money | 100 | - |
| Retrait Mobile Money | 550 | 2 000 000 |
| Transfert vers un utilisateur | 100 | - |
| Conversion | 100 | - |
| Dépôt crypto | 1 USDT | - |
| Retrait crypto | 1 USDT (au-dessus des frais) | 1 500 USDT |

Les montants sont dans la devise du wallet. SDK Pay peut ajuster les limites et les frais ; le dashboard affiche toujours les valeurs en vigueur.`,
    },
  },
  {
    slug: "developers",
    section: { en: "Build", fr: "Développer" },
    title: { en: "Developers", fr: "Développeurs" },
    summary: {
      en: "Public endpoints to build your own checkout on top of payment links.",
      fr: "Endpoints publics pour créer votre propre checkout au-dessus des liens de paiement.",
    },
    body: {
      en: `You can embed or replace the hosted page by calling the public payment-link endpoints. They need no authentication because the customer is the one paying.

**Base URL:** \`{{BASE_URL}}\`

> The base URL is the domain you are reading this page on. Always build URLs from your own SDK Pay domain instead of hard-coding it.

## 1. Get a link

\`\`\`
GET {{BASE_URL}}/api/pay/{slug}
\`\`\`

Response:

\`\`\`json
{
  "link": { "title": "T-shirt", "slug": "t-shirt-ab12c", "amount": 5000, "currency": "XAF", "isActive": true },
  "merchant": { "fullName": "Jane Doe", "username": "jane" },
  "expired": false
}
\`\`\`

## 2. Start a payment

\`\`\`
POST {{BASE_URL}}/api/pay/{slug}
Content-Type: application/json
\`\`\`

\`\`\`json
{
  "amount": 5000,
  "operator": "MTN MoMo",
  "phone": "+237670000000",
  "name": "Customer Name"
}
\`\`\`

- \`amount\` is ignored when the link has a fixed amount. Minimum 100.
- \`operator\` must be one of the operators listed in [Mobile Money](/docs/mobile-money).
- \`phone\` should include the country code. Its country must match the link currency.

Response:

\`\`\`json
{ "ok": true, "reference": "SDK-P-XXXXXXXX", "amount": 5000, "checkoutUrl": null }
\`\`\`

If \`checkoutUrl\` is set, redirect the customer there. Otherwise the customer approves on their phone.

## 3. Poll the result

\`\`\`
GET {{BASE_URL}}/api/pay/{slug}/status?ref=SDK-P-XXXXXXXX
\`\`\`

\`\`\`json
{ "status": "pending", "reference": "SDK-P-XXXXXXXX", "amount": 5000 }
\`\`\`

\`status\` is \`pending\`, \`success\` or \`failed\`. Poll every 3 to 5 seconds, for up to 8 minutes. On \`success\`, the response also contains \`pdfUrl\` and \`redirectUrl\` when the link defines them. Always check the status before delivering a product.

## Health check

\`GET {{BASE_URL}}/api/health\` returns \`{ "ok": true }\` when the service and its database are reachable.

## API keys and webhook secret

You can generate API keys and a webhook secret in **Dashboard → Direct API**. Keys are shown once, stored as a one-way hash, and can be regenerated at any time. Keep them private.

## Errors

All endpoints return JSON. See [Errors](/docs/errors).`,
      fr: `Vous pouvez intégrer ou remplacer la page hébergée en appelant les endpoints publics des liens de paiement. Ils ne demandent aucune authentification, car c'est le client qui paie.

**URL de base :** \`{{BASE_URL}}\`

> L'URL de base est le domaine sur lequel vous lisez cette page. Construisez toujours vos URLs à partir de votre propre domaine SDK Pay au lieu de l'écrire en dur.

## 1. Récupérer un lien

\`\`\`
GET {{BASE_URL}}/api/pay/{slug}
\`\`\`

Réponse :

\`\`\`json
{
  "link": { "title": "T-shirt", "slug": "t-shirt-ab12c", "amount": 5000, "currency": "XAF", "isActive": true },
  "merchant": { "fullName": "Jane Doe", "username": "jane" },
  "expired": false
}
\`\`\`

## 2. Démarrer un paiement

\`\`\`
POST {{BASE_URL}}/api/pay/{slug}
Content-Type: application/json
\`\`\`

\`\`\`json
{
  "amount": 5000,
  "operator": "MTN MoMo",
  "phone": "+237670000000",
  "name": "Nom du client"
}
\`\`\`

- \`amount\` est ignoré quand le lien a un montant fixe. Minimum 100.
- \`operator\` doit être un des opérateurs listés dans [Mobile Money](/docs/mobile-money).
- \`phone\` doit contenir l'indicatif pays. Son pays doit correspondre à la devise du lien.

Réponse :

\`\`\`json
{ "ok": true, "reference": "SDK-P-XXXXXXXX", "amount": 5000, "checkoutUrl": null }
\`\`\`

Si \`checkoutUrl\` est renseigné, redirigez le client vers cette adresse. Sinon, le client approuve sur son téléphone.

## 3. Suivre le résultat

\`\`\`
GET {{BASE_URL}}/api/pay/{slug}/status?ref=SDK-P-XXXXXXXX
\`\`\`

\`\`\`json
{ "status": "pending", "reference": "SDK-P-XXXXXXXX", "amount": 5000 }
\`\`\`

\`status\` vaut \`pending\`, \`success\` ou \`failed\`. Interrogez toutes les 3 à 5 secondes, pendant 8 minutes maximum. En cas de \`success\`, la réponse contient aussi \`pdfUrl\` et \`redirectUrl\` si le lien les définit. Vérifiez toujours le statut avant de livrer un produit.

## Vérification de service

\`GET {{BASE_URL}}/api/health\` renvoie \`{ "ok": true }\` quand le service et sa base de données sont joignables.

## Clés API et secret webhook

Vous pouvez générer des clés API et un secret webhook dans **Dashboard → Direct API**. Les clés sont affichées une seule fois, stockées sous forme de hash irréversible et peuvent être régénérées à tout moment. Gardez-les privées.

## Erreurs

Tous les endpoints renvoient du JSON. Voir [Erreurs](/docs/errors).`,
    },
  },
  {
    slug: "errors",
    section: { en: "Build", fr: "Développer" },
    title: { en: "Errors", fr: "Erreurs" },
    summary: {
      en: "HTTP status codes and error messages.",
      fr: "Codes HTTP et messages d'erreur.",
    },
    body: {
      en: `Errors are returned as JSON with an \`error\` message:

\`\`\`json
{ "error": "Montant invalide (min. 100)." }
\`\`\`

| HTTP | Meaning |
|---|---|
| 200 | Success |
| 400 | Invalid or missing parameter, inactive or expired link, currency mismatch |
| 401 | Not signed in |
| 404 | Link or transaction not found |
| 409 | Conflict, for example a custom link URL already taken |
| 502 | The payment network refused or could not process the request. Nothing was debited. |
| 500 | Unexpected server error. Try again, then contact support. |

## Common messages

- **Mobile Money is not available for this country or operator right now.** The operator is not available for that country at the moment. Try another operator or method.
- **This link only accepts payments in XAF.** The phone number's country uses another currency. Enter the number with the correct country code.
- **This link has expired / is disabled.** Ask the merchant for a new link.

Messages may be returned in French or English depending on the endpoint.`,
      fr: `Les erreurs sont renvoyées en JSON avec un message \`error\` :

\`\`\`json
{ "error": "Montant invalide (min. 100)." }
\`\`\`

| HTTP | Signification |
|---|---|
| 200 | Succès |
| 400 | Paramètre invalide ou manquant, lien inactif ou expiré, devise incompatible |
| 401 | Non connecté |
| 404 | Lien ou transaction introuvable |
| 409 | Conflit, par exemple une URL de lien personnalisée déjà prise |
| 502 | Le réseau de paiement a refusé ou n'a pas pu traiter la demande. Aucun débit. |
| 500 | Erreur serveur inattendue. Réessayez, puis contactez le support. |

## Messages courants

- **Mobile Money is not available for this country or operator right now.** L'opérateur n'est pas disponible pour ce pays actuellement. Essayez un autre opérateur ou une autre méthode.
- **Ce lien accepte uniquement les paiements en XAF.** Le pays du numéro utilise une autre devise. Saisissez le numéro avec le bon indicatif.
- **Ce lien a expiré / est désactivé.** Demandez un nouveau lien au marchand.

Les messages peuvent être en français ou en anglais selon l'endpoint.`,
    },
  },
  {
    slug: "security",
    section: { en: "Trust", fr: "Confiance" },
    title: { en: "Security", fr: "Sécurité" },
    summary: {
      en: "How accounts, money and keys are protected.",
      fr: "Comment les comptes, l'argent et les clés sont protégés.",
    },
    body: {
      en: `- **HTTPS** everywhere.
- **PIN** (4 digits) required to send or withdraw money.
- **Sessions per device**: review and revoke signed-in devices from your settings.
- **KYC** identity verification and anti-fraud checks.
- **API keys** are shown once and stored only as a SHA-256 hash. If you lose a key, generate a new one.
- **Payment confirmation**: a payment is credited only after the payment network confirms it. Pending payments are never credited automatically.
- **Automatic refunds**: if a payout fails at the payment network, the amount returns to your wallet.
- **Account suspension**: suspended accounts cannot receive payments or sign in.

## Good practice

- Never share your PIN, password or API keys.
- Verify the payment status before delivering a product or service.
- Use the exact deposit address and network shown for crypto deposits.
- Contact ${SITE.support} immediately if you suspect unauthorized access.`,
      fr: `- **HTTPS** partout.
- **PIN** (4 chiffres) requis pour envoyer ou retirer de l'argent.
- **Sessions par appareil** : consultez et révoquez les appareils connectés depuis vos paramètres.
- **KYC** : vérification d'identité et contrôles anti-fraude.
- **Clés API** affichées une seule fois et stockées uniquement sous forme de hash SHA-256. Si vous perdez une clé, générez-en une nouvelle.
- **Confirmation des paiements** : un paiement n'est crédité qu'après confirmation du réseau de paiement. Les paiements en attente ne sont jamais crédités automatiquement.
- **Remboursement automatique** : si un retrait échoue côté réseau de paiement, le montant revient sur votre wallet.
- **Suspension de compte** : un compte suspendu ne peut ni recevoir de paiements ni se connecter.

## Bonnes pratiques

- Ne partagez jamais votre PIN, mot de passe ou clés API.
- Vérifiez le statut du paiement avant de livrer un produit ou service.
- Utilisez l'adresse et le réseau exacts affichés pour les dépôts crypto.
- Contactez ${SITE.support} immédiatement en cas de doute sur un accès non autorisé.`,
    },
  },
  {
    slug: "faq",
    section: { en: "Trust", fr: "Confiance" },
    title: { en: "FAQ and support", fr: "FAQ et support" },
    summary: {
      en: "Common questions and how to reach support.",
      fr: "Questions fréquentes et contact du support.",
    },
    body: {
      en: `## My customer paid but I see "pending"

The payment is waiting for the customer to approve on their phone or for the network to confirm. Pending requests expire after 8 minutes and become failed with no debit. Do not deliver until the status is \`success\`.

## "Mobile Money is not available for this country or operator"

That country or operator is not available right now. Check the [supported list](/docs/mobile-money), try another operator, or use crypto.

## Why is my payment link rejecting the number?

A link accepts only its own currency. Enter the number with the country code, for example \`+237...\` for Cameroon.

## How long do withdrawals take?

Mobile Money withdrawals are usually fast. Some are reviewed first and stay pending until approved. Failed payouts are refunded automatically.

## Can I change my domain?

Yes. SDK Pay builds all of its links and callbacks from the address it is served on, so nothing needs to be reconfigured when the domain changes.

## Can I install SDK Pay on my phone?

Yes. Open the site in Chrome or Brave and tap **Install SDK Pay**. On iPhone use Safari: Share → Add to Home Screen.

## Contact

Email ${SITE.support} or use **Dashboard → Support**. Include the transaction reference to speed things up.`,
      fr: `## Mon client a payé mais je vois « pending »

Le paiement attend l'approbation du client sur son téléphone ou la confirmation du réseau. Les demandes en attente expirent après 8 minutes et passent à échec sans débit. Ne livrez pas avant le statut \`success\`.

## « Mobile Money is not available for this country or operator »

Ce pays ou cet opérateur n'est pas disponible actuellement. Consultez la [liste supportée](/docs/mobile-money), essayez un autre opérateur, ou utilisez la crypto.

## Pourquoi mon lien refuse le numéro ?

Un lien n'accepte que sa propre devise. Saisissez le numéro avec l'indicatif, par exemple \`+237...\` pour le Cameroun.

## Combien de temps prennent les retraits ?

Les retraits Mobile Money sont en général rapides. Certains sont revus avant envoi et restent en attente jusqu'à validation. Les retraits échoués sont remboursés automatiquement.

## Puis-je changer de domaine ?

Oui. SDK Pay construit tous ses liens et rappels à partir de l'adresse sur laquelle il est servi : rien à reconfigurer quand le domaine change.

## Puis-je installer SDK Pay sur mon téléphone ?

Oui. Ouvrez le site dans Chrome ou Brave et touchez **Installer SDK Pay**. Sur iPhone, utilisez Safari : Partager → Sur l'écran d'accueil.

## Contact

Écrivez à ${SITE.support} ou utilisez **Dashboard → Support**. Indiquez la référence de la transaction pour aller plus vite.`,
    },
  },
  {
    slug: "ai-access",
    section: { en: "Build", fr: "Développer" },
    title: { en: "AI access", fr: "Accès IA" },
    summary: {
      en: "How AI assistants and tools can read this documentation.",
      fr: "Comment les assistants IA et outils peuvent lire cette documentation.",
    },
    body: {
      en: `These docs are built to be read by people **and** by AI assistants. Every page exists in several machine-friendly formats, always on the same domain you are reading this on.

| Resource | URL | Use |
|---|---|---|
| Index | \`{{BASE_URL}}/llms.txt\` | Short map of the docs with one line per page |
| Full docs | \`{{BASE_URL}}/llms-full.txt\` | Every page in one plain-markdown file |
| Single page | \`{{BASE_URL}}/docs/raw/<slug>.md\` | One page as raw markdown |
| JSON | \`{{BASE_URL}}/api/docs\` | All pages as JSON, with \`?q=\` search and \`?lang=fr\` or \`?lang=en\` |

Add \`?lang=fr\` (French) or \`?lang=en\` (English, default for the machine files) to any of them.

## Tips for AI assistants

- Start with \`/llms.txt\`, then open only the pages you need.
- Prefer \`/llms-full.txt\` when you need everything in one request.
- Use the base URL of the page you fetched; never assume a fixed domain.
- Only the endpoints documented in [Developers](/docs/developers) are public. Dashboard and admin routes require a signed-in session.

## Page list

{{PAGE_LIST}}`,
      fr: `Cette documentation est conçue pour être lue par des personnes **et** par des assistants IA. Chaque page existe dans plusieurs formats lisibles par machine, toujours sur le même domaine que celui où vous lisez ceci.

| Ressource | URL | Usage |
|---|---|---|
| Index | \`{{BASE_URL}}/llms.txt\` | Plan court de la doc, une ligne par page |
| Doc complète | \`{{BASE_URL}}/llms-full.txt\` | Toutes les pages dans un seul fichier markdown |
| Page seule | \`{{BASE_URL}}/docs/raw/<slug>.md\` | Une page en markdown brut |
| JSON | \`{{BASE_URL}}/api/docs\` | Toutes les pages en JSON, avec recherche \`?q=\` et \`?lang=fr\` ou \`?lang=en\` |

Ajoutez \`?lang=fr\` (français) ou \`?lang=en\` (anglais, par défaut pour les fichiers machine) à n'importe laquelle.

## Conseils pour les assistants IA

- Commencez par \`/llms.txt\`, puis ouvrez uniquement les pages utiles.
- Préférez \`/llms-full.txt\` si vous voulez tout en une seule requête.
- Utilisez l'URL de base de la page récupérée ; ne supposez jamais un domaine fixe.
- Seuls les endpoints documentés dans [Développeurs](/docs/developers) sont publics. Les routes du dashboard et de l'admin exigent une session connectée.

## Liste des pages

{{PAGE_LIST}}`,
    },
  },
];

export function getPage(slug: string) {
  return DOC_PAGES.find((p) => p.slug === slug);
}

export function sectionsFor(lang: Lang) {
  const map = new Map<string, DocPage[]>();
  for (const p of DOC_PAGES) {
    const s = p.section[lang];
    map.set(s, [...(map.get(s) || []), p]);
  }
  return [...map.entries()].map(([section, pages]) => ({ section, pages }));
}

function countriesTable(lang: Lang) {
  const head =
    lang === "fr"
      ? "| Pays | Indicatif | Devise | Opérateurs |\n|---|---|---|---|"
      : "| Country | Dial code | Currency | Operators |\n|---|---|---|---|";
  const rows = COUNTRIES.map((c) => `| ${c.name} (${c.code}) | ${c.dial} | ${c.currency} | ${c.operators.join(", ")} |`);
  return [head, ...rows].join("\n");
}

/** Resolve placeholders: base URL always comes from where the docs are served. */
export function renderBody(page: DocPage, lang: Lang, baseUrl: string): string {
  const list = DOC_PAGES.map((p) => `- [${p.title[lang]}](${baseUrl}/docs/raw/${p.slug}.md): ${p.summary[lang]}`).join("\n");
  return page.body[lang]
    .replace(/\{\{BASE_URL\}\}/g, baseUrl)
    .replace(/\{\{COUNTRIES_TABLE\}\}/g, countriesTable(lang))
    .replace(/\{\{PAGE_LIST\}\}/g, list);
}

export function pageAsMarkdown(page: DocPage, lang: Lang, baseUrl: string) {
  return `# ${page.title[lang]}\n\n> ${page.summary[lang]}\n\nSource: ${baseUrl}/docs/${page.slug}\n\n${renderBody(page, lang, baseUrl)}\n`;
}
