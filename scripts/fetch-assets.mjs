// Downloads all remote image assets into /public so the app is self-contained.
// Run: node scripts/fetch-assets.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = { images: "public/images", logos: "public/logos/operators", flags: "public/flags" };
Object.values(OUT).forEach((d) => fs.mkdirSync(path.join(ROOT, d), { recursive: true }));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const deadHosts = new Set();
async function dl(url, dest, retries = 1) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 400) return fs.statSync(dest).size;
  const host = new URL(url).host;
  if (deadHosts.has(host)) throw new Error(`host unreachable: ${host}`);
  let lastErr = new Error("unknown");
  let fails = 0;
  for (let i = 0; i <= retries; i++) {
    try {
      await sleep(250);
      const r = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (SDKPay asset fetcher)" },
        signal: AbortSignal.timeout(15000),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const buf = Buffer.from(await r.arrayBuffer());
      const ct = r.headers.get("content-type") || "";
      if (buf.length < 400 || ct.includes("text/html")) throw new Error(`bad payload (${buf.length}b ${ct})`);
      fs.writeFileSync(dest, buf);
      return buf.length;
    } catch (e) {
      lastErr = e;
      fails++;
      await sleep(600 * (i + 1));
    }
  }
  if (fails > 1) deadHosts.add(host);
  throw lastErr;
}

const slug = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---------- 1. Landing heroes ----------
const HEROES = [
  ["hero-main.jpg", "https://images.pexels.com/photos/10375901/pexels-photo-10375901.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"],
  ["hero-commerce.jpg", "https://images.pexels.com/photos/8484031/pexels-photo-8484031.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"],
  ["hero-mobile.jpg", "https://images.pexels.com/photos/7433210/pexels-photo-7433210.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"],
];
console.log("--- heroes ---");
for (const [file, url] of HEROES) {
  try {
    const n = await dl(url, path.join(ROOT, OUT.images, file));
    console.log(`ok  ${file} (${Math.round(n / 1024)}kb)`);
  } catch (e) {
    console.log(`FAIL ${file}: ${e.message}`);
  }
}

// ---------- 2. Operator logos (parsed from src/data/operator-logos.ts) ----------
const src = fs.readFileSync(path.join(ROOT, "src/data/operator-logos.ts"), "utf8");
const consts = {};
for (const [, name, a, b] of src.matchAll(/const (\w+) = wiki\("([^"]+)", "([^"]+)"\);/g)) {
  consts[name] = `https://upload.wikimedia.org/wikipedia/commons/thumb/${a}/${b}/256px-${b}.png`;
}
for (const [, name, url] of src.matchAll(/const ([A-Z][A-Z0-9_]*) = "(https:\/\/[^"]+)";/g)) {
  consts[name] = url;
}
const resolve = (expr) => {
  expr = expr.trim();
  if (expr.startsWith('"')) {
    const url = expr.slice(1, -1);
    return { url, ext: url.includes("simpleicons") ? "svg" : "png" };
  }
  const cb = expr.match(/^clearbit\("([^"]+)"\)$/);
  if (cb) return { url: `https://logo.clearbit.com/${cb[1]}?size=256`, ext: "png" };
  if (consts[expr]) return { url: consts[expr], ext: expr === "TETHER" ? "svg" : "png" };
  throw new Error("unresolvable: " + expr);
};

const entries = [...src.matchAll(/"([^"]+)": \{ src: ([^,}]+)(?:, fallback: ([^}]+))? \}/g)];
console.log(`--- operators (${entries.length} entries) ---`);
const manifest = {};
for (const [, key, s, f] of entries) {
  let primary, fallback = null;
  try {
    primary = resolve(s);
    fallback = f ? resolve(f) : null;
  } catch (e) {
    console.log(`SKIP ${key}: ${e.message}`);
    continue;
  }
  const file = `${slug(key)}.${primary.ext}`;
  try {
    await dl(primary.url, path.join(ROOT, OUT.logos, file));
    console.log(`ok  ${key} -> ${file} (primary)`);
    manifest[key] = { local: `/logos/operators/${file}`, remote: fallback ? fallback.url : primary.url };
  } catch (e1) {
    if (!fallback) {
      console.log(`FAIL ${key}: ${e1.message}`);
      continue;
    }
    const f2 = `${slug(key)}.${fallback.ext}`;
    try {
      await dl(fallback.url, path.join(ROOT, OUT.logos, f2));
      console.log(`ok  ${key} -> ${f2} (fallback)`);
      manifest[key] = { local: `/logos/operators/${f2}`, remote: primary.url };
    } catch (e2) {
      console.log(`FAIL ${key}: primary(${e1.message}) fallback(${e2.message})`);
    }
  }
}

// ---------- 3. Country flags ----------
const csrc = fs.readFileSync(path.join(ROOT, "src/data/countries.ts"), "utf8");
const isos = [...new Set([...csrc.matchAll(/code: "([A-Z]{2})"/g)].map((m) => m[1].toLowerCase()))];
if (!isos.includes("in")) isos.push("in");
console.log(`--- flags (${isos.length} countries) ---`);
const flagStatus = {};
for (const cc of isos) {
  const dest = path.join(ROOT, OUT.flags, `${cc}.svg`);
  try {
    await dl(`https://flagcdn.com/${cc}.svg`, dest);
    flagStatus[cc] = "flagcdn";
    console.log(`ok  ${cc} (flagcdn)`);
  } catch (e1) {
    try {
      await dl(`https://cdn.jsdelivr.net/gh/lipis/flag-icons@main/flags/4x3/${cc}.svg`, dest);
      flagStatus[cc] = "lipis";
      console.log(`ok  ${cc} (lipis fallback)`);
    } catch (e2) {
      flagStatus[cc] = "FAIL";
      console.log(`FAIL ${cc}`);
    }
  }
}

fs.writeFileSync(
  path.join(ROOT, "scripts/asset-manifest.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), operators: manifest, flags: flagStatus }, null, 2)
);
console.log("manifest written to scripts/asset-manifest.json");
