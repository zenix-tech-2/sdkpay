export type DashboardUser = {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  dialCode: string;
  countryCode: string;
  referralCode: string;
  apiKey: string;
  webhookSecret: string;
  balance: number;
  usdtBalance: number;
  theme: string;
  notifyEmail: boolean;
  notifyPush: boolean;
  notifySms: boolean;
  notifyMarketing: boolean;
  conversionSources: string;
  conversionDestination: string;
  conversionActive: boolean;
  withdrawalNumbers: string;
  pinConfigured: boolean;
  accountId: string;
  createdAt: string;
};

export type DashboardLink = {
  id: number;
  userId: number;
  slug: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  views: number;
  freeAmount: boolean;
  pdfUrl: string;
  allowedCountries: string;
  imageUrl: string;
  expiryDate: string;
  redirectUrl: string;
  iconEmoji: string;
  createdAt: string;
};

export type DashboardTransaction = {
  id: number;
  userId: number;
  linkId: number | null;
  type: string;
  direction: string;
  amount: number;
  fee: number;
  status: string;
  method: string;
  counterparty: string;
  reference: string;
  note: string;
  grossAmount?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  siteReference?: string;
  recipientName?: string;
  countryName?: string;
  createdAt: string;
  updatedAt?: string;
  currency?: string;
  amountDecimal?: number;
  feeDecimal?: number;
  grossDecimal?: number;
  balanceBeforeDecimal?: number;
  balanceAfterDecimal?: number;
  network?: string;
  walletAddress?: string;
  depositAddress?: string;
  providerReference?: string;
  feePayer?: string;
  flow?: string;
  expiresAt?: string | null;
  provider?: string;
  providerExternalId?: string;
  providerCheckoutUrl?: string;
  providerFallback?: boolean;
  providerStatus?: string;
};

export type DashboardWallet = {
  id: number;
  userId: number;
  currency: string;
  countryName: string;
  flag: string;
  balance: number;
  isPrimary: boolean;
  createdAt: string;
};

export type DashboardNotification = {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string;
  createdAt: string;
};

export type DashboardData = {
  user: DashboardUser;
  links: DashboardLink[];
  transactions: DashboardTransaction[];
  referrals: { id: number; fullName: string; createdAt: string }[];
  wallets: DashboardWallet[];
  notifications: DashboardNotification[];
  stats: { totalIn: number; totalOut: number; linksCount: number; paymentsCount: number; referralCount: number; views: number };
};
