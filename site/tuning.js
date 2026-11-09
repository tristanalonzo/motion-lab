// A panel for tuning the cursor by feel. It lives behind the little circle in
// the bottom left:
//   hover the circle   it peeks open, and closes again a moment after the
//                      mouse leaves both the circle and the panel
//   click the circle   it stays open until you click again (or press C or
//                      Escape), so you can go and fling the about panel around.
//                      An esc cap in its top right says so, and sinks when
//                      Escape closes it
//   C                  the same as a click
//
// The spring has two numbers, stiffness and damping, and neither says what you
// actually feel. These sliders speak in follow delay and overshoot instead, and
// work out the two spring numbers behind the scenes.
//
// Nothing is saved. A slider only changes the page you're on, and a reload puts
// cursor.css back in charge. When something feels right, copy the two lines the
// panel shows into cursor.css. spring.js reads its numbers every frame, so a
// change here is felt at once, on the cursor and on the about panel's drag.
//
// data-state on the panel is the one source of truth: "closed", "peek" (open
// while hovered) or "pinned" (open until closed). show() copies it onto the
// circle, so the circle's CSS can react too.

const panel = document.querySelector(".tuning");
const trigger = document.querySelector(".tuning-trigger");
const delaySlider = panel.querySelector(".tuning-delay");
const overshootSlider = panel.querySelector(".tuning-overshoot");
const delayValue = panel.querySelector(".tuning-delay-value");
const overshootValue = panel.querySelector(".tuning-overshoot-value");
const numbers = panel.querySelector(".tuning-numbers");
const resetButton = panel.querySelector(".tuning-reset");
const escCap = panel.querySelector(".tuning-esc");

const page = document.documentElement;

function readSetting(name) {
  return parseFloat(getComputedStyle(page).getPropertyValue(name));
}


// ---------- the maths: feelings <-> spring numbers ----------

// Both directions go through one in-between number, the "damping ratio". It
// says how much the spring is held back: 1 means it arrives without ever
// swinging past, and the lower it goes, the more it swings. Spring maths
// usually calls it zeta. These are the standard formulas for a spring.

// From the spring numbers to what you feel.
//   delay:     how far behind the mouse it trails while the mouse moves steadily
//   overshoot: how far past it swings after the mouse jumps, as a share of the jump
function feelFromSpring(stiffness, damping) {
  const ratio = damping / (2 * Math.sqrt(stiffness));
  return {
    delay: (damping / stiffness) * 1000, // seconds to ms
    overshoot: ratio >= 1 ? 0 : Math.exp((-Math.PI * ratio) / Math.sqrt(1 - ratio * ratio)) * 100,
  };
}

// The same two formulas, solved the other way round.
function springFromFeel(delay, overshoot) {
  const seconds = delay / 1000;
  const swing = Math.log(overshoot / 100);
  const ratio = overshoot <= 0 ? 1 : -swing / Math.sqrt(Math.PI * Math.PI + swing * swing);
  const stiffness = ((2 * ratio) / seconds) ** 2;
  return { stiffness, damping: seconds * stiffness };
}


// ---------- the sliders ----------

// Write the sliders' feeling into the two numbers spring.js reads. Rounded here,
// so the numbers the panel shows are exactly the ones in use.
function applySliders() {
  paintFill(delaySlider);
  paintFill(overshootSlider);
  const spring = springFromFeel(Number(delaySlider.value), Number(overshootSlider.value));
  page.style.setProperty("--cursor-stiffness", Math.round(spring.stiffness));
  page.style.setProperty("--cursor-damping", Math.round(spring.damping * 10) / 10);
  showNumbers();
}

// Show whichever numbers are in use right now.
function showNumbers() {
  const stiffness = readSetting("--cursor-stiffness");
  const damping = readSetting("--cursor-damping");
  const feel = feelFromSpring(stiffness, damping);

  delayValue.textContent = `${Math.round(feel.delay)} ms`;
  overshootValue.textContent = `${Math.round(feel.overshoot)}%`;
  numbers.textContent = `--cursor-stiffness: ${stiffness};\n--cursor-damping: ${damping};`;

  // A value set on the page itself means a slider has been moved.
  resetButton.disabled = page.style.getPropertyValue("--cursor-stiffness") === "";
}

// Put the slider handles where the numbers in use say they should be.
function placeSliders() {
  const feel = feelFromSpring(readSetting("--cursor-stiffness"), readSetting("--cursor-damping"));
  delaySlider.value = feel.delay;
  overshootSlider.value = feel.overshoot;
  paintFill(delaySlider);
  paintFill(overshootSlider);
}

// The dark part of the track, left of the handle. CSS draws it, but CSS can't
// read where the handle is, so this hands it over as --fill: 0 at the left
// end, 1 at the right.
function paintFill(slider) {
  const share = (slider.value - slider.min) / (slider.max - slider.min);
  slider.style.setProperty("--fill", share);
}

// Taking the page's own values away leaves cursor.css in charge again.
function reset() {
  page.style.removeProperty("--cursor-stiffness");
  page.style.removeProperty("--cursor-damping");
  placeSliders();
  showNumbers();

  // The button just turned itself off, and a disabled button can't hold the
  // keyboard, so hand it to a slider instead of losing it.
  delaySlider.focus();
}


// ---------- opening and closing ----------

let closeTimer = 0;
let holding = false; // a slider is being dragged, and the mouse may wander off the panel mid-drag

function show(state) {
  clearTimeout(closeTimer);
  panel.dataset.state = state;
  trigger.dataset.state = state;
  if (state !== "closed") escCap.dataset.state = "idle"; // opening again: the cap comes back up
  trigger.setAttribute("aria-expanded", state !== "closed");
}

function close() {
  show("closed");
  // Let go of the keyboard, so the arrow keys go back to the list.
  if (panel.contains(document.activeElement)) document.activeElement.blur();
}

// Hover. Only for a mouse: a finger has no hover, it just clicks.
function onEnter(e) {
  if (e.pointerType !== "mouse") return;
  clearTimeout(closeTimer); // came back in time: stay open
  if (panel.dataset.state === "closed") show("peek");
}

function onLeave(e) {
  if (e.pointerType !== "mouse" || holding) return;
  closeSoon();
}

// A peek closes a moment after the mouse leaves, not at once. That moment is
// what lets the mouse cross the gap between the circle and the panel.
function closeSoon() {
  if (panel.dataset.state !== "peek") return;
  clearTimeout(closeTimer);
  closeTimer = setTimeout(close, readSetting("--tuning-hover-grace"));
}

// Let go of a slider somewhere outside: now the mouse leaving counts.
function onRelease(e) {
  if (!holding) return;
  holding = false;
  const under = document.elementFromPoint(e.clientX, e.clientY);
  if (!panel.contains(under) && !trigger.contains(under)) closeSoon();
}

function onTriggerClick(e) {
  if (panel.dataset.state === "pinned") {
    close();
    return;
  }
  show("pinned");
  // Opened from the keyboard (Enter or Space): hand the keyboard to the first
  // slider. A mouse click leaves it where it is. e.detail counts mouse clicks,
  // and is 0 when the click came from a key.
  if (e.detail === 0) delaySlider.focus();
}

// composedPath()[0] is the element that really has focus, even inside an
// experiment's sealed box. A slider doesn't count as typing, or C couldn't
// close the panel while one of its own sliders has the keyboard.
function isTypingIn(e) {
  const target = e.composedPath()[0];
  return target instanceof Element &&
    target.closest("input:not([type='range']), textarea, select, [contenteditable]") !== null;
}

function onKey(e) {
  if (e.defaultPrevented || e.repeat) return; // an experiment used it, or the key is being held

  if (e.key === "Escape") {
    // The esc cap only shows while pinned, so only then does it sink. The
    // window then fades out around the key that closed it.
    if (panel.dataset.state === "pinned") escCap.dataset.state = "pressed";
    close();
    return;
  }

  // The modifier check matters: Ctrl+C is copy, not "open the panel".
  if (e.key.toLowerCase() !== "c" || e.ctrlKey || e.metaKey || e.altKey) return;
  if (isTypingIn(e)) return;

  if (panel.dataset.state === "closed") {
    show("pinned");
    delaySlider.focus(); // the arrow keys move the slider straight away
  } else {
    close();
  }
}


// ---------- starting ----------

export function startTuning() {
  // The sliders' reach comes from tuning.css, like every other tunable.
  delaySlider.min = readSetting("--tuning-delay-min");
  delaySlider.max = readSetting("--tuning-delay-max");
  overshootSlider.min = readSetting("--tuning-overshoot-min");
  overshootSlider.max = readSetting("--tuning-overshoot-max");

  delaySlider.addEventListener("input", applySliders);
  overshootSlider.addEventListener("input", applySliders);
  resetButton.addEventListener("click", reset);
  window.addEventListener("keydown", onKey);

  trigger.addEventListener("click", onTriggerClick);
  for (const element of [trigger, panel]) {
    element.addEventListener("pointerenter", onEnter);
    element.addEventListener("pointerleave", onLeave);
  }
  panel.addEventListener("pointerdown", () => { holding = true; });

  // Once the window has faded out, bring the esc cap back up while nobody can
  // see it, so the next open slides it in fresh instead of showing it already
  // there. show() does the same as a backup: with reduced motion nothing
  // fades, so this never fires.
  panel.addEventListener("transitionend", (e) => {
    if (e.target === panel && e.propertyName === "opacity" && panel.dataset.state === "closed") {
      escCap.dataset.state = "idle";
    }
  });
  window.addEventListener("pointerup", onRelease);

  placeSliders();
  showNumbers();
}
