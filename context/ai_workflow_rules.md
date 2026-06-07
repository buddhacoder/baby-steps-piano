# AI Workflow Rules

## Allowed Agent Behavior
Agents may edit `index.html`, `styles.css`, `app.js`, `theory.js`, and `context/progress_tracker.md` for focused frontend learning-tool work. For Milestone 4 auth/profile work, agents may also edit `supabase.js`, `supabase/migrations/`, `server.js`, `IMPLEMENTATION_TODO.md`, `AI_AGENT_HANDOFF.md`, and relevant context files. Agents may run `npm run check`, start the local server, and capture browser screenshots for verification.

## Restricted Behavior
Do not commit secrets, edit `.env`, add external dependencies, replace the audio stack, rewrite the app architecture, or introduce remote assets for the decoder. Do not present memory-derived behavior as current without checking files. Supabase URL and anon key may be referenced through environment variable names only.

## Micro-Unit Scope
Work in one visible user-facing slice at a time. The current micro-unit is Milestone 4 planning and readiness alignment for cross-device Supabase Google sign-in. Implementation should proceed in small slices: auth baseline, cloud migration, cloud load/re-rendering, badge/profile polish, then cross-device verification.

## Required Verification
Run `npm run check`. For Milestone 4 changes, verify the app in a browser at `http://localhost:3000` or an equivalent local port. Required smoke coverage: signed-out localStorage fallback, Google sign-in/sign-out when credentials are configured, first sign-in migration, lesson stack after refresh, profile/badge rendering, and second-browser/device cloud restore when a Supabase project is available.
