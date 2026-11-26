export type AdminDate = string | Date;

export type AdminSession = { id: number; email: string; fullName: string; role: string; createdAt: AdminDate; lastLoginAt: AdminDate | null };

export type AdminMember = {
  id: number; fullName: string; email: string; phone: string; country: string; business: string;
  role: string; status: string; accountStatus: string; joinedAt: AdminDate; lastLoginAt: AdminDate | null;
  activeSessions: number; webhookUrl: string; balances: string; initials: string; avatarColor: string;
};

export type AdminKyc = {
  id: number; memberId: number | null; applicantName: string; email: string; documentType: string;
  documentNo: string; dateOfBirth: string; country: string; business: string; website: string;
  status: string; applicationText: string; frontImageUrl: string; backImageUrl: string;
  decisionNote: string; submittedAt: AdminDate; reviewedAt: AdminDate | null;
};

export type AdminApiKey = { id: number; memberId: number | null; name: string; environment: string; keyMasked: string; status: string; createdAt: AdminDate; lastUsedAt: AdminDate | null };
export type AdminTransaction = { id: number; reference: string; memberId: number | null; memberName: string; amount: number; currency: string; status: string; provider: string; method: string; createdAt: AdminDate };
export type AdminRefund = { id: number; reference: string; memberName: string; amount: number; currency: string; reason: string; status: string; createdAt: AdminDate };
export type AdminApiRequest = { id: number; statusCode: number; endpoint: string; env: string; latency: number; error: string; createdAt: AdminDate };
export type AdminWebhook = { id: number; event: string; url: string; httpStatus: number; attempts: number; status: string; createdAt: AdminDate };
export type AdminAudit = { id: number; actor: string; action: string; target: string; severity: string; ip: string; createdAt: AdminDate };
export type AdminNote = { id: number; targetType: string; targetId: number; body: string; author: string; createdAt: AdminDate };
export type AdminNotification = { id: number; title: string; message: string; type: string; isRead: boolean; createdAt: AdminDate };
export type AdminTicket = { id: number; subject: string; requester: string; priority: string; status: string; lastMessage: string; createdAt: AdminDate };
export type AdminReview = { id: number; author: string; rating: number; comment: string; status: string; createdAt: AdminDate };
export type AdminUpdate = { id: number; title: string; category: string; status: string; mediaCount: number; scheduledAt: AdminDate | null; body: string; imageUrl: string; pinned: boolean; createdAt: AdminDate };
export type AdminConversation = { id: number; memberName: string; initials: string; avatarColor: string; lastMessage: string; unread: number; updatedAt: AdminDate };
export type AdminWithdrawal = { id: number; memberName: string; amount: number; currency: string; method: string; status: string; requestedAt: AdminDate };
export type AdminCampaign = { id: number; name: string; status: string; budget: number; createdAt: AdminDate };
export type AdminCatalogItem = { id: number; section: string; title: string; subtitle: string; status: string; amount: number; owner: string; createdAt: AdminDate };
export type AdminSetting = { key: string; value: string; updatedAt: AdminDate };
export type AdminFeatureFlag = { key: string; label: string; description: string; enabled: boolean; updatedAt: AdminDate };
export type AdminFeeRule = { id: number; scope: string; percent: number; fixed: number; currency: string; status: string; updatedAt: AdminDate };
export type AdminTeamMember = { id: number; name: string; email: string; role: string; status: string; lastActiveAt: AdminDate | null; createdAt: AdminDate };
export type AdminProviderRoute = { id: number; country: string; operator: string; primaryProvider: string; fallbackProvider: string; status: string; updatedAt: AdminDate };

export type AdminClientLink = { id: number; slug: string; title: string; amount: number; currency: string; status: string; views: number; createdAt: AdminDate };
export type AdminClientUser = {
  id: number; fullName: string; username: string; email: string; phone: string; dialCode: string;
  countryCode: string; status: string; kycStatus: string; riskLevel: string; balance: number;
  usdtBalance: number; apiKey: string; webhookSecret: string; lastLoginAt: AdminDate | null; createdAt: AdminDate;
};
export type AdminClientWallet = { id: number; userId: number; currency: string; countryName: string; flag: string; balance: number; isPrimary: boolean; status: string; createdAt: AdminDate };
export type AdminClientTransaction = {
  id: number; reference: string; userId: number; type: string; direction: string; amount: number;
  currency: string; status: string; provider: string; method: string; note: string; createdAt: AdminDate;
};
export type AdminClientNotification = { id: number; userId: number; title: string; message: string; type: string; isRead: boolean; link: string; createdAt: AdminDate };
export type AdminClientSupportMessage = { id: number; userId: number | null; email: string; subject: string; message: string; status: string; priority: string; createdAt: AdminDate };
export type AdminClientKycUpdate = { id: number; userId: number; fullName: string; documentType: string; documentNumber: string; status: string; reviewNote: string; createdAt: AdminDate; reviewedAt: AdminDate | null };

export type AdminMetrics = {
  members: number;
  activeMembers: number;
  pendingKyc: number;
  transactions: number;
  successfulVolume: number;
  failedTransactions: number;
  pendingRefunds: number;
  openTickets: number;
  unreadNotifications: number;
  pendingWithdrawals: number;
  activeCampaigns: number;
  payments: number;
  databaseOnline: boolean;
  databaseLatency: number;
  gatewayStatus: "online" | "unreachable" | "degraded";
  gatewayLabel: string;
  mode: string;
  failedWebhooks: number;
  requests24h: number;
  clientErrors: number;
  serverErrors: number;
  avgLatency: number;
  clientUsers: number;
  clientWallets: number;
  clientLinks: number;
  clientTransactions: number;
  featureFlagsOn: number;
  teamMembers: number;
  providerRoutes: number;
};

export type AdminDeployment = {
  adminOnly: boolean;
  clientAppUrl: string;
  databaseMode: "admin" | "shared";
  providerPrimaryConfigured: boolean;
  providerBackupConfigured: boolean;
  environment: string;
};

export type AdminBootstrapData = {
  session: AdminSession;
  metrics: AdminMetrics;
  deployment: AdminDeployment;
  members: AdminMember[];
  kyc: AdminKyc[];
  apiKeys: AdminApiKey[];
  transactions: AdminTransaction[];
  refunds: AdminRefund[];
  apiRequests: AdminApiRequest[];
  webhooks: AdminWebhook[];
  audit: AdminAudit[];
  notes: AdminNote[];
  notifications: AdminNotification[];
  tickets: AdminTicket[];
  reviews: AdminReview[];
  updates: AdminUpdate[];
  conversations: AdminConversation[];
  withdrawals: AdminWithdrawal[];
  campaigns: AdminCampaign[];
  catalogItems: AdminCatalogItem[];
  settings: AdminSetting[];
  featureFlags: AdminFeatureFlag[];
  feeRules: AdminFeeRule[];
  teamMembers: AdminTeamMember[];
  providerRoutes: AdminProviderRoute[];
  clientLinks: AdminClientLink[];
  clientUsers: AdminClientUser[];
  clientWallets: AdminClientWallet[];
  clientTransactions: AdminClientTransaction[];
  clientNotifications: AdminClientNotification[];
  clientSupportMessages: AdminClientSupportMessage[];
  clientKycUpdates: AdminClientKycUpdate[];
};
