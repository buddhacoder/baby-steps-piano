const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const DEGREE_TO_SEMITONE = [0, 2, 4, 5, 7, 9, 11];
const ROMAN = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
const PROGRESS_STORAGE_KEY = "baby-steps-progress-v1";
const LEGACY_PROGRESS_KEYS = ["baby-steps-progress", "baby-steps-progress-v0"];
const STANDARD_WHITE_KEY_MM = 23.5;
const STANDARD_BLACK_KEY_MM = 13.7;
const STANDARD_BLACK_TO_WHITE_WIDTH_RATIO = STANDARD_BLACK_KEY_MM / STANDARD_WHITE_KEY_MM;
const KEYBOARD_FIRST_MIDI = 48;
const KEYBOARD_LAST_MIDI = 83;
const HIGHLIGHT_WINDOW_SPAN_SEMITONES = 12;
const WINDOW_KEYBOARD_NOTE_BINDINGS = [
  { code: "KeyA", offset: 0, label: "A" },
  { code: "KeyW", offset: 1, label: "W" },
  { code: "KeyS", offset: 2, label: "S" },
  { code: "KeyE", offset: 3, label: "E" },
  { code: "KeyD", offset: 4, label: "D" },
  { code: "KeyF", offset: 5, label: "F" },
  { code: "KeyI", offset: 6, label: "I" },
  { code: "KeyJ", offset: 7, label: "J" },
  { code: "KeyO", offset: 8, label: "O" },
  { code: "KeyK", offset: 9, label: "K" },
  { code: "KeyP", offset: 10, label: "P" },
  { code: "KeyL", offset: 11, label: "L" },
  { code: "Semicolon", offset: 12, label: ";" }
];
const WINDOW_KEYBOARD_OFFSETS_BY_CODE = new Map(
  WINDOW_KEYBOARD_NOTE_BINDINGS.map((binding) => [binding.code, binding.offset])
);
const LOCAL_SAMPLE_BASE = (() => {
  try {
    return new URL("./assets/salamander/", window.location.href).toString().replace(/\/$/, "");
  } catch {
    return "/assets/salamander";
  }
})();
const SALAMANDER_SAMPLE_NOTES = [
  "A0", "C1", "Ds1", "Fs1", "A1", "C2", "Ds2", "Fs2", "A2", "C3",
  "Ds3", "Fs3", "A3", "C4", "Ds4", "Fs4", "A4", "C5", "Ds5", "Fs5",
  "A5", "C6", "Ds6", "Fs6", "A6", "C7", "Ds7", "Fs7", "A7", "C8"
];
const SALAMANDER_SAMPLE_MIDI = SALAMANDER_SAMPLE_NOTES.map(sampleNoteToMidi);
const HTML_SAMPLE_POOL_SIZE = 4;
const MAX_PENDING_PLAY_REQUESTS = 32;
const RNBO_PATCH_URL = "./assets/rnbo/piano/patch.export.json";
const RNBO_DEPENDENCIES_URL = "./assets/rnbo/piano/dependencies.json";
const CHORD_ASSET_MANIFEST_URL = "./assets/chords/manifest.json";
const STRICT_SINGLE_FILE_CHORD_MODE = true;
const USE_TONE_ENGINE = true;
const SAMPLE_ONSET_SCAN_SECONDS = 0.4;
const SAMPLE_ONSET_MIN_THRESHOLD = 0.0035;
const SAMPLE_ONSET_MAX_THRESHOLD = 0.03;
const SAMPLE_ONSET_RATIO = 0.12;
const SAMPLE_ONSET_CONFIRM_SAMPLES = 24;
const CHORD_TRANSIENT_TRIM_SECONDS = 0.008;

const CHORDS = {
  major: { intervals: [0, 4, 7], label: "Major", short: "" },
  minor: { intervals: [0, 3, 7], label: "Minor", short: "m" },
  diminished: { intervals: [0, 3, 6], label: "Diminished", short: "dim" },
  augmented: { intervals: [0, 4, 8], label: "Augmented", short: "+" },
  sus2: { intervals: [0, 2, 7], label: "Sus2", short: "sus2" },
  sus4: { intervals: [0, 5, 7], label: "Sus4", short: "sus4" },
  maj7: { intervals: [0, 4, 7, 11], label: "Major 7", short: "maj7" },
  min7: { intervals: [0, 3, 7, 10], label: "Minor 7", short: "m7" },
  dom7: { intervals: [0, 4, 7, 10], label: "Dominant 7", short: "7" },
  m7b5: { intervals: [0, 3, 6, 10], label: "Half-Diminished", short: "m7b5" }
};

const SCALE_FAMILIES = {
  "major (classical)": {
    intervals: [0, 2, 4, 5, 7, 9, 11, 12],
    useCase: "foundation for harmony, sight reading, and standard repertoire"
  },
  "natural minor (classical)": {
    intervals: [0, 2, 3, 5, 7, 8, 10, 12],
    useCase: "minor-key pieces and emotional contrast"
  },
  "major bebop (jazz)": {
    intervals: [0, 2, 4, 5, 7, 8, 9, 11, 12],
    useCase: "smoother line-making over major chords"
  },
  "mixolydian (jazz/blues)": {
    intervals: [0, 2, 4, 5, 7, 9, 10, 12],
    useCase: "dominant chord soloing and bluesy resolution"
  },
  "minor blues (blues)": {
    intervals: [0, 3, 5, 6, 7, 10, 12],
    useCase: "blues improvisation and call-response phrasing"
  }
};

const PROGRESSIONS = {
  "I-vi-IV-V (Pop)": [0, 5, 3, 4],
  "ii-V-I (Jazz)": [1, 4, 0],
  "12-Bar Blues (I-IV-V)": [0, 0, 0, 0, 3, 3, 0, 0, 4, 3, 0, 4],
  "i-iv-VII-III (Minor cinematic)": [0, 3, 6, 2]
};

const CADENCES = {
  "Authentic (V-I)": [4, 0],
  "Plagal (IV-I)": [3, 0],
  "Half (I-V)": [0, 4],
  "Deceptive (V-vi)": [4, 5],
  "ii-V-I (Jazz cadence)": [1, 4, 0]
};

const CADENCE_PROFILES = {
  "Authentic (V-I)": {
    theory: "Dominant tension resolves to tonic stability with strongest tonal closure.",
    emotion: "Decisive, resolved, and grounded.",
    useCase: "Phrase endings, chorus landings, and final cadential bars."
  },
  "Plagal (IV-I)": {
    theory: "Subdominant moves to tonic without dominant-leading tone pressure.",
    emotion: "Warm, gentle, and reflective.",
    useCase: "Amen-style endings, softer cadence moments, and devotional color."
  },
  "Half (I-V)": {
    theory: "Moves away from tonic and stops on dominant, creating suspension.",
    emotion: "Open, expectant, and unfinished.",
    useCase: "Verse pre-turnarounds and setups into the next phrase."
  },
  "Deceptive (V-vi)": {
    theory: "Dominant avoids tonic and resolves to submediant for surprise.",
    emotion: "Bittersweet, wistful, and emotionally shifting.",
    useCase: "Emotional pivots, lyrical twists, and delayed resolution."
  },
  "ii-V-I (Jazz cadence)": {
    theory: "Pre-dominant to dominant to tonic with voice-leading-rich functional pull.",
    emotion: "Sophisticated release with confident forward motion.",
    useCase: "Jazz turnarounds, standards, and harmonic setup for improvisation."
  }
};

const CONCEPT_CATALOG = {
  progression: {
    label: "Progression",
    variants: Object.keys(PROGRESSIONS)
  },
  cadence: {
    label: "Cadence",
    variants: Object.keys(CADENCES)
  },
  voicing: {
    label: "Voicing",
    variants: ["Triad close", "7th shell", "Drop-2 flavor", "Sus color"]
  },
  scale_color: {
    label: "Scale Color",
    variants: Object.keys(SCALE_FAMILIES)
  }
};

const GLOSSARY_ITEMS = [
  {
    id: "term_tonic",
    kind: "term",
    name: "Tonic",
    symbol: "I",
    definition: "Home chord/key center where phrases feel resolved.",
    emotion: "Stable, grounded, complete.",
    useCase: "Start and end sections, or reset tension.",
    example: { type: "chord", quality: "major" }
  },
  {
    id: "term_dominant",
    kind: "term",
    name: "Dominant",
    symbol: "V",
    definition: "Function that points strongly back to tonic.",
    emotion: "Urgent, leaning forward, expectant.",
    useCase: "Build pre-chorus or phrase-end tension.",
    example: { type: "chord", degree: 4, quality: "dom7" }
  },
  {
    id: "term_voice_leading",
    kind: "term",
    name: "Voice Leading",
    symbol: "VL",
    definition: "Smooth movement between chord tones using shortest note paths.",
    emotion: "Connected, elegant, flowing.",
    useCase: "Make progression changes sound pro and intentional.",
    example: { type: "progression", name: "ii-V-I (Jazz)" }
  },
  {
    id: "sym_maj7",
    kind: "symbol",
    name: "Major 7 Symbol",
    symbol: "Δ / maj7",
    definition: "Major triad plus major 7th above root.",
    emotion: "Polished, dreamy, lush.",
    useCase: "Ballads, neo-soul, modern pop intros.",
    example: { type: "chord", quality: "maj7" }
  },
  {
    id: "sym_m7b5",
    kind: "symbol",
    name: "Half-Diminished",
    symbol: "ø / m7b5",
    definition: "Minor 7 chord with flat 5.",
    emotion: "Unsettled, cinematic, suspenseful.",
    useCase: "Minor ii-V-i and darker harmony.",
    example: { type: "chord", quality: "m7b5" }
  },
  {
    id: "sym_sus4",
    kind: "symbol",
    name: "Suspended 4th",
    symbol: "sus4",
    definition: "Third replaced by fourth, delaying major/minor clarity.",
    emotion: "Open, floating, unresolved.",
    useCase: "Intro chords and delayed resolution moments.",
    example: { type: "chord", quality: "sus4" }
  }
];

const ARP_TYPES = {
  "major triad": [0, 4, 7, 12, 16, 19, 24],
  "minor triad": [0, 3, 7, 12, 15, 19, 24],
  "major 7": [0, 4, 7, 11, 12, 16, 19, 23, 24],
  "dominant 7": [0, 4, 7, 10, 12, 16, 19, 22, 24]
};

const FINGERINGS = {
  "major triad": {
    right: "1-3-5 ascending, 5-3-1 descending",
    left: "5-3-1 ascending, 1-3-5 descending"
  },
  "minor triad": {
    right: "1-2-5 ascending, 5-2-1 descending",
    left: "5-3-1 ascending, 1-3-5 descending"
  },
  "major 7": {
    right: "1-2-3-5 pattern, rotate wrist lightly on 7th",
    left: "5-3-2-1 pattern, keep thumb relaxed"
  },
  "dominant 7": {
    right: "1-2-3-4 or 1-2-3-5 depending on span",
    left: "5-3-2-1 with light lateral motion"
  }
};

const LESSON_TRACKS = [
  {
    title: "Weeknight Reset (12 min)",
    steps: [
      "4 min: one chord type only (slow + eyes closed)",
      "4 min: one progression in one key",
      "4 min: one scale with metronome at comfortable tempo"
    ]
  },
  {
    title: "Theory + Ear Blend",
    steps: [
      "Name scale degrees while playing",
      "Pause after each chord and say function",
      "Improvise 4 bars using only chord tones"
    ]
  },
  {
    title: "Arpeggio Mechanics",
    steps: [
      "Hands separate first; no pedal",
      "Loop 2 octaves at 60 BPM",
      "Increase by +5 BPM only after 3 clean reps"
    ]
  }
];

const GUIDED_TRACK_DEFAULTS = {
  pop: {
    objective: "Build pop fluency by connecting harmony function to quick keyboard execution.",
    steps: [
      "Hear one model phrase in the target key.",
      "Play the same shape with steady time and minimal hand jumps.",
      "Repeat until the sound feels stable and repeatable."
    ],
    history: "Contemporary pop production made loop literacy and reliable keyboard voicing highly transferable skills.",
    funFact: "A tiny set of loop types drives a surprisingly large share of hit songs.",
    songs: [
      "Let It Be - The Beatles (functional pop cadence motion).",
      "With or Without You - U2 (loop-based emotional build)."
    ],
    practice: { mode: "progression", key: "C", progressionName: "I-vi-IV-V (Pop)" }
  },
  classical: {
    objective: "Translate theory labels into accurate, controlled classical keyboard movement.",
    steps: [
      "Hear the reference once and identify tonal center.",
      "Play slowly with balanced touch and clear note connection.",
      "Repeat with no rhythmic breaks and cleaner tone each pass."
    ],
    history: "Classical training formalized scales, cadences, and functional hearing as core literacy tools.",
    funFact: "Many technique drills lasted because they are both musical and ergonomic.",
    songs: [
      "Prelude in C - J. S. Bach (voice-leading clarity).",
      "Fur Elise - Beethoven (cadential gravity and phrasing)."
    ],
    practice: { mode: "scale", key: "C", scaleType: "major (classical)" }
  },
  jazz: {
    objective: "Internalize tension and release through compact voicings and functional movement.",
    steps: [
      "Hear one model pass and call out tension points.",
      "Play the same idea with close voice-leading.",
      "Log repeated attempts while preserving groove and touch."
    ],
    history: "Jazz pedagogy grew from ear tradition into codified cadence and guide-tone practice systems.",
    funFact: "Many strong jazz pianists train tiny voicing cells in all keys, not huge shapes in one key.",
    songs: [
      "Autumn Leaves (ii-V-I and functional release).",
      "Blue Bossa (minor and dominant cadence language)."
    ],
    practice: { mode: "cadence", key: "F", cadenceName: "ii-V-I (Jazz cadence)" }
  }
};

const GUIDED_LESSON_BLUEPRINTS = {
  "pop-0": {
    objective: "Lock in the core four-chord loop and hear home vs movement clearly.",
    steps: [
      "Hear one full loop in C and identify the home chord by ear.",
      "Play the loop in time with efficient finger movement.",
      "Replay the loop in G and compare emotional contour."
    ],
    history: "The four-chord loop became a writing backbone for mainstream pop in the late 1990s and 2000s.",
    funFact: "Comedy medleys proved dozens of chart songs can share the same core progression shape.",
    songs: [
      "Someone Like You - Adele (loop-based emotional phrasing).",
      "No Woman No Cry - Bob Marley (cyclic harmonic storytelling)."
    ],
    practice: { mode: "progression", key: "C", progressionName: "I-vi-IV-V (Pop)" }
  },
  "pop-1": {
    objective: "Use sus/add colors without losing functional clarity or timing.",
    steps: [
      "Hear how sus/add tones delay or brighten resolution.",
      "Play Csus4 and resolve cleanly into stable triad color.",
      "Repeat over a pop loop while keeping right-hand top note smooth."
    ],
    history: "Pop arrangers used suspension and added tones to modernize triads while keeping hooks simple.",
    funFact: "A single suspended note can make a familiar progression feel instantly newer.",
    songs: [
      "Every Breath You Take - The Police (suspended color motion).",
      "Free Fallin' - Tom Petty (add-tone brightness in pop texture)."
    ],
    practice: { mode: "chord", key: "C", chordQuality: "sus4", inversion: "root position" }
  },
  "pop-2": {
    objective: "Shape neo-soul color with smooth inner movement and controlled tension.",
    steps: [
      "Hear one color-rich loop and identify where tension blooms.",
      "Play compact voicings with minimal vertical jump.",
      "Repeat at least three attempts while preserving groove and tone."
    ],
    history: "Neo-soul fused gospel harmony, jazz extensions, and modern groove production in the late 1990s onward.",
    funFact: "Moving one inner note can transform mood more than changing the entire chord root.",
    songs: [
      "Best Part - Daniel Caesar (warm extension-based harmony).",
      "Untitled (How Does It Feel) - D'Angelo (neo-soul voicing color)."
    ],
    practice: { mode: "progression", key: "A", progressionName: "i-iv-VII-III (Minor cinematic)" }
  },
  "classical-0": {
    objective: "Anchor staff-reading fundamentals to immediate keyboard orientation.",
    steps: [
      "Hear and play C major slowly from the tonal center.",
      "Call out note names while keeping hand posture relaxed.",
      "Repeat with even rhythm and cleaner attack."
    ],
    history: "Treble/bass staff fluency became standard in conservatory and method-book pedagogy.",
    funFact: "Middle C became a universal orientation shortcut for beginners across methods.",
    songs: [
      "Ode to Joy - Beethoven (clear tonal center and scale motion).",
      "Canon in D - Pachelbel (functional sequence awareness)."
    ],
    practice: { mode: "scale", key: "C", scaleType: "major (classical)" }
  },
  "classical-1": {
    objective: "Train independent voices and smoother two-line awareness.",
    steps: [
      "Hear one model phrase and focus on separate lines.",
      "Play slowly with each hand maintaining distinct contour.",
      "Repeat with reduced tension and equal clarity in both hands."
    ],
    history: "Counterpoint training shaped classical keyboard discipline by forcing independent melodic control.",
    funFact: "Slow counterpoint practice can dramatically improve hand independence in non-classical styles too.",
    songs: [
      "Invention No. 1 - J. S. Bach (independent line control).",
      "Two-Part Inventions excerpts (counterpoint hearing drills)."
    ],
    practice: { mode: "scale", key: "A", scaleType: "natural minor (classical)" }
  },
  "classical-2": {
    objective: "Hear large-form tension/release through strong cadential control.",
    steps: [
      "Hear the cadential model and identify arrival points.",
      "Play the cadence with controlled dynamics and timing.",
      "Repeat until the resolution sounds intentional and stable."
    ],
    history: "Sonata-era writing leaned heavily on cadential architecture to define large-scale form.",
    funFact: "Listeners can often feel section boundaries by cadence shape even without theory vocabulary.",
    songs: [
      "Moonlight Sonata - Beethoven (cadential tension architecture).",
      "Sonata in C K.545 - Mozart (clear formal cadences)."
    ],
    practice: { mode: "cadence", key: "C", cadenceName: "Authentic (V-I)" }
  },
  "jazz-0": {
    objective: "Build shell voicing reflexes that outline harmony with minimal notes.",
    steps: [
      "Hear a ii-V-I shell model and trace resolution by ear.",
      "Play left-hand shell positions with even time.",
      "Repeat three attempts without breaking the groove."
    ],
    history: "Shell voicings became a foundational jazz comping entry point because they clarify function quickly.",
    funFact: "Two notes (3rd and 7th) can communicate chord function more clearly than a dense voicing.",
    songs: [
      "Autumn Leaves (ii-V-I shell movement).",
      "Blue Bossa (functional minor-to-major cadence shifts)."
    ],
    practice: { mode: "cadence", key: "F", cadenceName: "ii-V-I (Jazz cadence)" }
  },
  "jazz-1": {
    objective: "Use rootless voicings for smoother comping and better melodic space.",
    steps: [
      "Hear rootless color over ii-V-I context.",
      "Play compact rootless grips with voice-leading focus.",
      "Repeat while keeping top-note motion intentional."
    ],
    history: "Rootless piano voicings expanded with bebop and post-bop rhythm section practices.",
    funFact: "Removing the root often improves band blend because bass already defines it.",
    songs: [
      "Autumn Leaves (rootless comping contexts).",
      "All the Things You Are (voice-leading across key centers)."
    ],
    practice: { mode: "cadence", key: "Bb", cadenceName: "ii-V-I (Jazz cadence)" }
  },
  "jazz-2": {
    objective: "Introduce upper-structure color without sacrificing rhythmic control.",
    steps: [
      "Hear altered dominant color in a simple cycle.",
      "Play the color shape with steady time and clean release.",
      "Repeat in one additional key and compare character."
    ],
    history: "Upper structures grew with modern jazz harmony as pianists sought richer dominant alterations.",
    funFact: "Many advanced colors are just familiar triads heard over a different bass context.",
    songs: [
      "Nardis (modern dominant color movement).",
      "Black Narcissus (post-bop harmonic color language)."
    ],
    practice: { mode: "progression", key: "F", progressionName: "12-Bar Blues (I-IV-V)" }
  }
};

const GUIDED_TOPIC_TEMPLATES = {
  progressions: {
    objective: "Build progression fluency so you can hear, play, and transpose harmonic stories quickly.",
    steps: [
      "Hear one model loop and identify the home moment.",
      "Play the same progression with stable rhythm and smooth motion.",
      "Repeat in one additional key and compare emotional contour."
    ],
    history: "Progression literacy became central as accompaniment-driven styles expanded in pop, jazz, film, and worship settings.",
    funFact: "Most listeners feel progression tension/release before they can name the chords.",
    songsByTrack: {
      pop: ["Someone Like You - Adele", "No Woman No Cry - Bob Marley"],
      classical: ["Canon in D - Pachelbel", "Ave Maria - Schubert"],
      jazz: ["Autumn Leaves", "Blue Bossa"]
    },
    practiceByTrack: {
      pop: { mode: "progression", key: "C", progressionName: "I-vi-IV-V (Pop)" },
      classical: { mode: "progression", key: "C", progressionName: "i-iv-VII-III (Minor cinematic)" },
      jazz: { mode: "progression", key: "F", progressionName: "ii-V-I (Jazz)" }
    }
  },
  cadences: {
    objective: "Train cadence hearing so you can predict and shape resolution with confidence.",
    steps: [
      "Hear one cadence model and identify where release lands.",
      "Play the cadence with controlled timing and tone.",
      "Repeat multiple attempts until resolution feel is consistent."
    ],
    history: "Cadential training has been a cross-genre backbone for phrase endings from classical forms to jazz standards.",
    funFact: "Changing only the final chord can dramatically reshape emotional meaning.",
    songsByTrack: {
      pop: ["Hallelujah - Leonard Cohen", "Let It Be - The Beatles"],
      classical: ["Moonlight Sonata - Beethoven", "Sonata in C K.545 - Mozart"],
      jazz: ["Autumn Leaves", "All the Things You Are"]
    },
    practiceByTrack: {
      pop: { mode: "cadence", key: "C", cadenceName: "Authentic (V-I)" },
      classical: { mode: "cadence", key: "C", cadenceName: "Authentic (V-I)" },
      jazz: { mode: "cadence", key: "F", cadenceName: "ii-V-I (Jazz cadence)" }
    }
  },
  voicings: {
    objective: "Improve voicing control for cleaner texture, smoother transitions, and better ensemble blend.",
    steps: [
      "Hear one compact voicing model.",
      "Play with minimal hand movement and stable top voice.",
      "Repeat and refine clarity rather than adding complexity."
    ],
    history: "Voicing practice evolved with recording and ensemble playing demands where clarity matters more than density.",
    funFact: "A small voicing with great voice-leading often sounds more pro than a dense chord stack.",
    songsByTrack: {
      pop: ["Best Part - Daniel Caesar", "Ain't No Sunshine - Bill Withers"],
      classical: ["Prelude in C - J. S. Bach", "Gymnopedie No. 1 - Erik Satie"],
      jazz: ["Autumn Leaves", "So What - Miles Davis"]
    },
    practiceByTrack: {
      pop: { mode: "chord", key: "C", chordQuality: "maj7", inversion: "root position" },
      classical: { mode: "chord", key: "C", chordQuality: "major", inversion: "1st inversion" },
      jazz: { mode: "chord", key: "F", chordQuality: "min7", inversion: "root position" }
    }
  },
  rhythm: {
    objective: "Strengthen groove consistency so harmonic ideas feel musical instead of mechanical.",
    steps: [
      "Hear one pocket-focused example.",
      "Play with even subdivision and controlled attacks.",
      "Repeat while keeping tempo and articulation consistent."
    ],
    history: "Rhythm-first pedagogy spread as groove-centric music became dominant in modern piano contexts.",
    funFact: "Tiny timing shifts often matter more than extra notes for making music feel good.",
    songsByTrack: {
      pop: ["Billie Jean - Michael Jackson", "Clocks - Coldplay"],
      classical: ["Turkish March - Mozart", "Waltz in A minor - Chopin"],
      jazz: ["Take Five - Dave Brubeck", "Cantaloupe Island - Herbie Hancock"]
    },
    practiceByTrack: {
      pop: { mode: "progression", key: "C", progressionName: "I-vi-IV-V (Pop)" },
      classical: { mode: "scale", key: "C", scaleType: "major (classical)" },
      jazz: { mode: "progression", key: "F", progressionName: "12-Bar Blues (I-IV-V)" }
    }
  },
  "ear-training": {
    objective: "Connect hearing to keyboard decisions so theory becomes immediate musical instinct.",
    steps: [
      "Hear one model and name its function by ear.",
      "Play the same shape and verify the sound against expectation.",
      "Repeat until recognition and execution align."
    ],
    history: "Ear training moved from solfege-only drills into applied keyboard workflows across modern programs.",
    funFact: "Naming function while you play accelerates retention more than passive listening.",
    songsByTrack: {
      pop: ["Stand by Me - Ben E. King", "Let It Be - The Beatles"],
      classical: ["Ode to Joy - Beethoven", "Canon in D - Pachelbel"],
      jazz: ["Autumn Leaves", "Blue Bossa"]
    },
    practiceByTrack: {
      pop: { mode: "cadence", key: "C", cadenceName: "Authentic (V-I)" },
      classical: { mode: "scale", key: "C", scaleType: "major (classical)" },
      jazz: { mode: "cadence", key: "F", cadenceName: "ii-V-I (Jazz cadence)" }
    }
  },
  improvisation: {
    objective: "Turn theory into musical language through motif-based improvisation over stable harmony.",
    steps: [
      "Hear one short phrase and identify its landing tones.",
      "Play a compact motif over the guided harmony.",
      "Repeat with one controlled variation each attempt."
    ],
    history: "Improv pedagogy shifted from purely transcription-driven to concept-plus-application loops for faster transfer.",
    funFact: "Repetition with tiny variation is a core strategy used by top improvisers.",
    songsByTrack: {
      pop: ["Someone Like You - Adele", "Fix You - Coldplay"],
      classical: ["Prelude in C - J. S. Bach", "Gymnopedie No. 1 - Erik Satie"],
      jazz: ["So What - Miles Davis", "Impressions - John Coltrane"]
    },
    practiceByTrack: {
      pop: { mode: "progression", key: "A", progressionName: "i-iv-VII-III (Minor cinematic)" },
      classical: { mode: "scale", key: "A", scaleType: "natural minor (classical)" },
      jazz: { mode: "scale", key: "D", scaleType: "mixolydian (jazz/blues)" }
    }
  }
};

const defaultProgress = {
  sessionsCompleted: 0,
  streakDays: 0,
  lastSessionDate: "",
  chordReps: 0,
  progressionReps: 0,
  arpeggioReps: 0,
  scaleReps: 0,
  theoryCompletedLessons: {},
  theoryAudioByLesson: {},
  theoryCustomLessons: {},
  theoryLessonRuns: {},
  areas: { chords: 0, progressions: 0, arpeggios: 0, scales: 0 },
  recent: []
};

let el = {};

const appState = {
  root: "C",
  quality: "major",
  inversion: "root position"
};

let audioCtx;
let audioMaster;
let keyEls = [];
let keyElsByMidi = new Map();
const keyHighlightTimers = new Map();
const sampleBuffers = new Map();
const sampleOnsetOffsets = new Map();
const sampleBufferLoads = new Map();
let samplePreloadPromise = null;
let sampleEngineGeneration = 0;
let samplePreloadStarted = false;
let requiredSampleCount = 0;
const failedSampleNotes = new Set();
const htmlSamplePools = new Map();
const htmlEngineForcedByProtocol = window.location.protocol === "file:";
const htmlEngineFallbackAllowed = htmlEngineForcedByProtocol;
let htmlSampleEngineActive = htmlEngineForcedByProtocol;
let sampleEngineReady = htmlSampleEngineActive;
const pendingPlayRequests = [];
let rnboDevice = null;
let rnboLoadPromise = null;
let rnboLoadAttempted = false;
let rnboEngineActive = false;
let rnboEngineFailedReason = "";
let chordAssetManifest = null;
let chordAssetManifestPromise = null;
const chordAssetBySignature = new Map();
const chordAssetBufferCache = new Map();
const chordAssetBufferLoads = new Map();
const chordAssetHtmlPools = new Map();
const chordPlaybackPendingBySignature = new Map();
let chordAssetPreloadPromise = null;
let toneSampler = null;
let toneEngineReady = false;
let toneEngineInitPromise = null;
const tonePendingRequests = [];
let audioStatusLastRendered = "";
let focusTimerId;
let clearStripStepTimer;
let clearModeEnterTimer;
let resetInFlight = false;
let highlightWindowDragging = false;
let lastRestrictedChordWindowMidi = null;
let lastChordPaletteSelectionAtMs = null;
let audioUnlockBound = false;
let keyCenterBackdropHideTimer = null;
const typingHeldMidiByCode = new Map();
let progress = loadProgress();
const theoryState = {
  trackId: "",
  lessonId: "",
  isEditingLesson: false,
  activeRunLessonId: "",
  runKeyboardPresses: 0,
  speechUtterance: null,
  audioEl: null
};

function byId(id) {
  return document.getElementById(id);
}

function init() {
  el = {
    rootBtnGroup: byId("rootBtnGroup"),
    qualityBtnGroup: byId("qualityBtnGroup"),
    inversionBtnGroup: byId("inversionBtnGroup"),
    rootSelect: byId("rootSelect"),
    qualitySelect: byId("qualitySelect"),
    inversionSelect: byId("inversionSelect"),
    keySelect: byId("keySelect"),
    progressionSelect: byId("progressionSelect"),
    cadenceSelect: byId("cadenceSelect"),
    voiceLengthInput: byId("voiceLengthInput"),
    toneInput: byId("toneInput"),
    playChordBtn: byId("playChordBtn"),
    randomChordBtn: byId("randomChordBtn"),
    playProgressionBtn: byId("playProgressionBtn"),
    playCadenceBtn: byId("playCadenceBtn"),
    explainCadenceBtn: byId("explainCadenceBtn"),
    startCadenceGameBtn: byId("startCadenceGameBtn"),
    gameOverlay: byId("gameOverlay"),
    gameTitle: byId("gameTitle"),
    gameInstructions: byId("gameInstructions"),
    gameFeedback: byId("gameFeedback"),
    openKeyCenterBtn: byId("openKeyCenterBtn"),
    closeKeyCenterBtn: byId("closeKeyCenterBtn"),
    keyCenterDrawer: byId("keyCenterDrawer"),
    keyCenterDrawerBackdrop: byId("keyCenterDrawerBackdrop"),
    keyboard: byId("keyboard"),
    chordTableTitle: byId("chordTableTitle"),
    chordTableHead: byId("chordTableHead"),
    chordTableBody: byId("chordTableBody"),
    playPaletteRowBtn: byId("playPaletteRowBtn"),
    progressionStrip: byId("progressionStrip"),
    cadenceStrip: byId("cadenceStrip"),
    chordDisplay: byId("chordDisplay"),
    progressionOutput: byId("progressionOutput"),
    audioStatus: byId("audioStatus"),
    highlightWindowStart: byId("highlightWindowStart"),
    highlightWindowTrack: byId("highlightWindowTrack"),
    highlightWindowGlow: byId("highlightWindowGlow"),
    highlightWindowLabel: byId("highlightWindowLabel"),
    arpRootSelect: byId("arpRootSelect"),
    arpTypeSelect: byId("arpTypeSelect"),
    handSelect: byId("handSelect"),
    playArpBtn: byId("playArpBtn"),
    showFingeringBtn: byId("showFingeringBtn"),
    arpOutput: byId("arpOutput"),
    scaleRootSelect: byId("scaleRootSelect"),
    scaleTypeSelect: byId("scaleTypeSelect"),
    tempoInput: byId("tempoInput"),
    playScaleBtn: byId("playScaleBtn"),
    scalePracticeBtn: byId("scalePracticeBtn"),
    scaleOutput: byId("scaleOutput"),
    modeSwitch: byId("modeSwitch"),
    coachInput: byId("coachInput"),
    coachAskBtn: byId("coachAskBtn"),
    coachUseContextBtn: byId("coachUseContextBtn"),
    coachOutput: byId("coachOutput"),
    lessonCards: byId("lessonCards"),
    statSessions: byId("statSessions"),
    statStreak: byId("statStreak"),
    statChords: byId("statChords"),
    statScales: byId("statScales"),
    statArps: byId("statArps"),
    statProgressions: byId("statProgressions"),
    completeSessionBtn: byId("completeSessionBtn"),
    resetProgressBtn: byId("resetProgressBtn"),
    nextSequence: byId("nextSequence"),
    theoryContent: byId("theoryContent"),
    conceptSelect: byId("conceptSelect"),
    conceptKeySelect: byId("conceptKeySelect"),
    conceptVariantSelect: byId("conceptVariantSelect"),
    conceptPlayBtn: byId("conceptPlayBtn"),
    conceptExplainBtn: byId("conceptExplainBtn"),
    conceptOutput: byId("conceptOutput"),
    glossarySearchInput: byId("glossarySearchInput"),
    glossaryCategorySelect: byId("glossaryCategorySelect"),
    glossaryEntrySelect: byId("glossaryEntrySelect"),
    glossaryPlayBtn: byId("glossaryPlayBtn"),
    glossaryOutput: byId("glossaryOutput"),
    theoryTrackSelect: byId("theoryTrackSelect"),
    theoryPackTopicSelect: byId("theoryPackTopicSelect"),
    theoryPackLevelSelect: byId("theoryPackLevelSelect"),
    theoryPackSizeSelect: byId("theoryPackSizeSelect"),
    theoryGeneratePackBtn: byId("theoryGeneratePackBtn"),
    theoryPackStatus: byId("theoryPackStatus"),
    theoryLessonList: byId("theoryLessonList"),
    theoryProgressSummary: byId("theoryProgressSummary"),
    theoryLessonTitle: byId("theoryLessonTitle"),
    theoryLessonDesc: byId("theoryLessonDesc"),
    theoryPlayAudioBtn: byId("theoryPlayAudioBtn"),
    theoryStopAudioBtn: byId("theoryStopAudioBtn"),
    theoryStartLessonBtn: byId("theoryStartLessonBtn"),
    theoryPlayExampleBtn: byId("theoryPlayExampleBtn"),
    theoryLogAttemptBtn: byId("theoryLogAttemptBtn"),
    theoryCheckPassBtn: byId("theoryCheckPassBtn"),
    theoryLessonObjective: byId("theoryLessonObjective"),
    theoryLessonSteps: byId("theoryLessonSteps"),
    theoryLessonPass: byId("theoryLessonPass"),
    theoryGuidedStatus: byId("theoryGuidedStatus"),
    theoryHistoryFun: byId("theoryHistoryFun"),
    theorySongLinks: byId("theorySongLinks"),
    theoryAudioUrlInput: byId("theoryAudioUrlInput"),
    theorySaveAudioUrlBtn: byId("theorySaveAudioUrlBtn"),
    theoryEditLessonBtn: byId("theoryEditLessonBtn"),
    theoryDeleteLessonBtn: byId("theoryDeleteLessonBtn"),
    theoryEditPanel: byId("theoryEditPanel"),
    theoryEditTitleInput: byId("theoryEditTitleInput"),
    theoryEditDescInput: byId("theoryEditDescInput"),
    theoryEditNarrationInput: byId("theoryEditNarrationInput"),
    theoryEditTokensInput: byId("theoryEditTokensInput"),
    theoryEditVideoUrlInput: byId("theoryEditVideoUrlInput"),
    theoryEditResourcesInput: byId("theoryEditResourcesInput"),
    theorySaveLessonBtn: byId("theorySaveLessonBtn"),
    theoryCancelEditBtn: byId("theoryCancelEditBtn"),
    theoryInfographic: byId("theoryInfographic"),
    theoryVideoFrame: byId("theoryVideoFrame"),
    theoryResources: byId("theoryResources")
  };

  renderButtonGroup(el.rootBtnGroup, NOTES, "root");
  renderButtonGroup(el.qualityBtnGroup, Object.keys(CHORDS), "quality");
  renderButtonGroup(el.inversionBtnGroup, ["root position", "1st inversion", "2nd inversion"], "inversion");

  populateSelect(el.arpRootSelect, NOTES);
  populateSelect(el.scaleRootSelect, NOTES);
  populateSelect(el.keySelect, NOTES);
  populateSelect(el.progressionSelect, Object.keys(PROGRESSIONS));
  populateSelect(el.cadenceSelect, Object.keys(CADENCES));
  populateSelect(el.rootSelect, NOTES);
  populateSelect(el.qualitySelect, Object.keys(CHORDS));
  populateSelect(el.inversionSelect, ["root position", "1st inversion", "2nd inversion"]);
  populateSelect(el.arpTypeSelect, Object.keys(ARP_TYPES));
  populateSelect(el.scaleTypeSelect, Object.keys(SCALE_FAMILIES));

  initializeCompanionPanels();

  updateButtonActiveState(el.rootBtnGroup, appState.root);
  updateButtonActiveState(el.qualityBtnGroup, appState.quality);
  updateButtonActiveState(el.inversionBtnGroup, appState.inversion);
  if (el.rootSelect) el.rootSelect.value = appState.root;
  if (el.qualitySelect) el.qualitySelect.value = appState.quality;
  if (el.inversionSelect) el.inversionSelect.value = appState.inversion;
  if (el.cadenceSelect) el.cadenceSelect.value = "Authentic (V-I)";

  renderKeyboard();
  renderChordTable();
  renderProgressionStrip();
  renderCadenceStrip();
  renderLessonTracks();
  renderTheoryContent();
  renderProgress();
  updateHighlightWindowLabel();
  updateHighlightWindowLine();
  bindAudioUnlock();
  void ensureAudio({ resume: false });
  void ensureChordAssetManifest();
  updateAudioStatusText();
  bindEvents();
  initModeSwitch();
  setMode("compose");
}

function renderButtonGroup(container, options, stateKey) {
  if (!container) return;
  container.innerHTML = "";
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "toggle-btn";
    btn.textContent = CHORDS[opt]?.short || CHORDS[opt]?.label || opt;
    btn.dataset.value = opt;
    if (opt === "root position") btn.textContent = "Root";
    if (opt === "1st inversion") btn.textContent = "1st Inv";
    if (opt === "2nd inversion") btn.textContent = "2nd Inv";

    btn.addEventListener("click", () => {
      if (stateKey === "root") {
        setRootContext(opt);
        return;
      }
      appState[stateKey] = opt;
      updateButtonActiveState(container, opt);
      markChordTableCell(appState.root, appState.quality);
    });
    container.appendChild(btn);
  });
}

function updateButtonActiveState(container, activeValue) {
  if (!container) return;
  Array.from(container.children).forEach(btn => {
    btn.classList.toggle("active", btn.dataset.value === activeValue);
  });
}

function playCurrentChord() {
  const midi = buildChordMidi(appState.root, appState.quality, appState.inversion, 3);
  playMidiNotes(midi, { hold: getHoldSeconds(), asChord: true, restrictToWindow: true });
  el.chordDisplay.textContent = `${appState.root}${CHORDS[appState.quality].short} | ${appState.inversion} | Notes: ${midi.map(midiToNoteName).join(" - ")}`;
  trackRep("chords", `${appState.root} ${appState.quality}`);

  if (window.cadenceGame && window.cadenceGame.active) {
    window.cadenceGame.checkAnswer(appState.root, appState.quality);
  }
}

function populateSelect(selectEl, options) {
  if (!selectEl) return;
  selectEl.innerHTML = "";
  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    selectEl.appendChild(opt);
  });
}

function getSelectedCadenceName() {
  if (el.cadenceSelect?.value) return el.cadenceSelect.value;
  return Object.keys(CADENCES)[0];
}

function setRootContext(root) {
  appState.root = root;
  if (el.keySelect) el.keySelect.value = root;
  if (el.conceptKeySelect) el.conceptKeySelect.value = root;
  updateButtonActiveState(el.rootBtnGroup, appState.root);
  renderChordTable();
  renderProgressionStrip();
  renderCadenceStrip();
  renderPersonalizedSequence();
  markChordTableCell(appState.root, appState.quality);
}

function openKeyCenterDrawer() {
  if (!el.keyCenterDrawer) return;
  if (keyCenterBackdropHideTimer) {
    window.clearTimeout(keyCenterBackdropHideTimer);
    keyCenterBackdropHideTimer = null;
  }
  el.keyCenterDrawer.classList.add("is-open");
  el.keyCenterDrawer.setAttribute("aria-hidden", "false");
  if (el.keyCenterDrawerBackdrop) {
    el.keyCenterDrawerBackdrop.hidden = false;
    requestAnimationFrame(() => {
      el.keyCenterDrawerBackdrop.classList.add("is-open");
    });
  }
}

function closeKeyCenterDrawer() {
  if (!el.keyCenterDrawer) return;
  el.keyCenterDrawer.classList.remove("is-open");
  el.keyCenterDrawer.setAttribute("aria-hidden", "true");
  if (el.keyCenterDrawerBackdrop) {
    el.keyCenterDrawerBackdrop.classList.remove("is-open");
    keyCenterBackdropHideTimer = window.setTimeout(() => {
      if (!el.keyCenterDrawerBackdrop.classList.contains("is-open")) {
        el.keyCenterDrawerBackdrop.hidden = true;
      }
      keyCenterBackdropHideTimer = null;
    }, 220);
  }
}

function bindEvents() {
  el.playChordBtn.addEventListener("click", () => {
    playCurrentChord();
  });

  el.randomChordBtn.addEventListener("click", () => {
    const root = randomOf(NOTES);
    const quality = randomOf(Object.keys(CHORDS));
    const inversion = randomOf(["root position", "1st inversion", "2nd inversion"]);
    appState.root = root;
    appState.quality = quality;
    appState.inversion = inversion;
    updateButtonActiveState(el.rootBtnGroup, appState.root);
    updateButtonActiveState(el.qualityBtnGroup, appState.quality);
    updateButtonActiveState(el.inversionBtnGroup, appState.inversion);
    const midi = buildChordMidi(root, quality, inversion, 3);
    const hold = getHoldSeconds();
    playMidiNotes(midi, { hold, asChord: true, highlightMs: getHighlightMs(hold), restrictToWindow: true });
    markChordTableCell(root, quality);
    el.chordDisplay.textContent = `Quiz reveal: ${root}${CHORDS[quality].short} (${inversion}) | ${midi.map(midiToNoteName).join(" - ")}`;
    trackRep("chords", `${root} ${quality}`);
  });

  el.playProgressionBtn.addEventListener("click", async () => {
    const progression = buildProgressionChords(el.keySelect.value, el.progressionSelect.value);
    const hold = getHoldSeconds();
    for (let i = 0; i < progression.length; i += 1) {
      const step = progression[i];
      activateProgressionStep(i);
      playMidiNotes(step.midi, { hold, asChord: true, restrictToWindow: true });
      await wait(Math.max(220, hold * 560));
    }
    clearProgressionStep();
    el.progressionOutput.textContent = `Played ${el.progressionSelect.value} in ${el.keySelect.value}: ${progression.map((s) => s.name).join(" -> ")}`;
    trackRep("progressions", `${el.keySelect.value} ${el.progressionSelect.value}`);
  });

  if (el.playCadenceBtn) {
    el.playCadenceBtn.addEventListener("click", async () => {
      const cadenceName = getSelectedCadenceName();
      const cadence = buildCadenceChords(el.keySelect.value, cadenceName);
      const hold = getHoldSeconds();
      for (let i = 0; i < cadence.length; i += 1) {
        const step = cadence[i];
        activateCadenceStep(i);
        playMidiNotes(step.midi, { hold, asChord: true, restrictToWindow: true });
        await wait(Math.max(220, hold * 560));
      }
      clearCadenceStep();
      el.progressionOutput.textContent = `Played ${cadenceName} in ${el.keySelect.value}: ${cadence.map((s) => s.name).join(" -> ")}`;
      trackRep("progressions", `${el.keySelect.value} ${cadenceName}`);
    });
  }

  if (el.explainCadenceBtn) {
    el.explainCadenceBtn.addEventListener("click", () => {
      const cadenceName = getSelectedCadenceName();
      const cadence = buildCadenceChords(el.keySelect.value, cadenceName);
      const profile = getCadenceProfile(cadenceName);
      el.progressionOutput.textContent = [
        `${cadenceName} in ${el.keySelect.value}: ${cadence.map((s) => s.symbol).join(" -> ")}.`,
        `Theory: ${profile.theory}`,
        `Emotional rationale: ${profile.emotion}`,
        `Use it for: ${profile.useCase}`
      ].join(" ");
    });
  }

  if (el.startCadenceGameBtn) {
    el.startCadenceGameBtn.addEventListener("click", () => {
      window.cadenceGame = new CadenceGame();
      window.cadenceGame.start();
    });
  }

  if (el.openKeyCenterBtn) {
    el.openKeyCenterBtn.addEventListener("click", openKeyCenterDrawer);
  }

  if (el.closeKeyCenterBtn) {
    el.closeKeyCenterBtn.addEventListener("click", closeKeyCenterDrawer);
  }

  if (el.keyCenterDrawerBackdrop) {
    el.keyCenterDrawerBackdrop.addEventListener("click", closeKeyCenterDrawer);
  }

  if (el.gameOverlay) {
    el.gameOverlay.addEventListener("click", (event) => {
      if (event.target === el.gameOverlay) {
        window.cadenceGame?.quit();
      }
    });
  }

  el.playPaletteRowBtn.addEventListener("click", async () => {
    const sevenths = buildDiatonicSevenths(el.keySelect.value);
    const hold = getHoldSeconds();
    for (const chord of sevenths) {
      markChordTableCell(chord.root, chord.quality);
      playMidiNotes(chord.midi, { hold, asChord: true, highlightMs: getHighlightMs(hold, 500), restrictToWindow: true });
      await wait(Math.max(220, hold * 460));
    }
  });

  el.keySelect.addEventListener("change", () => {
    setRootContext(el.keySelect.value);
  });

  if (el.rootSelect) {
    el.rootSelect.addEventListener("change", () => {
      setRootContext(el.rootSelect.value);
    });
  }

  if (el.qualitySelect) {
    el.qualitySelect.addEventListener("change", () => {
      appState.quality = el.qualitySelect.value;
      updateButtonActiveState(el.qualityBtnGroup, appState.quality);
      markChordTableCell(appState.root, appState.quality);
    });
  }

  if (el.inversionSelect) {
    el.inversionSelect.addEventListener("change", () => {
      appState.inversion = el.inversionSelect.value;
      updateButtonActiveState(el.inversionBtnGroup, appState.inversion);
    });
  }

  el.progressionSelect.addEventListener("change", () => {
    renderProgressionStrip();
    renderPersonalizedSequence();
  });

  if (el.highlightWindowStart) {
    el.highlightWindowStart.addEventListener("input", () => {
      clearKeyboardHighlights();
      updateHighlightWindowLabel();
      updateHighlightWindowLine();
    });
  }

  if (el.highlightWindowTrack && el.highlightWindowStart) {
    const beginDrag = (event) => {
      event.preventDefault();
      highlightWindowDragging = true;
      setHighlightWindowFromClientX(event.clientX);
      window.addEventListener("pointermove", onHighlightWindowPointerMove);
      window.addEventListener("pointerup", endHighlightWindowDrag);
      window.addEventListener("pointercancel", endHighlightWindowDrag);
    };
    el.highlightWindowTrack.addEventListener("pointerdown", beginDrag);
    if (el.highlightWindowGlow) {
      el.highlightWindowGlow.addEventListener("pointerdown", beginDrag);
    }
    window.addEventListener("resize", updateHighlightWindowLine);
  }

  if (el.cadenceSelect) {
    el.cadenceSelect.addEventListener("change", () => {
      renderCadenceStrip();
    });
  }

  window.addEventListener("keydown", onWindowPianoKeyDown);
  window.addEventListener("keyup", onWindowPianoKeyUp);
  window.addEventListener("blur", clearWindowPianoKeyState);
  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (el.keyCenterDrawer?.classList.contains("is-open")) {
      closeKeyCenterDrawer();
      event.preventDefault();
      return;
    }
    if (window.cadenceGame?.active) {
      window.cadenceGame.quit();
      event.preventDefault();
    }
  });

  el.chordTableBody.addEventListener("pointerdown", (event) => {
    const cell = event.target.closest("td[data-root]");
    if (!cell) return;
    event.preventDefault();
    const root = cell.dataset.root;
    const quality = cell.dataset.quality;
    const label = cell.dataset.label;
    appState.root = root;
    appState.quality = quality;
    updateButtonActiveState(el.rootBtnGroup, appState.root);
    updateButtonActiveState(el.qualityBtnGroup, appState.quality);
    const midi = buildChordMidi(root, quality, "root position", 3);
    const restrictedMidi = normalizeMidiCollection(limitMidiToHighlightWindow(midi));
    const previousRestrictedMidi = Array.isArray(lastRestrictedChordWindowMidi)
      ? lastRestrictedChordWindowMidi
      : [];
    const isRapidChordTransition = Number.isFinite(lastChordPaletteSelectionAtMs)
      && (performance.now() - lastChordPaletteSelectionAtMs) <= 1000;
    const chordTransitionDiff = isRapidChordTransition
      && previousRestrictedMidi.length > 0
      && !midiCollectionsEqual(previousRestrictedMidi, restrictedMidi)
      ? computeChordTransitionDiff(previousRestrictedMidi, restrictedMidi)
      : { removed: [], added: [] };
    markChordTableCell(root, quality);
    highlightKeyboardHold(midi, true);
    showChordTransitionDiff(chordTransitionDiff);
    el.chordDisplay.textContent = `Palette chord armed: ${label} (release to play)`;

    const pointerId = event.pointerId;
    const onRelease = (releaseEvent) => {
      if (releaseEvent.pointerId !== pointerId) return;
      cleanupPointerHandlers();
      clearChordDiffPreview();
      const hold = getHoldSeconds();
      playMidiNotes(midi, { hold, asChord: true, highlightMs: getHighlightMs(hold), restrictToWindow: true });
      lastRestrictedChordWindowMidi = restrictedMidi;
      lastChordPaletteSelectionAtMs = performance.now();
      el.chordDisplay.textContent = `Palette chord: ${label}`;
      trackRep("chords", label);
    };

    const onCancel = (cancelEvent) => {
      if (cancelEvent.pointerId !== pointerId) return;
      cleanupPointerHandlers();
      clearKeyboardHighlights();
      el.chordDisplay.textContent = `Palette chord canceled: ${label}`;
    };

    const cleanupPointerHandlers = () => {
      cell.removeEventListener("pointerup", onRelease);
      cell.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("pointerup", onRelease);
      window.removeEventListener("pointercancel", onCancel);
    };

    try {
      cell.setPointerCapture(pointerId);
    } catch {
      // Ignore pointer capture failures in unsupported environments.
    }

    cell.addEventListener("pointerup", onRelease);
    cell.addEventListener("pointercancel", onCancel);
    window.addEventListener("pointerup", onRelease);
    window.addEventListener("pointercancel", onCancel);
  });

  el.playArpBtn.addEventListener("click", async () => {
    const notes = buildScaleMidi(el.arpRootSelect.value, ARP_TYPES[el.arpTypeSelect.value], 3);
    const hold = Math.max(0.36, getHoldSeconds() * 0.6);
    const stepMs = Math.max(140, hold * 420);
    for (const midi of notes) {
      playMidiNotes([midi], { hold, asChord: true, velocity: 0.8 });
      await wait(stepMs);
    }
    for (let i = notes.length - 2; i >= 0; i -= 1) {
      playMidiNotes([notes[i]], { hold, asChord: true, velocity: 0.78 });
      await wait(stepMs);
    }
    el.arpOutput.textContent = `${el.arpRootSelect.value} ${el.arpTypeSelect.value}: ${notes.map(midiToNoteName).join(" - ")}`;
    trackRep("arpeggios", `${el.arpRootSelect.value} ${el.arpTypeSelect.value}`);
  });

  el.showFingeringBtn.addEventListener("click", () => {
    const shape = el.arpTypeSelect.value;
    const hand = el.handSelect.value;
    el.arpOutput.textContent = `Fingering (${hand} hand): ${FINGERINGS[shape][hand]}. Keep wrist loose and move laterally.`;
  });

  el.playScaleBtn.addEventListener("click", async () => {
    const root = el.scaleRootSelect.value;
    const type = el.scaleTypeSelect.value;
    const bpm = Number(el.tempoInput.value) || 90;
    const hold = Math.max(0.32, getHoldSeconds() * 0.54);
    const notes = buildScaleMidi(root, SCALE_FAMILIES[type].intervals, 3);
    const intervalMs = (60 / bpm) * 1000;

    for (const midi of notes) {
      playMidiNotes([midi], { hold, asChord: true, velocity: 0.74 });
      await wait(intervalMs);
    }
    for (let i = notes.length - 2; i >= 0; i -= 1) {
      playMidiNotes([notes[i]], { hold, asChord: true, velocity: 0.74 });
      await wait(intervalMs);
    }

    el.scaleOutput.textContent = `${root} ${type}: ${notes.map(midiToNoteName).join(" - ")}`;
    trackRep("scales", `${root} ${type}`);
  });

  el.scalePracticeBtn.addEventListener("click", () => {
    const root = el.scaleRootSelect.value;
    const type = el.scaleTypeSelect.value;
    const bpm = Number(el.tempoInput.value) || 90;
    const useCase = SCALE_FAMILIES[type].useCase;
    el.scaleOutput.textContent = [
      `Micro-plan for ${root} ${type} @ ${bpm} BPM:`,
      "1) 2 min hands separate, long tone.",
      "2) 2 min contrary motion.",
      "3) 2 min phrase ending on chord tone.",
      `Use this for: ${useCase}.`
    ].join(" ");
  });



  el.coachUseContextBtn.addEventListener("click", () => {
    const cadenceName = getSelectedCadenceName();
    const cadenceProfile = getCadenceProfile(cadenceName);
    el.coachInput.value = [
      `Key: ${el.keySelect.value}`,
      `Progression: ${el.progressionSelect.value}`,
      `Cadence: ${cadenceName}`,
      `Cadence emotion: ${cadenceProfile.emotion}`,
      `Chord focus: ${appState.root}${CHORDS[appState.quality].short}`,
      `Arpeggio: ${el.arpRootSelect.value} ${el.arpTypeSelect.value}`,
      `Scale: ${el.scaleRootSelect.value} ${el.scaleTypeSelect.value}`,
      `Recent progress: chords ${progress.chordReps}, progressions ${progress.progressionReps}, scales ${progress.scaleReps}, arpeggios ${progress.arpeggioReps}`,
      "Give a concise ADHD-friendly 12-minute session with practical voicing examples."
    ].join(" | ");
  });

  el.coachAskBtn.addEventListener("click", askCoach);

  el.completeSessionBtn.addEventListener("click", () => {
    markSessionComplete();
    renderProgress();
  });

  el.resetProgressBtn.addEventListener("click", hardResetProgress);

  if (el.conceptSelect) {
    el.conceptSelect.addEventListener("change", () => {
      populateConceptVariants();
    });
  }

  if (el.conceptPlayBtn) {
    el.conceptPlayBtn.addEventListener("click", playSelectedConcept);
  }

  if (el.conceptExplainBtn) {
    el.conceptExplainBtn.addEventListener("click", explainSelectedConcept);
  }

  if (el.glossarySearchInput) {
    el.glossarySearchInput.addEventListener("input", renderGlossaryEntries);
  }

  if (el.glossaryCategorySelect) {
    el.glossaryCategorySelect.addEventListener("change", renderGlossaryEntries);
  }

  if (el.glossaryEntrySelect) {
    el.glossaryEntrySelect.addEventListener("change", showGlossaryEntryDetails);
  }

  if (el.glossaryPlayBtn) {
    el.glossaryPlayBtn.addEventListener("click", playGlossaryExample);
  }

  if (el.theoryTrackSelect) {
    el.theoryTrackSelect.addEventListener("change", () => {
      theoryState.trackId = el.theoryTrackSelect.value;
      theoryState.isEditingLesson = false;
      theoryState.activeRunLessonId = "";
      theoryState.runKeyboardPresses = 0;
      const lessons = getTheoryLessonsForTrack(theoryState.trackId);
      theoryState.lessonId = lessons[0]?.id || "";
      renderTheoryLessonList();
      renderTheoryLessonDetail();
    });
  }

  if (el.theoryGeneratePackBtn) {
    el.theoryGeneratePackBtn.addEventListener("click", () => {
      const trackId = theoryState.trackId || el.theoryTrackSelect?.value || "pop";
      const topic = el.theoryPackTopicSelect?.value || "progressions";
      const level = el.theoryPackLevelSelect?.value || "noob";
      const count = Math.max(1, Math.min(5, Number(el.theoryPackSizeSelect?.value || 1)));
      const lessons = generateTheoryLessonSeries(trackId, topic, level, count);
      if (!progress.theoryCustomLessons[trackId]) progress.theoryCustomLessons[trackId] = [];
      progress.theoryCustomLessons[trackId] = [...lessons, ...progress.theoryCustomLessons[trackId]].slice(0, 24);
      theoryState.isEditingLesson = false;
      theoryState.lessonId = lessons[0].id;
      saveProgress();
      renderTheoryLessonList();
      renderTheoryLessonDetail();
      renderTheoryProgressSummary();
      if (el.theoryPackStatus) {
        el.theoryPackStatus.textContent = count === 1
          ? `Generated: ${lessons[0].title}`
          : `Generated ${count} lessons for ${topic}.`;
      }
    });
  }

  if (el.theoryPlayAudioBtn) {
    el.theoryPlayAudioBtn.addEventListener("click", playTheoryLessonAudio);
  }

  if (el.theoryStopAudioBtn) {
    el.theoryStopAudioBtn.addEventListener("click", stopTheoryLessonAudio);
  }

  if (el.theoryStartLessonBtn) {
    el.theoryStartLessonBtn.addEventListener("click", () => {
      void startGuidedTheoryLesson();
    });
  }

  if (el.theoryPlayExampleBtn) {
    el.theoryPlayExampleBtn.addEventListener("click", () => {
      void playGuidedTheoryExample();
    });
  }

  if (el.theoryLogAttemptBtn) {
    el.theoryLogAttemptBtn.addEventListener("click", () => {
      logGuidedTheoryAttempt();
    });
  }

  if (el.theoryCheckPassBtn) {
    el.theoryCheckPassBtn.addEventListener("click", () => {
      checkGuidedTheoryPass();
    });
  }

  if (el.theorySaveAudioUrlBtn) {
    el.theorySaveAudioUrlBtn.addEventListener("click", () => {
      const lesson = getCurrentTheoryLesson();
      if (!lesson || !el.theoryAudioUrlInput) return;
      const url = el.theoryAudioUrlInput.value.trim();
      if (url) {
        progress.theoryAudioByLesson[lesson.id] = url;
      } else {
        delete progress.theoryAudioByLesson[lesson.id];
      }
      saveProgress();
      renderTheoryProgressSummary();
      if (el.theoryResources) {
        el.theoryResources.textContent = url
          ? "NotebookLM audio URL saved for this lesson."
          : "NotebookLM audio URL cleared for this lesson.";
      }
    });
  }

  if (el.theoryEditLessonBtn) {
    el.theoryEditLessonBtn.addEventListener("click", () => {
      const lesson = getCurrentTheoryLesson();
      if (!lesson || !isCustomTheoryLesson(lesson.id)) return;
      theoryState.isEditingLesson = true;
      renderTheoryLessonDetail();
    });
  }

  if (el.theoryCancelEditBtn) {
    el.theoryCancelEditBtn.addEventListener("click", () => {
      theoryState.isEditingLesson = false;
      renderTheoryLessonDetail();
    });
  }

  if (el.theorySaveLessonBtn) {
    el.theorySaveLessonBtn.addEventListener("click", () => {
      const lesson = getCurrentTheoryLesson();
      if (!lesson || !isCustomTheoryLesson(lesson.id)) return;
      const idx = getCustomTheoryLessonIndex(theoryState.trackId, lesson.id);
      if (idx < 0) return;
      const bucket = progress.theoryCustomLessons?.[theoryState.trackId];
      if (!Array.isArray(bucket)) return;
      const nextTitle = (el.theoryEditTitleInput?.value || "").trim() || lesson.title;
      const nextDesc = (el.theoryEditDescInput?.value || "").trim() || lesson.description;
      const nextNarration = (el.theoryEditNarrationInput?.value || "").trim() || lesson.narration;
      const nextVideoUrl = (el.theoryEditVideoUrlInput?.value || "").trim();
      const nextTokens = (el.theoryEditTokensInput?.value || "")
        .split(",")
        .map((token) => token.trim())
        .filter(Boolean);
      const nextResources = parseTheoryResourcesFromEditor(el.theoryEditResourcesInput?.value || "");
      bucket[idx] = {
        ...bucket[idx],
        title: nextTitle,
        description: nextDesc,
        narration: nextNarration,
        videoUrl: nextVideoUrl,
        customTokens: nextTokens.length > 0 ? nextTokens : bucket[idx].customTokens,
        resources: nextResources.length > 0 ? nextResources : []
      };
      theoryState.isEditingLesson = false;
      saveProgress();
      renderTheoryLessonList();
      renderTheoryLessonDetail();
      renderTheoryProgressSummary();
      if (el.theoryPackStatus) {
        el.theoryPackStatus.textContent = `Saved updates to: ${nextTitle}`;
      }
    });
  }

  if (el.theoryDeleteLessonBtn) {
    el.theoryDeleteLessonBtn.addEventListener("click", () => {
      const lesson = getCurrentTheoryLesson();
      if (!lesson || !isCustomTheoryLesson(lesson.id)) return;
      const idx = getCustomTheoryLessonIndex(theoryState.trackId, lesson.id);
      if (idx < 0) return;
      progress.theoryCustomLessons[theoryState.trackId].splice(idx, 1);
      delete progress.theoryCompletedLessons[lesson.id];
      delete progress.theoryAudioByLesson[lesson.id];
      if (progress.theoryLessonRuns) {
        delete progress.theoryLessonRuns[lesson.id];
      }
      theoryState.isEditingLesson = false;
      if (theoryState.activeRunLessonId === lesson.id) {
        theoryState.activeRunLessonId = "";
        theoryState.runKeyboardPresses = 0;
      }
      stopTheoryLessonAudio();
      const lessons = getTheoryLessonsForTrack(theoryState.trackId);
      theoryState.lessonId = lessons[0]?.id || "";
      saveProgress();
      renderTheoryLessonList();
      renderTheoryLessonDetail();
      renderTheoryProgressSummary();
      if (el.theoryPackStatus) {
        el.theoryPackStatus.textContent = "Deleted generated lesson.";
      }
    });
  }

}

function renderKeyboard() {
  if (!el.keyboard) return;
  el.keyboard.innerHTML = "";
  keyEls = [];
  keyElsByMidi = new Map();
  const firstMidi = KEYBOARD_FIRST_MIDI;
  const lastMidi = KEYBOARD_LAST_MIDI;
  const whiteBed = document.createElement("div");
  whiteBed.className = "keyboard-white-bed";
  const blackBed = document.createElement("div");
  blackBed.className = "keyboard-black-bed";
  const whiteIndexByMidi = new Map();
  const isBlack = (midi) => NOTES[midi % 12].includes("#");
  let whiteCount = 0;

  for (let midi = firstMidi; midi <= lastMidi; midi += 1) {
    if (isBlack(midi)) continue;
    const noteClass = NOTES[midi % 12];
    const key = document.createElement("div");
    key.className = "piano-key white-key";
    key.dataset.noteClass = noteClass;
    key.dataset.midi = String(midi);
    key.title = midiToNoteName(midi);
    key.addEventListener("pointerdown", (event) => {
      startManualKeyGesture(event, key, midi);
    });
    whiteBed.appendChild(key);
    keyEls.push(key);
    keyElsByMidi.set(midi, key);
    whiteIndexByMidi.set(midi, whiteCount);
    whiteCount += 1;
  }

  const whiteWidthPercent = 100 / whiteCount;
  const blackWidthPercent = whiteWidthPercent * STANDARD_BLACK_TO_WHITE_WIDTH_RATIO;

  for (let midi = firstMidi; midi <= lastMidi; midi += 1) {
    if (!isBlack(midi)) continue;
    const prevWhiteIndex = whiteIndexByMidi.get(midi - 1);
    if (prevWhiteIndex === undefined) continue;
    const noteClass = NOTES[midi % 12];
    const key = document.createElement("div");
    key.className = "piano-key black-key";
    key.dataset.noteClass = noteClass;
    key.dataset.midi = String(midi);
    key.title = midiToNoteName(midi);
    key.addEventListener("pointerdown", (event) => {
      startManualKeyGesture(event, key, midi);
    });
    key.style.width = `${blackWidthPercent}%`;
    key.style.left = `${(prevWhiteIndex + 1) * whiteWidthPercent - blackWidthPercent / 2}%`;
    blackBed.appendChild(key);
    keyEls.push(key);
    keyElsByMidi.set(midi, key);
  }

  el.keyboard.appendChild(whiteBed);
  el.keyboard.appendChild(blackBed);
  reapplyTypingHeldHighlights();
}

function findKeyboardKeyAtPoint(clientX, clientY) {
  const target = document.elementFromPoint(clientX, clientY);
  const keyEl = target?.closest?.(".piano-key");
  if (!keyEl || !el.keyboard?.contains(keyEl)) return null;
  return keyEl;
}

function playManualKeyImmediate(midi, velocity = 0.9) {
  if (!ensureAudio()) return;
  const hold = Math.min(0.45, Math.max(0.11, getHoldSeconds() * 0.22));
  const toneHandled = playMidiNotesWithToneEngine([midi], { hold, asChord: true, velocity });
  if (toneHandled === true) return;
  if (shouldUseRnboPrimaryEngine() && !htmlSampleEngineActive) {
    if (rnboEngineActive) {
      const start = audioCtx.currentTime + getInteractiveStartLeadTimeSeconds();
      scheduleRnboNote(midi, start, hold, velocity);
      return;
    }
    if (!rnboEngineFailedReason) {
      enqueuePendingPlayRequest([midi], { hold, asChord: true, velocity });
      if (!rnboLoadPromise) {
        void initializeRnboEngine().then((loaded) => {
          if (loaded) flushPendingPlayRequests();
        });
      }
      return;
    }
  }
  if (htmlSampleEngineActive) {
    playHtmlSampleForMidi(midi, hold, velocity);
    return;
  }
  if (!sampleEngineReady) {
    if (isSampleEngineLoading()) {
      enqueuePendingPlayRequest([midi], { hold, asChord: true, velocity });
      return;
    }
    if (el.chordDisplay) {
      el.chordDisplay.textContent = "Audio samples failed to initialize. Reload to retry.";
    }
    updateAudioStatusText("error");
    return;
  }
  const playNow = () => {
    const start = audioCtx.currentTime + getInteractiveStartLeadTimeSeconds();
    playPianoVoice(midi, start, hold, velocity);
  };
  if (audioCtx.state === "running") {
    playNow();
  } else {
    audioCtx.resume().then(playNow).catch(() => {
      if (el.chordDisplay) {
        el.chordDisplay.textContent = "Audio is blocked. Click again to enable sound.";
      }
    });
  }
}

function startManualKeyGesture(event, initialKeyEl, initialMidi) {
  event.preventDefault();
  clearKeyboardHighlights();
  initialKeyEl.classList.add("active");

  const pointerId = event.pointerId;
  const active = {
    keyEl: initialKeyEl,
    midi: initialMidi
  };

  const triggerActiveKey = (velocity = 0.9) => {
    playManualKeyImmediate(active.midi, velocity);
    onTheoryGuidedKeyPress();
    el.chordDisplay.textContent = `Key: ${midiToNoteName(active.midi)}`;
  };

  triggerActiveKey(0.9);

  const processMovePoint = (clientX, clientY) => {
    const hoveredKey = findKeyboardKeyAtPoint(clientX, clientY);
    if (!hoveredKey) return;
    const hoveredMidi = Number(hoveredKey.dataset.midi);
    if (!Number.isFinite(hoveredMidi) || hoveredMidi === active.midi) return;
    active.keyEl.classList.remove("active");
    hoveredKey.classList.add("active");
    active.keyEl = hoveredKey;
    active.midi = hoveredMidi;
    triggerActiveKey(0.84);
  };

  const onMove = (moveEvent) => {
    if (moveEvent.pointerId !== pointerId) return;
    const coalesced = typeof moveEvent.getCoalescedEvents === "function"
      ? moveEvent.getCoalescedEvents()
      : null;
    if (coalesced && coalesced.length > 0) {
      for (let i = 0; i < coalesced.length; i += 1) {
        const point = coalesced[i];
        processMovePoint(point.clientX, point.clientY);
      }
      return;
    }
    processMovePoint(moveEvent.clientX, moveEvent.clientY);
  };

  const onRelease = (releaseEvent) => {
    if (releaseEvent.pointerId !== pointerId) return;
    cleanupPointerHandlers();
    active.keyEl.classList.remove("active");
  };

  const onCancel = (cancelEvent) => {
    if (cancelEvent.pointerId !== pointerId) return;
    cleanupPointerHandlers();
    active.keyEl.classList.remove("active");
  };

  const onLostCapture = () => {
    cleanupPointerHandlers();
    active.keyEl.classList.remove("active");
  };

  const cleanupPointerHandlers = () => {
    initialKeyEl.removeEventListener("lostpointercapture", onLostCapture);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerrawupdate", onMove);
    window.removeEventListener("pointerup", onRelease);
    window.removeEventListener("pointercancel", onCancel);
  };

  try {
    initialKeyEl.setPointerCapture(pointerId);
  } catch {
    // Ignore pointer capture failures in unsupported environments.
  }

  initialKeyEl.addEventListener("lostpointercapture", onLostCapture);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerrawupdate", onMove);
  window.addEventListener("pointerup", onRelease);
  window.addEventListener("pointercancel", onCancel);
}

function shouldIgnoreWindowPianoKeyEvent(event) {
  const target = event.target;
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function getWindowMappedMidiForCode(code) {
  const offset = WINDOW_KEYBOARD_OFFSETS_BY_CODE.get(code);
  if (offset === undefined) return null;
  const start = Number(el.highlightWindowStart?.value);
  if (!Number.isFinite(start)) return null;
  const midi = start + offset;
  if (midi < KEYBOARD_FIRST_MIDI || midi > KEYBOARD_LAST_MIDI) return null;
  return midi;
}

function onWindowPianoKeyDown(event) {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (shouldIgnoreWindowPianoKeyEvent(event)) return;
  const midi = getWindowMappedMidiForCode(event.code);
  if (midi === null) return;

  event.preventDefault();
  if (event.repeat || typingHeldMidiByCode.has(event.code)) return;

  typingHeldMidiByCode.set(event.code, midi);
  const keyEl = keyElsByMidi.get(midi);
  if (keyEl) keyEl.classList.add("active");
  playManualKeyImmediate(midi, 0.88);
  onTheoryGuidedKeyPress();
  if (el.chordDisplay) {
    el.chordDisplay.textContent = `Key: ${midiToNoteName(midi)} (keyboard ${event.code.replace("Key", "").replace("Semicolon", ";")})`;
  }
}

function onWindowPianoKeyUp(event) {
  const midi = typingHeldMidiByCode.get(event.code);
  if (!Number.isFinite(midi)) return;
  typingHeldMidiByCode.delete(event.code);
  const keyEl = keyElsByMidi.get(midi);
  if (keyEl) keyEl.classList.remove("active");
}

function clearWindowPianoKeyState() {
  typingHeldMidiByCode.forEach((midi) => {
    const keyEl = keyElsByMidi.get(midi);
    if (keyEl) keyEl.classList.remove("active");
  });
  typingHeldMidiByCode.clear();
}

function reapplyTypingHeldHighlights() {
  typingHeldMidiByCode.forEach((midi) => {
    const keyEl = keyElsByMidi.get(midi);
    if (keyEl) keyEl.classList.add("active");
  });
}

function computeChordTransitionDiff(previousMidi, nextMidi) {
  const previous = normalizeMidiCollection(previousMidi);
  const next = normalizeMidiCollection(nextMidi);
  if (!previous.length || !next.length) {
    return { removed: [], added: [] };
  }

  const previousSet = new Set(previous);
  const nextSet = new Set(next);
  return {
    removed: previous.filter((midi) => !nextSet.has(midi)),
    added: next.filter((midi) => !previousSet.has(midi))
  };
}

function showChordTransitionDiff(diff) {
  clearChordDiffPreview();
  if (!diff) return;
  const removed = normalizeMidiCollection(diff.removed);
  const added = normalizeMidiCollection(diff.added);
  if (!removed.length && !added.length) return;

  const applyDiff = (midi, diffClass) => {
    const keyEl = keyElsByMidi.get(midi);
    if (!keyEl) return;
    keyEl.classList.add("diff-transition", diffClass);
  };

  removed.forEach((midi) => applyDiff(midi, "diff-removed"));
  added.forEach((midi) => applyDiff(midi, "diff-added"));
}

function renderChordTable() {
  const key = el.keySelect.value;
  el.chordTableTitle.textContent = `Chords in ${key} Major`;

  const degreeRoots = DEGREE_TO_SEMITONE.map((semi) => NOTES[(NOTES.indexOf(key) + semi) % 12]);
  const triad = ["major", "minor", "minor", "major", "major", "minor", "diminished"];
  const seventh = ["maj7", "min7", "min7", "maj7", "dom7", "min7", "m7b5"];

  el.chordTableHead.innerHTML = `<th></th>${degreeRoots.map((root, idx) => `<th>${ROMAN[idx]}<br>${root}</th>`).join("")}`;

  const rows = [
    { name: "Sus2", quality: "sus2" },
    { name: "Triad", map: triad },
    { name: "Sus4", quality: "sus4" },
    { name: "7th", map: seventh }
  ];

  el.chordTableBody.innerHTML = rows.map((row) => {
    const cells = degreeRoots.map((root, idx) => {
      const quality = row.quality || row.map[idx];
      const label = chordSymbol(root, quality);
      return `<td data-root="${root}" data-quality="${quality}" data-label="${label}">${label}</td>`;
    }).join("");
    return `<tr><td class="row-label">${row.name}</td>${cells}</tr>`;
  }).join("");

  markChordTableCell(appState.root, appState.quality);
}

function renderProgressionStrip() {
  if (!el.progressionStrip) return;
  const progression = buildProgressionChords(el.keySelect.value, el.progressionSelect.value);
  el.progressionStrip.innerHTML = "";

  progression.forEach((step, idx) => {
    const div = document.createElement("div");
    div.className = "strip-step";
    div.dataset.stepIndex = String(idx);
    div.textContent = step.symbol;
    div.addEventListener("click", () => {
      activateProgressionStep(idx);
      playMidiNotes(step.midi, { hold: getHoldSeconds(), asChord: true, restrictToWindow: true });
      clearTimeout(clearStripStepTimer);
      clearStripStepTimer = setTimeout(clearProgressionStep, 340);
    });
    el.progressionStrip.appendChild(div);
  });
}

function renderCadenceStrip() {
  if (!el.cadenceStrip || !el.cadenceSelect) return;
  const cadence = buildCadenceChords(el.keySelect.value, getSelectedCadenceName());
  el.cadenceStrip.innerHTML = "";

  cadence.forEach((step, idx) => {
    const div = document.createElement("div");
    div.className = "strip-step";
    div.dataset.stepIndex = String(idx);
    div.textContent = step.symbol;
    div.addEventListener("click", () => {
      activateCadenceStep(idx);
      playMidiNotes(step.midi, { hold: getHoldSeconds(), asChord: true, restrictToWindow: true });
      clearTimeout(clearStripStepTimer);
      clearStripStepTimer = setTimeout(clearCadenceStep, 340);
    });
    el.cadenceStrip.appendChild(div);
  });
}

function initModeSwitch() {
  if (!el.modeSwitch) return;
  el.modeSwitch.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-mode-target]");
    if (!btn) return;
    setMode(btn.dataset.modeTarget);
  });
}

function setMode(mode) {
  document.body.dataset.activeMode = mode;
  const modeButtons = el.modeSwitch?.querySelectorAll("button[data-mode-target]") || [];
  modeButtons.forEach((btn) => {
    const isActive = btn.dataset.modeTarget === mode;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  document.querySelectorAll("[data-mode]").forEach((section) => {
    const modes = section.dataset.mode.split(/\s+/).filter(Boolean);
    const shouldShow = modes.includes(mode);
    section.classList.toggle("is-hidden", !shouldShow);
    if (shouldShow) {
      section.classList.remove("mode-enter");
      void section.offsetWidth;
      section.classList.add("mode-enter");
    }
  });

  if (mode === "theory") {
    renderTheoryContent();
  } else {
    stopTheoryLessonAudio();
    theoryState.runKeyboardPresses = 0;
  }

  clearTimeout(clearModeEnterTimer);
  clearModeEnterTimer = setTimeout(() => {
    document.querySelectorAll("[data-mode].mode-enter").forEach((section) => {
      section.classList.remove("mode-enter");
    });
  }, 240);
}

function renderTheoryContent() {
  initializeTheoryCourse();
}

function initializeTheoryCourse() {
  if (!el.theoryTrackSelect || !window.THEORY_CURRICULUM) return;
  if (el.theoryTrackSelect.options.length === 0) {
    const trackEntries = Object.entries(window.THEORY_CURRICULUM);
    trackEntries.forEach(([trackId, track]) => {
      const opt = document.createElement("option");
      opt.value = trackId;
      opt.textContent = track.title;
      el.theoryTrackSelect.appendChild(opt);
    });
  }

  if (!theoryState.trackId) {
    theoryState.trackId = el.theoryTrackSelect.value || Object.keys(window.THEORY_CURRICULUM)[0];
    el.theoryTrackSelect.value = theoryState.trackId;
  }

  const lessons = getTheoryLessonsForTrack(theoryState.trackId);
  if (!theoryState.lessonId || !lessons.find((lesson) => lesson.id === theoryState.lessonId)) {
    theoryState.lessonId = lessons[0]?.id || "";
  }

  renderTheoryLessonList();
  renderTheoryLessonDetail();
  renderTheoryProgressSummary();
}

function getTheoryLessonsForTrack(trackId) {
  const track = window.THEORY_CURRICULUM?.[trackId];
  if (!track) return [];
  const baseLessons = track.levels.map((level, idx) => ({
    id: `${trackId}-${idx}`,
    trackId,
    title: level.title,
    description: level.desc,
    resources: Array.isArray(level.resources) ? level.resources : [],
    videoUrl: pickLessonVideoUrl(level.resources, trackId),
    narration: `${track.title}. ${level.title}. ${level.desc}`,
    infographicType: inferInfographicType(trackId, level)
  }));
  const custom = Array.isArray(progress.theoryCustomLessons?.[trackId]) ? progress.theoryCustomLessons[trackId] : [];
  return [...custom, ...baseLessons];
}

function isCustomTheoryLesson(lessonId, trackId = theoryState.trackId) {
  return getCustomTheoryLessonIndex(trackId, lessonId) >= 0;
}

function getCustomTheoryLessonIndex(trackId, lessonId) {
  const bucket = progress.theoryCustomLessons?.[trackId];
  if (!Array.isArray(bucket)) return -1;
  return bucket.findIndex((lesson) => lesson.id === lessonId);
}

function pickLessonVideoUrl(resources, trackId) {
  if (!Array.isArray(resources)) return "";
  const video = resources.find((res) => {
    const url = String(res?.url || "");
    return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com");
  });
  if (video?.url) return video.url;
  const fallbackByTrack = {
    pop: "https://www.youtube.com/watch?v=5pidokakU4I",
    jazz: "https://www.youtube.com/watch?v=KzdbNfkfqT0",
    classical: "https://www.youtube.com/watch?v=jgpJVI3tDbY"
  };
  return fallbackByTrack[trackId] || "";
}

function inferInfographicType(trackId, level) {
  const text = `${trackId} ${level.title} ${level.desc}`.toLowerCase();
  if (text.includes("ii-v-i")) return "ii-v-i";
  if (text.includes("4 chords") || text.includes("i-v-vi-iv")) return "pop-4chord";
  if (text.includes("stave") || text.includes("clef")) return "staff";
  if (text.includes("sus") || text.includes("add")) return "sus-add";
  if (text.includes("rhythm")) return "rhythm-grid";
  if (text.includes("ear")) return "ear-training";
  if (text.includes("improv")) return "improv-map";
  return "functional";
}

function generateTheoryLessonPack(trackId, topic, level) {
  const levelName = level === "noob" ? "Noob" : level === "intermediate" ? "Intermediate" : "Pro";
  const trackTitle = window.THEORY_CURRICULUM?.[trackId]?.title || trackId;
  const presets = {
    progressions: {
      title: `${levelName}: Progression Lab`,
      description: "Experiment with tonic-dominant motion, substitute options, and emotional contour in one loop.",
      infographicType: "functional",
      tokens: ["Tonic", "Predominant", "Dominant", "Color tones", "Loop variations"],
      narration: "Start with a simple progression. Name each function. Add one variation at a time while keeping the top voice connected.",
      resources: [{ label: "Progression Playground Prompt", url: "Use Concept Lab progression mode in 3 keys." }]
    },
    cadences: {
      title: `${levelName}: Cadence Experiments`,
      description: "Hear authentic, plagal, deceptive, and half cadences, then compare emotional impact.",
      infographicType: "ii-v-i",
      tokens: ["V-I", "IV-I", "V-vi", "I-V", "Resolution feel"],
      narration: "Play each cadence twice. Describe the emotional result before changing to the next cadence type.",
      resources: [{ label: "Cadence Drill", url: "Cycle cadences in C, F, and G using the cadence strip." }]
    },
    voicings: {
      title: `${levelName}: Voicing Shapes`,
      description: "Build close, shell, and drop-style voicings that keep motion smooth and hands relaxed.",
      infographicType: "sus-add",
      tokens: ["Close triad", "Shell 3-7", "Drop color", "Top voice motion"],
      narration: "Keep left hand minimal and move right hand voicing by the smallest interval possible between chords.",
      resources: [{ label: "Voicing Workflow", url: "Use Concept Lab voicing variants and transpose every 2 reps." }]
    },
    rhythm: {
      title: `${levelName}: Rhythm & Pocket`,
      description: "Lock timing with subdivisions, anticipation, and bar-level phrasing accents.",
      infographicType: "rhythm-grid",
      tokens: ["Quarter", "Eighth", "Triplet", "Anticipation", "Space"],
      narration: "Clap then play. Keep one motif and shift only the rhythm grid each round.",
      resources: [{ label: "Rhythm Plan", url: "Run 60, 75, then 90 BPM with same chord loop." }]
    },
    "ear-training": {
      title: `${levelName}: Ear Training Builder`,
      description: "Connect what you hear to function, intervals, and chord color choices.",
      infographicType: "ear-training",
      tokens: ["Root motion", "3rd quality", "7th pull", "Cadence ID"],
      narration: "Listen first, then predict the function before confirming on keyboard.",
      resources: [{ label: "Ear Test Prompt", url: "Play progression without looking; identify cadence by ear." }]
    },
    improvisation: {
      title: `${levelName}: Improvisation Path`,
      description: "Create motifs over stable harmony, then expand with guide tones and tension-release phrasing.",
      infographicType: "improv-map",
      tokens: ["Motif", "Guide tones", "Approach notes", "Resolve"],
      narration: "Use a two-bar motif and repeat through the full progression before adding passing tones.",
      resources: [{ label: "Improv Prompt", url: "Record 4 bars using only chord tones, then add one color tone." }]
    }
  };
  const preset = presets[topic] || presets.progressions;
  const nowId = Date.now().toString(36);
  return {
    id: `custom-${trackId}-${topic}-${level}-${nowId}`,
    trackId,
    customTopic: topic,
    customLevel: level,
    title: `${preset.title} (${trackTitle})`,
    description: preset.description,
    resources: preset.resources,
    videoUrl: pickLessonVideoUrl([], trackId),
    narration: preset.narration,
    infographicType: preset.infographicType,
    customTokens: preset.tokens
  };
}

function generateTheoryLessonSeries(trackId, topic, level, count) {
  const safeCount = Math.max(1, Math.min(5, Number(count) || 1));
  const lessons = [];
  for (let i = 0; i < safeCount; i += 1) {
    const lesson = generateTheoryLessonPack(trackId, topic, level);
    if (safeCount > 1) {
      lesson.title = `${lesson.title} • Part ${i + 1}/${safeCount}`;
      lesson.description = `${lesson.description} Focus ${i + 1}: ${theorySeriesFocusByTopic(topic, i)}.`;
    }
    lessons.push(lesson);
  }
  return lessons;
}

function theorySeriesFocusByTopic(topic, idx) {
  const focus = {
    progressions: ["Function map", "Voice-leading", "Rhythmic shape", "Color substitutions", "Performance test"],
    cadences: ["Cadence ID", "Emotion compare", "Inversion impact", "Tempo context", "Reharm challenge"],
    voicings: ["Shell voicings", "Drop voicings", "Top-note melody", "Tension control", "Playability"],
    rhythm: ["Subdivision lock", "Accent shift", "Syncopation", "Pocket shaping", "Live loop"],
    "ear-training": ["Interval hearing", "Function hearing", "Cadence hearing", "Tension hearing", "Call-and-response"],
    improvisation: ["Motif creation", "Guide-tone path", "Target notes", "Phrase arcs", "Narrative chorus"]
  };
  const byTopic = focus[topic] || focus.progressions;
  return byTopic[idx % byTopic.length];
}

function parseTheoryResourcesFromEditor(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [labelRaw, ...urlParts] = line.split("|");
      const label = (labelRaw || "").trim();
      const url = urlParts.join("|").trim();
      if (url) return { label: label || url, url };
      return { label, url: "" };
    })
    .filter((item) => item.label);
}

function getCurrentTheoryLesson() {
  if (!theoryState.trackId || !theoryState.lessonId) return null;
  return getTheoryLessonsForTrack(theoryState.trackId).find((lesson) => lesson.id === theoryState.lessonId) || null;
}

function renderTheoryLessonList() {
  if (!el.theoryLessonList) return;
  const lessons = getTheoryLessonsForTrack(theoryState.trackId);
  el.theoryLessonList.innerHTML = "";
  lessons.forEach((lesson) => {
    const btn = document.createElement("button");
    const isCompleted = Boolean(progress.theoryCompletedLessons?.[lesson.id]);
    btn.className = "theory-lesson-btn";
    if (lesson.id === theoryState.lessonId) btn.classList.add("is-active");
    if (isCompleted) btn.classList.add("is-complete");
    btn.type = "button";
    const customPrefix = isCustomTheoryLesson(lesson.id, theoryState.trackId) ? "Generated: " : "";
    btn.textContent = `${isCompleted ? "Completed: " : ""}${customPrefix}${lesson.title}`;
    btn.addEventListener("click", () => {
      theoryState.isEditingLesson = false;
      if (theoryState.activeRunLessonId !== lesson.id) {
        theoryState.runKeyboardPresses = 0;
      }
      theoryState.lessonId = lesson.id;
      renderTheoryLessonList();
      renderTheoryLessonDetail();
    });
    el.theoryLessonList.appendChild(btn);
  });
}

function renderTheoryLessonDetail() {
  const lesson = getCurrentTheoryLesson();
  if (!lesson) return;
  const isCustom = isCustomTheoryLesson(lesson.id);

  if (el.theoryLessonTitle) el.theoryLessonTitle.textContent = lesson.title;
  if (el.theoryLessonDesc) el.theoryLessonDesc.textContent = lesson.description;
  if (el.theoryAudioUrlInput) {
    el.theoryAudioUrlInput.value = progress.theoryAudioByLesson?.[lesson.id] || "";
  }
  if (el.theoryEditLessonBtn) el.theoryEditLessonBtn.disabled = !isCustom;
  if (el.theoryDeleteLessonBtn) el.theoryDeleteLessonBtn.disabled = !isCustom;
  renderTheoryLessonEditor(lesson, isCustom);
  renderGuidedTheoryLesson(lesson);

  renderTheoryInfographic(lesson);
  renderTheoryVideo(lesson);
  renderTheoryResources(lesson);
}

function renderTheoryLessonEditor(lesson, isCustom) {
  if (!el.theoryEditPanel) return;
  if (!isCustom || !theoryState.isEditingLesson) {
    el.theoryEditPanel.hidden = true;
    return;
  }
  el.theoryEditPanel.hidden = false;
  if (el.theoryEditTitleInput) el.theoryEditTitleInput.value = lesson.title || "";
  if (el.theoryEditDescInput) el.theoryEditDescInput.value = lesson.description || "";
  if (el.theoryEditNarrationInput) el.theoryEditNarrationInput.value = lesson.narration || "";
  if (el.theoryEditTokensInput) {
    el.theoryEditTokensInput.value = Array.isArray(lesson.customTokens) ? lesson.customTokens.join(", ") : "";
  }
  if (el.theoryEditVideoUrlInput) el.theoryEditVideoUrlInput.value = lesson.videoUrl || "";
  if (el.theoryEditResourcesInput) {
    el.theoryEditResourcesInput.value = (lesson.resources || [])
      .map((res) => `${res.label || ""}|${res.url || ""}`.trim())
      .join("\n");
  }
}

function renderTheoryInfographic(lesson) {
  if (!el.theoryInfographic) return;
  const tokensByType = {
    "ii-v-i": ["ii", "V7", "Imaj7", "Guide tones: 3rd/7th", "Voice leading: stepwise"],
    "pop-4chord": ["I", "V", "vi", "IV", "Hook loop", "Top-note melody"],
    staff: ["Treble clef", "Bass clef", "Middle C", "Ledger lines", "Rhythmic grouping"],
    "sus-add": ["sus2", "sus4", "add9", "Resolve to 3rd", "Color tones"],
    "rhythm-grid": ["1 e + a", "Backbeat", "Syncopation", "Anticipation", "Release"],
    "ear-training": ["Interval ID", "Chord quality", "Function by ear", "Cadence feel"],
    "improv-map": ["Motif", "Sequence", "Guide tone line", "Target note", "Resolve"],
    functional: ["Tonic", "Predominant", "Dominant", "Cadence", "Resolution"]
  };
  const tokens = Array.isArray(lesson.customTokens) && lesson.customTokens.length > 0
    ? lesson.customTokens
    : (tokensByType[lesson.infographicType] || tokensByType.functional);
  el.theoryInfographic.innerHTML = `
    <div class="theory-graphic-title">Infographic: ${lesson.title}</div>
    <div class="theory-token-row">
      ${tokens.map((token) => `<span class="theory-token">${token}</span>`).join("")}
    </div>
  `;
}

function renderTheoryVideo(lesson) {
  if (!el.theoryVideoFrame) return;
  const embedUrl = toEmbedUrl(lesson.videoUrl);
  if (embedUrl) {
    el.theoryVideoFrame.src = embedUrl;
    el.theoryVideoFrame.style.display = "block";
  } else {
    el.theoryVideoFrame.removeAttribute("src");
    el.theoryVideoFrame.style.display = "none";
  }
}

function toEmbedUrl(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }
      if (parsed.pathname.startsWith("/embed/")) return url;
    }
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    return url;
  } catch {
    return "";
  }
}

function renderTheoryResources(lesson) {
  if (!el.theoryResources) return;
  const resources = Array.isArray(lesson.resources) ? lesson.resources : [];
  const links = resources
    .map((res) => `${res.label}: ${res.url}`)
    .join(" | ");
  el.theoryResources.textContent = links || "No external lesson resources linked yet.";
}

function getTheoryLessonRunStats(lessonId, createIfMissing = true) {
  if (!lessonId) return null;
  if (!progress.theoryLessonRuns) progress.theoryLessonRuns = {};
  if (!progress.theoryLessonRuns[lessonId] && createIfMissing) {
    progress.theoryLessonRuns[lessonId] = { starts: 0, examplePlays: 0, attempts: 0, keyPresses: 0, passed: false };
  }
  return progress.theoryLessonRuns[lessonId] || null;
}

function inferTheoryCustomLessonTopic(lesson) {
  if (!lesson) return "";
  if (typeof lesson.customTopic === "string" && lesson.customTopic.trim()) {
    return lesson.customTopic.trim().toLowerCase();
  }

  if (typeof lesson.id === "string" && lesson.id.startsWith("custom-")) {
    const parts = lesson.id.split("-");
    const levelIdx = parts.findIndex((part, idx) => idx > 1 && ["noob", "intermediate", "pro"].includes(part));
    if (levelIdx > 2) {
      const topic = parts.slice(2, levelIdx).join("-");
      if (topic) return topic.toLowerCase();
    }
  }

  const text = `${lesson.title || ""} ${lesson.description || ""}`.toLowerCase();
  if (text.includes("progression")) return "progressions";
  if (text.includes("cadence")) return "cadences";
  if (text.includes("voicing") || text.includes("shell") || text.includes("rootless")) return "voicings";
  if (text.includes("rhythm") || text.includes("timing") || text.includes("pocket")) return "rhythm";
  if (text.includes("ear")) return "ear-training";
  if (text.includes("improv")) return "improvisation";
  return "";
}

function buildGuidedTheoryPlan(lesson) {
  const passCondition = "Pass = hear one example + log 3 attempts + at least 24 keyboard presses total.";
  const explicit = GUIDED_LESSON_BLUEPRINTS[lesson.id];
  if (explicit) {
    return {
      objective: explicit.objective,
      steps: [...explicit.steps].slice(0, 3),
      history: explicit.history,
      funFact: explicit.funFact,
      songs: [...explicit.songs],
      practice: { ...explicit.practice },
      passCondition: explicit.passCondition || passCondition
    };
  }

  const trackId = lesson.trackId || theoryState.trackId || "pop";
  const base = GUIDED_TRACK_DEFAULTS[trackId] || GUIDED_TRACK_DEFAULTS.pop;
  const plan = {
    objective: base.objective,
    steps: [...base.steps],
    history: base.history,
    funFact: base.funFact,
    songs: [...base.songs],
    practice: { ...base.practice },
    passCondition
  };

  const customTopic = inferTheoryCustomLessonTopic(lesson);
  const isCustom = isCustomTheoryLesson(lesson.id, lesson.trackId || trackId);
  const topicTemplate = GUIDED_TOPIC_TEMPLATES[customTopic];
  if (isCustom && topicTemplate) {
    const songs = topicTemplate.songsByTrack?.[trackId] || plan.songs;
    const practice = topicTemplate.practiceByTrack?.[trackId] || plan.practice;
    return {
      objective: topicTemplate.objective || plan.objective,
      steps: [...(topicTemplate.steps || plan.steps)].slice(0, 3),
      history: topicTemplate.history || plan.history,
      funFact: topicTemplate.funFact || plan.funFact,
      songs: [...songs],
      practice: { ...practice },
      passCondition: topicTemplate.passCondition || passCondition
    };
  }

  const text = `${lesson.title} ${lesson.description}`.toLowerCase();
  if (text.includes("cadence")) {
    plan.practice = { mode: "cadence", key: trackId === "jazz" ? "F" : "C", cadenceName: trackId === "jazz" ? "ii-V-I (Jazz cadence)" : "Authentic (V-I)" };
    plan.songs = trackId === "jazz"
      ? ["Autumn Leaves (cadential jazz release).", "Blue Bossa (minor-to-dominant cadence control)."]
      : ["Hallelujah - Leonard Cohen (cadential pull in pop context).", "Canon in D - Pachelbel (cadential sequence stability)."];
  } else if (text.includes("voicing") || text.includes("shell") || text.includes("rootless")) {
    plan.practice = { mode: "chord", key: trackId === "jazz" ? "F" : "C", chordQuality: trackId === "jazz" ? "min7" : "maj7", inversion: "root position" };
    plan.songs = trackId === "jazz"
      ? ["Autumn Leaves (shell voicing utility).", "All the Things You Are (voice-leading through key movement)."]
      : ["Best Part - Daniel Caesar (color voicing smoothness).", "Ain't No Sunshine - Bill Withers (compact voicing expression)."];
  } else if (text.includes("rhythm")) {
    plan.practice = { mode: "progression", key: "C", progressionName: "I-vi-IV-V (Pop)" };
    plan.songs = ["Billie Jean - Michael Jackson (steady pocket discipline).", "Superstition - Stevie Wonder (groove consistency)."];
  } else if (text.includes("ear")) {
    plan.practice = { mode: "cadence", key: "C", cadenceName: "Authentic (V-I)" };
    plan.songs = ["Stand by Me - Ben E. King (functional hearing anchor).", "Let It Be - The Beatles (harmonic hearing clarity)."];
  } else if (text.includes("improv")) {
    plan.practice = { mode: "scale", key: trackId === "jazz" ? "D" : "C", scaleType: trackId === "jazz" ? "mixolydian (jazz/blues)" : "major (classical)" };
    plan.songs = trackId === "jazz"
      ? ["So What - Miles Davis (modal phrase expansion).", "Impressions - John Coltrane (motif development over mode)."]
      : ["Clocks - Coldplay (motif repetition and variation).", "River Flows in You - Yiruma (pattern-based phrasing)."];
  } else if (text.includes("scale")) {
    plan.practice = { mode: "scale", key: trackId === "classical" ? "C" : "D", scaleType: trackId === "classical" ? "major (classical)" : "major bebop (jazz)" };
  }

  return plan;
}

function applyGuidedLessonSetup(plan) {
  const setup = plan.practice || {};
  const key = setup.key || appState.root;
  setRootContext(key);
  if (el.rootSelect) el.rootSelect.value = key;
  if (el.keySelect) el.keySelect.value = key;
  if (el.scaleRootSelect) el.scaleRootSelect.value = key;
  if (el.arpRootSelect) el.arpRootSelect.value = key;
  if (el.conceptKeySelect) el.conceptKeySelect.value = key;

  if (setup.mode === "progression" && setup.progressionName && el.progressionSelect && PROGRESSIONS[setup.progressionName]) {
    el.progressionSelect.value = setup.progressionName;
    renderProgressionStrip();
  }
  if (setup.mode === "cadence" && setup.cadenceName && el.cadenceSelect && CADENCES[setup.cadenceName]) {
    el.cadenceSelect.value = setup.cadenceName;
    renderCadenceStrip();
  }
  if (setup.mode === "scale" && setup.scaleType && el.scaleTypeSelect && SCALE_FAMILIES[setup.scaleType]) {
    el.scaleTypeSelect.value = setup.scaleType;
  }
  if (setup.mode === "chord") {
    appState.quality = setup.chordQuality || appState.quality;
    appState.inversion = setup.inversion || "root position";
    updateButtonActiveState(el.qualityBtnGroup, appState.quality);
    updateButtonActiveState(el.inversionBtnGroup, appState.inversion);
    if (el.qualitySelect) el.qualitySelect.value = appState.quality;
    if (el.inversionSelect) el.inversionSelect.value = appState.inversion;
    markChordTableCell(key, appState.quality);
  }
}

async function playGuidedPlanExample(plan) {
  const setup = plan.practice || {};
  const hold = Math.max(0.35, getHoldSeconds() * 0.66);

  if (setup.mode === "progression") {
    const seq = buildProgressionChords(setup.key || appState.root, setup.progressionName || "I-vi-IV-V (Pop)");
    for (const step of seq) {
      playMidiNotes(step.midi, { hold, asChord: true, highlightMs: getHighlightMs(hold, 170), restrictToWindow: true });
      await wait(220);
    }
    return seq.flatMap((step) => step.midi);
  }

  if (setup.mode === "cadence") {
    const seq = buildCadenceChords(setup.key || appState.root, setup.cadenceName || "Authentic (V-I)");
    for (const step of seq) {
      playMidiNotes(step.midi, { hold, asChord: true, highlightMs: getHighlightMs(hold, 170), restrictToWindow: true });
      await wait(230);
    }
    return seq.flatMap((step) => step.midi);
  }

  if (setup.mode === "scale") {
    const intervals = SCALE_FAMILIES[setup.scaleType || "major (classical)"]?.intervals || SCALE_FAMILIES["major (classical)"].intervals;
    const notes = buildScaleMidi(setup.key || appState.root, intervals, 3);
    for (const midi of notes) {
      playMidiNotes([midi], { hold: 0.38, asChord: true, highlightMs: 150 });
      await wait(180);
    }
    return notes;
  }

  const chord = buildChordMidi(setup.key || appState.root, setup.chordQuality || appState.quality, setup.inversion || "root position", 3);
  playMidiNotes(chord, { hold, asChord: true, highlightMs: getHighlightMs(hold, 170), restrictToWindow: true });
  await wait(220);
  return chord;
}

function renderGuidedTheoryLesson(lesson) {
  const plan = buildGuidedTheoryPlan(lesson);
  const stats = getTheoryLessonRunStats(lesson.id);
  const attemptsDone = stats?.attempts || 0;
  const examplesDone = stats?.examplePlays || 0;
  const keyPressesDone = stats?.keyPresses || 0;
  const isCompleted = Boolean(progress.theoryCompletedLessons?.[lesson.id]);
  const hasActiveRun = theoryState.activeRunLessonId === lesson.id;

  if (el.theoryLessonObjective) {
    el.theoryLessonObjective.textContent = `Objective: ${plan.objective}`;
  }
  if (el.theoryLessonSteps) {
    const stepOne = examplesDone > 0 ? "[done]" : "[todo]";
    const stepTwo = attemptsDone > 0 ? "[done]" : "[todo]";
    const stepThree = attemptsDone >= 3 ? "[done]" : "[todo]";
    el.theoryLessonSteps.textContent = `Steps: ${stepOne} ${plan.steps[0]} | ${stepTwo} ${plan.steps[1]} | ${stepThree} ${plan.steps[2]}`;
  }
  if (el.theoryLessonPass) {
    el.theoryLessonPass.textContent = `Pass criteria: ${plan.passCondition} Current: ${examplesDone} example plays, ${attemptsDone} attempts, ${keyPressesDone} key presses.${isCompleted ? " Status: completed." : ""}`;
  }
  if (el.theoryHistoryFun) {
    el.theoryHistoryFun.textContent = `History: ${plan.history} | Fun fact: ${plan.funFact}`;
  }
  if (el.theorySongLinks) {
    el.theorySongLinks.textContent = `Song context: ${plan.songs.join(" | ")}`;
  }
  if (el.theoryGuidedStatus) {
    el.theoryGuidedStatus.textContent = isCompleted
      ? "Lesson completed. You can still replay or run more attempts."
      : hasActiveRun
      ? `Lesson run active. Keyboard presses this run: ${theoryState.runKeyboardPresses}.`
      : "Press Start Lesson to auto-load the drill and begin measured practice.";
  }
}

async function startGuidedTheoryLesson() {
  const lesson = getCurrentTheoryLesson();
  if (!lesson) return;
  const plan = buildGuidedTheoryPlan(lesson);
  const stats = getTheoryLessonRunStats(lesson.id);
  stats.starts += 1;
  theoryState.activeRunLessonId = lesson.id;
  theoryState.runKeyboardPresses = 0;
  applyGuidedLessonSetup(plan);
  saveProgress();
  renderGuidedTheoryLesson(lesson);
  if (el.theoryGuidedStatus) {
    el.theoryGuidedStatus.textContent = "Lesson started. Model playback running now.";
  }
  await playGuidedTheoryExample();
}

async function playGuidedTheoryExample() {
  const lesson = getCurrentTheoryLesson();
  if (!lesson) return;
  if (theoryState.activeRunLessonId !== lesson.id) {
    if (el.theoryGuidedStatus) {
      el.theoryGuidedStatus.textContent = "Press Start Lesson first so the drill is configured.";
    }
    return;
  }
  const plan = buildGuidedTheoryPlan(lesson);
  const stats = getTheoryLessonRunStats(lesson.id);
  stats.examplePlays += 1;
  const playedMidi = await playGuidedPlanExample(plan);
  saveProgress();
  if (el.chordDisplay && Array.isArray(playedMidi) && playedMidi.length > 0) {
    el.chordDisplay.textContent = `Guided example: ${playedMidi.map(midiToNoteName).join(" - ")}`;
  }
  renderGuidedTheoryLesson(lesson);
}

function logGuidedTheoryAttempt() {
  const lesson = getCurrentTheoryLesson();
  if (!lesson) return;
  if (theoryState.activeRunLessonId !== lesson.id) {
    if (el.theoryGuidedStatus) {
      el.theoryGuidedStatus.textContent = "Start the lesson first, then play on the keyboard.";
    }
    return;
  }
  if (theoryState.runKeyboardPresses < 8) {
    if (el.theoryGuidedStatus) {
      el.theoryGuidedStatus.textContent = `Need at least 8 key presses before logging an attempt. Current: ${theoryState.runKeyboardPresses}.`;
    }
    return;
  }
  const stats = getTheoryLessonRunStats(lesson.id);
  const plan = buildGuidedTheoryPlan(lesson);
  stats.attempts += 1;
  stats.keyPresses += theoryState.runKeyboardPresses;
  theoryState.runKeyboardPresses = 0;
  const areaByMode = { progression: "progressions", cadence: "progressions", scale: "scales", chord: "chords" };
  const area = areaByMode[plan.practice?.mode] || "scales";
  trackRep(area, `guided-${lesson.id}`);
  saveProgress();
  renderGuidedTheoryLesson(lesson);
  if (el.theoryGuidedStatus) {
    el.theoryGuidedStatus.textContent = `Attempt logged. Total attempts: ${stats.attempts}.`;
  }
}

function checkGuidedTheoryPass() {
  const lesson = getCurrentTheoryLesson();
  if (!lesson) return;
  const stats = getTheoryLessonRunStats(lesson.id);
  const needsExamples = Math.max(0, 1 - stats.examplePlays);
  const needsAttempts = Math.max(0, 3 - stats.attempts);
  const needsKeyPresses = Math.max(0, 24 - stats.keyPresses);
  const passed = needsExamples === 0 && needsAttempts === 0 && needsKeyPresses === 0;

  if (passed) {
    stats.passed = true;
    progress.theoryCompletedLessons[lesson.id] = true;
    saveProgress();
    renderTheoryLessonList();
    renderTheoryProgressSummary();
    renderProgress();
    renderGuidedTheoryLesson(lesson);
    if (el.theoryGuidedStatus) {
      el.theoryGuidedStatus.textContent = "Pass achieved. Lesson marked complete.";
    }
    return;
  }

  if (el.theoryGuidedStatus) {
    el.theoryGuidedStatus.textContent = `Not passed yet. Remaining: ${needsExamples} example play(s), ${needsAttempts} attempt(s), ${needsKeyPresses} key press(es).`;
  }
}

function onTheoryGuidedKeyPress() {
  if (document.body?.dataset.activeMode !== "theory") return;
  const lesson = getCurrentTheoryLesson();
  if (!lesson) return;
  if (theoryState.activeRunLessonId !== lesson.id) return;
  theoryState.runKeyboardPresses += 1;
}

function renderTheoryProgressSummary() {
  if (!el.theoryProgressSummary || !window.THEORY_CURRICULUM) return;
  const allLessons = Object.keys(window.THEORY_CURRICULUM)
    .flatMap((trackId) => getTheoryLessonsForTrack(trackId));
  const total = allLessons.length;
  const completed = allLessons.filter((lesson) => progress.theoryCompletedLessons?.[lesson.id]).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  el.theoryProgressSummary.textContent = `Theory progress: ${completed}/${total} lessons completed (${percent}%).`;
}

function playTheoryLessonAudio() {
  const lesson = getCurrentTheoryLesson();
  if (!lesson) return;
  stopTheoryLessonAudio();

  const url = progress.theoryAudioByLesson?.[lesson.id];
  if (url) {
    const audio = new Audio(url);
    audio.play().catch(() => {
      if (el.theoryResources) {
        el.theoryResources.textContent = "Unable to play audio URL. Check the NotebookLM audio link.";
      }
    });
    theoryState.audioEl = audio;
    return;
  }

  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(lesson.narration);
    utterance.rate = 0.96;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
    theoryState.speechUtterance = utterance;
    return;
  }

  if (el.theoryResources) {
    el.theoryResources.textContent = "No NotebookLM audio URL saved. Add one or use a browser with speech synthesis support.";
  }
}

function stopTheoryLessonAudio() {
  if (theoryState.audioEl) {
    theoryState.audioEl.pause();
    theoryState.audioEl.currentTime = 0;
    theoryState.audioEl = null;
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    theoryState.speechUtterance = null;
  }
}

function initializeCompanionPanels() {
  if (el.conceptSelect) {
    Object.entries(CONCEPT_CATALOG).forEach(([id, config]) => {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = config.label;
      el.conceptSelect.appendChild(opt);
    });
  }

  if (el.conceptKeySelect) {
    populateSelect(el.conceptKeySelect, NOTES);
    el.conceptKeySelect.value = appState.root;
  }

  populateConceptVariants();
  renderGlossaryEntries();
  showGlossaryEntryDetails();
}

function populateConceptVariants() {
  if (!el.conceptVariantSelect || !el.conceptSelect) return;
  const conceptId = el.conceptSelect.value || "progression";
  const options = CONCEPT_CATALOG[conceptId]?.variants || [];
  el.conceptVariantSelect.innerHTML = "";
  options.forEach((value) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    el.conceptVariantSelect.appendChild(opt);
  });
}

async function playSelectedConcept() {
  const concept = getSelectedConcept();
  const hold = getHoldSeconds();

  if (concept.type === "progression") {
    playConceptSequence(concept.chords, hold);
    el.conceptOutput.textContent = `${concept.label} in ${concept.key}: ${concept.chords.map((s) => s.symbol).join(" -> ")}`;
    return;
  }

  if (concept.type === "scale") {
    const notes = buildScaleMidi(concept.key, SCALE_FAMILIES[concept.variant].intervals, 3);
    const hold = Math.max(0.3, getHoldSeconds() * 0.5);
    for (const midi of notes) {
      playMidiNotes([midi], { hold, asChord: true, velocity: 0.78 });
      await wait(220);
    }
    el.conceptOutput.textContent = `${concept.variant} in ${concept.key}: ${notes.map(midiToNoteName).join(" - ")}`;
    return;
  }

  playMidiNotes(concept.midi, { hold, asChord: true, highlightMs: getHighlightMs(hold), restrictToWindow: true });
  el.conceptOutput.textContent = `${concept.label} in ${concept.key}: ${concept.symbols.join(" -> ")}`;
}

function explainSelectedConcept() {
  const concept = getSelectedConcept();
  if (concept.type === "progression") {
    el.conceptOutput.textContent = [
      `${concept.label} in ${concept.key}.`,
      `Why it works: ${concept.theory}`,
      `Emotional color: ${concept.emotion}`,
      `Try this: ${concept.practice}`
    ].join(" ");
    return;
  }

  el.conceptOutput.textContent = [
    `${concept.label} in ${concept.key}.`,
    `Why it works: ${concept.theory}`,
    `Emotional color: ${concept.emotion}`,
    `Try this: ${concept.practice}`
  ].join(" ");
}

function getSelectedConcept() {
  const conceptId = el.conceptSelect?.value || "progression";
  const key = el.conceptKeySelect?.value || el.keySelect.value;
  const variant = el.conceptVariantSelect?.value || "";

  if (conceptId === "progression") {
    const chords = buildProgressionChords(key, variant);
    return {
      type: "progression",
      key,
      variant,
      chords,
      label: variant,
      theory: "Functional movement balances tension and release through tonic, pre-dominant, and dominant areas.",
      emotion: "Directional, story-like movement with clear momentum.",
      practice: "Loop in 3 keys and keep top note movement as stepwise as possible."
    };
  }

  if (conceptId === "cadence") {
    const chords = buildCadenceChords(key, variant);
    const profile = getCadenceProfile(variant);
    return {
      type: "progression",
      key,
      variant,
      chords,
      label: variant,
      theory: profile.theory,
      emotion: profile.emotion,
      practice: profile.useCase
    };
  }

  if (conceptId === "scale_color") {
    return {
      type: "scale",
      key,
      variant,
      label: `${variant} scale`,
      theory: `Scale tones create melodic gravity around ${key} as a tonal center.`,
      emotion: variant.includes("minor") ? "Darker and introspective." : "Brighter and open.",
      practice: "Improvise 4 bars using only 3 notes first, then expand."
    };
  }

  const voicingMap = {
    "Triad close": ["major"],
    "7th shell": ["dom7"],
    "Drop-2 flavor": ["maj7"],
    "Sus color": ["sus4"]
  };
  const quality = voicingMap[variant]?.[0] || "major";
  const midi = buildChordMidi(key, quality, "root position", 3);
  return {
    type: "voicing",
    key,
    variant,
    label: `${variant} voicing`,
    symbols: [chordSymbol(key, quality)],
    midi,
    theory: "Voicing choice controls density, tension, and hand ergonomics more than chord function itself.",
    emotion: variant === "Sus color" ? "Open and unresolved." : "Tighter and more direct.",
    practice: "Move same voicing through I-IV-V in one key, then transpose."
  };
}

async function playConceptSequence(chords, hold) {
  for (let i = 0; i < chords.length; i += 1) {
    playMidiNotes(chords[i].midi, { hold, asChord: true, restrictToWindow: true });
    await wait(Math.max(220, hold * 560));
  }
}

function renderGlossaryEntries() {
  if (!el.glossaryEntrySelect) return;
  const term = (el.glossarySearchInput?.value || "").trim().toLowerCase();
  const category = el.glossaryCategorySelect?.value || "all";
  const filtered = GLOSSARY_ITEMS.filter((item) => {
    const matchCategory = category === "all" || category === item.kind;
    const haystack = `${item.name} ${item.symbol} ${item.definition} ${item.emotion} ${item.useCase}`.toLowerCase();
    const matchSearch = !term || haystack.includes(term);
    return matchCategory && matchSearch;
  });

  el.glossaryEntrySelect.innerHTML = "";
  filtered.forEach((item) => {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = `${item.name} (${item.symbol})`;
    el.glossaryEntrySelect.appendChild(opt);
  });

  showGlossaryEntryDetails();
}

function showGlossaryEntryDetails() {
  if (!el.glossaryEntrySelect || !el.glossaryOutput) return;
  const id = el.glossaryEntrySelect.value;
  const item = GLOSSARY_ITEMS.find((entry) => entry.id === id) || GLOSSARY_ITEMS[0];
  if (!item) return;
  el.glossaryOutput.textContent = [
    `${item.name} (${item.symbol})`,
    `Definition: ${item.definition}`,
    `Emotional color: ${item.emotion}`,
    `Use it when: ${item.useCase}`
  ].join(" | ");
}

function playGlossaryExample() {
  if (!el.glossaryEntrySelect) return;
  const id = el.glossaryEntrySelect.value;
  const item = GLOSSARY_ITEMS.find((entry) => entry.id === id);
  if (!item) return;

  const key = el.keySelect.value;
  if (item.example.type === "progression") {
    const progression = buildProgressionChords(key, item.example.name);
    playConceptSequence(progression, getHoldSeconds());
    return;
  }

  const quality = item.example.quality || "major";
  const root = item.example.degree !== undefined
    ? NOTES[(NOTES.indexOf(key) + degreeToSemitone(item.example.degree)) % 12]
    : key;
  const midi = buildChordMidi(root, quality, "root position", 3);
  playMidiNotes(midi, { hold: getHoldSeconds(), asChord: true, highlightMs: getHighlightMs(getHoldSeconds()), restrictToWindow: true });
}

function clearChordTableSelection() {
  el.chordTableBody.querySelectorAll("td.is-selected").forEach((cell) => {
    cell.classList.remove("is-selected");
  });
}

function findChordCell(root, quality) {
  const cells = el.chordTableBody.querySelectorAll("td[data-root][data-quality]");
  return Array.from(cells).find((cell) => cell.dataset.root === root && cell.dataset.quality === quality);
}

function markChordTableCell(root, quality) {
  clearChordTableSelection();
  const cell = findChordCell(root, quality);
  if (cell) {
    cell.classList.add("is-selected");
  }
}

function activateProgressionStep(index) {
  const steps = el.progressionStrip.querySelectorAll(".strip-step");
  steps.forEach((step, idx) => {
    step.classList.toggle("is-active", idx === index);
  });
}

function clearProgressionStep() {
  const steps = el.progressionStrip.querySelectorAll(".strip-step");
  steps.forEach((step) => step.classList.remove("is-active"));
}

function activateCadenceStep(index) {
  if (!el.cadenceStrip) return;
  const steps = el.cadenceStrip.querySelectorAll(".strip-step");
  steps.forEach((step, idx) => {
    step.classList.toggle("is-active", idx === index);
  });
}

function clearCadenceStep() {
  if (!el.cadenceStrip) return;
  const steps = el.cadenceStrip.querySelectorAll(".strip-step");
  steps.forEach((step) => step.classList.remove("is-active"));
}

function chordSymbol(root, quality) {
  return `${root}${CHORDS[quality].short}`;
}

function buildChordMidi(root, quality, inversion = "root position", baseOctave = 3) {
  const rootMidi = 12 * (baseOctave + 1) + NOTES.indexOf(root);
  const midi = CHORDS[quality].intervals.map((interval) => rootMidi + interval);

  if (inversion === "1st inversion") {
    midi.push(midi.shift() + 12);
  }

  if (inversion === "2nd inversion") {
    midi.push(midi.shift() + 12);
    midi.push(midi.shift() + 12);
  }

  return midi;
}

function buildScaleMidi(root, intervals, octave = 3) {
  const base = 12 * (octave + 1) + NOTES.indexOf(root);
  return intervals.map((interval) => base + interval);
}

function buildProgressionChords(key, progressionName) {
  const degreeOffsets = PROGRESSIONS[progressionName];
  const keyIndex = NOTES.indexOf(key);

  return degreeOffsets.map((offset, i) => {
    const degreeRoot = NOTES[(keyIndex + degreeToSemitone(offset)) % 12];
    const quality = chooseDiatonicQuality(offset, progressionName, i);
    const midi = buildChordMidi(degreeRoot, quality, "root position", 3);
    return {
      degree: romanForDegree(offset),
      name: `${degreeRoot} ${CHORDS[quality].label}`,
      symbol: chordSymbol(degreeRoot, quality),
      midi
    };
  });
}

function buildCadenceChords(key, cadenceName) {
  const degreeOffsets = CADENCES[cadenceName] || CADENCES["Authentic (V-I)"];
  const keyIndex = NOTES.indexOf(key);

  return degreeOffsets.map((offset, i) => {
    const degreeRoot = NOTES[(keyIndex + degreeToSemitone(offset)) % 12];
    const quality = chooseDiatonicQuality(offset, cadenceName, i);
    const midi = buildChordMidi(degreeRoot, quality, "root position", 3);
    return {
      degree: romanForDegree(offset),
      name: `${degreeRoot} ${CHORDS[quality].label}`,
      symbol: chordSymbol(degreeRoot, quality),
      midi
    };
  });
}

function getCadenceProfile(cadenceName) {
  return CADENCE_PROFILES[cadenceName] || CADENCE_PROFILES["Authentic (V-I)"];
}

function buildDiatonicSevenths(key) {
  const keyIndex = NOTES.indexOf(key);
  const qualities = ["maj7", "min7", "min7", "maj7", "dom7", "min7", "m7b5"];
  return qualities.map((quality, idx) => {
    const root = NOTES[(keyIndex + DEGREE_TO_SEMITONE[idx]) % 12];
    return { root, quality, symbol: chordSymbol(root, quality), midi: buildChordMidi(root, quality, "root position", 3) };
  });
}

function romanForDegree(degree) {
  const idx = degree % 7;
  return ROMAN[idx] || "I";
}

function degreeToSemitone(degreeIndex) {
  return DEGREE_TO_SEMITONE[degreeIndex % 7];
}

function chooseDiatonicQuality(degree, progressionName, index) {
  if (progressionName.includes("12-Bar")) {
    if (index === 8 || index === 11) return "dom7";
    return "major";
  }

  if (progressionName.includes("ii-V-I")) {
    if (degree === 1) return "min7";
    if (degree === 4) return "dom7";
    if (degree === 0) return "maj7";
  }

  const map = ["major", "minor", "minor", "major", "major", "minor", "diminished"];
  return map[degree % 7] || "major";
}

function getHoldSeconds() {
  const seconds = Number(el.voiceLengthInput.value);
  return Number.isFinite(seconds) ? Math.min(4, Math.max(0.4, seconds)) : 1.7;
}

function toneColor() {
  const value = Number(el.toneInput.value);
  return Number.isFinite(value) ? Math.min(95, Math.max(20, value)) : 62;
}

function getTotalRequiredSamples() {
  return requiredSampleCount > 0 ? requiredSampleCount : SALAMANDER_SAMPLE_NOTES.length;
}

function isSampleEngineLoading() {
  const total = getTotalRequiredSamples();
  return samplePreloadStarted && (sampleBuffers.size + failedSampleNotes.size) < total;
}

function updateSampleEngineReadiness() {
  if (htmlSampleEngineActive) {
    sampleEngineReady = true;
    return;
  }
  const total = getTotalRequiredSamples();
  sampleEngineReady = total > 0 && sampleBuffers.size >= total && failedSampleNotes.size === 0;
}

function sampleNoteToToneLabel(sampleNote) {
  return sampleNote.replace("s", "#");
}

function getToneSamplerUrls() {
  const urls = {};
  SALAMANDER_SAMPLE_NOTES.forEach((sampleNote) => {
    urls[sampleNoteToToneLabel(sampleNote)] = `${sampleNote}.mp3`;
  });
  return urls;
}

function flushTonePendingRequests() {
  tonePendingRequests.length = 0;
}

function isToneEngineAvailable() {
  return USE_TONE_ENGINE && Boolean(window.Tone);
}

async function ensureToneEngine() {
  if (!isToneEngineAvailable()) return false;
  if (toneEngineReady && toneSampler) return true;
  if (toneEngineInitPromise) return toneEngineInitPromise;

  const initPromise = (async () => {
    try {
      await window.Tone.start();
      if (typeof window.Tone.getContext === "function") {
        const ctx = window.Tone.getContext();
        if (ctx && typeof ctx.resume === "function" && ctx.state !== "running") {
          await ctx.resume();
        }
      }
      const baseUrl = `${LOCAL_SAMPLE_BASE}/`;
      await new Promise((resolve, reject) => {
        toneSampler = new window.Tone.Sampler({
          urls: getToneSamplerUrls(),
          baseUrl,
          attack: 0.001,
          release: 1.2,
          onload: resolve,
          onerror: reject
        }).toDestination();
      });
      toneEngineReady = true;
      return true;
    } catch {
      toneEngineReady = false;
      toneSampler = null;
      return false;
    }
  })();
  toneEngineInitPromise = Promise.race([
    initPromise,
    new Promise((resolve) => {
      window.setTimeout(() => resolve(false), 5000);
    })
  ]).then((result) => {
    if (!result) {
      toneEngineReady = false;
      toneSampler = null;
    }
    return Boolean(result);
  }).finally(() => {
    toneEngineInitPromise = null;
  });
  return toneEngineInitPromise;
}

function shouldUseRnboPrimaryEngine() {
  return window.location.protocol !== "file:" && !isToneEngineAvailable();
}

function getRnboErrorSummary() {
  const text = (rnboEngineFailedReason || "").trim();
  if (!text) return "";
  return text.length > 72 ? `${text.slice(0, 72)}...` : text;
}

function getRnboPatchDirectory() {
  const slash = RNBO_PATCH_URL.lastIndexOf("/");
  if (slash < 0) return ".";
  return RNBO_PATCH_URL.slice(0, slash);
}

function toAbsoluteRnboAssetPath(pathValue) {
  if (typeof pathValue !== "string") return pathValue;
  if (/^(https?:)?\/\//.test(pathValue)) return pathValue;
  if (pathValue.startsWith("/")) return pathValue;
  return `${getRnboPatchDirectory()}/${pathValue}`;
}

async function initializeRnboEngine() {
  if (!shouldUseRnboPrimaryEngine()) return false;
  if (rnboEngineActive && rnboDevice) return true;
  if (rnboLoadPromise) return rnboLoadPromise;
  rnboLoadAttempted = true;
  rnboEngineFailedReason = "";
  updateAudioStatusText();
  rnboLoadPromise = (async () => {
    if (!ensureAudio()) throw new Error("Audio context unavailable");
    if (!window.RNBO || typeof window.RNBO.createDevice !== "function") {
      throw new Error("RNBO runtime unavailable");
    }
    if (audioCtx && audioCtx.state !== "running") {
      try {
        await audioCtx.resume();
      } catch {
        // RNBO may still schedule once context becomes running after next gesture.
      }
    }
    const patchResponse = await fetch(RNBO_PATCH_URL, { cache: "no-store" });
    if (!patchResponse.ok) {
      throw new Error(`RNBO patch missing (${patchResponse.status})`);
    }
    const patcher = await patchResponse.json();
    const device = await window.RNBO.createDevice({ context: audioCtx, patcher });
    device.node.connect(audioMaster);

    // If the patch declares external dependencies, load them from the patch folder.
    try {
      const depsResponse = await fetch(RNBO_DEPENDENCIES_URL, { cache: "no-store" });
      if (depsResponse.ok) {
        const deps = await depsResponse.json();
        if (Array.isArray(deps) && deps.length > 0 && typeof device.loadDataBufferDependencies === "function") {
          const normalizedDeps = deps.map((dep) => ({
            ...dep,
            file: toAbsoluteRnboAssetPath(dep?.file)
          }));
          await device.loadDataBufferDependencies(normalizedDeps);
        }
      }
    } catch {
      // Dependency manifest is optional.
    }

    rnboDevice = device;
    rnboEngineActive = true;
    rnboEngineFailedReason = "";
    updateAudioStatusText();
    return true;
  })().catch((err) => {
    rnboDevice = null;
    rnboEngineActive = false;
    rnboEngineFailedReason = err?.message || "Unknown RNBO initialization error";
    updateAudioStatusText();
    return false;
  }).finally(() => {
    rnboLoadPromise = null;
  });
  return rnboLoadPromise;
}

function scheduleRnboNote(midi, startTimeSeconds, holdSeconds, velocity) {
  if (!rnboEngineActive || !rnboDevice || !window.RNBO) return false;
  const safeHold = Math.max(0.06, holdSeconds);
  const noteOnTimeMs = startTimeSeconds * 1000;
  const noteOffTimeMs = (startTimeSeconds + safeHold) * 1000;
  const velocityByte = Math.max(1, Math.min(127, Math.round(velocity * 127)));
  rnboDevice.scheduleEvent(new window.RNBO.MIDIEvent(noteOnTimeMs, 0, [0x90, midi, velocityByte]));
  rnboDevice.scheduleEvent(new window.RNBO.MIDIEvent(noteOffTimeMs, 0, [0x80, midi, 0]));
  return true;
}

function playMidiNotesWithRnbo(midiNotes, options = {}) {
  if (!rnboEngineActive || !rnboDevice || !audioCtx) return false;
  const hold = options.hold || 1.2;
  const asChord = options.asChord !== false;
  const velocity = options.velocity || 0.82;
  const startBase = audioCtx.currentTime + getInteractiveStartLeadTimeSeconds();
  midiNotes.forEach((midi, idx) => {
    const start = asChord ? startBase : startBase + idx * 0.08;
    scheduleRnboNote(midi, start, hold, velocity);
  });
  return true;
}

function playMidiNotesWithToneEngine(midiNotes, options = {}) {
  if (!isToneEngineAvailable()) return null;
  const notes = Array.isArray(midiNotes) ? midiNotes.filter((midi) => Number.isFinite(midi)) : [];
  if (notes.length === 0) return true;
  const hold = options.hold || 1.2;
  const asChord = options.asChord !== false;
  const velocity = Math.max(0.05, Math.min(1, options.velocity || 0.82));

  const trigger = () => {
    const toneNotes = notes.map((midi) => midiToNoteName(midi));
    const start = window.Tone.now() + 0.002;
    if (asChord) {
      toneSampler.triggerAttackRelease(toneNotes, hold, start, velocity);
      return;
    }
    toneNotes.forEach((note, idx) => {
      toneSampler.triggerAttackRelease(note, hold, start + idx * 0.08, velocity);
    });
  };

  if (toneEngineReady && toneSampler) {
    try {
      trigger();
      return true;
    } catch {
      toneEngineReady = false;
      toneSampler = null;
    }
  }

  void ensureToneEngine().then((ready) => {
    if (!ready && el.chordDisplay) {
      el.chordDisplay.textContent = "Tone engine unavailable. Falling back.";
    }
    updateAudioStatusText(ready ? "" : "error");
  });
  return false;
}

function normalizeMidiSignature(midiNotes) {
  return Array.from(new Set((Array.isArray(midiNotes) ? midiNotes : [])
    .filter((midi) => Number.isFinite(midi))))
    .sort((a, b) => a - b)
    .join(",");
}

async function ensureChordAssetManifest() {
  if (chordAssetManifest) return chordAssetManifest;
  if (chordAssetManifestPromise) return chordAssetManifestPromise;
  chordAssetManifestPromise = fetch(CHORD_ASSET_MANIFEST_URL, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error(`Chord manifest ${res.status}`);
      return res.json();
    })
    .then((manifest) => {
      chordAssetManifest = manifest;
      chordAssetBySignature.clear();
      const entries = Array.isArray(manifest?.entries) ? manifest.entries : [];
      entries.forEach((entry) => {
        const sig = typeof entry?.midiSignature === "string"
          ? entry.midiSignature
          : normalizeMidiSignature(entry?.midi);
        if (!sig || typeof entry?.url !== "string") return;
        chordAssetBySignature.set(sig, entry);
      });
      return manifest;
    })
    .catch(() => null)
    .finally(() => {
      chordAssetManifestPromise = null;
    });
  return chordAssetManifestPromise;
}

function preloadRecordedChordBuffers() {
  if (!audioCtx) return Promise.resolve(null);
  if (chordAssetPreloadPromise) return chordAssetPreloadPromise;
  chordAssetPreloadPromise = ensureChordAssetManifest()
    .then((manifest) => {
      const entries = Array.isArray(manifest?.entries) ? manifest.entries : [];
      const uniqueUrls = Array.from(new Set(entries.map((entry) => entry?.url).filter(Boolean)));
      return Promise.all(uniqueUrls.map((url) => loadChordAssetBuffer(url)));
    })
    .catch(() => null);
  return chordAssetPreloadPromise;
}

async function loadChordAssetBuffer(url) {
  if (!audioCtx || !url) return null;
  if (chordAssetBufferCache.has(url)) return chordAssetBufferCache.get(url);
  if (chordAssetBufferLoads.has(url)) return chordAssetBufferLoads.get(url);
  const load = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Chord asset ${res.status}`);
      return res.arrayBuffer();
    })
    .then((arr) => audioCtx.decodeAudioData(arr))
    .then((decoded) => {
      chordAssetBufferCache.set(url, decoded);
      return decoded;
    })
    .catch(() => null)
    .finally(() => {
      chordAssetBufferLoads.delete(url);
    });
  chordAssetBufferLoads.set(url, load);
  return load;
}

function playChordAssetBuffer(buffer, holdSeconds, velocity, transposeSemitones = 0) {
  if (!audioCtx || !audioMaster || !buffer) return false;
  try {
    const startTime = audioCtx.currentTime + getInteractiveStartLeadTimeSeconds();
    const source = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    const hold = Math.max(0.18, holdSeconds || 1.2);
    const maxPlayable = Math.max(0.2, buffer.duration - 0.03);
    const playLength = Math.min(maxPlayable, hold + 0.25);
    const endTime = startTime + playLength;
    const peak = Math.max(0.16, Math.min(0.95, velocity * 0.88));
    source.buffer = buffer;
    source.playbackRate.value = 2 ** ((Number(transposeSemitones) || 0) / 12);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peak, startTime + 0.004);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.08, peak * 0.5), startTime + 0.18);
    gain.gain.setValueAtTime(Math.max(0.08, peak * 0.5), Math.max(startTime + 0.22, endTime - 0.12));
    gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
    source.connect(gain);
    gain.connect(audioMaster);
    source.start(startTime, 0);
    source.stop(endTime + 0.02);
    return true;
  } catch {
    return false;
  }
}

function getChordAssetHtmlPool(url) {
  let pool = chordAssetHtmlPools.get(url);
  if (pool) return pool;
  const voices = [];
  for (let i = 0; i < 4; i += 1) {
    const audio = new Audio(url);
    audio.preload = "auto";
    audio.load();
    voices.push({ audio, stopTimerId: null });
  }
  pool = { voices, cursor: 0 };
  chordAssetHtmlPools.set(url, pool);
  return pool;
}

function playChordAssetHtml(url, holdSeconds, velocity, transposeSemitones = 0) {
  const pool = getChordAssetHtmlPool(url);
  const voice = pool.voices[pool.cursor];
  pool.cursor = (pool.cursor + 1) % pool.voices.length;
  if (!voice?.audio) return false;
  if (voice.stopTimerId) {
    window.clearTimeout(voice.stopTimerId);
    voice.stopTimerId = null;
  }
  try {
    voice.audio.pause();
    voice.audio.currentTime = 0;
  } catch {
    // Ignore media seek errors.
  }
  voice.audio.playbackRate = Math.max(0.5, Math.min(2, 2 ** ((Number(transposeSemitones) || 0) / 12)));
  if ("preservesPitch" in voice.audio) voice.audio.preservesPitch = false;
  if ("webkitPreservesPitch" in voice.audio) voice.audio.webkitPreservesPitch = false;
  if ("mozPreservesPitch" in voice.audio) voice.audio.mozPreservesPitch = false;
  voice.audio.volume = Math.max(0.08, Math.min(1, velocity * 0.95));
  void voice.audio.play().catch(() => {
    // If autoplay is blocked, normal live-note fallback path still exists.
  });
  const stopAfterMs = Math.max(220, Math.round((holdSeconds || 1.2) * 1000 + 220));
  voice.stopTimerId = window.setTimeout(() => {
    try {
      voice.audio.pause();
      voice.audio.currentTime = 0;
    } catch {
      // Ignore media teardown errors.
    }
    voice.stopTimerId = null;
  }, stopAfterMs);
  return true;
}

function queueChordAssetPlayback(midiNotes, holdSeconds, velocity) {
  const signature = normalizeMidiSignature(midiNotes);
  if (!signature) return false;
  if (!chordAssetManifest) {
    void ensureChordAssetManifest();
    return false;
  }
  const entry = chordAssetBySignature.get(signature);
  if (!entry?.url) return false;
  const transposeSemitones = Number(entry?.transposeSemitones) || 0;
  const cachedBuffer = chordAssetBufferCache.get(entry.url);
  if (cachedBuffer) {
    return playChordAssetBuffer(cachedBuffer, holdSeconds, velocity, transposeSemitones);
  }
  void loadChordAssetBuffer(entry.url);
  return false;
}

function scheduleChordPlaybackWhenReady(midiNotes, holdSeconds, velocity, restrictToWindow, highlightMs) {
  const signature = normalizeMidiSignature(midiNotes);
  if (!signature) return;
  if (chordPlaybackPendingBySignature.has(signature)) return;
  chordPlaybackPendingBySignature.set(signature, true);

  const playWhenReady = () => {
    const entry = chordAssetBySignature.get(signature);
    if (!entry?.url) {
      chordPlaybackPendingBySignature.delete(signature);
      if (el.chordDisplay) {
        el.chordDisplay.textContent = "Recorded chord sample missing for this voicing.";
      }
      return;
    }
    const transposeSemitones = Number(entry?.transposeSemitones) || 0;
    loadChordAssetBuffer(entry.url)
      .then((buffer) => {
        chordPlaybackPendingBySignature.delete(signature);
        if (!buffer) {
          if (playChordAssetHtml(entry.url, holdSeconds, velocity, transposeSemitones)) {
            highlightKeyboard(midiNotes, highlightMs, restrictToWindow);
            return;
          }
          if (el.chordDisplay) {
            el.chordDisplay.textContent = "Recorded chord sample failed to load.";
          }
          return;
        }
        if (audioCtx && audioCtx.state === "suspended") {
          void audioCtx.resume();
        }
        if (!playChordAssetBuffer(buffer, holdSeconds, velocity, transposeSemitones)) {
          if (!playChordAssetHtml(entry.url, holdSeconds, velocity, transposeSemitones) && el.chordDisplay) {
            el.chordDisplay.textContent = "Recorded chord sample failed to play.";
          }
        }
        highlightKeyboard(midiNotes, highlightMs, restrictToWindow);
      })
      .catch(() => {
        chordPlaybackPendingBySignature.delete(signature);
        if (el.chordDisplay) {
          el.chordDisplay.textContent = "Recorded chord sample failed to load.";
        }
      });
  };

  if (!chordAssetManifest) {
    void ensureChordAssetManifest().then(playWhenReady);
    return;
  }
  playWhenReady();
}

function enqueuePendingPlayRequest(midiNotes, options) {
  if (pendingPlayRequests.length >= MAX_PENDING_PLAY_REQUESTS) {
    pendingPlayRequests.shift();
  }
  pendingPlayRequests.push({
    midiNotes: Array.isArray(midiNotes) ? [...midiNotes] : [],
    options: { ...(options || {}) }
  });
}

function flushPendingPlayRequests() {
  if (!sampleEngineReady) return;
  while (pendingPlayRequests.length > 0) {
    const request = pendingPlayRequests.shift();
    if (!request) continue;
    playMidiNotes(request.midiNotes, request.options);
  }
}

function ensureAudio(options = {}) {
  const shouldResume = options.resume !== false;
  const forceRecreate = options.forceRecreate === true;
  if (htmlSampleEngineActive) {
    sampleEngineReady = true;
    return true;
  }
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) {
    if (el.chordDisplay) {
      el.chordDisplay.textContent = "Audio unsupported in this browser.";
    }
    return false;
  }
  const needsNewContext = forceRecreate || !audioCtx || audioCtx.state === "closed";
  if (needsNewContext) {
    sampleEngineGeneration += 1;
    sampleBuffers.clear();
    sampleOnsetOffsets.clear();
    sampleBufferLoads.clear();
    failedSampleNotes.clear();
    samplePreloadStarted = false;
    samplePreloadPromise = null;
    sampleEngineReady = false;
    pendingPlayRequests.length = 0;
    rnboDevice = null;
    rnboEngineActive = false;
    rnboLoadPromise = null;
    rnboLoadAttempted = false;
    rnboEngineFailedReason = "";
    chordAssetBufferCache.clear();
    chordAssetBufferLoads.clear();
    chordAssetHtmlPools.clear();
    chordPlaybackPendingBySignature.clear();
    chordAssetPreloadPromise = null;
    try {
      audioCtx = new AudioContextCtor({ latencyHint: "interactive" });
    } catch {
      audioCtx = new AudioContextCtor();
    }
    audioMaster = audioCtx.createGain();
    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -22;
    compressor.knee.value = 16;
    compressor.ratio.value = 2.6;
    compressor.attack.value = 0.005;
    compressor.release.value = 0.25;
    audioMaster.gain.value = 0.72;
    audioMaster.connect(compressor);
    compressor.connect(audioCtx.destination);
    updateAudioStatusText();
  }
  if (shouldResume && (audioCtx.state === "suspended" || audioCtx.state === "interrupted")) {
    void audioCtx.resume();
  }
  if (!samplePreloadStarted) {
    samplePreloadStarted = true;
    void ensureChordAssetManifest();
    void preloadRecordedChordBuffers();
    updateAudioStatusText();
    samplePreloadPromise = preloadCoreSamples(sampleEngineGeneration)
      .finally(() => {
        updateSampleEngineReadiness();
        if (sampleEngineReady) {
          flushPendingPlayRequests();
        } else if (!isSampleEngineLoading()) {
          pendingPlayRequests.length = 0;
        }
        updateAudioStatusText();
      });
  }
  updateSampleEngineReadiness();
  return true;
}

function playMidiNotes(midiNotes, options = {}) {
  if (!ensureAudio()) return;
  const hold = options.hold || 1.2;
  const asChord = options.asChord !== false;
  const velocity = options.velocity || 0.82;
  const restrictToWindow = options.restrictToWindow === true;
  const skipStrictChordMode = options.__skipStrictChordMode === true;
  const isMultiNoteChord = asChord && Array.isArray(midiNotes) && midiNotes.length > 1;

  const toneHandled = playMidiNotesWithToneEngine(midiNotes, options);
  if (toneHandled === true) {
    highlightKeyboard(midiNotes, getHighlightMs(hold, options.highlightMs), restrictToWindow);
    return;
  }

  if (isMultiNoteChord && STRICT_SINGLE_FILE_CHORD_MODE && !skipStrictChordMode) {
    if (audioCtx && audioCtx.state !== "running") {
      void audioCtx.resume().then(() => {
        playMidiNotes(midiNotes, options);
      }).catch(() => {
        if (el.chordDisplay) {
          el.chordDisplay.textContent = "Audio is blocked. Click again to enable sound.";
        }
      });
      return;
    }
    const highlightMs = getHighlightMs(hold, options.highlightMs);
    if (queueChordAssetPlayback(midiNotes, hold, velocity)) {
      highlightKeyboard(midiNotes, highlightMs, restrictToWindow);
      return;
    }
    const signature = normalizeMidiSignature(midiNotes);
    if (signature) {
      if (!chordAssetManifest) {
        void ensureChordAssetManifest().then(() => {
          const entry = chordAssetBySignature.get(signature);
          if (entry?.url) void loadChordAssetBuffer(entry.url);
        });
      } else {
        const entry = chordAssetBySignature.get(signature);
        if (entry?.url) void loadChordAssetBuffer(entry.url);
      }
    }
    if (el.chordDisplay) {
      el.chordDisplay.textContent = "Using live chord engine while recorded sample loads...";
    }
    playMidiNotes(midiNotes, { ...options, __skipStrictChordMode: true });
    return;
  }

  if (shouldUseRnboPrimaryEngine() && !htmlSampleEngineActive) {
    if (rnboEngineActive && playMidiNotesWithRnbo(midiNotes, options)) {
      highlightKeyboard(midiNotes, getHighlightMs(hold, options.highlightMs), restrictToWindow);
      return;
    }
    if (!rnboEngineFailedReason) {
      enqueuePendingPlayRequest(midiNotes, options);
      if (!rnboLoadPromise) {
        void initializeRnboEngine().then((loaded) => {
          if (loaded) {
            flushPendingPlayRequests();
          }
        });
      }
      updateAudioStatusText();
      return;
    }
  }

  if (isMultiNoteChord && queueChordAssetPlayback(midiNotes, hold, velocity)) {
    highlightKeyboard(midiNotes, getHighlightMs(hold, options.highlightMs), restrictToWindow);
    return;
  }

  if (htmlSampleEngineActive) {
    if (asChord) {
      playHtmlSampleChord(midiNotes, hold, velocity);
    } else {
      midiNotes.forEach((midi, idx) => {
        const delayMs = idx * 80;
        window.setTimeout(() => {
          playHtmlSampleForMidi(midi, hold, velocity);
        }, delayMs);
      });
    }
    highlightKeyboard(midiNotes, getHighlightMs(hold, options.highlightMs), restrictToWindow);
    return;
  }

  if (!sampleEngineReady) {
    if (isSampleEngineLoading()) {
      enqueuePendingPlayRequest(midiNotes, options);
      updateAudioStatusText();
      return;
    }
    if (el.chordDisplay) {
      el.chordDisplay.textContent = "Audio samples failed to initialize. Reload to retry.";
    }
    updateAudioStatusText("error");
    return;
  }

  const scheduleNotes = () => {
    const now = audioCtx.currentTime + getInteractiveStartLeadTimeSeconds();
    midiNotes.forEach((midi, idx) => {
      const start = asChord ? now : now + idx * 0.08;
      playPianoVoice(midi, start, hold, velocity);
    });
  };

  const scheduleSyncedChordNotes = () => {
    if (!asChord) {
      scheduleNotes();
      return;
    }
    const generationAtSchedule = sampleEngineGeneration;
    const missingTargets = collectMissingSampleTargets(midiNotes);
    if (missingTargets.length === 0) {
      const syncStart = audioCtx.currentTime + Math.max(0.01, getInteractiveStartLeadTimeSeconds());
      if (!playSampleChordCluster(midiNotes, hold, velocity, syncStart)) {
        scheduleNotes();
      }
      return;
    }
    Promise.all(missingTargets.map(({ note, midi }) => loadSampleBuffer(note, midi, generationAtSchedule)))
      .then((results) => {
        if (generationAtSchedule !== sampleEngineGeneration) return;
        if (htmlSampleEngineActive) {
          playHtmlSampleChord(midiNotes, hold, velocity);
          return;
        }
        if (!audioCtx || audioCtx.state !== "running") return;
        if (results.some((result) => !result)) {
          if (activateHtmlSampleEngine()) {
            playHtmlSampleChord(midiNotes, hold, velocity);
          } else if (el.chordDisplay) {
            el.chordDisplay.textContent = "Audio samples failed to load. Reload to retry.";
          }
          return;
        }
        const syncStart = audioCtx.currentTime + Math.max(0.01, getInteractiveStartLeadTimeSeconds());
        if (!playSampleChordCluster(midiNotes, hold, velocity, syncStart)) {
          midiNotes.forEach((midi) => {
            playPianoVoice(midi, syncStart, hold, velocity);
          });
        }
      });
  };

  if (audioCtx.state === "running") {
    scheduleSyncedChordNotes();
  } else {
    audioCtx.resume().then(scheduleSyncedChordNotes).catch(() => {
      if (el.chordDisplay) {
        el.chordDisplay.textContent = "Audio is blocked. Click again to enable sound.";
      }
    });
  }

  highlightKeyboard(midiNotes, getHighlightMs(hold, options.highlightMs), restrictToWindow);
}

function collectMissingSampleTargets(midiNotes) {
  const uniqueMissing = new Map();
  midiNotes.forEach((midi) => {
    const sample = getNearestSample(midi);
    if (sampleBuffers.has(sample.note)) return;
    uniqueMissing.set(sample.note, sample.midi);
  });
  return Array.from(uniqueMissing, ([note, midi]) => ({ note, midi }));
}

function bindAudioUnlock() {
  if (audioUnlockBound) return;
  const unlock = () => {
    if (isToneEngineAvailable()) {
      void ensureToneEngine().then((ready) => {
        if (ready) flushTonePendingRequests();
      });
    }
    if (htmlSampleEngineActive) return;
    if (!ensureAudio()) return;
    if (audioCtx && (audioCtx.state === "suspended" || audioCtx.state === "interrupted")) {
      void audioCtx.resume();
    }
    if (shouldUseRnboPrimaryEngine() && !rnboEngineActive && !rnboLoadPromise && !rnboEngineFailedReason) {
      void initializeRnboEngine().then((loaded) => {
        if (loaded) flushPendingPlayRequests();
      });
    }
  };

  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("touchstart", unlock, { passive: true });
  window.addEventListener("keydown", unlock);
  audioUnlockBound = true;
}

function getInteractiveStartLeadTimeSeconds() {
  if (!audioCtx) return 0.001;
  const baseLatency = Number(audioCtx.baseLatency);
  if (!Number.isFinite(baseLatency) || baseLatency <= 0) return 0.0015;
  return Math.max(0.0008, Math.min(0.003, baseLatency * 0.2));
}

function playPianoVoice(midi, startTime, holdSeconds, velocity) {
  try {
    playSampleVoice(midi, startTime, holdSeconds, velocity);
  } catch {
    if (audioCtx?.state === "closed" && ensureAudio({ forceRecreate: true })) {
      const safeStart = audioCtx.currentTime + getInteractiveStartLeadTimeSeconds();
      try {
        playSampleVoice(midi, safeStart, holdSeconds, velocity);
        return;
      } catch {
        // Fall through to user-facing message below.
      }
    }
    if (el.chordDisplay) {
      el.chordDisplay.textContent = "Piano sample engine unavailable. Verify /assets/salamander files and retry.";
    }
    updateAudioStatusText("error");
  }
}

function highlightKeyboard(midiNotes, durationMs, restrictToWindow = false) {
  const sourceNotes = restrictToWindow ? limitMidiToHighlightWindow(midiNotes) : midiNotes;
  const activeMidi = new Set(sourceNotes);
  clearKeyboardHighlights();

  activeMidi.forEach((midi) => {
    const keyEl = keyElsByMidi.get(midi);
    if (!keyEl) return;
    keyEl.classList.add("active");
    keyHighlightTimers.set(midi, setTimeout(() => {
      keyEl.classList.remove("active");
      keyHighlightTimers.delete(midi);
    }, durationMs));
  });
}

function highlightKeyboardHold(midiNotes, restrictToWindow = false) {
  const sourceNotes = restrictToWindow ? limitMidiToHighlightWindow(midiNotes) : midiNotes;
  const activeMidi = new Set(sourceNotes);
  clearKeyboardHighlights();
  activeMidi.forEach((midi) => {
    const keyEl = keyElsByMidi.get(midi);
    if (keyEl) keyEl.classList.add("active");
  });
}

function clearKeyboardHighlights() {
  keyHighlightTimers.forEach((timerId) => clearTimeout(timerId));
  keyHighlightTimers.clear();
  keyElsByMidi.forEach((keyEl) => keyEl.classList.remove("active"));
  clearChordDiffPreview();
  reapplyTypingHeldHighlights();
}

function normalizeMidiCollection(midiNotes) {
  return Array.from(new Set((Array.isArray(midiNotes) ? midiNotes : [])
    .filter((midi) => Number.isFinite(midi))))
    .sort((a, b) => a - b);
}

function midiCollectionsEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function clearChordDiffPreview() {
  keyElsByMidi.forEach((keyEl) => {
    keyEl.classList.remove("diff-transition", "diff-removed", "diff-added");
    keyEl.style.removeProperty("--diff-fade-ms");
  });
}

function limitMidiToHighlightWindow(midiNotes) {
  const start = Number(el.highlightWindowStart?.value);
  if (!Number.isFinite(start)) return midiNotes;
  const end = start + HIGHLIGHT_WINDOW_SPAN_SEMITONES;
  const mapped = midiNotes.map((midi) => mapMidiToWindow(midi, start, end)).filter((midi) => midi !== null);
  return Array.from(new Set(mapped));
}

function mapMidiToWindow(midi, start, end) {
  const pitchClass = midi % 12;
  let best = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let candidate = start; candidate <= end; candidate += 1) {
    if ((candidate % 12 + 12) % 12 !== pitchClass) continue;
    const distance = Math.abs(candidate - midi);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }
  return best;
}

function updateHighlightWindowLabel() {
  if (!el.highlightWindowStart || !el.highlightWindowLabel) return;
  const start = Number(el.highlightWindowStart.value);
  const end = start + HIGHLIGHT_WINDOW_SPAN_SEMITONES;
  el.highlightWindowLabel.textContent = `${midiToNoteName(start)} to ${midiToNoteName(end)} (8 white keys)`;
  updateHighlightWindowLine();
}

function updateHighlightWindowLine() {
  if (!el.highlightWindowStart || !el.highlightWindowGlow) return;
  const min = Number(el.highlightWindowStart.min || KEYBOARD_FIRST_MIDI);
  const max = Number(el.highlightWindowStart.max || (KEYBOARD_LAST_MIDI - HIGHLIGHT_WINDOW_SPAN_SEMITONES));
  const start = Number(el.highlightWindowStart.value);
  const totalVisibleKeys = KEYBOARD_LAST_MIDI - KEYBOARD_FIRST_MIDI + 1;
  const windowKeys = HIGHLIGHT_WINDOW_SPAN_SEMITONES + 1;
  if (totalVisibleKeys <= 0 || windowKeys <= 0) return;
  const normalizedStart = Math.min(Math.max(start, min), max);
  const leftPct = ((normalizedStart - KEYBOARD_FIRST_MIDI) / totalVisibleKeys) * 100;
  const widthPct = (windowKeys / totalVisibleKeys) * 100;
  el.highlightWindowGlow.style.left = `${leftPct}%`;
  el.highlightWindowGlow.style.width = `${Math.max(0, widthPct)}%`;
}

function setHighlightWindowFromClientX(clientX) {
  if (!el.highlightWindowTrack || !el.highlightWindowStart) return;
  const rect = el.highlightWindowTrack.getBoundingClientRect();
  if (rect.width <= 0) return;
  const min = Number(el.highlightWindowStart.min || KEYBOARD_FIRST_MIDI);
  const max = Number(el.highlightWindowStart.max || (KEYBOARD_LAST_MIDI - HIGHLIGHT_WINDOW_SPAN_SEMITONES));
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  const midiRange = max - min;
  const next = Math.round(min + ratio * midiRange);
  el.highlightWindowStart.value = String(Math.min(max, Math.max(min, next)));
  clearKeyboardHighlights();
  updateHighlightWindowLabel();
  updateHighlightWindowLine();
}

function onHighlightWindowPointerMove(event) {
  if (!highlightWindowDragging) return;
  setHighlightWindowFromClientX(event.clientX);
}

function endHighlightWindowDrag() {
  highlightWindowDragging = false;
  window.removeEventListener("pointermove", onHighlightWindowPointerMove);
  window.removeEventListener("pointerup", endHighlightWindowDrag);
  window.removeEventListener("pointercancel", endHighlightWindowDrag);
}

function getHighlightMs(holdSeconds, explicitMs) {
  const fallback = holdSeconds * 150 + 80;
  const desired = Number.isFinite(explicitMs) ? explicitMs : fallback;
  return Math.round(Math.max(90, Math.min(240, desired)));
}

function midiToNoteName(midi) {
  const note = NOTES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
}

function randomOf(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function renderLessonTracks() {
  if (!el.lessonCards) return;
  LESSON_TRACKS.forEach((track) => {
    const card = document.createElement("div");
    card.className = "lesson-card";
    card.innerHTML = `<h3>${track.title}</h3><ul>${track.steps.map((step) => `<li>${step}</li>`).join("")}</ul>`;
    el.lessonCards.appendChild(card);
  });
}



async function askCoach() {
  const question = el.coachInput.value.trim();
  if (!question) {
    el.coachOutput.textContent = "Add a question first.";
    return;
  }

  el.coachOutput.textContent = "Coach is thinking...";
  let timeoutId;

  try {
    const cadenceName = getSelectedCadenceName();
    const cadenceProfile = getCadenceProfile(cadenceName);
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 9000);
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        question,
        context: {
          progress,
          key: el.keySelect.value,
          progression: el.progressionSelect.value,
          cadence: cadenceName,
          cadenceEmotion: cadenceProfile.emotion,
          chord: `${appState.root}${CHORDS[appState.quality].short}`,
          arpeggio: `${el.arpRootSelect.value} ${el.arpTypeSelect.value}`,
          scale: `${el.scaleRootSelect.value} ${el.scaleTypeSelect.value}`,
          tempo: Number(el.tempoInput.value) || 90
        }
      })
    });
    clearTimeout(timeoutId);

    const raw = await res.text();
    let data = {};
    try {
      data = JSON.parse(raw);
    } catch {
      el.coachOutput.textContent = buildClientCoachFallback(question);
      return;
    }

    if (!res.ok) {
      el.coachOutput.textContent = buildClientCoachFallback(question);
      return;
    }

    const answer = data.answer || "Coach did not return an answer.";
    el.coachOutput.textContent = answer;
  } catch (err) {
    el.coachOutput.textContent = buildClientCoachFallback(question);
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildClientCoachFallback(question) {
  const cadenceName = getSelectedCadenceName();
  const cadenceProfile = getCadenceProfile(cadenceName);
  return [
    "Coach fallback mode:",
    `Question: ${question}.`,
    `Key ${el.keySelect?.value || appState.root}, progression ${el.progressionSelect?.value || "I-vi-IV-V (Pop)"}, cadence ${cadenceName}.`,
    `Emotional rationale: ${cadenceProfile.emotion}`,
    "12-minute plan: 4 min progression shells (LH roots, RH 3rd/7th), 4 min smooth top-note voice-leading, 4 min motif improv over same changes."
  ].join(" ");
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function dayDiffISO(dateA, dateB) {
  const a = new Date(`${dateA}T00:00:00`);
  const b = new Date(`${dateB}T00:00:00`);
  const ms = Math.abs(b - a);
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function trackRep(area, topic) {
  if (area === "chords") progress.chordReps += 1;
  if (area === "progressions") progress.progressionReps += 1;
  if (area === "arpeggios") progress.arpeggioReps += 1;
  if (area === "scales") progress.scaleReps += 1;

  progress.areas[area] += 1;
  progress.recent.unshift({ area, topic, date: todayKey() });
  progress.recent = progress.recent.slice(0, 12);

  saveProgress();
  renderProgress();
}

function markSessionComplete() {
  const today = todayKey();
  if (progress.lastSessionDate === today) return;

  if (!progress.lastSessionDate) {
    progress.streakDays = 1;
  } else {
    const diff = dayDiffISO(progress.lastSessionDate, today);
    progress.streakDays = diff === 1 ? progress.streakDays + 1 : 1;
  }

  progress.lastSessionDate = today;
  progress.sessionsCompleted += 1;
  saveProgress();
}

function renderProgress() {
  el.statSessions.textContent = String(progress.sessionsCompleted);
  el.statStreak.textContent = String(progress.streakDays);
  el.statChords.textContent = String(progress.chordReps);
  el.statScales.textContent = String(progress.scaleReps);
  el.statArps.textContent = String(progress.arpeggioReps);
  el.statProgressions.textContent = String(progress.progressionReps);
  renderPersonalizedSequence();
  renderTheoryProgressSummary();
}

function renderPersonalizedSequence() {
  const areas = [
    { name: "chords", value: progress.areas.chords },
    { name: "progressions", value: progress.areas.progressions },
    { name: "scales", value: progress.areas.scales },
    { name: "arpeggios", value: progress.areas.arpeggios }
  ];

  areas.sort((a, b) => a.value - b.value);
  const weakest = areas[0].name;
  const second = areas[1].name;

  const plan = {
    chords: `Play ${appState.root}${CHORDS[appState.quality].short} in all inversions, slow and connected.`,
    progressions: `Loop ${el.progressionSelect?.value || "I-vi-IV-V (Pop)"} in ${el.keySelect?.value || appState.root}, say chord function out loud.`,
    scales: `Run ${el.scaleRootSelect?.value || appState.root} ${el.scaleTypeSelect?.value || "major (classical)"} @ ${el.tempoInput?.value || 90} BPM with relaxed hand shape.`,
    arpeggios: `Practice ${el.arpRootSelect?.value || appState.root} ${el.arpTypeSelect?.value || "major triad"} with ${el.handSelect?.value || "right"} hand first, then both hands.`
  };

  el.nextSequence.textContent = [
    "Personalized 12-minute sequence:",
    `1) 4 min priority: ${weakest.toUpperCase()} -> ${plan[weakest]}`,
    `2) 4 min secondary: ${second.toUpperCase()} -> ${plan[second]}`,
    "3) 4 min confidence close: play your strongest area and record one clean run."
  ].join(" ");
}

function loadProgress() {
  try {
    const raw = safeStorageGet(PROGRESS_STORAGE_KEY);
    if (!raw) {
      return {
        ...defaultProgress,
        areas: { ...defaultProgress.areas },
        theoryCompletedLessons: { ...defaultProgress.theoryCompletedLessons },
        theoryAudioByLesson: { ...defaultProgress.theoryAudioByLesson },
        theoryCustomLessons: { ...defaultProgress.theoryCustomLessons },
        theoryLessonRuns: { ...defaultProgress.theoryLessonRuns },
        recent: []
      };
    }

    const parsed = JSON.parse(raw);
    return {
      ...defaultProgress,
      ...parsed,
      areas: { ...defaultProgress.areas, ...(parsed.areas || {}) },
      theoryCompletedLessons: { ...defaultProgress.theoryCompletedLessons, ...(parsed.theoryCompletedLessons || {}) },
      theoryAudioByLesson: { ...defaultProgress.theoryAudioByLesson, ...(parsed.theoryAudioByLesson || {}) },
      theoryCustomLessons: { ...defaultProgress.theoryCustomLessons, ...(parsed.theoryCustomLessons || {}) },
      theoryLessonRuns: { ...defaultProgress.theoryLessonRuns, ...(parsed.theoryLessonRuns || {}) },
      recent: Array.isArray(parsed.recent) ? parsed.recent : []
    };
  } catch {
    return {
      ...defaultProgress,
      areas: { ...defaultProgress.areas },
      theoryCompletedLessons: { ...defaultProgress.theoryCompletedLessons },
      theoryAudioByLesson: { ...defaultProgress.theoryAudioByLesson },
      theoryCustomLessons: { ...defaultProgress.theoryCustomLessons },
      theoryLessonRuns: { ...defaultProgress.theoryLessonRuns },
      recent: []
    };
  }
}

function saveProgress() {
  safeStorageSet(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

function resetProgressState() {
  safeStorageRemove(PROGRESS_STORAGE_KEY);
  LEGACY_PROGRESS_KEYS.forEach((key) => safeStorageRemove(key));
  progress = {
    ...defaultProgress,
    areas: { ...defaultProgress.areas },
    theoryCompletedLessons: { ...defaultProgress.theoryCompletedLessons },
    theoryAudioByLesson: { ...defaultProgress.theoryAudioByLesson },
    theoryCustomLessons: { ...defaultProgress.theoryCustomLessons },
    theoryLessonRuns: { ...defaultProgress.theoryLessonRuns },
    recent: []
  };
  saveProgress();
  forceRenderStatsZero();
}

function hardResetProgress(event) {
  if (event) event.preventDefault();
  if (resetInFlight) return;
  resetInFlight = true;

  try {
    localStorage.clear();
  } catch {
    // Ignore storage clear errors.
  }

  try {
    sessionStorage.clear();
  } catch {
    // Ignore storage clear errors.
  }

  resetProgressState();
  forceRenderStatsZero();
  renderProgress();
  if (el.chordDisplay) el.chordDisplay.textContent = "";
  if (el.progressionOutput) el.progressionOutput.textContent = "";
  if (el.scaleOutput) el.scaleOutput.textContent = "";
  if (el.arpOutput) el.arpOutput.textContent = "";
  if (el.coachOutput) el.coachOutput.textContent = "Coach is ready.";
  if (el.nextSequence) {
    el.nextSequence.textContent = "Progress reset.";
  }

  setTimeout(() => {
    resetInFlight = false;
  }, 60);
}

function forceRenderStatsZero() {
  el.statSessions.textContent = "0";
  el.statStreak.textContent = "0";
  el.statChords.textContent = "0";
  el.statScales.textContent = "0";
  el.statArps.textContent = "0";
  el.statProgressions.textContent = "0";
}

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors; app still works in-memory.
  }
}

function safeStorageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors; app still works in-memory.
  }
}

function preloadCoreSamples(generation = sampleEngineGeneration) {
  const requiredSamples = new Map();
  for (let midi = KEYBOARD_FIRST_MIDI; midi <= KEYBOARD_LAST_MIDI; midi += 1) {
    const sample = getNearestSample(midi);
    requiredSamples.set(sample.note, sample.midi);
  }
  requiredSampleCount = requiredSamples.size;
  return Promise.all(Array.from(requiredSamples, ([sampleNote, sampleMidi]) => (
    loadSampleBuffer(sampleNote, sampleMidi, generation)
  )));
}

function updateAudioStatusText(priority = "") {
  if (!el.audioStatus) return;
  const total = requiredSampleCount > 0 ? requiredSampleCount : SALAMANDER_SAMPLE_NOTES.length;
  const loaded = sampleBuffers.size;
  const failed = failedSampleNotes.size;
  const loading = samplePreloadStarted && (loaded + failed) < total;

  let text = "";
  if (isToneEngineAvailable() && toneEngineReady) {
    text = "Audio: Tone sampler active (low-latency mode).";
  } else if (isToneEngineAvailable() && toneEngineInitPromise) {
    text = "Audio: initializing Tone sampler...";
  } else if (rnboEngineActive) {
    text = "Audio: RNBO engine active (piano patch).";
  } else if (shouldUseRnboPrimaryEngine() && rnboEngineFailedReason) {
    const summary = getRnboErrorSummary();
    text = summary
      ? `Audio: RNBO unavailable (${summary}). Using local piano samples.`
      : "Audio: RNBO unavailable. Using local piano samples.";
  } else if (shouldUseRnboPrimaryEngine() && rnboLoadPromise) {
    text = "Audio: loading RNBO piano engine...";
  } else if (priority === "error" || (!htmlSampleEngineActive && failed >= total && total > 0)) {
    text = `Audio: sample engine failed (${failed}/${total}). Check sample files and reload.`;
  } else if (htmlSampleEngineActive) {
    text = "Audio: real piano samples active (compatibility mode).";
  } else if (loaded > 0) {
    text = `Audio: real piano samples ready (${loaded}/${total}).`;
  } else if (loading) {
    text = `Audio: loading piano samples (${loaded}/${total})...`;
  } else {
    text = "Audio: waiting for first interaction to initialize piano samples.";
  }

  if (audioStatusLastRendered === text) return;
  audioStatusLastRendered = text;
  el.audioStatus.textContent = text;
  el.audioStatus.classList.toggle(
    "audio-status-error",
    priority === "error"
      || (!htmlSampleEngineActive && failed >= total && total > 0)
      || (shouldUseRnboPrimaryEngine() && Boolean(rnboEngineFailedReason) && !rnboEngineActive)
  );
}

function sampleUrlForNote(sampleNote) {
  return `${LOCAL_SAMPLE_BASE}/${sampleNote}.mp3`;
}

function getHtmlSamplePool(sampleNote) {
  let pool = htmlSamplePools.get(sampleNote);
  if (pool) return pool;
  const voices = [];
  for (let i = 0; i < HTML_SAMPLE_POOL_SIZE; i += 1) {
    const audio = new Audio(sampleUrlForNote(sampleNote));
    audio.preload = "auto";
    audio.load();
    voices.push({ audio, stopTimerId: null });
  }
  pool = { voices, cursor: 0 };
  htmlSamplePools.set(sampleNote, pool);
  return pool;
}

function activateHtmlSampleEngine() {
  if (!htmlEngineFallbackAllowed) {
    updateAudioStatusText("error");
    return false;
  }
  if (!htmlSampleEngineActive) htmlSampleEngineActive = true;
  updateSampleEngineReadiness();
  updateAudioStatusText();
  return true;
}

function acquireHtmlSampleVoice(sampleNote) {
  const pool = getHtmlSamplePool(sampleNote);
  const voice = pool.voices[pool.cursor];
  pool.cursor = (pool.cursor + 1) % pool.voices.length;
  return voice;
}

function prepareHtmlSampleVoice(voice, midi, sampleMidi, velocity) {
  if (!voice) return false;
  if (voice.stopTimerId) {
    window.clearTimeout(voice.stopTimerId);
    voice.stopTimerId = null;
  }
  try {
    voice.audio.pause();
    voice.audio.currentTime = 0;
  } catch {
    // Ignore seek/pause errors on media elements.
  }
  voice.audio.playbackRate = Math.max(0.5, Math.min(2, 2 ** ((midi - sampleMidi) / 12)));
  if ("preservesPitch" in voice.audio) voice.audio.preservesPitch = false;
  if ("webkitPreservesPitch" in voice.audio) voice.audio.webkitPreservesPitch = false;
  if ("mozPreservesPitch" in voice.audio) voice.audio.mozPreservesPitch = false;
  voice.audio.volume = Math.max(0.08, Math.min(1, velocity));
  return true;
}

function scheduleHtmlSampleStop(voice, holdSeconds) {
  if (!voice) return;
  const stopAfterMs = Math.max(180, Math.round(holdSeconds * 1000 + 170));
  voice.stopTimerId = window.setTimeout(() => {
    try {
      voice.audio.pause();
      voice.audio.currentTime = 0;
    } catch {
      // Ignore teardown errors.
    }
    voice.stopTimerId = null;
  }, stopAfterMs);
}

function playHtmlSampleForMidi(midi, holdSeconds, velocity) {
  const sample = getNearestSample(midi);
  const voice = acquireHtmlSampleVoice(sample.note);
  if (!prepareHtmlSampleVoice(voice, midi, sample.midi, velocity)) return;
  void voice.audio.play().catch(() => {
    updateAudioStatusText("error");
  });
  scheduleHtmlSampleStop(voice, holdSeconds);
}

function playHtmlSampleChord(midiNotes, holdSeconds, velocity) {
  const preparedVoices = [];
  midiNotes.forEach((midi) => {
    const sample = getNearestSample(midi);
    const voice = acquireHtmlSampleVoice(sample.note);
    if (!prepareHtmlSampleVoice(voice, midi, sample.midi, velocity)) return;
    preparedVoices.push(voice);
  });
  preparedVoices.forEach((voice) => {
    void voice.audio.play().catch(() => {
      updateAudioStatusText("error");
    });
    scheduleHtmlSampleStop(voice, holdSeconds);
  });
}

function detectSampleOnsetSeconds(buffer) {
  if (!buffer || typeof buffer.getChannelData !== "function") return 0;
  if (buffer.length <= 0 || buffer.sampleRate <= 0) return 0;
  const channel = buffer.getChannelData(0);
  if (!channel || channel.length === 0) return 0;
  const scanLength = Math.min(channel.length, Math.max(1, Math.floor(buffer.sampleRate * SAMPLE_ONSET_SCAN_SECONDS)));
  let peak = 0;
  for (let i = 0; i < scanLength; i += 1) {
    const abs = Math.abs(channel[i]);
    if (abs > peak) peak = abs;
  }
  if (peak <= 0) return 0;
  const threshold = Math.min(
    SAMPLE_ONSET_MAX_THRESHOLD,
    Math.max(SAMPLE_ONSET_MIN_THRESHOLD, peak * SAMPLE_ONSET_RATIO)
  );
  const requiredHits = Math.max(4, SAMPLE_ONSET_CONFIRM_SAMPLES);
  let hitCount = 0;
  let onsetIndex = -1;
  for (let i = 0; i < scanLength; i += 1) {
    if (Math.abs(channel[i]) >= threshold) {
      if (hitCount === 0) onsetIndex = i;
      hitCount += 1;
      if (hitCount >= requiredHits) break;
    } else {
      hitCount = 0;
      onsetIndex = -1;
    }
  }
  if (onsetIndex < 0) return 0;
  const preRoll = Math.min(onsetIndex, 64);
  const compensated = Math.max(0, onsetIndex - preRoll);
  return compensated / buffer.sampleRate;
}

function playSampleBuffer(buffer, midi, sampleMidi, onsetOffsetSeconds, startTime, holdSeconds, velocity, options = {}) {
  const source = audioCtx.createBufferSource();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();
  const tone = toneColor();
  const chordMode = options.chordMode === true;
  const release = Math.max(0.1, Math.min(0.7, holdSeconds * 0.35));
  const peak = 0.5 * velocity;
  const sustain = Math.max(0.08, 0.2 * velocity);

  source.buffer = buffer;
  source.playbackRate.value = 2 ** ((midi - sampleMidi) / 12);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1300 + tone * 55, startTime);
  filter.Q.value = 0.65;

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(peak, startTime + (chordMode ? 0.006 : 0.018));
  gain.gain.exponentialRampToValueAtTime(sustain, startTime + 0.18);
  gain.gain.setValueAtTime(sustain, startTime + holdSeconds);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + holdSeconds + release);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioMaster);
  const rawOffset = Number.isFinite(onsetOffsetSeconds) ? onsetOffsetSeconds : 0;
  const adjustedOffset = chordMode ? (rawOffset + CHORD_TRANSIENT_TRIM_SECONDS) : rawOffset;
  const safeOffset = Math.max(0, Math.min(buffer.duration - 0.01, adjustedOffset));
  source.start(startTime, safeOffset);
  source.stop(startTime + holdSeconds + release + 0.08);
}

function playSampleChordCluster(midiNotes, holdSeconds, velocity, startTime) {
  if (!audioCtx || htmlSampleEngineActive) return false;
  const syncStart = Number.isFinite(startTime)
    ? startTime
    : audioCtx.currentTime + Math.max(0.01, getInteractiveStartLeadTimeSeconds());
  const notePlans = [];
  for (let i = 0; i < midiNotes.length; i += 1) {
    const midi = midiNotes[i];
    const sample = getNearestSample(midi);
    const buffer = sampleBuffers.get(sample.note);
    if (!buffer) return false;
    notePlans.push({
      midi,
      sampleMidi: sample.midi,
      buffer
    });
  }
  notePlans.forEach((plan) => {
    playSampleBuffer(
      plan.buffer,
      plan.midi,
      plan.sampleMidi,
      0,
      syncStart,
      holdSeconds,
      velocity,
      { chordMode: true }
    );
  });
  return true;
}

function playSampleVoice(midi, startTime, holdSeconds, velocity) {
  if (htmlSampleEngineActive) {
    playHtmlSampleForMidi(midi, holdSeconds, velocity);
    return;
  }
  const sample = getNearestSample(midi);
  const buffer = sampleBuffers.get(sample.note);
  if (buffer) {
    const onsetOffset = sampleOnsetOffsets.get(sample.note) || 0;
    playSampleBuffer(buffer, midi, sample.midi, onsetOffset, startTime, holdSeconds, velocity);
    return;
  }

  const generationAtQueue = sampleEngineGeneration;
  void loadSampleBuffer(sample.note, sample.midi, generationAtQueue).then((loadedBuffer) => {
    if (!loadedBuffer) {
      if (activateHtmlSampleEngine()) {
        playHtmlSampleForMidi(midi, holdSeconds, velocity);
      } else if (el.chordDisplay) {
        el.chordDisplay.textContent = "Audio samples failed to load. Reload to retry.";
      }
      return;
    }
    if (!audioCtx || audioCtx.state === "closed") return;
    if (generationAtQueue !== sampleEngineGeneration) return;
    const safeStart = Math.max(startTime, audioCtx.currentTime + getInteractiveStartLeadTimeSeconds());
    try {
      const onsetOffset = sampleOnsetOffsets.get(sample.note) || 0;
      playSampleBuffer(loadedBuffer, midi, sample.midi, onsetOffset, safeStart, holdSeconds, velocity);
    } catch {
      // Ignore late-schedule errors from stale gesture timing.
    }
  });
  if (el.chordDisplay && sampleBuffers.size === 0) {
    el.chordDisplay.textContent = "Loading piano samples...";
  }
  updateAudioStatusText();
}

function getSampleLoadKey(sampleNote, generation) {
  return `${generation}:${sampleNote}`;
}

async function loadSampleBuffer(sampleNote, sampleMidi, generation = sampleEngineGeneration) {
  if (htmlSampleEngineActive) return null;
  if (generation !== sampleEngineGeneration) return null;
  if (sampleBuffers.has(sampleNote)) return sampleBuffers.get(sampleNote);
  const cacheKey = getSampleLoadKey(sampleNote, generation);
  if (sampleBufferLoads.has(cacheKey)) return sampleBufferLoads.get(cacheKey);
  const contextForLoad = audioCtx;
  if (!contextForLoad || contextForLoad.state === "closed") return null;
  const url = sampleUrlForNote(sampleNote);
  const loadPromise = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`sample ${sampleNote} ${res.status}`);
      return res.arrayBuffer();
    })
    .then((arr) => {
      if (generation !== sampleEngineGeneration) return null;
      if (!contextForLoad || contextForLoad.state === "closed") return null;
      return contextForLoad.decodeAudioData(arr);
    })
    .then((decoded) => {
      if (!decoded) return null;
      if (generation !== sampleEngineGeneration) return null;
      sampleBuffers.set(sampleNote, decoded);
      sampleOnsetOffsets.set(sampleNote, detectSampleOnsetSeconds(decoded));
      failedSampleNotes.delete(sampleNote);
      updateSampleEngineReadiness();
      flushPendingPlayRequests();
      updateAudioStatusText();
      return decoded;
    })
    .catch(() => {
      failedSampleNotes.add(sampleNote);
      updateSampleEngineReadiness();
      updateAudioStatusText();
      return null;
    })
    .finally(() => {
      sampleBufferLoads.delete(cacheKey);
    });
  sampleBufferLoads.set(cacheKey, loadPromise);
  return loadPromise;
}

function getNearestSample(targetMidi) {
  let nearestIndex = 0;
  let minDistance = Math.abs(targetMidi - SALAMANDER_SAMPLE_MIDI[0]);
  for (let i = 0; i < SALAMANDER_SAMPLE_MIDI.length; i += 1) {
    const distance = Math.abs(targetMidi - SALAMANDER_SAMPLE_MIDI[i]);
    if (distance < minDistance) {
      nearestIndex = i;
      minDistance = distance;
    }
  }
  return {
    note: SALAMANDER_SAMPLE_NOTES[nearestIndex],
    midi: SALAMANDER_SAMPLE_MIDI[nearestIndex]
  };
}

function sampleNoteToMidi(sampleNote) {
  const match = /^([A-G])(s?)(-?\d+)$/.exec(sampleNote);
  if (!match) return 60;
  const letter = match[1];
  const sharp = match[2] === "s";
  const octave = Number(match[3]);
  const baseMap = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const semitone = baseMap[letter] + (sharp ? 1 : 0);
  return 12 * (octave + 1) + semitone;
}

document.addEventListener("DOMContentLoaded", init);
window.hardResetProgress = hardResetProgress;

class CadenceGame {
  constructor() {
    this.active = false;
    this.level = 1;
    this.target = null;
    this.key = "C";
    this.progression = [];
    this.nextLevelTimerId = null;
  }

  start() {
    this.active = true;
    this.level = 1;
    el.gameOverlay.classList.remove("is-hidden");
    this.clearNextLevelTimer();
    this.nextLevel();
  }

  nextLevel() {
    this.clearNextLevelTimer();
    el.gameFeedback.className = "game-feedback";
    el.gameFeedback.textContent = "";

    // Simple logic: Random key, simple V-I or ii-V-I
    this.key = randomOf(NOTES);
    const type = Math.random() > 0.5 ? "Authentic (V-I)" : "Plagal (IV-I)";
    this.target = { root: this.key, quality: "major" }; // Resolution is always I (major for now)

    // Context
    const dominantIndex = (NOTES.indexOf(this.key) + 7) % 12;
    const dominantRoot = NOTES[dominantIndex];

    el.gameTitle.textContent = `Level ${this.level}`;
    el.gameInstructions.textContent = `We are in ${this.key} Major. Play the Tonic (I) chord.`;

    // Play the dominant to set up tension
    setTimeout(() => {
      const midi = buildChordMidi(dominantRoot, "major", "root position", 3);
      playMidiNotes(midi, { hold: 1, asChord: true, restrictToWindow: true });
    }, 500);
  }

  checkAnswer(root, quality) {
    if (!this.active) return;

    if (root === this.key && (quality === "major" || quality === "maj7")) {
      this.success();
    } else {
      this.fail(root, quality);
    }
  }

  success() {
    el.gameFeedback.textContent = "Correct! Perfect resolution.";
    el.gameFeedback.classList.add("success");
    this.level++;

    // Play a little victory arpeggio
    const midi = buildChordMidi(this.key, "major", "root position", 4);
    playMidiNotes(midi, { hold: 0.2, asChord: false, velocity: 0.6 });

    this.nextLevelTimerId = window.setTimeout(() => {
      if (!this.active) return;
      this.nextLevel();
    }, 900);
  }

  fail(playedRoot, playedQuality) {
    el.gameFeedback.textContent = `Not quite. You played ${playedRoot} ${playedQuality}. We need ${this.key} Major.`;
    el.gameFeedback.classList.add("error");
  }

  quit() {
    this.active = false;
    this.clearNextLevelTimer();
    el.gameOverlay.classList.add("is-hidden");
  }

  clearNextLevelTimer() {
    if (!this.nextLevelTimerId) return;
    window.clearTimeout(this.nextLevelTimerId);
    this.nextLevelTimerId = null;
  }
}
