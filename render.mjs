// Renders Foamscore social images (1080 x 1350 JPEG) from a JSON spec.
//
//   node render.mjs spec.json
//
// spec.json is one object or an array of objects:
//   { "date": "2026-11-16", "slug": "weizen-glass-quiz", "template": "quiz", ...fields }
// Output: posts/<date>/<slug>.jpg (the path is printed for each image).
//
// Templates and their fields:
//   quiz:     label, question, options: [{ letter, text, glass }]  (4 options)
//   tip:      label, headline, bullets: [string]                    (2-3 bullets)
//   style:    label, style, rows: [{ name, text }], glass           (Look, Aroma, Flavor, Feel)
//   waitlist: label, headline, body, showUrl (false hides the foamscore.com pill)
// Glasses: pilsner, shaker, tulip, weizen, snifter, stange, nonic.
// Optional on every template: background "amber" (default) or "foam"; label "" hides the label pill.

import { createRequire } from "node:module";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// require() also finds a globally installed Playwright (as in Claude's cloud sessions).
const { chromium } = createRequire(import.meta.url)("playwright");

const root = dirname(fileURLToPath(import.meta.url));
// Embedded as a data URL: pages set with setContent can't load file:// fonts.
const fontUrl = "data:font/ttf;base64," + readFileSync(join(root, "fonts", "DMSans.ttf")).toString("base64");

const INK = "#1C1917";
const ACCENT = "#7F4A0C";
const AMBER = "#F2A007";
const FOAM = "#FFF1C9";

const GLASSES = {
  pilsner: "M7 3H17L13.5 24H10.5Z M12 24V28 M8 28H16",
  shaker: "M5 3H19L17 29H7Z",
  tulip: "M6 3C7 5 6.5 6 6 8C5 12 7 15 10 16.5L11 17.5V26 M13 26V17.5L14 16.5C17 15 19 12 18 8C17.5 6 17 5 18 3 M8 28H16 M11 26H13",
  weizen: "M8 3C6 8 8 11 9.5 15C10.5 18 10 22 9 25L8.5 28H15.5L15 25C14 22 13.5 18 14.5 15C16 11 18 8 16 3",
  snifter: "M6 4C4 9 4 14 7 17C9 19 15 19 17 17C20 14 20 9 18 4 M12 19V26 M8 28H16",
  stange: "M8 3H16V28H8Z",
  nonic: "M6 3H18L17.2 9C18 10 18 11 17.2 12L16 29H8L6.8 12C6 11 6 10 6.8 9Z",
};

// label: a string shows the pill; "" or null hides it (default text applies when the field is absent).
const pill = (spec, fallback) => {
  const text = spec.label === undefined ? fallback : spec.label;
  return text ? `<span class="label">${esc(text)}</span>` : "";
};

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const glass = (name, h = 96) => {
  const d = GLASSES[name];
  if (!d) throw new Error(`Unknown glass "${name}". Use one of: ${Object.keys(GLASSES).join(", ")}`);
  return `<svg viewBox="0 0 24 32" width="${Math.round(h * 0.75)}" height="${h}" aria-hidden="true"><path d="${d}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
};

const logo = (size) => `<svg viewBox="0 0 96 96" width="${size}" height="${size}" aria-hidden="true"><defs><clipPath id="c"><circle cx="48" cy="48" r="48"/></clipPath></defs><g clip-path="url(#c)"><rect width="96" height="96" fill="${AMBER}"/><path d="M0 0H96V30Q84 38 72 30Q60 22 48 30Q36 38 24 30Q12 22 0 30Z" fill="${FOAM}"/><path d="M29 62L43 76L68 47" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;

function wave(width, base, amp, step) {
  let d = `M0 0H${width}V${base}`;
  let x = width;
  let up = true;
  while (x > 0) {
    const nx = Math.max(0, x - step);
    d += `Q${(x + nx) / 2} ${up ? base + amp : base - amp} ${nx} ${base}`;
    up = !up;
    x = nx;
  }
  return d + "Z";
}

function page(spec, inner) {
  const bg = spec.background === "foam" ? FOAM : AMBER;
  const band = spec.background === "foam" ? AMBER : FOAM;
  const ringed = `box-shadow: 0 0 0 5px ${spec.background === "foam" ? INK : FOAM}; border-radius: 50%;`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@font-face { font-family: "DM Sans"; src: url("${fontUrl}") format("truetype"); font-weight: 100 1000; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1080px; height: 1350px; }
body { position: relative; overflow: hidden; background: ${bg}; color: ${INK}; font-family: "DM Sans", sans-serif; }
.band { position: absolute; top: 0; left: 0; }
.content { position: absolute; left: 88px; right: 88px; top: 230px; bottom: 190px; display: flex; flex-direction: column; justify-content: center; gap: 44px; }
.label { align-self: flex-start; padding: 12px 26px; border-radius: 999px; background: ${INK}; color: #F5F5F4; font-size: 34px; font-weight: 700; letter-spacing: 0.01em; }
h1 { font-size: 84px; line-height: 1.04; font-weight: 800; letter-spacing: -0.035em; }
.footer { position: absolute; left: 88px; right: 88px; bottom: 72px; display: flex; align-items: center; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 18px; }
.brand span { font-size: 44px; font-weight: 800; letter-spacing: -0.04em; }
.note { font-size: 32px; font-weight: 600; color: ${ACCENT}; }
</style></head><body>
<svg class="band" viewBox="0 0 1080 170" width="1080" height="170" aria-hidden="true"><path d="${wave(1080, 120, 18, 135)}" fill="${band}"/></svg>
<div class="content">${inner}</div>
<div class="footer"><div class="brand"><span style="${ringed}display:flex">${logo(72)}</span><span>foamscore</span></div>${spec.footnote ? `<span class="note">${esc(spec.footnote)}</span>` : ""}</div>
</body></html>`;
}

const templates = {
  quiz(s) {
    if (!Array.isArray(s.options) || s.options.length !== 4) throw new Error("quiz needs exactly 4 options");
    const opts = s.options.map((o) => `
      <div style="display:flex;align-items:center;gap:26px;padding:18px 28px;border-radius:24px;background:#FFFFFF;border:3px solid ${INK}">
        <span style="flex:none;width:64px;height:64px;border-radius:50%;background:${INK};color:#F5F5F4;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:800">${esc(o.letter)}</span>
        <span style="flex:none">${glass(o.glass, 88)}</span>
        <span style="font-size:42px;font-weight:600;line-height:1.15">${esc(o.text)}</span>
      </div>`).join("");
    return page({ footnote: "Answer in the caption", ...s }, `
      ${pill(s, "Glass quiz")}
      <h1 style="font-size:72px">${esc(s.question)}</h1>
      <div style="display:flex;flex-direction:column;gap:18px">${opts}</div>`);
  },
  tip(s) {
    const items = (s.bullets ?? []).map((b) => `
      <li style="display:flex;gap:24px;align-items:flex-start;font-size:46px;line-height:1.2;font-weight:600">
        <span style="flex:none;margin-top:16px;width:22px;height:22px;border-radius:50%;background:${INK}"></span><span>${esc(b)}</span>
      </li>`).join("");
    return page(s, `
      ${pill(s, "Tasting tip")}
      <h1>${esc(s.headline)}</h1>
      <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:28px">${items}</ul>`);
  },
  style(s) {
    const rows = (s.rows ?? []).map((r) => `
      <div style="display:grid;grid-template-columns:200px 1fr;gap:28px;align-items:baseline;padding:22px 0;border-top:3px solid ${INK}">
        <span style="font-size:36px;font-weight:800;color:${ACCENT};text-transform:uppercase;letter-spacing:0.06em">${esc(r.name)}</span>
        <span style="font-size:44px;font-weight:600;line-height:1.2">${esc(r.text)}</span>
      </div>`).join("");
    return page(s, `
      ${pill(s, "Style spotlight")}
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:32px">
        <h1 style="font-size:96px">${esc(s.style)}</h1>
        ${s.glass ? `<span style="flex:none">${glass(s.glass, 170)}</span>` : ""}
      </div>
      <div>${rows}</div>`);
  },
  waitlist(s) {
    return page(s, `
      ${pill(s, "Coming soon")}
      <h1 style="font-size:92px">${esc(s.headline)}</h1>
      <p style="font-size:46px;line-height:1.25;font-weight:600">${esc(s.body)}</p>
      ${s.showUrl === false ? "" : `<span style="align-self:flex-start;padding:22px 40px;border-radius:999px;background:${INK};color:#F5F5F4;font-size:46px;font-weight:700">foamscore.com</span>`}`);
  },
};

const input = JSON.parse(readFileSync(process.argv[2], "utf8"));
const specs = Array.isArray(input) ? input : [input];
const browser = await chromium.launch();
try {
  const pg = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const spec of specs) {
    const build = templates[spec.template];
    if (!build) throw new Error(`Unknown template "${spec.template}"`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(spec.date) || !/^[a-z0-9-]+$/.test(spec.slug)) throw new Error("date must be YYYY-MM-DD and slug lowercase-with-dashes");
    await pg.setContent(build(spec), { waitUntil: "load" });
    await pg.evaluate(() => document.fonts.ready);
    if (!(await pg.evaluate(() => document.fonts.check('800 40px "DM Sans"')))) throw new Error("DM Sans did not load");
    const overflow = await pg.evaluate(() => {
      const c = document.querySelector(".content");
      return c.scrollHeight > c.clientHeight + 2 || c.scrollWidth > c.clientWidth + 2;
    });
    if (overflow) throw new Error(`${spec.slug}: text does not fit the card. Shorten it.`);
    const out = join(root, "posts", spec.date, `${spec.slug}.jpg`);
    mkdirSync(dirname(out), { recursive: true });
    await pg.screenshot({ path: out, type: "jpeg", quality: 90 });
    console.log(out);
  }
} finally {
  await browser.close();
}
