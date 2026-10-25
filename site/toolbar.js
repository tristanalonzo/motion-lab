// The toolbar at the bottom middle. The buttons themselves are in index.html;
// this keeps them pointing at whichever experiment is open.
//
// For now it holds one button: a link to the open experiment's folder on GitHub.

const REPO = "https://github.com/tristanalonzo/motion-lab/tree/main/";

const sourceLink = document.querySelector(".tool-source");

export function updateToolbar(experiment) {
  if (experiment.folder) {
    sourceLink.href = REPO + experiment.folder;
    sourceLink.dataset.state = "ready";
    sourceLink.removeAttribute("aria-disabled");
  } else {
    // A planned experiment has no folder yet, so there's nothing to show.
    // A link with no href can't be clicked, tabbed to, or turn the cursor
    // into a hand: the browser treats it as plain text.
    sourceLink.removeAttribute("href");
    sourceLink.dataset.state = "disabled";
    sourceLink.setAttribute("aria-disabled", "true");
  }
}
