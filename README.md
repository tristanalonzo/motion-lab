# motion-lab
A growing collection of micro-interactions and UI motion studies, built one experiment at a time.

## Running it

The site loads each experiment's files when you reach it, and browsers block that for files opened by double-clicking. So run a tiny server in this folder:

```
py -m http.server
```

Then open http://localhost:8000. GitHub Pages serves it the same way, so what you see locally is what goes live. Links like `localhost:8000/#001` open straight to an experiment.

## Experiments

- [000 — tristan’s motion lab](000-intro/) — the front page: what this lab is
- [001 — submit button](001-submit-button/) — black iOS-style Submit button with a springy press

## Adding one

1. Make a folder `NNN-name/` with `markup.html`, `style.css`, `script.js`, `README.md`.
2. Add one line to `site/experiments.js`.

What goes in each file: CLAUDE.md, "The experiment contract".

---

## Shared: the stage

`site/stage.js` + `site/site.css` — the middle of the screen. One experiment at a time, each in its own sealed box (a shadow root) so its CSS can't leak.

| From | To | Duration | Easing | What moves |
|---|---|---|---|---|
| experiment shown | another one selected | 250ms | `ease` | the current one fades out right away |
| selected | loaded | 150ms rest + load | — | nothing: waits for the list to rest, then fetches files (instant if preloaded) |
| loaded | shown | 250ms | `ease` | the new one fades in |
| loading | "loading" shown | 250ms | `ease` | only if loading takes over 400ms |
| anything | planned item selected | 250ms | `ease` | "coming soon" fades in |
| name shown | another one selected | 400ms | `cubic-bezier(0.22, 1, 0.36, 1)` | the name above the experiment: old one slides 12px and fades out, new one slides 12px in from the other side, both at once. Same direction the list moves |
| name shown | 000 selected | 400ms | `cubic-bezier(0.22, 1, 0.36, 1)` | the name slides out; the front page has none |

**Decisions**
- **Fade out on select, fade in when settled.** The middle never shows the wrong experiment under the selected number, even mid-scroll.
- **150ms rest before loading.** Scrolling fast past 20 items loads none of them. It's shorter than the list's 450ms slide, so the experiment arrives while the list is still landing.
- **"loading" waits 400ms.** Most loads are instant; a word that flashes for 50ms reads as a glitch.
- **The name sits in one fixed spot, 72px above the middle.** Not measured from each experiment: then it would jump up and down as you scroll. 72px leaves about 47px above 001's button.
- **The name changes the instant you select, not when the experiment arrives.** It's feedback for the list, like the black row.
- **The name moves with the list.** Scroll down and the list moves up, so the old name leaves upward and the new one comes from below. The two directions agreeing is what makes it feel like one motion.
- **No name on 000.** It's the lab itself, and the site title already says it.
- **Neighbours preload, but don't run.** Their files are fetched so stepping to them is instant. Running them early would start their animations off screen.

**Rough edges**
- Leaving and coming back always starts the experiment fresh. Nothing is remembered between visits.
- A broken experiment stays broken until you refresh the page, even after you fix the file.
- An experiment taller than about 140px will run into its own name. Experiments can't move it yet; the fix then is a bigger `--exp-title-gap`, or a way for an experiment to ask for one.

## Shared: the list

`site/nav.js` + `site/nav.css` — scroll (or press ↑/↓) to step through experiments one at a time. The selected one slides to the middle and turns black.

| From | To | Duration | Easing | What moves |
|---|---|---|---|---|
| page loading | rows in place | 800ms each, 200ms wait, 60ms apart | `cubic-bezier(0.22, 1, 0.36, 1)` | each row slides 32px in from the right and fades up, top row first |
| item selected | next/previous selected | 450ms | `cubic-bezier(0.22, 1, 0.36, 1)` | list slides one row (36px); old item fades to grey, new one to black |

**Decisions**
- **Rows come in 60ms apart but take 800ms each.** Each row starts long before the one above it has landed, so they read as one wave rolling down, not a queue of separate moves.
- **32px in from the right, not further.** Just enough to read as "arriving". Further and the faded rows at the bottom are still visibly sliding after the top has settled.
- **A CSS keyframe animation, not a transition.** A transition needs something to change; a keyframe animation plays by itself the moment the row appears.
- **100px of scrolling = one item, no pause.** 100px is one mouse-wheel click in Chrome. A steady trackpad scroll steps evenly instead of stopping after each item.
- **One item per scroll event, at most.** A single huge flick still only moves one item, so the list never jumps over a row.
- **Only the middle row is solid.** Even the neighbours are slightly faded, so the black one is the only thing that reads as "selected".
- **Hover goes darker grey, not black.** Only the selected item is ever pure black.
- **Only the selected row is a Tab stop.** With hundreds of rows, Tab would otherwise take forever to get past the list. ↑/↓ move between rows.
- **Experiments can keep a key or the wheel.** If an experiment calls `e.preventDefault()` on it, the list ignores that event. Arrows inside text boxes and sliders are left alone automatically.

**Rough edges**
- A trackpad flick keeps coasting after your fingers lift, so it can carry you several items past where you meant to stop.
- Hidden below 900px wide, so there's no way to switch on phones yet. No swipe support.
- Back doesn't step through experiments; it leaves the site.
- Opening a link straight to a later item (like `#005`) still staggers from row 000, so the selected row arrives last, after the experiment is already showing.

## Shared: the cursor

`site/cursor.js` + `site/cursor.css` — one cursor for the whole site: a circle that inverts whatever it's over, follows the mouse on a spring, and morphs into a pointing hand over anything clickable. When the mouse is off the page, it waits beside the title. Started life in 001.

| From | To | Duration | Easing | What moves |
|---|---|---|---|---|
| — | page loads | instant | — | circle starts parked left of the title; title already shifted 38px right |
| away | circle / hand | ~0.4s spring + 500ms | spring + `cubic-bezier(0.22, 1, 0.36, 1)` | circle flies from beside the title to the mouse (mouse enters window); title slides 38px back left |
| circle / hand | away | ~0.4s spring + 500ms | spring + `cubic-bezier(0.22, 1, 0.36, 1)` | circle flies back beside the title (mouse leaves window); title slides 38px right to make room |
| circle | hand | 80ms wait + 260ms | `cubic-bezier(0.3, 1.3, 0.5, 1)` | outline morphs circle → hand (slight overshoot), fingertip on the mouse tip |
| hand | circle | 260ms | `cubic-bezier(0.3, 1.3, 0.5, 1)` | outline morphs hand → circle |
| circle / hand | hidden / native | 150ms | `ease` | fades out because an experiment asked |
| — | — | ~53ms behind | spring (stiffness 600, damping 32) | follows the mouse; overshoots ~15px after a fast flick, settles in ~0.4s |

Experiments ask for a shape with `data-cursor="hidden | native | circle | hand"` on an element, or `lab.setCursor(...)` from script.js (cleared automatically when the experiment leaves).

**Decisions**
- **Away means parked, not gone.** The circle is the site's signature, so it's on screen even before you touch the mouse, sitting next to the name like a logo.
- **The parking spot is just another target for the same spring.** Leaving the window doesn't animate anything new: the spring simply starts pulling toward the title instead of the mouse, so going home and coming back feel exactly like following.
- **The title moves by the circle's width plus 10px (38px).** Enough to read as "making room", not so much that the name looks shoved aside.
- **The title reacts with CSS `:has()`, not JS.** It just watches the cursor's `data-state`, so there's still one source of truth. The title's slide is a plain CSS transition, so it's interruptible: leave and come back fast and it turns around mid-slide.
- **The site owns it, not experiments.** It lives above every experiment's box, so it exists over the list, the title and everything else, and a switch never makes it vanish.
- **After every switch it re-checks what's under the mouse.** A still mouse gets the hand the moment a button appears under it.
- **It inverts with `mix-blend-mode: difference`, not with JS.** A white shape set to "difference" flips every color under it, including text, for free.
- **It follows on a spring, in JS, not a CSS transition.** A transition starts over from zero speed every time the mouse moves, so it can only lag, never overshoot. A spring keeps its speed between frames, and that leftover speed is the overshoot.
- **Stiffness 600, damping 32.** Started at 1000/45 (45ms delay, 6px overshoot), which felt too tight. Then tried 300/20 (67ms, 32px), which went too far. This lands about a third of the way between them: 53ms delay (damping ÷ stiffness), 15px overshoot, one clear swing past the mouse.
- **The spring settings live in CSS but are read by JS, every frame.** Drag the numbers in DevTools and feel the change live.
- **28px circle.** Big enough to read as a shape, small enough that you can still aim with it.
- **The morph works because both shapes are built from the same 13 curves.** The circle's 13 points are spaced in proportion to how far apart they are on the hand, so each point slides straight to its partner with no twisting.
- **The hand has no corners at all.** Every point where two curves meet shares one direction, so the outline never kinks. It's 28px tall, the same as the circle.
- **80ms wait before the hand, none before the circle.** Skimming across a row of links doesn't flicker hand-circle-hand, and the hand feels like it answers your pause instead of firing the instant you touch an edge. Going back has no wait, so it never feels stuck as a hand.
- **Fingertip on the mouse, not the hand's center.** You aim with the tip of your finger.
- **SVG path, not `clip-path`.** `clip-path` left a faint hairline on screens scaled to 125%/150%/175%.
- **"Clickable" means `a[href], button:not(:disabled), [role='button'], label, select, summary`.** Disabled buttons keep the circle.
- **The system arrow is only hidden after the first mouse move.** Before that the browser hasn't said where the mouse is, so ours can't be drawn; hiding the arrow earlier would leave no cursor at all. If the script breaks, you keep the normal arrow too.

**Rough edges**
- After a refresh or opening a link, you see the system arrow until the first mouse move, then ours flies over from the title. Browsers don't say where the mouse is until it moves, so for that moment there are two cursors.
- Going home, the spring overshoots past the parking spot, so half the circle pokes off the left edge of the screen for a split second.
- "Away" only means the mouse left the browser window. Switching apps with Alt+Tab while the mouse is over the page leaves the circle where it was.
- The delay is in time, so it grows with speed. A very fast flick can leave the circle 150px behind for a moment.
- Flick into a window edge and the overshoot pokes out before pulling back.
- Over a mid-grey (#808080) "difference" gives the same grey back, so the circle disappears. Matters over photos.
- Safari can't set an SVG path's shape from CSS, so it stays a circle there.
- Something made clickable only with JavaScript (a `div` with a click handler) needs `data-cursor="hand"`.
- `lab.setCursor("native")` doesn't work: the system cursor can only be brought back with the `data-cursor="native"` attribute.
- The hand outline was generated by a script. Changing it by hand means keeping all 13 curves in the same order.

## Break it on purpose

- Set `--cursor-damping: 10`. The circle turns to jelly. Then try `90`: no overshoot at all, just a sluggish drag.
- Set `--cursor-morph-duration: 1200ms` and slowly hover on and off a button. You'll see the circle stretch into the palm and the thumb grow out of its side.
- Set `--stage-settle: 0ms` and scroll fast through the list. Every experiment you pass loads and flashes in for a moment. That's why it waits.
- Set `--cursor-morph-delay: 400ms` and hover a link. It feels broken, like the site didn't notice. Then `0ms` and sweep fast down the list: the hand flickers on every row.
- Set `--title-slide-duration: 1500ms`, then move the mouse out of the window and straight back in. The circle is back at the mouse long before the title has finished making room. That's why the slide is about as long as the spring's trip.
- Set `--nav-in-stagger: 300ms` and reload. Each row waits for the last one to land, and it turns into a slow queue. Then try `0ms`: the whole list moves as one block.
- Set `--stage-fade: 1200ms` and switch back and forth quickly.
- Set `--exp-title-distance: 60px`. The names fly instead of shift, and the title starts competing with the list for your eye. Then `0px`: a plain cross-fade, which loses the sense of direction. You'll see the old one fading under the new one.
