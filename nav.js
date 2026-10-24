// The component list on the left of every page.
// This is the one place to add a component: put a new line in COMPONENTS.
//
// folder: the component exists, so it gets a link.
// no folder: it's planned. It shows up grey and can't be clicked yet.

const COMPONENTS = [
  { number: "001", name: "submit button", folder: "01-button" },
  { number: "002", name: "dark mode button" },
  { number: "003", name: "evading button" },
  { number: "004", name: "create button" },
  { number: "005", name: "clingy button" },
];

// Each component's index.html says which one it is: <body data-page="01-button">
const currentPage = document.body.dataset.page;

const nav = document.createElement("nav");
nav.className = "nav";
nav.setAttribute("aria-label", "Components");
const list = document.createElement("ol");

for (const component of COMPONENTS) {
  // Built ones are links. Planned ones are plain text, so they can't be clicked
  // and the cursor stays a circle over them.
  const item = document.createElement(component.folder ? "a" : "span");
  item.className = "nav-item";

  if (!component.folder) {
    item.dataset.state = "planned";
  } else if (component.folder === currentPage) {
    item.dataset.state = "current";
    item.setAttribute("aria-current", "page"); // tells screen readers "you are here"
  } else {
    item.dataset.state = "built";
  }

  if (component.folder) {
    // index.html spelled out, so the link also works when you double-click the file
    item.href = `../${component.folder}/index.html`;
  }

  item.innerHTML = `<span class="nav-number">${component.number}</span><span class="nav-name">${component.name}</span>`;

  const row = document.createElement("li");
  row.append(item);
  list.append(row);
}

nav.append(list);
document.body.append(nav);

// Start with this page's item in the middle, level with the component.
const currentItem = nav.querySelector('[data-state="current"]');
if (currentItem) currentItem.scrollIntoView({ block: "center", behavior: "instant" });
