# 001 — Submit button

A black iOS-style Submit button, dead center on an off-white page, that dips when you press it and springs back.

The inverting cursor that started here is now the site's own, shared by every experiment. Its doc is in the root README.

## States

| Element | From    | To      | Duration | Easing                              | What moves                          |
|---------|---------|---------|----------|-------------------------------------|-------------------------------------|
| button  | idle    | pressed | 80ms     | `ease-out`                          | scale 1 → 0.96, opacity 1 → 0.75    |
| button  | pressed | idle    | 220ms    | `cubic-bezier(0.2, 0.9, 0.3, 1.2)`  | scale 0.96 → 1 (slight overshoot), opacity 0.75 → 1 |

The button is triggered by pointer (mouse, touch, pen) and by Space/Enter on the keyboard.

## Decisions

- **Press is fast, release is slow.** Going down should feel like it's under your finger, so it gets 80ms. Coming back up is the part you actually watch, so it gets more time and a small overshoot.
- **0.96, not 0.9.** iOS buttons barely move. At 0.9 the button reads as "shrinking", not "being pressed".
- **Dim and shrink together.** iOS mostly dims. The tiny scale adds the physical feel. Each one alone looks flat.
- **Regular weight on the button.** Semibold (the iOS default) read as too heavy.
- **Squircle radius is bigger than the fallback.** A squircle corner eases in gradually, so at the same radius it looks sharper. 20px squircle ≈ 14px circle by eye.
- **No `cursor:` in the CSS.** The site draws the cursor. A `<button>` already gets the hand.

## Rough edges

- `corner-shape: squircle` is still new. Browsers that don't support it show plain rounded corners. Chrome/Edge draw the real squircle.
- The button doesn't do anything when clicked. That's fine for now; it's a press study.
- Sliding your finger off cancels the press immediately. Real iOS gives you some slack before it lets go.
- The cursor's hand doesn't react to the press. A small squish would sell it.

## Break it on purpose

- Set `--press-scale: 0.8`. It stops feeling like a button and starts feeling like a toy. Then try `--release-ease: ease` and notice the spring is gone.
- Set `--release-duration: 900ms` and click fast. You'll catch it still coming back up when the next press starts.
