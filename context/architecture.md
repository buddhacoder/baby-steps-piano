# Architecture

## Stack
Baby Steps is a mostly vanilla web app served by `server.js`. The frontend is plain HTML, CSS, and JavaScript in `index.html`, `styles.css`, `app.js`, and `theory.js`. It uses Tone.js and RNBO in-browser for audio, optional Supabase integration, and a Node server for coach and repertoire endpoints.

## Layers
- `index.html`: static document structure, app panels, mode surfaces, script loading.
- `styles.css`: visual styling, responsive layout, mode-specific display, and component states.
- `app.js`: main application state, rendering, piano/chord interactions, audio triggering, coach UI wiring, theory rendering, and local persistence.
- `theory.js`: theory curriculum data and lesson content.
- `server.js`: local/hosted Node API for coach, streaming coach, status, and repertoire MIDI proxy.
- `data/`: repertoire and practice-path data.

## Dependency Direction
The browser loads `theory.js`, data scripts, external audio libraries, then `app.js`. Frontend code may call server endpoints, but server code must not depend on browser globals. New UI should be implemented with existing vanilla DOM patterns unless a project context update explicitly allows a new framework.

## Invariants
- Keep the app runnable with `npm start` and browser access to `http://localhost:3000`.
- Preserve existing mode switching and data-mode visibility behavior.
- Preserve audio-clock scheduling assumptions and do not convert musical playback to chained timeout scheduling.
- Preserve current chord-palette row/selection behavior unless a task explicitly targets it.
- Keep high-fidelity decoder work scoped to the learner/theory surface and shared frontend files.
- Feel Layer work must remain a frontend enhancement layer: CSS tokens/classes and small DOM helpers in `app.js`, without changing backend APIs, persistence schemas, or musical scheduling semantics.
