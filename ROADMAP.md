# Roadmap

Planned changes to the page around the experiments. Not in order. Each one gets
done on its own, then ticked off here.

Open questions are things to decide before (or while) building that item.

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

## Above the experiment

- [ ] **Experiment title.** Sits just above the interactive part. Not on the same line
      as "tristan's motion lab", not too close to the experiment either.

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

- ~~**Dark mode** button, site-wide.~~ Every experiment would need a dark version,
  forever. "002 dark mode button" stays as an experiment of its own.

## Bottom right

- [ ] **Social links:** GitHub, LinkedIn, X, Instagram.

## Left list — ideas

- [ ] **Counter-style numbering.** Only the selected item shows its number, like a
      counter, instead of every row having one.
- [ ] **Hover focus.** Hovering the list shrinks the other items and the selected one
      smoothly gets bolder. That needs a font whose weight can animate. Inter (from
      Google Fonts) and San Francisco both can.

## Everywhere — later

- [ ] **A hover animation on every interactive thing.** Rows, links, buttons, icons:
      nothing reacts to the mouse by snapping. Each piece gets its own as it's built.
