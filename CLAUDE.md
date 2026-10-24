# CLAUDE.md — motion-lab

Read this before doing anything in this repo.

## What this repo is

A shelf for small interactive things where the movement is the point.

Each thing lives in its own numbered folder. Plain HTML, CSS and JavaScript.
No frameworks, no npm, no build step. Open the file in a browser and it works.

Anything goes as long as it passes all three:

1. One folder, a handful of files, nothing to install.
2. Readable top to bottom without getting lost.
3. The interaction is the point — not a feature the interaction decorates.

Silly and useless are fine. A button that runs away from the cursor belongs here.
A working login form does not.

If an idea grows past this — needs npm, becomes a real app, needs a 3D library —
say so out loud. It becomes its own repo and gets linked from here instead.

## Who you're working with

Tristan. Third-year CS student, strong background in After Effects and motion
graphics, still early in front-end code. He can see when motion is wrong long
before he can name the number that's causing it.

How to talk to him:

- Short answers. No padding, no recap of what he just said.
- Plain words. If a technical term is unavoidable, explain it in one line the
  first time it appears.
- Never dump a wall of text. If the answer is long, it's probably the wrong answer.
- Don't hedge. Pick the option you think is right and say why in one sentence.
- Say when something is a bad idea. He'd rather hear it than find out later.

## How to build a component

The split is fixed:

- **You write the wiring.** Markup, state logic, structure.
- **He tunes the feel.** Durations, easing, distances.

So every value he might want to change goes in a `:root` block at the very top
of `style.css`, as CSS variables, with a short comment on each. He should never
have to read past that block to adjust how something feels.

When he describes motion in vague terms — "snappier", "it should bounce a bit",
"too floaty" — don't ask for numbers. Pick numbers, put them in, and tell him
which variable to move if it's wrong.

Never leave a value blank for him to fill in. A guess he can argue with beats a
blank he can't.

## Folder rules

```
motion-lab/
  README.md              ← index: one line per component
  CLAUDE.md              ← this file
  01-submit-button/
    index.html
    style.css
    script.js
    README.md            ← the state doc
  02-whatever/
```

Numbered prefixes, two digits. Never renumber an existing folder.

## Every component needs a README

Four parts, in this order:

1. One line on what it is.
2. A table of every state change: from, to, duration, easing, what moves.
3. A short "decisions" section — why a number is what it is, in plain language.
4. A "rough edges" section — what's broken or unfinished. Be honest here.

This is the part that turns a fiddled-with button into something worth showing.
Don't skip it and don't pad it.

## Do

- Keep every component small enough to read in one sitting.
- Put all tunable values at the top of the CSS.
- Comment the weird bits — anything he'd have to look up.
- Use `data-state` on the element as the one source of truth, and let CSS react to it.
- Respect `prefers-reduced-motion` in every component.
- Make keyboard focus visible.
- Suggest breaking a number on purpose so he can feel what it does.

## Don't

- Don't add a framework, a build step, or a package.
- Don't write code he can't read. If it needs a clever trick, explain it or skip it.
- Don't build the root gallery page until there are five or more components.
- Don't refactor working components unprompted.
- Don't write a spinner and call the pending state done.
- Don't use jargon without explaining it.
- Don't produce more than one component per request unless asked.

## Git habits — this repo moves between computers

Tristan works on this from more than one machine. GitHub holds the real version;
every computer only has a copy.

- At the start of a session, run `git pull` before touching anything.
- At the end, commit and push. Never leave work sitting uncommitted overnight.
- If he forgets and ends up with a conflict, walk him through it in plain words.
  Don't assume he knows what a merge conflict is.
- Claude stages and commits. Claude does NOT push — Tristan runs `git push` himself.
- Write the commit message, make the commit, then tell him it's ready to push.

One commit per component. The message says what it is, never "update".

```
add submit button with pending to success arc
```

## Where this is going

This repo becomes the projects section of Tristan's portfolio site. It starts as
a scratchpad and gets presentable later — so don't polish early, but don't leave
a component undocumented either.

It also feeds into a longer path: plain CSS now, GSAP when CSS genuinely can't
express something (interruptible timelines, mid-flight reversals, complex
sequencing). When that moment arrives, point it out — that's the natural door
into the next stage, and hitting it for a real reason is better than reading
about it.
