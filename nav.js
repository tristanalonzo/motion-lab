// The component list on the left of every page.
// This is the one place to add a component: put a new line in COMPONENTS.
//
// folder: the component exists. Landing on it opens its page.
// no folder: it's planned. Landing on it shows "coming soon".

const COMPONENTS = [
  { number: "001", name: "submit button", folder: "001-button" },
  { number: "002", name: "dark mode button" },
  { number: "003", name: "evading button" },
  { number: "004", name: "create button" },
  { number: "005", name: "clingy button" },
];

// Each component's index.html says which one it is: <body data-page="001-button">
const currentPage = document.body.dataset.page;
const currentIndex = Math.max(0, COMPONENTS.findIndex((c) => c.folder === currentPage));

// Settings live in nav.css's :root, like every other tunable.
function readSetting(name) {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
}


// ---------- build the list ----------

const nav = document.createElement("nav");
nav.className = "nav";
nav.setAttribute("aria-label", "Components");
const list = document.createElement("ol");

const items = COMPONENTS.map((component, index) => {
  // Built ones are links (so right-click > open in new tab still works).
  // Planned ones are buttons: clicking them just selects them.
  const item = document.createElement(component.folder ? "a" : "button");
  item.className = "nav-item";
  item.dataset.state = "idle";
  if (component.folder) {
    // index.html spelled out, so the link also works when you double-click the file
    item.href = `../${component.folder}/index.html`;
  } else {
    item.type = "button";
  }
  if (index === currentIndex) item.setAttribute("aria-current", "page"); // tells screen readers "you are here"

  item.innerHTML = `<span class="nav-number">${component.number}</span><span class="nav-name">${component.name}</span>`;

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

// Shown in the middle when a planned component is selected.
const comingSoon = document.createElement("p");
comingSoon.className = "nav-coming-soon";
comingSoon.textContent = "coming soon";

nav.append(list);
document.body.append(comingSoon, nav);


// ---------- selecting ----------

let selected = -1;
let leaveTimer = null;
const main = document.querySelector("main");

function show(what) {
  document.body.dataset.showing = what;
  main.inert = what !== "component"; // inert = can't be clicked or tabbed to while hidden
}

function select(index) {
  index = Math.min(Math.max(index, 0), COMPONENTS.length - 1); // stop at the ends
  if (index === selected) return;
  selected = index;

  // The list slides so this row is in the middle (CSS does the sliding).
  nav.style.setProperty("--selected", index);
  items.forEach((item, i) => {
    item.dataset.state = i === index ? "selected" : "idle";
  });

  // If you scroll past a page before it opens, cancel opening it.
  clearTimeout(leaveTimer);

  const component = COMPONENTS[index];
  if (!component.folder) {
    show("planned");
  } else if (index === currentIndex) {
    show("component");
  } else {
    // Another page: let the list finish sliding, then open it.
    show("leaving");
    leaveTimer = setTimeout(() => {
      location.href = items[index].href;
    }, readSetting("--nav-step-duration"));
  }
}

// Start on this page's own row, already in the middle (no slide on load).
select(currentIndex);

// Coming back with the browser's Back button can restore this page exactly as
// it was left, mid-switch. Reset it to this page's own row.
window.addEventListener("pageshow", (e) => {
  if (e.persisted) select(currentIndex);
});


// ---------- scrolling and arrow keys ----------

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

window.addEventListener("keydown", (e) => {
  if (!listIsVisible()) return;
  if (e.key === "ArrowDown") select(selected + 1);
  if (e.key === "ArrowUp") select(selected - 1);
});
