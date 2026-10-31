#!/usr/bin/env node
// scripts/seed-imports.mjs
//
// Adds the import products and Imports Page content to Sanity, safely:
//   • Products you already created (same slug or same name) are NOT changed.
//   • Categories you already created are NOT changed.
//   • Before writing, every related document is saved to scripts/backups/.
//   • Old plain-text descriptions are converted to rich text (no text is lost).
//   • Product photos: your current website photo (old "product" documents) is reused
//     first, then the supplier photos are downloaded and uploaded.
//
// Usage (from the project folder):
//   1) Preview only, nothing is written:
//        node --env-file=.env.local scripts/seed-imports.mjs
//   2) Write to Sanity:
//        node --env-file=.env.local scripts/seed-imports.mjs --write
//
// Options:
//   --no-images        do not download/upload supplier photos
//   --keep-page        do not change the Imports Page texts (only fill empty fields)
//
// Needs in .env.local:
//   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
//   SANITY_API_WRITE_TOKEN  (sanity.io/manage → API → Tokens → Add token, permission "Editor")

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createClient } from "@sanity/client";
import seed from "./imports-seed-data.mjs";

const IMPORTS_BASE = "/services/imports";
const MAX_IMAGES = 4;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const key = () => Math.random().toString(16).slice(2, 14).padEnd(12, "0");
const norm = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Old website product names → new product slug (to reuse the photo already in Sanity). */
const OLD_NAMES = {
  "three-phase-oil-immersed-distribution-transformer": ["oil immersed power distribution transformer"],
  "porcelain-shackle-insulator": ["porcelain shackle insulator"],
  "composite-fiber-pin-insulator-fpq-10-5": ["fiber pin tension insulator"],
  "composite-tension-insulator-fxbw-36-70": ["fiber pin tension insulator"],
  "mccb-cnsv-250a": ["molded case circuit breaker mccb"],
  "porcelain-stay-strain-insulator-ansi-54-1": ["stay strain insulator"],
  "enamelled-copper-winding-wire": ["copper wire"],
  "porcelain-drop-out-fuse-cutout-24kv": ["porcelain cut out fuse"],
  "transformer-insulating-oil": ["transformer oil"],
  "porcelain-pin-insulator-st-20": ["porcelain pin insulator"],
  "overhead-line-fittings": ["overhead line fittings"],
  "heat-shrinkable-cable-end-caps": ["cable end caps"],
  "copper-aluminium-lug-terminal-dtl-1": ["abc cable lug terminals"],
  "insulation-piercing-connector-jjc-10-95-25": ["insulation piercing connectors"],
  "xlpe-armoured-power-cable": ["xlpe cable"],
  "pencil-sharpener": ["pencil sharpner", "pencil sharpener"],
  "acsr-bare-overhead-conductor": ["acsr cable"],
  "abc-cable-3x50-1x54-6-1x16": ["abc cable"],
  "polymer-surge-arrester-yh10w": ["surge arrester"],
  "soft-plastic-eraser-4b": ["plastic eraser"],
  "nyy-power-cable": ["nyy cables"],
  "abc-suspension-clamp-set": ["abc suspension clamp set"],
  "spiral-notebook-100-pages": ["note book 100 pages"],
  "business-calculator-14-digits": ["business classic calculator"],
  "double-hole-punch": ["hols punch", "hole punch"],
  "calculator-bc-f0458": ["calculator bc f0458"],
  "spiral-notebook-60-pages": ["note book 60 pages"],
  "heavy-duty-stapler": ["heavy stapler"],
  "staples-10-boxes": ["staples"],
  "topmatic-juice-extractor-pj-900-1": ["topmatic pj 900 1"],
  "powerplus-pneumatic-tool-set-powair0020": ["powerplus air powair0020"],
  "ball-point-pen-bc-f0455": ["ball point pen bc f0455"],
  "powerplus-pressure-sprayer-pow63873": ["heavy powerplus druksproeier pow 63873"],
  "correction-pen-whitener": ["whitener"],
  "ball-point-pen-bc-f0456": ["ball point pen bc f0456"],
  "afk-rice-cooker-rc-22-16": ["cooker"],
};

/** Plain string → Portable Text blocks (keeps every word, one block per paragraph). */
export function stringToBlocks(s) {
  return String(s)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: key(), text: p.replace(/\n/g, " "), marks: [] }],
    }));
}

/**
 * Mini-markdown → Portable Text.
 * **bold**  *italic*  ==highlight==  ^^primary color^^  [text](target)
 * Paragraph prefix "#1 " = numbered list item, "- " = bullet item.
 * resolve(target) returns a path/URL, or null to drop the link (text is kept).
 */
export function mdToBlocks(paragraphs, resolve = (t) => t) {
  const list = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
  const TOKEN = /\*\*(.+?)\*\*|==(.+?)==|\^\^(.+?)\^\^|\[([^\]]+)\]\(([^)\s]+)\)|\*(.+?)\*/g;
  return list
    .filter((p) => p && String(p).trim())
    .map((raw) => {
      let text = String(raw).trim();
      const block = { _type: "block", _key: key(), style: "normal", markDefs: [], children: [] };
      if (text.startsWith("#1 ")) {
        block.listItem = "number";
        block.level = 1;
        text = text.slice(3);
      } else if (text.startsWith("- ")) {
        block.listItem = "bullet";
        block.level = 1;
        text = text.slice(2);
      }
      const push = (t, marks = []) => t && block.children.push({ _type: "span", _key: key(), text: t, marks });
      let last = 0;
      for (const m of text.matchAll(TOKEN)) {
        push(text.slice(last, m.index));
        if (m[1] !== undefined) push(m[1], ["strong"]);
        else if (m[2] !== undefined) push(m[2], ["highlight"]);
        else if (m[3] !== undefined) {
          const k = key();
          block.markDefs.push({ _key: k, _type: "textColor", color: "primary" });
          push(m[3], [k]);
        } else if (m[4] !== undefined) {
          const href = resolve(m[5]);
          if (href) {
            const k = key();
            block.markDefs.push({ _key: k, _type: "link", href });
            push(m[4], [k]);
          } else push(m[4]);
        } else if (m[6] !== undefined) push(m[6], ["em"]);
        last = m.index + m[0].length;
      }
      push(text.slice(last));
      if (!block.children.length) push("");
      return block;
    });
}

async function download(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      Referer: "https://www.made-in-china.com/",
      Accept: "image/avif,image/webp,image/png,image/jpeg,*/*",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

export async function run(client, opts = {}) {
  const { write = false, images = true, keepPage = false, log = console.log, backupDir } = opts;
  const report = { createdProducts: [], skippedProducts: [], createdCategories: [], migrated: [], imageWarnings: [], page: "" };
  const tx = client.transaction();
  let ops = 0;

  /* ---------- 1. Read current data + backup ---------- */
  const current = await client.fetch(`{
    "categories": *[_type == "importCategory"]{_id, title, "slug": slug.current, description},
    "products": *[_type == "importProduct"]{_id, title, "slug": slug.current, shortDescription, "cat": coalesce(category->slug.current, *[_id == "drafts." + ^.category._ref][0].slug.current)},
    "page": *[_type == "import" && !(_id in path("drafts.**"))][0],
    "services": *[_type == "servicesPage" && !(_id in path("drafts.**"))][0]{_id, importsSection, exportsSection, salesSection},
    "home": *[_type == "home" && !(_id in path("drafts.**"))][0]{_id, importsDescription},
    "oldProducts": *[_type == "product"]{"name": coalesce(name, title), "ref": image.asset._ref},
    "legacy": *[_type == "import"][0].imports[]{"name": title, "ref": image.asset._ref}
  }`);

  if (write && backupDir) {
    fs.mkdirSync(backupDir, { recursive: true });
    const file = path.join(backupDir, `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    const full = await client.fetch(
      `*[_type in ["importCategory", "importProduct", "import", "servicesPage", "home"]]`
    );
    fs.writeFileSync(file, JSON.stringify(full, null, 2));
    log(`Backup saved: ${file}`);
  }

  /* ---------- 2. Categories ---------- */
  // Drafts count too (so nothing is duplicated), but products can only point to PUBLISHED categories.
  const publishedIds = new Set((current.categories ?? []).filter((c) => !c._id.startsWith("drafts.")).map((c) => c._id));
  const cats = [];
  for (const c of current.categories ?? []) {
    const id = c._id.replace(/^drafts\./, "");
    if (!cats.some((x) => x.id === id)) cats.push({ ...c, id });
  }
  const catBySlug = new Map();
  for (const c of current.categories ?? []) {
    const id = c._id.replace(/^drafts\./, "");
    if (c.slug && !catBySlug.has(c.slug)) catBySlug.set(c.slug, { ...c, id });
    // migrate plain-text description → rich text
    if (typeof c.description === "string" && c.description.trim()) {
      tx.patch(c._id, { set: { description: stringToBlocks(c.description) } });
      ops++;
      report.migrated.push(`Category "${c.title}" description → rich text`);
    }
  }
  const findCat = (slug, title) => catBySlug.get(slug) ?? cats.find((c) => norm(c.title) === norm(title));

  const catId = {};
  const catSlugFor = {};
  for (const c of seed.categories) {
    const found = findCat(c.slug, c.title);
    if (found) {
      catSlugFor[c.slug] = found.slug ?? c.slug;
      if (publishedIds.has(found.id)) catId[c.slug] = found.id;
      else report.imageWarnings.push(`Category "${c.title}" is not published yet — publish it in Studio, then run again for its products.`);
      continue;
    }
    const _id = `importCategory-${c.slug}`;
    catId[c.slug] = _id;
    catSlugFor[c.slug] = c.slug;
    tx.createIfNotExists({
      _id,
      _type: "importCategory",
      title: c.title,
      slug: { _type: "slug", current: c.slug },
      description: stringToBlocks(c.description),
      order: c.order,
      seo: { ...c.seo },
    });
    ops++;
    report.createdCategories.push(c.title);
  }

  /* ---------- 3. Work out final product paths (for links) ---------- */
  const existingBySlug = new Map((current.products ?? []).filter((p) => p.slug).map((p) => [p.slug, p]));
  const existingByTitle = new Map((current.products ?? []).map((p) => [norm(p.title), p]));
  const productPath = {}; // seed slug → URL path
  for (const p of seed.products) {
    const ex = existingBySlug.get(p.slug) ?? existingByTitle.get(norm(p.title));
    const cat = ex?.cat ?? catSlugFor[p.category];
    const slug = ex?.slug ?? p.slug;
    if (cat && slug) productPath[p.slug] = `${IMPORTS_BASE}/${cat}/${slug}`;
  }
  const resolve = (target) => {
    if (!target) return null;
    if (target.startsWith("cat:")) {
      const s = target.slice(4);
      return catSlugFor[s] ? `${IMPORTS_BASE}/${catSlugFor[s]}` : null;
    }
    if (target.startsWith("product:")) return productPath[target.slice(8)] ?? null;
    return target; // "/path" or "https://..."
  };

  /* ---------- 4. Old photos to reuse ---------- */
  const oldImg = new Map();
  for (const o of [...(current.oldProducts ?? []), ...(current.legacy ?? [])]) {
    if (o?.name && o?.ref && !oldImg.has(norm(o.name))) oldImg.set(norm(o.name), o.ref);
  }
  const uploaded = new Map();
  async function imageRefs(p) {
    const refs = [];
    for (const n of OLD_NAMES[p.slug] ?? []) {
      const r = oldImg.get(norm(n));
      if (r) {
        refs.push(r);
        break;
      }
    }
    if (images) {
      for (const [i, url] of p.images.entries()) {
        if (refs.length >= MAX_IMAGES) break;
        if (!write) {
          refs.push(`(will upload) ${url.split("/").slice(-2)[0]}`);
          continue;
        }
        try {
          if (!uploaded.has(url)) {
            const buf = await download(url);
            const ext = (url.match(/\.(webp|jpe?g|png)(\?|$)/i)?.[1] ?? "jpg").toLowerCase();
            const asset = await client.assets.upload("image", buf, { filename: `${p.slug}-${i + 1}.${ext}` });
            uploaded.set(url, asset._id);
          }
          refs.push(uploaded.get(url));
        } catch (e) {
          report.imageWarnings.push(`${p.title}: could not download ${url} (${e.message})`);
        }
      }
    }
    if (!refs.length) report.imageWarnings.push(`${p.title}: no image — add one in Studio`);
    return refs;
  }

  /* ---------- 5. Products ---------- */
  for (const ex of current.products ?? []) {
    if (typeof ex.shortDescription === "string" && ex.shortDescription.trim()) {
      tx.patch(ex._id, { set: { shortDescription: stringToBlocks(ex.shortDescription) } });
      ops++;
      report.migrated.push(`Product "${ex.title}" short description → rich text`);
    }
  }

  for (const p of seed.products) {
    const ex = existingBySlug.get(p.slug) ?? existingByTitle.get(norm(p.title));
    if (ex) {
      report.skippedProducts.push(`${p.title}  (already exists: ${ex.slug})`);
      continue;
    }
    if (!catId[p.category]) {
      report.imageWarnings.push(`${p.title}: category "${p.category}" not available (missing or unpublished) — skipped`);
      continue;
    }
    const refs = await imageRefs(p);
    const doc = {
      _id: `importProduct-${p.slug}`,
      _type: "importProduct",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      category: { _type: "reference", _ref: catId[p.category] },
      featured: !!p.featured,
      order: p.order,
      shortDescription: mdToBlocks([p.short], resolve),
      description: mdToBlocks(p.description, resolve),
      highlights: p.highlights,
      specifications: p.specs.map(([label, value]) => ({ _type: "spec", _key: key(), label, value })),
      images: refs
        .filter((r) => !String(r).startsWith("(will upload)"))
        .map((r) => ({ _type: "image", _key: key(), asset: { _type: "reference", _ref: r }, alt: p.title })),
      seo: { ...p.seo },
    };
    tx.createIfNotExists(doc);
    ops++;
    report.createdProducts.push(`${p.title}  [${refs.length} image${refs.length === 1 ? "" : "s"}]`);
  }

  /* ---------- 6. Imports Page ---------- */
  const pg = seed.importPage;
  const crumbs = (list) => list.map(([label, href]) => ({ _type: "object", _key: key(), label, href }));
  const DEF = {
    page: crumbs([["Home", "/"], ["Services", "/services"]]),
    cat: crumbs([["Home", "/"], ["Services", "/services"], ["Imports", IMPORTS_BASE]]),
    prod: crumbs([["Home", "/"], ["Services", "/services"], ["Imports", IMPORTS_BASE]]),
  };
  const content = {
    headerMessage: pg.headerMessage,
    introTitle: pg.introTitle,
    introMessage: mdToBlocks(pg.introMessage, resolve),
    categoriesTitle: pg.categoriesTitle,
    categoriesMessage: mdToBlocks([pg.categoriesMessage], resolve),
    itemsPerCategory: pg.itemsPerCategory,
    bodyTitle: pg.bodyTitle,
    bodyMessage: mdToBlocks(pg.bodyMessage, resolve),
    bodyBackground: { enabled: !!pg.bodyBackground },
    seo: { ...pg.seo },
  };

  const page = current.page;
  if (page?._id) {
    const onlyHome = (l) => !Array.isArray(l) || l.length === 0 || (l.length === 1 && l[0]?.href === "/");
    const patch = {};
    const setIfMissing = {};
    if (keepPage) {
      for (const [k, v] of Object.entries(content)) setIfMissing[k] = v;
      if (typeof page.categoriesMessage === "string") patch.categoriesMessage = stringToBlocks(page.categoriesMessage);
    } else Object.assign(patch, content);
    if (onlyHome(page.breadcrumbLinks)) patch.breadcrumbLinks = DEF.page;
    setIfMissing.categoryBreadcrumbLinks = DEF.cat;
    setIfMissing.productBreadcrumbLinks = DEF.prod;
    tx.patch(page._id, { setIfMissing, ...(Object.keys(patch).length ? { set: patch } : {}) });
    ops++;
    report.page = keepPage ? "Imports Page: empty fields filled (texts kept)" : "Imports Page: texts updated (old version in backup)";
  } else {
    tx.createIfNotExists({
      _id: "import-page",
      _type: "import",
      title: "Imports",
      slug: { _type: "slug", current: "imports" },
      breadcrumbLinks: DEF.page,
      categoryBreadcrumbLinks: DEF.cat,
      productBreadcrumbLinks: DEF.prod,
      ...content,
    });
    ops++;
    report.page = "Imports Page: created";
  }

  /* ---------- 7. Other plain-text → rich text migrations ---------- */
  const svc = current.services;
  if (svc?._id) {
    const set = {};
    for (const s of ["importsSection", "exportsSection", "salesSection"]) {
      if (typeof svc[s]?.description === "string" && svc[s].description.trim()) {
        set[`${s}.description`] = stringToBlocks(svc[s].description);
        report.migrated.push(`Services Page ${s} description → rich text`);
      }
    }
    if (Object.keys(set).length) {
      tx.patch(svc._id, { set });
      ops++;
    }
  }
  const home = current.home;
  if (home?._id && typeof home.importsDescription === "string" && home.importsDescription.trim()) {
    tx.patch(home._id, { set: { importsDescription: stringToBlocks(home.importsDescription) } });
    ops++;
    report.migrated.push("Home importsDescription → rich text");
  }

  /* ---------- 8. Commit ---------- */
  if (write && ops) await tx.commit({ autoGenerateArrayKeys: true });

  /* ---------- Report ---------- */
  const section = (t, list) => {
    log(`\n${t} (${list.length})`);
    list.forEach((x) => log("  • " + x));
  };
  log(write ? "\n=== WRITTEN TO SANITY ===" : "\n=== PREVIEW (nothing written — add --write to apply) ===");
  section("Categories created", report.createdCategories);
  section("Products created", report.createdProducts);
  section("Products skipped (already in Sanity, not changed)", report.skippedProducts);
  section("Converted to rich text (text kept)", report.migrated);
  log(`\n${report.page}`);
  if (report.imageWarnings.length) section("Warnings", report.imageWarnings);
  return { report, ops, tx };
}

/* ------------------------------------------------------------------ */
/* CLI                                                                 */
/* ------------------------------------------------------------------ */

const isCli = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCli) {
  const args = new Set(process.argv.slice(2));
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
  if (!projectId) {
    console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID. Run with: node --env-file=.env.local scripts/seed-imports.mjs");
    process.exit(1);
  }
  if (!token) {
    console.error("Missing SANITY_API_WRITE_TOKEN in .env.local (sanity.io/manage → API → Tokens, permission Editor).");
    process.exit(1);
  }
  const client = createClient({ projectId, dataset, token, apiVersion: "2024-01-01", useCdn: false, perspective: "raw" });
  const here = path.dirname(fileURLToPath(import.meta.url));
  run(client, {
    write: args.has("--write"),
    images: !args.has("--no-images"),
    keepPage: args.has("--keep-page"),
    backupDir: path.join(here, "backups"),
  }).catch((e) => {
    console.error("\nFailed:", e.message);
    process.exit(1);
  });
}
