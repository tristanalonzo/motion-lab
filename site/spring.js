// The site's spring: the thing that makes the cursor trail behind the mouse
// and swing past it when you stop. Anything that should move like the cursor
// uses this, so there's one copy of the maths and one pair of numbers.
//
// The numbers are --cursor-stiffness and --cursor-damping in cursor.css.
// Every spring made here reads those same two, every frame. Tune the cursor
// and everything on a spring changes with it.
//
// How to use one:
//   const spring = makeSpring({
//     goal: () => ({ x, y }),        // where it's being pulled to. Asked every frame,
//                                    // so a goal that moves on its own (like the
//                                    // cursor's parking spot) is fine.
//     draw: (point) => { ... },      // put the thing on screen at point.x, point.y
//   });
//   spring.start();          // the goal changed: start pulling (if it isn't already)
//   spring.jumpTo({ x, y }); // be there now: no swing, no leftover speed
//   spring.stop();           // stop pulling, stay where it is
//   spring.position          // where it's drawn right now
//
// Why a spring and not a CSS transition? A transition restarts from zero
// speed every time the goal moves, so it can only lag, never overshoot.
// A spring remembers how fast it's going, and that leftover speed is the overshoot.

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

function readSetting(name) {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
}

export function makeSpring({ goal, draw }) {
  const position = { x: 0, y: 0 };   // where it's drawn
  const speed = { x: 0, y: 0 };      // how fast it's moving, in px per second
  let animating = false;
  let lastTime = 0;
  let frameId = 0;

  function jumpTo(point) {
    position.x = point.x;
    position.y = point.y;
    speed.x = 0;
    speed.y = 0;
    draw(position);
  }

  // Start the frame loop if it isn't already running. Reduced motion: no
  // swinging, just be there.
  function start() {
    if (reduceMotion.matches) {
      jumpTo(goal());
      return;
    }
    if (animating) return;
    animating = true;
    lastTime = performance.now();
    frameId = requestAnimationFrame(frame);
  }

  function stop() {
    cancelAnimationFrame(frameId);
    animating = false;
    speed.x = 0;
    speed.y = 0;
  }

  function frame(time) {
    const stiffness = readSetting("--cursor-stiffness");
    const damping = readSetting("--cursor-damping");

    // Seconds since last frame. Capped, so switching tabs and coming back
    // doesn't make it fly off from one giant step.
    let seconds = Math.min(Math.max((time - lastTime) / 1000, 0), 1 / 30);
    lastTime = time;
    const target = goal();

    // Do the math in tiny slices (1/240s). Big slices with extreme settings
    // can make the spring blow up and fly off screen.
    while (seconds > 0) {
      const slice = Math.min(seconds, 1 / 240);
      for (const axis of ["x", "y"]) {
        const pull = stiffness * (target[axis] - position[axis]);  // farther away = stronger pull
        const brake = damping * speed[axis];                       // faster = stronger brake
        speed[axis] += (pull - brake) * slice;
        position[axis] += speed[axis] * slice;
      }
      seconds -= slice;
    }
    draw(position);

    // Close enough and barely moving: snap the last fraction of a pixel and stop
    // the loop, so nothing runs while it's still.
    const distance = Math.hypot(target.x - position.x, target.y - position.y);
    const moving = Math.hypot(speed.x, speed.y);
    if (distance < 0.1 && moving < 1) {
      jumpTo(target);
      animating = false;
      return;
    }
    frameId = requestAnimationFrame(frame);
  }

  return { position, start, jumpTo, stop };
}
