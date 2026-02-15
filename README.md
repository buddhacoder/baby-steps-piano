# Baby Steps Piano Lab

ADHD-friendly adult piano learner web app with:
- chord/progression ear and theory tools
- scales/arpeggios + fingering guidance
- AI coach endpoint with provider fallback (Ollama Gemma -> OpenAI -> cloud fallback -> offline template)
- local progress tracking + personalized sequencing

## Audio Architecture

The canonical music engine setup is documented here:

- `MUSIC_ENGINE.md`

Current production baseline:

- Tone.js sampler is the primary engine.
- Chords are triggered sample-accurately (no intentional spread).
- Legacy engines are fallback only.

## Run

1. Set env vars (optional but recommended):

```bash
export OPENAI_API_KEY="your_key"
export OPENAI_MODEL="gpt-4.1-mini"
export COACH_PROVIDER="auto" # auto|ollama|openai|pollinations|offline
export OLLAMA_URL="http://127.0.0.1:11434"
export OLLAMA_MODEL="gemma3:4b"
export POLLINATIONS_ENABLED="true"
export PORT=3000
```

2. Start:

```bash
npm start
```

3. Open:

`http://localhost:3000`

## Notes

- AI coach uses `POST /api/coach`.
- AI coach stream endpoint: `POST /api/coach/stream` (NDJSON chunks).
- Coach status endpoint: `GET /api/coach/status`.
- `OPENAI_API_KEY` is optional when Ollama or cloud fallback is available.
- Progress/streak data persists in browser `localStorage` under `baby-steps-progress-v1`.
- Rebuild recorded chord assets with `npm run audio:build-chords`.
