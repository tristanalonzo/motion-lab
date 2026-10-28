# Roadmap

Planned changes to the page around the experiments. Not in order. Each one gets
done on its own, then ticked off here.

Open questions are things to decide before (or while) building that item.

## Pick up here (left off 2026-10-27)

**Start:** `git pull`, then `py -m http.server` in this folder, then open
http://localhost:8000. (Or VS Code's Live Server, which reloads on save.)

**Where it stands:** the site is one page. Experiments swap in without page
loads, each sealed in its own box, with one cursor for the whole site. 000 (intro)
and 001 (submit button, now a pill) are built. 002–005 are placeholder ideas,
built whenever; they're not the priority. The site around them is.
How to add an experiment: CLAUDE.md, "The experiment contract".

**Done 2026-10-25:** the list slides in on load; the cursor parks beside the
title when the mouse is away (title makes room); 80ms wait before the hand;
a pointer on the left edge aims at the selected row; on
phones the list sits in a strip along the bottom and a swipe steps it.

**Done 2026-10-26:** the toolbar is a white pill at the bottom middle with a
`</>` link to the open experiment's folder; hovered buttons grow and push
their neighbours aside. The GitHub cat (jumps out on hover) moved to the
bottom right as the first contact link. The list is lighter: 12px light
around, 14px regular selected. Contact links in the bottom right: GitHub, LinkedIn,
Instagram, X, email, grey, each with its own hover.

**Done 2026-10-27:** the about panel. An **i** in the toolbar opens a small
white window with notes on the open experiment, dragged by its title bar. The
text lives in an `about.html` in each experiment's folder, so every experiment
now has five files, not four (CLAUDE.md's contract says what goes in it).

**Next:** the reset icon. Decide first how an experiment says "there's something
to reset now" — that's a new rule for every experiment, so it's a decision
before it's a build.

**Still undecided:** the lab dashboard's categories, and what each hover
animation should be.

**Done 2026-10-29:** the list's slide-in now starts on the row you arrived on
and spreads out from it, so a link straight to #005 lands that row first
instead of last. And the keyboard hints: two keycaps in the bottom left, with a
plain white pop-up of the site's commands that trails under the cursor —
built and working, but it doesn't feel right and wants a rework before it
stays. See "Bottom left — keyboard hints".

**Learned 2026-10-27:** the about panel is glass (`backdrop-filter`), so the
glass-or-plain question for the keyboard hints now has a working example to
look at. What it taught: on a flat background glass is nearly invisible, and
anything under 80% white lets text behind show through and fight the text in
front. The hints pop-up follows the cursor over the same flat page, so expect
the same — plain is probably right for it.

---

## Bottom middle — toolbar

- [x] **About this experiment.** An **i** icon. Clicking it opens a short, blog-style
      panel: Apple-style window, close X on the top left, draggable by its title bar.
      Shows: experiment name, description, thought process, date, inspirations,
      possible additions.
  - Built: `site/about.js` + `about.css`, and an `about.html` in each experiment's
    folder, fetched when the panel opens and remembered after. Docs in README.md,
    "the about panel"; what goes in an `about.html` is in CLAUDE.md's contract.
  - Decided while building: it opens on the right, not in the middle, so it isn't
    sitting on top of the experiment it's describing. Clicking the page doesn't close
    it — it's a window, not a pop-up. Switching experiments does close it.
  - Mobile is out of scope for now. It fits and scrolls, but it isn't really a window
    on a phone.
- [ ] **Reset / replay.** Circular-arrow icon. Greyed out when there's nothing to reset.
  - Decided: icon only. The word "reset" shows on hover.
  - Needs: a way for experiments to tell the site "there's something to reset now".
    That's a new rule for every experiment, so decide it before building.
  - Later idea: **auto-reset.** Hovering reset slides an on/off switch up out of it.
    On = the experiment resets itself after a fixed wait once it's done.
    Open: how long the wait is, and whether "done" is decided by each experiment.
- [x] **Source code link** (`</>`) to the current experiment's folder, e.g.
      `https://github.com/tristanalonzo/motion-lab/tree/main/001-submit-button`.
  - Built: `site/toolbar.js` + `toolbar.css`. The toolbar row is there for the
    other buttons to join.

## Bottom left — keyboard hints

- [x] **Keyboard commands.** Hovering shows a small Apple-style pop-up that follows the
      cursor, with a short preview of each command: ↑ / ↓ or scroll to move through
      the list.
  - Built: `site/hints.js` + `site/hints.css`, with the caps and the pop-up's four
    lines in `index.html`. Docs in README.md, "the keyboard hints".
  - Decided: **plain, not glass** — the about panel had already shown that glass on
    this flat page is nearly invisible, and this pop-up is smaller.
  - Decided while building: the caps are a button, not just a hover target, so Tab
    can reach them and a click pins the pop-up open. And the pop-up takes no mouse
    events at all, or it slides under the cursor and flickers itself on and off.
  - Hidden under 900px: that corner belongs to the list's strip there, and a phone
    has no keyboard and no wheel.
  - Open: it only knows the site's own keys. If an experiment ever wants to add a
    line of its own, that's a new rule for every experiment — the same shape of
    decision as the reset button's.

- [ ] **Rework it. It's not good enough.** It works, it's documented, and it's dull.
      It reads as a help menu on a site whose whole point is that things move.
      Hunches about what's actually wrong, to agree or disagree with:
  - **The drawing promises the wrong action.** The caps look like keys, and the ↓
    even dips like it's being pressed — but pressing them isn't what does anything.
    Hovering is. The best-looking part of it is a lie about how it works.
  - **It's four grey sentences in a box.** Reading is the whole interaction. Nothing
    on this site should ask to be read when it could be felt instead.
  - **The first line is already on the front page.** 000 says "scroll down or press
    ↓ to browse". The headline hint is repeating what you just read.
  - **The trailing barely shows.** The pop-up lags behind the cursor, but the caps
    are only 44px wide, so the mouse can't travel far enough for the lag to read.
    Real code for an effect nobody will see.
  - **At rest it's grey on grey.** Light grey caps on a light page in the corner
    furthest from where you're looking. Easy to never notice it exists.
  - **It arrives as one block.** All four lines fade up together. The list staggers
    its rows and that's what makes it feel alive; this doesn't.
  - **One idea worth trying:** stop making it a menu and make it a readout. The two
    caps live in the corner, and pressing ↑ or ↓ anywhere on the page lights up the
    matching cap. Then the corner isn't something you go and read — it's something
    that reacts while you're using the site, and it teaches the keys by showing
    them being used. The pop-up could go entirely, or shrink to one line.
  - If the rework can't be expressed in plain CSS (a cap that's already lit getting
    hit again, say, needs the glow to restart mid-flight), that's a real reason to
    reach for GSAP rather than a made-up one.

## 000 — intro

- [x] **000 tristan's motion lab.** A first entry in the list, before 001. Explains what
      this whole thing is: what tristan's motion lab is.
  - Decided: it's `000-intro/`, an experiment like any other. No # in the address opens it.
  - Still to do: the text is a placeholder draft. Rewrite it in your own words.

## Top right

- [ ] **The lab** button. Opens a dashboard of every experiment, with search and
      filters by kind (buttons, toys, ...). Categories not decided yet.
  - Waits for: five built experiments (CLAUDE.md's rule for a gallery page).
  - When built: each experiment gets tags on its line in `site/experiments.js`,
    since that's already the one list that knows every experiment.

## Dropped

- ~~**Experiment title** above the experiment.~~ Built, then taken out: the
  pointer and the bold row on the left already say which one you're on.

- ~~**Dark mode** button, site-wide.~~ Every experiment would need a dark version,
  forever. "002 dark mode button" stays as an experiment of its own.

## Bottom right

- [x] **Social links:** GitHub, LinkedIn, Instagram, X, email, in `site/socials.js` + `socials.css`.
  - Rule: every link has its own hover animation. Not a shared one: each logo gets a
    move that fits what it is. A new link isn't done until it has one, documented in
    README.md, "the corner links".
  - Rule: every line logo uses the same line thickness (`--social-stroke`).
- [ ] **Even more minimalist icons.** LinkedIn, Instagram, X and email are bare line
      marks now; push them further later. GitHub's cat stays as it is.

## Left list — ideas

- [ ] **Counter-style numbering.** Only the selected item shows its number, like a
      counter, instead of every row having one.
- [ ] **Hover focus.** Hovering the list shrinks the other items and the selected one
      smoothly gets heavier. That needs a font whose weight can animate. Inter now
      loads as a variable font (300–700), so this is ready.

## Cursor — ideas

- [ ] **Cursor feel sliders.** Two sliders that change the site cursor live:
      **follow delay** (how far behind the mouse it trails) and **overshoot** (how
      far it swings past when you stop).
  - Note: the spring doesn't have those two knobs directly. It has stiffness and
    damping (`--cursor-stiffness`, `--cursor-damping` in cursor.css). Delay is
    roughly damping ÷ stiffness, and overshoot comes from how low damping is for
    that stiffness. The sliders would speak delay and overshoot and work out the
    two spring numbers behind the scenes.
  - Open: where the sliders live. A hidden tuning panel only you open, or a
    visible spot visitors can play with.

## Everywhere — later

- [ ] **A hover animation on every interactive thing.** Rows, links, buttons, icons:
      nothing reacts to the mouse by snapping. Each piece gets its own as it's built.
