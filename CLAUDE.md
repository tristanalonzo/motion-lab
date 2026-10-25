# CLAUDE.md — motion-lab

Read this before doing anything in this repo.

## What this repo is

A shelf for small interactive things where the movement is the point.

Each thing lives in its own numbered folder. Plain HTML, CSS and JavaScript.
No frameworks, no npm, no build step. Run `py -m http.server` in the repo
folder, open http://localhost:8000, and it works. (Double-clicking index.html
does not: browsers block loading files on demand from a `file:///` address.)

Anything goes as long as it passes all three:

1. One folder, a handful of files, nothing to install.
2. Readable top to bottom without getting lost.
3. The interaction is the point — not a feature the interaction decorates.

Silly and useless are fine. A button that runs away from the cursor belongs here.
A working login form does not.

If an idea grows past this — needs npm, becomes a real app, needs a 3D library —
say so out loud. It becomes its own repo and gets linked from here instead.

## Who you're working with

Tristan. Third-year CS student, strong background in After Effects and motion
graphics, still early in front-end code. He can see when motion is wrong long
before he can name the number that's causing it.

How to talk to him:

- Short answers. No padding, no recap of what he just said.
- Plain words. If a technical term is unavoidable, explain it in one line the
  first time it appears.
- Never dump a wall of text. If the answer is long, it's probably the wrong answer.
- Don't hedge. Pick the option you think is right and say why in one sentence.
- Say when something is a bad idea. He'd rather hear it than find out later.

## How to build a component

The split is fixed:

- **You write the wiring.** Markup, state logic, structure.
- **He tunes the feel.** Durations, easing, distances.

So every value he might want to change goes in a block at the very top of
`style.css`, as CSS variables, with a short comment on each. In an
experiment's `style.css` that block is `:host` (the experiment's sealed box,
which works like `:root`). In the site's own CSS files it's `:root`. He should never
have to read past that block to adjust how something feels.

When he describes motion in vague terms — "snappier", "it should bounce a bit",
"too floaty" — don't ask for numbers. Pick numbers, put them in, and tell him
which variable to move if it's wrong.

Never leave a value blank for him to fill in. A guess he can argue with beats a
blank he can't.

## Folder rules

The whole site is one page. Experiments are swapped in and out of it without
page loads.

```
motion-lab/
  index.html             ← the one page: title, stage, cursor. Loads site/main.js
  README.md              ← index + docs for the shared parts
  CLAUDE.md              ← this file
  site/                  ← the site's own code. Experiments never go here
    experiments.js       ← THE list: one line per experiment
    main.js              ← starts everything; keeps list, stage and address bar in sync
    nav.js   nav.css     ← the list on the left
    stage.js             ← loads, mounts and unmounts experiments
    site.css             ← page, title, stage fades
    toolbar.js toolbar.css ← the buttons at the bottom middle
    socials.js socials.css ← the links in the bottom right corner
    cursor.js cursor.css ← the site-wide cursor
    experiment-base.css  ← defaults put inside every experiment's box
  000-intro/             ← the front page is an experiment like any other
  001-submit-button/
    markup.html
    style.css
    script.js
    README.md            ← the state doc
```

Numbered prefixes, three digits, matching the label in the list
(`001-submit-button` is `001`). Three digits so folders still sort in order
past 99. Never renumber or rename an existing folder: its name is its address
(`#001-submit-button`).

Adding an experiment: make the folder, add one line to `site/experiments.js`.
Planned ones can sit in that list with no folder; they show as "coming soon".

## The experiment contract

Every experiment folder has exactly these four files:

- **`markup.html`** — just the experiment's elements. No `<html>`, `<head>`,
  `<body>`, `<link>` or `<script>`. File paths in `src` are relative to the
  folder, as usual.
- **`style.css`** — starts with the `:host` tunables block. It's sealed inside
  the experiment's box automatically, so plain selectors like `.btn` are fine.
  Content is centered by default; `:host` can change that or paint its own
  background.
- **`script.js`** — exports one function:

  ```js
  export function mount(root, lab) {
    // root: the experiment's box. Use root.querySelector, never document.
    // lab.signal: pass as { signal: lab.signal } to any listener on window or
    //             document; the site removes them when the experiment leaves.
    // lab.setCursor("hidden" | "circle" | "hand" | null): change the cursor for now.
    return () => { /* optional cleanup: stop loops and timers */ };
  }
  ```
- **`README.md`** — the state doc (below).

Rules that keep experiments from leaking into each other:

1. Everything happens inside `mount()`. Code at the top of `script.js` runs
   once, ever, not once per visit; keep it to constants.
2. Listeners on the experiment's own elements need nothing: they go when the
   elements go. Listeners on `window` or `document` take `{ signal: lab.signal }`.
3. Every `requestAnimationFrame` loop, `setInterval` and `setTimeout` is
   stopped in the cleanup function.
4. Never set `cursor:` in CSS. Ask the site: `data-cursor="hidden"`,
   `"native"`, `"circle"` or `"hand"` on an element, or `lab.setCursor()`.
5. To use the scroll wheel, arrow keys or a finger drag yourself, call
   `e.preventDefault()` in your handler; the list then leaves that event
   alone. (For `wheel` and `touchmove`, the listener needs `{ passive: false }`.)
   On phones a vertical drag anywhere steps the list, so an experiment you
   drag on must claim its `touchmove` this way.
6. Fonts load in `index.html`, never from an experiment's CSS.
7. Libraries that find elements by selector string (like `gsap.to(".btn")`)
   can't see inside the box. Hand them elements instead:
   `gsap.to(root.querySelector(".btn"))`.

## Every component needs a README

Four parts, in this order:

1. One line on what it is.
2. A table of every state change: from, to, duration, easing, what moves.
3. A short "decisions" section — why a number is what it is, in plain language.
4. A "rough edges" section — what's broken or unfinished. Be honest here.

This is the part that turns a fiddled-with button into something worth showing.
Don't skip it and don't pad it.

## Do

- Keep every component small enough to read in one sitting.
- Put all tunable values at the top of the CSS.
- Comment the weird bits — anything he'd have to look up.
- Use `data-state` on the element as the one source of truth, and let CSS react to it.
- Respect `prefers-reduced-motion` in every component.
- Make keyboard focus visible.
- Suggest breaking a number on purpose so he can feel what it does.
- Make every button a circle or a pill, like Apple's: corners fully round
  (`border-radius: 999px`), never a rounded rectangle. Icon-only buttons are
  circles; buttons with a word are pills.

## Don't

- Don't add a framework, a build step, or a package.
- Don't write code he can't read. If it needs a clever trick, explain it or skip it.
- Don't build a separate gallery view until there are five or more
  components. The list on the left is the navigation until then.
- Don't put an experiment's code anywhere but its own folder, and don't give
  the site special cases for one experiment.
- Don't refactor working components unprompted.
- Don't write a spinner and call the pending state done.
- Don't use jargon without explaining it.
- Don't produce more than one component per request unless asked.

## Git habits — this repo moves between computers

Tristan works on this from more than one machine. GitHub holds the real version;
every computer only has a copy.

- At the start of a session, run `git pull` before touching anything.
- At the end, commit. Never leave work sitting uncommitted overnight.
- If he forgets and ends up with a conflict, walk him through it in plain words.
  Don't assume he knows what a merge conflict is.
- Claude stages and commits. Claude does NOT push — Tristan runs `git push` himself.
- Write the commit message, make the commit, then tell him it's ready to push.
- Never add `Co-Authored-By` or any Claude attribution line to commit messages.

One commit per component. The message says what it is, never "update".

```
add submit button with pending to success arc
```

## Where this is going

This repo becomes the projects section of Tristan's portfolio site. It starts as
a scratchpad and gets presentable later — so don't polish early, but don't leave
a component undocumented either.

It also feeds into a longer path: plain CSS now, GSAP when CSS genuinely can't
express something (interruptible timelines, mid-flight reversals, complex
sequencing). When that moment arrives, point it out — that's the natural door
into the next stage, and hitting it for a real reason is better than reading
about it.