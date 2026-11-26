// Round 2: jsDelivr-hosted logos (reachable) + missing flags + crypto icons.
// Run: node scripts/fetch-extra.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LOGOS = path.join(ROOT, "public/logos/operators");
const FLAGS = path.join(ROOT, "public/flags");
const CRYPTO = path.join(ROOT, "public/icons/crypto");
[LOGOS, FLAGS, CRYPTO].forEach((d) => fs.mkdirSync(d, { recursive: true }));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function dl(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 400) {
    console.log(`skip (cached) ${path.basename(dest)}`);
    return true;
  }
  await sleep(200);
  const r = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (SDKPay asset fetcher)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  const ct = r.headers.get("content-type") || "";
  const text = buf.slice(0, 300).toString();
  const isSvg = text.includes("<svg");
  if (ct.includes("text/html") || (!isSvg && buf.length < 400) || (isSvg && buf.length < 80)) {
    throw new Error(`bad payload (${buf.length}b ${ct})`);
  }
  fs.writeFileSync(dest, buf);
  return true;
}

// 1. Simple Icons slugs that may cover our brands
const SLUGS = ["orange", "vodafone", "visa", "mastercard", "mtn", "airtel", "wave", "opay", "palmpay", "safaricom", "tigo", "vodacom", "m-pesa", "mpesa", "mtn-group", "orange-money", "airtel-africa"];
console.log("--- simple-icons probes ---");
const hits = {};
for (const s of SLUGS) {
  const url = `https://cdn.simpleicons.org/${s}`;
  try {
    await dl(url, path.join(LOGOS, `si-${s}.svg`));
    console.log(`HIT ${s}`);
    hits[s] = true;
  } catch (e) {
    console.log(`miss ${s}`);
  }
}

// 2. Crypto icons from atomiclabs/cryptocurrency-icons (jsDelivr)
console.log("--- crypto (atomiclabs) ---");
const CR = { usdt: "usdt", trx: "trx", bnb: "bnb", eth: "eth", btc: "btc" };
for (const [name, sym] of Object.entries(CR)) {
  const url = `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/svg/color/${sym}.svg`;
  try {
    await dl(url, path.join(CRYPTO, `${name}.svg`));
    console.log(`ok  ${name}`);
  } catch (e) {
    console.log(`FAIL ${name}: ${e.message}`);
  }
}

// 3. Missing flags
console.log("--- missing flags ---");
const csrc = fs.readFileSync(path.join(ROOT, "src/data/countries.ts"), "utf8");
const isos = [...new Set([...csrc.matchAll(/code: "([A-Z]{2})"/g)].map((m) => m[1].toLowerCase()))];
isos.push("in");
for (const cc of isos) {
  const dest = path.join(FLAGS, `${cc}.svg`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 400) continue;
  try {
    await dl(`https://flagcdn.com/${cc}.svg`, dest);
    console.log(`ok  ${cc} (flagcdn)`);
  } catch {
    try {
      await dl(`https://cdn.jsdelivr.net/gh/lipis/flag-icons@main/flags/4x3/${cc}.svg`, dest);
      console.log(`ok  ${cc} (lipis)`);
    } catch {
      console.log(`FAIL ${cc}`);
    }
  }
}
console.log("done");
