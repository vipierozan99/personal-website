# Readability

Web typography rules this site is held to, and the mono-specific corrections.
Numbers are targets, not trivia — `src/index.css` encodes most of them.

## Measure

- 45–75 characters, 66 the sweet spot. 80 is the ceiling. ([Bringhurst via
  webtypography.net][measure], [Google Fonts][gf])
- Longer line ⇒ more leading. The two move together.
- Cap the **column**, not the sections inside it — a section narrower than its
  column sits flush left and stops lining up with what's below.

## Size and leading

| | value |
|---|---|
| body | ≥16px, desktop and mobile |
| leading | 1.5–1.6 proportional · **1.7–1.8 mono** |
| paragraph gap | 0.75–1× the leading, in `em` |

Never set a root `font-size` in `px` — it discards the reader's browser
preference. `rem` throughout, or a `%` if you must rescale.

## Fluid type

Two workable shapes: stepped root font-size at 2–3 breakpoints (everything
downstream in `rem`/`em`), or `clamp()`. Either way one knob drives the page.

```css
font-size: 5vw;                                    /* ✗ zoom is a no-op */
font-size: clamp(16px, 5vw, 22px);                 /* ✗ vw dominates */
font-size: clamp(1rem, 0.9rem + 0.5vw, 1.375rem);  /* ✓ */
```

Browsers don't scale viewport units on zoom, so bare `vw` text fails
[WCAG 1.4.4][144]. A `rem` term in the preferred value gives zoom something to
act on; `rem` bounds cap the rest. ([Smashing][smash])

## Monospace

The measure guideline is in *characters*, but mono runs 20–30% wider, so a
column sized by eye overshoots badly. JetBrains Mono's advance is 0.6em against
~0.5em proportional: 66ch = ~634px at 16px, not ~530px. ([Made Good][mono])

- **`1ch` is exactly one advance here.** `max-width: 72ch` *is* 72 characters,
  and stays 72 when the reader scales their text. Use it; `px`/`rem` can't
  promise that.
- **More leading.** Uniform advance widths flatten word shapes; the extra
  leading supplies the line-to-line landmarks the letterforms no longer do.
- **Less added tracking** on uppercase micro-labels — mono already carries
  generous sidebearings.
- **Aim 60–80ch**, not 45–75. Mono's even rhythm tolerates the upper half.
  ([The Monospace Web][tmw] caps at 80.)
- Monospace measurably helps dyslexic readers — consistent spacing reduces
  visual crowding. ([Rello & Baeza-Yates][rello])

## Justification

Don't. In a monospace especially: there is zero glyph-width flexibility, so
100% of the slack goes into word spaces and the rivers are visible. Browsers
only stretch word spaces — they have none of a typesetter's machinery. W3C
lists justified text as failure technique [F88][f88]. If it must be justified,
`hyphens: auto` is mandatory, not optional. ([Cloud Four][cf])

## Contrast

- 4.5:1 for body text, 3:1 for ≥24px (or ≥18.66px bold). **No small-size
  exemption** — 10px text needs the same 4.5:1 as 16px.
- Avoid pure `#000` on `#fff`; halation. Near-black reads better.
- Decorative glyphs and ordinals may sit below the floor — mark them
  `aria-hidden` so they are formally decoration, rather than leaving
  sub-threshold text that claims to be content.
- Measure the **composited** backdrop. A translucent header over the page is
  not the color its `background-color` says it is.

## Other

- Left-align. Ragged right is more predictable and doesn't depend on
  hyphenation quality.
- Don't pair a `text-*` utility with `prose-body` — both set font-size *and*
  line-height at equal specificity, so emitted order silently decides. Set
  `[--prose-size:…]` instead.
- `font-display: swap`, subset to the ranges actually used.

[measure]: http://webtypography.net/2.1.2
[gf]: https://fonts.google.com/knowledge/using_type/understanding_measure_line_length
[144]: https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html
[smash]: https://www.smashingmagazine.com/2023/11/addressing-accessibility-concerns-fluid-type/
[mono]: https://madegooddesigns.com/monospaced-vs-proportional-fonts/
[tmw]: https://wickstrom.tech/2024-09-26-how-i-built-the-monospace-web.html
[rello]: https://www.superarladislexia.org/pdf/2016-Luz%20Rello-Fonts-taccess.pdf
[f88]: https://www.w3.org/WAI/WCAG20/Techniques/failures/F88
[cf]: https://cloudfour.com/thinks/justified-text-better-than-expected/
