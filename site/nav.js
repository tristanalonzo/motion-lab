// The list on the left. Scroll, or press ↑/↓, to step through it.
//
// It only keeps track of which row is selected. Every time that changes it
// calls onSelect(index), and main.js decides what to show.
//
// data-state on each row ("idle" or "selected") is the one source of truth;
// nav.css colors the rows from it.

// Settings live in nav.css's :root, like every other tunable.
function readSetting(name) {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
}

export function createNav(experiments, onSelect) {

  // ---------- build the list ----------

  const nav = document.createElement("nav");
  nav.className = "nav";
  nav.setAttribute("aria-label", "Experiments");
  const list = document.createElement("ol");

  const rows = [];

  const items = experiments.map((experiment, index) => {
    // Every row is a link to its own address, so right-click > "open in new
    // tab" works. A normal click is caught below and just selects the row.
    const item = document.createElement("a");
    item.className = "nav-item";
    item.href = "#" + (experiment.folder || experiment.number);
    item.dataset.state = "idle";
    item.innerHTML = `<span class="nav-number">${experiment.number}</span><span class="nav-name">${experiment.name}</span>`;

    item.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let "open in new tab" through
      e.preventDefault();
      select(index);
    });

    const row = document.createElement("li");
    row.style.setProperty("--i", index); // its place in the slide-in wave; select() sets the real one
    row.append(item);
    list.append(row);
    rows.push(row);
    return item;
  });

  nav.append(list);

  // ---------- the counter ----------

  // Only the selected row shows a number, and it isn't the row's own: it's
  // this one counter, a slot machine window parked on the middle row. Each
  // digit is a reel: a strip of digits stacked top to bottom, with only one
  // showing (nav.css slides the strip). When the number changes, the reels
  // whose digit changes spin a full turn or so and clunk to a stop; the rest
  // hold still. So 004 → 005 spins only the last reel.
  //
  // The weird bit, part 1: the ones reel isn't 0–9 once. It holds one digit
  // for every number in the list: 0 1 2 … 9 0 1 2 … The tens reel holds one
  // for every ten, and so on. Where a reel sits is "how many ones (or tens)
  // are in this number", which only ever goes up as the number does. So
  // 009 → 010 spins the ones forward onto the next 0, instead of rewinding
  // all the way back down from 9.
  //
  // Part 2: the spin. Ten digits further along a reel is the same digit
  // again. So every reel has spare turns at both ends, and a reel at rest
  // sits on the middle copy. To spin, it heads for the copy one turn further
  // on, in the direction it's going: same digit, but it has to pass all ten
  // others to get there. Once it stops, it's quietly moved back to the
  // middle copy, which looks identical, ready to spin again.
  const counter = document.createElement("div");
  counter.className = "nav-counter";
  counter.setAttribute("aria-hidden", "true"); // the rows' own numbers are still there for screen readers

  const values = experiments.map((experiment) => parseInt(experiment.number, 10));
  const highest = Math.max(...values);
  const length = experiments[0].number.length;                      // 3, for "000"
  const places = Array.from({ length }, (_, d) => 10 ** (length - 1 - d)); // [100, 10, 1]
  const laps = Math.round(readSetting("--nav-reel-laps"));          // spare turns each side

  const reels = places.map((place, i) => {
    const strip = document.createElement("span");
    strip.className = "nav-counter-digit";
    strip.dataset.state = "idle";
    strip.style.setProperty("--reel", i); // reels further right stop later (nav.css)
    // Every value this reel can show, plus the spare turns before and after.
    const count = Math.floor(highest / place) + 1 + 2 * 10 * laps;
    for (let k = 0; k < count; k++) {
      strip.insertAdjacentHTML("beforeend", `<span>${k % 10}</span>`);
    }
    counter.append(strip);

    // turn: 0 at rest (the middle copy), +1 spinning forward, -1 back.
    const reel = { strip, place, value: null, turn: 0 };
    strip.addEventListener("transitionend", (e) => {
      if (e.propertyName === "transform") settle(reel);
    });
    return reel;
  });

  // Where on its strip a reel should be: its digit, on the copy it's using.
  function placeReel(reel) {
    const position = Math.floor(reel.value / reel.place) + 10 * (laps + reel.turn);
    reel.strip.style.setProperty("--at", position);
  }

  function spin(reel, value) {
    const from = reel.value;
    reel.value = value;
    if (from === null) return placeReel(reel);                       // the first number: just show it
    const change = Math.floor(value / reel.place) - Math.floor(from / reel.place);
    if (change === 0) return;                                        // this digit didn't change: hold still

    // Only a reel at rest starts a new turn. One already spinning just
    // heads for the new digit from wherever it is (the browser picks up a
    // transition mid-way on its own), so mashing a key keeps it spinning
    // instead of winding it further and further.
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reel.turn === 0 && laps > 0 && !reduced) reel.turn = Math.sign(change);
    placeReel(reel);

    // The smear: on for an instant, then off, and nav.css fades it out.
    // Reading offsetHeight in between forces the browser to apply the "on"
    // before it sees the "off"; without it, it would skip straight to off.
    reel.strip.dataset.state = "spinning";
    reel.strip.offsetHeight;
    reel.strip.dataset.state = "idle";
  }

  // Stopped: hop back to the middle copy of the same digit, with no
  // transition, so it can't be seen. Same offsetHeight trick as above: apply
  // the hop, then give the transition back.
  function settle(reel) {
    if (reel.turn === 0) return;
    reel.turn = 0;
    reel.strip.style.transition = "none";
    placeReel(reel);
    reel.strip.offsetHeight;
    reel.strip.style.transition = "";
  }

  nav.append(counter); // after the list: nav.css's hover focus finds it with "ol:hover +"
  document.body.append(nav);

  // The pointer on the screen's left edge, aimed at the middle row. Outside
  // the nav, so the nav's fade doesn't touch it. The d="" is the pointing
  // shape, for browsers that can't set a path's shape from CSS (Safari).
  // viewBox is its drawing grid; preserveAspectRatio="none" lets nav.css
  // stretch it to any width and height.
  document.body.insertAdjacentHTML("beforeend", `
    <svg class="nav-pointer" data-state="pointing" viewBox="0 0 22 320" preserveAspectRatio="none" aria-hidden="true">
      <path class="nav-pointer-shape" d="M 0 0 C 1 60, 5 130, 6 140 C 7 150, 15 157, 22 160 C 15 163, 7 170, 6 180 C 5 190, 1 260, 0 320 Z" />
    </svg>`);
  const pointer = document.querySelector(".nav-pointer");
  let sharpenTimer = null;


  // ---------- selecting ----------

  let selected = -1;

  function select(index) {
    index = Math.min(Math.max(index, 0), experiments.length - 1); // stop at the ends
    if (index === selected) return;
    const isFirst = selected === -1;
    selected = index;

    // The slide-in wave starts at the row you arrived on and ripples out from
    // there, both ways, instead of always starting at row 000. Open a link
    // straight to #005 and the row you came for is the first to land, not the
    // last. Opening the front page is unchanged: the distance from row 000 is
    // the row's own number, which is what --i was before.
    // Only on the first selection; stepping the list later mustn't replay it.
    if (isFirst) {
      rows.forEach((row, i) => row.style.setProperty("--i", Math.abs(i - index)));
    }

    // The pointer goes blunt, then sharpens again (nav.css draws both).
    // Every step restarts the wait, so it stays blunt while you keep scrolling.
    // Not on the first selection, when the page opens: nothing is switching.
    if (!isFirst) {
      pointer.dataset.state = "switching";
      clearTimeout(sharpenTimer);
      sharpenTimer = setTimeout(() => {
        pointer.dataset.state = "pointing";
      }, readSetting("--pointer-blunt-hold"));
    }

    // The list slides so this row is in the middle (CSS does the sliding).
    nav.style.setProperty("--selected", index);

    // The counter's reels spin to this row's number (CSS does the spinning).
    reels.forEach((reel) => spin(reel, values[index]));

    items.forEach((item, i) => {
      const isSelected = i === index;
      item.dataset.state = isSelected ? "selected" : "idle";
      // Only the selected row can be reached with Tab. With hundreds of
      // experiments you'd otherwise press Tab hundreds of times to get past
      // the list. ↑/↓ move between rows instead.
      item.tabIndex = isSelected ? 0 : -1;
      if (isSelected) item.setAttribute("aria-current", "true"); // "you are here", for screen readers
      else item.removeAttribute("aria-current");
    });

    // If the keyboard is on the list, move it along with the selection.
    // preventScroll: the list does its own sliding; don't let the browser scroll it too.
    if (nav.contains(document.activeElement)) {
      items[index].focus({ preventScroll: true });
    }

    onSelect(index);
  }


  // ---------- stepping ----------

  // Every step goes through here, whether it came from a key, the wheel or a
  // finger. It shouts first, then moves.
  //
  // The shout is a "custom event": a message with a name of our own, sent on
  // window, that anything else on the page can listen for without this file
  // knowing it exists. The readout in the corner (site/hints.js) listens for
  // it. Doing it that way means the rules about when a key or a scroll counts
  // — not while you're typing, not when an experiment has claimed the event —
  // stay here, in one place, instead of being copied into every file that
  // wants to know a step happened.
  //
  // It shouts even when the list is already at the end and nothing moves:
  // you pressed the key, so the key should react. atEnd says that's what
  // happened, so a listener can tell "moved" from "tried to, but couldn't".
  function step(direction, by) {
    const atEnd = selected + direction < 0 || selected + direction > experiments.length - 1;
    window.dispatchEvent(new CustomEvent("lab:step", { detail: { direction, by, atEnd } }));
    select(selected + direction);
  }


  // ---------- scrolling ----------

  function listIsVisible() {
    return getComputedStyle(nav).display !== "none";
  }

  // Scroll wheels and trackpads send lots of small "wheel" events. Add them up,
  // and every time they pass the threshold, move one item. Keep scrolling and
  // it keeps stepping, one item at a time, with no pause in between.
  let wheelTotal = 0;
  let lastWheelTime = 0;

  window.addEventListener("wheel", (e) => {
    if (!listIsVisible()) return;
    if (e.defaultPrevented) return; // an experiment is using the wheel itself

    const now = performance.now();
    if (now - lastWheelTime > 200) wheelTotal = 0; // a fresh scroll; forget old leftovers
    lastWheelTime = now;

    // Firefox sometimes reports scrolling in lines instead of pixels.
    // One mouse-wheel click is 3 lines; 40px each makes it 120, enough for one step.
    const delta = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY;
    if (Math.sign(delta) !== Math.sign(wheelTotal)) wheelTotal = 0; // changed direction: start over
    wheelTotal += delta;

    const threshold = readSetting("--nav-wheel-threshold");
    if (Math.abs(wheelTotal) < threshold) return;

    step(Math.sign(wheelTotal), "wheel"); // down = next, up = previous
    // Keep the leftover so steady scrolling steps evenly. But never more than one
    // step's worth, so a single huge flick still moves one item per event, not five.
    wheelTotal = Math.sign(wheelTotal) * Math.min(Math.abs(wheelTotal) - threshold, threshold - 1);
  }, { passive: true });


  // ---------- swiping (phones) ----------

  // A finger dragged up or down anywhere on the page steps the list, like
  // the scroll wheel: every --nav-swipe-step pixels of travel is one item.
  // Finger up = next, the same as scrolling down.
  let touchY = null; // where the finger was at the last step, or null = not ours

  window.addEventListener("touchstart", (e) => {
    // One finger only: two fingers is a pinch-zoom, leave it alone.
    touchY = e.touches.length === 1 && !isTypingIn(e) ? e.touches[0].clientY : null;
  }, { passive: true });

  // passive: false, so preventDefault() below is allowed to work.
  window.addEventListener("touchmove", (e) => {
    if (touchY === null || !listIsVisible()) return;
    if (e.defaultPrevented) {      // an experiment is using this drag itself
      touchY = null;
      return;
    }
    e.preventDefault();            // the page doesn't scroll or bounce; the list steps instead

    const swipeStep = readSetting("--nav-swipe-step");
    const travelled = touchY - e.touches[0].clientY; // positive = finger moved up
    if (Math.abs(travelled) < swipeStep) return;
    step(Math.sign(travelled), "touch");
    // Keep the rest of the drag, so one long swipe steps evenly through several items.
    touchY -= Math.sign(travelled) * swipeStep;
  }, { passive: false });


  // ---------- arrow keys ----------

  window.addEventListener("keydown", (e) => {
    if (!listIsVisible()) return;
    if (e.defaultPrevented) return; // an experiment already used this key
    if (isTypingIn(e)) return;      // in a text box or a slider, arrows belong to it
    if (e.key === "ArrowDown") step(1, "key");
    if (e.key === "ArrowUp") step(-1, "key");
  });

  // composedPath()[0] is the element that really has focus, even inside an
  // experiment's sealed box. (e.target would only say "the box".)
  function isTypingIn(e) {
    const target = e.composedPath()[0];
    return target instanceof Element &&
      target.closest("input, textarea, select, [contenteditable]") !== null;
  }

  return { select };
}
