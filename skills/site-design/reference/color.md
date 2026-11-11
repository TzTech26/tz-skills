# Color

A logo color is chosen to be seen on a sign, a truck or a cup. That does not make it a good wall color for a
web page. Most palette problems come from stretching the brand color over surfaces it was never meant for, and
from inventing extra colors to fill the gaps. So: the page is neutral, and the brand color is the one thing on
it that is not.

## The tokens

Nine, and no more unless the plan says why.

| Token | Job | Rule |
|---|---|---|
| `--ground` | Page background | White or a near-white neutral |
| `--ground-alt` | The one alternate section background | A step off `--ground`, same neutral family |
| `--ground-dark` | At most one dark section, and the footer if it is dark | A true dark neutral |
| `--ink` | Text | Near-black, not `#000`. 7:1 or better on `--ground` |
| `--muted` | Labels, meta, captions only | 4.5:1 or better on `--ground` and `--ground-alt` |
| `--line` | Hairlines and field borders | 3:1 for field borders; a hairline that is only a divider can be lighter |
| `--accent` | The brand color, as close to the logo as passes | See "Where the accent goes" |
| `--accent-strong` | Darker step of the accent for text links and filled buttons when `--accent` fails contrast | 4.5:1 on `--ground` |
| `--on-accent` | Text on an accent fill | 4.5:1 on whichever accent it sits on |

No 50 to 950 ramps. No secondary or tertiary brand colors. Hover and pressed states are the same token mixed
with ink or ground (`color-mix`), not new tokens. Status colors (open, closed, error) are only added if the site
shows that status, and each is used for that and nothing else. Muted text on `--ground-dark` is `--ground`
mixed toward the dark (`color-mix`), still 4.5:1, not a new token.

## Picking them

1. **Accent.** Take the main logo color. If the logo has two, the one with more presence is the accent and the
   other stays inside the logo. No logo color (black and white logo, or no logo): take one color from the
   business's own signage, packaging or uniforms, and if there is none, pick one that fits the trade and say so
   in the owner to-do list.
2. **Never sample surfaces.** Walls, siding, furniture, brick and wood in the photos are not palette colors. The
   photos bring those colors to the page on their own.
3. **Neutrals follow the accent's temperature, in reverse.** A warm accent (red, orange, yellow, brown) gets
   plain or slightly cool neutrals. Tinting neutrals toward a warm accent makes tan, beige and brown, and tan
   next to a saturated orange or red looks dirty. A cool accent (blue, green, teal) can take plain neutrals or a
   very slight tint of its own hue. When unsure, plain gray is always right.
4. **Dark means dark.** `--ground-dark` and a dark footer are neutral or the cool side of neutral. A warm
   near-black reads as brown at footer size.
5. **Compute contrast.** Run `node checks/palette.mjs contrast <fg> <bg>` for every pair in the table and write
   the ratios in the plan. Saturated orange, yellow, lime and light pink fail with white text: use dark
   `--on-accent`, or fill buttons with `--accent-strong`. The logo keeps its true color either way.

## Where the accent goes

The page should be roughly nine parts neutral to one part accent, and the photos count as neutral. The accent is
for:

- the primary button (the only filled accent button on a screen)
- text links and the focus ring (`--accent-strong` if needed)
- small marks: an icon, a rule, the active nav item, a price
- at most one accent band or panel per page, in the second half, and only if the color holds up at that size

Look at the accent as a full-width band in the preview before committing to one. Many logo colors that work as a
button look harsh or muddy as a band; if so, no band.

Not for: body text, large backgrounds behind long text, borders on every card, gradients, tinted photo overlays.

## Room to do more

The default above is a restrained page. Two other strategies are allowed when the business calls for it, and the
plan must name which one it is using:

- **Committed**: the brand color owns one whole region (the hero, or the footer) as a flat field, and the rest of
  the page stays neutral. Works when the color is deep enough to carry text at 4.5:1 or better: navy, forest,
  burgundy, black. Rarely works for orange, yellow or pastels.
- **Two-color**: a second color from the logo used for one job only (for example, prices and the open-now dot).
  Only if the logo really has two colors and they look good side by side at button size.

A two-color plan adds two tokens, `--accent-2` and, if text sits on the accent, `--muted-on-accent`. If the
second logo color is warm and pale (peach, tan, cream), `palette.mjs` will read it as a warm neutral: run it
with `--hues 2 --allow-warm`, and keep that color off page and section backgrounds.

A color sampled from a photo of a sign is darker and duller than the printed color. Lift it until it matches
the sign by eye, say so in the plan, and ask the owner for the real value.

Whatever the strategy, every color on the page must be traceable to the logo, to neutral, or to a status. If you
cannot say which of the three a color is, remove it.

## Checks

- `node checks/palette.mjs <site>/dist` after a build. It fails on more hue families than the plan allows
  (`--hues`, default 1, plus one per status color), on warm-tinted neutrals (the tan check), and prints every
  color it found. Fix the site, not the script; if the plan really wants a warm neutral, pass `--allow-warm` and
  say why in the plan.
- Put the logo on every background it will sit on in the preview. If a variant clashes, change the background,
  never the logo.
- Squint at the preview. The primary button should be the first colored thing you notice. If the eye goes
  somewhere else, there is too much color. The logo does not count, and neither does a type wordmark standing
  in for one.
