# Copy

Small-business sites are read by someone standing in a parking lot who wants to know three things: do you do
what I need, are you open, how do I reach you. Write for that person. The usual failure is not long copy, it is
copy that says the same thing twice.

## Each fact has one home

Decide where each fact lives before writing a page (the fact map in the plan).

| Fact | Where it lives | Elsewhere |
|---|---|---|
| Main action (call, book, order, directions) | Header on every page, and the hero | A sticky bar on phones may replace the header button. No closing band that repeats the same buttons |
| Phone | With the main action if calling is the action; otherwise the contact page and footer | Never more than twice on one screen |
| Hours | Full table once on the site (contact or visit page) | Elsewhere one line: "Open until 5" or today's hours |
| Address | Contact or visit page, with the map | One line in the footer |
| Reviews link | Beside the review quotes | Not in the footer too |
| About blurb | The about section or page | Footer gets the name and one line at most, not the same sentence |

The footer is global, so it carries a short version (name, one-line address, today's hours or a link, contact
link). On the page that is the full home for those facts, the footer drops what the page already shows. A
header or side rail that stays on screen counts like the footer: one short line (today's hours, the phone), never
the table.

A one-page site with no header has the main action in the hero only. On a place site, the address sits beside
the directions button, so neither is needed twice.

Before a page is done, list every place hours, phone, address and the main action appear on it. More than one in
the page body, or the same sentence anywhere twice: cut. `checks/repeats.mjs` counts them in the built site.

## Say it once, in the fewest words

| Text | Limit |
|---|---|
| Home `h1` | 8 words. Says what and where: "Auto repair in Mascoutah" |
| Section heading | 6 words, usually 2 to 4. A label with a noun in it: "Menu", "Our work", "Find us" |
| Line under a heading | None by default. One sentence, only if it adds a fact |
| List or card item | The name. Add a line only when it tells the reader something the name does not |
| Button | 2 to 4 words, verb first, says what happens: "Call the shop", "Get directions" |
| Paragraph | 3 sentences |
| Whole page | If it runs past about 300 words outside a menu or price list, something is repeated |

- "Brakes" needs no "Brake repair and adjustment." under it. "A/C" can take "Repair and recharge."
- Two exceptions that search engines need. A page that is mostly photos, videos or a list (a gallery, a
  portfolio, a menu) gets two to four plain sentences near the top: what it is, who it is for, where, and how to
  book or order. And if the home `h1` is only the business name, a line inside it says what and where
  ("Sports and portrait photographer in St. Louis"). Every page title and description names the town.
- One heading per idea: not an `h1`, an `h2` and a button that all say "Request an appointment".
- A group with one item is not a group.
- Use the owner's own words from `brand.md` before writing new ones. A light edit of real copy beats a polished
  rewrite.
- Facts over adjectives: "Open 7 days, 11 to 10", not "Open whenever you need us".
- Sentence case. Numerals for numbers. The same name for an action everywhere it appears.
- Error and empty states say what happened and what to do.

## Things that read as generated

Do not use these unless the owner does:

- **Words**: elevate, unlock, seamless, curated, crafted, bespoke, passion, journey, experience (as the product),
  dedicated to, committed to, nestled, vibrant, world-class, cutting-edge, premier, solutions, tailored,
  effortless, testament, game-changer, mouthwatering, unforgettable, exceptional.
- **Shapes**: "Where X meets Y", "More than just X", "Whether you're X or Y", "Not just X. Y.", "Ready to ...?",
  "Discover / Explore / Experience the ...", three adjectives in a row, a two-fragment heading ("Twelve rooms.
  Three ways to stay."), a dry quip closing each paragraph, every section ending in a pitch.
- **Claims with no proof**: "award-winning", "#1", "trusted by thousands", round numbers with a plus sign.
- **Formatting**: Title Case headings, tracked ALL CAPS labels, exclamation marks, emoji, an arrow after every
  link.
- **Evenness**: every card the same length, every section the same shape. Real content is lumpy; let it be.

When you cut one of these, replace it with the plain fact it was standing in for. If there is no fact behind
it, the sentence goes.

## Check

For each page, list every heading, intro and button with its word count, then read the page top to bottom as the
customer. Cut about a third: adjectives, intros that repeat the heading, and anything said earlier on the page.
