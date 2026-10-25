// The links in the bottom right corner. They're plain links in index.html;
// this only plays the GitHub cat's jump.
//
// The jump is CSS keyframe animations (socials.css), all sitting paused.
// Here we only press play, forwards or backwards. The browser hands us each
// CSS animation as an object we can steer, no library needed.

export function startSocials() {
  const github = document.querySelector(".social-github");
  let hovered = false;
  let focused = false;

  function catAnimations() {
    return github
      .getAnimations({ subtree: true })               // the link's and everything inside it
      .filter((a) => a.animationName?.startsWith("github-")); // only the jump, not the grow transition
  }

  function setOpen(open) {
    const state = open ? "open" : "ready";
    if (github.dataset.state === state) return;      // e.g. hovered while already focused
    github.dataset.state = state;

    // Read from CSS every time, so DevTools changes apply on the next hover.
    const rewind = parseFloat(getComputedStyle(github).getPropertyValue("--github-rewind")) || 1;

    for (const animation of catAnimations()) {
      // Left before it even started? Nothing to undo. (Playing backwards from
      // the very start makes the browser jump to the end first, then rewind.)
      if (!open && !animation.currentTime) continue;
      // A negative speed plays it backwards, from wherever it is right now.
      animation.playbackRate = open ? 1 : -rewind;
      animation.play();
    }
  }

  const update = () => setOpen(hovered || focused);

  github.addEventListener("pointerenter", () => { hovered = true; update(); });
  github.addEventListener("pointerleave", () => { hovered = false; update(); });
  github.addEventListener("focus", () => { focused = true; update(); });
  github.addEventListener("blur", () => { focused = false; update(); });
}
