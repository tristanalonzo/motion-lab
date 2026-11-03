// The cursor. One for the whole site, drawn on top of everything: the list,
// the title and every experiment. Experiments never draw it. They can only
// ask it to change shape (see "what experiments can ask for" below).
//
// data-state on the cursor is the one source of truth. It's one of:
//   away    the mouse isn't on the page (left the window, or hasn't moved yet).
//           The circle waits beside the title, and the title makes room.
//   circle  the normal cursor
//   hand    over something clickable
//   hidden  an experiment asked for no cursor
//   native  an experiment asked for the system cursor instead (e.g. a text box)
// cursor.css does the drawing, the inverting and the circle-to-hand morph.
// This file moves it: a spring pulls it toward the mouse every frame. The
// spring itself is in spring.js, shared with anything else that should move
// exactly like the cursor (the about panel, while you drag it).

import { makeSpring } from "./spring.js";

const cursor = document.querySelector(".cursor");
const title = document.querySelector(".site-title");

// Things that get the hand. :not(:disabled) so a greyed-out button doesn't.
const CLICKABLE = "a[href], button:not(:disabled), [role='button'], label, select, summary";

const mouse = { x: 0, y: 0 };    // where the real mouse is
let override = null;             // a shape an experiment asked for with lab.setCursor(), or null

// Settings live in cursor.css's :root, like every other tunable.
// (The spring reads its own two from there too, in spring.js.)
function readSetting(name) {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
}


// ---------- starting ----------

export function startCursor() {
  // Start parked beside the title: the mouse hasn't been seen yet.
  spring.jumpTo(parkingSpot());

  window.addEventListener("pointermove", onPointerMove);

  // The mouse left the browser window. <html> fills the whole window, so it
  // only "leaves" when the mouse really leaves, never because an experiment
  // under the mouse was swapped out. The spring flies the circle home.
  document.documentElement.addEventListener("mouseleave", () => {
    cursor.dataset.state = "away";
    spring.start();
  });
}

function onPointerMove(e) {
  if (e.pointerType !== "mouse") return; // fingers and pens get no cursor
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  // Tells cursor.css ours can be drawn now, so it's safe to hide the system
  // arrow. Not before the first move: until then the browser hasn't said where
  // the mouse is, so hiding the arrow early would leave no cursor at all.
  // And if this file ever fails to run, you keep the normal cursor.
  document.documentElement.dataset.customCursor = "on";

  // composedPath()[0] is the exact element under the mouse, even inside an
  // experiment's sealed box. (e.target would only say "the box".)
  cursor.dataset.state = shapeFor(e.composedPath()[0]);

  // Coming back into the window, this flies the circle from beside the title
  // to the mouse. Otherwise it just follows.
  spring.start();
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

// The circle on the site's spring (spring.js). It's pulled toward target()
// every frame, and draws itself wherever the spring has got to.
const spring = makeSpring({
  goal: target,
  draw: (point) => {
    cursor.style.setProperty("--x", point.x + "px");
    cursor.style.setProperty("--y", point.y + "px");
  },
});

// Where the circle waits while the mouse is away: just left of the title,
// level with its middle. offsetLeft/offsetTop ignore the title's own slide,
// so this spot stays put while the title moves out of the way.
function parkingSpot() {
  const radius = 14 * readSetting("--cursor-scale"); // the circle is 28px across at scale 1
  return {
    x: title.offsetLeft + radius,
    y: title.offsetTop + title.offsetHeight / 2,
  };
}

// What the spring pulls toward: the mouse, or the parking spot while away.
function target() {
  return cursor.dataset.state === "away" ? parkingSpot() : mouse;
}
