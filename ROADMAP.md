# Roadmap

Planned changes to the page around the experiments. Not in order. Each one gets
done on its own, then ticked off here.

Open questions are things to decide before (or while) building that item.

## Pick up here (left off 2026-10-25)

**Start:** `git pull`, then `py -m http.server` in this folder, then open
http://localhost:8000. (Or VS Code's Live Server, which reloads on save.)

**Where it stands:** the site is one page. Experiments swap in without page
loads, each sealed in its own box, with one cursor for the whole site. 000 (intro)
and 001 (submit button, now a pill) are built. 002–005 are placeholder ideas,
built whenever; they're not the priority. The site around them is.
How to add an experiment: CLAUDE.md, "The experiment contract".

**Done 2026-10-25:** the list slides in on load; the cursor parks beside the
title when the mouse is away (title makes room); 80ms wait before the hand;
a pointer on the left edge aims at the selected row, which is now bold.

**Next:** the toolbar: reset icon, GitHub link, then the about panel (the biggest one).

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
- [ ] **GitHub source link** to the current experiment's folder, e.g.
      `https://github.com/tristanalonzo/motion-lab/tree/main/001-submit-button`.

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

- [ ] **Social links:** GitHub, LinkedIn, X, Instagram.

## Left list — ideas

- [ ] **Counter-style numbering.** Only the selected item shows its number, like a
      counter, instead of every row having one.
- [ ] **Hover focus.** Hovering the list shrinks the other items and the selected one
      smoothly gets bolder. That needs a font whose weight can animate. Inter now
      loads as a variable font (400–700) for the bold selected row, so this is ready.

## Everywhere — later

- [ ] **A hover animation on every interactive thing.** Rows, links, buttons, icons:
      nothing reacts to the mouse by snapping. Each piece gets its own as it's built.
