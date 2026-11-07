---
name: tzsites-redesign
description: Redesign a business website and deliver it in the TZ Sites format of this repo (TzTech26/Redesgin) - a business folder with tzsites.json, a standalone site/ that reads all editable content from site/src/data/tzsites-content.json, and every internal file kept outside site/. Use when asked to make a new redesign or proposal for a business in this repo, to convert an existing redesign folder to the TZ Sites format, or to add or change editable fields (variables), their live editor markers (data-tz-field) or SEO settings (titles, descriptions, share images, structured data, verification, analytics) on one.
---

# TZ Sites redesign

The design work comes from the `site-redesign` skill. This skill decides where its output goes and how the site
gets its content, so the TZ Sites app can import the folder as a proposal, create the site's fields, and give the
customer a download of `site/` only. The format is defined in the repo's `README.md` and `tzsites.schema.json`;
read both first. `Camino Real/` is the worked example.

If you are not inside a checkout of `TzTech26/Redesgin` (no `tzsites.schema.json` next to you), clone it first
(`gh repo clone TzTech26/Redesgin`), work on a new branch there, and open a pull request when the redesign is done.

## 1. Do the redesign

1. Create the business folder at the repo root, named after the business (`<Business Name>/`). Work inside it:
   it is the "project root" for `site-redesign`.
2. Run the `site-redesign` skill from the same `tz` plugin (TzTech26/tz-skills, `/tz:site-redesign`; Skill tool) and
   follow it for research, plan, build, test and report. Use that copy, not an account-level
   `anthropic-skills:site-redesign`, which may be out of date. Its folders (`site-research/`, `site-plan/`, `site/`, `test-report/`, `redesign-report/`, `assets/`)
   land in the business folder. Put its helper scripts, `redesign-config.md`, `design-system/` and any reference
   material in `<Business>/internal/` (e.g. `internal/claude-code/`, `internal/references/`), never at the repo root.
3. While building, keep the rules below in mind from the start; converting afterwards is more work.

## 2. Keep `site/` the deliverable

- `site/` must build alone: `npm ci && npm run build` inside it, nothing else from the repo.
- Nothing in `site/` may reference the folders next to it: no `../site-research`, `../assets`, `../test-report`
  paths in code, configs, scripts, comments or docs. Copy what the site needs (logo, photos, tokens) into `site/`.
- Scripts that read research (content preparation, asset generation, screenshot helpers) go to
  `<Business>/internal/site-tools/`. Test reports write inside `site/` (gitignored), not to `../test-report`.
- `site/README.md` is for the customer: run, build, deploy, edit content. No proposal, research or TZ Sites internals.
- Internal checklists (e.g. `LAUNCH-CHECKLIST.md`) live in `<Business>/internal/`.
- **TZ Sites must be able to show the site in an iframe** (proposal viewer, customer dashboard, admin previews).
  Never send `X-Frame-Options` (`DENY` or `SAMEORIGIN` blocks the previews, and it can't allow another origin), and
  don't block framing in a CSP. To limit who may frame the site, send exactly this, in every host config the site
  ships (`public/_headers` for Cloudflare/Netlify, `.htaccess`, `vercel.json`, …):
  `Content-Security-Policy: frame-ancestors 'self' https://tzsites.com https://*.tzsites.com http://localhost:*`.
  Add a test that the header files keep it (see `LP Productions/site/tests/site.spec.ts`).

## 3. Write the fields (`tzsites.json`)

Create a field for everything the owner would want to change without a developer. Typical set:

| Group | Fields |
|---|---|
| Business info | `business_name` (required), `legal_name`, `about_short`, `phone`, `email` |
| Location | `address_street`, `address_city`, `address_state`, `address_zip`, `latitude`, `longitude`, `map_embed_url` |
| Hours | `hours` (type `hours`; the note goes in the value's `note`) |
| Announcement | `announcement_enabled`, `announcement_text`, `announcement_link` (specials, closures) |
| Social links | `facebook_url`, `instagram_url`, … (one `url` field each; empty hides it) |
| Home / other pages | hero headline and intro, section headings and intros, hero and section photos (`image`/`gallery`) |
| Menu / services | a `collection` for items (name, description, price, options, photo, section, available), plus collections for sections or price tables when the design has them |
| Integrations | ordering/booking IDs and an on/off `boolean` |
| SEO (never by hand) | `node scripts/add-seo.mjs "<Business>" --pages home:Home,menu:Menu,…` adds the standard set: site-wide `seo_*` settings plus `<page>_seo_title`, `<page>_seo_description`, `<page>_seo_image` for every page (see README, "SEO template") |

Rules:

- **Every site gets the SEO template.** Run `add-seo.mjs` once the pages exist, with one `--pages key:Label` per
  page (the key is the field prefix: `home`, `menu`, `case_study`). Fill the snapshot from the research: page titles
  (50–60 characters, what and where, e.g. "Mexican Restaurant in Mascoutah, IL" or "Sports Photographer in St. Louis")
  and descriptions (~150 characters). **Every** `<page>_seo_title` and `<page>_seo_description` names the city or
  area naturally, the home page's too, and no page title uses a name only the owner understands ("Misc" becomes
  "St. Louis Street & Car Photography"). Also fill
  `seo_business_type` (closest schema.org type), `seo_cuisine` and `seo_price_range` for restaurants,
  `seo_service_area` for businesses that travel or serve a metro area (it becomes `areaServed`, e.g. "Greater St. Louis area"), `seo_profiles` (Google Business Profile, Yelp, Tripadvisor) and
  `seo_keywords` (2–5 real searches). Leave `seo_site_url`, verification codes and analytics IDs empty: the owner
  provides them at launch.
- `type` is one of the TZ Sites types; `config` follows `FieldConfig` exactly (see README). Collections need
  `itemFields` (types other than collection/hours/gallery, `helpText` not `help`), `itemTitleKey`, `itemLabel`.
- Keys are snake_case and stable. Labels and `help` are written for a restaurant/shop owner, not a developer.
- Headline, heading and intro values follow `site-redesign`'s "Reference: Writing" limits (hero 8 words or fewer,
  section headings 6 or fewer, intros optional). Leave an intro empty rather than repeat its heading.
- **No thin pages.** A page that is mostly photos, videos or a list (galleries, portfolios, menus) gets a visible
  2–4 sentence intro field: what it is, who it's for, where (the city), and how to book or order. Give intro fields a
  `maxLength` of about 600 and that brief in `help`.
- **The home `<h1>` says what and where.** If the big heading is just the business name, render a line inside the
  `<h1>` under it from an editable field (e.g. `tagline`: "Sports, portrait and video photographer in St. Louis").
- **Videos** get a `date` item field (`upload_date`, "Date published", help: Google needs it for video results) filled
  with the real upload date (YouTube watch pages have `itemprop="uploadDate"`; Vimeo's oEmbed has `upload_date`).
- Leave the logo, colors, fonts and layout out: they are the design, not content.
- Fill `oldSiteUrl`, `summary` (from the report: what changed, in plain words, no invented claims),
  `screenshots.old` (e.g. `site-research/pages/home/laptop.png`) and `screenshots.new`
  (e.g. `redesign-report/compare/_new/home-laptop.png`) with files that exist. Add `previewUrl` only if deployed.

## 4. Write the snapshot

`site/src/data/tzsites-content.json`: `{ [key]: value }` with a value for every field, taken from what the site
actually shows (and `site-research/content.json`). Never invent facts. Prices are integer cents. Hours use
`mon`..`sun` with 24-hour `ranges` and the business's IANA `timezone`. Images are `{ url, alt, width, height }`
with `url` a path inside `site/` (`src/assets/...`). Collection items get stable, readable `id`s.
**No placeholder notes on the site:** never put `[CONFIRM: …]` or similar in a value or a page. Leave anything
unknown empty (`""`, `null`) so the site hides it, and list what the owner still has to provide in the report.
Generate big snapshots (menus) with a one-off script from the data the build already has, and diff the built HTML
before and after to prove nothing changed.

## 5. Wire the site to the snapshot

- Copy the loader from `Camino Real/site/src/lib/content.ts`: it reads the snapshot and, **only** when the build
  env var `TZSITES_CONTENT_URL` is set, fetches the published content once at build time, falling back to the
  snapshot on any error. Without the variable the site never contacts TZ Sites.
- Build a small view model on top (like `src/lib/site.ts`) and make every page/component read from it
  (`const site = await getSite()`). Delete the old hard-coded data files.
- Render the `<head>` with `<SeoHead>` from the SEO template (README, "SEO template"): in the layout, right after the
  charset and viewport tags, with `page` (the field prefix), the page's fallback `title`/`description`, its lead photo
  as `image`, `noindex` for 404/style guide, `logo` (the logo file in `src/assets`, when there's no `logo` field), and
  site-specific JSON-LD in `business` / `jsonLd` (a `Person` for an owner-run business gets their headshot as
  `image`; every `VideoObject` has `uploadDate`, `thumbnailUrl` and an `embedUrl` without `autoplay=1`, and a video
  without a date is left out). Never hand-write
  title, description, canonical, Open Graph, Twitter, icon, verification or JSON-LD tags, and never edit
  `seo-settings.ts` / `SeoHead.astro` in one site (change `templates/seo/` and copy it with `--force`).
- Ship `public/og-image.jpg` (1200 × 630, the best real photo of the business: food, venue, work. Never the logo)
  and `site.webmanifest`. Make the icons with `node scripts/make-icons.mjs "<Business>" <source>` from a square,
  readable logo MARK (symbol or monogram on a solid background; never the full wordmark or a cut-off crop; draw a
  monogram SVG if the logo has no mark): it writes `favicon.ico` (16, 32, 48), `icon-96.png` (Google's search-result
  icon must be a multiple of 48 px; the template lists it first), `icon-192.png`, `icon-512.png` and
  `apple-touch-icon.png`. View the 16 px result.
- In `astro.config.mjs`: `image: { domains: ['tzsites.com'] }` and
  `sitemap({ lastmod: await siteLastModified(), … })` (from `src/lib/sitemap-lastmod.mjs`, which `add-seo.mjs` copies).
  The image component renders a TZ Sites upload (`https://tzsites.com/...`) with `astro:assets` `<Image>` like a local
  photo, so every image, share card and JSON-LD URL is on the site's own domain (Google Images credits that domain).
- Content images (video posters, gallery photos, covers) have real alt text; for uploads that may arrive without
  any, fall back in code (e.g. `Still from "<title>"`). Only decorative images get `alt=""`.
- Client scripts never import content; render what they need into the page (e.g. hours as JSON).
- Handle empty values everywhere (hide the element) and support the full value shapes (several hour ranges,
  closed days, holiday exceptions, hidden collection items, remote image URLs).
- Mark every element that renders a field as you write it (§6). Adding markers afterwards means rereading every component.

## 6. Mark the fields for the live editor

The TZ Sites live editor shows the built site in an iframe beside the fields and highlights where each one appears.
It finds them only through these markers and the page map, so follow this contract exactly (README, "Live editor
markers"):

- **Markers.** Every element that renders a field's value gets `data-tz-field="<fieldKey>"` (the key in `tzsites.json`
  and the snapshot); one element showing several fields lists the keys separated by spaces. Put it on the tightest
  element that shows just that value: the `<h1>` for a headline, the `<p>` for a tagline, the `<img>` for an image
  (not a wrapper; `ContentImage` passes it through), the `<a>` for a phone, email or link (it covers the text and the
  `href`), the element holding the hours table for hours. Galleries: each `<img>`, or the gallery's wrapper.
- **Collections.** Each item's element gets `data-tz-field="<collectionKey>" data-tz-item="<item id>"` (the item's
  `id`); elements inside it that show one of its fields also get `data-tz-item-field="<itemFieldKey>"`. Carry the
  ids through the view model (`site.ts`) so components can render them. An `events` field works the same way: each
  rendered occurrence gets `data-tz-field="<eventsKey>" data-tz-item="<event id>"` (repeats share the id), and the
  parts inside get `data-tz-item-field` with the event's own keys (`title`, `details`, `date`, `start`, `end`,
  `timeNote`, `link`, `category`).
- **Booleans** that show or hide something: mark what they show, when it's shown (an announcement bar gets
  `announcement_enabled`). **Colours:** the main element that uses the colour, if there's an obvious one; otherwise
  skip. **Settings without visible text** (ordering IDs, map embed, form endpoint): the element that uses them.
  **SEO-only fields** (`seo_*`, `<page>_seo_*`) render nothing visible: no marker.
- **Invisible to visitors.** Markers are plain attributes in the static HTML that Astro renders, never added by client
  JS. They change nothing that looks or behaves, and add no wrapper elements unless unavoidable. Pass each attribute
  (`data-tz-field={x ? 'key' : undefined}`), never through a spread (`{...attrs}`): with scoped styles Astro then
  adds a class to the element.
- **Page map.** `node scripts/add-live-editor.mjs "<Business>"` (in the Redesign repo, like `templates/live-editor/`)
  copies `templates/live-editor/site/src/integrations/tzsites-fields.mjs` into `site/` and adds `tzsitesFields()` to `astro.config.mjs` (and an `Access-Control-Allow-Origin` rule for the file to
  `public/_headers`). After `astro build` it scans the built HTML and writes `dist/tzsites-fields.json`,
  `{ "version": 1, "pages": { "<fieldKey>": ["/", "/about/"] } }`: every marked field and the pages that contain it,
  home first (404 and the style guide left out), served at `https://<site>/tzsites-fields.json`. Never edit the copy
  in one site: change the template and copy it with `--force`.
- **Cover every non-SEO field.** A field with nowhere to point at (only used in JSON-LD, like `latitude`) stays
  unmarked: say so in the report.

## 7. Host the preview

Every proposal is previewed on a `tzsites.com` subdomain served by **Cloudflare Workers (static assets)**, built
straight from this repo. Copy the setup from `LP Productions/site/` (`wrangler.jsonc`, `public/_headers`,
`public/_redirects`, `src/pages/robots.txt.ts`, `astro.config.mjs`).

**Files every `site/` ships**

| File | Rule |
|---|---|
| `wrangler.jsonc` | `"name"`: the business slug; `"assets"`: `{ "directory": "./dist", "html_handling": "auto-trailing-slash", "not_found_handling": "404-page" }`; `"previews": {}` (Cloudflare runs `npx wrangler preview` for branch builds, which fails without it). No Worker script, no bindings. |
| `public/_headers` | `/*`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `Content-Security-Policy: frame-ancestors 'self' https://tzsites.com https://*.tzsites.com http://localhost:*` (see §2: never `X-Frame-Options`). `/_astro/*`: `Cache-Control: public, max-age=31536000, immutable`. |
| `public/_redirects` | A 301 for every old URL that changes (from the plan's redirect table). Never a rule that only adds or removes a trailing slash: the host already does that, and the rule loops. |
| `astro.config.mjs` | `site` from the `SITE_URL` build variable, defaulting to the preview address (`https://<subdomain>.tzsites.com`), so canonicals, Open Graph URLs and the sitemap are right even when the variable is missing. |
| `src/pages/robots.txt.ts` | From the SEO template (`add-seo.mjs` copies it): robots.txt from the SEO settings and the site address (`Sitemap: <site>/sitemap-index.xml`), never a hard-coded `public/robots.txt`. |
| `src/integrations/tzsites-fields.mjs` | From the live editor template (`add-live-editor.mjs` copies it), in `astro.config.mjs` `integrations`: writes `dist/tzsites-fields.json` (§6). `public/_headers` gets `/tzsites-fields.json` with `Access-Control-Allow-Origin: *`. |

**Cloudflare project** (Workers & Pages → Create → Import a repository → `TzTech26/Redesgin`)

| Setting | Value |
|---|---|
| Project name | the business slug |
| Production branch | `main` (merge the PR first: the folder doesn't exist on `main` before that) |
| Root directory | `/<Business Name>/site` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Variables | `SITE_URL=https://<subdomain>.tzsites.com`; `NODE_VERSION=22` if the build image is older |
| Custom domain | `<subdomain>.tzsites.com` (short and readable, e.g. `lp-pro.tzsites.com`) |

Then put that address in `tzsites.json` as `previewUrl`, and in the site's `astro.config.mjs` default.

- **Keep it light.** A clean `npm run build` must finish well inside Cloudflare's build limit (aim for under
  2 minutes: optimize images to the sizes the layout uses, don't generate AVIF and WebP for hundreds of photos).
  Stay under 20,000 files and 25 MiB per file in `dist/` (`npx wrangler deploy --dry-run` lists the count).
- **Photos are WebP in the source.** Before the first build, run `node scripts/convert-to-webp.mjs "<Business>"`
  (after `npm ci` in `site/`): it turns every JPG/PNG in `site/src/assets` into WebP (max 2560 wide), deletes the
  originals and renames the references in `site/src` and `tzsites.json`. Add new photos as WebP (or run it again).
  Keep `public/og-image.jpg` and the icons as JPG/PNG (link previews need them). A `getImage()` call for a single
  URL (JSON-LD, share images) passes `layout: 'none'`, otherwise the global image layout makes a srcset of files
  nobody loads.
- **Background/hero videos stay sharp.** Keep the larger-screen file at the source resolution (copy the stream
  with `-an -c:v copy` when the source is already web H.264) and give phones a 1280-wide encode around CRF 24
  capped near 1.8 Mbps. CRF 30+ looks soft next to the films.
- **No live content on previews.** Leave `TZSITES_CONTENT_URL` unset on the preview; the site builds from the
  snapshot. When the customer goes live, TZ Sites hosting follows `docs/DEPLOYMENT.md` §10 in the TZ Sites app repo
  (set `TZSITES_CONTENT_URL`, add the deploy hook to the site in TZ Sites).
- **The customer's own domain** is never pointed at the new site without the owner's OK. Previews stay on
  `tzsites.com`. At launch, set `SITE_URL` to their domain and rebuild.
- `site/README.md` documents the same steps for a customer who hosts it themselves.

## 8. Check

1. In `site/`: `npm ci && npm run build`, then the site's quick tests (`npm run test:quick`; set `TEST_PORT` if
   4321 is taken).
2. `node scripts/validate.mjs` from the repo root (after the build, so it reads `dist/`): manifest, snapshot shapes,
   the SEO template (fields, site files, `<SeoHead>` in use), no internal references in `site/`, and the live editor
   markers: `dist/tzsites-fields.json` exists and every non-SEO field has a `data-tz-field` marker, plus the SEO
   basics: `icon-96.png`, a `favicon.ico` with 48 × 48, `og-image.jpg`, sitemap `lastmod` and `image.domains`. Fix every error and
   every marker warning. Fields listed as "empty or off in the snapshot" may only be hidden: build once with them filled
   in and switched on (serve a changed snapshot from a localhost server to `TZSITES_CONTENT_URL`) and check they appear
   in `tzsites-fields.json`. When you add markers to an existing site, diff the built pages' visible text (or the HTML
   without `data-tz-*` attributes) before and after: it must be identical.
3. Build once with `TZSITES_CONTENT_URL` pointing at an unreachable URL and confirm it falls back to the snapshot.
4. Locally: `npx wrangler deploy --dry-run` in `site/` after a build (reads `dist/`, uploads nothing).
5. Once deployed, check the preview: `curl -sI <previewUrl>` shows no `x-frame-options` and the
   `frame-ancestors` line; `curl -s <previewUrl>` has `<link rel="canonical" href="<previewUrl>">`; and
   `<previewUrl>robots.txt` points at `<previewUrl>sitemap-index.xml`, and the sitemap URLs have `<lastmod>`. In the
   built HTML: every `<title>` and description names the city, no `src`/`og:image`/JSON-LD URL points at
   `tzsites.com`, the first `<link rel="icon">` is the 96 px PNG, and every `VideoObject` has `uploadDate`. If
   Cloudflare Bot Fight Mode is on for the owner's domain, make sure it doesn't block Google's favicon crawler
   (`curl -A "…Google-Favicon…" <site>/favicon.ico` returns 200). Check one page's share card with a link
   preview tool (or paste the link into a chat app) and the JSON-LD with https://validator.schema.org/. Then open the proposal in TZ Sites and confirm
   the "New design" panel shows the site.
6. Add the business to the table in the root `README.md`. Commit on a branch and open a PR.
