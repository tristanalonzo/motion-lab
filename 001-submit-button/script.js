// 001 — Submit button.
// The button's data-state is the one source of truth. This file only flips it
// between "idle" and "pressed". CSS does all the moving.
//
// The site calls mount() each time 001 comes on screen. root is this
// experiment's sealed box: find things with root.querySelector, never document.
// (The cursor used to live here. It's the site's now, and it already shows
// the hand over this button because it's a <button>.)

export function mount(root) {
  const btn = root.querySelector(".btn");

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

  // No cleanup to return: every listener here is on the button itself, and
  // the button is deleted (listeners and all) when you switch away.
}
