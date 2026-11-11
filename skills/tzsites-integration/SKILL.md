---
name: tzsites-integration
description: Put a website into the TZ Sites format of the TzTech26/Redesgin repo so the TZ Sites app can import it as a proposal - a business folder with tzsites.json, a standalone site/ that reads all editable content from site/src/data/tzsites-content.json, live editor markers (data-tz-field), the SEO template, and a Cloudflare preview on tzsites.com. Integration only; the design comes from the site-design skill. Use when asked to make a new proposal or redesign for a business in that repo, to convert an existing site folder to the TZ Sites format, or to add or change editable fields, markers, SEO settings or the preview hosting on one.
---

# TZ Sites integration

This skill is only about fitting a site into TZ Sites: where files go, how the site gets its content, how fields
are marked, and how the preview is hosted. It makes no design or writing decisions. Those belong to the
`site-design` skill in this same plugin (`/tz:site-design`); when a site has to be designed or built, load that
skill and follow it, then apply the rules here as you build.

The format is defined in the Redesgin repo's `README.md` and `tzsites.schema.json`; read both first. If you are
not inside a checkout of `TzTech26/Redesgin` (no `tzsites.schema.json` next to you), clone it
(`gh repo clone TzTech26/Redesgin`), work on a new branch, and open a pull request when done.

## 1. Where things go

1. The business folder sits at the repo root, named after the business without apostrophes (`Woodys Auto Repair/`).
   It is the project root for `site-design`, so `site-research/`, `site-plan/`, `site/`, `test-report/` and
   `redesign-report/` land inside it.
2. Helper scripts, `redesign-config.md`, checklists and reference material go in `<Business>/internal/`, never at
   the repo root (this overrides `site-design`'s default of the project root). Scratch files stay in
   `site-research/_local/`, which the repo ignores (`**/site-research/_local/` in the root `.gitignore`):
   reference-site screenshots, videos and raw downloads are never committed.
3. From other business folders copy plumbing only: the content loader, the SEO and live editor templates (through
   their scripts), test setup and host files. Pages, layouts, components and styles are designed for this business
   by `site-design`. Take plumbing from the most recently added business folder, and rewrite its Playwright
   config to match `site-design`'s `reference/testing.md` (own port, no screenshot baselines). Copy its
   `package-lock.json` before the first `npm install`: a fresh install can pull a newer native build tool that
   Windows blocks ("Cannot find native binding", "Application Control policy").
4. **A business with no website yet**: `oldSiteUrl` is `""`, and `screenshots.old` is a screenshot of its Google
   listing (Google Maps in headless Playwright, at phone and laptop width).
5. **One folder and slug per business.** If a branch or open PR already has this business's folder, say so
   before starting: only one of them can merge.
6. Apply the rules below from the first file you write; converting afterwards is more work. On Windows, write
   files with the file tool, not shell heredocs (they mangle backslashes and apostrophes).

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
  `seo_business_type` (the closest type in the field's own options list, which is closed: a barber is `HairSalon`), `seo_cuisine` and `seo_price_range` for restaurants,
  `seo_service_area` for businesses that travel or serve a metro area (it becomes `areaServed`, e.g. "Greater St. Louis area"), `seo_profiles` (Google Business Profile, Yelp, Tripadvisor) and
  `seo_keywords` (2–5 real searches). Leave `seo_site_url`, verification codes and analytics IDs empty: the owner
  provides them at launch.
- `type` is one of the TZ Sites types; `config` follows `FieldConfig` exactly (see README). Collections need
  `itemFields` (types other than collection/hours/gallery, `helpText` not `help`), `itemTitleKey`, `itemLabel`.
- Keys are snake_case and stable. Labels and `help` are written for a restaurant/shop owner, not a developer.
- What the values say is `site-design`'s job (its `reference/copy.md`). Here: an optional value (an intro, a
  description) can be left empty, and the site must hide it.
- Intro fields on pages that are mostly photos, videos or a list get a `maxLength` of about 600 and a `help` line
  saying what belongs there (what it is, who it's for, where, how to book or order). An editable `tagline` field
  feeds the line under a business-name `<h1>`.
- **Videos** get a `date` item field (`upload_date`, "Date published", help: Google needs it for video results) filled
  with the real upload date (YouTube watch pages have `itemprop="uploadDate"`; Vimeo's oEmbed has `upload_date`).
- Leave the logo, colors, fonts and layout out: they are the design, not content. A site with no logo file,
  whose wordmark is the business name set in type, marks the wordmark with `business_name`.
- A directions link is a field named `directions_url`. A key with `google` or `maps` in it is picked up as a
  social profile by the SEO template; the Google listing itself goes in `seo_profiles`.
- A form with nowhere confirmed to send: an optional `email` field that is not printed on the site. Filled, the
  form opens the visitor's email app; empty, the site shows the call button instead.
- Fill `oldSiteUrl`, `summary` (from the report: what changed, in plain words, no invented claims),
  `screenshots.old` (e.g. `site-research/pages/home/laptop.png`) and `screenshots.new`
  (e.g. `redesign-report/compare/_new/home-laptop.png`) with files that exist. Add `previewUrl` only if deployed.
  `validate.mjs` fails on `screenshots.new` until the report phase has made that file; that one failure is
  expected during the build.

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

- Copy the loader (`site/src/lib/content.ts`) from the same folder as the rest of the plumbing: it reads the snapshot and, **only** when the build
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
- **Try-before-you-buy preview.** On a proposal the business edits its content and the preview rewrites the page
  through these markers, so keep to these shapes. **Hours:** inside the element marked with the hours field, one
  row per day carries `data-day="mon"`…`"sun"`, and the times are the only text in the row's last `<td>`/`<dd>`
  (a table showing two hours fields lists both keys on the marker, one cell per field in that order). Grouped
  rows ("Mon–Thu") can't be previewed, and anything drawn from the hours at build time (bars, a today line)
  stays as built: say so in the report. **Collections:** every item, wherever it's listed, has `data-tz-item`, and
  each part has `data-tz-item-field`: a new item is shown as a copy of its neighbour with those parts refilled, a
  removed one is hidden. **Colour fields** that change the design are read from a CSS variable named
  `--tz-<fieldKey>` (set on `:root` at build time); the preview sets that variable.
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
| `.node-version` | One line, an exact Node version (copy the newest sibling's, e.g. `24.22.1`), written with a plain line feed. Without it the build uses whatever Node the Cloudflare image defaults to that day. |
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
| Variables | `SITE_URL=https://<subdomain>.tzsites.com` (Node comes from `site/.node-version`) |
| Custom domain | `<subdomain>.tzsites.com` (short and readable, e.g. `lp-pro.tzsites.com`) |

**When a build fails**, open the check's link and read the log before changing code. A failure in "Installing"
before `npm clean-install` runs ("error occurred while installing tools or dependencies") is Cloudflare's setup
step, not the site: check `.node-version` exists, then use Retry build. If several businesses fail on a commit
that did not touch them, it is not that commit. On Windows, stage files with a plain `git add`; turning
`core.autocrlf` off for one command rewrites line endings across the repo.

The project's Settings page has two build tabs, and both must be right or every pull request in the repo shows a
failed check for this business:

| Builds tab | Build command | Deploy / preview command | Root directory | Build watch paths (include) |
|---|---|---|---|---|
| Production | `npm run build` | `npx wrangler deploy` | `/<Business Name>/site` | `<Business Name>/*` |
| Previews Base | `npm run build` | `npx wrangler preview` | `/<Business Name>/site` | `<Business Name>/*` |

The default Previews Base tab has no build command and the wrong root, so set it by hand. The watch path stops
this project building when another business's branch is pushed. A failing "Workers Builds" check on a pull
request is one of these settings, not the code: read the build log in the Cloudflare dashboard.

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
