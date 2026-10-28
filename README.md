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

1. Make a folder `NNN-name/` with `markup.html`, `style.css`, `script.js`, `about.html`, `README.md`.
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

`site/nav.js` + `site/nav.css` — scroll (or press ↑/↓, or swipe on a phone) to step through experiments one at a time. The selected one slides to the middle, turns black, grows from 12px light to 14px regular, and steps right. A black pointer on the screen's left edge aims at it. Under 900px wide, the list and pointer move to a 180px strip along the bottom and the experiment centers above it.

| From | To | Duration | Easing | What moves |
|---|---|---|---|---|
| page loading | rows in place | 800ms each, 200ms wait, 60ms apart | `cubic-bezier(0.22, 1, 0.36, 1)` | each row slides 32px in from the right and fades up, starting at the row the page opened on and spreading out from it in both directions |
| item selected | next/previous selected | 450ms | `cubic-bezier(0.22, 1, 0.36, 1)` | list slides one row (36px); old item fades to grey, 14px → 12px, regular → light (400 → 300), steps 18px back left; new one the reverse |
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
- **Light and small around it, regular and full size on it.** The selected row stands out by contrast with the rest instead of by shouting in bold, which reads calmer and more like Apple's own lists.
- **Size and weight animate instead of snapping.** Inter loads as one "variable" font covering weights 300 to 700, so the weight can pass through every step in between. San Francisco on a Mac does the same.
- **Selected steps right 18px.** Moves the selected row away from the pointer, so the two read as pointer and target, not one shape.

- **The wave starts on the row you arrived on.** Open `#005` from a link and the wave runs *up* the list from 005, not down from 000, so the row you came for is the first to land instead of the last. The rows either side of it follow together, then the ones beyond those, spreading out both ways. On the front page the row you arrived on is 000, so the wave runs straight down the list exactly as it always did — the common case is unchanged, which is why the timing didn't need retuning.
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
- The pointer doesn't join the slide-in on load. It's just there from the start.
- Safari can't set an SVG path's shape from CSS, so the pointer stays sharp there and never morphs.
- The selected name is bigger and heavier, so it grows to the right as it's selected, and the name shifts right a little as its number widens.

## Shared: the toolbar

`site/toolbar.js` + `site/toolbar.css` — a white pill at the bottom middle holding round buttons about the open experiment. Two so far: an **i**, which opens the about panel (its own section below), and `</>`, which links to the experiment's folder on GitHub in a new tab. The buttons are in `index.html`; toolbar.js re-points `</>` on every switch, about.js looks after the **i**. On phones it sits just above the list's strip.

| From | To | Duration | Easing | What moves |
|---|---|---|---|---|
| resting | hovered / focused | 300ms | `cubic-bezier(0.3, 1.3, 0.5, 1)` | button grows 40 → 46px (a touch past, then settles); the pill and the buttons beside it make room; a light grey circle fades in behind it (plain `ease`) |
| resting | hovered / focused | 300ms | `cubic-bezier(0.3, 1.3, 0.5, 1)` | `<` and `>` slide apart ~2px each; `/` stays put |
| resting | hovered / focused | 300ms | `cubic-bezier(0.3, 1.3, 0.5, 1)` | the dot of the **i** hops up ~1.2px; the ring and the stem stay put |
| resting | hovered / focused | 80ms wait + 200ms | `ease` | "view code" fades in and rises 4px, above the pill |
| hovered | resting | same, with no wait | same | the reverse, from wherever it is |
| any | pressed | 100ms | `ease` | button squashes to 0.92× |
| real experiment | planned one | 250ms | `ease` | button fades to 35%. Stops reacting straight away |
| planned one | real experiment | 250ms | `ease` | fades back to full, clickable straight away |

**Decisions**
- **Buttons grow by width, not by scale.** A scaled button just gets drawn bigger and covers its neighbours. A wider one takes up more room, so the buttons beside it slide over and the pill stretches to fit, which makes the row feel like one piece.
- **The pill is placed by its middle.** So it grows evenly in every direction, not just upwards from the bottom edge.
- **All plain CSS transitions.** They already turn around mid-way if you leave halfway through, so nothing here needs JS.
- **Same overshoot curve as the cursor's morph.** The grow pops a touch past and settles, so it feels like it belongs to the hand that's on it.
- **`<` and `>` move with the grow, same timing.** The button and the icon open up as one gesture. The **i**'s dot hops on the same timing, for the same reason.
- **Every button's icon gets a move of its own.** Same rule as the corner links: a shared hover would make the row feel like a menu instead of a set of tools.
- **A grey circle shows up on hover.** On a white pill, a white button growing would be invisible. The fill shows the button's edge right when it changes.
- **The label waits 80ms, like the cursor's hand.** Both answer the same pause, so they arrive together.
- **A very soft shadow, in two layers.** A tight one draws the edge, a wide faint one lifts it off the page.
- **Planned experiments grey it out instead of hiding it.** The toolbar doesn't jump around as you scroll. A link with no `href` also can't be clicked, tabbed to, or make the hand.
- **The grey-out fades in 250ms, same as the experiment.** The button changes at the same pace as the thing it belongs to, so the two read as one switch.
- **New tab.** Clicking through to the code shouldn't lose your place in the lab.

**Rough edges**
- Growing by width makes the browser lay the row out again every frame. Fine for a few buttons; it wouldn't be for hundreds.
- On phones it overlaps the bottom of the experiment's area. Fine for centered experiments; one that uses its bottom edge would sit under it.
- The link points at `main`. Code you haven't pushed yet gives GitHub's 404.

## Shared: the about panel

`site/about.js` + `site/about.css` — a small white window with notes on the open experiment: what it is, when it was made, the thinking behind it, what it came from, and what could come next. It opens from the toolbar's **i**, and you drag it around by its title bar. The window is in `index.html`; the text comes from an `about.html` in the experiment's own folder, fetched the first time you open the panel on it and remembered after. Only the experiment you're on is ever loaded, so this works the same at 400 experiments.

| From | To | Duration | Easing | What moves |
|---|---|---|---|---|
| closed | open | 260ms | `cubic-bezier(0.2, 1.1, 0.4, 1)` | fades in, rises 10px, scales 0.96 → 1 (a touch past, then settles) |
| open | closed | 160ms | `ease` | the reverse; it's then hidden outright, so nothing in it can be clicked or tabbed to |
| resting | picked up | 200ms | `ease` | the shadow grows: the window lifts off the page |
| any | dragged | — | none | left/top follow the pointer exactly. A window shouldn't lag behind your hand |
| text arrives | — | — | none | the window is sized by its text, so it settles into place the moment the text is in |
| close X resting | hovered / focused | 250ms | `cubic-bezier(0.2, 1.1, 0.4, 1)` | the X turns a quarter turn; a grey circle fades in behind it |

**Decisions**
- **A window, not a pop-up.** No dark backdrop, and clicking the page doesn't close it. You're meant to read it while poking at the experiment, so it stays until you close it.
- **It opens on the right, not in the middle.** The middle is where the experiment is. Opening on top of the thing you're reading about defeats the point.
- **It's sized by its text, and placed once the text is in.** Placing it first and filling it after put it half off the bottom of the screen, because it was centred while it was still 84px tall.
- **Dragged position wins from then on.** Once you've moved it, reopening puts it back where you left it. It only ever gets pulled back inside if you shrink the browser window.
- **It can't be dragged off the edge.** A window you can lose behind the edge of the screen is a window you have to reload the page to get back.
- **Switching experiments closes it.** The notes are about one experiment. Leaving it open would either show the wrong notes under a new name, or flash through five sets of notes as you scroll past five.
- **The text is fetched, not built into the page.** `index.html` would otherwise grow by a few hundred words per experiment, for text almost nobody opens.
- **Plain HTML, not Markdown.** Markdown would need a library to turn it into HTML, and this repo doesn't install anything.
- **The notes take the keyboard when it opens.** So ↑/↓ scroll what you just opened. While it's focused those keys belong to the panel, not the list; Escape hands them back.
- **No `about.html` yet says so in the panel.** A missing file is a normal state for a new experiment, not a breakage, so the button stays live and the panel says "no notes for this one yet."
- **A planned experiment greys the button out,** the same way and at the same pace as `</>`.
- **Rounded corners, not a pill.** The pill-or-circle rule is about buttons. This is a window; the close X inside it is a circle.
- **Clear glass over an 8px blur.** `--about-tint` is the one line that decides the look: `transparent` is clear, so the window takes its colour only from what's behind it; `rgba(255,255,255,0.6)` is tinted, a white wash over the blur. `#FFFFFF` plus `--about-glass-blur: 0` turns the whole thing off.
- **Clear was chosen over tinted knowing the cost.** Tinted is the safer-reading one. Clear looks like the real thing, and on a page this light it mostly behaves — the brightness lift keeps the flat background near-white. It only bites over the black Submit button.
- **The bright rim is what makes it read as glass.** A 1px white line just inside the top edge, like light catching the lip of a pane. Without it a see-through panel looks like a blurry hole in the page rather than an object sitting on it. This does more for the effect than the blur does.
- **Colour behind it is pushed up and lightened** (`saturate(200%) brightness(1.08)`). Blurring drains colour towards grey, and the lift is what keeps dark text readable on the clear version.
- **The blur is small on purpose.** This took three goes. 86% white *and* a 30px blur at once made the glass invisible: there's one dark shape on the whole page, and a wide blur spreads it until nothing is left. A small blur keeps enough of the shape to tint the window.
- **Alpha only does anything where there's contrast behind.** Over the flat page, 30% white and 86% white look the same. The number only shows itself over the experiment or the list, which is why it took a black button to tell them apart.
- **The ghosting is the price, and it was paid on purpose.** You can't have a panel that shows the black button behind it and hides the list behind it; both are just "things behind". Showing things won.
- **Saturation is pushed to 180% behind it.** Blurring colour drains it towards grey. Pushing it back up is what stops frosted glass looking like dirty plastic.
- **A hairline all the way round.** A part-see-through panel with no edge reads as a smudge, not an object.
- **Solid white if the browser can't blur.** Part see-through with nothing blurred behind it is just hard to read.

**Rough edges**
- The glass mostly can't be seen. The page behind it is flat `#F5F5F7` and the window opens on the right, where there's usually nothing at all behind it. It only shows when you drag it over the list or an experiment. On a site with photos or colour it would earn its keep; here it's close to decoration.
- Park the window on the list and the rows read through the prose. Raising `--about-tint` towards 1 fixes that and kills the effect everywhere else at the same time.
- Text sitting over the black Submit button is dark-on-dark and genuinely hard to read. Apple gets away with clear glass because iOS re-colours its text against what's behind it; this doesn't, and doing it properly needs JS sampling the backdrop every frame. Raising `--about-glass-lift` past `1.08` lightens what's behind and buys some of it back; `rgba(255,255,255,0.6)` on `--about-tint` buys all of it back and gives up the look.
- No edge refraction. Real Liquid Glass bends what's behind it at the rim, like a lens. That's a displacement map, not a blur, and it isn't something plain CSS does.
- The blur repaints while you drag the window. Fine for one 420px window; it's the first thing to drop if dragging ever feels heavy.
- Mobile is out of scope. It fits the screen and scrolls, but a window you drag with a finger on a 375px phone isn't really a window.
- Dragging it over the list blocks the list underneath. Normal for a window, but there's nothing to bring the list back except moving the window.
- No way to resize it. Long notes scroll inside a fixed-height window.
- Opening it from the keyboard moves focus into the notes, which means Tab lands on the close X before anything else. Right for a window, slightly abrupt if you only wanted a quick look.
- The text is unstyled beyond `<p>`, `<h3>`, `<ul>` and links. An `about.html` that uses anything else gets browser defaults.

## Shared: the corner links

`site/socials.js` + `site/socials.css` — where else to find me, in the bottom right: GitHub, LinkedIn, Instagram, X, email, left to right. Light grey logos, all 24px tall, 24px from the bottom. Except GitHub's cat, they're bare line marks with no containers, all drawn with the same line thickness. On phones the row sits centered, just above the toolbar.

Every link has its own hover move (the rule is in ROADMAP.md, "Bottom right"). They also share the same base: darkens to near-black, grows a little, and shows its name above.

| From | To | Duration | Easing | What moves |
|---|---|---|---|---|
| resting | hovered / focused (all) | 300ms | `cubic-bezier(0.3, 1.3, 0.5, 1)` | logo grows to 1.12× (a touch past, then settles), over its neighbours, which stay put. Grey → near-black (plain `ease`) |
| resting | hovered / focused (all but GitHub) | 80ms wait + 200ms | `ease` | its name fades in and rises 4px above it |
| any | pressed (all) | 100ms | `ease` | squashes to 0.92× |
| **LinkedIn** resting | hovered | 300ms | same overshoot | the i's stem stands 1.2× taller from its foot; the dot rides up on it and swells 1.15× |
| **Instagram** resting | hovered | 450ms, once per hover | `ease-in-out` | shutter: lens closes to 0.35×, opens past to 1.12×, settles. The flash dot pops to 1.8× as it shuts, and shrinks back |
| **X** resting | hovered | 300ms | same overshoot | the X flicks a half turn and lands looking the same |
| **email** resting | hovered | 300ms | same overshoot | the envelope tips its nose up 12° and lifts off up-right, like a sent letter; hangs there until you leave |
| hovered | resting (all but GitHub) | same | same | the reverse, from wherever it is. Instagram's click just stops |

**GitHub** has the big one: the cat jumps out of the circle and sits on top, and an arrow takes its place. Its moves are one 700ms timeline; percentages are of that.

| From | To | Duration | Easing | What moves |
|---|---|---|---|---|
| resting | open (hover or keyboard focus) | 0–12% | `ease-in-out` | cat in the circle: small squash (1.1 wide, 0.88 tall), feet planted |
| | | 12–30% | `ease-in-out` | stretches tall and thin (0.75 × 1.15) |
| | | 30–45% | `ease-in-out` | squashes flat (1.3 × 0.45), pushing off. The solid cat's head pokes up through the top of the circle |
| | | 45–60% | `ease-in-out` | the cat in the circle flattens to nothing; the solid one flies up 12% past its seat |
| | | 60–100% | `ease-in-out` | drops onto the circle, squashes landing (0.9 tall), wobbles, settles |
| | | 55–100% | `ease-in-out` | arrow pops in: 0 → 1.15 → 0.95 → 1 |
| | | 65–85% | `ease-out` | "github" fades in and rises 4px, above the cat |
| open | resting | same timeline backwards, 1.5× faster (~470ms) | — | from wherever it is: leave mid-jump and it turns around |

**Decisions**
- **A light grey, #A1A1A6.** A step lighter than the list: the further from the experiment, the quieter.
- **Grey, not black, small, and low.** The links are a footnote to the experiment, not part of it. Grey sits back with the list, and 24px from the bottom (the title's distance from the top) keeps them out of the toolbar's line. Hovering one brings it forward to near-black.
- **Every logo the same height, not the same box.** Each viewBox is 16 units tall and crops tight around its logo, and only the height is set, so the envelope gets to be wider than the camera instead of shrinking to fit.
- **One line thickness for all of them.** Same height on screen and same units per pixel means `--social-stroke` comes out exactly the same everywhere. Change it once and every line logo follows.
- **Just the marks, no containers.** `in` without its square, the X without its black tile, the camera and envelope as outlines. The containers made them read as app icons; bare, they read as a set. GitHub keeps its circle because the circle is its mark.
- **Drawn as code (SVG), not image files.** That's what lets them be grey, darken on hover, and move in pieces. A logo file can't do any of that.
- **They grow by scale, so nothing beside them moves.** The toolbar's buttons push their neighbours aside; here that was too busy for a row of small marks, so a hovered logo just grows over the gap.
- **LinkedIn sits up straight.** It's the "be professional" one: the i stands taller and its dot rides up with it.
- **Instagram takes a photo.** Shutter closes and opens, the flash dot fires at the shut. A keyframe animation, not a transition, because a shutter goes two ways on one property. It's short enough that cutting it off when you leave doesn't snap visibly.
- **X flicks a half turn.** Half, not quarter: it lands looking like itself, so the motion is the only thing that changed.
- **Email takes off.** Tipping the envelope up and away reads as "sent". (On Gmail's M, a flap flipping open was tried first: the M with its V turned up looked like a house.)
- **Moved here from the toolbar (GitHub).** It started as the toolbar's "view code" button. Now it's the GitHub link among the contact links, and the toolbar got a plain `</>`.
- **The cat is the GitHub logo taken apart.** The logo is a circle with a cat-shaped hole. Here it's a circle with a page-coloured cat drawn on top, so the cat can move on its own. The cat that jumps out is the same outline in the logo's colour, hidden behind the hole until it climbs out; solid on solid, so you only see it once it pokes past the edge.
- **Squash, stretch, squash.** Gather, reach, push off: the anticipation before a jump, straight from the sketch. The squash gets wider as it gets flatter, so the cat keeps its weight.
- **It flies 12% past its seat and drops back.** Without it the cat just slides to a stop on top, which reads as moving, not jumping.
- **The cat's label waits for the landing.** At 80ms it would float above empty space while the cat is still inside, so it comes in once the cat is seated under it.
- **Leaving plays the jump backwards, not a separate "out".** The cat climbs back into the circle the way it came, from whatever frame it was on. 1.5× faster because leaving shouldn't make you wait.
- **CSS draws every frame, JS only presses play.** The keyframes are CSS, sitting paused. The browser exposes each running CSS animation as an object (the Web Animations API, built in, no library), and socials.js sets its speed to 1 or −1.5. CSS on its own can only restart an animation from the start, which would snap when you leave mid-jump.
- **Keyboard focus counts as hover.** Tab to any of them and it plays, so keyboard users see the same thing.
- **New tab, except email.** Clicking through shouldn't lose your place in the lab. Email opens your mail app instead, so it needs no tab.

**Rough edges**
- The cursor's hand sits right on the logos while you hover, so you see a lot of hand. At 24px the hand is bigger than the logo.
- The cat's tail sticks out to the left of its neck when it's sitting on top. Kept it: it's a cat.
- On a phone a tap plays the hover and opens the link at the same moment, so you don't get to see it.
- Instagram's click restarts every time the mouse comes back, even if you only left for a moment.
- The email address is in the page, so bots that scrape for addresses will find it.
- The cat's beats (the percentages) live inside the keyframes, not in the tune block: CSS can't put a variable there. To retime one beat, edit its percentage in socials.css.

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
- Keep `--nav-in-stagger: 300ms`, then open `#005` and the front page one after the other. Slowed down you can see the wave run up the list from 005 and down it from 000: it always starts on the row you arrived on.
- Set `--github-duration: 3000ms` and hover the GitHub cat. You can watch every beat of the jump: the squash, the stretch, the push-off, the head poking out. Then leave halfway and watch it turn around.
- Set `--github-squash: 1` and `--github-stretch: 1`. No gather, no push-off: the cat just floats up out of the circle. That's what the anticipation was doing.
- Set `--github-overshoot: 0%`. It slides up and stops, like it's on a lift, instead of jumping.
- Set `--x-turn: 90deg` and hover X. It lands sideways and looks broken: that's why it's a half turn.
- Set `--instagram-shut: 0` and `--instagram-burst: 1`. The shutter slams fully shut and the flash goes solid white: a real camera, and much too loud for a footer.
- Set `--tool-grow: 20px` and hover `</>`. The pill bulges around it; once there are more buttons, you'll see them get shoved aside. Then set `--tool-grow-ease: linear`: same size change, but it stops dead instead of settling.
- Set `--stage-fade: 1200ms` and switch back and forth quickly. You'll see the old one fading under the new one.
