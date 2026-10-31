// The toolbar at the bottom middle. The buttons themselves are in index.html;
// this keeps them pointing at whichever experiment is open.
//
// The i button is about.js's. This file looks after the other two:
//   </>    a link to the open experiment's folder on GitHub
//   reset  reloads the open experiment fresh, once it has something to reset

import { resetExperiment } from "./stage.js";

const REPO = "https://github.com/tristanalonzo/motion-lab/tree/main/";

const codeLink = document.querySelector(".tool-code");
const resetButton = document.querySelector(".tool-reset");
const resetIcon = resetButton.querySelector("svg");

export function updateToolbar(experiment) {
  if (experiment.folder) {
    codeLink.href = REPO + experiment.folder;
    codeLink.dataset.state = "ready";
    codeLink.removeAttribute("aria-disabled");
  } else {
    // A planned experiment has no folder yet, so there's nothing to show.
    // A link with no href can't be clicked, tabbed to, or turn the cursor
    // into a hand: the browser treats it as plain text.
    codeLink.removeAttribute("href");
    codeLink.dataset.state = "disabled";
    codeLink.setAttribute("aria-disabled", "true");
  }
}


// ---------- reset ----------

// stage.js shouts "lab:resettable" whenever the open experiment starts or
// stops looking different from how it started. This just follows along.
window.addEventListener("lab:resettable", (e) => {
  const on = e.detail.resettable;
  // disabled stops the click, the Tab key and the cursor's hand all at once;
  // data-state does the fading (toolbar.css).
  resetButton.disabled = !on;
  resetButton.dataset.state = on ? "ready" : "disabled";
});

// Each click adds one full turn to the icon. CSS rotates it by --turns, and
// its transition animates the change, so the arrow spins round once.
// Counting up (instead of flipping between 0 and 1) means every click is
// another turn the same way, never a spin back.
let turns = 0;

resetButton.addEventListener("click", () => {
  turns += 1;
  resetIcon.style.setProperty("--turns", turns);
  resetExperiment();
});
