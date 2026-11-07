// The site's starting point. index.html loads only this file.
//
// It starts the cursor and the list, then keeps three things agreeing:
//   the list         which row is selected
//   the stage        which experiment is on screen
//   the address bar  #001-submit-button, so links and refreshes land right

import { EXPERIMENTS } from "./experiments.js";
import { startCursor, refreshCursor } from "./cursor.js";
import { createNav } from "./nav.js";
import { showExperiment } from "./stage.js";
import { updateToolbar } from "./toolbar.js";
import { updateAbout } from "./about.js";
import { startSocials } from "./socials.js";
import { startHints } from "./hints.js";
import { startTuning } from "./tuning.js";

startCursor();
startSocials();
startHints();
startTuning();


// ---------- the address bar ----------
// The part after # says which experiment is open: #001-submit-button.
// A short #001 works too. No # at all means 000, the front page.

function indexFromAddress() {
  const id = decodeURIComponent(location.hash.slice(1));
  const index = EXPERIMENTS.findIndex((e) => e.folder === id || e.number === id);
  return index === -1 ? 0 : index; // empty or unknown: the front page
}

function addressFor(experiment) {
  if (experiment.number === "000") return location.pathname; // front page: plain address, no #
  return "#" + (experiment.folder || experiment.number);
}


// ---------- Back and Forward ----------
// Back takes you to the experiment you were on before, not off the site.
//
// Two ways to change the address without reloading the page:
//   pushState     adds a new Back step
//   replaceState  rewrites the current one
//
// A click on a row or the title is always its own step. Scrolling is not one
// step per row: scrolling past five rows on the way to the sixth shouldn't
// take five Backs to undo. So a burst of steps (wheel, keys or swipes, each
// less than --history-pause after the last) adds one Back step when it
// starts, and then just keeps that step's address up to date.

let isStep = false;               // set by nav.js's "lab:step" just before it selects
let lastStepTime = -Infinity;

window.addEventListener("lab:step", (e) => {
  if (!e.detail.atEnd) isStep = true; // at an end nothing gets selected, so nothing to mark
});

function rememberAddress(index) {
  const address = addressFor(EXPERIMENTS[index]);
  const wasStep = isStep;
  isStep = false;

  // The address already says this experiment. That's the page opening,
  // Back/Forward, or a #link typed or clicked: the browser has already done
  // its history part. Only tidy the spelling (#001 → #001-submit-button).
  if (indexFromAddress() === index) {
    history.replaceState(null, "", address);
    return;
  }

  let newStep = true;
  if (wasStep) {
    const now = performance.now();
    const pause = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--history-pause"));
    newStep = now - lastStepTime > pause;
    lastStepTime = now;
  } else {
    lastStepTime = -Infinity; // a click ends any burst; the next scroll starts a new step
  }

  if (newStep) history.pushState(null, "", address);
  else history.replaceState(null, "", address);
}


// ---------- the list drives everything ----------

const nav = createNav(EXPERIMENTS, (index) => {
  const experiment = EXPERIMENTS[index];

  rememberAddress(index);
  document.title = index === 0
    ? "tristan’s motion lab"
    : `${experiment.number} — ${experiment.name} · tristan’s motion lab`;

  // The neighbours get their files fetched early, so stepping to them is instant.
  showExperiment(experiment, [EXPERIMENTS[index - 1], EXPERIMENTS[index + 1]]);
  updateToolbar(experiment);
  updateAbout(experiment); // shuts the panel: its notes are about one experiment
  refreshCursor(); // whatever is under a still mouse may have just changed
});

// Open on whatever the address says.
nav.select(indexFromAddress());

// The address changed some other way: Back or Forward, typed by hand, or a
// link like <a href="#003"> clicked inside an experiment. Browsers don't
// agree on which of these two events each of those sends, so listen for
// both. Selecting the row that's already selected does nothing, so getting
// both is harmless.
window.addEventListener("popstate", () => nav.select(indexFromAddress()));
window.addEventListener("hashchange", () => nav.select(indexFromAddress()));

// The title goes home without a page load.
document.querySelector(".site-title").addEventListener("click", (e) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let "open in new tab" through
  e.preventDefault();
  nav.select(0);
});
