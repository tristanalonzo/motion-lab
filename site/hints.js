// The readout in the bottom left: two keycaps that press themselves as you
// step through the list. Press ↓ and the ↓ cap goes down. Scroll down and it
// goes down too, which is how the corner says the wheel and the key do the
// same thing. A word slides out beside them to say what just happened: "next",
// "previous" or "scroll". It only shows because you did something, so it's
// still a readout and not a label.
//
// It doesn't listen for keys itself. nav.js shouts "lab:step" every time it
// steps, and this just reflects it, so the rules about when a key or a scroll
// counts (not while you're typing, not when an experiment has claimed the
// event) stay in nav.js where they already are.
//
// data-state on each cap is the one source of truth; hints.css draws it:
//   idle      resting
//   pressed   held down
//
// And on each word:
//   idle      hidden behind the caps
//   shown     out beside them
//   cut       hidden at once, because another word just replaced it

const up = document.querySelector(".hints-key-up");
const down = document.querySelector(".hints-key-down");
const words = document.querySelectorAll(".hints-word");

// Settings live in hints.css's :root, like every other tunable.
function readSetting(name) {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
}

const releaseTimers = new Map();
let wordTimer = null;

export function startHints() {
  window.addEventListener("lab:step", (e) => {
    const goingUp = e.detail.direction < 0;
    press(goingUp ? up : down);

    // A trackpad counts as the wheel too: nav.js sends both as "wheel".
    if (e.detail.by === "wheel") showWord("scroll");
    else showWord(goingUp ? "previous" : "next");
  });

  // One press on its own, a moment after the page has settled, so the corner
  // isn't something you could sit in front of all day and never notice.
  // Skipped when the visitor has asked for less movement: to them it would be
  // a cap changing colour for no reason they can see.
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setTimeout(() => {
      press(down);
      showWord("next");
    }, readSetting("--hints-demo-wait"));
  }
}

// Every step pushes the hide further out, the same way a held cap stays down.
// A word that's being replaced is cut, not slid away, so two words are never
// on top of each other.
function showWord(name) {
  words.forEach((word) => {
    if (word.dataset.word === name) word.dataset.state = "shown";
    else if (word.dataset.state === "shown") word.dataset.state = "cut";
  });

  clearTimeout(wordTimer);
  wordTimer = setTimeout(hideWords, readSetting("--hints-word-hold"));
}

function hideWords() {
  words.forEach((word) => {
    word.dataset.state = "idle";
  });
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
