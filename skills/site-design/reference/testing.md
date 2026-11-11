# Testing

Tests catch what breaks. Looking catches what is ugly. Do both, in this order.

## Tooling

```bash
npm i -D @playwright/test@1.64.1 @axe-core/playwright
npx playwright install chromium webkit
```

Pin the Playwright version in `package.json` (no `^`): a newer browser build may be blocked on the machine. If a
browser will not launch, try once to reinstall it, then leave it out and say so in the results. Firefox is
optional: add it only if it launches.

Run against the production build (`webServer` runs `npm run build && npm run preview`), never dev mode. Give
each site its own port (not 4321) and set `reuseExistingServer: false`: with a shared port, tests and
screenshots silently run against another site's server. Astro allows one preview server per project and a stale
one keeps serving the old build (`npx astro preview stop` clears it). Stop any screenshot server before
`npm test`, or the run fails on the taken port. Before any screenshot, check the page title is this business's.

If a config was copied from a sibling, make it match this file (these screens and engines, no screenshot
baselines) and pin the version there too.

On Windows: Lighthouse's own Chrome launcher can fail (`spawn UNKNOWN`); start Playwright's Chromium with
`--remote-debugging-port` and point Lighthouse's node API at that port. In Git Bash set `MSYS_NO_PATHCONV=1`
when a script takes `/` or `a:b` arguments.

Screens:

| ID | Viewport | Notes |
|---|---|---|
| `phone-small` | 360 x 800 | touch |
| `phone` | 390 x 844 | touch |
| `tablet` | 820 x 1180 | touch |
| `laptop` | 1440 x 900 | |
| `desktop` | 1920 x 1080 | |
| `ultrawide` | 3440 x 1440 | |

Projects: every screen in Chromium, plus `phone` and `tablet` in WebKit (that is Safari on iPhone and iPad).
`npm run test:quick` runs Chromium at `phone` and `laptop` and WebKit at `phone`.

## Automated tests

Every page:

- No sideways scroll (`scrollWidth <= clientWidth`), nothing sticking out of the viewport.
- Zero axe violations.
- One `h1`; a title and description; canonical; valid structured data; no broken internal links or images.
- Text is readable with JavaScript disabled (Chromium, `phone`).
- 500 ms after load, everything above the fold has `opacity: 1`.
- After scrolling to the bottom and back to the top, then down again, nothing that has been on screen for a
  second is transparent or clipped away. This is the scroll-back test: it catches reveals that never come back
  and content left hidden.
- With `reducedMotion: 'reduce'`, the page works and nothing moves on its own.

In these tests, scroll with `behavior: 'instant'` (smooth scrolling has not landed by the next assertion in
WebKit), and leave out inputs hidden on purpose behind a custom control. Focus-ring tests arrive by keyboard
(Tab, Shift+Tab): `element.focus()` after a click does not match `:focus-visible`. An entrance on the first screen may
move a cover or the element; it never touches the content's opacity.

**Optional states.** The default content never shows the form, an announcement, holiday hours or empty values.
Build a second copy from the content with every optional field filled, and a third with them empty, and run the
page tests and the form tests on those too.

Phones: tap targets 44 px, body text and inputs 16 px or more, the main action visible without scrolling, the
menu opens, closes, traps focus and closes on Escape.

Laptop: main action above the fold at 900 px tall. Ultrawide: content capped and centered, backgrounds reach
both edges. With a fixed side rail, the rail and the content are capped and centered together as one block.

Interaction: keyboard reaches everything in order with visible focus; forms show errors beside fields and reach
a success state (stub the destination); every signature piece works with keyboard and touch.

Copy: `h1` 8 words or fewer, other headings 6, buttons 4; no heading that repeats the line before or after
it. Keep an allowlist for the owner's own phrases and for menu item names.

Redirects (redesign): every old URL returns 301 to the planned target.

Lighthouse: the home page and one inner page (a one-page site: just the home page), phone and laptop. Aim for 90 or better in all four. Record LCP and
CLS. Do not save the raw JSON. The laptop run uses Lighthouse's desktop config
(`lighthouse/core/config/desktop-config.js`), not phone throttling on a wide screen. Phone scores vary run to
run: take the median of three.

## The two check scripts

After `npm run build` (so `dist` is the default-content build, not an optional-states copy):

```bash
node <skill>/checks/palette.mjs site/dist
node <skill>/checks/repeats.mjs site/dist --phone "<phone>" --address "<street address>"
```

`palette.mjs` lists every color in the built CSS and fails on too many hue families or on warm-tinted neutrals.
`repeats.mjs` counts phone numbers, addresses, hours blocks and identical sentences on each page and fails when
a fact shows up more often than `reference/copy.md` allows. A failure means the page changes, not the limit.

## Look at every page

Take full-page screenshots of every page at `phone` and `laptop` (and the home page at `ultrawide`), and view
each one. Not a sample. Scroll the page to the bottom first so lazy images load. If the page has a fixed bar or
a sticky rail, hide the bar for the full-page shot and take a first-screen shot as well, or the bar lands in the
middle of the image. For each, answer:

1. Is the primary button the first colored thing you see? Is any color there that is not the logo's, neutral, or
   a status?
2. Read the page as a customer. Is anything said twice? Are hours, phone or address visible more than once?
3. Does the page look like the business, or like any business of its kind with the name swapped? Put the home
   page beside the home pages of sibling sites: could they be one template in different colors? Does any block
   (map, hours table, action bar) look lifted from a sibling?
4. Do the signature pieces work? Use them. Scroll past, scroll back, and check they are still there.
5. Anything awkward: a heading with one word on its last line, cramped or empty gaps, a badly cropped photo,
   misaligned edges, a section that is all the same shape as the one above it?

Fix what you find, then rerun the tests.

## Independent review

Give a fresh reviewer (a subagent if you have one) only the screenshots, `PLAN.md`, `content.json` and the home
page screenshots of any sibling sites, and ask for: which of these sites look like they came from the same
template, anything invented or not in `content.json`, anything repeated, anything that reads as a template or as
written by a machine, and the weakest page. Tell them plain conventions (a filled and an outlined button,
hairline rows) are not template signs. No context from the build. Fix what comes back. If there is no
subagent, do the same pass yourself after a break from the build, starting from the screenshots.

## Results

`test-report/TEST-RESULTS.md`: what ran (screens and browsers), passed out of total, the Lighthouse table, what
the review found and fixed, and anything that could not run and why. If a browser could not launch, say so
plainly; do not count it as passing.
