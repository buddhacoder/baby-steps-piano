# Baby Steps AI Agent Handoff

This document is the onboarding + execution runbook for a new AI coding agent taking over this repo.

## 1) Product Intent (North Star)

Baby Steps is a **music theory learning lab** for adults, not just a virtual instrument.  
Users experiment with harmony/scales/cadences, hear immediate audio feedback, and transfer concepts to real piano.

Core UX principles:
- Instant audio + visual mapping between concept and keyboard.
- Minimal clicks to run musical examples.
- Structured progression from beginner to advanced theory fluency.
- AI coach should produce playable concept artifacts and route users into guided lessons.

## 2) Current Build Status

Branch at handoff: `codex/lesson-artifacts-m2-artifact-quiz`  
Latest pushed commit: `73bb5a5`

### Completed milestones
- Milestone 1: Threaded AI coach + structured artifact response.
- Milestone 2: Artifact card playback policies + cadence quiz + mastery tracking.
- Milestone 3: Lesson Stack + continue flow + completion events wired into progress.

Reference checklist:
- `/Users/macstudiodaddy/projects/Baby Steps/IMPLEMENTATION_TODO.md`

## 3) Runtime/Stack Overview

### Frontend
- Plain HTML/CSS/JS app (no SPA framework).
- Main files:
  - `/Users/macstudiodaddy/projects/Baby Steps/index.html`
  - `/Users/macstudiodaddy/projects/Baby Steps/styles.css`
  - `/Users/macstudiodaddy/projects/Baby Steps/app.js`
  - `/Users/macstudiodaddy/projects/Baby Steps/theory.js`

### Backend
- Single Node server:
  - `/Users/macstudiodaddy/projects/Baby Steps/server.js`
- AI endpoints:
  - `POST /api/coach`
  - `POST /api/coach/stream` (NDJSON stream)
  - `GET /api/coach/status`
- Repertoire MIDI proxy:
  - `GET /api/repertoire/midi?url=...`

### Audio engine
- Canonical doc:
  - `/Users/macstudiodaddy/projects/Baby Steps/MUSIC_ENGINE.md`
- Current baseline:
  - Tone.js sampler primary
  - audio-clock scheduling for musical events
  - no chained timeout scheduling for audio

## 4) Key Data + Persistence

### Browser storage
- Progress key: `baby-steps-progress-v1`
- Coach threads key: `baby-steps-coach-threads-v1`
- Coach lesson stack key: `baby-steps-coach-lesson-stack-v1`

### Progress fields currently in use
- `theoryCompletedLessons`
- `theoryLessonRuns`
- `theoryCustomLessons`
- `conceptMastery`
- `artifactAttempts`

### Repertoire data
- `/Users/macstudiodaddy/projects/Baby Steps/data/repertoire.json`
- `/Users/macstudiodaddy/projects/Baby Steps/data/repertoire_styles.json`
- `/Users/macstudiodaddy/projects/Baby Steps/data/repertoire.seed.js`

## 5) Features Currently Live (User-facing)

- Piano keyboard with highlight window (8 white-key span).
- Palette tabs:
  - Chords, Scales, Arpeggios, Modes, Pentatonic, Color, Secondary, Borrowed, Substitution, Cadences.
- Explore Harmony toggle in Chords tab.
- Right-side drawer:
  - Session controls (BPM/subdivision/mode)
  - Concept Lab + Glossary
  - Repertoire & Studies
  - Guided Exercises
- AI Coach panel:
  - threaded conversation
  - artifact cards (`Play`, `Try`, `Save to Stack`, `Open Full Lesson`)
  - cadence quiz grading + mastery counters
  - Lesson Stack with `Continue Lesson`, `Play`, `Remove`
- Theory mode:
  - guided lessons with objective/steps/pass criteria
  - lesson completion tracking
  - custom generated lessons from coach artifacts

## 6) Locked Behavior Rules (Do Not Break)

- Circular resolve + green/confetti is only for chord-palette-style row sweeps.
- Cadence demos/artifacts are fixed-sequence (no circular wrapping).
- Audio events must remain audio-clock scheduled.
- AI coach remains threaded (not single-turn stateless output).

## 7) Immediate Next Work (Milestones 4–7)

## Milestone 4: Auth + Profile + Badges (Supabase + Google)

Goal:
- User account system with Google login and cloud persistence for progress/mastery/lesson stack.

Tasks:
1. Add Supabase client integration and env wiring.
2. Add auth UI (sign-in/sign-out) in drawer or header.
3. Create profile section:
   - mastery summary
   - badge list
4. Add badge rules from concept mastery thresholds.
5. Migration path:
   - on first sign-in, upload local progress to cloud profile.

Acceptance:
- Signed-in user sees persistent lesson stack + mastery + badges across sessions/devices.

## Milestone 5: Chords Dropdown Mode Redesign

Goal:
- Replace fixed “Chords tab label” concept with mode dropdown:
  - `Chord Palette`
  - `Circle of Fifths`
  - `Cadences`

Tasks:
1. Build dropdown in chord section header.
2. Add interactive circle of fifths mode.
3. Expand cadence catalog UI to support more cadence families.
4. Preserve current chord-palette behavior exactly (especially row/column sweep logic).

Acceptance:
- Mode switching stable and each mode plays correct musical behavior.

## Milestone 6: Score Import

Phase A:
- Import/play ABC, MIDI, MusicXML.
- Convert imported material to lesson artifact cards.

Phase B:
- PDF sheet pipeline (OMR + correction UI + confidence score).

Acceptance:
- User imports score and can play + save it as lesson artifact.

## Milestone 7: Google Drive Integration

Goal:
- Drive picker + import to internal library.

Tasks:
1. Add OAuth scopes for Drive read access.
2. Add picker flow.
3. Ingest selected score files through Milestone 6 pipeline.
4. Store imported items as playable artifacts/cards.

Acceptance:
- User can select files from Drive and run them inside Baby Steps.

## 8) Suggested Branching + PR Strategy

- Keep one branch per milestone:
  - `codex/lesson-artifacts-m4-auth-profile-badges`
  - `codex/lesson-artifacts-m5-chord-dropdown-modes`
  - `codex/lesson-artifacts-m6-score-import`
  - `codex/lesson-artifacts-m7-drive-integration`
- Keep PRs milestone-scoped (no mixed milestone changes).
- Run checks before each push:
  - `npm run check`

## 9) Quick Start for New Agent

1. Install deps:
```bash
npm install
```
2. Start app:
```bash
npm start
```
3. Open:
- `http://localhost:3000` (or configured `PORT`)
4. Validate baseline quickly:
- open Coach mode
- generate artifact
- save to stack
- continue lesson in Theory mode

## 10) Known Risks / Cautions

- Avoid introducing new timing systems; reuse existing scheduler path.
- Keep chord simultaneity tight (no audible spread).
- Do not ship copyrighted songs/audio files without proper rights.
- Preserve existing storage keys unless explicit migration code is added.

## 11) Recommended First Task for Incoming Agent

Start Milestone 4 in this order:
1. Add Supabase config + auth shell UI.
2. Persist/load `progress`, `lessonStack`, `conceptMastery`, `artifactAttempts` for signed-in users.
3. Add profile panel + initial badge rendering.
4. Add one-way local-to-cloud migration on first successful login.

