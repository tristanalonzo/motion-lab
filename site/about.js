// The about panel: a little window with notes on the open experiment.
//
// The window and its button are in index.html; this file opens, closes, fills
// and drags it. The text comes from an `about.html` in the experiment's own
// folder, fetched the first time you open the panel on it and remembered after.
// So this works the same at 400 experiments: only the one you're on is loaded.
//
// data-state on the panel is the one source of truth; about.css reacts to it:
//   closed   out of the way, out of reach of the mouse and the Tab key
//   open     on screen
// data-dragging is on it only while you're holding the title bar.

import { setCursorOverride } from "./cursor.js";

const button = document.querySelector(".tool-about");
const panel = document.querySelector(".about-panel");
const bar = panel.querySelector(".about-bar");
const closeButton = panel.querySelector(".about-close");
const numberEl = panel.querySelector(".about-number");
const nameEl = panel.querySelector(".about-name");
const content = panel.querySelector(".about-body");

// Settings live in about.css's :root, like every other tunable.
function readSetting(name) {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
}

let experiment = null;     // the one the list is on
let ticket = 0;            // goes up by one every time the panel opens or closes; see fill()
let loadingTimer = null;
const textCache = new Map(); // about.html's address -> the fetch of it


// ---------- what main.js calls ----------

export function updateAbout(next) {
  experiment = next;

  // The panel is about one experiment, so switching shuts it. Leaving it open
  // would either show the wrong notes under the new name, or flash through
  // five sets of notes while you scroll past five experiments.
  close();

  // A planned experiment has no folder, so there's nothing to read.
  // disabled stops the click, the Tab key and the cursor's hand all at once;
  // data-state does the fading (toolbar.css).
  const planned = !next.folder;
  button.disabled = planned;
  button.dataset.state = planned ? "disabled" : "ready";
}


// ---------- opening and closing ----------

function open() {
  if (!experiment?.folder) return;
  if (panel.dataset.state === "open") return;

  numberEl.textContent = experiment.number;
  nameEl.textContent = experiment.name;

  // Roughly in place to start with. The text arrives a moment later and
  // changes how tall the window is, and fit() puts it right (see below).
  if (!positioned) home();
  fill(experiment);

  panel.dataset.state = "open";
  button.setAttribute("aria-expanded", "true");

  // Hand the keyboard the text itself, so the arrow keys scroll it straight
  // away and Tab goes on to the X.
  content.focus();
}

function close() {
  if (panel.dataset.state === "closed") return;
  panel.dataset.state = "closed";
  button.setAttribute("aria-expanded", "false");
  clearTimeout(loadingTimer);
  ticket += 1;                                 // a fetch still running isn't wanted any more
  endDrag();

  // Give the keyboard back to the button, but only if it's still in here:
  // closing shouldn't yank focus out of whatever you moved on to.
  if (panel.contains(document.activeElement)) button.focus();
}

button.addEventListener("click", () => {
  if (panel.dataset.state === "open") close();
  else open();
});

closeButton.addEventListener("click", close);

// Escape shuts it from anywhere on the page, not just from inside it.
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") close();
});

// Clicking the page does NOT shut it. It's a window, not a pop-up: it stays
// until you close it, so you can read it while poking at the experiment.


// ---------- the text ----------

async function fill(target) {
  const myTicket = ++ticket;
  const url = new URL(`../${target.folder}/about.html`, import.meta.url);

  if (!textCache.has(url.href)) {
    textCache.set(url.href, fetch(url)
      // No about.html yet is a normal thing, not a breakage: say so in the panel.
      .then((response) => (response.ok ? response.text() : null))
      .catch((error) => {
        textCache.delete(url.href);            // a network hiccup shouldn't stick; try again next open
        throw error;
      }));
  }

  // Only say "loading" if it's actually slow, so the usual instant load never flickers.
  loadingTimer = setTimeout(() => {
    if (myTicket === ticket) say("loading");
  }, readSetting("--about-loading-delay"));

  let html;
  try {
    html = await textCache.get(url.href);
  } catch (error) {
    console.error(error);
    html = null;
  }

  // While we waited, the panel may have closed or moved on.
  if (myTicket !== ticket) return;
  clearTimeout(loadingTimer);

  if (html === null) {
    // No about.html yet is a normal thing, not a breakage.
    content.innerHTML = `<p class="about-dim">no notes for this one yet.</p>`;
  } else {
    // Our own file, from our own folder, so putting it in as HTML is safe.
    content.innerHTML = html;
  }

  content.scrollTop = 0;                       // a new experiment starts at the top
  fit(true);
}

// The "loading" line. Not the final text, so fit() doesn't treat it as the
// height to settle on.
function say(words) {
  content.innerHTML = `<p class="about-dim">${words}</p>`;
  fit(false);
}


// ---------- where the window sits ----------

const position = { x: 0, y: 0 };
let positioned = false;    // has it been put in place with its real text in?

// Where it opens: over on the right, level with the middle. Not in the middle
// of the screen — that's where the experiment is, and the point of the panel
// is to read about the thing while you're watching it.
function home() {
  moveTo(innerWidth - panel.offsetWidth - readSetting("--about-home-inset"),
         (innerHeight - panel.offsetHeight) / 2);
}

// Called whenever the text changes, because the text is what decides how tall
// the window is. The first time the real text is in, the window goes home at
// that height. After that it only gets pulled back inside the screen, so a
// window you dragged somewhere stays where you put it, like a real one.
function fit(isFinalText) {
  if (positioned) {
    moveTo(position.x, position.y);
    return;
  }
  home();
  positioned = isFinalText;
}

// offsetWidth/offsetHeight, not getBoundingClientRect(): those two ignore the
// scale the window is in the middle of animating, so the maths doesn't wobble
// while it opens.
function moveTo(x, y) {
  const margin = readSetting("--about-margin");
  // Math.max(..., margin) for a window taller or wider than the screen:
  // then there's nowhere to put it but the top left corner.
  const maxX = Math.max(innerWidth - panel.offsetWidth - margin, margin);
  const maxY = Math.max(innerHeight - panel.offsetHeight - margin, margin);

  position.x = Math.min(Math.max(x, margin), maxX);
  position.y = Math.min(Math.max(y, margin), maxY);
  panel.style.left = position.x + "px";
  panel.style.top = position.y + "px";
}

// Made the browser window smaller? Pull the panel back inside. It never
// re-centers: the spot you dragged it to is yours.
window.addEventListener("resize", () => {
  if (positioned) moveTo(position.x, position.y);
});


// ---------- dragging it by the title bar ----------

let grab = null;   // where inside the window you took hold of it

bar.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;                     // left button only
  if (e.target.closest(".about-close")) return;   // the X is a button, not a handle

  grab = { x: e.clientX - position.x, y: e.clientY - position.y };
  // Pointer capture: every move now comes to the bar, even once the pointer
  // has run off it, so a fast drag doesn't drop the window halfway.
  bar.setPointerCapture(e.pointerId);
  panel.dataset.dragging = "true";
  setCursorOverride("hand");                      // stays a hand wherever the drag goes
  e.preventDefault();                             // no text getting selected mid-drag
});

bar.addEventListener("pointermove", (e) => {
  if (!grab) return;
  moveTo(e.clientX - grab.x, e.clientY - grab.y);
});

bar.addEventListener("pointerup", endDrag);
bar.addEventListener("pointercancel", endDrag);

function endDrag() {
  if (!grab) return;
  grab = null;
  delete panel.dataset.dragging;
  setCursorOverride(null);
}


// ---------- keeping the list's gestures out ----------

// nav.js listens for all three on window, so stopping them at the panel is
// enough: inside here they belong to the text, not to the list.
for (const type of ["wheel", "touchstart", "touchmove"]) {
  panel.addEventListener(type, (e) => e.stopPropagation(), { passive: true });
}

// The arrow keys scroll the text instead of stepping the list. Escape is left
// alone, so the listener above still gets it.
panel.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === "ArrowDown") e.stopPropagation();
});
