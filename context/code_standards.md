# Code Standards

## Style
Use readable vanilla JavaScript with descriptive function names and local helper functions. Prefer existing app patterns over new abstractions. Keep CSS class names explicit and scoped to the feature surface they style. Add comments only where the rendering or music-theory mapping would otherwise be hard to follow.

## Testing
Run syntax checks after JavaScript changes. For UI work, also perform a browser or screenshot check when practical.

## Clean Compilation Check
`npm run check`

## Error Handling
Frontend interactions should fail gracefully when optional APIs or audio are unavailable. Decoder interactions should not require network access after the app shell has loaded. Do not break localStorage progress loading.
