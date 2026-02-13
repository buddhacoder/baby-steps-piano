# RNBO Piano Patch Assets

Place your RNBO web export files in this folder:

- `patch.export.json` (required)
- `dependencies.json` (optional, required only if patch uses external buffers)
- Any audio/media files referenced by `dependencies.json`

This app loads:

- `./assets/rnbo/piano/patch.export.json`
- `./assets/rnbo/piano/dependencies.json`

If the patch is missing or fails to initialize, the app automatically falls back to the built-in local piano sample engine.
