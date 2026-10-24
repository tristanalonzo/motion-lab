// The cursor. One for the whole site, drawn on top of everything: the list,
// the title and every experiment. Experiments never draw it. They can only
// ask it to change shape (see "what experiments can ask for" below).
//
// data-state on the cursor is the one source of truth. It's one of:
//   away    the mouse isn't on the page (left the window, or hasn't moved yet)
//   circle  the normal cursor
//   hand    over something clickable
//   hidden  an experiment asked for no cursor
//   native  an experiment asked for the system cursor instead (e.g. a text box)
// cursor.css does the drawing, the inverting and the circle-to-hand morph.
// This file moves it: a spring pulls it toward the mouse every frame.
//
// Why a spring and not a CSS transition? A transition restarts from zero
// speed every time the mouse moves, so it can only lag, never overshoot.
// A spring remembers how fast it's going, and that leftover speed is the overshoot.

const cursor = document.querySelector(".cursor");

// Things that get the hand. :not(:disabled) so a greyed-out button doesn't.
const CLICKABLE = "a[href], button:not(:disabled), [role='button'], label, select, summary";

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

const mouse = { x: 0, y: 0 };    // where the real mouse is
const circle = { x: 0, y: 0 };   // where the cursor is drawn
const speed = { x: 0, y: 0 };    // how fast the cursor is moving, in px per second
let animating = false;
let lastTime = 0;
let override = null;             // a shape an experiment asked for with lab.setCursor(), or null

// The spring settings live in cursor.css's :root, like every other tunable.
// Read every frame, so editing them in DevTools changes the feel live.
function readSetting(name) {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
}


// ---------- starting ----------

export function startCursor() {
  window.addEventListener("pointermove", onPointerMove);

  // The mouse left the browser window. <html> fills the whole window, so it
  // only "leaves" when the mouse really leaves, never because an experiment
  // under the mouse was swapped out.
  document.documentElement.addEventListener("mouseleave", () => {
    cursor.dataset.state = "away";
  });
}

function onPointerMove(e) {
  if (e.pointerType !== "mouse") return; // fingers and pens get no cursor
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  const wasAway = cursor.dataset.state === "away";

  // Tells cursor.css ours can be drawn now, so it's safe to hide the system
  // arrow. Not before the first move: until then the browser hasn't said where
  // the mouse is, so hiding the arrow early would leave no cursor at all.
  // And if this file ever fails to run, you keep the normal cursor.
  document.documentElement.dataset.customCursor = "on";

  // composedPath()[0] is the exact element under the mouse, even inside an
  // experiment's sealed box. (e.target would only say "the box".)
  cursor.dataset.state = shapeFor(e.composedPath()[0]);

  // Coming back into the window, or reduced motion: no spring, just be there.
  if (wasAway || reduceMotion.matches) {
    jumpToMouse();
    return;
  }

  if (!animating) {
    animating = true;
    lastTime = performance.now();
    requestAnimationFrame(frame);
  }
}


// ---------- what experiments can ask for ----------
//
// 1. An attribute on any element, for "over this thing, look like that":
//      <div data-cursor="hidden">   no cursor over it
//      <div data-cursor="native">   the system cursor over it
//      <div data-cursor="circle">   the circle, even over something clickable
//      <div data-cursor="hand">     the hand, even over something that isn't
// 2. lab.setCursor("hidden") in script.js, for "right now, whatever is under
//    the mouse" (say, while dragging). lab.setCursor(null) stops asking.
//    The site clears it automatically when the experiment is switched away.

export function setCursorOverride(shape) {
  override = shape;
  refreshCursor();
}

// Work out the shape for whatever is under the mouse right now, without
// waiting for the mouse to move. Called after every switch, so a still mouse
// gets the right shape over whatever just appeared under it.
export function refreshCursor() {
  if (cursor.dataset.state === "away") return; // we don't know where the mouse is yet
  cursor.dataset.state = shapeFor(elementUnder(mouse.x, mouse.y));
}

function shapeFor(element) {
  if (override) return override;
  // The nearest thing that's clickable or asks for a shape wins.
  const match = closestAcrossBoxes(element, `${CLICKABLE}, [data-cursor]`);
  if (!match) return "circle";
  return match.dataset.cursor || "hand";
}

// closest() checks an element and its parents, but stops at the edge of a
// sealed box. This keeps going: at the edge it hops out to the box itself
// (the "host") and carries on outward.
function closestAcrossBoxes(element, selector) {
  while (element instanceof Element) {
    const found = element.closest(selector);
    if (found) return found;
    const root = element.getRootNode();
    element = root instanceof ShadowRoot ? root.host : null;
  }
  return null;
}

// The element under a point, looking inside sealed boxes too.
// document.elementFromPoint stops at a box and returns the box itself,
// so ask that box the same question, until there's no box left.
function elementUnder(x, y) {
  let element = document.elementFromPoint(x, y);
  while (element?.shadowRoot) {
    const inner = element.shadowRoot.elementFromPoint(x, y);
    if (!inner || inner === element) break;
    element = inner;
  }
  return element;
}


// ---------- the spring ----------

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
