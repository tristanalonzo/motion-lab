// The stage: the middle of the screen, where experiments appear.
//
// One experiment is on screen at a time, inside its own sealed box. The box
// is a "shadow root": a piece of the page with its own private CSS. The
// experiment's CSS can't leak out of it, and the site's CSS can't reach in.
//
// The life of an experiment:
//   1. selected   the one on screen starts fading out right away
//   2. settled    the list has rested on it for a moment (--stage-settle)
//   3. loaded     its files are fetched (instant if they were preloaded)
//   4. mounted    its markup goes in a new box, its mount() runs, it fades in
//   5. unmounted  something else was selected: its cleanup runs, it fades
//                 out, and its box is deleted along with everything inside
//
// data-state on each box is the one source of truth; site.css reacts to it:
//   loading  built but hidden, waiting for its CSS to arrive
//   shown    on screen
//   leaving  fading out, about to be deleted

import { setCursorOverride, refreshCursor } from "./cursor.js";

const area = document.querySelector(".stage-area");
const message = document.querySelector(".stage-message");

// The defaults every box gets before the experiment's own CSS (see that file).
const BASE_CSS = new URL("experiment-base.css", import.meta.url).href;

// Settings live in site.css's :root, like every other tunable.
function readSetting(name) {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
}

let current = null;      // the experiment on screen: { box, controller, cleanup }
let ticket = 0;          // goes up by one on every selection; see enter()
let settleTimer = null;
let loadingTimer = null;


// ---------- what main.js calls ----------

export function showExperiment(experiment, neighbours) {
  ticket += 1;
  clearTimeout(settleTimer);
  clearTimeout(loadingTimer);
  leave();

  if (!experiment.folder) {
    say("coming soon");
    return;
  }

  say("");
  // Wait until the list rests here. Scrolling fast past twenty experiments
  // shouldn't load all twenty.
  const myTicket = ticket;
  settleTimer = setTimeout(() => enter(experiment, neighbours, myTicket), readSetting("--stage-settle"));
}


// ---------- coming in ----------

async function enter(experiment, neighbours, myTicket) {
  // Only say "loading" if it's actually slow, so fast loads never flicker.
  loadingTimer = setTimeout(() => say("loading"), readSetting("--stage-loading-delay"));

  try {
    const files = await load(experiment);

    // While we waited, the list may have moved on. Every selection bumps
    // ticket, so if it's changed, this experiment isn't wanted any more.
    if (myTicket !== ticket) return;

    const box = await build(files);
    if (myTicket !== ticket) {
      box.remove();
      return;
    }

    clearTimeout(loadingTimer);
    say("");
    mount(box, files.module);
  } catch (error) {
    if (myTicket !== ticket) return;
    clearTimeout(loadingTimer);
    say(`${experiment.number} didn’t load. The browser console says why.`);
    console.error(error);
    return;
  }

  // Get the neighbours' files ready, so stepping to them is instant.
  // Only their files: they don't run until they're actually selected.
  for (const neighbour of neighbours) {
    if (neighbour?.folder) load(neighbour).catch(() => {}); // a broken neighbour can complain when it's selected
  }
}

// Fetch an experiment's three files. Safe to call twice: everything is
// remembered, so the second call is instant.
const markupCache = new Map(); // folder address -> the fetch of its markup.html

function load(experiment) {
  const folder = new URL(`../${experiment.folder}/`, import.meta.url);

  // Remember the fetch itself (not just its result), so a preload that's
  // still running and a real load share one request.
  if (!markupCache.has(folder.href)) {
    markupCache.set(folder.href, fetch(new URL("markup.html", folder)).then((response) => {
      if (!response.ok) throw new Error(`${response.status} for ${response.url}`);
      return response.text();
    }));
  }

  return Promise.all([
    markupCache.get(folder.href),
    // import() loads a JavaScript file and gives back what it exports.
    // The browser remembers it: importing the same file again is instant.
    import(new URL("script.js", folder).href),
    // Only to get the CSS into the browser's cache early. The box links it for real.
    fetch(new URL("style.css", folder)),
  ]).then(([markup, module]) => ({ folder, markup, module }));
}

// Make the sealed box, fill it, and wait for its CSS.
async function build(files) {
  const box = document.createElement("div");
  box.className = "stage";
  box.dataset.state = "loading";
  const root = box.attachShadow({ mode: "open" }); // the sealed part

  // CSS: the shared defaults first, then the experiment's own, so its rules win.
  const base = stylesheet(BASE_CSS);
  const own = stylesheet(new URL("style.css", files.folder).href);

  // Markup. A <template> turns the text into elements without running or
  // loading anything yet.
  const template = document.createElement("template");
  template.innerHTML = files.markup;

  // Paths in markup.html are written from the experiment's folder, like
  // <img src="photo.jpg">. Inside the main page they'd point at the site's
  // root instead, so turn each src into a full address first.
  for (const element of template.content.querySelectorAll("[src]")) {
    element.setAttribute("src", new URL(element.getAttribute("src"), files.folder).href);
  }

  root.append(base.link, own.link, template.content);
  area.append(box);

  try {
    await Promise.all([base.loaded, own.loaded]);
  } catch (error) {
    box.remove();
    throw error;
  }
  return box;
}

function stylesheet(href) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  const loaded = new Promise((resolve, reject) => {
    link.addEventListener("load", resolve);
    link.addEventListener("error", () => reject(new Error(`couldn't load ${href}`)));
  });
  return { link, loaded };
}

function mount(box, module) {
  if (typeof module.mount !== "function") {
    box.remove();
    throw new Error("its script.js doesn't export a mount() function");
  }

  // An AbortController is an off switch. Any listener the experiment adds with
  // { signal: lab.signal } is removed automatically when we flip it.
  const controller = new AbortController();

  // Everything the site hands an experiment. See CLAUDE.md, "The experiment contract".
  const lab = {
    signal: controller.signal,
    setCursor: setCursorOverride, // "circle", "hand", "hidden", or null to stop asking
  };

  // Show it first, then run mount(), so mount() can measure sizes if it needs to.
  // Both happen before the browser next draws, so you never see it half-wired.
  box.dataset.state = "shown";

  let cleanup;
  try {
    cleanup = module.mount(box.shadowRoot, lab);
  } catch (error) {
    controller.abort();
    setCursorOverride(null);
    box.remove();
    throw error;
  }

  current = { box, controller, cleanup };
  refreshCursor(); // the thing under a still mouse just appeared
}


// ---------- going out ----------

function leave() {
  if (!current) return;
  const { box, controller, cleanup } = current;
  current = null;

  // Stop everything it started. A broken cleanup is logged, not allowed to
  // block switching.
  try {
    if (typeof cleanup === "function") cleanup(); // its loops and timers
  } catch (error) {
    console.error(error);
  }
  controller.abort();        // every listener it added with lab.signal
  setCursorOverride(null);   // whatever cursor it asked for goes with it

  box.inert = true;          // inert = can't be clicked, focused or hovered while it fades
  box.dataset.state = "leaving";
  setTimeout(() => box.remove(), readSetting("--stage-fade"));
}


// ---------- the title above the experiment ----------
//
// A new <h1> for every name, like the boxes: the old one fades out and is
// deleted, the new one fades in (site.css does the moving). Both can be on
// screen at once, so fast scrolling never waits for a fade to finish.
//
// direction: 1 = moved down the list, -1 = moved up. The names slide the
// same way the list does.

const titleArea = document.querySelector(".stage-title-area");

export function showTitle(text, direction) {
  for (const old of titleArea.querySelectorAll('[data-state="shown"]')) {
    old.style.setProperty("--direction", direction);
    old.dataset.state = "leaving";
    old.setAttribute("aria-hidden", "true"); // screen readers only hear the new one
    setTimeout(() => old.remove(), readSetting("--exp-title-duration"));
  }
  if (!text) return;

  const title = document.createElement("h1");
  title.className = "stage-title";
  title.style.setProperty("--direction", direction);
  title.dataset.state = "shown";
  title.textContent = text;
  titleArea.append(title);
}


// ---------- the message in the middle ----------

function say(text) {
  // When clearing, keep the old words in place so they fade out instead of vanishing.
  if (text) message.textContent = text;
  message.dataset.state = text ? "shown" : "empty";
}
