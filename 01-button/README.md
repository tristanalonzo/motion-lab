# 01 — Button

A black iOS-style Submit button, dead center on a white page, that dips when you press it and springs back. The mouse is replaced by a circle that inverts whatever it's over.

## States

| Element | From    | To      | Duration | Easing                              | What moves                          |
|---------|---------|---------|----------|-------------------------------------|-------------------------------------|
| button  | idle    | pressed | 80ms     | `ease-out`                          | scale 1 → 0.96, opacity 1 → 0.75    |
| button  | pressed | idle    | 220ms    | `cubic-bezier(0.2, 0.9, 0.3, 1.2)`  | scale 0.96 → 1 (slight overshoot), opacity 0.75 → 1 |
| cursor  | hidden  | visible | 150ms    | `ease`                              | opacity 0 → 1 (mouse enters window) |
| cursor  | visible | hidden  | 150ms    | `ease`                              | opacity 1 → 0 (mouse leaves window) |
| cursor  | —       | —       | ~67ms behind | spring (stiffness 300, damping 20) | follows the mouse; overshoots ~32px after a fast flick, settles in ~0.57s |

The button is triggered by pointer (mouse, touch, pen) and by Space/Enter on the keyboard. The cursor only appears with a real mouse.

## Decisions

- **Press is fast, release is slow.** Going down should feel like it's under your finger, so it gets 80ms. Coming back up is the part you actually watch, so it gets more time and a small overshoot.
- **0.96, not 0.9.** iOS buttons barely move. At 0.9 the button reads as "shrinking", not "being pressed".
- **Dim and shrink together.** iOS mostly dims. The tiny scale adds the physical feel. Each one alone looks flat.
- **Inter, not SF.** SF Pro can't be loaded on the web outside Apple devices. Inter is the closest free match. Its letter-spacing is pulled in slightly so it sits closer to SF.
- **Squircle radius is bigger than the fallback.** A squircle corner eases in gradually, so at the same radius it looks sharper. 20px squircle ≈ 14px circle by eye.
- **The cursor inverts with `mix-blend-mode: difference`, not with JS.** A white circle set to "difference" flips every color under it, including the button's label, for free. No color math in code.
- **The cursor follows on a spring, in JS, not a CSS transition.** A transition starts over from zero speed every time the mouse moves, so it can only lag, never overshoot. A spring keeps its speed between frames, and that leftover speed is the overshoot. This is the first thing in the repo CSS can't express on its own.
- **Stiffness 300, damping 20.** Started at 1000/45 (45ms, 6px overshoot), which felt too tight. This gives one clear overshoot with a faint second dip. The delay works out to about 67ms (damping ÷ stiffness). Going looser (200/14: 55px overshoot) takes almost a second to settle, which starts to feel floaty.
- **The spring settings live in CSS but are read by JS.** That keeps every tunable in one place. JS reads them every frame, so you can drag the numbers in DevTools and feel the change live.
- **28px circle.** Big enough to read as a shape, small enough that you can still aim with it.
- **No dark mode.** The page is meant to be black-on-white. The cursor already gives you the inverted version.

## Rough edges

- `corner-shape: squircle` is still new. Browsers that don't support it show plain rounded corners. Chrome/Edge draw the real squircle.
- The button doesn't do anything when clicked. That's fine for now; it's a press study.
- Sliding your finger off cancels the press immediately. Real iOS gives you some slack before it lets go.
- Inter loads from Google Fonts, so with no internet it falls back to the system font.
- The delay is in time, so it grows with speed. A slow drag looks glued; a very fast flick can leave the circle 200px behind for a moment. That's intended, but it's worth knowing.
- The real mouse stops at the edge of the window, but the circle's overshoot doesn't. Flick into an edge and it pokes out before pulling back.
- Over a mid-grey (#808080), "difference" gives almost the same grey back, so the circle disappears. Not an issue on this page, but it would be on a photo.
- If the script fails to load, the native cursor is still hidden and you get no cursor at all.
- The cursor ignores the button. It doesn't grow or react when you hover. That would be the obvious next thing.

## Break it on purpose

- Set `--press-scale: 0.8`. It stops feeling like a button and starts feeling like a toy. Then try `--release-ease: ease` and notice the spring is gone.
- Set `--cursor-damping: 10`. The circle turns to jelly and wobbles around the mouse. Then try `90`: no overshoot at all, just a sluggish drag.
- Set `--cursor-stiffness: 80` and try clicking the button quickly. The circle arrives after you've already clicked, which is the limit on how loose this can go.
