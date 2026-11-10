#!/usr/bin/env node
// Palette check for a built site.
//   node palette.mjs <dist> [--hues N] [--allow-warm]   list colors; fail on too many hue families or tan neutrals
//   node palette.mjs contrast <fg> <bg>                 WCAG contrast ratio of two colors
//   node palette.mjs --self-test
// --hues is the number of hue families the plan allows: the accent plus each status color (default 1).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** sRGB 0..1 -> { L, C, h } in OKLCH. */
function toOklch([r, g, b]) {
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(a, bb), h: (Math.atan2(bb, a) * 180 / Math.PI + 360) % 360 };
}

function hslToRgb(h, s, l) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)];
}

const num = (v, scale = 1) => (v.endsWith('%') ? parseFloat(v) / 100 * scale : parseFloat(v));

/** Parse one CSS color to { L, C, h, src } or null (keywords, color-mix and the like are skipped). */
export function parse(src) {
  const s = src.trim().toLowerCase();
  let m;
  if ((m = /^#([0-9a-f]{3,8})$/.exec(s))) {
    let x = m[1];
    if (x.length === 3 || x.length === 4) x = [...x].map((c) => c + c).join('');
    if (x.length !== 6 && x.length !== 8) return null;
    return { ...toOklch([0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16) / 255)), src: '#' + x.slice(0, 6) };
  }
  if ((m = /^(rgba?|hsla?|oklch)\(([^()]+)\)$/.exec(s))) {
    const p = m[2].split(/[\s,/]+/).filter(Boolean);
    if (p.length < 3 || p.slice(0, 3).some((v) => Number.isNaN(parseFloat(v)))) return null;
    if (m[1].startsWith('rgb')) return { ...toOklch(p.slice(0, 3).map((v) => num(v, 255) / 255)), src: s };
    if (m[1].startsWith('hsl')) return { ...toOklch(hslToRgb(parseFloat(p[0]), num(p[1]), num(p[2]))), src: s };
    return { L: num(p[0]), C: num(p[1], 0.4), h: parseFloat(p[2]), src: s };
  }
  return null;
}

export function contrast(fg, bg) {
  const lum = (c) => {
    const x = /^#([0-9a-f]{6})/.exec(parse(c)?.src ?? '');
    if (!x) throw new Error(`contrast needs hex or rgb colors, got "${c}"`);
    const [r, g, b] = [0, 2, 4].map((i) => lin(parseInt(x[1].slice(i, i + 2), 16) / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

const NEUTRAL = 0.012; // below this chroma a color reads as gray
const CHROMATIC = 0.06; // above this it reads as a color; between the two it is a tinted neutral
const isWarm = (h) => h >= 20 && h <= 110; // red-orange through yellow: tints here read as tan, beige, brown

/** Group colors found in CSS text. */
export function analyze(css) {
  const seen = new Map();
  for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b|(?:rgba?|hsla?|oklch)\([^()]+\)/g)) {
    const c = parse(m[0]);
    if (c && !seen.has(c.src)) seen.set(c.src, c);
  }
  const all = [...seen.values()];
  const chromatic = all.filter((c) => c.C >= CHROMATIC).sort((a, b) => a.h - b.h);
  const families = [];
  for (const c of chromatic) {
    const last = families.at(-1);
    if (last && c.h - last.at(-1).h <= 30) last.push(c);
    else families.push([c]);
  }
  // Hue is a circle: join the first and last family if they meet across 360.
  if (families.length > 1 && families[0][0].h + 360 - families.at(-1).at(-1).h <= 30) families[0].unshift(...families.pop());
  return {
    all,
    families,
    warmNeutrals: all.filter((c) => c.C >= NEUTRAL && c.C < CHROMATIC && isWarm(c.h)),
  };
}

function readCss(dir) {
  let css = '';
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) css += readCss(p);
    else if (name.endsWith('.css')) css += readFileSync(p, 'utf8');
    else if (name.endsWith('.html')) {
      const html = readFileSync(p, 'utf8');
      for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) css += m[1];
      for (const m of html.matchAll(/\sstyle="([^"]*)"/g)) css += m[1] + ';';
    }
  }
  return css;
}

function selfTest() {
  const red = parse('#ff0000');
  assert.ok(Math.abs(red.L - 0.628) < 0.002 && Math.abs(red.C - 0.2577) < 0.002 && Math.abs(red.h - 29.23) < 0.3);
  assert.ok(parse('#fff').C < 0.001);
  assert.equal(parse('color-mix(in srgb, red, blue)'), null);
  assert.ok(Math.abs(parse('rgb(255 0 0 / 50%)').h - red.h) < 0.01);
  assert.ok(Math.abs(parse('hsl(0 100% 50%)').C - red.C) < 0.001);
  assert.ok(Math.abs(contrast('#000', '#fff') - 21) < 0.01);
  assert.ok(contrast('#fff', '#f97316') < 3); // white on a saturated orange fails
  // Orange, white, near-black and slate: one family, no tan.
  const good = analyze('a{color:#e8590c;background:#fff}b{color:#16181d;border-color:#64707d}');
  assert.equal(good.families.length, 1);
  assert.equal(good.warmNeutrals.length, 0);
  // Add siding tan and a tan tint: caught as warm neutrals.
  const tan = analyze('a{color:#e8590c}b{background:#DCCBA4}c{background:#F3EDE0}');
  assert.equal(tan.warmNeutrals.length, 2);
  // Navy, green, and pink with brick (neighbouring hues count as one family): three families.
  assert.equal(analyze('a{color:#071d42}b{color:#f2b8c2}c{color:#4f7553}d{color:#9a3f2e}').families.length, 3);
  console.log('palette.mjs self-test passed');
}

const args = process.argv.slice(2);
if (args[0] === '--self-test') selfTest();
else if (args[0] === 'contrast') {
  if (args.length < 3) throw new Error('usage: palette.mjs contrast <fg> <bg>');
  const r = contrast(args[1], args[2]);
  console.log(`${r.toFixed(2)}:1  ${r >= 7 ? 'AAA' : r >= 4.5 ? 'AA text' : r >= 3 ? 'large text and UI only' : 'fails'}`);
} else if (args[0]) {
  const allowed = args.includes('--hues') ? Number(args[args.indexOf('--hues') + 1]) : 1;
  const { all, families, warmNeutrals } = analyze(readCss(args[0]));
  const fmt = (c) => `${c.src}  L ${c.L.toFixed(2)} C ${c.C.toFixed(3)} h ${c.h.toFixed(0)}`;
  console.log(`${all.length} colors, ${families.length} hue families (allowed ${allowed})`);
  families.forEach((f, i) => console.log(`  family ${i + 1}:\n${f.map((c) => '    ' + fmt(c)).join('\n')}`));
  let failed = false;
  if (families.length > allowed) {
    failed = true;
    console.error(`FAIL: ${families.length} hue families, the plan allows ${allowed}. Remove colors that are not the accent or a status.`);
  }
  if (warmNeutrals.length && !args.includes('--allow-warm')) {
    failed = true;
    console.error(`FAIL: warm-tinted neutrals (tan, beige, brown):\n${warmNeutrals.map((c) => '    ' + fmt(c)).join('\n')}\n  Use plain or cool neutrals.`);
  }
  process.exit(failed ? 1 : 0);
} else {
  console.log('usage: palette.mjs <dist> [--hues N] [--allow-warm] | contrast <fg> <bg> | --self-test');
}
