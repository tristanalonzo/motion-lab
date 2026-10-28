// The keyboard hints in the bottom left.
//
// Two keycaps sit in the corner. Hover them (or Tab to them) and a small white
// pop-up lists what the site answers to. The pop-up trails along under the
// cursor while you're on the caps, then fades away when you leave.
//
// The caps are a <button>, so it also works without a mouse: Tab reaches them,
// focus shows the pop-up, and clicking pins it open until you click again or
// press Escape. The markup for both is in index.html.
//
// data-state on the pop-up is the one source of truth; hints.css reacts to it:
//   hidden   out of the way
//   shown    on screen, following the cursor

const trigger = document.querySelector(".hints");
const panel = document.querySelector(".hints-panel");

let pinned = false;  // clicked open, so it stays while the mouse is elsewhere

export function startHints() {
  // Hovering: show it, and keep it under the cursor while it's on the caps.
  trigger.addEventListener("pointerenter", (e) => {
    moveTo(e.clientX, e.clientY);
    show();
  });

  trigger.addEventListener("pointermove", (e) => moveTo(e.clientX, e.clientY));

  trigger.addEventListener("pointerleave", () => {
    if (!pinned) hide();
  });

  // Clicking pins it, so it can be read without holding the mouse still, and
  // so a tap works on a touchscreen that has a keyboard attached.
  trigger.addEventListener("click", () => {
    pinned = !pinned;
    if (pinned) {
      aboveTheCaps();
      show();
    } else {
      hide();
    }
  });

  // Tabbing to the caps shows it too. There's no cursor to follow in that
  // case, so it sits straight above them.
  trigger.addEventListener("focus", () => {
    if (!trigger.matches(":focus-visible")) return; // a click already handled above
    aboveTheCaps();
    show();
  });

  trigger.addEventListener("blur", () => {
    if (!pinned) hide();
  });

  // Escape puts it away from anywhere, the same as the about panel.
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    pinned = false;
    hide();
  });

  // The caps don't move when the window resizes, but a pinned pop-up placed
  // against them should follow.
  window.addEventListener("resize", () => {
    if (pinned || panel.dataset.state === "shown") aboveTheCaps();
  });
}


// ---------- showing and hiding ----------

function show() {
  panel.dataset.state = "shown";
  trigger.setAttribute("aria-expanded", "true");
}

function hide() {
  panel.dataset.state = "hidden";
  trigger.setAttribute("aria-expanded", "false");
}


// ---------- where it sits ----------

// hints.css places the pop-up at this point and then shifts it up and to the
// right of it, so the point is the cursor, not the corner of the pop-up.
function moveTo(x, y) {
  panel.style.setProperty("--hints-x", x + "px");
  panel.style.setProperty("--hints-y", y + "px");
}

// No cursor to follow (keyboard, or pinned open): sit on the middle of the
// caps instead, so it still points at the thing it belongs to.
function aboveTheCaps() {
  const box = trigger.getBoundingClientRect();
  moveTo(box.left + box.width / 2, box.top);
}
