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
  - Decided: the text lives in each experiment's own `index.html`, in a hidden block the
    panel shows. Not a separate `about.md`: pages opened from a `file:///` address can't
    read other files, and Markdown would need a library to turn it into HTML.
    Each page only carries its own text, so this works the same at 400 experiments.
  - Mobile is out of scope for now.
- [ ] **Reset / replay.** Circular-arrow icon. Greyed out when there's nothing to reset.
  - Decided: icon only. The word "reset" shows on hover.
- [ ] **GitHub source link** to the current experiment's folder, e.g.
      `https://github.com/tristanalonzo/motion-lab/tree/main/01-button`.

## Bottom left — keyboard hints

- [ ] **Keyboard commands.** Hovering shows a small Apple-style pop-up (glass or plain,
      undecided) that follows the cursor, with a short preview of each command:
      ↑ / ↓ or scroll to move through the list.

## Above the experiment

- [ ] **Experiment title.** Sits just above the interactive part. Not on the same line
      as "tristan's motion lab", not too close to the experiment either.

## 000 — intro

- [ ] **000 tristan's motion lab.** A first entry in the list, before 001. Explains what
      this whole thing is: what tristan's motion lab is.
  - Decided: its own folder, `00-intro`. It becomes where the site opens.

## Top right

- [ ] **The lab** button. Opens a dashboard of every experiment, with search and
      filters by kind (buttons, toys, ...). Categories not decided yet.
  - Waits for: five built experiments (CLAUDE.md's rule for a gallery page).
  - When built: each experiment gets tags on its line in `COMPONENTS` in `nav.js`,
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
