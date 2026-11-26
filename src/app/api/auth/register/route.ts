import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, notifications, referrals, transactions } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { createSession } from "@/lib/auth";
import { randomReferralCode, randomRef } from "@/lib/format";
import { DIAL_MAP } from "@/data/countries";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, username, email, phone, countryCode, referral, password } = body;

    if (!fullName?.trim() || !username?.trim() || !email?.trim() || !phone?.trim() || !password) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
    }
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
    if (cleanUsername.length < 3) {
      return NextResponse.json({ error: "Nom d'utilisateur trop court (min. 3 caractères)." }, { status: 400 });
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.email, email.trim().toLowerCase()), eq(users.username, cleanUsername)))
      .limit(1);
    if (existing.length) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email ou ce nom d'utilisateur." }, { status: 409 });
    }

    let referredBy: string | null = null;
    let referrerId: string | null = null;
    if (referral?.trim()) {
      const ref = await db
        .select()
        .from(users)
        .where(eq(users.referralCode, referral.trim().toLowerCase()))
        .limit(1);
      if (ref.length) {
        referredBy = ref[0].referralCode;
        referrerId = ref[0].id;
      }
    }

    const country = DIAL_MAP[countryCode]?.name ?? "Cameroun";
    const passwordHash = await bcrypt.hash(password, 10);
    const referralCode = randomReferralCode();

    const inserted = await db
      .insert(users)
      .values({
        fullName: fullName.trim(),
        username: cleanUsername,
        email: email.trim().toLowerCase(),
        phone: `${countryCode ?? "+237"} ${phone.trim()}`,
        countryCode: countryCode ?? "+237",
        country,
        referralCode,
        referredBy,
        passwordHash,
        balanceXaf: 0,
      })
      .returning();

    const user = inserted[0];

    await db.insert(notifications).values([
      {
        userId: user.id,
        title: "Bienvenue sur SDK Pay 🎉",
        message: "Votre compte a été créé avec succès. Complétez votre profil et créez votre premier lien de paiement.",
      },
      {
        userId: user.id,
        title: "Vérification KYC",
        message: "Pour encaisser et retirer sans limite, pensez à vérifier votre identité dans la section Comptes.",
      },
    ]);

    // referral rewards
    if (referrerId) {
      await db.insert(referrals).values({ referrerId, referredId: user.id, reward: 500, status: "pending" });
      await db.insert(notifications).values({
        userId: referrerId,
        title: "Nouveau filleul !",
        message: `${user.fullName} a rejoint SDK Pay avec votre code. Vous recevrez 500 XAF après sa première transaction.`,
      });
    }

    // welcome bonus transaction record (pending demo)
    await db.insert(transactions).values({
      userId: user.id,
      type: "bonus",
      amount: 0,
      currency: "XAF",
      status: "success",
      reference: randomRef("WELCOME"),
      label: "Création de compte",
    });

    await createSession(user.id);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur. Réessayez." }, { status: 500 });
  }
}
