---
name: "site-design"
description: "Design and build a small-business website, from an existing site (redesign) or from nothing (a business with no website yet). Finds the business's facts, logo and photos (its site, Google Business Profile, Facebook, Instagram), plans a look with real color discipline and one or two distinctive interactive pieces, writes short copy, builds the site (Astro + Tailwind by default), tests it on phone to ultrawide in Chromium and WebKit, reviews its own screenshots, and writes a short report. Self-contained: needs no other skill. Can run one phase at a time (research, plan, build, test) or just report where a site is hosted. Type /site-design with nothing after it to see the menu. Use when the user wants a website designed, created, redesigned, rebuilt, modernized, or tested."
---

# Site design and redesign

Make a website a business owner is proud of and a visitor can use in ten seconds. Two modes:

| Mode | When | Research does |
|---|---|---|
| `redesign` | The business has a site | Captures the old site, then anything it lacks from the business's other pages |
| `new` | No site yet | Builds the facts, logo and photos from Google, Facebook, Instagram and the owner |

Everything this skill needs is in its own folder. Read a reference file when its phase starts, not before:

| File | Read at |
|---|---|
| `reference/sources.md` | Research: where facts, logos, photos, menus and hosting details come from |
| `reference/distinct.md` | Plan and review: making this site unlike the others |
| `reference/color.md` | Plan: the palette |
| `reference/copy.md` | Plan and build: every word on the site |
| `reference/motion.md` | Plan and build: motion and signature pieces; lists `patterns/` |
| `reference/testing.md` | Test: tooling, the tests, the screenshot review |
| `patterns/` | Ready components to start from or adapt |
| `checks/` | Scripts that check the palette and repeated facts in a built site |

## Commands

| You type | What happens |
|---|---|
| `/site-design`, `help`, `status` | Print the menu (below) and stop |
| `/site-design <url> [goals]` | Redesign, every phase |
| `/site-design new <business, city> [goals]` | New site, every phase |
| `/site-design host <url>` | Hosting card only (`reference/sources.md`) |
| `/site-design research <url or business>` | Phase 1 |
| `/site-design plan [goals]` | Phase 2 (needs `site-research/`) |
| `/site-design build` | Phases 3 to 5 (needs `site-plan/PLAN.md`) |
| `/site-design test [url or folder]` | Phase 4, on `site/` or anything given |

Menu: say which phases are done (look for `site-research/BRIEF.md`, `site-plan/PLAN.md`, `site/`,
`test-report/TEST-RESULTS.md`, `redesign-report/REPORT.md`), list the commands above in a table, and name the one
next command. Nothing else.

## What gets written

| Phase | Writes |
|---|---|
| 1 Research | `site-research/`: `content.json`, `brand.md`, `photos/`, `logos/`, `BRIEF.md`; redesign adds `pages/`, `urls.md`, `problems.md`, `hosting.md` |
| 2 Plan | `site-plan/PLAN.md`, `site-plan/preview.png` |
| 3 Build | `site/` |
| 4 Test | `site/tests/`, `test-report/TEST-RESULTS.md` |
| 5 Report | `redesign-report/REPORT.md`, `redesign-report/compare/` |

That is the whole list. Do not write other planning documents; if something matters, it goes in `PLAN.md`.
Notes that belong to a listed file go inside it: sources in `content.json`, photo notes and reference-site notes
in `brand.md` and `BRIEF.md`. Scratch files (scripts, reference-site screenshots, raw downloads, a throwaway
`npm i playwright sharp` and the preview's font packages before `site/` exists) go in `site-research/_local/`, which is never
committed: first add `**/site-research/_local/` to the repository's root `.gitignore` and check with
`git status` that it is ignored.

## Rules that do not bend

1. **Permission.** Only work for a business the user owns or is pitching to. Never log in, submit forms or post
   anywhere on its behalf.
2. **No invented facts.** No made-up reviews, ratings, prices, years, staff, awards, guarantees or quotes. Unknown
   values stay empty and the site hides them. Every unknown goes on one owner to-do list in the report.
3. **The logo and name are the owner's.** Use the real logo file unchanged. No logo: see `reference/sources.md`.
4. **One accent on neutral grounds.** The brand color is an accent, not a paint bucket (`reference/color.md`).
5. **Each fact has one home per page.** Hours, phone, address and each call to action appear once in the page
   body (`reference/copy.md`).
6. **Text is never hidden.** Content is readable with JavaScript off and before any animation runs.
7. **Plain pages stay plain.** Menus, price lists, hours, contact and legal pages get no scroll effects.
8. **Borrow ideas, never copy.** Reference sites give ideas. Their code, words and images are not used.
9. **Look before you say it is done.** Every page is viewed on a phone and a laptop screenshot (Phase 4).
10. **Do not deploy** to the owner's domain unless the user says so.

Everything else in this skill is a starting point. The patterns, layouts and examples are there because they
work, not because they are the only options. If something made for this one business would be better, build it,
as long as rules 1 to 10 and the tests still hold.

## Setup

Ask once, in one message, only for what the command needs and the conversation has not already answered. Save
answers to `redesign-config.md`.

1. **Business**: URL (redesign) or name and city (new). Confirm permission.
2. **Goal**: the one thing a visitor should do (call, book, visit, order, ask for a quote).
3. **Off limits**: anything that must not change, and anything they dislike.
4. **Sites they like** (optional).
5. **Pauses**: `review` (stop after research and after the plan; default) or `auto`.

Stack: Astro + Tailwind, static, no client framework. That is right for most business sites. When this site
would be clearly better with something else (a booking flow with real state, accounts, a store, a heavy
scroll scene that needs a motion library), say what and why in one line and ask before using it. Never add a
dependency for something a few lines of CSS or script can do.

Resume: if a phase's output exists, reuse it unless the user says to redo it.

## Phase 1: Research

Read `reference/sources.md`. Goal: after this phase nobody needs to visit the old site or the social pages again.

1. **Facts** into `site-research/content.json`: name, what they do, phone, email, address, hours, service area,
   services or menu with prices if published, real review quotes with source, social links. Each value carries
   where it came from. Conflicts between sources (two closing times) are listed, not resolved by guessing.
2. **Brand** into `site-research/brand.md`: logo files and where they came from, the one or two logo colors in
   hex, 5 to 10 lines of the owner's own words (verbatim), and what the place or work actually looks like.
3. **Photos** into `site-research/photos/` with a one-line note each (what it shows, source, size). Flag gaps:
   the site will need a hero photo, and work or interior photos.
4. **Redesign only**: screenshot every page at phone and laptop into `pages/`, list every URL in `urls.md`
   (needed for redirects), list what is broken or hard to use in `problems.md` (ranked, evidence for each), and
   write `hosting.md`.
5. **Three reference sites**, no more: good sites for the same kind of business, plus any the user named. For
   each, one screenshot and three lines: what works, the one idea worth adapting, what to avoid. Keep the
   screenshots in `_local/` and the lines in `BRIEF.md`. A site that blocks the fetch is skipped for the next
   candidate; after eight candidates, go on with what loaded and say so in the brief. Do not record videos or write per-site reports.
6. **`BRIEF.md`**, one page: the business in two sentences, the goal, what exists (logo, photos, facts), what is
   missing, the top problems (redesign) or what customers cannot find today (new), and questions for the owner.

Checkpoint: show the brief. `review` waits; `auto` continues unless the name, address or what they sell is unknown.

## Phase 2: Plan

One file, `site-plan/PLAN.md`. Read `reference/distinct.md`, `reference/color.md`, `reference/copy.md` and
`reference/motion.md` first.

1. **Kind of business**: place (people visit), service (they come to you or you go to them), portfolio (the work
   is the pitch), or product. This decides what the home page leads with: a place leads with where and when, a
   service with what and how to reach you, a portfolio with the work itself.
2. **Concept**: what this site is that a competitor's is not, taken from something true about this business;
   the one thing a visitor will remember; and the design levers from `reference/distinct.md`, each decided for
   this business, with the difference table against sibling sites when there are any.
3. **Palette**: the tokens from `reference/color.md`, each with its use and computed contrast.
4. **Type**: one or two families and their jobs. Pick for this business, not from habit.
5. **Pages**: for each, the sections in order, and for each section the actual words (headings, body, buttons)
   and which photo. Quotes and lists already in `content.json` are named, not retyped. Pages are not required
   to share a section order.
6. **Fact map**: a table of every repeated fact (hours, phone, address, main action, reviews link) and the single
   place it lives on each page.
7. **Signature pieces**: one or two, from `reference/motion.md` or made for this site, each tied to real content.
8. **Stack** and anything beyond the default, with the reason.
9. **Redirects** (redesign): every old URL and where it goes.
10. **Owner to-do**: what only the owner can supply or confirm.

Layouts to avoid because every generated site has them: a label above every heading, three equal cards as the
page's structure, a strip of stats, a quote row of three matching boxes, a call-to-action band repeating the
hero's buttons, the same two-column grid for every section, numbered markers on things that are not steps.

Then make `site-plan/preview.png`: a quick static page of the home page's first two screens with the real logo,
palette, type and words, screenshotted at laptop and phone side by side. Look at it, next to the home pages of
any sibling sites. If it could belong to any business of this kind, if it looks like a sibling in new colors, or
if any color looks wrong next to the logo, change the plan and redo it. This is the
review that counts; a list of rejected ideas written after the fact is not.

Checkpoint: show the preview, the palette, the page list and the signature pieces. `review` waits.

## Phase 3: Build

Build `PLAN.md` in `site/`. If the plan turns out wrong, fix the plan and say so in the report. From sibling
projects copy plumbing only (config, loaders, test setup); layouts, components and styles are written for this
site (`reference/distinct.md`).

- Phone first. Check each section at 360 px wide before widening.
- Tokens only: no raw color values in components. The token set is the one in the plan; add nothing. With
  Tailwind 4, put tokens and their breakpoint overrides in the same place (both unlayered, or both in one
  `@layer`): an override inside `@layer` loses to an unlayered `:root` and silently does nothing.
- Real content from `site-research/`. Exact name, phone and address from `content.json`.
- Empty values hide their element. No placeholder text on a page.
- Images: modern formats, `srcset`, width and height set, lazy below the fold, real alt text, served from the
  site's own domain.
- Every page: a title and description that say what and where, one `h1`, canonical, share image (a real photo),
  business structured data. Sitemap, robots, 404, favicon set.
- Forms validate, show errors next to the field, and have a success state. Inputs are 16 px or larger. A form
  with nowhere confirmed to send: build it to open the visitor's email app (`mailto:`) once the owner gives an
  address, show only the call button until then, and put "where should requests go?" on the owner's list.
- Tap targets 44 px. Visible focus. Nothing works on hover only.
- Motion: copy from `patterns/` only what the plan uses. `motion.js` and the reveal rules in `motion.css` are
  only for a site with `data-wipe` or `data-rise` elements.
- Redirects in the host's format (redesign).
- `site/README.md` for the owner: run, build, deploy, edit content.

After each page, screenshot it at phone and laptop and look at it before starting the next.

## Phase 4: Test

Read `reference/testing.md` and do all of it: the automated tests, the two `checks/` scripts, then the screenshot
review of every page, then an independent review. Fix what they find and rerun. Write
`test-report/TEST-RESULTS.md`: what ran, what passed, what could not run and why.

## Phase 5: Report

`redesign-report/REPORT.md`, one page, for the owner:

1. What they are getting, in five plain bullets.
2. Before and after (redesign only): `compare/` holds the old home page beside the new one at phone and laptop
   (so research captures the old page at both widths). A business with no site has no "before": show only the
   new site, and never use its Google listing or Facebook page as the old one.
3. Scores: Lighthouse for the new site, and the old one in a redesign.
4. What you still need from them: every empty value, conflict and approval.
5. How to preview it, and what launch involves (domain, DNS, email records that must not change).

Final message: the preview command, tests passed out of run, and the owner to-do list. Short.
