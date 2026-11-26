-- SDK Pay initial schema (paste into Supabase SQL editor or run via drizzle-kit migrate)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--> statement-breakpoint
CREATE TABLE "sdkpay_admin_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid,
	"admin_email" varchar(160),
	"action" varchar(80) NOT NULL,
	"target" varchar(200),
	"detail" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sdkpay_admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"token_id" varchar(64) NOT NULL,
	"device" varchar(120),
	"ip" varchar(45),
	"expires_at" timestamp NOT NULL,
	"last_active_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sdkpay_admin_sessions_token_id_unique" UNIQUE("token_id")
);
--> statement-breakpoint
CREATE TABLE "sdkpay_admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(160) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(20) DEFAULT 'support' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sdkpay_admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "sdkpay_announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(160) NOT NULL,
	"body" text NOT NULL,
	"bullets" text,
	"media_url" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sdkpay_api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(80) DEFAULT 'Clé principale' NOT NULL,
	"key_prefix" varchar(20) NOT NULL,
	"key_hash" text NOT NULL,
	"is_live" boolean DEFAULT false NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sdkpay_conversion_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"sources" text NOT NULL,
	"destination" varchar(10) NOT NULL,
	"threshold" integer DEFAULT 500 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sdkpay_kyc_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"id_type" varchar(40) NOT NULL,
	"id_number" varchar(80) NOT NULL,
	"front_name" varchar(160),
	"back_name" varchar(160),
	"front_url" text,
	"back_url" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"review_note" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sdkpay_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(160) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sdkpay_payment_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(160) NOT NULL,
	"slug" varchar(80) NOT NULL,
	"amount" integer,
	"currency" varchar(8) DEFAULT 'XAF' NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"total_collected" integer DEFAULT 0 NOT NULL,
	"payments_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"image_url" text,
	"pdf_url" text,
	"redirect_url" text,
	"allowed_countries" varchar(200) DEFAULT 'ALL' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sdkpay_payment_links_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sdkpay_payout_numbers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" varchar(10) DEFAULT 'momo' NOT NULL,
	"label" varchar(80),
	"phone" varchar(40),
	"address" text,
	"operator" varchar(60),
	"network" varchar(20),
	"country" varchar(80),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sdkpay_platform_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sdkpay_provider_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tx_id" uuid,
	"user_id" uuid,
	"provider" varchar(20) NOT NULL,
	"action" varchar(40) NOT NULL,
	"status" varchar(20) DEFAULT 'ok' NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sdkpay_referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" uuid NOT NULL,
	"referred_id" uuid NOT NULL,
	"reward" integer DEFAULT 500 NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sdkpay_refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" varchar(20) DEFAULT 'refund' NOT NULL,
	"user_id" uuid NOT NULL,
	"tx_id" uuid,
	"reference" varchar(60) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(8) DEFAULT 'XAF' NOT NULL,
	"reason" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"decided_by" uuid,
	"decided_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sdkpay_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sdkpay_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_id" varchar(64) NOT NULL,
	"device" varchar(120),
	"ip" varchar(45),
	"expires_at" timestamp NOT NULL,
	"last_active_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sdkpay_sessions_token_id_unique" UNIQUE("token_id")
);
--> statement-breakpoint
CREATE TABLE "sdkpay_support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"subject" varchar(160) NOT NULL,
	"category" varchar(40) DEFAULT 'general' NOT NULL,
	"message" text NOT NULL,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sdkpay_ticket_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"author" varchar(10) NOT NULL,
	"admin_id" uuid,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sdkpay_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(30) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(8) DEFAULT 'XAF' NOT NULL,
	"fee" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'success' NOT NULL,
	"operator" varchar(60),
	"phone" varchar(40),
	"reference" varchar(60) NOT NULL,
	"label" varchar(200),
	"payment_link_id" uuid,
	"counterparty" varchar(120),
	"channel" varchar(20) DEFAULT 'dashboard' NOT NULL,
	"provider" varchar(20),
	"provider_ref" varchar(120),
	"country" varchar(80),
	"balance_before" integer,
	"balance_after" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sdkpay_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(120) NOT NULL,
	"username" varchar(60) NOT NULL,
	"email" varchar(160) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"country_code" varchar(10) DEFAULT '+237' NOT NULL,
	"country" varchar(80) DEFAULT 'Cameroun' NOT NULL,
	"referral_code" varchar(10) NOT NULL,
	"referred_by" varchar(10),
	"password_hash" text NOT NULL,
	"balance_xaf" integer DEFAULT 0 NOT NULL,
	"balance_xof" integer DEFAULT 0 NOT NULL,
	"balance_usdt" integer DEFAULT 0 NOT NULL,
	"reduced_fee_until" timestamp,
	"webhook_secret" text,
	"webhook_url" text,
	"pin_hash" text,
	"notif_prefs" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"internal_note" text,
	"last_login_at" timestamp,
	"kyc_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"language" varchar(5) DEFAULT 'fr' NOT NULL,
	"avatar_color" varchar(20) DEFAULT 'amber' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sdkpay_users_username_unique" UNIQUE("username"),
	CONSTRAINT "sdkpay_users_email_unique" UNIQUE("email"),
	CONSTRAINT "sdkpay_users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "sdkpay_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_code" varchar(10) NOT NULL,
	"country" varchar(80) NOT NULL,
	"country_code" varchar(10) NOT NULL,
	"flag" varchar(10) DEFAULT '🌍' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
