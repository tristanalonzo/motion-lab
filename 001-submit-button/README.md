# 001 — Submit button

A black iOS-style Submit button, dead center on an off-white page, that dips when you press it and springs back. The mouse is replaced by a circle that inverts whatever it's over, and morphs into a pointing hand over anything clickable.

## States

| Element | From    | To      | Duration | Easing                              | What moves                          |
|---------|---------|---------|----------|-------------------------------------|-------------------------------------|
| button  | idle    | pressed | 80ms     | `ease-out`                          | scale 1 → 0.96, opacity 1 → 0.75    |
| button  | pressed | idle    | 220ms    | `cubic-bezier(0.2, 0.9, 0.3, 1.2)`  | scale 0.96 → 1 (slight overshoot), opacity 0.75 → 1 |
| cursor  | hidden  | circle / hand | 150ms | `ease`                         | opacity 0 → 1 (mouse enters window) |
| cursor  | circle / hand | hidden | 150ms | `ease`                         | opacity 1 → 0 (mouse leaves window) |
| cursor  | circle  | hand    | 260ms    | `cubic-bezier(0.3, 1.3, 0.5, 1)`    | outline morphs circle → hand (slight overshoot), fingertip on the mouse tip |
| cursor  | hand    | circle  | 260ms    | `cubic-bezier(0.3, 1.3, 0.5, 1)`    | outline morphs hand → circle        |
| cursor  | —       | —       | ~53ms behind | spring (stiffness 600, damping 32) | follows the mouse; overshoots ~15px after a fast flick, settles in ~0.4s |

The button is triggered by pointer (mouse, touch, pen) and by Space/Enter on the keyboard. The cursor only appears with a real mouse.

## Decisions

- **Press is fast, release is slow.** Going down should feel like it's under your finger, so it gets 80ms. Coming back up is the part you actually watch, so it gets more time and a small overshoot.
- **0.96, not 0.9.** iOS buttons barely move. At 0.9 the button reads as "shrinking", not "being pressed".
- **Dim and shrink together.** iOS mostly dims. The tiny scale adds the physical feel. Each one alone looks flat.
- **San Francisco where it exists, Inter everywhere else.** On Apple devices the font stack picks up the real system font (SF). It also uses SF Pro if it's installed on Windows. SF can't legally be loaded from the web, so everything else gets Inter, the closest free match. Its letter-spacing is pulled in slightly so it sits closer to SF.
- **Regular weight on the button, medium on the title.** Semibold (the iOS default) read as too heavy. The title is one step firmer than the button so it reads as a heading without being bold.
- **Off-white is `#F5F5F7`.** It's the light grey Apple uses behind its own product pages. Pure white against a pure black button felt harsh.
- **Squircle radius is bigger than the fallback.** A squircle corner eases in gradually, so at the same radius it looks sharper. 20px squircle ≈ 14px circle by eye.
- **The cursor inverts with `mix-blend-mode: difference`, not with JS.** A white circle set to "difference" flips every color under it, including the button's label, for free. No color math in code.
- **The cursor follows on a spring, in JS, not a CSS transition.** A transition starts over from zero speed every time the mouse moves, so it can only lag, never overshoot. A spring keeps its speed between frames, and that leftover speed is the overshoot. This is the first thing in the repo CSS can't express on its own.
- **Stiffness 600, damping 32.** Started at 1000/45 (45ms delay, 6px overshoot), which felt too tight. Then tried 300/20 (67ms, 32px), which went too far. This lands about a third of the way between them: 53ms delay (damping ÷ stiffness), 15px overshoot, one clear swing past the mouse.
- **The spring settings live in CSS but are read by JS.** That keeps every tunable in one place. JS reads them every frame, so you can drag the numbers in DevTools and feel the change live.
- **28px circle.** Big enough to read as a shape, small enough that you can still aim with it.
- **The morph works because both shapes are built from the same 13 curves.** The circle's 13 points are spaced around it in proportion to how far apart they are on the hand. So the top of the circle becomes the fingertip, the right side becomes the palm, and so on, with no twisting halfway. Each point slides straight to its partner.
- **The hand has no corners at all.** Every point where two curves meet shares one direction, so the outline never kinks. The wrist, thumb tip, thumb notch and knuckle step are all rounded. The first version had a sharp wrist corner and a tight notch, like the reference image. It's 28px tall, the same as the circle, so neither one feels bigger.
- **Fingertip on the mouse, not the hand's center.** You aim with the tip of your finger, the same as the system hand cursor.
- **SVG path, not `clip-path`.** The first version cut the shape out of a white box with `clip-path`. On screens scaled to 125%/150%/175% that left a faint hairline around the box. Drawing the shape as an SVG path doesn't.
- **"Clickable" means `a, button, [role='button'], label, select, summary`.** That's the `CLICKABLE` list in script.js.
- **No dark mode.** The page is meant to be black-on-white. The cursor already gives you the inverted version.

## Rough edges

- `corner-shape: squircle` is still new. Browsers that don't support it show plain rounded corners. Chrome/Edge draw the real squircle.
- The button doesn't do anything when clicked. That's fine for now; it's a press study.
- Sliding your finger off cancels the press immediately. Real iOS gives you some slack before it lets go.
- Inter loads from Google Fonts, so with no internet it falls back to the system font.
- The delay is in time, so it grows with speed. A slow drag looks glued; a very fast flick can leave the circle 150px behind for a moment. That's intended, but it's worth knowing.
- The real mouse stops at the edge of the window, but the circle's overshoot doesn't. Flick into an edge and it pokes out before pulling back.
- Over a mid-grey (#808080), "difference" gives almost the same grey back, so the circle disappears. Not an issue on this page, but it would be on a photo.
- If the script fails to load, the native cursor is still hidden and you get no cursor at all.
- The hand morph needs a browser that can set an SVG path's shape from CSS (Chrome, Edge, Firefox). Safari can't yet, so it stays a circle there.
- The hand doesn't react to the press. When the button dips, the hand stays still. A small squish would sell it.
- Something made clickable only with JavaScript (a `div` with a click handler) won't get the hand unless it's added to `CLICKABLE`.
- The hand appears on the next mouse move. If the button slides under a still mouse, the cursor doesn't update until you move.
- The hand outline was generated by a small script, not drawn in a tool. Changing it by hand means keeping all 13 curves in the same order.
- The component list on the left (shared, from `../nav.js`) is hidden below 900px wide, so phones have no way to move between components yet.
- The "tristan's motion lab" title is plain text, not a link. It will need to become one once this is part of the portfolio.

## Break it on purpose

- Set `--press-scale: 0.8`. It stops feeling like a button and starts feeling like a toy. Then try `--release-ease: ease` and notice the spring is gone.
- Set `--cursor-damping: 10`. The circle turns to jelly and wobbles around the mouse. Then try `90`: no overshoot at all, just a sluggish drag.
- Set `--cursor-morph-duration: 1200ms` and slowly hover on and off the button. You'll see the circle stretch down into the palm and the thumb grow out of its left side.
- Set `--cursor-stiffness: 80` and try clicking the button quickly. The circle arrives after you've already clicked, which is the limit on how loose this can go.
