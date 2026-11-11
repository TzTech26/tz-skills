# Finding the business's facts, logo and photos

Work down this list and stop when `content.json`, `brand.md` and `photos/` are full. Record the source of every
value. Be polite: read `robots.txt`, wait half a second between page loads, never log in on the business's
behalf, never submit a form, never download more than you will use.

## Source order

| Source | Good for | How |
|---|---|---|
| The business's own site (redesign) | Everything | Crawl from the home page and sitemap, up to 50 pages |
| Google Business Profile (search the name and city, or Google Maps) | Address, pin, phone, hours, rating and count, attributes, owner photos, review text | A browser. Plain page-text extraction often returns nothing on Maps; read `innerText` and `aria-label` values instead. The "By owner" photo tab has the best photos |
| Facebook page | Bio, email, phone, hours, logo (profile picture and cover), photos, menu boards, the owner's voice in posts | The user's own signed-in browser if they offer it; logged-out pages show little. Scroll and read captions for voice |
| Instagram, TikTok | Photos of work and atmosphere, handle | Often login-walled. Take the handle and move on |
| Yelp, BBB, trade directories, the state business registry | Cross-checks: legal name, license, years, complaints | Many block automated fetches; one try each |
| Files and answers from the owner | Anything missing | Ask in the brief, in one list |

For a business with no site, screenshot its Google listing at phone and laptop width (Google Maps loads in
headless Playwright); the report's before-and-after needs both. If the listing shows a customer's photo of
people, crop it out or pick a view without it before committing the screenshot.

Signed out, Google Maps is a limited view: rating, address, phone, pin and today's hours, but no review text,
no weekly hours and no owner photos. Those need the user's signed-in browser. Facebook post text is only in the
DOM while on screen: collect it as you scroll, do not read the page once at the end.

A 403 or a bot check is final: do not retry with another client or user agent.

Ask for the user's signed-in browser only when a source needs it, and say which source.

## Checks on what you find

- **Same business?** Search the name without the city. A common name may have a look-alike elsewhere; do not
  pick up its facts or photos.
- **Reviews belong to this business.** A listing can carry reviews from a previous business at the same address.
  Check dates and what the reviews talk about. Quote reviews exactly, with the source, and never rewrite one.
- **Conflicts.** Two closing times, two phone numbers: record both with their sources and dates, use the most
  recent official one, and put the conflict on the owner's list.
- **Facts read off a photo** (the cross street, a price on a board, "red roof") go in `content.json` with the
  photo as their source, like any other fact.
- **Claims.** Health claims, "best in town", license numbers: only if the business publishes them, and still
  flag for the owner.

## Logo

1. Look for a real file: an SVG on the old site, then the largest PNG, then the Facebook profile picture, then
   the cover image, signage in photos, packaging.
2. Use the best one as it is. If it has to be cut out of a larger image, cut it cleanly, note the size, and ask
   the owner for the original file in the to-do list. Never redraw, recolor or restyle a logo.
3. Pull the one or two logo colors: SVG fills, or sample the flat areas of a raster. Write the hex values in
   `brand.md`.
4. **A logo that exists only on a sign in a photo** counts as lettering, not a file: do not cut it out as the
   site's logo. Treat it as the next step and base the wordmark on it.
5. **No logo file anywhere**: set the business name in type as a wordmark. Offer two options in the plan (shown in
   `preview.png`) and let the user choose. Base it on lettering the business already uses if there is any (the
   sign, a shirt, an invoice). Say plainly in the report that it is a stand-in.
6. Favicon: a square, readable mark (symbol or monogram on a solid ground), never the full wordmark shrunk.

## Photos

- Save the largest version. Check `srcset` and strip resize parameters where that gives the original.
- Getting many photos out of Facebook: one-by-one downloads get blocked after a few. Collect the image URLs in
  the page and fetch them in a batch instead.
- Look at each photo and note what it shows. Keep the ones that are sharp, well lit and show the real place,
  people or work. Skip stock-looking images, AI-looking images and anything with another business's branding.
- The site needs, at minimum: one hero photo that works wide and tall, and three to six of the work, the room or
  the product. If they do not exist, say so in the brief. Do not fill the gap with stock or generated photos
  without the user's OK; a well-set type-only hero beats a fake photo.
- Photos of people and customers' cars, homes or pets: flag for the owner's approval.

## Menus, services and prices

- Read menu boards and price sheets from photos if that is the only place they exist. Keep the business's own
  names and spelling, fix obvious typos, and list anything unreadable for the owner.
- Use prices only if the business published them, and note the date of the source.
- Services: the list the business gives, in its words. Do not pad it with things a business of this kind
  "usually" does.

## An existing site (redesign)

For each page: phone and laptop full-page screenshots, the visible text as markdown, and the title and
description. For the site: every URL (for redirects), the navigation, forms and what they collect, embeds and
third-party tools that must keep working, and anything broken (dead links, missing images, unreadable text,
things that do not fit a phone). Rank the problems by how much they cost the business, with a screenshot or URL
for each.

## Where a site is hosted (`host`, and `hosting.md`)

Passive lookups only: public DNS, registration data, normal page responses, the TLS certificate. No port scans,
no attempts to get around a proxy.

| Look up | How | Tells you |
|---|---|---|
| A, AAAA, CNAME for the domain and `www` | `dig`, or `https://cloudflare-dns.com/dns-query?name=<n>&type=<t>` with `accept: application/dns-json` | Server address; a CNAME often names the host outright |
| IP owner | `https://rdap.org/ip/<ip>` | The network (Cloudflare, AWS, GoDaddy, ...) |
| Nameservers | DNS `NS` | Who runs DNS |
| Registration | `https://rdap.org/domain/<domain>` | Registrar, expiry |
| Mail | DNS `MX`, `TXT` (SPF, DMARC) | Email provider; records that must survive launch |
| Response headers | A normal GET | `server`, `x-powered-by`, and host headers (`cf-ray`, `x-vercel-id`, `x-nf-request-id`, `x-wix-request-id`, `x-shopify-stage`, `wpe-backend`, ...) |
| Page source | The HTML | Platform: `wp-content`, `cdn.shopify.com`, `wixstatic`, `squarespace-cdn`, `_next/`, `_astro/` |

Report as a short table: website host, platform, CDN or proxy, DNS provider, registrar and expiry, email
provider, certificate expiry. Give a confidence for the host (a host-specific header or CNAME is high; only an
IP owner is a guess). If the site sits behind a proxy, say the real host is hidden and leave it there. End with
what it means for launch: which records change, where, and which must not (MX, SPF, DKIM, DMARC, verification
records).

For a new site, skip hosting. Instead check whether two or three short domain names are free
(`https://rdap.org/domain/<name>` returns 404 when unregistered) and list them in the brief.
