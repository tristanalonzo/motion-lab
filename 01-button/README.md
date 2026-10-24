# 01 — Button

An iOS-style filled button, dead center on the page, that dips when you press it and springs back when you let go.

## States

| From    | To      | Duration | Easing                              | What moves                          |
|---------|---------|----------|-------------------------------------|-------------------------------------|
| idle    | pressed | 80ms     | `ease-out`                          | scale 1 → 0.96, opacity 1 → 0.75    |
| pressed | idle    | 220ms    | `cubic-bezier(0.2, 0.9, 0.3, 1.2)`  | scale 0.96 → 1 (slight overshoot), opacity 0.75 → 1 |

Triggered by pointer (mouse, touch, pen) and by Space/Enter on the keyboard.

## Decisions

- **Press is fast, release is slow.** Going down should feel like it's under your finger, so it gets 80ms. Coming back up is the part you actually watch, so it gets more time and a small overshoot.
- **0.96, not 0.9.** iOS buttons barely move. At 0.9 the button reads as "shrinking", not "being pressed".
- **Dim and shrink together.** iOS mostly dims. The tiny scale adds the physical feel. Each one alone looks flat.
- **Inter, not SF.** SF Pro can't be loaded on the web outside Apple devices. Inter is the closest free match. Its letter-spacing is pulled in slightly so it sits closer to SF.
- **Squircle radius is bigger than the fallback.** A squircle corner eases in gradually, so at the same radius it looks sharper. 20px squircle ≈ 14px circle by eye.

## Rough edges

- `corner-shape: squircle` is still new. Browsers that don't support it show plain rounded corners. Chrome/Edge draw the real squircle.
- The button doesn't do anything when clicked. That's fine for now; it's a press study.
- Sliding your finger off cancels the press immediately. Real iOS gives you some slack before it lets go.
- Inter loads from Google Fonts, so with no internet it falls back to the system font.

## Break it on purpose

Set `--press-scale: 0.8`. It stops feeling like a button and starts feeling like a toy. Then try `--release-ease: ease` and notice the spring is gone.
