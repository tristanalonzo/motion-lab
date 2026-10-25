// The site's starting point. index.html loads only this file.
//
// It starts the cursor and the list, then keeps three things agreeing:
//   the list         which row is selected
//   the stage        which experiment is on screen
//   the address bar  #001-submit-button, so links and refreshes land right

import { EXPERIMENTS } from "./experiments.js";
import { startCursor, refreshCursor } from "./cursor.js";
import { createNav } from "./nav.js";
import { showExperiment, showTitle } from "./stage.js";

startCursor();


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


// ---------- the list drives everything ----------

let previous = 0; // the row selected before this one, to know which way the list moved

const nav = createNav(EXPERIMENTS, (index) => {
  const experiment = EXPERIMENTS[index];

  // replaceState changes the address without reloading and without adding a
  // Back-button step. Scrolling past 30 experiments shouldn't take 30 Backs to undo.
  history.replaceState(null, "", addressFor(experiment));
  document.title = index === 0
    ? "tristan’s motion lab"
    : `${experiment.number} — ${experiment.name} · tristan’s motion lab`;

  // The name above the experiment. Not on the front page: that's the lab
  // itself, and the site title already says so.
  showTitle(index === 0 ? "" : experiment.name, Math.sign(index - previous) || 1);
  previous = index;

  // The neighbours get their files fetched early, so stepping to them is instant.
  showExperiment(experiment, [EXPERIMENTS[index - 1], EXPERIMENTS[index + 1]]);
  refreshCursor(); // whatever is under a still mouse may have just changed
});

// Open on whatever the address says.
nav.select(indexFromAddress());

// The address changed some other way: typed by hand, or a link like
// <a href="#003"> clicked inside an experiment.
window.addEventListener("hashchange", () => nav.select(indexFromAddress()));

// The title goes home without a page load.
document.querySelector(".site-title").addEventListener("click", (e) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let "open in new tab" through
  e.preventDefault();
  nav.select(0);
});
