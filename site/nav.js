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
    row.append(item);
    list.append(row);
    return item;
  });

  nav.append(list);
  document.body.append(nav);


  // ---------- selecting ----------

  let selected = -1;

  function select(index) {
    index = Math.min(Math.max(index, 0), experiments.length - 1); // stop at the ends
    if (index === selected) return;
    selected = index;

    // The list slides so this row is in the middle (CSS does the sliding).
    nav.style.setProperty("--selected", index);

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

    select(selected + Math.sign(wheelTotal)); // down = next, up = previous
    // Keep the leftover so steady scrolling steps evenly. But never more than one
    // step's worth, so a single huge flick still moves one item per event, not five.
    wheelTotal = Math.sign(wheelTotal) * Math.min(Math.abs(wheelTotal) - threshold, threshold - 1);
  }, { passive: true });


  // ---------- arrow keys ----------

  window.addEventListener("keydown", (e) => {
    if (!listIsVisible()) return;
    if (e.defaultPrevented) return; // an experiment already used this key
    if (isTypingIn(e)) return;      // in a text box or a slider, arrows belong to it
    if (e.key === "ArrowDown") select(selected + 1);
    if (e.key === "ArrowUp") select(selected - 1);
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
