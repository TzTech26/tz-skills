#!/usr/bin/env node
// Repeated-fact check for a built site. Reads every .html under <dist> and fails when a page shows a fact
// more often than reference/copy.md allows.
//   node repeats.mjs <dist> [--phone "(618) 555-0100"] [--address "227 E Main St"]
//                    [--max-phone 3] [--max-address 2] [--max-days 11]
//   node repeats.mjs --self-test
// Counts are of the page's text, so they include things shown at only one screen size (a phone menu and a
// desktop header both count). The defaults leave room for that.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import assert from 'node:assert/strict';

const BLOCK = /<\/?(?:p|div|section|article|header|footer|main|nav|aside|li|ul|ol|dl|dt|dd|table|tr|td|th|h[1-6]|br|address|blockquote|figure|figcaption|form|label|button|a)\b[^>]*>/gi;
const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&nbsp;': ' ' };

/** Visible text of a page as lines, one per block. */
export function lines(html) {
  const body = (/<body[^>]*>([\s\S]*)<\/body>/i.exec(html)?.[1] ?? html)
    .replace(/<(script|style|template|noscript|svg)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(BLOCK, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z#0-9]+;/gi, (e) => ENTITIES[e.toLowerCase()] ?? ' ');
  return body.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

const count = (text, re) => (text.match(re) ?? []).length;
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Problems on one page, as strings. */
export function check(html, { phone, address, maxPhone = 3, maxAddress = 2, maxDays = 11 } = {}) {
  const ls = lines(html);
  const text = ls.join('\n');
  const problems = [];

  if (phone) {
    // Match the digits with any punctuation between them.
    const re = new RegExp(phone.replace(/\D/g, '').split('').join('\\D{0,3}'), 'g');
    const n = count(text, re);
    if (n > maxPhone) problems.push(`phone number shown ${n} times (max ${maxPhone})`);
  }
  if (address) {
    const n = count(text, new RegExp(escape(address).replace(/\s+/g, '\\s+'), 'gi'));
    if (n > maxAddress) problems.push(`address shown ${n} times (max ${maxAddress})`);
  }
  // One full hours table is seven day names; a one-line summary is a few more.
  const days = count(text, /\b(?:mon|tues?|wed(?:nes)?|thur?s?|fri|sat(?:ur)?|sun)(?:day)?s?\b/gi);
  if (days > maxDays) problems.push(`${days} day names: hours are shown more than once (max ${maxDays})`);

  // The same sentence twice on one page. Lines need four real words, so repeated menu facts
  // ("18 g / 24 g protein") and short labels do not count.
  const seen = new Map();
  for (const l of ls) if (count(l, /[a-z]{3,}/gi) >= 4) seen.set(l.toLowerCase(), (seen.get(l.toLowerCase()) ?? 0) + 1);
  for (const [l, n] of seen) if (n > 1) problems.push(`said ${n} times: "${l.slice(0, 90)}"`);

  // A heading directly followed by a line that repeats it ("Engine swaps" / "Engine swaps.").
  const words = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 2);
  for (const m of html.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>\s*<(?:p|span|div)[^>]*>([^<]{3,200})</gi)) {
    const head = words(m[1].replace(/<[^>]+>/g, ''));
    const next = words(m[2]);
    if (head.length && next.length && head.every((w) => next.includes(w)) && next.length <= head.length + 3) {
      problems.push(`line repeats its heading: "${m[1].replace(/<[^>]+>/g, '').trim()}" / "${m[2].trim()}"`);
    }
  }
  // A heading of three or more words that only repeats the line above it.
  for (const m of html.matchAll(/<(?:p|span|div)[^>]*>([^<]{3,300})<\/(?:p|span|div)>\s*<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)) {
    const prev = words(m[1]);
    const head = words(m[2].replace(/<[^>]+>/g, ''));
    if (head.length >= 3 && head.every((w) => prev.includes(w))) {
      problems.push(`heading repeats the line above it: "${m[1].trim()}" / "${m[2].replace(/<[^>]+>/g, '').trim()}"`);
    }
  }
  return problems;
}

function pages(dir, root = dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return pages(p, root);
    return name.endsWith('.html') ? [{ path: relative(root, p), html: readFileSync(p, 'utf8') }] : [];
  });
}

function selfTest() {
  const opts = { phone: '(618) 566-8833', address: '500 N Main St' };
  const clean = `<body><header><a href="tel:6185668833">Call (618) 566-8833</a></header>
    <h1>Auto repair in Mascoutah</h1><h2>Brakes</h2><h2>A/C</h2><p>Repair and recharge.</p>
    <footer><p>500 N Main St</p><p>Open until 5 today</p></footer></body>`;
  assert.deepEqual(check(clean, opts), []);

  const hours = '<p>Monday to Friday, 8 am to 5 pm. Closed Saturday and Sunday.</p>';
  const tel = '<a href="tel:6185668833">618-566-8833</a>';
  const bad = `<body>${tel}${tel}${tel}${tel}${hours}${hours}${hours}
    <p>500 N Main St</p><p>500 N  Main St</p><p>500 N Main St</p>
    <h3>Engine swaps</h3><p>Engine swaps.</p></body>`;
  const found = check(bad, opts).join('\n');
  assert.match(found, /phone number shown 4 times/);
  assert.match(found, /address shown 3 times/);
  assert.match(found, /12 day names/);
  assert.match(found, /said 3 times: "monday to friday/);
  assert.deepEqual(check('<body><p>18 g / 24 g protein. Contains caffeine</p><p>18 g / 24 g protein. Contains caffeine</p></body>'), []);
  assert.match(found, /line repeats its heading: "Engine swaps"/);
  assert.match(
    check('<body><p>Anything from oil changes to engine swaps.</p><h2>Oil changes to engine swaps</h2></body>').join('\n'),
    /heading repeats the line above it/,
  );
  // Text inside scripts and styles is not page text.
  assert.deepEqual(check('<body><script>var a="Monday Monday Monday Monday Monday Monday Monday Monday Monday Monday Monday Monday"</script></body>'), []);
  console.log('repeats.mjs self-test passed');
}

const args = process.argv.slice(2);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
if (args[0] === '--self-test') selfTest();
else if (args[0]) {
  const opts = {
    phone: opt('--phone'),
    address: opt('--address'),
    maxPhone: Number(opt('--max-phone') ?? 3),
    maxAddress: Number(opt('--max-address') ?? 2),
    maxDays: Number(opt('--max-days') ?? 11),
  };
  let failed = false;
  for (const { path, html } of pages(args[0])) {
    const problems = check(html, opts);
    if (problems.length) {
      failed = true;
      console.error(`FAIL ${path}\n${problems.map((p) => '  ' + p).join('\n')}`);
    } else console.log(`ok   ${path}`);
  }
  process.exit(failed ? 1 : 0);
} else {
  console.log('usage: repeats.mjs <dist> [--phone "..."] [--address "..."] [--max-phone 3] [--max-address 2] [--max-days 11] | --self-test');
}
