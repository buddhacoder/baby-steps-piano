# UI Context

## Product Surface
Baby Steps is a dense browser-based piano learning lab with mode tabs, a persistent keyboard surface, a right-side control drawer, coach panels, practice cards, and a Theory Course Studio. The decoder wheel belongs in a learning/theory surface, not as a marketing hero.

## Design System
Baby Steps should feel like a cozy iPad music lab: playful-cozy with serious music underneath. Use Apple-like restraint for tactile responsiveness and Duolingo-like encouragement for practice loops, without mascot/cartoon styling. Prefer subtle motion, warm feedback, and audio-aligned visual behavior over decorative animation.

## UX Constraints
Premium polish must not slow down practice. Motion should be quick, meaningful, and optional through reduced-motion fallbacks. Haptic-style feedback should be progressive enhancement only. Automated playback should not spam tactile effects. Correct, incorrect, save, and completion states should be warm and clear without harsh failure language.

## Milestone 4 UI Note
Auth/profile work should feel like a quiet utility layer in the existing app, not a new account portal. Keep sign-in, signed-in identity, profile mastery stats, badges, and lesson-stack persistence visible enough to trust, but do not let account UI compete with practice controls or the piano surface.

## Non-UI Project Note
Milestone 4 may require Supabase schema, runtime config, auth, and persistence changes. Keep those changes narrow, optional when unconfigured, and compatible with the existing signed-out localStorage workflow.
