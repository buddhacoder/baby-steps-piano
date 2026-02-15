# Baby Steps Implementation TODO

This is the working execution list for the next build phase.

## Ground Rules (Locked Behavior)

- [x] `Open Full Lesson` is the button label (replace `Go to Lesson`).
- [ ] Circular resolve + green/confetti applies **only** to `Chord Palette` row-label sweeps.
- [ ] Cadence demos and cadence lesson artifacts are always fixed sequences (no circular wrap).
- [ ] All playback remains audio-clock scheduled (no chained timeout audio scheduling).
- [ ] AI Coach must behave as threaded conversation, not single-turn Q/A.

## Milestone 1: Threaded AI Coach + Artifact Output Contract

- [x] Add conversation thread model (`threadId`, message history, timestamps).
- [x] Add coach chat UI with scrolling history and “new thread”.
- [x] Add structured coach response schema: `assistantText` + optional `artifact`.
- [x] Validate artifact JSON server-side before returning.
- [x] Add response streaming for better conversational feel.
- [x] Replace all `Go to Lesson` labels with `Open Full Lesson`.

Definition of done:
- [x] User can ask follow-up questions and assistant has context from prior turns.
- [x] At least one artifact appears from coach output with valid controls.

## Milestone 2: Artifact Card Playback + Quiz + Mastery Tracking

- [x] Build artifact card UI: `Play`, `Try`, `Save to Stack`, `Open Full Lesson`.
- [x] Implement playback policy per artifact:
- [x] `fixed_sequence` for cadences and concept demos.
- [x] `circular_row_sweep` for chord-palette row-drill artifacts only.
- [x] Implement quiz grading for cadence concept checks.
- [x] Persist attempt outcomes and update concept mastery counters.

Definition of done:
- [x] Plagal cadence artifact demo + quiz works end-to-end.
- [x] Correct/incorrect attempts update mastery state.

## Milestone 3: Lesson Stack (Interactive Cards)

- [x] Add lesson stack view (ordered concept cards).
- [x] `Open Full Lesson` routes to structured lesson card:
- [x] objective, steps, pass criteria, progress.
- [x] Add “save to stack” and “continue lesson” behaviors.
- [x] Add lesson completion events to profile progress.

Definition of done:
- [x] User can open full lesson from artifact and complete the lesson flow.

## Milestone 4: Auth + Profile + Badge System (Supabase + Google)

- [ ] Add Supabase project wiring (env + client + server auth checks).
- [ ] Add Google sign-in/out flow.
- [ ] Add profile page with mastery summary and badge list.
- [ ] Add badge award rules from concept mastery thresholds.
- [ ] Migrate local-only progress into signed-in account data.

Definition of done:
- [ ] Signed-in user sees persistent lesson stack, mastery, and earned badges.

## Milestone 5: Chords Dropdown Mode Redesign

- [ ] Convert chords header control to dropdown:
- [ ] `Chord Palette`
- [ ] `Circle of Fifths`
- [ ] `Cadences`
- [ ] Add interactive Circle of Fifths mode.
- [ ] Expand Cadences mode to support a larger cadence catalog.
- [ ] Keep Chord Palette behavior unchanged except where explicitly locked above.

Definition of done:
- [ ] Dropdown mode switching is stable and each mode has correct playback behavior.

## Milestone 6: Score Import (Phase A then B)

Phase A:
- [ ] Import/play ABC, MIDI, and MusicXML files.
- [ ] Convert imported score material into playable lesson artifacts.

Phase B:
- [ ] Add PDF sheet music ingestion pipeline (OMR + correction pass).
- [ ] Show confidence + allow user correction before lesson generation.

Definition of done:
- [ ] User can import a score, preview, play, and save as lesson artifact.

## Milestone 7: Google Drive Integration

- [ ] Add Drive OAuth scopes and consent flow.
- [ ] Add Drive picker for sheet files.
- [ ] Import selected files into user library.
- [ ] Convert imports to playable artifacts and lesson cards.

Definition of done:
- [ ] User can pick from Drive and run imported content in-app.

## Branch Strategy (Simple + Safe)

- Main approach: one parent epic branch + one branch per milestone.
- Naming pattern:
- `codex/lesson-artifacts-m1-threaded-coach`
- `codex/lesson-artifacts-m2-artifact-quiz`
- `codex/lesson-artifacts-m3-lesson-stack`
- etc.
- Merge each milestone to the parent epic branch after QA passes.
- Open PR from parent epic branch to `main` only after milestones are stable.

Why this approach:
- Keeps PRs small enough to review.
- Reduces risk of conflicts and regressions.
- Lets us demo and test each milestone independently.
