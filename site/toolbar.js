// The toolbar at the bottom middle. The buttons themselves are in index.html;
// this keeps them pointing at whichever experiment is open.
//
// For now it holds one button: a link to the open experiment's folder on GitHub.

const REPO = "https://github.com/tristanalonzo/motion-lab/tree/main/";

const sourceLink = document.querySelector(".tool-source");


// ---------- the cat ----------
// The jump is CSS keyframe animations (toolbar.css), all sitting paused.
// Here we only press play, forwards or backwards. The browser hands us each
// CSS animation as an object we can steer, no library needed.

let hovered = false;
let focused = false;

function catAnimations() {
  return sourceLink
    .getAnimations({ subtree: true })              // the link's and everything inside it
    .filter((a) => a.animationName?.startsWith("source-")); // only the jump, not the press transition
}

function setOpen(open) {
  if (sourceLink.dataset.state === "disabled") return;
  const state = open ? "open" : "ready";
  if (sourceLink.dataset.state === state) return;  // e.g. hovered while already focused
  sourceLink.dataset.state = state;

  // Read from CSS every time, so DevTools changes apply on the next hover.
  const rewind = parseFloat(getComputedStyle(sourceLink).getPropertyValue("--source-rewind")) || 1;

  for (const animation of catAnimations()) {
    // Left before it even started? Nothing to undo. (Playing backwards from
    // the very start makes the browser jump to the end first, then rewind.)
    if (!open && !animation.currentTime) continue;
    // A negative speed plays it backwards, from wherever it is right now.
    animation.playbackRate = open ? 1 : -rewind;
    animation.play();
  }
}

const update = () => setOpen(hovered || focused);

sourceLink.addEventListener("pointerenter", () => { hovered = true; update(); });
sourceLink.addEventListener("pointerleave", () => { hovered = false; update(); });
sourceLink.addEventListener("focus", () => { focused = true; update(); });
sourceLink.addEventListener("blur", () => { focused = false; update(); });


// ---------- following the open experiment ----------

export function updateToolbar(experiment) {
  if (experiment.folder) {
    sourceLink.href = REPO + experiment.folder;
    if (sourceLink.dataset.state === "disabled") sourceLink.dataset.state = "ready";
    sourceLink.removeAttribute("aria-disabled");
  } else {
    // Switched to a planned one with the cat out (scrolling with the mouse
    // still on the button): send it home before going grey.
    setOpen(false);
    // A planned experiment has no folder yet, so there's nothing to show.
    // A link with no href can't be clicked, tabbed to, or turn the cursor
    // into a hand: the browser treats it as plain text.
    sourceLink.removeAttribute("href");
    sourceLink.dataset.state = "disabled";
    sourceLink.setAttribute("aria-disabled", "true");
    hovered = focused = false;
  }
}
