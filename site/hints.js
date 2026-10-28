// The readout in the bottom left: two keycaps that press themselves as you
// step through the list. Press ↓ and the ↓ cap goes down. Scroll down and it
// goes down too, which is how the corner says the wheel and the key do the
// same thing — without a line of text saying so.
//
// It doesn't listen for keys itself. nav.js shouts "lab:step" every time it
// steps, and this just reflects it, so the rules about when a key or a scroll
// counts (not while you're typing, not when an experiment has claimed the
// event) stay in nav.js where they already are.
//
// data-state on each cap is the one source of truth; hints.css draws it:
//   idle      resting
//   pressed   held down

const up = document.querySelector(".hints-key-up");
const down = document.querySelector(".hints-key-down");

// Settings live in hints.css's :root, like every other tunable.
function readSetting(name) {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
}

const releaseTimers = new Map();

export function startHints() {
  window.addEventListener("lab:step", (e) => {
    press(e.detail.direction < 0 ? up : down);
  });

  // One press on its own, a moment after the page has settled, so the corner
  // isn't something you could sit in front of all day and never notice.
  // Skipped when the visitor has asked for less movement: to them it would be
  // a cap changing colour for no reason they can see.
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setTimeout(() => press(down), readSetting("--hints-demo-wait"));
  }
}

// Holding a key down, or mashing it, keeps the cap down: each step pushes the
// release further out. That's also why nothing here has to restart a
// half-finished animation — a key that's already down just stays down.
function press(cap) {
  const other = cap === up ? down : up;
  release(other); // you're not holding both at once

  cap.dataset.state = "pressed";
  clearTimeout(releaseTimers.get(cap));
  releaseTimers.set(cap, setTimeout(() => release(cap), readSetting("--hints-press-hold")));
}

function release(cap) {
  clearTimeout(releaseTimers.get(cap));
  releaseTimers.delete(cap);
  cap.dataset.state = "idle";
}
