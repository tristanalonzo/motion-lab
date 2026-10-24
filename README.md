# motion-lab
A growing collection of micro-interactions and UI motion studies, built one component at a time.

Open any folder's `index.html` in a browser. No install, no build step.

- [001 — submit button](001-button/) — black iOS-style Submit button with a springy press and an inverting cursor that morphs from circle to hand

## Shared: the component list

`nav.js` + `nav.css` — the list on the left of every page. Scroll (or press ↑/↓) to step through the components one at a time; keep scrolling and it keeps stepping. The selected one slides to the middle of the screen, level with the component, and turns black. Everything else is grey and fades with distance.

Add each new component to `COMPONENTS` in `nav.js`. Ones without a folder are planned and show "coming soon".

| From | To | Duration | Easing | What moves |
|---|---|---|---|---|
| item selected | next/previous selected | 450ms | `cubic-bezier(0.22, 1, 0.36, 1)` | list slides one row (36px); old item fades to grey, new one to black |
| showing component | showing "coming soon" | 250ms | `ease` | component fades out, "coming soon" fades in |
| showing component | another component's page | 450ms + page load | — | list slides, component fades, then the next page opens (crossfades in Chrome/Edge) |

**Decisions**
- **100px of scrolling = one item, no pause.** 100px is one mouse-wheel click in Chrome, so one click moves one item. A steady trackpad scroll steps through the list evenly instead of stopping after each item.
- **One item per scroll event, at most.** A single huge flick could add up to 900px at once. It still only moves one item, so the list never jumps over a row.
- **Only the middle row is solid.** The fade starts 18px from the middle, so even the neighbours are slightly faded. That keeps the black one the only thing that reads as "selected".
- **Hover goes darker grey, not black.** Only the selected item is ever pure black.

**Rough edges**
- Opening another component is a real page load. The smooth crossfade only works in Chrome/Edge, over http. Double-clicking the file shows a normal page flash.
- A trackpad flick keeps coasting after your fingers lift, so it can carry you several items past where you meant to stop.
- If scrolling coasts onto a built component and rests there for 450ms, its page opens.
- Hidden below 900px wide, so there's no way to switch on phones yet. No swipe support.
- With only 001 built, every other item is "coming soon".
