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

**Decisions**
- **Fade out on select, fade in when settled.** The middle never shows the wrong experiment under the selected number, even mid-scroll.
- **150ms rest before loading.** Scrolling fast past 20 items loads none of them. It's shorter than the list's 450ms slide, so the experiment arrives while the list is still landing.
- **"loading" waits 400ms.** Most loads are instant; a word that flashes for 50ms reads as a glitch.
- **Neighbours preload, but don't run.** Their files are fetched so stepping to them is instant. Running them early would start their animations off screen.

**Rough edges**
- Leaving and coming back always starts the experiment fresh. Nothing is remembered between visits.
- A broken experiment stays broken until you refresh the page, even after you fix the file.

## Shared: the list

`site/nav.js` + `site/nav.css` — scroll (or press ↑/↓, or swipe on a phone) to step through experiments one at a time. The selected one slides to the middle, turns black and bold, and steps right. A black pointer on the screen's left edge aims at it. Under 900px wide, the list and pointer move to a 180px strip along the bottom and the experiment centers above it.

| From | To | Duration | Easing | What moves |
|---|---|---|---|---|
| page loading | rows in place | 800ms each, 200ms wait, 60ms apart | `cubic-bezier(0.22, 1, 0.36, 1)` | each row slides 32px in from the right and fades up, top row first |
| item selected | next/previous selected | 450ms | `cubic-bezier(0.22, 1, 0.36, 1)` | list slides one row (36px); old item fades to grey, weight 700 → 400, steps 18px back left; new one the reverse |
| pointing | switching | 140ms | `cubic-bezier(0.4, 0, 0.2, 1)` | pointer sinks back flat: 22px sharp point → a shallow 4px arc along the edge |
| switching | pointing | 200ms after the switch, then 380ms | `cubic-bezier(0.34, 1.3, 0.64, 1)` | tip grows back out, pokes ~0.5px past 22px, settles. Done by ~580ms, just after the list lands |

**Decisions**
- **The pointer never moves; the list comes to it.** The selected row always lands on the middle, so the pointer can stay pinned there.
- **The pointer reacts first, then lands last.** It starts sinking the instant you switch, ahead of the text, but grows back slowly enough to finish ~130ms after the list. The first version finished before the text (70ms flat, 200ms back), but it was so fast the morph read as the point just appearing.
- **Slow, steady growth instead of a stab.** 380ms with a gentle curve, so you watch the point grow out of the arc. The old 1.5 overshoot curve did most of its travel in the first few frames, which is why it looked like a pop.
- **It rests flat for about 60ms.** From 140ms (fully flat) to 200ms (starts pointing). Tried 100ms, which felt like it hung there too long; 60ms still reads the flat shape as its own moment.
- **Flat while you're moving, sharp when you stop.** Every step restarts the 200ms wait, so a long scroll keeps it flat and it only points at the row you land on.
- **Flat, not just rounded.** A rounded bump (15px) still read as pointing at something mid-switch. Pulled back to a 4px arc, it reads as "not aiming at anything right now", so the point coming back means "here".
- **The morph works like the cursor's.** Both shapes are 4 curves in the same order, so each point slides to its partner. The flat arc has no corner at its middle; the point has one.
- **Bold animates instead of snapping.** Inter now loads as one "variable" font covering weights 400 to 700, so the weight can pass through every step in between. San Francisco on a Mac does the same.
- **Selected steps right 18px.** Moves the selected row away from the pointer, so the two read as pointer and target, not one shape.

- **Rows come in 60ms apart but take 800ms each.** Each row starts long before the one above it has landed, so they read as one wave rolling down, not a queue of separate moves.
- **32px in from the right, not further.** Just enough to read as "arriving". Further and the faded rows at the bottom are still visibly sliding after the top has settled.
- **A CSS keyframe animation, not a transition.** A transition needs something to change; a keyframe animation plays by itself the moment the row appears.
- **100px of scrolling = one item, no pause.** 100px is one mouse-wheel click in Chrome. A steady trackpad scroll steps evenly instead of stopping after each item.
- **One item per scroll event, at most.** A single huge flick still only moves one item, so the list never jumps over a row.
- **Only the middle row is solid.** Even the neighbours are slightly faded, so the black one is the only thing that reads as "selected".
- **Hover goes darker grey, not black.** Only the selected item is ever pure black.
- **Only the selected row is a Tab stop.** With hundreds of rows, Tab would otherwise take forever to get past the list. ↑/↓ move between rows.
- **Experiments can keep a key, the wheel or a drag.** If an experiment calls `e.preventDefault()` on it, the list ignores that event. Arrows inside text boxes and sliders are left alone automatically.
- **Phones get the same list, moved to the bottom.** Not a different menu: same rows, same pointer, same slide, so the site feels like one thing at any size. The bottom is where thumbs are, and it leaves the experiment the top of the screen.
- **Swipe anywhere, not just on the list.** "Scroll down" on the front page should work wherever your thumb lands. Every 40px of drag is one row, the same "add it up, step at a threshold" idea as the wheel, so a long swipe steps through several rows evenly.
- **Finger up = next.** The same direction as scrolling a normal page down.
- **Taps go through.** Only a drag steps the list, so tapping a button in an experiment still works, and tapping a row selects it.

**Rough edges**
- A trackpad flick keeps coasting after your fingers lift, so it can carry you several items past where you meant to stop.
- A swipe steps rows but doesn't fling: the list doesn't keep coasting after your finger lifts, like a real page would.
- The front page says "press ↓", which means nothing on a phone.
- Only tested with simulated touch in Firefox, not yet on a real phone.
- Back doesn't step through experiments; it leaves the site.
- Opening a link straight to a later item (like `#005`) still staggers from row 000, so the selected row arrives last, after the experiment is already showing.
- The pointer doesn't join the slide-in on load. It's just there from the start.
- Safari can't set an SVG path's shape from CSS, so the pointer stays sharp there and never morphs.
- Bold text is wider, so the selected name grows to the right as it gets bolder.

## Shared: the toolbar

`site/toolbar.js` + `site/toolbar.css` — a row of round buttons at the bottom middle, about the open experiment. For now, one: a GitHub link to the experiment's folder, which opens in a new tab. The buttons are in `index.html`; toolbar.js re-points them on every switch. On phones it sits just above the list's strip.

| From | To | Duration | Easing | What moves |
|---|---|---|---|---|
| resting | hovered / focused | 260ms | `cubic-bezier(0.3, 1.3, 0.5, 1)` | button grows to 1.08×, white → light grey (plain `ease`) |
| resting | hovered / focused | 80ms wait + 200ms | `ease` | "view code" fades in and rises 4px above it |
| hovered | resting | 260ms / 200ms | same | the reverse, with no wait |
| hovered | pressed | 100ms | `cubic-bezier(0.3, 1.3, 0.5, 1)` | squashes to 0.92× |
| real experiment | planned one | instant | — | fades to 35%, stops reacting to the mouse |

**Decisions**
- **Bottom middle, under the experiment.** The experiment is centered, so its tools line up under it. The corners are taken (title, lab button, social links).
- **The label waits 80ms, like the cursor's hand.** Both answer the same pause, so they arrive together. Leaving has no wait, same as the cursor.
- **Same overshoot curve as the cursor's morph.** The grow pops a touch past 1.08 and settles, so it feels like it belongs to the hand that's on it.
- **The label is the link's name.** It's always there for screen readers; hover only decides whether it's drawn.
- **Planned experiments grey it out instead of hiding it.** The toolbar doesn't jump around as you scroll. A link with no `href` also can't be clicked, tabbed to, or make the hand.
- **New tab.** Clicking through to the code shouldn't lose your place in the lab.

**Rough edges**
- On a phone the label never shows (no hover), so the icon has to speak for itself.
- On phones it overlaps the bottom of the experiment's area. Fine for centered experiments; one that uses its bottom edge would sit under it.
- The link points at `main`. Code you haven't pushed yet gives GitHub's 404.

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
- Set `--pointer-sharpen-duration: 120ms` and step through the list. The point stops growing and just appears, which is what the first version looked like. Then try `--pointer-blunt-hold: 600ms`: it waits so long that it feels like it's lagging behind the list instead of following it.
- Set `--nav-in-stagger: 300ms` and reload. Each row waits for the last one to land, and it turns into a slow queue. Then try `0ms`: the whole list moves as one block.
- Set `--tool-label-delay: 0ms` and sweep the mouse across the button: the word blinks on and off. Then `400ms`: you're already clicking before it shows.
- Set `--tool-hover-scale: 1.3`. It stops reading as "this reacts to you" and starts reading as a cartoon.
- Set `--stage-fade: 1200ms` and switch back and forth quickly. You'll see the old one fading under the new one.
