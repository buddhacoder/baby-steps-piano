# Baby Steps Piano Lab

ADHD-friendly adult piano learner web app with:
- chord/progression ear and theory tools
- scales/arpeggios + fingering guidance
- AI coach endpoint backed by OpenAI
- local progress tracking + personalized sequencing

## Audio Architecture

The canonical music engine setup is documented here:

- `MUSIC_ENGINE.md`

Current production baseline:

- Tone.js sampler is the primary engine.
- Chords are triggered sample-accurately (no intentional spread).
- Legacy engines are fallback only.

## Run

1. Set env vars:

```bash
export OPENAI_API_KEY="your_key"
export OPENAI_MODEL="gpt-4.1-mini"
export PORT=3000
```

2. Start:

```bash
npm start
```

3. Open:

`http://localhost:3000`

## Notes

- AI coach uses `POST /api/coach` and requires `OPENAI_API_KEY`.
- Progress/streak data persists in browser `localStorage` under `baby-steps-progress-v1`.
- Rebuild recorded chord assets with `npm run audio:build-chords`.
