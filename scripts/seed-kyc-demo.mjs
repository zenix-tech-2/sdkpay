/**
 * Seeds a demo user with a PENDING KYC submission (document photos from public/demo/).
 * Usage: node scripts/seed-kyc-demo.mjs
 * Demo pending user → email: jeanmarc@sdkpay.com  password: demo1234
 */
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db" });

const dataUrl = (file, mime = "image/jpeg") => `data:${mime};base64,${readFileSync(file).toString("base64")}`;

const USER_ID = "55555555-5555-4555-8555-555555555555";

(async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO users (id, full_name, username, email, phone, country, country_code, kyc_status, role, password_hash, public_id, referral_code)
       VALUES ($1, 'Jean-Marc Fotso', 'jeanmarc', 'jeanmarc@sdkpay.com', '677654321', 'Cameroun', 'cm', 'pending', 'user',
               '0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d', 'SDKPAY66431802', 'JEANMARC50')
       ON CONFLICT (id) DO NOTHING`,
      [USER_ID]
    );
    await client.query(
      `INSERT INTO accounts (id, user_id, currency, country, country_code, balance, is_primary)
       VALUES (gen_random_uuid(), $1, 'XAF', 'Cameroon', 'cm', 0, true)
       ON CONFLICT DO NOTHING`,
      [USER_ID]
    );
    await client.query(`DELETE FROM kyc_submissions WHERE user_id = $1`, [USER_ID]);
    await client.query(
      `INSERT INTO kyc_submissions
         (id, user_id, doc_type, doc_number, full_name, date_of_birth, front_image, back_image, selfie_image, status)
       VALUES ($1, $2, 'national_id', 'CNI-293847561', 'Jean-Marc Fotso', '1994-03-17', $3, $4, $5, 'pending')`,
      [
        randomUUID(),
        USER_ID,
        dataUrl("public/demo/id-front.jpg"),
        dataUrl("public/demo/id-back.jpg"),
        dataUrl("public/demo/selfie.jpg"),
      ]
    );
    await client.query("COMMIT");
    console.log("Seeded pending KYC demo user → jeanmarc@sdkpay.com / demo1234");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
