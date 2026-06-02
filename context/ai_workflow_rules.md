# AI Workflow Rules

## Allowed Agent Behavior
Agents may edit `index.html`, `styles.css`, `app.js`, `theory.js`, and `context/progress_tracker.md` for focused frontend learning-tool work. Agents may run `npm run check`, start the local server, and capture browser screenshots for verification.

## Restricted Behavior
Do not commit secrets, edit `.env`, add external dependencies, replace the audio stack, rewrite the app architecture, or introduce remote assets for the decoder. Do not present memory-derived behavior as current without checking files.

## Micro-Unit Scope
Work in one visible user-facing slice at a time. The current micro-unit is the first Baby Steps Feel Layer pass: shared CSS motion/feedback tokens, subtle tactile keyboard state, warm success/error/save feedback, coach/lesson card entrance polish, and reduced-motion fallbacks. Keep this as a broad but shallow polish layer, not a redesign.

## Required Verification
Run `npm run check`. For Feel Layer UI changes, verify in a browser at `http://localhost:3000` or an equivalent local screenshot and confirm the primary app shell renders without console-blocking syntax errors.
