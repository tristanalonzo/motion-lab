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
instead of last. And the keyboard readout: two keycaps in the bottom left, with a
keycaps in the bottom left that press themselves as you step through the list.
That last one was built as a pop-up listing the commands first, didn't feel
right, and was reworked the same day into a readout — the notes on why are
under "Bottom left — keyboard readout".

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

## Bottom left — keyboard readout

- [x] **Something in this corner that says what the keys do.** Built twice. The first
      version was a hover pop-up listing the commands; it worked and it was dull, so
      it was replaced the same day by the readout below. Kept here because the reason
      it failed is worth remembering.
  - What was wrong with the pop-up: reading was the whole interaction, on a site
    whose point is that things move. The caps were drawn as keys and one dipped on
    hover, but hovering was what did something and pressing did nothing — the
    drawing promised the wrong action. Its first line repeated what 000 already
    says. The trailing-after-the-cursor effect cost real code and barely showed,
    because the caps are only 44px wide.
  - What was right, and survived: plain, not glass. The about panel had already
    shown that glass on this flat page is nearly invisible.
  - Built: `site/hints.js` + `site/hints.css`, with the caps in `index.html`.
    Docs in README.md, "the keyboard readout".
  - Hidden under 900px: that corner belongs to the list's strip there, and a phone
    has no keyboard and no wheel.

- [x] **Reworked into a readout.** The pop-up is gone. The two caps now press
      themselves as you step through the list — press ↓ and the ↓ cap goes down,
      scroll down and it goes down too. It shows the keys being used instead of
      listing them.
  - Fixed the dishonest part: the caps aren't a button any more. Nothing invites a
    click, because clicking was never what did anything.
  - Decided: the wheel presses the ↓ cap as well. Strictly a lie — you didn't touch
    a key — but it's the one line of the old pop-up worth keeping, and showing it
    beats writing it.
  - Decided: nav.js sends a `lab:step` event on every step and the readout listens.
    One place decides when a key or a scroll counts, instead of two copies of the
    same rules drifting apart. Anything else that wants to react to a step can
    listen too.
  - One demo press at 1400ms after load, so the corner isn't easy to miss. That
    was the "easy to never notice" complaint.
  - **GSAP wasn't needed after all.** A held key just stays down — each step pushes
    the release further out — so nothing ever has to restart a half-finished
    animation, which was the thing plain CSS would have been bad at. Worth knowing
    the door was there and this wasn't the reason to open it.
  - Open: it only reports the list. `tab` and `esc` were in the old pop-up and are
    now written down nowhere a visitor can see. An experiment with keys of its own
    still can't add a cap — a new rule for every experiment, so a decision before
    it's a build.

- [ ] **A word beside the key.** The caps say which key, never what it does. Add the
      word — but keep it a readout: it should appear because you pressed something,
      not sit there waiting to be read. The moment it's always on screen it's the
      old pop-up again, just flatter.
  - Suggested: on press, the word slides out from behind the caps to their right,
    holds while the key is down, and goes back as the cap comes up. Same split as
    the cap itself — out fast, back slow — so the word and the key read as one move.
  - Open: what the words are. "next" / "previous" is short enough to sit beside a
    20px cap. "move through the list" says more but is long enough to reach the
    toolbar, and it's the same sentence 000 already shows.
  - Open: whether the wheel gets a word too. It presses the ↓ cap today, so it
    would say "next" — true, but it might be the chance to say "scroll" there
    instead, which is the one thing about this corner nothing currently tells you.
  - Watch out: a word appearing changes how wide the corner is. It needs its own
    layer, or the caps will shift sideways every time you press a key — which is
    the opposite of what a fixed readout should do.

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
