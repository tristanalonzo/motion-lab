# motion-lab
A growing collection of micro-interactions and UI motion studies, built one component at a time.

Open any folder's `index.html` in a browser. No install, no build step.

- [001 — submit button](01-button/) — black iOS-style Submit button with a springy press and an inverting cursor that morphs from circle to hand

## Shared: the component list

`nav.js` + `nav.css` — the list on the left of every page. Scroll (or press ↑/↓) to step to the next or previous component. The selected one slides to the middle of the screen, level with the component, and turns black. Everything else is grey and fades with distance.

Add each new component to `COMPONENTS` in `nav.js`. Ones without a folder are planned and show "coming soon".

| From | To | Duration | Easing | What moves |
|---|---|---|---|---|
| item selected | next/previous selected | 450ms | `cubic-bezier(0.22, 1, 0.36, 1)` | list slides one row (36px); old item fades to grey, new one to black |
| showing component | showing "coming soon" | 250ms | `ease` | component fades out, "coming soon" fades in |
| showing component | another component's page | 450ms + page load | — | list slides, component fades, then the next page opens (crossfades in Chrome/Edge) |

**Decisions**
- **One scroll = one item, then a 600ms pause.** Trackpads keep sending scroll events for about half a second after a flick. Without the pause, one flick would skip three items.
- **Only the middle row is solid.** The fade starts 18px from the middle, so even the neighbours are slightly faded. That keeps the black one the only thing that reads as "selected".
- **Hover goes darker grey, not black.** Only the selected item is ever pure black.

**Rough edges**
- Opening another component is a real page load. The smooth crossfade only works in Chrome/Edge, over http. Double-clicking the file shows a normal page flash.
- A fast trackpad flick that lasts longer than 600ms can still move two items.
- Hidden below 900px wide, so there's no way to switch on phones yet. No swipe support.
- With only 001 built, every other item is "coming soon".
