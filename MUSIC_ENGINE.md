# Baby Steps Music Engine

This document is the canonical reference for the current working audio architecture.

## Current Baseline (Do Not Regress)

- Primary engine: **Tone.js Sampler**
- Chord behavior: sample-accurate same-time triggering on one shared clock
- Legacy engines remain as fallback only
- Known-good bundle stamp: `app.js?v=20260212p` (in `index.html`)

If chord notes begin to sound separated again, treat that as a regression against this baseline.

## Design Goals

- Chords must sound like simultaneous key press events, not strummed.
- Single-note key response must feel immediate.
- Engine must survive browser autoplay policy and load-order issues.
- Fallbacks should preserve sound even when optional engines fail.

## Engine Stack and Routing

Main entrypoint is `playMidiNotes(...)` in `app.js`.

Priority order:

1. **Tone Sampler (primary)**
2. **Recorded chord one-shot playback path** (strict chord mode branch)
3. **RNBO** (only when Tone is unavailable)
4. **WebAudio Salamander sample synthesis path**
5. **HTML audio compatibility fallback** (mainly `file://` / constrained environments)

In practice, with current setup (`USE_TONE_ENGINE = true` and Tone script loaded), Tone handles normal playback first.

## Tone.js Primary Engine

### Key constants and state

- `USE_TONE_ENGINE = true`
- `toneSampler`, `toneEngineReady`, `toneEngineInitPromise`

### Initialization

- `ensureToneEngine()`:
  - calls `Tone.start()` (requires user gesture)
  - resumes Tone context if needed
  - constructs `Tone.Sampler` from local Salamander sample URLs
  - has a 5-second timeout guard (`Promise.race`) to avoid hanging forever

- `bindAudioUnlock()` ensures Tone init is attempted on pointer/touch/keyboard gesture.

### Playback

- `playMidiNotesWithToneEngine(midiNotes, options)`:
  - converts MIDI to note names via `midiToNoteName`
  - schedules trigger at `Tone.now() + 0.002`
  - chords use one `triggerAttackRelease([...notes])` call
  - melody paths can stagger when `asChord === false`

This is the mechanism that removed audible chord spread.

## Why This Solved Chord Separation

Tone schedules chord note events against one internal clock and one trigger call for chord arrays.
That avoids the prior race/offset behavior from mixed async decode + multi-path playback.

## Fallback and Legacy Paths

These still exist and are useful for resilience:

- RNBO path (`initializeRnboEngine`, `playMidiNotesWithRnbo`)
- Recorded chord manifest/buffer path (`assets/chords/manifest.json`, `queueChordAssetPlayback`)
- WebAudio sample voice path (`playSampleVoice`, `playSampleChordCluster`)
- HTML audio pool fallback

RNBO primary usage is gated by:

- `shouldUseRnboPrimaryEngine()`
- currently false when Tone is available

## Assets and Build Inputs

### Salamander sample set (Tone source)

- Directory: `assets/salamander`
- Used to populate Tone sampler note map in `getToneSamplerUrls()`

### Recorded chord assets (secondary)

- Manifest: `assets/chords/manifest.json`
- Audio files: `assets/chords-recorded`
- Build script: `scripts/build-dcd-chord-pack.mjs`
- NPM script: `npm run audio:build-chords`

## Files Senior Devs Should Read First

1. `app.js`
2. `index.html`
3. `MUSIC_ENGINE.md` (this file)
4. `scripts/build-dcd-chord-pack.mjs`
5. `package.json`

## Operational Checklist

After audio refactors:

1. Run `npm run check`
2. Hard refresh browser (`Cmd+Shift+R`)
3. Verify UI status shows: `Audio: Tone sampler active (low-latency mode).`
4. Test:
   - single key click
   - rapid chord switching from chord table
   - progression playback

## Regression Guardrails

- Do not remove Tone script include from `index.html`.
- Do not set `USE_TONE_ENGINE` to false unless intentionally testing fallback behavior.
- Keep gesture-driven init in `bindAudioUnlock()`.
- Avoid reintroducing chord paths that schedule notes independently when Tone is active.

## Known Tradeoffs

- Tone init depends on user gesture due to browser autoplay policy.
- Legacy fallback logic remains complex because of cross-browser resilience needs.
- Recorded one-shot chord path remains in codebase but is not primary under current Tone setup.
