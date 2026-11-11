# Motion and signature pieces

Two failures to avoid. One: the same fade-up on every section, which makes every site look alike. Two: nothing
at all, which makes the site feel like a document. The fix for both is the same. Motion is chosen for the
content it sits on, and each site gets one or two pieces a visitor will remember.

## Three layers

1. **Feedback, everywhere.** Buttons, links, menus, tabs, form states. Quick and quiet. This is in
   `patterns/motion.css` and every site gets it.
2. **One entrance.** The top of the home page arrives with some intent: the photo wipes in, the headline sets,
   the logo mark lands. Once, on load, under about a second, and the headline and main button are readable from
   the first frame.
3. **One or two signature pieces.** Something interactive or scroll-driven, built on real content, placed where
   that content is. This is what makes the site feel made for the business. Pick from the table below or build
   one of your own.

Scrolling a page of plain sections should move nothing. No blanket reveal.

## Choosing a signature piece

Start from what the business actually has, not from the effect. Check the sibling sites first: a piece one of
them already has (in this table or invented) is taken.

| The business has | Piece | File |
|---|---|---|
| Real before and after photos (detailing, roofing, landscaping, dental, renovation, a redesign) | Drag slider, or a wipe that follows the scroll | `patterns/BeforeAfter.astro` |
| Many photos of work, rooms, dishes or products | Horizontal rail you swipe or scroll sideways | `patterns/SnapRail.astro` |
| A real 3 to 5 step process | Photo stays put while the steps scroll past it | `patterns/PinnedSteps.astro` |
| Real logos, certifications, brands serviced, towns served | Slow marquee | `patterns/Marquee.astro` |
| Several clear audiences or services that fit one sentence ("Made for roofers / dentists / barbers") | A word that changes in the headline | `patterns/RotatingWord.astro` |
| One sentence that sums the place up (a promise, a motto, the owner's line) | Statement that lights up word by word as it scrolls | `patterns/LitStatement.astro` |
| Something that changes through the day (open now, today's special, next class) | A live status that is true when you load the page | build it; it needs the hours data |

These are examples that work, not the menu. Better ideas usually come from the business itself: a barber pole
that turns, a garage door that rolls up to show the photo, a receipt that prints the price list, a cup sticker
that tells you they are open. If you invent one, it must do a job (show something, compare something, let the
visitor try something), use real content, and pass the guardrails below.

Where pieces do not belong: menus, price lists, hours, contact details, forms, legal pages. Those are looked up,
not browsed. Keep them still and easy to scan.

A marquee or a rotating word with nothing real to show is decoration. No real logos, no marquee.

## Replay or once

- **Media and decoration replay.** Image wipes, the lit statement, step markers and anything else tied to scroll
  position run forwards as it enters and backwards as it leaves, so it is there again every time the visitor
  scrolls back. `patterns/motion.css` does this with scroll-driven CSS (`animation-timeline: view()`), and
  `patterns/motion.js` gives older browsers a version that replays each time the element comes back in from
  below.
- **Text does not animate in.** Headings and paragraphs are simply there. That way nothing is ever missing when
  someone scrolls up, and nothing waits on a script.
- **The load entrance runs once.** Replaying it would be noise.

Use `data-wipe` on images and `data-rise` on non-text blocks (a photo grid, a map, a card of media). Use
different motion for different things: a wipe for a photo, a stagger only for a real list, nothing for text.

## Guardrails

- Content is visible with JavaScript off. Hidden starting states only apply under the `.js` class or inside
  `@supports`, never in plain CSS.
- Above the fold: headline and main button fully visible on first paint.
- Every piece has a `prefers-reduced-motion` version: usually the end state, shown still.
- Animate `transform`, `opacity`, `clip-path` and color. Never width, height, top or margin.
- Scroll-driven CSS: write `animation-name`, `animation-timing-function`, `animation-fill-mode`,
  `animation-timeline` and `animation-range` as separate properties, never the `animation` shorthand. The build's
  CSS minifier merges the timeline into the shorthand, browsers reject it, and the animation vanishes with no
  error. Check each one in the built site, not in dev.
- Timings: feedback 100 to 200 ms, menus and panels 200 to 300 ms, an entrance up to 800 ms. Things that enter
  ease out. Exits are faster than entrances. Marquees are linear.
- Hover effects only under `@media (hover: hover) and (pointer: fine)`.
- Anything that moves on its own for more than five seconds has a pause button and stops on hover and focus.
- Anything dragged also works with the keyboard and by tapping.
- No scroll-jacking, no smooth-scroll library, no parallax on text.
- Prefer CSS. A motion library is fine when a planned piece really needs it (say so in the plan and load it only
  on the page that uses it).
- It has to stay smooth on a mid-range phone. If it does not, the phone gets a simpler version.

## In the plan

List each piece like this, and nothing that is not listed gets built:

```
- Before/after slider on Our work: three real jobs, drag or arrow keys
  Why: the work is the pitch, and the owner has the pairs
  Reduced motion: slider still works, no auto movement
```
