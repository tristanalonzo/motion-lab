# Roadmap

Planned changes to the page around the experiments. Not in order. Each one gets
done on its own, then ticked off here.

Open questions are things to decide before (or while) building that item.

## Pick up here (left off 2026-10-26)

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

**Next:** the reset icon (decide first how experiments say "something to reset"),
then the about panel (the biggest one).

**Still undecided:** the lab dashboard's categories, glass or plain for the
keyboard-hints pop-up, and what each hover animation should be.

---

## Bottom middle — toolbar

- [ ] **About this experiment.** An info / brain / question-mark icon. Clicking it opens a
      short, blog-style panel: Apple-style window, close X on the top left. It's draggable
      like a desktop window, but it lives inside the page, not a real pop-up window.
      Shows: experiment name, description, thought process, date, inspirations,
      possible additions.
  - Decided: an `about.html` in each experiment's folder, loaded when the panel opens.
    The site runs on a server now, so loading a file on demand works. Plain HTML, not
    Markdown: Markdown would need a library to turn it into HTML.
    Only the open experiment's text loads, so this works the same at 400 experiments.
  - Mobile is out of scope for now.
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

- [ ] **Keyboard commands.** Hovering shows a small Apple-style pop-up (glass or plain,
      undecided) that follows the cursor, with a short preview of each command:
      ↑ / ↓ or scroll to move through the list.

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
  - Rule: every link has its own hover animation (README.md, "the corner links").

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
