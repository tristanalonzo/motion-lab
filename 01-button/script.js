// The button's data-state is the one source of truth.
// This file only flips it between "idle" and "pressed". CSS does all the moving.

const btn = document.querySelector(".btn");

function press() {
  btn.dataset.state = "pressed";
}

function release() {
  btn.dataset.state = "idle";
}

// Mouse, finger, pen: "pointer" events cover all three.
btn.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return; // left click / touch only, not right click
  press();
});
btn.addEventListener("pointerup", release);
btn.addEventListener("pointerleave", release);  // slid off the button
btn.addEventListener("pointercancel", release); // browser took over, e.g. a scroll

// Keyboard: Space and Enter should look exactly like a tap.
btn.addEventListener("keydown", (e) => {
  if (e.repeat) return; // holding a key fires keydown over and over; only react once
  if (e.key === " " || e.key === "Enter") press();
});
btn.addEventListener("keyup", (e) => {
  if (e.key === " " || e.key === "Enter") release();
});
btn.addEventListener("blur", release); // tabbed away mid-press
