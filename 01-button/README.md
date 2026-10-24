# 01 — Button

A black iOS-style Submit button, dead center on a white page, that dips when you press it and springs back. The mouse is replaced by a circle that inverts whatever it's over.

## States

| Element | From    | To      | Duration | Easing                              | What moves                          |
|---------|---------|---------|----------|-------------------------------------|-------------------------------------|
| button  | idle    | pressed | 80ms     | `ease-out`                          | scale 1 → 0.96, opacity 1 → 0.75    |
| button  | pressed | idle    | 220ms    | `cubic-bezier(0.2, 0.9, 0.3, 1.2)`  | scale 0.96 → 1 (slight overshoot), opacity 0.75 → 1 |
| cursor  | hidden  | visible | 150ms    | `ease`                              | opacity 0 → 1 (mouse enters window) |
| cursor  | visible | hidden  | 150ms    | `ease`                              | opacity 1 → 0 (mouse leaves window) |
| cursor  | —       | —       | 0ms      | `ease-out`                          | follows the mouse (`--cursor-lag`)  |

The button is triggered by pointer (mouse, touch, pen) and by Space/Enter on the keyboard. The cursor only appears with a real mouse.

## Decisions

- **Press is fast, release is slow.** Going down should feel like it's under your finger, so it gets 80ms. Coming back up is the part you actually watch, so it gets more time and a small overshoot.
- **0.96, not 0.9.** iOS buttons barely move. At 0.9 the button reads as "shrinking", not "being pressed".
- **Dim and shrink together.** iOS mostly dims. The tiny scale adds the physical feel. Each one alone looks flat.
- **Inter, not SF.** SF Pro can't be loaded on the web outside Apple devices. Inter is the closest free match. Its letter-spacing is pulled in slightly so it sits closer to SF.
- **Squircle radius is bigger than the fallback.** A squircle corner eases in gradually, so at the same radius it looks sharper. 20px squircle ≈ 14px circle by eye.
- **The cursor inverts with `mix-blend-mode: difference`, not with JS.** A white circle set to "difference" flips every color under it, including the button's label, for free. No color math in code.
- **Cursor lag is 0.** A cursor that trails behind feels nice for a second, then feels broken when you're trying to click. The variable is there if you want to feel it.
- **28px circle.** Big enough to read as a shape, small enough that you can still aim with it.
- **No dark mode.** The page is meant to be black-on-white. The cursor already gives you the inverted version.

## Rough edges

- `corner-shape: squircle` is still new. Browsers that don't support it show plain rounded corners. Chrome/Edge draw the real squircle.
- The button doesn't do anything when clicked. That's fine for now; it's a press study.
- Sliding your finger off cancels the press immediately. Real iOS gives you some slack before it lets go.
- Inter loads from Google Fonts, so with no internet it falls back to the system font.
- The circle sits one frame behind the real mouse. Fast flicks show a tiny gap. Hiding the native cursor makes that hard to notice, but it's there.
- Over a mid-grey (#808080), "difference" gives almost the same grey back, so the circle disappears. Not an issue on this page, but it would be on a photo.
- If the script fails to load, the native cursor is still hidden and you get no cursor at all.
- The cursor ignores the button. It doesn't grow or react when you hover. That would be the obvious next thing.

## Break it on purpose

- Set `--press-scale: 0.8`. It stops feeling like a button and starts feeling like a toy. Then try `--release-ease: ease` and notice the spring is gone.
- Set `--cursor-lag: 200ms` and try clicking the button quickly. That's why it's 0.
