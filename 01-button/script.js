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


// ---------- the cursor ----------
// data-state says "hidden", "circle" or "hand". CSS does the drawing,
// the inverting, and the morph between shapes.
// JS moves it: a spring pulls the circle toward the mouse every frame.
//
// Why not a CSS transition? A transition restarts from zero speed every time
// the mouse moves, so it can't build up speed and overshoot. A spring
// remembers how fast it's going, which is exactly what makes it overshoot.

const cursor = document.querySelector(".cursor");
const CLICKABLE = "a, button, [role='button'], label, select, summary"; // things that get the hand
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

const mouse = { x: 0, y: 0 };    // where the real mouse is
const circle = { x: 0, y: 0 };   // where the circle is drawn
const speed = { x: 0, y: 0 };    // how fast the circle is moving, in px per second
let animating = false;
let lastTime = 0;

// The spring settings live in style.css's :root, like every other tunable.
// Read every frame, so editing them in DevTools changes the feel live.
function readSetting(name) {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
}

function draw() {
  cursor.style.setProperty("--x", circle.x + "px");
  cursor.style.setProperty("--y", circle.y + "px");
}

function jumpToMouse() {
  circle.x = mouse.x;
  circle.y = mouse.y;
  speed.x = 0;
  speed.y = 0;
  draw();
}

function frame(time) {
  const stiffness = readSetting("--cursor-stiffness");
  const damping = readSetting("--cursor-damping");

  // Seconds since last frame. Capped, so switching tabs and coming back
  // doesn't make the circle fly off from one giant step.
  let seconds = Math.min(Math.max((time - lastTime) / 1000, 0), 1 / 30);
  lastTime = time;

  // Do the math in tiny slices (1/240s). Big slices with extreme settings
  // can make the spring blow up and fly off screen.
  while (seconds > 0) {
    const slice = Math.min(seconds, 1 / 240);
    for (const axis of ["x", "y"]) {
      const pull = stiffness * (mouse[axis] - circle[axis]); // farther away = stronger pull
      const brake = damping * speed[axis];                   // faster = stronger brake
      speed[axis] += (pull - brake) * slice;
      circle[axis] += speed[axis] * slice;
    }
    seconds -= slice;
  }
  draw();

  // Close enough and barely moving: snap the last fraction of a pixel and stop
  // the loop, so nothing runs while the mouse is still.
  const distance = Math.hypot(mouse.x - circle.x, mouse.y - circle.y);
  const moving = Math.hypot(speed.x, speed.y);
  if (distance < 0.1 && moving < 1) {
    jumpToMouse();
    animating = false;
    return;
  }
  requestAnimationFrame(frame);
}

window.addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return; // fingers and pens get no circle
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  const wasHidden = cursor.dataset.state === "hidden";

  // e.target is whatever is under the mouse. closest() checks it and all its
  // parents, so hovering the text inside a link still counts as the link.
  cursor.dataset.state = e.target.closest(CLICKABLE) ? "hand" : "circle";

  // Coming back into the window, or reduced motion: no spring, just be there.
  if (wasHidden || reduceMotion.matches) {
    jumpToMouse();
    return;
  }

  if (!animating) {
    animating = true;
    lastTime = performance.now();
    requestAnimationFrame(frame);
  }
});

// Mouse left the browser window: relatedTarget is where it went, and
// "nowhere on this page" shows up as null.
document.addEventListener("mouseout", (e) => {
  if (!e.relatedTarget) cursor.dataset.state = "hidden";
});
