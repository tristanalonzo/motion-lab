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
  - Open: where the text lives. One file per experiment (e.g. `about.md` or a block in
    `index.html`) so it's written once and the panel just reads it.
  - Open: mobile is out of scope for now.
- [ ] **Reset / replay.** Circular-arrow icon. Greyed out when there's nothing to reset.
  - Open: icon only, or icon + word.
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
  - Open: it needs its own folder (`00-intro`?) and becomes where the site opens.

## Top right

- [ ] **The lab** button.
  - Open: what it does. Goes to 000? Opens the full list?
- [ ] **Dark mode** button.
  - Open: is this the same thing as "002 dark mode button" in the list, or separate?
    Every experiment would also need a dark version.

## Bottom right

- [ ] **Social links:** GitHub, LinkedIn, X, Instagram.

## Left list — ideas

- [ ] **Counter-style numbering.** Only the selected item shows its number, like a
      counter, instead of every row having one.
- [ ] **Hover focus.** Hovering the list shrinks the other items and the selected one
      smoothly gets bolder. That needs a font whose weight can animate. Inter (from
      Google Fonts) and San Francisco both can.
