const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const DEGREE_TO_SEMITONE = [0, 2, 4, 5, 7, 9, 11];
const ROMAN = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
const PROGRESS_STORAGE_KEY = "baby-steps-progress-v1";
const KEY_CENTER_TAB_POSITION_KEY = "baby-steps-key-center-tab-top-v1";
const LEGACY_PROGRESS_KEYS = ["baby-steps-progress", "baby-steps-progress-v0"];
const COACH_THREADS_STORAGE_KEY = "baby-steps-coach-threads-v1";
const COACH_LESSON_STACK_STORAGE_KEY = "baby-steps-coach-lesson-stack-v1";
const COACH_MAX_CONTEXT_MESSAGES = 14;
const COACH_MAX_ARTIFACT_ATTEMPTS = 320;
const COACH_MASTERY_CORRECT_TARGET = 5;
const STANDARD_WHITE_KEY_MM = 23.5;
const STANDARD_BLACK_KEY_MM = 13.7;
const STANDARD_BLACK_TO_WHITE_WIDTH_RATIO = STANDARD_BLACK_KEY_MM / STANDARD_WHITE_KEY_MM;
const KEYBOARD_FIRST_MIDI = 48;
const KEYBOARD_LAST_MIDI = 84;
const HIGHLIGHT_WINDOW_SPAN_SEMITONES = 12;
const HIGHLIGHT_START_MIN_MIDI = KEYBOARD_FIRST_MIDI;
const HIGHLIGHT_START_MAX_MIDI = KEYBOARD_LAST_MIDI - HIGHLIGHT_WINDOW_SPAN_SEMITONES;
const LEFT_HAND_BINDINGS = [
  { code: "KeyA", type: "white", index: 0, label: "A" },
  { code: "KeyW", type: "black", index: 0, label: "W" },
  { code: "KeyS", type: "white", index: 1, label: "S" },
  { code: "KeyE", type: "black", index: 1, label: "E" },
  { code: "KeyD", type: "white", index: 2, label: "D" },
  { code: "KeyF", type: "white", index: 3, label: "F" },
  { code: "KeyR", type: "black", index: 2, label: "R" },
];
const RIGHT_HAND_BINDINGS = [
  { code: "KeyJ", type: "white", index: 0, label: "J" },
  { code: "KeyU", type: "black", index: 0, label: "U" },
  { code: "KeyK", type: "white", index: 1, label: "K" },
  { code: "KeyI", type: "black", index: 1, label: "I" },
  { code: "KeyL", type: "white", index: 2, label: "L" },
  { code: "Semicolon", type: "white", index: 3, label: ";" },
  { code: "KeyO", type: "black", index: 2, label: "O" },
];
/* Backward compat: keep combined list for any remaining consumers */
const WINDOW_KEYBOARD_NOTE_BINDINGS = [...LEFT_HAND_BINDINGS, ...RIGHT_HAND_BINDINGS];

/* Map keyboard code → { hand, binding } for quick lookup */
const HAND_BINDING_BY_CODE = new Map();
LEFT_HAND_BINDINGS.forEach(b => HAND_BINDING_BY_CODE.set(b.code, { hand: "left", binding: b }));
RIGHT_HAND_BINDINGS.forEach(b => HAND_BINDING_BY_CODE.set(b.code, { hand: "right", binding: b }));

/* Legacy map — kept so any remaining callers still work */
const WINDOW_KEYBOARD_OFFSETS_BY_CODE = new Map(
  WINDOW_KEYBOARD_NOTE_BINDINGS.map((binding, i) => [binding.code, i < LEFT_HAND_BINDINGS.length ? binding.index : binding.index])
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
const CHORD_HOME_HOLD_MS = 3000;
const CHORD_MODE_TRANSITION_CLEANUP_MS = 860;
const CHORD_MODE_GLISS_SPACING_SECONDS = 0.052;
const CHORD_MODE_GLISS_HOLD_SECONDS = 0.15;
const CHORD_MODE_GLISS_THROTTLE_MS = 180;
const DEFAULT_SEQUENCE_SPACING_SECONDS = 0.08;

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

const SCALE_PATTERN_LIBRARY = {
  major: {
    label: "Major",
    intervals: [0, 2, 4, 5, 7, 9, 11]
  },
  naturalMinor: {
    label: "Natural Minor",
    intervals: [0, 2, 3, 5, 7, 8, 10]
  },
  harmonicMinor: {
    label: "Harmonic Minor",
    intervals: [0, 2, 3, 5, 7, 8, 11]
  },
  melodicMinor: {
    label: "Melodic Minor",
    intervals: [0, 2, 3, 5, 7, 9, 11]
  }
};

const LEGACY_SCALE_TYPE_TO_PATTERN = {
  "major (classical)": "major",
  "natural minor (classical)": "naturalMinor",
  "major bebop (jazz)": "major",
  "mixolydian (jazz/blues)": "major",
  "minor blues (blues)": "naturalMinor"
};

const SUBDIVISION_OPTIONS = [
  { label: "Quarter", value: 1 },
  { label: "Eighth", value: 0.5 },
  { label: "Sixteenth", value: 0.25 },
  { label: "Eighth Triplet", value: 1 / 3 },
  { label: "Sixteenth Triplet", value: 1 / 6 }
];

const PROGRESSIONS = {
  "I-vi-IV-V (Pop)": [0, 5, 3, 4],
  "I-V-vi-IV (Anthem)": [0, 4, 5, 3],
  "vi-IV-I-V (Emotional Pop)": [5, 3, 0, 4],
  "I-IV-V (Three-Chord)": [0, 3, 4],
  "I-V-vi-iii-IV-I-IV-V (Canon)": [0, 4, 5, 2, 3, 0, 3, 4],
  "I-ii-IV-V (Songwriter Lift)": [0, 1, 3, 4],
  "I-bVII-IV-I (Rock Mixolydian)": [0, 6, 3, 0],
  "I-V-IV (Rock/Country)": [0, 4, 3],
  "ii-V-I (Jazz)": [1, 4, 0],
  "iiø-V-i (Minor Jazz)": [1, 4, 0],
  "I-vi-ii-V (Turnaround)": [0, 5, 1, 4],
  "I-VI7-ii-V (Rhythm Changes)": [0, 5, 1, 4],
  "ii-V-I-vi (Jazz Loop)": [1, 4, 0, 5],
  "iii-vi-ii-V-I (Circle)": [2, 5, 1, 4, 0],
  "iv-bVII-I (Backdoor)": [3, 6, 0],
  "12-Bar Blues (I-IV-V)": [0, 0, 0, 0, 3, 3, 0, 0, 4, 3, 0, 4],
  "i-iv-VII-III (Minor cinematic)": [0, 3, 6, 2],
  "i-bVII-bVI-V (Andalusian)": [0, 6, 5, 4],
  "bVI-bVII-I (Epic Lift)": [5, 6, 0],
  "IV-I (Amen / Plagal)": [3, 0],
  "I-IV-I-V (Church Lift)": [0, 3, 0, 4],
  "I-iii-IV-iv (Gospel Color)": [0, 2, 3, 3],
  "I-IV-iv-I (Minor Plagal Color)": [0, 3, 3, 0],
  "7-3-6 (Gospel Pull)": [6, 2, 5]
};

const PROGRESSION_STYLE_PATTERNS = {
  plain: {
    label: "Plain",
    summary: "block chords on the main pulse",
    whatChanges: "The chords play as simple blocks so the number pattern is easy to hear."
  },
  pop: {
    label: "Pop",
    summary: "steady blocks with a little lift",
    whatChanges: "The chords stay clear, but the repeat gives the loop a song-like pulse."
  },
  reggae: {
    label: "Reggae",
    summary: "short offbeat stabs",
    whatChanges: "The chords get shorter and land after the beat, which creates the skank/offbeat feel."
  },
  bossa: {
    label: "Bossa nova",
    summary: "soft syncopated pushes",
    whatChanges: "The same harmony gets light, uneven pushes instead of square block chords."
  },
  latin: {
    label: "Latin",
    summary: "repeating syncopated chord punches",
    whatChanges: "The chords repeat in a clave-like pattern, so rhythm becomes the main style signal."
  },
  swing: {
    label: "Swing",
    summary: "long-short comping feel",
    whatChanges: "The chords lean into a long-short pulse. Add sevenths and it starts to feel more jazz."
  },
  classical: {
    label: "Classical",
    summary: "even, connected harmony",
    whatChanges: "The chords are held cleanly and evenly so the function and voice movement are easiest to inspect."
  }
};

const PROGRESSION_PALETTE_GROUPS = [
  {
    id: "pop",
    title: "Pop / Singer-Songwriter",
    items: [
      {
        name: "I-V-vi-IV (Anthem)",
        tagline: "Big chorus lift",
        theory: "This is the modern emotional engine: home, lift, ache, release. It feels familiar because countless pop hooks use the same number path in different keys.",
        listenFor: "The vi chord is the emotional turn. It darkens the loop without making the song feel fully sad.",
        feel: "Expansive, emotional, and immediately singable.",
        songs: ["Journey - Don't Stop Believin'", "U2 - With or Without You", "The Beatles - Let It Be", "Bob Marley - No Woman, No Cry", "Jason Mraz - I'm Yours"]
      },
      {
        name: "I-vi-IV-V (Pop)",
        tagline: "Classic doo-wop/pop loop",
        theory: "Home moves to the relative minor, then IV and V pull everything back. It is friendly, circular, and easy to sing over.",
        listenFor: "The V at the end asks to start again, so the loop feels like it can keep going.",
        feel: "Warm, nostalgic, and round.",
        songs: ["Ben E. King - Stand by Me", "The Penguins - Earth Angel", "The Marcels - Blue Moon", "Hoagy Carmichael - Heart and Soul", "Pearl Jam - Last Kiss"]
      },
      {
        name: "vi-IV-I-V (Emotional Pop)",
        tagline: "Start with feeling",
        theory: "Starting on vi makes the same major-key materials feel more vulnerable. When I finally arrives, it sounds like clarity after tension.",
        listenFor: "Notice how the loop sounds minor-tinted even though it belongs to a major key.",
        feel: "Reflective first, hopeful second.",
        songs: ["The Cranberries - Zombie", "Linkin Park - Numb", "OneRepublic - Apologize", "Avril Lavigne - Complicated", "Eagle-Eye Cherry - Save Tonight"]
      },
      {
        name: "I-IV-V (Three-Chord)",
        tagline: "Folk, rock, country bedrock",
        theory: "I is home, IV opens the room, and V creates the strongest pull back home. This is the basic grammar behind a huge amount of popular music.",
        listenFor: "The V chord is the cliffhanger. Your ear expects I after it.",
        feel: "Direct, stable, and easy to follow.",
        songs: ["The Troggs - Wild Thing", "Ritchie Valens - La Bamba", "The Kingsmen - Louie Louie", "The Beatles - Twist and Shout", "Chuck Berry - Johnny B. Goode"]
      },
      {
        name: "I-V-vi-iii-IV-I-IV-V (Canon)",
        tagline: "Classic descending pop DNA",
        qualities: ["major", "major", "minor", "minor", "major", "major", "major", "major"],
        theory: "This is the Canon-style long loop. The bass keeps stepping through a graceful story while the chords feel inevitable and familiar.",
        listenFor: "The vi to iii area is the tender middle. It makes the return to IV and I feel emotional instead of plain.",
        feel: "Elegant, sentimental, and ceremonial.",
        songs: ["Pachelbel - Canon in D", "Maroon 5 - Memories", "Vitamin C - Graduation", "Green Day - Basket Case", "Coolio - C U When U Get There"]
      },
      {
        name: "I-ii-IV-V (Songwriter Lift)",
        tagline: "Gentle lift into the V",
        theory: "The ii chord gives the progression a step forward before IV opens the sound and V points back home.",
        listenFor: "Notice how ii feels like motion, not arrival. It is a small lift that makes the V stronger.",
        feel: "Plainspoken, hopeful, and useful for verses.",
        songs: ["The Beatles - Eight Days a Week", "Sam Cooke - Wonderful World", "The Beach Boys - Wouldn't It Be Nice", "Traditional - This Little Light of Mine", "Classic hymn turnarounds"]
      }
    ]
  },
  {
    id: "jazz-blues",
    title: "Jazz / Blues",
    items: [
      {
        name: "ii-V-I (Jazz)",
        tagline: "The jazz sentence",
        theory: "ii prepares, V creates dominant tension, and I resolves. If you understand this, jazz harmony starts to look less mysterious.",
        listenFor: "The V chord has the strongest pull. It points directly at I.",
        feel: "Set up, tension, arrival.",
        songs: ["Joseph Kosma - Autumn Leaves", "Duke Ellington - Satin Doll", "Miles Davis - Tune Up", "Kenny Dorham - Blue Bossa", "Harry Warren - There Will Never Be Another You"]
      },
      {
        name: "iiø-V-i (Minor Jazz)",
        tagline: "Minor-key jazz gravity",
        rootOffsets: [2, 7, 0],
        qualities: ["m7b5", "dom7", "minor"],
        displayRomans: ["iiø", "V7", "i"],
        theory: "This is the minor version of ii-V-I. The half-diminished ii chord and dominant V create a darker, more dramatic pull into minor home.",
        listenFor: "The iiø chord sounds unstable right away. The V7 then tightens the pull before i releases it.",
        feel: "Dark, sophisticated, and resolved.",
        songs: ["Joseph Kosma - Autumn Leaves", "Kenny Dorham - Blue Bossa", "Duke Ellington - Caravan", "Wayne Shorter - Footprints", "Jazz minor turnaround endings"]
      },
      {
        name: "I-vi-ii-V (Turnaround)",
        tagline: "Gets you back home",
        theory: "A turnaround keeps the music moving at the end of a phrase. It walks away from I just enough to make returning to I feel satisfying.",
        listenFor: "The last two chords, ii to V, are the runway back to home.",
        feel: "Circular, polished, and ready to repeat.",
        songs: ["Hoagy Carmichael - Heart and Soul", "George Gershwin - I Got Rhythm", "Duke Ellington - Satin Doll", "Charlie Parker - Anthropology", "Sonny Rollins - Oleo"]
      },
      {
        name: "I-VI7-ii-V (Rhythm Changes)",
        tagline: "Jazz standard turnaround",
        qualities: ["maj7", "dom7", "min7", "dom7"],
        displayRomans: ["Imaj7", "VI7", "ii7", "V7"],
        theory: "This is a stronger turnaround because VI becomes dominant instead of minor. That dominant VI points at ii, then ii-V points back home.",
        listenFor: "The VI7 chord is the spice. It makes the middle of the loop lean forward.",
        feel: "Bright, swinging, and classic.",
        songs: ["George Gershwin - I Got Rhythm", "Charlie Parker - Anthropology", "Sonny Rollins - Oleo", "Thelonious Monk - Rhythm-a-Ning", "Flintstones Theme"]
      },
      {
        name: "ii-V-I-vi (Jazz Loop)",
        tagline: "Resolution with a tag",
        theory: "This resolves to I, then uses vi to keep the story open. It is useful when you want a progression to breathe instead of stopping.",
        listenFor: "The vi after I feels like a comma, not a period.",
        feel: "Resolved, then gently reopened.",
        songs: ["Bart Howard - Fly Me to the Moon", "Frank Loesser - I've Never Been in Love Before", "Duke Ellington - Satin Doll", "Jerome Kern - All the Things You Are", "Vernon Duke - Autumn in New York"]
      },
      {
        name: "iii-vi-ii-V-I (Circle)",
        tagline: "Circle-of-fifths pull",
        qualities: ["min7", "min7", "min7", "dom7", "maj7"],
        displayRomans: ["iii7", "vi7", "ii7", "V7", "Imaj7"],
        theory: "This walks through functional gravity. Each chord points naturally to the next, so the whole line feels like it is rolling downhill toward I.",
        listenFor: "Listen for the repeated falling-fifth motion. It is one of harmony's strongest engines.",
        feel: "Inevitable, educated, and satisfying.",
        songs: ["Jerome Kern - All the Things You Are", "Bart Howard - Fly Me to the Moon", "Duke Ellington - Satin Doll", "George Gershwin - I Got Rhythm", "Many jazz standard turnarounds"]
      },
      {
        name: "iv-bVII-I (Backdoor)",
        tagline: "Soulful backdoor home",
        rootOffsets: [5, 10, 0],
        preferFlats: true,
        qualities: ["min7", "dom7", "major"],
        displayRomans: ["iv7", "bVII7", "I"],
        theory: "This approaches I from the backdoor instead of using V. The borrowed iv and bVII7 give the resolution a smoky jazz, soul, or gospel color.",
        listenFor: "The bVII7 does not sound like a normal dominant, but it still slides beautifully into I.",
        feel: "Cool, warm, and slightly surprising.",
        songs: ["The Beatles - Hey Jude", "Radiohead - Creep", "Billy Strayhorn - Take the A Train", "Jerome Kern - All the Things You Are", "Jazz and gospel tag endings"]
      },
      {
        name: "12-Bar Blues (I-IV-V)",
        tagline: "Blues form map",
        theory: "The blues repeats I, visits IV, returns home, then uses V and IV to set up the next round. It is a form and a feeling at the same time.",
        listenFor: "The final V chord turns the whole form around.",
        feel: "Grounded, conversational, and cyclical.",
        songs: ["Big Mama Thornton - Hound Dog", "Robert Johnson - Sweet Home Chicago", "Chuck Berry - Johnny B. Goode", "Stevie Ray Vaughan - Pride and Joy", "B.B. King - Everyday I Have the Blues"]
      }
    ]
  },
  {
    id: "gospel",
    title: "Gospel / Church",
    items: [
      {
        name: "IV-I (Amen / Plagal)",
        tagline: "Church resolution",
        theory: "IV to I is the classic Amen sound. It resolves gently, more like arrival and reassurance than dramatic tension.",
        listenFor: "This cadence feels warm because IV falls back into home without the sharp pull of V.",
        feel: "Gentle, settled, and reverent.",
        songs: ["Traditional - Amen", "John Newton - Amazing Grace", "Traditional - Auld Lang Syne", "Traditional - Leaning on the Everlasting Arms", "Traditional hymn endings"]
      },
      {
        name: "I-IV-I-V (Church Lift)",
        tagline: "Call-and-response lift",
        theory: "This rocks between home and IV, then uses V to ask for the next phrase. It is simple, strong, and great for learning gospel movement.",
        listenFor: "IV opens the sound. V points forward.",
        feel: "Open, communal, and forward-moving.",
        songs: ["Edwin Hawkins Singers - Oh Happy Day", "Traditional - This Little Light of Mine", "Traditional - Down by the Riverside", "Traditional - I'll Fly Away", "Traditional - When the Saints Go Marching In"]
      },
      {
        name: "I-iii-IV-iv (Gospel Color)",
        tagline: "Sweet borrowed-color move",
        qualities: ["major", "minor", "major", "minor"],
        displayRomans: ["I", "iii", "IV", "iv"],
        theory: "The borrowed minor iv is the magic. It briefly borrows color from the minor world, then makes the return home feel tender.",
        listenFor: "The iv chord is the sigh. That one color change is the whole lesson.",
        feel: "Sweet, aching, and tender.",
        songs: ["The Beatles - In My Life", "Radiohead - Creep", "David Bowie - Space Oddity", "The Beach Boys - God Only Knows", "Queen - We Are the Champions"]
      },
      {
        name: "I-IV-iv-I (Minor Plagal Color)",
        tagline: "The borrowed iv sigh",
        qualities: ["major", "major", "minor", "major"],
        displayRomans: ["I", "IV", "iv", "I"],
        theory: "This isolates the famous major IV to minor iv color. It is one of the clearest ways to hear borrowed harmony without needing a long progression.",
        listenFor: "The IV to iv change is the emotional hinge. The same root stays, but the color changes from bright to bittersweet.",
        feel: "Tender, nostalgic, and intimate.",
        songs: ["The Beatles - In My Life", "The Beach Boys - God Only Knows", "Radiohead - Creep", "David Bowie - Space Oddity", "Queen - We Are the Champions"]
      },
      {
        name: "7-3-6 (Gospel Pull)",
        tagline: "Passing pull into vi",
        qualities: ["m7b5", "dom7", "minor"],
        displayRomans: ["viiø", "III7", "vi"],
        theory: "This is a gospel and jazz-flavored gravity move into vi. The first two chords act like setup and pull, then vi becomes the landing spot.",
        listenFor: "Hear how III7 leans hard into vi.",
        feel: "Churchy, tense, and satisfying.",
        songs: ["Gospel shout endings", "Jazz gospel turnarounds", "Traditional church passing chords", "R&B piano walkups", "Neo-soul reharmonizations"]
      }
    ]
  },
  {
    id: "cinematic",
    title: "Rock / Cinematic Color",
    items: [
      {
        name: "I-bVII-IV-I (Rock Mixolydian)",
        tagline: "Open rock color",
        rootOffsets: [0, 10, 5, 0],
        preferFlats: true,
        qualities: ["major", "major", "major", "major"],
        displayRomans: ["I", "bVII", "IV", "I"],
        theory: "The flat-seven chord gives a major key a rock/modal flavor. It sounds open and earthy instead of tidy and classical.",
        listenFor: "bVII is the color note. It feels bold without needing a normal V chord.",
        feel: "Wide, rootsy, and confident.",
        songs: ["Lynyrd Skynyrd - Sweet Home Alabama", "The Rolling Stones - Sympathy for the Devil", "The Beatles - Hey Jude", "The Who - Won't Get Fooled Again", "Stealers Wheel - Stuck in the Middle with You"]
      },
      {
        name: "I-V-IV (Rock/Country)",
        tagline: "Backbeat-ready major rock",
        theory: "This uses the same three primary chords as I-IV-V, but the V to IV order gives it a looser, guitar-driven sound.",
        listenFor: "The V does not resolve straight home. It drops to IV first, which makes the loop feel more relaxed and earthy.",
        feel: "Open-road, strong, and unfussy.",
        songs: ["Lynyrd Skynyrd - Sweet Home Alabama", "Bob Dylan - Knockin' on Heaven's Door", "Tom Petty - Free Fallin'", "The Rolling Stones - You Can't Always Get What You Want", "Country-rock chorus progressions"]
      },
      {
        name: "i-iv-VII-III (Minor cinematic)",
        tagline: "Minor movie motion",
        rootOffsets: [0, 5, 10, 3],
        preferFlats: true,
        qualities: ["minor", "minor", "major", "major"],
        displayRomans: ["i", "iv", "VII", "III"],
        theory: "This moves through a minor-key landscape with enough major chords to feel wide-screen. It is useful for dramatic, reflective progressions.",
        listenFor: "The III chord brightens the minor mood without leaving the world of the key.",
        feel: "Dramatic, reflective, and wide-screen.",
        songs: ["Traditional - House of the Rising Sun", "Eagles - Hotel California", "Gary Jules - Mad World", "R.E.M. - Losing My Religion", "Film-score minor loops"]
      },
      {
        name: "i-bVII-bVI-V (Andalusian)",
        tagline: "Spanish minor descent",
        rootOffsets: [0, 10, 8, 7],
        preferFlats: true,
        qualities: ["minor", "major", "major", "major"],
        displayRomans: ["i", "bVII", "bVI", "V"],
        theory: "This is the classic Andalusian descent. The bass walks down through minor colors and lands on V, which wants to pull back to i.",
        listenFor: "The final V is the snapback. After the descending line, it creates a strong need to restart on i.",
        feel: "Passionate, dramatic, and old-world.",
        songs: ["Traditional - Hit the Road Jack", "Led Zeppelin - Babe I'm Gonna Leave You", "The Stray Cats - Stray Cat Strut", "Flamenco-style turnarounds", "Latin minor vamp endings"]
      },
      {
        name: "bVI-bVII-I (Epic Lift)",
        tagline: "Big cinematic arrival",
        rootOffsets: [8, 10, 0],
        preferFlats: true,
        qualities: ["major", "major", "major"],
        displayRomans: ["bVI", "bVII", "I"],
        theory: "Two borrowed major chords climb into I. It is simple, huge, and very useful for endings, key moments, and dramatic arrivals.",
        listenFor: "The bVI to bVII climb feels like a ramp. I becomes the arrival at the top.",
        feel: "Heroic, cinematic, and final.",
        songs: ["The Beatles - Hey Jude", "Oasis - Don't Look Back in Anger", "Queen - We Are the Champions", "Film trailer cadences", "Arena rock endings"]
      }
    ]
  }
];

const MAJOR_KEY_TRIAD_QUALITIES = ["major", "minor", "minor", "major", "major", "minor", "diminished"];
const MAJOR_KEY_SEVENTH_QUALITIES = ["maj7", "min7", "min7", "maj7", "dom7", "min7", "m7b5"];
const MINOR_KEY_DEGREE_TO_SEMITONE = [0, 2, 3, 5, 7, 8, 10];
const MINOR_KEY_TRIAD_QUALITIES = ["minor", "diminished", "major", "minor", "minor", "major", "major"];
const MINOR_KEY_SEVENTH_QUALITIES = ["min7", "m7b5", "maj7", "min7", "min7", "maj7", "dom7"];
const PROGRESSION_START_TARGET_MIDI = 60;
const ARPEGGIO_TRIAD_ROWS = [
  { name: "Triad (Root Position)", inversionIndex: 0 },
  { name: "Triad (1st Inversion)", inversionIndex: 1 },
  { name: "Triad (2nd Inversion)", inversionIndex: 2 }
];
const SCALES_PALETTE_ROWS = [
  { id: "major", name: "Major", intervals: SCALE_PATTERN_LIBRARY.major.intervals },
  { id: "naturalMinor", name: "Natural Minor", intervals: SCALE_PATTERN_LIBRARY.naturalMinor.intervals },
  { id: "harmonicMinor", name: "Harmonic Minor", intervals: SCALE_PATTERN_LIBRARY.harmonicMinor.intervals },
  { id: "melodicMinor", name: "Melodic Minor", intervals: SCALE_PATTERN_LIBRARY.melodicMinor.intervals }
];
const MODES_PALETTE_ROWS = [
  { id: "dorian", name: "Dorian", intervals: [0, 2, 3, 5, 7, 9, 10] },
  { id: "phrygian", name: "Phrygian", intervals: [0, 1, 3, 5, 7, 8, 10] },
  { id: "lydian", name: "Lydian", intervals: [0, 2, 4, 6, 7, 9, 11] },
  { id: "mixolydian", name: "Mixolydian", intervals: [0, 2, 4, 5, 7, 9, 10] }
];
const PENTATONIC_PALETTE_ROWS = [
  { id: "majorPent", name: "Major Pentatonic", intervals: [0, 2, 4, 7, 9] },
  { id: "minorPent", name: "Minor Pentatonic", intervals: [0, 3, 5, 7, 10] },
  { id: "blues", name: "Blues", intervals: [0, 3, 5, 6, 7, 10] }
];
const COLOR_PALETTE_ROWS = [
  { id: "wholeTone", name: "Whole Tone", intervals: [0, 2, 4, 6, 8, 10] },
  { id: "diminishedHW", name: "Diminished (Half-Whole)", intervals: [0, 1, 3, 4, 6, 7, 9, 10] },
  { id: "diminishedWH", name: "Diminished (Whole-Half)", intervals: [0, 2, 3, 5, 6, 8, 9, 11] },
  { id: "harmonicMajor", name: "Harmonic Major", intervals: [0, 2, 4, 5, 7, 8, 11] }
];
const HARMONIC_PALETTE_TABS = ["secondary", "borrowed", "substitution"];
const ENHARMONIC_FLAT_MAP = {
  "C#": "Db",
  "D#": "Eb",
  "F#": "Gb",
  "G#": "Ab",
  "A#": "Bb"
};
const PALETTE_SCALAR_COLUMN_DEGREES = [1, 2, 3, 4, 5, 6, 7, 8];
const EXPLORATION_HOLD_THRESHOLD_MS = 450;
const EXPLORATION_CYCLE_MS = 900;
const TENSION_LEVEL_LABELS = ["Low", "Medium", "High", "Extreme"];
const DOMINANT_TENSION_PATTERNS = [
  [0, 2, 4, 5, 7, 9, 10],      // Mixolydian
  [0, 2, 4, 6, 7, 9, 10],      // Lydian dominant
  [0, 1, 3, 4, 6, 7, 9, 10],   // Half-whole diminished
  [0, 1, 3, 4, 6, 8, 10]       // Altered
];
const COACH_CADENCE_QUIZ_OPTIONS = [
  { id: "authentic", label: "Authentic (V -> I)" },
  { id: "plagal", label: "Plagal (IV -> I)" },
  { id: "half", label: "Half (... -> V)" },
  { id: "deceptive", label: "Deceptive (V -> vi)" }
];
const COACH_CADENCE_LABEL_BY_ID = Object.freeze({
  authentic: "Authentic (V -> I)",
  plagal: "Plagal (IV -> I)",
  half: "Half (... -> V)",
  deceptive: "Deceptive (V -> vi)"
});
const FLAT_TO_SHARP = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#"
};
const REPERTOIRE_DATA_URL = "./data/repertoire.json";
const REPERTOIRE_STYLES_DATA_URL = "./data/repertoire_styles.json";
const REPERTOIRE_CACHE_DB_NAME = "baby-steps-repertoire-cache-v1";
const REPERTOIRE_CACHE_STORE = "midi-events";
const REPERTOIRE_MIDI_PROXY_ENDPOINT = "/api/repertoire/midi";
const REPERTOIRE_SCHEDULE_LOOKAHEAD_SECONDS = 0.45;
const REPERTOIRE_SCHEDULER_INTERVAL_MS = 70;
const REPERTOIRE_LEAD_SECONDS = 0.02;
const REPERTOIRE_FILTER_OPTIONS = [
  { id: "all", label: "All", genres: [] },
  { id: "classical", label: "Classical", genres: ["classical"] },
  { id: "early_jazz", label: "Early Jazz PD", genres: ["early_jazz"] },
  { id: "blues", label: "Blues", genres: ["blues"] },
  { id: "gospel", label: "Gospel", genres: ["gospel"] },
  { id: "bossa", label: "Bossa", genres: ["bossa"] },
  { id: "pop", label: "Pop", genres: ["pop"] },
  { id: "rock", label: "Rock", genres: ["rock"] },
  { id: "study", label: "Studies", genres: ["study"] }
];
const REPERTOIRE_TAG_TO_ACTIONS = {
  ii_v_i: [{ tab: "Cadences", action: "play_cell", payload: { row: "Jazz Cadences", col: "ii–V–I" } }],
  tritone_sub: [{ tab: "Substitution", action: "play_cell", payload: { row: "Dominant Substitution", col: "Substitution" } }],
  borrowed_chords: [{ tab: "Borrowed", action: "play_row", payload: { row: "Borrowed" } }],
  secondary_dominants: [{ tab: "Secondary", action: "play_row", payload: { row: "Secondary Dominant" } }],
  blues_scale: [{ tab: "Pentatonic", action: "play_row", payload: { row: "Blues" } }],
  mixolydian: [{ tab: "Modes", action: "play_row", payload: { row: "Mixolydian" } }],
  diminished: [{ tab: "Color", action: "play_row", payload: { row: "Diminished (Half-Whole)" } }],
  whole_tone: [{ tab: "Color", action: "play_row", payload: { row: "Whole Tone" } }],
  harmonic_minor: [{ tab: "Scales", action: "play_row", payload: { row: "Harmonic Minor" } }],
  cadence: [{ tab: "Cadences", action: "play_row", payload: { row: "Cadences" } }],
  modal_mixture: [{ tab: "Borrowed", action: "play_row", payload: { row: "Borrowed" } }]
};
const EXERCISE_RELATED_REPERTOIRE = {
  power: "folk-hymn-cadence-study",
  tension: "neo-soul-tritone-study",
  secondary: "gospel-walkup-study",
  borrowed: "rock-mixolydian-study",
  tritone: "neo-soul-tritone-study",
  "ii-v-i": "bossa-ii-v-i-study",
  modal: "rock-mixolydian-study",
  whole: "debussy-clair-de-lune-excerpt",
  arpeggio: "bach-prelude-c-major",
  cadence: "twelve-bar-blues-form"
};
const TAB_NAME_TO_ID = {
  chords: "chords",
  scales: "scales",
  arpeggios: "arpeggios",
  modes: "modes",
  pentatonic: "pentatonic",
  color: "color",
  secondary: "secondary",
  borrowed: "borrowed",
  substitution: "substitution",
  cadences: "cadences",
  Chords: "chords",
  Scales: "scales",
  Arpeggios: "arpeggios",
  Modes: "modes",
  Pentatonic: "pentatonic",
  Color: "color",
  Secondary: "secondary",
  Borrowed: "borrowed",
  Substitution: "substitution",
  Cadences: "cadences"
};
const REPERTOIRE_TAG_TO_EXERCISE = {
  cadence: "cadence",
  ii_v_i: "ii-v-i",
  tritone_sub: "tritone",
  borrowed_chords: "borrowed",
  secondary_dominants: "secondary",
  mixolydian: "modal",
  whole_tone: "whole",
  arpeggios: "arpeggio"
};

const CADENCES = {
  "Authentic (V-I)": [4, 0],
  "Plagal (IV-I)": [3, 0],
  "Half (I-V)": [0, 4],
  "Deceptive (V-vi)": [4, 5],
  "ii-V-I (Jazz cadence)": [1, 4, 0],
  "Backdoor (bVII-I)": [10, 0],
  "Double Plagal (bVII-IV-I)": [10, 3, 0],
  "Tritone Sub (bII-I)": [1, 0]
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
  },
  "Backdoor (bVII-I)": {
    theory: "Flat-seven dominant resolves directly to tonic, bypassing the usual V chord.",
    emotion: "Smooth, unexpected, and pleasantly surprising.",
    useCase: "Jazz endings, pop outros, and surprise resolutions."
  },
  "Double Plagal (bVII-IV-I)": {
    theory: "Two plagal-style motions chain together for a rock-influenced descent.",
    emotion: "Earthy, anthem-like, and powerful.",
    useCase: "Rock anthems, folk progressions, and strong chorus endings."
  },
  "Tritone Sub (bII-I)": {
    theory: "The tritone substitution replaces V with bII for chromatic half-step resolution.",
    emotion: "Sleek, chromatic, and harmonically advanced.",
    useCase: "Jazz intros, sophisticated endings, and chromatic color."
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
  activePracticePathId: "chord-mastery-foundation",
  practicePathStartDate: "2026-04-27",
  labLearningMode: "study",
  dailyPracticeLog: {},
  chordMasteryScores: {},
  savedLabIdeas: [],
  chordReps: 0,
  progressionReps: 0,
  arpeggioReps: 0,
  scaleReps: 0,
  conceptMastery: {},
  artifactAttempts: [],
  theoryCompletedLessons: {},
  theoryAudioByLesson: {},
  theoryCustomLessons: {},
  theoryLessonRuns: {},
  areas: { chords: 0, progressions: 0, arpeggios: 0, scales: 0 },
  recent: []
};

const CHORD_MASTERY_KEYS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const CHORD_MASTERY_KEY_WEIGHTS = {
  C: 1.6,
  Db: 0.8,
  D: 1.3,
  Eb: 0.9,
  E: 1.1,
  F: 1.4,
  Gb: 0.7,
  G: 1.5,
  Ab: 0.8,
  A: 1.2,
  Bb: 1,
  B: 1
};
const CHORD_MASTERY_SKILLS = [
  { id: "cm-root", label: "CM Root" },
  { id: "cm-inv1", label: "CM 1st" },
  { id: "cm-inv2", label: "CM 2nd" },
  { id: "1564-root", label: "1-5-6-4 Root" },
  { id: "1564-inv1", label: "1-5-6-4 1st" },
  { id: "1564-inv2", label: "1-5-6-4 2nd" },
  { id: "1564-voice", label: "Voice-led" }
];
const VOCABULARY_LAB_ROWS = [
  { id: "minor-blues", label: "Minor blues scale", type: "scale", scale: "blues", note: "Use over I7, IV7, and V7 for blues language." },
  { id: "major-blues", label: "Major blues color", type: "scale", intervals: [0, 2, 3, 4, 7, 9], note: "Brighter blues color for gospel, country, and pop piano." },
  { id: "dorian", label: "Dorian over ii", type: "scale", scale: "dorian", degree: 1, note: "Jazz minor color that wants to move toward V." },
  { id: "mixolydian", label: "Mixolydian over V", type: "scale", scale: "mixolydian", degree: 4, note: "Dominant sound that wants to resolve home." },
  { id: "amen", label: "Amen / plagal", type: "harmony", steps: [3, 0], qualities: ["major", "major"], note: "Church-style IV to I resolution." },
  { id: "church-walk", label: "Church walk to IV", type: "harmony", offsets: [0, 2, 4, 5], qualities: ["major", "minor", "minor", "major"], note: "Passing motion from I toward IV." },
  { id: "736", label: "7-3-6 movement", type: "harmony", offsets: [11, 4, 9], qualities: ["m7b5", "dom7", "minor"], note: "Gospel/jazz pull into vi." },
  { id: "tritone", label: "Tritone dominant", type: "harmony", offsets: [6, 0], qualities: ["dom7", "major"], note: "Dominant substitute resolving home by half step." }
];

const BADGE_DEFINITIONS = [
  { id: "first_chord", label: "First Chord", icon: "🎹", rule: p => (p.areas?.chords || 0) >= 1 },
  { id: "chord_explorer", label: "Chord Explorer", icon: "🎵", rule: p => (p.areas?.chords || 0) >= 50 },
  { id: "scale_runner", label: "Scale Runner", icon: "🏃", rule: p => (p.areas?.scales || 0) >= 25 },
  { id: "theory_student", label: "Theory Student", icon: "📚", rule: p => Object.keys(p.theoryCompletedLessons || {}).length >= 3 },
  { id: "cadence_master", label: "Cadence Master", icon: "🎯", rule: p => (p.conceptMastery?.cadence || 0) >= 10 },
  { id: "streak_3", label: "3-Day Streak", icon: "🔥", rule: p => (p.streakDays || 0) >= 3 },
  { id: "streak_7", label: "Weekly Warrior", icon: "⚡", rule: p => (p.streakDays || 0) >= 7 },
  { id: "lesson_complete", label: "Lesson Graduate", icon: "🎓", rule: p => Object.values(p.theoryCompletedLessons || {}).some(v => v) }
];

const earnedBadgesLocal = new Set(
  JSON.parse(safeStorageGet("baby-steps-badges-v1") || "[]")
);

let el = {};

const appState = {
  root: "C",
  quality: "major",
  inversion: "root position",
  paletteTab: "chords",
  chordMode: "palette",
  cofPlayMode: "note",
  cadenceMode: 1,
  bpm: 100,
  metronomeRunning: false,
  isExploring: false,
  exploreLevel: 0,
  exploreTimers: [],
  exploreStartTime: 0,
  tempoBpm: 80,
  subdivision: 0.5
};
const repertoireState = {
  items: [],
  stylePresets: {},
  filteredGenre: "all",
  searchQuery: "",
  selectedId: "",
  selectedItem: null,
  isPlaying: false,
  isPaused: false,
  loopEnabled: true,
  loopStartBeat: 0,
  loopEndBeat: 16,
  playheadBeat: 0,
  playStartAudioTime: 0,
  scheduleCursorBeat: 0,
  scheduleCursorAudioTime: 0,
  schedulerTimerId: null,
  prepared: null,
  preparedById: new Map(),
  metronomeEnabled: false,
  muteMelody: false,
  onlyChords: false,
  infoItemId: "",
  activeExerciseId: "",
  activeItemExerciseId: "",
  suggestionEntries: [],
  metronomeCursorBeat: -1,
  listSnapshot: [],
  hasLoaded: false,
  loadError: "",
  midiMemoryCache: new Map(),
  dbPromise: null
};
const coachState = {
  threads: [],
  activeThreadId: "",
  isStreaming: false,
  lessonStack: [],
  quizSessions: {}
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
let emergencyToneEngineActive = false;
const tonePendingRequests = [];
let audioStatusLastRendered = "";
let focusTimerId;
let clearStripStepTimer;
let clearModeEnterTimer;
let resetInFlight = false;
let highlightDragHand = null; /* "left" | "right" | null */
let highlightDragOffsetSemitones = HIGHLIGHT_WINDOW_SPAN_SEMITONES / 2;
let notePressIndicatorEl = null;
let lastRestrictedChordWindowMidi = null;
let lastChordPaletteSelectionAtMs = null;
let audioUnlockBound = false;
let keyCenterBackdropHideTimer = null;
let keyCenterTabDrag = null;
let suppressKeyCenterToggleClick = false;
let chordModeTransitionTimer = null;
let lastChordModeGlissAtMs = 0;
const typingHeldMidiByCode = new Map();
let activePatternRunId = 0;
const patternUiTimerIds = new Set();
let paletteSequenceToken = 0;
let progressionPalettePlayToken = 0;
let activeProgressionPaletteGroupId = "pop";
let progressionPaletteFocus = { root: "C", quality: "major", source: "key" };
let keyDisplayPreference = "sharp";
let activeExploreChordContext = null;
let currentStudyContext = { type: "chord" };
const guidedExerciseUiTimers = new Set();
const scheduledFallbackNoteTimers = new Set();
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
    playProgressionBtn: byId("playProgressionBtn"),
    playCadenceBtn: byId("playCadenceBtn"),
    explainCadenceBtn: byId("explainCadenceBtn"),
    startCadenceGameBtn: byId("startCadenceGameBtn"),
    gameOverlay: byId("gameOverlay"),
    gameTitle: byId("gameTitle"),
    gameInstructions: byId("gameInstructions"),
    gameFeedback: byId("gameFeedback"),
    openKeyCenterBtn: byId("openKeyCenterBtn"),
    keyCenterDrawer: byId("keyCenterDrawer"),
    keyCenterDrawerBackdrop: byId("keyCenterDrawerBackdrop"),
    tempoMinusBtn: byId("tempoMinusBtn"),
    tempoPlusBtn: byId("tempoPlusBtn"),
    tempoValue: byId("tempoValue"),
    subdivisionSelect: byId("subdivisionSelect"),
    keyboard: byId("keyboard"),
    paletteTabSwitch: byId("paletteTabSwitch"),
    metronome: byId("metronome"),
    metronomeDecBtn: byId("metronomeDecBtn"),
    metronomeIncBtn: byId("metronomeIncBtn"),
    metronomeBpmBtn: byId("metronomeBpmBtn"),
    metronomeBpmDisplay: byId("metronomeBpmDisplay"),
    metronomeToggleBtn: byId("metronomeToggleBtn"),
    exploreTensionLabel: byId("exploreTensionLabel"),
    chordTableTitle: byId("chordTableTitle"),
    chordTableHead: byId("chordTableHead"),
    chordTableBody: byId("chordTableBody"),
    progressionStrip: byId("progressionStrip"),
    cadenceStrip: byId("cadenceStrip"),
    chordDisplay: byId("chordDisplay"),
    progressionOutput: byId("progressionOutput"),
    progressionPalettePanel: byId("progressionPalettePanel"),
    progressionPaletteKey: byId("progressionPaletteKey"),
    progressionPaletteTabs: byId("progressionPaletteTabs"),
    progressionPaletteGrid: byId("progressionPaletteGrid"),
    progressionPaletteExplain: byId("progressionPaletteExplain"),
    progressionVoicingSelect: byId("progressionVoicingSelect"),
    progressionStyleSelect: byId("progressionStyleSelect"),
    audioStatus: byId("audioStatus"),
    highlightStartLeft: byId("highlightStartLeft"),
    highlightStartRight: byId("highlightStartRight"),
    highlightWindowTrack: byId("highlightWindowTrack"),
    highlightGlowLeft: byId("highlightGlowLeft"),
    highlightGlowRight: byId("highlightGlowRight"),
    highlightLabelLeft: byId("highlightLabelLeft"),
    highlightLabelRight: byId("highlightLabelRight"),
    windowKeyboardHint: byId("windowKeyboardHint"),
    arpRootSelect: byId("arpRootSelect"),
    arpTypeSelect: byId("arpTypeSelect"),
    handSelect: byId("handSelect"),
    playArpBtn: byId("playArpBtn"),
    showFingeringBtn: byId("showFingeringBtn"),
    arpOutput: byId("arpOutput"),
    scaleRootSelect: byId("scaleRootSelect"),
    scaleTypeSelect: byId("scaleTypeSelect"),
    scaleOctaveSelect: byId("scaleOctaveSelect"),
    scaleHandSelect: byId("scaleHandSelect"),
    scaleMotionSelect: byId("scaleMotionSelect"),
    playScaleBtn: byId("playScaleBtn"),
    scaleOutput: byId("scaleOutput"),
    modeSwitch: byId("modeSwitch"),
    coachInput: byId("coachInput"),
    coachAskBtn: byId("coachAskBtn"),
    coachUseContextBtn: byId("coachUseContextBtn"),
    coachThreadPills: byId("coachThreadPills"),
    coachNewThreadBtn: byId("coachNewThreadBtn"),
    coachMessages: byId("coachMessages"),
    coachTyping: byId("coachTyping"),
    kanbanTodo: byId("kanbanTodo"),
    kanbanActive: byId("kanbanActive"),
    kanbanDone: byId("kanbanDone"),
    lessonCards: byId("lessonCards"),
    todayPracticeMeta: byId("todayPracticeMeta"),
    todayPracticeTitle: byId("todayPracticeTitle"),
    todayPracticeFocus: byId("todayPracticeFocus"),
    todayPracticeExercises: byId("todayPracticeExercises"),
    practiceStartDateInput: byId("practiceStartDateInput"),
    practiceMinutesInput: byId("practiceMinutesInput"),
    practiceNotesInput: byId("practiceNotesInput"),
    markPracticeDoneBtn: byId("markPracticeDoneBtn"),
    todayPracticeStatus: byId("todayPracticeStatus"),
    chordMasteryMatrix: byId("chordMasteryMatrix"),
    masteryWeightedScore: byId("masteryWeightedScore"),
    masteryStrongestKey: byId("masteryStrongestKey"),
    masteryWeakestKey: byId("masteryWeakestKey"),
    scaleChordLab: byId("scaleChordLab"),
    pianoLabContext: byId("pianoLabContext"),
    nowStudyingPanel: byId("nowStudyingPanel"),
    labMicroMissions: byId("labMicroMissions"),
    studyModeSwitch: byId("studyModeSwitch"),
    lostStepBtn: byId("lostStepBtn"),
    lab1564InversionSelect: byId("lab1564InversionSelect"),
    lab1564PatternSelect: byId("lab1564PatternSelect"),
    play1564LabBtn: byId("play1564LabBtn"),
    lab1564Output: byId("lab1564Output"),
    vocabularyLab: byId("vocabularyLab"),
    modFromKeySelect: byId("modFromKeySelect"),
    modToKeySelect: byId("modToKeySelect"),
    modPathSelect: byId("modPathSelect"),
    playModulationLabBtn: byId("playModulationLabBtn"),
    modulationLabOutput: byId("modulationLabOutput"),
    saveLabIdeaBtn: byId("saveLabIdeaBtn"),
    savedLabIdeas: byId("savedLabIdeas"),
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
    repertoireFeatured: byId("repertoireFeatured"),
    repertoireFilterChips: byId("repertoireFilterChips"),
    repertoireSearchInput: byId("repertoireSearchInput"),
    repertoireList: byId("repertoireList"),
    repertoireTransport: byId("repertoireTransport"),
    repertoireSelectedTitle: byId("repertoireSelectedTitle"),
    repertoireSelectedMeta: byId("repertoireSelectedMeta"),
    repertoirePlayPauseBtn: byId("repertoirePlayPauseBtn"),
    repertoireStopBtn: byId("repertoireStopBtn"),
    repertoireLoopToggle: byId("repertoireLoopToggle"),
    repertoireLoopStart: byId("repertoireLoopStart"),
    repertoireLoopEnd: byId("repertoireLoopEnd"),
    repertoireLoopLabel: byId("repertoireLoopLabel"),
    repertoireMuteMelodyToggle: byId("repertoireMuteMelodyToggle"),
    repertoireOnlyChordsToggle: byId("repertoireOnlyChordsToggle"),
    repertoireMetronomeToggle: byId("repertoireMetronomeToggle"),
    repertoireShowChordsBtn: byId("repertoireShowChordsBtn"),
    repertoireSuggestedBtn: byId("repertoireSuggestedBtn"),
    repertoireOpenExerciseBtn: byId("repertoireOpenExerciseBtn"),
    repertoireSuggestions: byId("repertoireSuggestions"),
    repertoireInfoModal: byId("repertoireInfoModal"),
    exerciseInstruction: byId("exerciseInstruction"),
    playRelatedStudyBtn: byId("playRelatedStudyBtn"),
    exerciseList: byId("exerciseList"),
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
    theoryResources: byId("theoryResources"),
    authSignInBtn: byId("authSignInBtn"),
    authUserPill: byId("authUserPill"),
    authAvatar: byId("authAvatar"),
    authDisplayName: byId("authDisplayName"),
    authSignOutBtn: byId("authSignOutBtn"),
    profileSection: byId("profileSection"),
    profileAvatar: byId("profileAvatar"),
    profileName: byId("profileName"),
    profileEmail: byId("profileEmail"),
    masteryChords: byId("masteryChords"),
    masteryScales: byId("masteryScales"),
    masteryLessons: byId("masteryLessons"),
    masteryCadences: byId("masteryCadences"),
    badgeGrid: byId("badgeGrid"),
    chordModeSelect: byId("chordModeSelect"),
    chordModeSwitch: byId("chordModeSwitch"),
    paletteTableWrap: byId("paletteTableWrap"),
    circleOfFifthsContainer: byId("circleOfFifthsContainer"),
    cofSvg: byId("cofSvg"),
    cofInfo: byId("cofInfo"),
    cadenceModePanel: byId("cadenceModePanel"),
    cadenceModeButtons: byId("cadenceModeButtons"),
    cadenceGrid: byId("cadenceGrid"),
    scannerUploadZone: byId("scannerUploadZone"),
    scannerFileInput: byId("scannerFileInput"),
    scannerPreview: byId("scannerPreview"),
    scannerCanvas: byId("scannerCanvas"),
    scannerPrevPage: byId("scannerPrevPage"),
    scannerNextPage: byId("scannerNextPage"),
    scannerPageInfo: byId("scannerPageInfo"),
    scannerExtractBtn: byId("scannerExtractBtn"),
    scannerProcessing: byId("scannerProcessing"),
    scannerNotation: byId("scannerNotation"),
    scoreDisplay: byId("scoreDisplay"),
    scannerPlayBtn: byId("scannerPlayBtn"),
    scannerStopBtn: byId("scannerStopBtn"),
    scannerLoopToggle: byId("scannerLoopToggle"),
    scannerSpeedSlider: byId("scannerSpeedSlider"),
    scannerSpeedValue: byId("scannerSpeedValue"),
    scannerAnalysis: byId("scannerAnalysis"),
    analysisKey: byId("analysisKey"),
    analysisTime: byId("analysisTime"),
    analysisTempo: byId("analysisTempo"),
    analysisDifficulty: byId("analysisDifficulty"),
    analysisChordFlow: byId("analysisChordFlow"),
    analysisPatternList: byId("analysisPatternList"),
    scannerSkills: byId("scannerSkills"),
    skillTagsContainer: byId("skillTagsContainer")
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
  populateSelect(el.modFromKeySelect, NOTES);
  populateSelect(el.modToKeySelect, NOTES);
  if (el.modFromKeySelect) el.modFromKeySelect.value = "C";
  if (el.modToKeySelect) el.modToKeySelect.value = "F";
  populateSelect(el.arpTypeSelect, Object.keys(ARP_TYPES));
  populateScaleTypeSelect();

  initializeCompanionPanels();
  syncTempoControls();
  renderTempoControls();
  syncExploreHarmonyControls();

  updateButtonActiveState(el.rootBtnGroup, appState.root);
  updateButtonActiveState(el.qualityBtnGroup, appState.quality);
  updateButtonActiveState(el.inversionBtnGroup, appState.inversion);
  if (el.rootSelect) el.rootSelect.value = appState.root;
  if (el.qualitySelect) el.qualitySelect.value = appState.quality;
  if (el.inversionSelect) el.inversionSelect.value = appState.inversion;
  if (el.cadenceSelect) el.cadenceSelect.value = "Authentic (V-I)";

  renderKeyboard();
  renderPaletteTabButtons();
  renderActivePaletteTable();
  updateExploreHarmonyUi();
  renderProgressionPalette();
  renderProgressionStrip();
  renderCadenceStrip();
  renderLessonTracks();
  renderPracticeLab();
  renderExploreLabs();
  renderTheoryContent();
  renderProgress();
  syncRepertoireControlState();
  updateHighlightLabels();
  updateWindowKeyboardHint();
  updateHighlightGlows();
  bindAudioUnlock();
  void ensureAudio({ resume: false });
  void ensureChordAssetManifest();
  updateAudioStatusText();
  bindEvents();
  renderRepertoireFeatured();
  renderRepertoireFilterChips();
  renderRepertoireList();
  updateExerciseRelatedStudyButton();
  void initRepertoire();
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
      if (stateKey === "quality") {
        setProgressionPaletteFocus(appState.root, appState.quality, "chord");
        currentStudyContext = { type: "chord", root: appState.root, quality: appState.quality };
        renderExploreLabs();
        renderProgressionPalette();
      }
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
  playMidiNotes(midi, { hold: getHoldSeconds(), asChord: true, restrictToWindow: false });
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

function clampTempoBpm(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return appState.tempoBpm;
  return Math.max(30, Math.min(240, Math.round(numeric)));
}

function normalizeSubdivision(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return appState.subdivision;
  const matched = SUBDIVISION_OPTIONS.find((option) => Math.abs(option.value - numeric) < 1e-6);
  return matched ? matched.value : appState.subdivision;
}

function getStepSeconds() {
  return (60 / appState.tempoBpm) * appState.subdivision;
}

function setTempoBpm(nextTempo) {
  appState.tempoBpm = clampTempoBpm(nextTempo);
  renderTempoControls();
  if (repertoireState.isPlaying) {
    alignRepertoirePlaybackClock();
  }
}

function commitTempoInput() {
  if (!el.tempoValue) return;
  const typedValue = el.tempoValue.value;
  if (typedValue === "") {
    renderTempoControls();
    return;
  }
  setTempoBpm(typedValue);
}

function setSubdivision(nextSubdivision) {
  appState.subdivision = normalizeSubdivision(nextSubdivision);
  renderTempoControls();
}

function renderTempoControls() {
  if (el.tempoValue) {
    el.tempoValue.value = String(appState.tempoBpm);
  }
  if (el.subdivisionSelect) {
    el.subdivisionSelect.value = String(appState.subdivision);
  }
  if (repertoireState.selectedItem) {
    updateRepertoireTransportSummary();
  }
}

function syncTempoControls() {
  setTempoBpm(appState.tempoBpm);
  setSubdivision(appState.subdivision);
}

function populateScaleTypeSelect() {
  if (!el.scaleTypeSelect) return;
  el.scaleTypeSelect.innerHTML = "";
  Object.entries(SCALE_PATTERN_LIBRARY).forEach(([value, meta]) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = meta.label;
    el.scaleTypeSelect.appendChild(opt);
  });
  el.scaleTypeSelect.value = "major";
}

function resolveScalePatternKey(rawType) {
  if (!rawType) return "major";
  if (SCALE_PATTERN_LIBRARY[rawType]) return rawType;
  return LEGACY_SCALE_TYPE_TO_PATTERN[rawType] || "major";
}

function scalePatternLabel(patternKey) {
  return SCALE_PATTERN_LIBRARY[patternKey]?.label || SCALE_PATTERN_LIBRARY.major.label;
}

function getSelectedCadenceName() {
  if (el.cadenceSelect?.value) return el.cadenceSelect.value;
  return Object.keys(CADENCES)[0];
}

function setRootContext(root) {
  const rawRoot = String(root || "C").trim();
  const normalizedRoot = normalizePitchClass(rawRoot);
  keyDisplayPreference = rawRoot.includes("b") ? "flat" : "sharp";
  appState.root = normalizedRoot;
  setProgressionPaletteFocus(normalizedRoot, "major", "key");
  if (el.keySelect) el.keySelect.value = normalizedRoot;
  if (el.conceptKeySelect) el.conceptKeySelect.value = normalizedRoot;
  if (el.rootSelect) el.rootSelect.value = normalizedRoot;
  updateButtonActiveState(el.rootBtnGroup, appState.root);
  renderActivePaletteTable();
  renderProgressionStrip();
  renderCadenceStrip();
  renderPersonalizedSequence();
  if (repertoireState.selectedItem) {
    updateRepertoireTransportSummary();
    renderRepertoireSuggestions();
  }
  if (appState.paletteTab === "chords") {
    markChordTableCell(appState.root, appState.quality);
  }
  renderProgressionPalette();
  renderExploreLabs();
  // Refresh Circle of Fifths / Cadences mode if active
  if (appState.chordMode === "circle") {
    renderCircleOfFifths();
    updateChordModeTitle();
  } else if (appState.chordMode === "cadences") {
    renderCadenceCatalog();
    updateChordModeTitle();
  }
}

function renderPaletteTabButtons() {
  if (!el.paletteTabSwitch) return;
  const tabs = el.paletteTabSwitch.querySelectorAll("button[data-palette-tab]");
  tabs.forEach((btn) => {
    const isActive = btn.dataset.paletteTab === appState.paletteTab;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

function syncExploreHarmonyControls() { /* removed */ }
function updateExploreHarmonyUi() { /* removed */ }
function setExploreTensionLabel() { /* removed */ }

function clearExploreTensionLabel() {
  if (!el.exploreTensionLabel) return;
  el.exploreTensionLabel.textContent = "";
  el.exploreTensionLabel.classList.add("is-hidden");
}

function setPaletteTab(tab) {
  const validPaletteTabs = ["chords", "scales", "arpeggios", "modes", "pentatonic", "color", "secondary", "borrowed", "substitution"];
  if (!validPaletteTabs.includes(tab)) return;
  appState.paletteTab = tab;
  stopHarmonyExploration({ withResolution: false, clearLabel: true });
  cancelPaletteSequence();
  renderPaletteTabButtons();
  renderActivePaletteTable();
  updateExploreHarmonyUi();
}

function renderActivePaletteTable() {
  if (appState.paletteTab === "scales") {
    renderScalarPaletteTable("scales");
    return;
  }
  if (appState.paletteTab === "arpeggios") {
    renderArpeggioTable();
    return;
  }
  if (appState.paletteTab === "modes") {
    renderScalarPaletteTable("modes");
    return;
  }
  if (appState.paletteTab === "pentatonic") {
    renderScalarPaletteTable("pentatonic");
    return;
  }
  if (appState.paletteTab === "color") {
    renderScalarPaletteTable("color");
    return;
  }
  if (isHarmonicPaletteTab(appState.paletteTab)) {
    renderHarmonicPaletteTable(appState.paletteTab);
    return;
  }
  renderChordTable();
}

/* ── Chord Mode (Dropdown) Switching ── */

const COF_KEYS_MAJOR = [
  { key: "C", label: "C" },
  { key: "G", label: "G" },
  { key: "D", label: "D" },
  { key: "A", label: "A" },
  { key: "E", label: "E" },
  { key: "B", label: "B" },
  { key: "F#", label: "F#/Gb" },
  { key: "C#", label: "Db/C#" },
  { key: "G#", label: "Ab/G#" },
  { key: "D#", label: "Eb/D#" },
  { key: "A#", label: "Bb/A#" },
  { key: "F", label: "F" }
];
const COF_KEYS_MINOR = ["Am", "Em", "Bm", "F#m", "C#m", "G#m", "D#m/Ebm", "A#m/Bbm", "Fm", "Cm", "Gm", "Dm"];
const FLAT_TO_SHARP_NOTE = {
  Cb: "B",
  Db: "C#",
  Eb: "D#",
  Fb: "E",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#"
};

function normalizePitchClass(note) {
  return FLAT_TO_SHARP_NOTE[String(note || "").trim()] || String(note || "").trim();
}

function displayPitchClass(note, options = {}) {
  const normalized = normalizePitchClass(note);
  const preferFlat = options.preferFlat === true;
  return preferFlat ? (ENHARMONIC_FLAT_MAP[normalized] || normalized) : normalized;
}

function shouldUseFlatKeyDisplay() {
  return keyDisplayPreference === "flat";
}

function currentKeyDisplayName() {
  return displayPitchClass(el.keySelect?.value || appState.root || "C", { preferFlat: shouldUseFlatKeyDisplay() });
}

function cofMajorEntryForKey(key) {
  const normalized = normalizePitchClass(key);
  return COF_KEYS_MAJOR.find((entry) => entry.key === normalized) || COF_KEYS_MAJOR[0];
}

function midiForPitchClass(note, octave = 4) {
  const normalized = normalizePitchClass(note);
  const idx = NOTES.indexOf(normalized);
  if (idx < 0) return 60;
  return 12 * (octave + 1) + idx;
}

function playCircleOfFifthsSelection(root, quality = "major") {
  const normalizedRoot = normalizePitchClass(root);
  const hold = getHoldSeconds();
  if (appState.cofPlayMode === "chord") {
    playMidiNotes(buildChordMidi(normalizedRoot, quality, "root position", 3), {
      hold,
      asChord: true,
      restrictToWindow: false
    });
  } else {
    playMidiNotes([midiForPitchClass(normalizedRoot, 4)], {
      hold: Math.min(0.8, hold),
      asChord: true,
      restrictToWindow: false
    });
  }
}

function setChordMode(mode) {
  if (!["palette", "circle", "cadences"].includes(mode)) return;
  const isModeChange = appState.chordMode !== mode;
  const applyMode = () => applyChordMode(mode);
  if (!isModeChange) {
    applyMode();
    return;
  }
  playChordModeGlissando(appState.chordMode, mode);
  runChordModeTransition(applyMode);
}

function playChordModeGlissando(fromMode, toMode) {
  const modeOrder = ["palette", "circle", "cadences"];
  const fromIndex = modeOrder.indexOf(fromMode);
  const toIndex = modeOrder.indexOf(toMode);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;

  const nowMs = performance.now();
  if (nowMs - lastChordModeGlissAtMs < CHORD_MODE_GLISS_THROTTLE_MS) return;
  lastChordModeGlissAtMs = nowMs;

  const root = el.keySelect?.value || appState.root || "C";
  const rootMidi = midiForPitchClass(root, 5);
  const ascending = toIndex > fromIndex;
  const intervals = ascending ? [0, 2, 4, 7, 12] : [12, 9, 7, 4, 0];
  playMidiNotes(intervals.map((interval) => rootMidi + interval), {
    hold: CHORD_MODE_GLISS_HOLD_SECONDS,
    asChord: false,
    velocity: 0.58,
    restrictToWindow: false,
    sequenceSpacingSeconds: CHORD_MODE_GLISS_SPACING_SECONDS,
    highlight: false
  });
}

function applyChordMode(mode) {
  appState.chordMode = mode;
  if (el.chordModeSelect) el.chordModeSelect.value = mode;
  if (el.chordModeSwitch) {
    el.chordModeSwitch.querySelectorAll("button[data-chord-mode]").forEach((btn) => {
      const isActive = btn.dataset.chordMode === mode;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  // Toggle visibility of the three views
  const showPalette = mode === "palette";
  const showCircle = mode === "circle";
  const showCadences = mode === "cadences";

  if (el.paletteTabSwitch) el.paletteTabSwitch.classList.toggle("is-hidden", !showPalette);
  if (el.paletteTableWrap) el.paletteTableWrap.classList.toggle("is-hidden", !showPalette);
  if (el.progressionPalettePanel) el.progressionPalettePanel.classList.toggle("is-hidden", !showPalette);
  // exploreHarmonyControl removed

  if (el.circleOfFifthsContainer) el.circleOfFifthsContainer.classList.toggle("is-hidden", !showCircle);
  if (el.cadenceModePanel) el.cadenceModePanel.classList.toggle("is-hidden", !showCadences);

  // Update title suffix
  updateChordModeTitle();

  // Render the active view
  if (showCircle) renderCircleOfFifths();
  if (showCadences) renderCadenceCatalog();
}

function runChordModeTransition(updateView) {
  const consolePanel = document.querySelector(".console");
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (!consolePanel || reduceMotion) {
    updateView();
    return;
  }

  if (chordModeTransitionTimer) {
    window.clearTimeout(chordModeTransitionTimer);
    chordModeTransitionTimer = null;
  }

  const beforeHeight = consolePanel.getBoundingClientRect().height;
  removeChordModeTransitionGhost(consolePanel);
  createChordModeTransitionGhost(consolePanel);
  consolePanel.classList.remove("is-view-transitioning");
  getChordModeViewSurfaces().forEach((surface) => surface.classList.remove("console-view-enter"));
  consolePanel.style.height = `${beforeHeight}px`;
  consolePanel.style.overflow = "hidden";
  consolePanel.classList.add("is-view-transitioning");
  void consolePanel.offsetHeight;

  updateView();

  const activeSurfaces = getChordModeViewSurfaces().filter((surface) => !surface.classList.contains("is-hidden"));
  activeSurfaces.forEach((surface, index) => {
    surface.classList.remove("console-view-enter");
    surface.style.setProperty("--surface-delay", `${Math.min(index * 64, 150)}ms`);
    void surface.offsetHeight;
    surface.classList.add("console-view-enter");
  });

  const afterHeight = consolePanel.scrollHeight;
  requestAnimationFrame(() => {
    consolePanel.style.height = `${afterHeight}px`;
  });

  chordModeTransitionTimer = window.setTimeout(() => {
    consolePanel.classList.remove("is-view-transitioning");
    consolePanel.style.height = "";
    consolePanel.style.overflow = "";
    removeChordModeTransitionGhost(consolePanel);
    activeSurfaces.forEach((surface) => {
      surface.classList.remove("console-view-enter");
      surface.style.removeProperty("--surface-delay");
    });
    chordModeTransitionTimer = null;
  }, CHORD_MODE_TRANSITION_CLEANUP_MS);
}

function getChordModeViewSurfaces() {
  return [
    el.paletteTabSwitch,
    el.paletteTableWrap,
    el.progressionPalettePanel,
    el.circleOfFifthsContainer,
    el.cadenceModePanel,
  ].filter(Boolean);
}

function getVisibleChordModeViewSurfaces() {
  return getChordModeViewSurfaces().filter((surface) => {
    if (surface.classList.contains("is-hidden")) return false;
    const rect = surface.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
}

function createChordModeTransitionGhost(consolePanel) {
  const visibleSurfaces = getVisibleChordModeViewSurfaces();
  if (!visibleSurfaces.length) return null;

  const consoleRect = consolePanel.getBoundingClientRect();
  const ghost = document.createElement("div");
  ghost.className = "console-transition-ghost";
  ghost.setAttribute("aria-hidden", "true");

  visibleSurfaces.forEach((surface) => {
    const rect = surface.getBoundingClientRect();
    const clone = surface.cloneNode(true);
    stripInteractiveCloneAttributes(clone);
    clone.classList.remove("console-view-enter");
    clone.classList.add("console-transition-ghost-surface");
    clone.style.left = `${rect.left - consoleRect.left}px`;
    clone.style.top = `${rect.top - consoleRect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    ghost.appendChild(clone);
  });

  consolePanel.appendChild(ghost);
  return ghost;
}

function stripInteractiveCloneAttributes(root) {
  [root, ...root.querySelectorAll("*")].forEach((node) => {
    node.removeAttribute("id");
    node.removeAttribute("for");
    node.removeAttribute("aria-describedby");
    node.removeAttribute("aria-controls");
    node.removeAttribute("aria-labelledby");
    if (["BUTTON", "SELECT", "INPUT", "TEXTAREA", "A"].includes(node.tagName)) {
      node.setAttribute("tabindex", "-1");
    }
  });
}

function removeChordModeTransitionGhost(consolePanel) {
  consolePanel.querySelectorAll(".console-transition-ghost").forEach((ghost) => ghost.remove());
}

function updateChordModeTitle() {
  if (!el.chordTableTitle) return;
  const key = el.keySelect ? el.keySelect.value : "C";
  if (appState.chordMode === "palette") {
    // Title is set by the individual palette renderers — leave it alone
    return;
  }
  if (appState.chordMode === "circle") {
    el.chordTableTitle.textContent = `— Key of ${cofMajorEntryForKey(key).label}`;
  } else if (appState.chordMode === "cadences") {
    el.chordTableTitle.textContent = `in ${key}`;
  }
}

/* ── Circle of Fifths ── */

function renderCircleOfFifths() {
  if (!el.cofSvg) return;
  const activeKey = normalizePitchClass(el.keySelect ? el.keySelect.value : "C");
  const cx = 200, cy = 200;
  const outerR = 170, innerR = 115, coreR = 60;
  const wedgeAngle = (2 * Math.PI) / 12;
  const startOffset = -Math.PI / 2 - wedgeAngle / 2;

  let svgContent = '';

  // Outer ring — major keys
  for (let i = 0; i < 12; i++) {
    const { key, label } = COF_KEYS_MAJOR[i];
    const a1 = startOffset + i * wedgeAngle;
    const a2 = a1 + wedgeAngle;
    const isActive = key === activeKey;

    const x1o = cx + outerR * Math.cos(a1);
    const y1o = cy + outerR * Math.sin(a1);
    const x2o = cx + outerR * Math.cos(a2);
    const y2o = cy + outerR * Math.sin(a2);
    const x1i = cx + innerR * Math.cos(a1);
    const y1i = cy + innerR * Math.sin(a1);
    const x2i = cx + innerR * Math.cos(a2);
    const y2i = cy + innerR * Math.sin(a2);

    const path = `M${x1i},${y1i} L${x1o},${y1o} A${outerR},${outerR} 0 0,1 ${x2o},${y2o} L${x2i},${y2i} A${innerR},${innerR} 0 0,0 ${x1i},${y1i} Z`;
    const cls = `cof-wedge cof-major${isActive ? ' active' : ''}`;
    svgContent += `<path class="${cls}" d="${path}" data-cof-key="${key}" data-cof-quality="major" />`;

    // Label
    const midA = a1 + wedgeAngle / 2;
    const labelR = (outerR + innerR) / 2;
    const lx = cx + labelR * Math.cos(midA);
    const ly = cy + labelR * Math.sin(midA);
    svgContent += `<text class="cof-label cof-label-major${isActive ? ' active' : ''}" x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" data-cof-key="${key}" data-cof-quality="major">${label}</text>`;
  }

  // Inner ring — minor keys
  for (let i = 0; i < 12; i++) {
    const key = COF_KEYS_MINOR[i];
    const majorKey = COF_KEYS_MAJOR[i].key;
    const minorRoot = normalizePitchClass(key.split('/')[0].replace(/m$/, ""));
    const relatedActive = majorKey === activeKey;
    const a1 = startOffset + i * wedgeAngle;
    const a2 = a1 + wedgeAngle;

    const x1o = cx + innerR * Math.cos(a1);
    const y1o = cy + innerR * Math.sin(a1);
    const x2o = cx + innerR * Math.cos(a2);
    const y2o = cy + innerR * Math.sin(a2);
    const x1i = cx + coreR * Math.cos(a1);
    const y1i = cy + coreR * Math.sin(a1);
    const x2i = cx + coreR * Math.cos(a2);
    const y2i = cy + coreR * Math.sin(a2);

    const path = `M${x1i},${y1i} L${x1o},${y1o} A${innerR},${innerR} 0 0,1 ${x2o},${y2o} L${x2i},${y2i} A${coreR},${coreR} 0 0,0 ${x1i},${y1i} Z`;
    const cls = `cof-wedge cof-minor${relatedActive ? ' related' : ''}`;
    svgContent += `<path class="${cls}" d="${path}" data-cof-key="${majorKey}" data-cof-root="${minorRoot}" data-cof-quality="minor" />`;

    const midA = a1 + wedgeAngle / 2;
    const labelR = (innerR + coreR) / 2;
    const lx = cx + labelR * Math.cos(midA);
    const ly = cy + labelR * Math.sin(midA);
    svgContent += `<text class="cof-label cof-label-minor${relatedActive ? ' related' : ''}" x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" data-cof-key="${majorKey}" data-cof-root="${minorRoot}" data-cof-quality="minor">${key}</text>`;
  }

  // Center label
  svgContent += `<circle cx="${cx}" cy="${cy}" r="${coreR}" class="cof-center" />`;
  svgContent += `<text class="cof-center-label" x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central">${activeKey}</text>`;

  el.cofSvg.innerHTML = svgContent;

  // Click handler
  el.cofSvg.onclick = (e) => {
    const target = e.target.closest('[data-cof-key]');
    if (!target) return;
    const rawKey = target.dataset.cofKey;
    const newKey = normalizePitchClass(rawKey);
    const playRoot = normalizePitchClass(target.dataset.cofRoot || newKey);
    const quality = target.dataset.cofQuality === "minor" ? "minor" : "major";
    playCircleOfFifthsSelection(playRoot, quality);
    setRootContext(rawKey);
    renderCircleOfFifths();
    updateChordModeTitle();
    renderCofInfo(newKey);
  };

  document.querySelectorAll('[data-cof-play-mode]').forEach((button) => {
    button.classList.toggle('active', button.dataset.cofPlayMode === appState.cofPlayMode);
    button.onclick = () => {
      appState.cofPlayMode = button.dataset.cofPlayMode === 'chord' ? 'chord' : 'note';
      document.querySelectorAll('[data-cof-play-mode]').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.cofPlayMode === appState.cofPlayMode);
      });
    };
  });

  renderCofInfo(activeKey);
}

function renderCofInfo(key) {
  if (!el.cofInfo) return;
  const normalizedKey = normalizePitchClass(key);
  const scaleSteps = [0, 2, 4, 5, 7, 9, 11];
  const keyIdx = NOTES.indexOf(normalizedKey);
  if (keyIdx < 0) return;
  const keyLabel = cofMajorEntryForKey(normalizedKey).label;

  const romanNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
  const chordQualities = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'];

  const diatonicChords = scaleSteps.map((step, i) => {
    const note = NOTES[(keyIdx + step) % 12];
    return { numeral: romanNumerals[i], note, quality: chordQualities[i] };
  });

  const fifthIdx = (keyIdx + 7) % 12;
  const fourthIdx = (keyIdx + 5) % 12;
  const relMinIdx = (keyIdx + 9) % 12;

  el.cofInfo.innerHTML = `
    <div class="cof-info-grid">
      <div class="cof-info-block">
        <h4>Diatonic Chords in ${keyLabel} Major</h4>
        <div class="cof-chord-chips">
          ${diatonicChords.map(c => `<button class="cof-chord-chip" data-cof-play-chord="${c.note}" data-cof-play-quality="${c.quality}" type="button"><span class="cof-numeral">${c.numeral}</span><span class="cof-note">${c.note}</span></button>`).join('')}
        </div>
      </div>
      <div class="cof-info-block">
        <h4>Key Relationships</h4>
        <ul class="cof-relationships">
          <li><strong>Dominant (V):</strong> ${cofMajorEntryForKey(NOTES[fifthIdx]).label}</li>
          <li><strong>Subdominant (IV):</strong> ${cofMajorEntryForKey(NOTES[fourthIdx]).label}</li>
          <li><strong>Relative Minor:</strong> ${NOTES[relMinIdx]}m</li>
        </ul>
      </div>
    </div>
  `;

  // Chord chip click to play
  el.cofInfo.querySelectorAll('.cof-chord-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const root = chip.dataset.cofPlayChord;
      const quality = chip.dataset.cofPlayQuality;
      const midiNotes = buildChordMidi(normalizePitchClass(root), quality, 'root position');
      playMidiNotes(midiNotes, { hold: getHoldSeconds(), asChord: true, restrictToWindow: false });
    });
  });
}

/* ── Cadences Mode ── */

/* ── Modal Cadence Engine ── */

const IONIAN_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

function getModalIntervals(mode) {
  // Mode 1 = Ionian, 2 = Dorian, ... 7 = Locrian
  // Rotate the Ionian intervals so the mode's root becomes 0
  const offset = IONIAN_INTERVALS[mode - 1];
  return IONIAN_INTERVALS.map(i => ((i - offset) + 12) % 12).sort((a, b) => a - b);
}

function buildModalDiatonicChord(key, mode, degree, qualityOverride) {
  // degree is 0-based scale degree in the current mode
  const intervals = getModalIntervals(mode);
  const keyIdx = NOTES.indexOf(key);

  // Root of this degree
  const rootSemitone = intervals[degree % 7];
  const root = NOTES[(keyIdx + rootSemitone) % 12];

  // Determine quality from interval stacking (3rd and 5th above this degree)
  let quality;
  if (qualityOverride) {
    quality = qualityOverride;
  } else {
    const third = ((intervals[(degree + 2) % 7] - rootSemitone) + 12) % 12;
    const fifth = ((intervals[(degree + 4) % 7] - rootSemitone) + 12) % 12;
    if (third === 4 && fifth === 7) quality = "major";
    else if (third === 3 && fifth === 7) quality = "minor";
    else if (third === 3 && fifth === 6) quality = "diminished";
    else if (third === 4 && fifth === 8) quality = "augmented";
    else quality = "major";
  }

  const midi = buildChordMidi(root, quality, "root position", 3);
  return {
    root,
    quality,
    degree,
    symbol: chordSymbol(root, quality),
    midi,
    degreeLabel: degree + 1
  };
}

// Template format: each cadence is an array of {deg, q?} objects
// deg = 0-based scale degree, q = optional quality override
// Last element is always degree 0 (tonic resolution)

const MODE_CADENCE_TEMPLATES = {
  // Ionian (major) — richest cadence vocabulary
  1: [
    [{ deg: 3 }, { deg: 4 }, { deg: 0 }],                           // IV-V-I
    [{ deg: 4 }, { deg: 4, q: "dom7" }, { deg: 0 }],                  // V-V7-I
    [{ deg: 3 }, { deg: 4, q: "dom7" }, { deg: 0 }],                  // IV-V7-I
    [{ deg: 3 }, { deg: 3, q: "sus2" }, { deg: 0 }],                  // IV-IVsus2-I
    [{ deg: 1, q: "min7" }, { deg: 4, q: "dom7" }, { deg: 0 }],         // ii7-V7-I
    [{ deg: 1, q: "dom7" }, { deg: 4, q: "dom7" }, { deg: 0 }],         // II7-V7-I (secondary dom)
    [{ deg: 4 }, { deg: 6, q: "diminished" }, { deg: 0 }],             // V-vii°-I
    [{ deg: 4, q: "sus4" }, { deg: 4, q: "dom7" }, { deg: 0 }],         // Vsus4-V7-I
    [{ deg: 5 }, { deg: 4 }, { deg: 0 }],                            // vi-V-I
    [{ deg: 3 }, { deg: 3, q: "minor" }, { deg: 0 }],                  // IV-iv-I (borrowed iv)
    [{ deg: 5, q: "major" }, { deg: 3 }, { deg: 0 }],                  // bVI-IV-I (modal mix)
    [{ deg: 5, q: "major" }, { deg: 6, q: "major" }, { deg: 0 }],        // bVI-bVII-I
    [{ deg: 5, q: "maj7" }, { deg: 5, q: "major" }, { deg: 0 }],         // vi(b6)maj7-bVI-I
    [{ deg: 1, q: "diminished" }, { deg: 4, q: "dom7" }, { deg: 0 }]     // ii°-V7-I (chromatic)
  ],

  // Dorian (minor with natural 6th)
  2: [
    [{ deg: 3, q: "major" }, { deg: 4, q: "minor" }, { deg: 0 }],       // IV-v-i
    [{ deg: 2, q: "major" }, { deg: 6, q: "major" }, { deg: 0 }],        // bIII-bVII-i
    [{ deg: 5, q: "major" }, { deg: 6, q: "major" }, { deg: 0 }],        // bVI-bVII-i
    [{ deg: 5, q: "maj7" }, { deg: 5, q: "major" }, { deg: 0 }],         // bVImaj7-bVI-i
    [{ deg: 4, q: "minor" }, { deg: 4, q: "major" }, { deg: 0 }],        // v-V-i (borrowed V)
    [{ deg: 1, q: "diminished" }, { deg: 4, q: "dom7" }, { deg: 0 }]     // ii°-V7-i
  ],

  // Phrygian (minor with b2)
  3: [
    [{ deg: 1, q: "major" }, { deg: 6, q: "major" }, { deg: 0 }],        // bII-bVII-i
    [{ deg: 5, q: "major" }, { deg: 1, q: "major" }, { deg: 0 }],        // bVI-bII-i
    [{ deg: 6, q: "major" }, { deg: 1, q: "major" }, { deg: 0 }],        // bVII-bII-i
    [{ deg: 3, q: "major" }, { deg: 1, q: "major" }, { deg: 0 }]         // IV-bII-i (Phrygian cadence)
  ],

  // Lydian (major with #4)
  4: [
    [{ deg: 1, q: "major" }, { deg: 4 }, { deg: 0 }],                  // II-V-I
    [{ deg: 4 }, { deg: 4, q: "dom7" }, { deg: 0 }],                   // V-V7-I
    [{ deg: 1, q: "major" }, { deg: 4, q: "dom7" }, { deg: 0 }],         // II-V7-I
    [{ deg: 3, q: "minor" }, { deg: 4 }, { deg: 0 }],                  // iv-V-I
    [{ deg: 1, q: "dom7" }, { deg: 4, q: "dom7" }, { deg: 0 }],          // II7-V7-I
    [{ deg: 6 }, { deg: 4 }, { deg: 0 }],                             // vii-V-I
    [{ deg: 3, q: "diminished" }, { deg: 4 }, { deg: 0 }],              // #iv°-V-I
    [{ deg: 5 }, { deg: 4 }, { deg: 0 }],                             // vi-V-I
    [{ deg: 1, q: "major" }, { deg: 1, q: "sus2" }, { deg: 0 }],         // II-IIsus2-I
    [{ deg: 4, q: "sus4" }, { deg: 4, q: "dom7" }, { deg: 0 }],          // Vsus4-V7-I
    [{ deg: 5, q: "major" }, { deg: 4 }, { deg: 0 }],                  // bVI-V-I
    [{ deg: 5, q: "major" }, { deg: 6, q: "major" }, { deg: 0 }],        // bVI-bVII-I
    [{ deg: 2 }, { deg: 4, q: "dom7" }, { deg: 0 }],                   // iii-V7-I
    [{ deg: 1, q: "diminished" }, { deg: 4, q: "dom7" }, { deg: 0 }]     // ii°-V7-I
  ],

  // Mixolydian (major with b7)
  5: [
    [{ deg: 6, q: "major" }, { deg: 4 }, { deg: 0 }],                  // bVII-V-I
    [{ deg: 3 }, { deg: 4 }, { deg: 0 }],                             // IV-V-I
    [{ deg: 6, q: "major" }, { deg: 3 }, { deg: 0 }],                  // bVII-IV-I
    [{ deg: 4 }, { deg: 4, q: "dom7" }, { deg: 0 }],                   // V-V7-I (borrowed leading tone)
    [{ deg: 1 }, { deg: 4 }, { deg: 0 }],                             // ii-V-I
    [{ deg: 3 }, { deg: 6, q: "major" }, { deg: 0 }],                  // IV-bVII-I
    [{ deg: 5 }, { deg: 6, q: "major" }, { deg: 0 }],                  // vi-bVII-I
    [{ deg: 5, q: "major" }, { deg: 6, q: "major" }, { deg: 0 }],        // bVI-bVII-I
    [{ deg: 1, q: "min7" }, { deg: 4, q: "dom7" }, { deg: 0 }],          // ii7-V7-I
    [{ deg: 6, q: "major" }, { deg: 0 }]                           // bVII-I (modal)
  ],

  // Aeolian (natural minor)
  6: [
    [{ deg: 3, q: "major" }, { deg: 4, q: "minor" }, { deg: 0 }],       // IV-v-i
    [{ deg: 5, q: "major" }, { deg: 6, q: "major" }, { deg: 0 }],        // bVI-bVII-i
    [{ deg: 2, q: "major" }, { deg: 6, q: "major" }, { deg: 0 }],        // bIII-bVII-i
    [{ deg: 5, q: "major" }, { deg: 3, q: "major" }, { deg: 0 }],        // bVI-IV-i
    [{ deg: 4, q: "minor" }, { deg: 4, q: "major" }, { deg: 0 }],        // v-V-i (borrowed V)
    [{ deg: 1, q: "diminished" }, { deg: 4, q: "dom7" }, { deg: 0 }]     // ii°-V7-i (harmonic minor)
  ],

  // Locrian — diminished tonic, no stable cadences
  7: []
};

function generateModalCadences(key, mode) {
  const templates = MODE_CADENCE_TEMPLATES[mode] || [];
  return templates.map(template => {
    return template.map(step => buildModalDiatonicChord(key, mode, step.deg, step.q || null));
  });
}

function renderCadenceCatalog() {
  if (!el.cadenceGrid) return;
  const key = el.keySelect ? el.keySelect.value : "C";
  const mode = appState.cadenceMode;

  // Update mode buttons
  if (el.cadenceModeButtons) {
    el.cadenceModeButtons.querySelectorAll('.cadence-mode-btn').forEach(btn => {
      const isActive = parseInt(btn.dataset.cadenceMode) === mode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  const cadences = generateModalCadences(key, mode);

  if (cadences.length === 0) {
    el.cadenceGrid.innerHTML = `
      <div class="cadence-empty">
        <p>No cadences for Mode ${mode} (Locrian)</p>
        <p class="cadence-empty-sub">The diminished tonic prevents stable cadential resolution.</p>
      </div>
    `;
    return;
  }

  // Build grid: 4 cadences per visual row
  let html = '<div class="cadence-row-wrap">';
  cadences.forEach((cadence, cadIdx) => {
    html += `<div class="cadence-sequence" data-cadence-idx="${cadIdx}">`;
    cadence.forEach((chord, chordIdx) => {
      const isTonic = chordIdx === cadence.length - 1;
      const cls = `cadence-cell${isTonic ? ' cadence-tonic' : ''}`;
      html += `<button class="${cls}" data-cadence-idx="${cadIdx}" data-chord-idx="${chordIdx}" type="button">
        <span class="cadence-cell-symbol">${chord.symbol}</span>
        <span class="cadence-cell-degree">${chord.degreeLabel}</span>
      </button>`;
    });
    html += '</div>';
  });
  html += '</div>';

  el.cadenceGrid.innerHTML = html;

  // Wire individual cell clicks (play single chord)
  el.cadenceGrid.querySelectorAll('.cadence-cell').forEach(cell => {
    cell.addEventListener('click', (e) => {
      e.stopPropagation();
      const cIdx = parseInt(cell.dataset.cadenceIdx);
      const chIdx = parseInt(cell.dataset.chordIdx);
      const chord = cadences[cIdx]?.[chIdx];
      if (chord) {
        playMidiNotes(chord.midi, { hold: getHoldSeconds(), asChord: true, restrictToWindow: false });
      }
    });
  });

  // Wire sequence clicks (play full cadence) — on the sequence container
  el.cadenceGrid.querySelectorAll('.cadence-sequence').forEach(seq => {
    seq.addEventListener('click', async (e) => {
      // Only play sequence if clicking the background, not a cell
      if (e.target.closest('.cadence-cell')) return;
      const cIdx = parseInt(seq.dataset.cadenceIdx);
      const cadence = cadences[cIdx];
      if (!cadence) return;
      const hold = getHoldSeconds();
      // Highlight sequence
      seq.classList.add('playing');
      for (let i = 0; i < cadence.length; i++) {
        playMidiNotes(cadence[i].midi, { hold, asChord: true, restrictToWindow: false });
        await wait(Math.max(220, hold * 560));
      }
      seq.classList.remove('playing');
      trackRep("progressions", `Mode${mode} ${key} cadence`);
    });
  });
}

function openKeyCenterDrawer() {
  if (!el.keyCenterDrawer) return;
  document.body.classList.add("practice-setup-open");
  if (keyCenterBackdropHideTimer) {
    window.clearTimeout(keyCenterBackdropHideTimer);
    keyCenterBackdropHideTimer = null;
  }
  el.keyCenterDrawer.classList.add("is-open");
  el.keyCenterDrawer.setAttribute("aria-hidden", "false");
  if (el.openKeyCenterBtn) {
    el.openKeyCenterBtn.setAttribute("aria-expanded", "true");
    el.openKeyCenterBtn.setAttribute("aria-label", "Close quick controls panel");
  }
  if (el.keyCenterDrawerBackdrop) {
    el.keyCenterDrawerBackdrop.hidden = false;
    requestAnimationFrame(() => {
      el.keyCenterDrawerBackdrop.classList.add("is-open");
    });
  }
}

function closeKeyCenterDrawer() {
  if (!el.keyCenterDrawer) return;
  document.body.classList.remove("practice-setup-open");
  el.keyCenterDrawer.classList.remove("is-open");
  el.keyCenterDrawer.setAttribute("aria-hidden", "true");
  if (el.openKeyCenterBtn) {
    el.openKeyCenterBtn.setAttribute("aria-expanded", "false");
    el.openKeyCenterBtn.setAttribute("aria-label", "Open quick controls panel");
  }
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

function clampKeyCenterTabTop(top) {
  if (!el.openKeyCenterBtn) return top;
  const rect = el.openKeyCenterBtn.getBoundingClientRect();
  const minTop = 72;
  const maxTop = Math.max(minTop, window.innerHeight - rect.height - 18);
  return Math.max(minTop, Math.min(maxTop, top));
}

function setKeyCenterTabTop(top, persist = false) {
  if (!el.openKeyCenterBtn) return;
  const nextTop = clampKeyCenterTabTop(top);
  el.openKeyCenterBtn.style.setProperty("--key-center-tab-top", `${Math.round(nextTop)}px`);
  if (persist) {
    safeStorageSet(KEY_CENTER_TAB_POSITION_KEY, String(Math.round(nextTop)));
  }
}

function restoreKeyCenterTabPosition() {
  if (!el.openKeyCenterBtn) return;
  const savedValue = safeStorageGet(KEY_CENTER_TAB_POSITION_KEY);
  if (savedValue === null) return;
  const savedTop = Number(savedValue);
  if (Number.isFinite(savedTop)) {
    setKeyCenterTabTop(savedTop, false);
  }
}

function beginKeyCenterTabDrag(event) {
  if (!el.openKeyCenterBtn || event.button !== 0) return;
  const rect = el.openKeyCenterBtn.getBoundingClientRect();
  keyCenterTabDrag = {
    pointerId: event.pointerId,
    startY: event.clientY,
    startTop: rect.top,
    moved: false,
  };
  el.openKeyCenterBtn.setPointerCapture?.(event.pointerId);
  el.openKeyCenterBtn.classList.add("is-dragging");
}

function moveKeyCenterTabDrag(event) {
  if (!keyCenterTabDrag || event.pointerId !== keyCenterTabDrag.pointerId) return;
  const deltaY = event.clientY - keyCenterTabDrag.startY;
  if (Math.abs(deltaY) > 4) {
    keyCenterTabDrag.moved = true;
    suppressKeyCenterToggleClick = true;
  }
  if (!keyCenterTabDrag.moved) return;
  event.preventDefault();
  setKeyCenterTabTop(keyCenterTabDrag.startTop + deltaY);
}

function endKeyCenterTabDrag(event) {
  if (!keyCenterTabDrag || event.pointerId !== keyCenterTabDrag.pointerId) return;
  const didMove = keyCenterTabDrag.moved;
  keyCenterTabDrag = null;
  el.openKeyCenterBtn?.classList.remove("is-dragging");
  el.openKeyCenterBtn?.releasePointerCapture?.(event.pointerId);
  if (didMove && el.openKeyCenterBtn) {
    setKeyCenterTabTop(el.openKeyCenterBtn.getBoundingClientRect().top, true);
    window.setTimeout(() => {
      suppressKeyCenterToggleClick = false;
    }, 0);
  }
}

function syncKeyCenterTabToViewport() {
  if (!el.openKeyCenterBtn) return;
  setKeyCenterTabTop(el.openKeyCenterBtn.getBoundingClientRect().top);
}

function toggleKeyCenterDrawer() {
  if (el.keyCenterDrawer?.classList.contains("is-open")) {
    closeKeyCenterDrawer();
    return;
  }
  openKeyCenterDrawer();
}

function bindEvents() {
  if (el.tempoMinusBtn) {
    el.tempoMinusBtn.addEventListener("click", () => {
      setTempoBpm(appState.tempoBpm - 1);
    });
  }

  if (el.tempoPlusBtn) {
    el.tempoPlusBtn.addEventListener("click", () => {
      setTempoBpm(appState.tempoBpm + 1);
    });
  }

  if (el.tempoValue) {
    el.tempoValue.addEventListener("change", commitTempoInput);
    el.tempoValue.addEventListener("blur", commitTempoInput);
    el.tempoValue.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        commitTempoInput();
        el.tempoValue.blur();
      }
      if (event.key === "Escape") {
        renderTempoControls();
        el.tempoValue.blur();
      }
    });
  }

  if (el.subdivisionSelect) {
    el.subdivisionSelect.addEventListener("change", () => {
      setSubdivision(Number(el.subdivisionSelect.value));
    });
  }

  if (el.paletteTabSwitch) {
    el.paletteTabSwitch.addEventListener("click", (event) => {
      const tabButton = event.target.closest("button[data-palette-tab]");
      if (!tabButton) return;
      setPaletteTab(tabButton.dataset.paletteTab);
    });
  }

  if (el.chordModeSelect) {
    el.chordModeSelect.addEventListener("change", () => {
      setChordMode(el.chordModeSelect.value);
    });
  }

  if (el.chordModeSwitch) {
    el.chordModeSwitch.addEventListener("click", (event) => {
      const modeButton = event.target.closest("button[data-chord-mode]");
      if (!modeButton) return;
      setChordMode(modeButton.dataset.chordMode);
    });
  }

  if (el.cadenceModeButtons) {
    el.cadenceModeButtons.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-cadence-mode]");
      if (!btn) return;
      appState.cadenceMode = parseInt(btn.dataset.cadenceMode);
      renderCadenceCatalog();
    });
  }

  // Explore harmony removed

  el.playProgressionBtn.addEventListener("click", async () => {
    const context = getProgressionPaletteContext();
    const voicingMode = getProgressionVoicingMode();
    const progression = buildProgressionChords(context, el.progressionSelect.value, voicingMode);
    const hold = getHoldSeconds();
    for (let i = 0; i < progression.length; i += 1) {
      const step = progression[i];
      activateProgressionStep(i);
      playMidiNotes(step.midi, { hold, asChord: true, restrictToWindow: false });
      await wait(Math.max(220, hold * 560));
    }
    clearProgressionStep();
    el.progressionOutput.textContent = `Played ${el.progressionSelect.value} in ${context.label} (${progressionVoicingLabel(voicingMode)}): ${progression.map((s) => s.name).join(" -> ")}`;
    trackRep("progressions", `${context.label} ${el.progressionSelect.value}`);
  });

  if (el.progressionPaletteGrid) {
    el.progressionPaletteGrid.addEventListener("click", (event) => {
      const card = event.target.closest("button[data-progression-name]");
      if (!card) return;
      void playProgressionPaletteItem(card.dataset.progressionName);
    });
  }

  if (el.progressionPaletteTabs) {
    el.progressionPaletteTabs.addEventListener("click", (event) => {
      const tab = event.target.closest("button[data-progression-group]");
      if (!tab) return;
      activeProgressionPaletteGroupId = tab.dataset.progressionGroup || "pop";
      progressionPalettePlayToken += 1;
      clearProgressionStep();
      renderProgressionPalette();
    });
  }

  if (el.progressionVoicingSelect) {
    el.progressionVoicingSelect.addEventListener("change", () => {
      progressionPalettePlayToken += 1;
      clearProgressionStep();
      renderProgressionStrip();
      renderProgressionPalette();
    });
  }

  if (el.progressionStyleSelect) {
    el.progressionStyleSelect.addEventListener("change", () => {
      progressionPalettePlayToken += 1;
      clearProgressionStep();
      renderProgressionPalette();
    });
  }

  if (el.playCadenceBtn) {
    el.playCadenceBtn.addEventListener("click", async () => {
      const cadenceName = getSelectedCadenceName();
      const cadence = buildCadenceChords(el.keySelect.value, cadenceName);
      const hold = getHoldSeconds();
      for (let i = 0; i < cadence.length; i += 1) {
        const step = cadence[i];
        activateCadenceStep(i);
        playMidiNotes(step.midi, { hold, asChord: true, restrictToWindow: false });
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
    restoreKeyCenterTabPosition();
    el.openKeyCenterBtn.addEventListener("pointerdown", beginKeyCenterTabDrag);
    el.openKeyCenterBtn.addEventListener("pointermove", moveKeyCenterTabDrag);
    el.openKeyCenterBtn.addEventListener("pointerup", endKeyCenterTabDrag);
    el.openKeyCenterBtn.addEventListener("pointercancel", endKeyCenterTabDrag);
    window.addEventListener("resize", syncKeyCenterTabToViewport);
    el.openKeyCenterBtn.addEventListener("click", (event) => {
      if (suppressKeyCenterToggleClick) {
        event.preventDefault();
        event.stopPropagation();
        suppressKeyCenterToggleClick = false;
        return;
      }
      toggleKeyCenterDrawer();
    });
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
      setProgressionPaletteFocus(appState.root, appState.quality, "chord");
      currentStudyContext = { type: "chord", root: appState.root, quality: appState.quality };
      renderProgressionPalette();
      renderExploreLabs();
    });
  }

  if (el.inversionSelect) {
    el.inversionSelect.addEventListener("change", () => {
      appState.inversion = el.inversionSelect.value;
      updateButtonActiveState(el.inversionBtnGroup, appState.inversion);
    });
  }

  el.progressionSelect.addEventListener("change", () => {
    currentStudyContext = { type: "progression", name: el.progressionSelect.value };
    renderProgressionStrip();
    renderProgressionPalette();
    renderPersonalizedSequence();
    renderExploreLabs();
  });

  if (el.highlightStartLeft) {
    el.highlightStartLeft.addEventListener("input", () => {
      syncHighlightWindowControls();
      clearKeyboardHighlights();
      updateHighlightLabels();
      updateHighlightGlows();
    });
  }
  if (el.highlightStartRight) {
    el.highlightStartRight.addEventListener("input", () => {
      syncHighlightWindowControls();
      clearKeyboardHighlights();
      updateHighlightLabels();
      updateHighlightGlows();
    });
  }

  if (el.highlightWindowTrack) {
    const beginDrag = (hand) => (event) => {
      event.preventDefault();
      event.stopPropagation();
      highlightDragHand = hand;
      const glowEl = hand === "left" ? el.highlightGlowLeft : el.highlightGlowRight;
      const glowRect = glowEl?.getBoundingClientRect();
      if (glowRect && glowRect.width > 0 && glowEl.contains(event.target)) {
        const grabRatio = Math.min(1, Math.max(0, (event.clientX - glowRect.left) / glowRect.width));
        highlightDragOffsetSemitones = grabRatio * HIGHLIGHT_WINDOW_SPAN_SEMITONES;
      }
      setHighlightFromClientX(hand, event.clientX);
      window.addEventListener("pointermove", onHighlightPointerMove);
      window.addEventListener("pointerup", endHighlightDrag);
      window.addEventListener("pointercancel", endHighlightDrag);
    };
    /* track click: pick closest hand */
    el.highlightWindowTrack.addEventListener("pointerdown", (event) => {
      syncHighlightWindowControls();
      const rect = el.highlightWindowTrack.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = (event.clientX - rect.left) / rect.width;
      const leftVal = el.highlightStartLeft ? Number(el.highlightStartLeft.value) : 48;
      const rightVal = el.highlightStartRight ? Number(el.highlightStartRight.value) : 60;
      const leftNorm = (leftVal - KEYBOARD_FIRST_MIDI) / (KEYBOARD_LAST_MIDI - KEYBOARD_FIRST_MIDI);
      const rightNorm = (rightVal - KEYBOARD_FIRST_MIDI) / (KEYBOARD_LAST_MIDI - KEYBOARD_FIRST_MIDI);
      const hand = Math.abs(ratio - leftNorm) < Math.abs(ratio - rightNorm) ? "left" : "right";
      highlightDragOffsetSemitones = HIGHLIGHT_WINDOW_SPAN_SEMITONES / 2;
      beginDrag(hand)(event);
    });
    if (el.highlightGlowLeft) el.highlightGlowLeft.addEventListener("pointerdown", beginDrag("left"));
    if (el.highlightGlowRight) el.highlightGlowRight.addEventListener("pointerdown", beginDrag("right"));
    window.addEventListener("resize", updateHighlightGlows);
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
    dismissChordHomeOverlay();
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
    if (appState.paletteTab !== "chords") return;
    if (appState.isExploring) {
      stopHarmonyExploration({ withResolution: false, clearLabel: true });
    }
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
    const midi = buildChordMidiForPaletteCell(cell, "root position", 3);
    const restrictedMidi = normalizeMidiCollection(midi);
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
    clearChordTableSelection();
    cell.classList.add("is-selected");
    setProgressionPaletteFocus(root, quality, "chord");
    currentStudyContext = { type: "chord", root, quality, label };
    renderProgressionPalette();
    renderExploreLabs();
    highlightKeyboardHold(midi, false);
    showChordTransitionDiff(chordTransitionDiff);
    el.chordDisplay.textContent = `Palette chord armed: ${label} (release to play)`;

    let pointerIsDown = true;
    let explorationTriggered = false;
    let holdExploreTimerId = null;
    let homeOverlayTriggered = false;
    let homeOverlayTimerId = window.setTimeout(() => {
      if (!pointerIsDown) return;
      homeOverlayTriggered = true;
      clearChordDiffPreview();
      showChordHomeOverlay(cell, { root, quality, label, midi });
    }, CHORD_HOME_HOLD_MS);
    if (false) { // exploreHarmonyEnabled removed
      appState.exploreStartTime = Date.now();
      holdExploreTimerId = window.setTimeout(() => {
        if (!pointerIsDown) return;
        if (holdExploreTimerId !== null) {
          clearExploreTimer(holdExploreTimerId);
          holdExploreTimerId = null;
        }
        explorationTriggered = true;
        beginHarmonyExploration({ root, quality, midi, label });
      }, EXPLORATION_HOLD_THRESHOLD_MS);
      registerExploreTimer(holdExploreTimerId, "timeout");
    }

    const pointerId = event.pointerId;
    const onRelease = (releaseEvent) => {
      if (releaseEvent.pointerId !== pointerId) return;
      pointerIsDown = false;
      cleanupPointerHandlers();
      if (holdExploreTimerId !== null) {
        clearExploreTimer(holdExploreTimerId);
        holdExploreTimerId = null;
      }
      if (homeOverlayTimerId !== null) {
        window.clearTimeout(homeOverlayTimerId);
        homeOverlayTimerId = null;
      }
      clearChordDiffPreview();
      if (homeOverlayTriggered) {
        lastRestrictedChordWindowMidi = restrictedMidi;
        lastChordPaletteSelectionAtMs = performance.now();
        el.chordDisplay.textContent = `Home options for ${label}: choose a center from the wheel.`;
        trackRep("chords", `${label} home options`);
        return;
      }
      if (explorationTriggered || appState.isExploring) {
        const exploredLongEnough = (Date.now() - appState.exploreStartTime) >= EXPLORATION_HOLD_THRESHOLD_MS;
        stopHarmonyExploration({ withResolution: exploredLongEnough, clearLabel: true });
        lastRestrictedChordWindowMidi = restrictedMidi;
        lastChordPaletteSelectionAtMs = performance.now();
        el.chordDisplay.textContent = `Palette chord: ${label}`;
        trackRep("chords", label);
        return;
      }
      const hold = getHoldSeconds();
      playMidiNotes(midi, { hold, asChord: true, highlightMs: getHighlightMs(hold), restrictToWindow: false });
      lastRestrictedChordWindowMidi = restrictedMidi;
      lastChordPaletteSelectionAtMs = performance.now();
      el.chordDisplay.textContent = `Palette chord: ${label}`;
      trackRep("chords", label);
    };

    const onCancel = (cancelEvent) => {
      if (cancelEvent.pointerId !== pointerId) return;
      pointerIsDown = false;
      cleanupPointerHandlers();
      if (holdExploreTimerId !== null) {
        clearExploreTimer(holdExploreTimerId);
        holdExploreTimerId = null;
      }
      if (homeOverlayTimerId !== null) {
        window.clearTimeout(homeOverlayTimerId);
        homeOverlayTimerId = null;
      }
      if (explorationTriggered || appState.isExploring) {
        stopHarmonyExploration({ withResolution: false, clearLabel: true });
      }
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

  el.chordTableHead.addEventListener("click", (event) => {
    const trigger = event.target.closest(".axis-play-col");
    if (!trigger) return;
    const columnIndex = Number(trigger.dataset.columnIndex);
    if (!Number.isInteger(columnIndex) || columnIndex < 0) return;
    if (["scales", "modes", "pentatonic", "color"].includes(appState.paletteTab)) {
      const rows = Array.from(el.chordTableBody.querySelectorAll("tr"));
      const cells = rows.map((row) => {
        const scalarCells = row.querySelectorAll("td[data-scale-note]");
        return scalarCells[columnIndex] || null;
      }).filter(Boolean);
      void playScalarPaletteCellSequence(cells, `Column ${trigger.dataset.columnRoman || String(columnIndex + 1)}`);
      return;
    }
    if (isHarmonicPaletteTab(appState.paletteTab)) {
      const rows = Array.from(el.chordTableBody.querySelectorAll("tr"));
      const cells = rows.map((row) => {
        const harmonicCells = row.querySelectorAll("td");
        const candidate = harmonicCells[columnIndex] || null;
        if (!candidate || !candidate.dataset?.harmonyEvent) return null;
        return candidate;
      }).filter(Boolean);
      void playHarmonicPaletteCellSequence(cells, `${trigger.dataset.columnRoman || `Column ${columnIndex + 1}`}`.trim());
      return;
    }
    const rows = Array.from(el.chordTableBody.querySelectorAll("tr"));
    const cells = rows.map((row) => {
      const chordCells = row.querySelectorAll("td[data-root][data-quality]");
      return chordCells[columnIndex] || null;
    }).filter(Boolean);
    if (appState.paletteTab === "arpeggios") {
      void playArpeggioTableCellSequence(cells, `Arpeggio Column ${trigger.dataset.columnRoman || ""}`.trim());
      return;
    }
    void playChordTableCellSequence(cells, `Column ${trigger.dataset.columnRoman || ""}`.trim());
  });

  el.chordTableBody.addEventListener("click", (event) => {
    const trigger = event.target.closest(".axis-play-row");
    if (trigger) {
      const paletteRowId = trigger.dataset.paletteRowId;
      const paletteTab = trigger.dataset.paletteTab;
      if (paletteRowId && paletteTab && ["scales", "modes", "pentatonic", "color"].includes(paletteTab)) {
        void playScalarPaletteRow(paletteTab, paletteRowId);
        return;
      }
      if (paletteRowId && paletteTab && isHarmonicPaletteTab(paletteTab)) {
        const row = trigger.closest("tr");
        if (!row) return;
        const cells = Array.from(row.querySelectorAll("td[data-harmony-event]"));
        void playHarmonicPaletteCellSequence(cells, `${trigger.dataset.rowName || "Harmony"} in ${el.keySelect.value}`);
        return;
      }
      const row = trigger.closest("tr");
      if (!row) return;
      const cells = Array.from(row.querySelectorAll("td[data-root][data-quality]"));
      if (appState.paletteTab === "arpeggios") {
        void playArpeggioTableCellSequence(cells, `Arpeggio Row ${trigger.dataset.rowName || ""}`.trim());
        return;
      }
      void playChordTableCellSequence(cells, `Row ${trigger.dataset.rowName || ""}`.trim());
      return;
    }

    if (isHarmonicPaletteTab(appState.paletteTab)) {
      const cell = event.target.closest("td[data-harmony-event]");
      if (!cell) return;
      const token = ++paletteSequenceToken;
      void playHarmonicPaletteCell(cell, { sequenceToken: token, updateOutput: true }).then((payload) => {
        if (!payload) {
          console.warn("[HarmonicPalette] playHarmonicPaletteCell returned null — audio engine may not be ready or cell has no event payload.");
          return;
        }
        if (token !== paletteSequenceToken) return;
        const label = payload.eventPayload?.label;
        if (el.chordDisplay && label) {
          el.chordDisplay.textContent = label;
        }
        if (label) trackRep("chords", label);
      }).catch((err) => {
        console.error("[HarmonicPalette] Playback error:", err);
        if (el.chordDisplay) {
          el.chordDisplay.textContent = "Playback error — check console for details.";
        }
      });
      return;
    }

    if (["scales", "modes", "pentatonic", "color"].includes(appState.paletteTab)) {
      const scalarCell = event.target.closest("td[data-scale-note]");
      if (!scalarCell) return;
      const row = scalarCell.closest("tr");
      const rowTrigger = row?.querySelector(".axis-play-row[data-palette-row-id][data-palette-tab]");
      const rowId = rowTrigger?.dataset?.paletteRowId;
      const tab = rowTrigger?.dataset?.paletteTab;
      if (!rowId || !tab) return;
      currentStudyContext = { type: "scale", tab, rowId, note: scalarCell.dataset.scaleNote };
      renderNowStudyingPanel();
      void playScalarPaletteRow(tab, rowId);
      return;
    }

    if (appState.paletteTab !== "arpeggios") return;
    const cell = event.target.closest("td[data-root][data-quality][data-inversion-index]");
    if (!cell) return;
    const token = ++paletteSequenceToken;
    void playArpeggioCell(cell, { snapshot: true }).then((payload) => {
      if (!payload || token !== paletteSequenceToken) return;
      if (el.chordDisplay) {
        const inversionLabel = payload.inversionIndex === 0
          ? "root position"
          : payload.inversionIndex === 1
            ? "1st inversion"
            : "2nd inversion";
        el.chordDisplay.textContent = `${payload.root}${CHORDS[payload.quality]?.short || ""} ${inversionLabel}: ${payload.notes.join(" - ")}`;
      }
      trackRep("arpeggios", payload.label);
    });
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
    const patternKey = resolveScalePatternKey(el.scaleTypeSelect.value);
    const octaveCount = Math.max(1, Math.min(3, Number.parseInt(el.scaleOctaveSelect?.value || "1", 10) || 1));
    const scaleHand = el.scaleHandSelect?.value || "right";
    const scaleMotion = el.scaleMotionSelect?.value || "parallel";
    const plan = buildScalePlaybackPlan(root, patternKey, octaveCount, scaleHand, scaleMotion);
    await playPatternScheduled({
      events: plan.events,
      showFingers: true,
      snapshot: true,
      snapshotHoldMs: 3800
    });
    if (el.scaleOutput) {
      const octaveLabel = octaveCount === 1 ? "1 octave" : `${octaveCount} octaves`;
      el.scaleOutput.textContent = `${root} ${scalePatternLabel(patternKey)} (${octaveLabel}, ${plan.label}) @ ${appState.tempoBpm}: ${plan.summary}`;
    }
    trackRep("scales", `${root} ${scalePatternLabel(patternKey)}`);
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
      `Scale: ${el.scaleRootSelect.value} ${scalePatternLabel(resolveScalePatternKey(el.scaleTypeSelect.value))}`,
      `Learning mode: ${progress.labLearningMode === "play" ? "piano transfer" : "computer study / theory thinking"}`,
      `Recent progress: chords ${progress.chordReps}, progressions ${progress.progressionReps}, scales ${progress.scaleReps}, arpeggios ${progress.arpeggioReps}`,
      "Give a concise ADHD-friendly 12-minute session that works at a computer first, then offers an optional piano-transfer step."
    ].join(" | ");
  });

  initializeCoachThreads();

  if (el.coachThreadPills) {
    el.coachThreadPills.addEventListener("click", (e) => {
      const pill = e.target.closest(".coach-thread-pill");
      if (!pill) return;
      coachState.activeThreadId = pill.dataset.threadId;
      saveCoachThreads();
      renderCoachThreadPills();
      renderCoachMessages();
    });
  }

  if (el.coachNewThreadBtn) {
    el.coachNewThreadBtn.addEventListener("click", () => {
      createCoachThread();
      renderCoachThreadPills();
      renderCoachMessages();
    });
  }

  el.coachAskBtn.addEventListener("click", askCoach);
  if (el.coachInput) {
    el.coachInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      event.preventDefault();
      void askCoach();
    });
  }
  // Deep-link click delegation — registered once here, not inside renderCoachMessages.
  if (el.coachMessages) {
    el.coachMessages.addEventListener("click", (e) => {
      const link = e.target.closest(".coach-deep-link");
      if (!link) return;
      e.preventDefault();
      const route = link.dataset.route;
      if (route) navigateToLesson(route);
    });
  }
  renderCoachKanban();

  el.completeSessionBtn.addEventListener("click", () => {
    markSessionComplete();
    renderProgress();
  });

  if (el.practiceStartDateInput) {
    el.practiceStartDateInput.addEventListener("change", () => {
      progress.practicePathStartDate = el.practiceStartDateInput.value || todayKey();
      saveProgress();
      renderPracticeLab();
    });
  }

  if (el.markPracticeDoneBtn) {
    el.markPracticeDoneBtn.addEventListener("click", markTodayPracticeDone);
  }

  if (el.studyModeSwitch) {
    el.studyModeSwitch.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-study-mode]");
      if (!btn) return;
      progress.labLearningMode = btn.dataset.studyMode === "play" ? "play" : "study";
      saveProgress();
      renderExploreLabs();
    });
  }

  if (el.lostStepBtn) {
    el.lostStepBtn.addEventListener("click", resetToSafeLabStep);
  }

  if (el.chordMasteryMatrix) {
    el.chordMasteryMatrix.addEventListener("change", (event) => {
      const input = event.target.closest("input[data-mastery-key][data-mastery-skill]");
      if (!input) return;
      updateChordMasteryScore(input.dataset.masteryKey, input.dataset.masterySkill, input.value);
    });
  }

  if (el.play1564LabBtn) {
    el.play1564LabBtn.addEventListener("click", () => {
      void play1564Lab();
    });
  }

  if (el.vocabularyLab) {
    el.vocabularyLab.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-vocab-id]");
      if (!btn) return;
      void playVocabularyLabRow(btn.dataset.vocabId);
    });
  }

  if (el.playModulationLabBtn) {
    el.playModulationLabBtn.addEventListener("click", () => {
      void playModulationLab();
    });
  }

  [el.keySelect, el.modFromKeySelect, el.modToKeySelect, el.modPathSelect, el.lab1564InversionSelect, el.lab1564PatternSelect]
    .filter(Boolean)
    .forEach((control) => control.addEventListener("change", renderExploreLabs));

  if (el.saveLabIdeaBtn) {
    el.saveLabIdeaBtn.addEventListener("click", saveCurrentLabIdea);
  }

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

  if (el.exerciseList) {
    el.exerciseList.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-ex]");
      if (!btn) return;
      const exerciseId = btn.dataset.ex;
      if (!exerciseId) return;
      void runGuidedExercise(exerciseId);
    });
  }

  bindRepertoireEvents();

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
  notePressIndicatorEl = null;
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
    key.dataset.note = midiToNoteName(midi);
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
    key.dataset.note = midiToNoteName(midi);
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
  notePressIndicatorEl = document.createElement("div");
  notePressIndicatorEl.className = "note-press-indicator";
  notePressIndicatorEl.setAttribute("aria-hidden", "true");
  el.keyboard.appendChild(notePressIndicatorEl);
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
  if (emergencyToneEngineActive) {
    playEmergencyMidiNotes([midi], { hold, asChord: true, velocity });
    return;
  }
  if (!sampleEngineReady) {
    if (isSampleEngineLoading()) {
      enqueuePendingPlayRequest([midi], { hold, asChord: true, velocity });
      return;
    }
    if (!playEmergencyMidiNotes([midi], { hold, asChord: true, velocity })) {
      updateAudioStatusText("error");
    }
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

function getNotePressColor(midi) {
  const colors = [
    "#ffb84d",
    "#ff7a59",
    "#f45dbb",
    "#b76cff",
    "#6f8dff",
    "#35b7ff",
    "#29c6b7",
    "#5fca67",
    "#b6cf3d",
    "#ffd54a",
    "#ff9d55",
    "#ff6f91"
  ];
  return colors[((midi % 12) + 12) % 12];
}

function showPressedNoteIndicator(midi, keyEl = keyElsByMidi.get(midi)) {
  if (!el.keyboard || !keyEl) return;
  if (!notePressIndicatorEl || !el.keyboard.contains(notePressIndicatorEl)) {
    notePressIndicatorEl = document.createElement("div");
    notePressIndicatorEl.className = "note-press-indicator";
    notePressIndicatorEl.setAttribute("aria-hidden", "true");
    el.keyboard.appendChild(notePressIndicatorEl);
  }

  const keyboardRect = el.keyboard.getBoundingClientRect();
  const keyRect = keyEl.getBoundingClientRect();
  if (keyboardRect.width <= 0 || keyRect.width <= 0) return;

  const color = getNotePressColor(midi);
  const isBlackKey = keyEl.classList.contains("black-key");
  const x = keyRect.left - keyboardRect.left + keyRect.width / 2;
  const y = keyRect.top - keyboardRect.top + keyRect.height * (isBlackKey ? 0.82 : 0.66);

  keyEl.style.setProperty("--note-press-color", color);
  notePressIndicatorEl.textContent = midiToNoteName(midi);
  notePressIndicatorEl.style.left = `${x}px`;
  notePressIndicatorEl.style.top = `${y}px`;
  notePressIndicatorEl.style.setProperty("--note-press-color", color);
  notePressIndicatorEl.classList.remove("is-visible");
  void notePressIndicatorEl.offsetWidth;
  notePressIndicatorEl.classList.add("is-visible");
}

function triggerFeelHaptic(type = "soft") {
  if (!("vibrate" in navigator)) return;
  const patterns = {
    soft: 8,
    save: [10, 24, 12],
    success: 18,
    complete: [18, 34, 28],
    retry: [8, 30, 8]
  };
  try {
    navigator.vibrate(patterns[type] || patterns.soft);
  } catch {
    // Haptics are progressive enhancement only.
  }
}

function emitFeelFeedback(type = "soft", message = "", options = {}) {
  const { haptic = false, visual = true } = options;
  if (haptic) triggerFeelHaptic(type);

  document.body.classList.remove("feel-state-soft", "feel-state-save", "feel-state-success", "feel-state-complete", "feel-state-retry");
  void document.body.offsetWidth;
  document.body.classList.add(`feel-state-${type}`);
  window.setTimeout(() => {
    document.body.classList.remove(`feel-state-${type}`);
  }, 720);

  if (!visual || !message) return;
  let toast = document.querySelector(".feel-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "feel-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
  toast.dataset.type = type;
  toast.textContent = message;
  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");
  window.clearTimeout(toast._hideTimer);
  toast._hideTimer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function startManualKeyGesture(event, initialKeyEl, initialMidi) {
  event.preventDefault();
  clearKeyboardHighlights();
  initialKeyEl.classList.add("active");
  emitFeelFeedback("soft", "", { haptic: true, visual: false });

  const pointerId = event.pointerId;
  const active = {
    keyEl: initialKeyEl,
    midi: initialMidi
  };

  const triggerActiveKey = (velocity = 0.9) => {
    playManualKeyImmediate(active.midi, velocity);
    showPressedNoteIndicator(active.midi, active.keyEl);
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

/* Map a white-key-index or black-key-index to a semitone offset within an octave */
function bindingToSemitoneOffset(binding) {
  const whiteOffsets = [0, 2, 4, 5, 7, 9, 11]; // C D E F G A B
  const blackOffsets = [1, 3, 6, 8, 10];          // C# D# F# G# A#
  const offsets = binding.type === "white" ? whiteOffsets : blackOffsets;
  return offsets[binding.index] ?? 0;
}

function getWindowMappedMidiForCode(code) {
  const entry = HAND_BINDING_BY_CODE.get(code);
  if (!entry) return null;
  const { hand, binding } = entry;
  const startEl = hand === "left" ? el.highlightStartLeft : el.highlightStartRight;
  const start = Number(startEl?.value);
  if (!Number.isFinite(start)) return null;
  const midi = start + bindingToSemitoneOffset(binding);
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
  showPressedNoteIndicator(midi, keyEl);
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

/* ── Circle-of-Fifths key order for the radial picker ── */
const COF_ORDER = ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"];

function cornerKeyButtonHtml() {
  const current = currentKeyDisplayName();
  return `<button class="corner-key-btn" aria-label="Key: ${current}" title="Click to cycle key, hold for circle selector">${current}</button>`;
}

function wireCornerKeyButton() {
  const btn = document.querySelector('.corner-key-btn');
  if (!btn) return;
  let pressTimer = null;
  let longPressed = false;

  btn.addEventListener('pointerdown', (e) => {
    longPressed = false;
    pressTimer = setTimeout(() => {
      longPressed = true;
      showCornerCofOverlay(btn);
    }, 500);
  });

  btn.addEventListener('pointerup', () => {
    clearTimeout(pressTimer);
    if (!longPressed) {
      // click → cycle to next key
      const current = normalizePitchClass(el.keySelect ? el.keySelect.value : "C");
      const idx = NOTES.indexOf(current);
      const next = NOTES[(idx + 1) % NOTES.length];
      setRootContext(next);
    }
  });

  btn.addEventListener('pointerleave', () => {
    clearTimeout(pressTimer);
  });
}

function showCornerCofOverlay(anchorBtn) {
  dismissCornerCofOverlay();
  const overlay = document.createElement('div');
  overlay.className = 'corner-cof-overlay';
  const current = normalizePitchClass(el.keySelect ? el.keySelect.value : "C");
  const radius = 72;
  const centerX = 90;
  const centerY = 90;

  // background circle
  let svgContent = `<circle cx="${centerX}" cy="${centerY}" r="${radius + 12}" fill="rgba(30,40,70,0.85)" stroke="rgba(100,140,220,0.3)" stroke-width="1"/>`;

  COF_ORDER.forEach((note, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const isActive = normalizePitchClass(note) === current;
    svgContent += `
      <g class="cof-note-group" data-note="${note}" style="cursor:pointer">
        <circle cx="${x}" cy="${y}" r="16" fill="${isActive ? '#4A90D9' : 'rgba(60,80,130,0.7)'}" stroke="${isActive ? '#fff' : 'rgba(150,170,220,0.4)'}" stroke-width="${isActive ? 2 : 1}"/>
        <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="${isActive ? '#fff' : '#c8d8f0'}" font-size="11" font-weight="${isActive ? '700' : '500'}" font-family="Plus Jakarta Sans, sans-serif">${note}</text>
      </g>`;
  });

  overlay.innerHTML = `<svg viewBox="0 0 180 180" width="180" height="180">${svgContent}</svg>`;

  // position overlay
  const rect = anchorBtn.getBoundingClientRect();
  overlay.style.position = 'fixed';
  overlay.style.left = `${rect.left - 20}px`;
  overlay.style.top = `${rect.bottom + 6}px`;
  overlay.style.zIndex = '9999';
  document.body.appendChild(overlay);

  const selectCofGroupFromEvent = (e) => {
    const group = e.target.closest('.cof-note-group');
    if (group) {
      setRootContext(group.dataset.note);
      dismissCornerCofOverlay();
      e.preventDefault();
    }
  };

  // Release on a wheel note should be enough to finalize the key after long-press.
  overlay.addEventListener('pointerup', selectCofGroupFromEvent);
  overlay.addEventListener('click', selectCofGroupFromEvent);

  // dismiss on outside click
  setTimeout(() => {
    document.addEventListener('pointerdown', handleCofOutsideClick);
  }, 10);
}

function handleCofOutsideClick(e) {
  const overlay = document.querySelector('.corner-cof-overlay');
  if (overlay && !overlay.contains(e.target)) {
    dismissCornerCofOverlay();
  }
}

function dismissCornerCofOverlay() {
  const existing = document.querySelector('.corner-cof-overlay');
  if (existing) existing.remove();
  document.removeEventListener('pointerdown', handleCofOutsideClick);
}

function qualityFamilyForHomeSearch(quality) {
  if (["maj7", "min7", "dom7", "m7b5"].includes(quality)) return "seventh";
  return "triad";
}

function homeQualityMatches(selectedQuality, candidateQuality) {
  if (selectedQuality === candidateQuality) return true;
  if (selectedQuality === "major") return candidateQuality === "major";
  if (selectedQuality === "minor") return candidateQuality === "minor";
  if (selectedQuality === "diminished") return candidateQuality === "diminished" || candidateQuality === "m7b5";
  if (selectedQuality === "sus2" || selectedQuality === "sus4") {
    return candidateQuality === "major" || candidateQuality === "dom7" || candidateQuality === "maj7";
  }
  return false;
}

function homeOptionSortScore(option) {
  const roman = String(option.roman || "");
  if (roman === "I" || roman === "i") return 0;
  if (roman === "IV" || roman === "iv") return 1;
  if (roman === "V" || roman === "v") return 2;
  if (roman === "vi" || roman === "VI") return 3;
  if (roman === "iii" || roman === "III") return 4;
  return 8;
}

function buildHomeOptionsForChord(root, quality) {
  const normalizedRoot = normalizePitchClass(root);
  const family = qualityFamilyForHomeSearch(quality);
  const majorQualityMap = family === "seventh" ? MAJOR_KEY_SEVENTH_QUALITIES : MAJOR_KEY_TRIAD_QUALITIES;
  const minorQualityMap = family === "seventh" ? MINOR_KEY_SEVENTH_QUALITIES : MINOR_KEY_TRIAD_QUALITIES;
  const options = [];

  NOTES.forEach((key) => {
    const keyIndex = NOTES.indexOf(key);
    DEGREE_TO_SEMITONE.forEach((semi, idx) => {
      const degreeRoot = NOTES[(keyIndex + semi) % 12];
      const candidateQuality = majorQualityMap[idx];
      if (degreeRoot !== normalizedRoot || !homeQualityMatches(quality, candidateQuality)) return;
      options.push({
        key,
        mode: "major",
        roman: ROMAN[idx],
        tonicQuality: "major",
        label: `${displayPitchClass(key)} major`,
        role: `${ROMAN[idx]} in ${displayPitchClass(key)} major`,
        note: ROMAN[idx] === "I"
          ? "Most settled home."
          : `${harmonyChordSymbol(normalizedRoot, quality)} can live here as ${ROMAN[idx]}.`
      });
    });

    const minorKeyIndex = NOTES.indexOf(key);
    MINOR_KEY_DEGREE_TO_SEMITONE.forEach((semi, idx) => {
      const degreeRoot = NOTES[(minorKeyIndex + semi) % 12];
      const candidateQuality = minorQualityMap[idx];
      const roman = ["i", "ii°", "III", "iv", "v", "VI", "VII"][idx];
      if (degreeRoot !== normalizedRoot || !homeQualityMatches(quality, candidateQuality)) return;
      options.push({
        key,
        mode: "minor",
        roman,
        tonicQuality: "minor",
        label: `${displayPitchClass(key)} minor`,
        role: `${roman} in ${displayPitchClass(key)} minor`,
        note: roman === "i"
          ? "Minor-key home."
          : `${harmonyChordSymbol(normalizedRoot, quality)} can live here as ${roman}.`
      });
    });
  });

  return options
    .sort((a, b) => homeOptionSortScore(a) - homeOptionSortScore(b) || a.label.localeCompare(b.label))
    .slice(0, 8);
}

function showChordHomeOverlay(anchorCell, chord = {}) {
  dismissChordHomeOverlay();
  const options = buildHomeOptionsForChord(chord.root, chord.quality);
  const overlay = document.createElement("div");
  overlay.className = "chord-home-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-label", `Home options for ${chord.label || "selected chord"}`);
  const rect = anchorCell.getBoundingClientRect();
  const overlayWidth = Math.min(360, window.innerWidth - 20);
  const overlayHeight = Math.min(336, window.innerHeight - 20);
  overlay.style.left = `${Math.max(10, Math.min(window.innerWidth - overlayWidth - 10, rect.left + rect.width / 2 - overlayWidth / 2))}px`;
  overlay.style.top = `${Math.max(10, Math.min(window.innerHeight - overlayHeight - 10, rect.top + rect.height / 2 - overlayHeight / 2))}px`;

  const optionMarkup = options.length
    ? `<div class="chord-home-options-grid">${options.map((option) => `
        <button class="chord-home-option"
          data-home-key="${escapeHtml(option.key)}" data-home-mode="${escapeHtml(option.mode)}"
          data-home-quality="${escapeHtml(option.tonicQuality)}" type="button">
          <strong>${escapeHtml(option.label)}</strong>
          <span>${escapeHtml(option.roman)}</span>
        </button>
      `).join("")}</div>`
    : `<p class="chord-home-empty">No simple diatonic homes found for this exact color yet.</p>`;

  overlay.innerHTML = `
    <div class="chord-home-center">
      <strong>${escapeHtml(chord.label || chord.root || "Chord")}</strong>
      <span>possible homes</span>
    </div>
    ${optionMarkup}
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (event) => {
    const btn = event.target.closest(".chord-home-option");
    if (!btn) return;
    const key = normalizePitchClass(btn.dataset.homeKey || "C");
    const mode = btn.dataset.homeMode === "minor" ? "minor" : "major";
    const tonicQuality = mode === "minor" ? "minor" : "major";
    const selected = options.find((option) => option.key === key && option.mode === mode);
    const hold = Math.max(0.8, getHoldSeconds());
    if (mode === "major") {
      setRootContext(key);
    } else {
      setProgressionPaletteFocus(key, "minor", "key");
      renderProgressionPalette();
    }
    playMidiNotes(buildChordMidi(key, tonicQuality, "root position", 3), { hold, asChord: true, restrictToWindow: false });
    if (el.chordDisplay) {
      el.chordDisplay.textContent = `${selected?.label || `${key} ${mode}`} can feel like home: ${selected?.role || ""}`;
    }
    dismissChordHomeOverlay();
  });

  setTimeout(() => {
    document.addEventListener("pointerdown", handleChordHomeOutsideClick);
  }, 10);
}

function handleChordHomeOutsideClick(event) {
  const overlay = document.querySelector(".chord-home-overlay");
  if (overlay && !overlay.contains(event.target)) {
    dismissChordHomeOverlay();
  }
}

function dismissChordHomeOverlay() {
  const existing = document.querySelector(".chord-home-overlay");
  if (existing) existing.remove();
  document.removeEventListener("pointerdown", handleChordHomeOutsideClick);
}

function renderChordTable() {
  const key = normalizePitchClass(el.keySelect.value || appState.root || "C");
  const preferFlat = shouldUseFlatKeyDisplay();
  const keyLabel = displayPitchClass(key, { preferFlat });
  el.chordTableTitle.textContent = `Chords in ${keyLabel} Major`;

  const keyIndex = NOTES.indexOf(key);
  const degreeData = [...DEGREE_TO_SEMITONE, 12].map((semi) => {
    const absoluteSemi = keyIndex + semi;
    return {
      root: NOTES[absoluteSemi % 12],
      octaveShift: Math.floor(absoluteSemi / 12) * 12
    };
  });
  const degreeRoots = degreeData.map((degree) => degree.root);
  const degreeLabels = [...ROMAN, "8"];

  el.chordTableHead.innerHTML = `<th class="axis-corner-cell">${cornerKeyButtonHtml()}</th>${degreeData.map(({ root }, idx) => (
    `<th class="axis-col-cell"><button type="button" class="axis-play-btn axis-play-col" data-column-index="${idx}" data-column-roman="${degreeLabels[idx]}" data-column-root="${root}">${degreeLabels[idx]}<br>${displayPitchClass(root, { preferFlat })}</button></th>`
  )).join("")}`;
  wireCornerKeyButton();

  const rows = [
    { name: "Sus2", quality: "sus2" },
    { name: "Triad", map: MAJOR_KEY_TRIAD_QUALITIES },
    { name: "Sus4", quality: "sus4" },
    { name: "7th", map: MAJOR_KEY_SEVENTH_QUALITIES }
  ];

  el.chordTableBody.innerHTML = rows.map((row, rowIndex) => {
    const cells = degreeData.map(({ root, octaveShift }, idx) => {
      const degreeIndex = idx % DEGREE_TO_SEMITONE.length;
      const quality = row.quality || row.map[degreeIndex];
      const label = harmonyChordSymbol(root, quality, { preferFlat });
      return `<td data-root="${root}" data-quality="${quality}" data-label="${label}" data-octave-shift="${octaveShift}">${label}</td>`;
    }).join("");
    return `<tr data-row-index="${rowIndex}"><th scope="row" class="row-label"><button type="button" class="axis-play-btn axis-play-row" data-row-index="${rowIndex}" data-row-name="${row.name}">${row.name}</button></th>${cells}</tr>`;
  }).join("");

  markChordTableCell(appState.root, appState.quality);
}

function renderArpeggioTable() {
  const key = normalizePitchClass(el.keySelect.value || appState.root || "C");
  const preferFlat = shouldUseFlatKeyDisplay();
  el.chordTableTitle.textContent = `Arpeggios in ${displayPitchClass(key, { preferFlat })} Major`;
  const keyIndex = NOTES.indexOf(key);
  const degreeData = DEGREE_TO_SEMITONE.map((semi) => {
    const absoluteSemi = keyIndex + semi;
    return {
      root: NOTES[absoluteSemi % 12],
      octaveShift: Math.floor(absoluteSemi / 12) * 12
    };
  });

  el.chordTableHead.innerHTML = `<th class="axis-corner-cell">${cornerKeyButtonHtml()}</th>${degreeData.map(({ root }, idx) => (
    `<th class="axis-col-cell"><button type="button" class="axis-play-btn axis-play-col" data-column-index="${idx}" data-column-roman="${ROMAN[idx]}" data-column-root="${root}">${ROMAN[idx]}<br>${displayPitchClass(root, { preferFlat })}</button></th>`
  )).join("")}`;
  wireCornerKeyButton();

  el.chordTableBody.innerHTML = ARPEGGIO_TRIAD_ROWS.map((row, rowIndex) => {
    const cells = degreeData.map(({ root, octaveShift }, idx) => {
      const quality = MAJOR_KEY_TRIAD_QUALITIES[idx];
      const shortInversion = row.inversionIndex === 0
        ? "RP"
        : row.inversionIndex === 1
          ? "1st"
          : "2nd";
      const label = `${harmonyChordSymbol(root, quality, { preferFlat })} ${shortInversion}`;
      return `<td data-root="${root}" data-quality="${quality}" data-label="${label}" data-inversion-index="${row.inversionIndex}" data-octave-shift="${octaveShift}">${label}</td>`;
    }).join("");
    return `<tr data-row-index="${rowIndex}"><th scope="row" class="row-label"><button type="button" class="axis-play-btn axis-play-row" data-row-index="${rowIndex}" data-row-name="${row.name}" data-inversion-index="${row.inversionIndex}">${row.name}</button></th>${cells}</tr>`;
  }).join("");

  clearChordTableSelection();
}

function buildChordMidiForPaletteCell(cell, inversion = "root position", baseOctave = 3) {
  const root = cell?.dataset?.root;
  const quality = cell?.dataset?.quality;
  if (!root || !quality) return [];
  const octaveShift = Number(cell.dataset.octaveShift || 0);
  return buildChordMidi(root, quality, inversion, baseOctave)
    .map((midi) => midi + (Number.isFinite(octaveShift) ? octaveShift : 0));
}

function getScalarPaletteConfig(paletteTab) {
  if (paletteTab === "scales") {
    return {
      title: `Scales in ${currentKeyDisplayName()}`,
      rows: SCALES_PALETTE_ROWS
    };
  }
  if (paletteTab === "modes") {
    return {
      title: `Modes in ${currentKeyDisplayName()}`,
      rows: MODES_PALETTE_ROWS
    };
  }
  if (paletteTab === "pentatonic") {
    return {
      title: `Pentatonic in ${currentKeyDisplayName()}`,
      rows: PENTATONIC_PALETTE_ROWS
    };
  }
  if (paletteTab === "color") {
    return {
      title: `Color in ${currentKeyDisplayName()}`,
      rows: COLOR_PALETTE_ROWS
    };
  }
  return null;
}

function renderScalarPaletteTable(paletteTab) {
  const config = getScalarPaletteConfig(paletteTab);
  if (!config) return;
  const key = normalizePitchClass(el.keySelect.value || appState.root || "C");
  const preferFlat = shouldUseFlatKeyDisplay();
  el.chordTableTitle.textContent = config.title;
  el.chordTableHead.innerHTML = `<th class="axis-corner-cell">${cornerKeyButtonHtml()}</th>${PALETTE_SCALAR_COLUMN_DEGREES
    .map((degree, idx) => `<th class="axis-col-cell degree-col-cell"><button type="button" class="axis-play-btn axis-play-col" data-column-index="${idx}" data-column-roman="${degree}">${degree}</button></th>`)
    .join("")}`;
  wireCornerKeyButton();

  el.chordTableBody.innerHTML = config.rows.map((row, rowIndex) => {
    const ascending = buildAscendingScaleMidiFromIntervals(key, row.intervals, 3, true);
    const displayMidi = ascending.slice(0, PALETTE_SCALAR_COLUMN_DEGREES.length);
    const displayNotes = ascending
      .slice(0, PALETTE_SCALAR_COLUMN_DEGREES.length)
      .map((midi) => pitchClassFromMidi(midi));
    const cells = PALETTE_SCALAR_COLUMN_DEGREES.map((_, idx) => {
      const label = displayPitchClass(displayNotes[idx] || "", { preferFlat });
      const midi = Number.isFinite(displayMidi[idx]) ? displayMidi[idx] : "";
      return `<td data-scale-note="${label}" data-scale-midi="${midi}">${label}</td>`;
    }).join("");
    return `<tr data-row-index="${rowIndex}"><th scope="row" class="row-label"><button type="button" class="axis-play-btn axis-play-row" data-row-index="${rowIndex}" data-row-name="${row.name}" data-palette-row-id="${row.id}" data-palette-tab="${paletteTab}">${row.name}</button></th>${cells}</tr>`;
  }).join("");
  clearChordTableSelection();
}

function isHarmonicPaletteTab(tab) {
  return HARMONIC_PALETTE_TABS.includes(tab);
}

function formatHarmonyNoteName(note, preferFlat = false) {
  if (!preferFlat) return note;
  return ENHARMONIC_FLAT_MAP[note] || note;
}

function harmonyChordSymbol(root, quality, options = {}) {
  const safeRoot = formatHarmonyNoteName(root, options.preferFlat === true);
  return `${safeRoot}${CHORDS[quality]?.short || ""}`;
}

function encodeHarmonyEventPayload(payload) {
  return encodeURIComponent(JSON.stringify(payload));
}

function decodeHarmonyEventPayload(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

function getHarmonyCellEventFromCell(cell) {
  return decodeHarmonyEventPayload(cell?.dataset?.harmonyEvent || "");
}

function keyOffsetRoot(key, semitoneOffset) {
  const keyIndex = NOTES.indexOf(key);
  return NOTES[(keyIndex + semitoneOffset + 1200) % 12];
}

function majorDegreeRoot(key, degreeIndexZeroBased) {
  return keyOffsetRoot(key, DEGREE_TO_SEMITONE[degreeIndexZeroBased % DEGREE_TO_SEMITONE.length]);
}

function buildAlteredDominantMidi(root, baseOctave = 3) {
  const rootMidi = 12 * (baseOctave + 1) + NOTES.indexOf(root);
  const midi = [0, 4, 10, 13, 15].map((interval) => rootMidi + interval);
  return Array.from(new Set(midi)).sort((a, b) => a - b);
}

function createHarmonyStep(root, quality, options = {}) {
  const step = { root, quality };
  if (Number.isFinite(options.beats) && options.beats > 0) {
    step.beats = options.beats;
  } else if (Number.isFinite(options.measures) && options.measures > 0) {
    step.measures = options.measures;
  } else {
    step.beats = 2;
  }
  if (Array.isArray(options.midiNotes) && options.midiNotes.length > 0) {
    step.midiNotes = options.midiNotes.filter((note) => Number.isFinite(note));
  }
  return step;
}

function buildSecondaryDominantPaletteConfig(key) {
  const tonicSymbol = harmonyChordSymbol(key, "major");
  const targets = [
    { columnLabel: "ii", degreeIndex: 1 },
    { columnLabel: "iii", degreeIndex: 2 },
    { columnLabel: "IV", degreeIndex: 3 },
    { columnLabel: "V", degreeIndex: 4 },
    { columnLabel: "vi", degreeIndex: 5 }
  ];

  const cells = targets.map((target) => {
    const targetRoot = majorDegreeRoot(key, target.degreeIndex);
    const targetQuality = MAJOR_KEY_TRIAD_QUALITIES[target.degreeIndex];
    const dominantRoot = keyOffsetRoot(targetRoot, 7);
    const dominantSymbol = harmonyChordSymbol(dominantRoot, "dom7");
    const targetSymbol = harmonyChordSymbol(targetRoot, targetQuality);
    return {
      label: `${dominantSymbol} \u2192 ${targetSymbol}`,
      event: {
        type: "secondary",
        targetDegree: target.columnLabel,
        label: `${dominantSymbol} \u2192 ${targetSymbol}`,
        steps: [
          createHarmonyStep(dominantRoot, "dom7", { measures: 1 }),
          createHarmonyStep(targetRoot, targetQuality, { measures: 1 }),
          createHarmonyStep(key, "major", { measures: 0.5 })
        ]
      }
    };
  });

  return {
    title: `Secondary Dominants in ${key} Major`,
    columns: targets.map((target) => target.columnLabel),
    rows: [
      { id: "secondary-row", name: "Secondary Dominant", cells }
    ],
    completionLabel: `Secondary sweep in ${key}: resolves to ${tonicSymbol}`
  };
}

function buildBorrowedPaletteConfig(key) {
  const tonicSymbol = harmonyChordSymbol(key, "major");
  const specs = [
    { columnLabel: "iv", offset: 5, quality: "minor", preferFlat: false },
    { columnLabel: "\u266dVI", offset: 8, quality: "major", preferFlat: true },
    { columnLabel: "\u266dVII", offset: 10, quality: "major", preferFlat: true },
    { columnLabel: "ii\u00b0", offset: 2, quality: "diminished", preferFlat: false }
  ];
  const cells = specs.map((spec) => {
    const root = keyOffsetRoot(key, spec.offset);
    const borrowedSymbol = harmonyChordSymbol(root, spec.quality, { preferFlat: spec.preferFlat });
    return {
      label: `${borrowedSymbol} \u2192 ${tonicSymbol}`,
      event: {
        type: "borrowed",
        column: spec.columnLabel,
        label: `${borrowedSymbol} \u2192 ${tonicSymbol}`,
        steps: [
          createHarmonyStep(root, spec.quality, { measures: 1 }),
          createHarmonyStep(key, "major", { measures: 1 })
        ]
      }
    };
  });

  return {
    title: `Borrowed Chords in ${key} Major`,
    columns: specs.map((spec) => spec.columnLabel),
    rows: [
      { id: "borrowed-row", name: "Borrowed", cells }
    ],
    completionLabel: `Borrowed sweep in ${key}: modal interchange`
  };
}

function buildSubstitutionPaletteConfig(key) {
  const dominantRoot = majorDegreeRoot(key, 4);
  const substituteRoot = keyOffsetRoot(dominantRoot, 6);
  const tonicSymbol = harmonyChordSymbol(key, "major");
  const dominantSymbol = harmonyChordSymbol(dominantRoot, "dom7");
  const substituteSymbol = harmonyChordSymbol(substituteRoot, "dom7", { preferFlat: true });
  return {
    title: `Tritone Substitution in ${key} Major`,
    columns: ["Original", "Substitution"],
    rows: [
      {
        id: "substitution-row",
        name: "Dominant Substitution",
        cells: [
          {
            label: `${dominantSymbol} \u2192 ${tonicSymbol}`,
            event: {
              type: "substitution-original",
              label: `${dominantSymbol} \u2192 ${tonicSymbol}`,
              steps: [
                createHarmonyStep(dominantRoot, "dom7", { measures: 1 }),
                createHarmonyStep(key, "major", { measures: 1 })
              ]
            }
          },
          {
            label: `${substituteSymbol} \u2192 ${tonicSymbol}`,
            event: {
              type: "substitution-tritone",
              label: `${substituteSymbol} \u2192 ${tonicSymbol}`,
              steps: [
                createHarmonyStep(substituteRoot, "dom7", { measures: 1 }),
                createHarmonyStep(key, "major", { measures: 1 })
              ]
            }
          }
        ]
      }
    ],
    completionLabel: `Substitution sweep in ${key}: dominant color paths`
  };
}

function buildCadenceLabPaletteConfig(key) {
  const rootI = key;
  const rootIi = majorDegreeRoot(key, 1);
  const rootIv = majorDegreeRoot(key, 3);
  const rootV = majorDegreeRoot(key, 4);
  const rootVi = majorDegreeRoot(key, 5);
  const rootFlatVii = keyOffsetRoot(key, 10);
  const rootFlatIi = keyOffsetRoot(rootV, 6);

  const symI = harmonyChordSymbol(rootI, "major");
  const symIi = harmonyChordSymbol(rootIi, "minor");
  const symIv = harmonyChordSymbol(rootIv, "major");
  const symV7 = harmonyChordSymbol(rootV, "dom7");
  const symVi = harmonyChordSymbol(rootVi, "minor");
  const symFlatVii7 = harmonyChordSymbol(rootFlatVii, "dom7", { preferFlat: true });
  const symFlatIi7 = harmonyChordSymbol(rootFlatIi, "dom7", { preferFlat: true });
  const rootViDom = harmonyChordSymbol(rootVi, "dom7");

  const twoBeat = { beats: 2 };

  return {
    title: `Cadences in ${key} Major`,
    columns: ["Authentic", "Plagal", "Half", "Deceptive", "Backdoor"],
    rows: [
      {
        id: "cadence-core-row",
        name: "Cadences",
        cells: [
          {
            label: `${symV7}\u2192${symI}`,
            event: {
              type: "cadence-authentic",
              label: `${symV7} \u2192 ${symI}`,
              steps: [
                createHarmonyStep(rootV, "dom7", twoBeat),
                createHarmonyStep(rootI, "major", twoBeat)
              ]
            }
          },
          {
            label: `${symIv}\u2192${symI}`,
            event: {
              type: "cadence-plagal",
              label: `${symIv} \u2192 ${symI}`,
              steps: [
                createHarmonyStep(rootIv, "major", twoBeat),
                createHarmonyStep(rootI, "major", twoBeat)
              ]
            }
          },
          {
            label: `${symIi}\u2192${symV7}`,
            event: {
              type: "cadence-half",
              label: `${symIi} \u2192 ${symV7}`,
              steps: [
                createHarmonyStep(rootIi, "minor", twoBeat),
                createHarmonyStep(rootV, "dom7", twoBeat)
              ]
            }
          },
          {
            label: `${symV7}\u2192${symVi}`,
            event: {
              type: "cadence-deceptive",
              label: `${symV7} \u2192 ${symVi}`,
              steps: [
                createHarmonyStep(rootV, "dom7", twoBeat),
                createHarmonyStep(rootVi, "minor", twoBeat)
              ]
            }
          },
          {
            label: `${symFlatVii7}\u2192${symI}`,
            event: {
              type: "cadence-backdoor",
              label: `${symFlatVii7} \u2192 ${symI}`,
              steps: [
                createHarmonyStep(rootFlatVii, "dom7", twoBeat),
                createHarmonyStep(rootI, "major", twoBeat)
              ]
            }
          }
        ]
      },
      {
        id: "cadence-jazz-row",
        name: "Jazz Cadences",
        cells: [
          {
            label: "ii\u2013V\u2013I",
            event: {
              type: "jazz-251",
              label: `ii\u2013V\u2013I: ${symIi} \u2192 ${symV7} \u2192 ${symI}`,
              steps: [
                createHarmonyStep(rootIi, "minor", twoBeat),
                createHarmonyStep(rootV, "dom7", twoBeat),
                createHarmonyStep(rootI, "major", twoBeat)
              ]
            }
          },
          {
            label: "vi\u2013ii\u2013V\u2013I",
            event: {
              type: "jazz-6251",
              label: `vi\u2013ii\u2013V\u2013I: ${symVi} \u2192 ${symIi} \u2192 ${symV7} \u2192 ${symI}`,
              steps: [
                createHarmonyStep(rootVi, "minor", twoBeat),
                createHarmonyStep(rootIi, "minor", twoBeat),
                createHarmonyStep(rootV, "dom7", twoBeat),
                createHarmonyStep(rootI, "major", twoBeat)
              ]
            }
          },
          {
            label: "I\u2013VI7\u2013ii\u2013V",
            event: {
              type: "jazz-turnaround",
              label: `I\u2013VI7\u2013ii\u2013V: ${symI} \u2192 ${rootViDom} \u2192 ${symIi} \u2192 ${symV7}`,
              steps: [
                createHarmonyStep(rootI, "major", twoBeat),
                createHarmonyStep(rootVi, "dom7", twoBeat),
                createHarmonyStep(rootIi, "minor", twoBeat),
                createHarmonyStep(rootV, "dom7", twoBeat)
              ]
            }
          },
          {
            label: "\u266dVII7\u2192I",
            event: {
              type: "jazz-backdoor",
              label: `${symFlatVii7} \u2192 ${symI}`,
              steps: [
                createHarmonyStep(rootFlatVii, "dom7", twoBeat),
                createHarmonyStep(rootI, "major", twoBeat)
              ]
            }
          },
          { label: "" }
        ]
      },
      {
        id: "cadence-dominant-color-row",
        name: "Dominant Colors",
        cells: [
          {
            label: "Plain V7",
            event: {
              type: "dominant-plain",
              label: `Plain: ${symV7} \u2192 ${symI}`,
              steps: [
                createHarmonyStep(rootV, "dom7", twoBeat),
                createHarmonyStep(rootI, "major", twoBeat)
              ]
            }
          },
          {
            label: "Tritone Sub",
            event: {
              type: "dominant-tritone",
              label: `Tritone: ${symFlatIi7} \u2192 ${symI}`,
              steps: [
                createHarmonyStep(rootFlatIi, "dom7", twoBeat),
                createHarmonyStep(rootI, "major", twoBeat)
              ]
            }
          },
          {
            label: "Backdoor",
            event: {
              type: "dominant-backdoor",
              label: `Backdoor: ${symFlatVii7} \u2192 ${symI}`,
              steps: [
                createHarmonyStep(rootFlatVii, "dom7", twoBeat),
                createHarmonyStep(rootI, "major", twoBeat)
              ]
            }
          },
          {
            label: "Altered V7",
            event: {
              type: "dominant-altered",
              label: `Altered: ${symV7}(b9,#9) \u2192 ${symI}`,
              steps: [
                createHarmonyStep(rootV, "dom7", { beats: 2, midiNotes: buildAlteredDominantMidi(rootV, 3) }),
                createHarmonyStep(rootI, "major", twoBeat)
              ]
            }
          },
          { label: "" }
        ]
      }
    ],
    completionLabel: `Cadence sweep in ${key}: dominant resolution flow`
  };
}

function getHarmonicPaletteConfig(paletteTab) {
  const key = el.keySelect?.value || appState.root;
  if (paletteTab === "secondary") return buildSecondaryDominantPaletteConfig(key);
  if (paletteTab === "borrowed") return buildBorrowedPaletteConfig(key);
  if (paletteTab === "substitution") return buildSubstitutionPaletteConfig(key);
  if (paletteTab === "cadences") return buildCadenceLabPaletteConfig(key);
  return null;
}

function renderHarmonicPaletteTable(paletteTab) {
  const config = getHarmonicPaletteConfig(paletteTab);
  if (!config) return;
  el.chordTableTitle.textContent = config.title;
  el.chordTableHead.innerHTML = `<th class="axis-corner-cell">${cornerKeyButtonHtml()}</th>${config.columns.map((columnLabel, idx) => (
    `<th class="axis-col-cell"><button type="button" class="axis-play-btn axis-play-col" data-column-index="${idx}" data-column-roman="${columnLabel}">${columnLabel}</button></th>`
  )).join("")}`;
  wireCornerKeyButton();
  el.chordTableBody.innerHTML = config.rows.map((row, rowIndex) => {
    const cells = row.cells.map((cell) => {
      const label = cell?.label || "";
      const eventPayload = cell?.event ? encodeHarmonyEventPayload(cell.event) : "";
      if (eventPayload) {
        return `<td data-harmony-event="${eventPayload}">${label}</td>`;
      }
      return `<td>${label}</td>`;
    }).join("");
    return `<tr data-row-index="${rowIndex}"><th scope="row" class="row-label"><button type="button" class="axis-play-btn axis-play-row" data-row-index="${rowIndex}" data-row-name="${row.name}" data-palette-row-id="${row.id}" data-palette-tab="${paletteTab}">${row.name}</button></th>${cells}</tr>`;
  }).join("");
  clearChordTableSelection();
}

function pitchClassFromMidi(midi) {
  if (!Number.isFinite(midi)) return "";
  return NOTES[(midi % 12 + 12) % 12];
}

function buildAscendingScaleMidiFromIntervals(root, intervals, octave = 3, includeOctave = true) {
  const base = 12 * (octave + 1) + NOTES.indexOf(root);
  const asc = intervals.map((interval) => base + interval);
  if (!includeOctave) return asc;
  return [...asc, base + 12];
}

function buildAscendingDescendingSequence(midiAscending) {
  const asc = Array.isArray(midiAscending) ? midiAscending.filter((midi) => Number.isFinite(midi)) : [];
  if (asc.length === 0) return [];
  return [...asc, ...asc.slice(0, -1).reverse()];
}

function mirrorFingering(upFingers) {
  const up = Array.isArray(upFingers) ? upFingers.filter((finger) => Number.isFinite(Number(finger))) : [];
  if (up.length === 0) return [];
  return [...up, ...up.slice(0, -1).reverse()];
}

function buildRepeatingFingering(length, cycle, offset = 0) {
  const safeCycle = Array.isArray(cycle) ? cycle : [];
  if (!safeCycle.length || length <= 0) return [];
  const out = [];
  for (let i = 0; i < length; i += 1) {
    out.push(safeCycle[(offset + i) % safeCycle.length]);
  }
  return out;
}

function chooseRightHandOffsetForWhiteThumb(ascendingMidi, cycle) {
  const notes = Array.isArray(ascendingMidi) ? ascendingMidi : [];
  let bestOffset = 0;
  let bestScore = -1;
  for (let offset = 0; offset < cycle.length; offset += 1) {
    let score = 0;
    for (let i = 0; i < notes.length; i += 1) {
      const finger = cycle[(offset + i) % cycle.length];
      if (finger !== 1) continue;
      if (!isBlackMidiNote(notes[i])) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestOffset = offset;
    }
  }
  return bestOffset;
}

function buildModesFingering(sequenceMidi, hand = "right") {
  const ascLength = Math.floor((sequenceMidi.length + 1) / 2);
  const ascendingNotes = sequenceMidi.slice(0, ascLength).map((midi) => midiToNoteName(midi));
  const up = buildScaleFingering(ascendingNotes, hand);
  return mirrorFingering(up);
}

function buildPentatonicFingering(hand = "right") {
  const up = hand === "left"
    ? [5, 4, 3, 2, 1, 3]
    : [1, 2, 3, 1, 2, 3];
  return mirrorFingering(up);
}

function buildColorFingering(rowId, sequenceMidi, hand = "right") {
  const ascLength = Math.floor((sequenceMidi.length + 1) / 2);
  const ascendingMidi = sequenceMidi.slice(0, ascLength);
  if (rowId === "wholeTone") {
    const base = hand === "left" ? [5, 4, 3, 2, 1, 3] : [1, 2, 3, 1, 2, 3];
    const up = [...base, base[0]];
    return mirrorFingering(up);
  }
  if (rowId === "diminishedHW" || rowId === "diminishedWH") {
    if (hand === "left") {
      const up = buildRepeatingFingering(ascendingMidi.length, [5, 4, 3, 2], 0);
      return mirrorFingering(up);
    }
    const cycle = [1, 2, 3, 4];
    const offset = chooseRightHandOffsetForWhiteThumb(ascendingMidi, cycle);
    const up = buildRepeatingFingering(ascendingMidi.length, cycle, offset);
    return mirrorFingering(up);
  }
  const ascendingNotes = ascendingMidi.map((midi) => midiToNoteName(midi));
  const up = buildScaleFingering(ascendingNotes, hand);
  return mirrorFingering(up);
}

function findScalarPaletteRow(paletteTab, rowId) {
  const config = getScalarPaletteConfig(paletteTab);
  if (!config) return null;
  return config.rows.find((row) => row.id === rowId) || null;
}

function getScalarPaletteFingering(paletteTab, row, sequenceMidi) {
  const hand = el.handSelect?.value === "left" ? "left" : "right";
  if (paletteTab === "scales") {
    return buildModesFingering(sequenceMidi, hand);
  }
  if (paletteTab === "modes") {
    return buildModesFingering(sequenceMidi, hand);
  }
  if (paletteTab === "pentatonic") {
    return buildPentatonicFingering(hand);
  }
  if (paletteTab === "color") {
    return buildColorFingering(row.id, sequenceMidi, hand);
  }
  return [];
}

function scalarPitchClassToMidi(pitchClass, octave = 4) {
  if (!pitchClass) return null;
  const idx = NOTES.indexOf(String(pitchClass));
  if (idx < 0) return null;
  return 12 * (octave + 1) + idx;
}

function scalarCellMidi(cell) {
  const rawMidi = Number(cell?.dataset?.scaleMidi);
  if (Number.isFinite(rawMidi)) return rawMidi;
  const pitchClass = cell?.dataset?.scaleNote;
  return scalarPitchClassToMidi(pitchClass);
}

async function playScalarPaletteCellSequence(cells, label) {
  if (!Array.isArray(cells) || cells.length === 0) return;
  const playableCells = cells.filter((cell) => {
    return Number.isFinite(scalarCellMidi(cell));
  });
  if (!playableCells.length) return;

  const sequenceToken = ++paletteSequenceToken;

  const stepSeconds = getStepSeconds();
  const hold = Math.max(0.08, stepSeconds * 0.9);
  const stepMs = Math.max(60, Math.round(stepSeconds * 1000));

  for (let i = 0; i < playableCells.length; i += 1) {
    if (sequenceToken !== paletteSequenceToken) return;
    const cell = playableCells[i];
    const midi = scalarCellMidi(cell);
    if (!Number.isFinite(midi)) continue;
    clearChordTableSelection();
    cell.classList.add("is-selected");
    playMidiNotes([midi], {
      hold,
      asChord: true,
      highlightMs: getHighlightMs(hold, stepMs),
      restrictToWindow: false
    });
    if (i === playableCells.length - 1) {
      celebrateResolutionCell(cell);
    }
    await wait(stepMs);
  }

  if (sequenceToken !== paletteSequenceToken) return;
  if (el.chordDisplay) {
    const endMidi = scalarCellMidi(playableCells[playableCells.length - 1]);
    const endNote = Number.isFinite(endMidi) ? midiToNoteName(endMidi) : "end";
    el.chordDisplay.textContent = `${label}: resolved on ${endNote}`;
  }
  trackRep("scales", label);
}

async function playScalarPaletteRow(paletteTab, rowId) {
  const row = findScalarPaletteRow(paletteTab, rowId);
  if (!row) return;
  const key = el.keySelect.value;
  const rowButton = el.chordTableBody.querySelector(`.axis-play-row[data-palette-row-id="${row.id}"]`);
  const rowElement = rowButton?.closest("tr");
  const cells = Array.from(rowElement?.querySelectorAll("td[data-scale-note]") || []);
  await playScalarPaletteCellSequence(cells, `${row.name} in ${key}`);
}

function buildTriadMidiFromQuality(root, quality, baseOctave = 3) {
  const rootMidi = 12 * (baseOctave + 1) + NOTES.indexOf(root);
  const intervals = quality === "major"
    ? [0, 4, 7]
    : quality === "minor"
      ? [0, 3, 7]
      : [0, 3, 6];
  return intervals.map((interval) => rootMidi + interval);
}

function invertChord(midiNotes, inversionIndex) {
  const source = Array.isArray(midiNotes) ? midiNotes.filter((note) => Number.isFinite(note)) : [];
  if (source.length === 0) return [];
  const normalizedInversion = Math.max(0, Math.floor(inversionIndex)) % source.length;
  const rotated = [...source.slice(normalizedInversion), ...source.slice(0, normalizedInversion)];
  for (let i = 1; i < rotated.length; i += 1) {
    while (rotated[i] <= rotated[i - 1]) {
      rotated[i] += 12;
    }
  }
  return rotated;
}

function buildArpeggioSequence(midiNotes) {
  const chord = Array.isArray(midiNotes) ? midiNotes.filter((note) => Number.isFinite(note)) : [];
  if (chord.length === 0) return [];
  const ascending = [...chord, chord[0] + 12];
  const descending = [...chord].reverse();
  return [...ascending, ...descending];
}

function isBlackMidiNote(midi) {
  return NOTES[(midi % 12 + 12) % 12].includes("#");
}

function getTriadArpeggioFingering(midiSequence, inversionIndex, hand = "right") {
  const leftPattern = [5, 3, 2, 1, 2, 3, 5];
  if (hand === "left") return leftPattern;

  const rootPattern = [1, 2, 3, 5, 3, 2, 1];
  const inversionPattern = [1, 2, 4, 5, 4, 2, 1];

  if (inversionIndex === 1) return inversionPattern;
  if (inversionIndex === 2) {
    return isBlackMidiNote(midiSequence[0]) ? inversionPattern : rootPattern;
  }
  return rootPattern;
}

function buildArpeggioPatternFromCell(cell) {
  const root = cell?.dataset?.root;
  const quality = cell?.dataset?.quality;
  const inversionIndex = Math.max(0, Number(cell?.dataset?.inversionIndex || 0));
  if (!root || !quality) return null;
  const baseTriad = buildTriadMidiFromQuality(root, quality, 3);
  const invertedTriad = invertChord(baseTriad, inversionIndex);
  const midiSequence = buildArpeggioSequence(invertedTriad);
  const notes = midiSequence.map((midi) => midiToNoteName(midi));
  const hand = el.handSelect?.value === "left" ? "left" : "right";
  const fingers = getTriadArpeggioFingering(midiSequence, inversionIndex, hand);
  return {
    root,
    quality,
    inversionIndex,
    midiSequence,
    notes,
    fingers,
    label: cell.dataset.label || `${root}${CHORDS[quality]?.short || ""}`
  };
}

async function playArpeggioCell(cell, options = {}) {
  const payload = buildArpeggioPatternFromCell(cell);
  if (!payload) return null;
  clearChordTableSelection();
  cell.classList.add("is-selected");
  await playPatternScheduled({
    notes: payload.notes,
    fingers: payload.fingers,
    startTimeSec: options.startTimeSec ?? null,
    showFingers: true,
    snapshot: options.snapshot !== false
  });
  return payload;
}

async function playArpeggioTableCellSequence(cells, label) {
  if (!Array.isArray(cells) || cells.length === 0) return;
  const playableCells = cells.filter((cell) => cell?.dataset?.root && cell?.dataset?.quality);
  if (playableCells.length === 0) return;
  const startCell = playableCells[0];
  const startRoot = startCell.dataset.root;
  const startQuality = startCell.dataset.quality;

  const sequenceToken = ++paletteSequenceToken;
  const stepSeconds = getStepSeconds();
  const baseLead = Math.max(0.01, getInteractiveStartLeadTimeSeconds());
  let nextStartSec = getSchedulerNowSeconds() + baseLead;

  for (let i = 0; i < playableCells.length; i += 1) {
    if (sequenceToken !== paletteSequenceToken) return;
    const cell = playableCells[i];
    const payload = await playArpeggioCell(cell, {
      startTimeSec: nextStartSec,
      snapshot: i === playableCells.length - 1
    });
    if (!payload) continue;
    const cellSeconds = stepSeconds * payload.notes.length;
    const gapSeconds = stepSeconds;
    nextStartSec += cellSeconds + gapSeconds;
    const waitMs = Math.max(0, Math.round((nextStartSec - getSchedulerNowSeconds()) * 1000));
    if (waitMs > 0) {
      await wait(waitMs);
    }
  }

  if (sequenceToken !== paletteSequenceToken) return;
  const beatSeconds = getHarmonyBeatSeconds();
  const resolveHold = Math.max(0.14, beatSeconds * 1.8);
  const resolvedMidi = buildChordMidi(startRoot, startQuality, "root position", 3).map((midi) => midi + 12);
  playCircularResolveAtStartCell(startCell, resolvedMidi, resolveHold);
  if (el.chordDisplay) {
    const resolvedLabel = `${startRoot}${CHORDS[startQuality]?.short || ""}`;
    el.chordDisplay.textContent = `${label}: arpeggio cycle complete -> ${resolvedLabel}↑`;
  }
  trackRep("arpeggios", label);
}

function getHarmonyBeatSeconds() {
  return Math.max(0.06, 60 / Math.max(30, Math.min(240, Number(appState.tempoBpm) || 80)));
}

function getHarmonySubdivisionSeconds() {
  const subdivision = Number(appState.subdivision);
  const normalized = Number.isFinite(subdivision) && subdivision > 0 ? subdivision : 1;
  return Math.max(0.02, getHarmonyBeatSeconds() * normalized);
}

function getHarmonyMeasureSeconds() {
  return getHarmonyBeatSeconds() * 4;
}

function getHarmonyStepDurationSeconds(step) {
  const rawBeats = Number(step?.beats);
  if (Number.isFinite(rawBeats) && rawBeats > 0) {
    return getHarmonyBeatSeconds() * rawBeats;
  }
  const rawMeasures = Number(step?.measures);
  const measures = Number.isFinite(rawMeasures) && rawMeasures > 0 ? rawMeasures : 1;
  return getHarmonyMeasureSeconds() * measures;
}

function getHarmonyEventDurationSeconds(eventPayload) {
  const steps = Array.isArray(eventPayload?.steps) ? eventPayload.steps : [];
  if (!steps.length) return 0;
  return steps.reduce((sum, step) => sum + getHarmonyStepDurationSeconds(step), 0);
}

async function ensureHarmonicPlaybackReady() {
  if (!ensureAudio()) return false;

  if (isToneEngineAvailable() && (!toneEngineReady || !toneSampler)) {
    await ensureToneEngine();
  }

  if (!toneEngineReady
    && shouldUseRnboPrimaryEngine()
    && !htmlSampleEngineActive
    && !rnboEngineActive
    && !rnboEngineFailedReason) {
    await initializeRnboEngine();
  }

  const canSchedule = (isToneEngineAvailable() && toneEngineReady && toneSampler)
    || (shouldUseRnboPrimaryEngine() && rnboEngineActive)
    || (sampleEngineReady && !htmlSampleEngineActive)
    || htmlSampleEngineActive;

  if (!canSchedule) {
    const engineStatus = `toneReady=${toneEngineReady} rnboActive=${rnboEngineActive} sampleReady=${sampleEngineReady} htmlActive=${htmlSampleEngineActive}`;
    console.warn(`[HarmonicPlayback] No audio engine available. ${engineStatus}`);
    if (el.chordDisplay) {
      el.chordDisplay.textContent = "Audio scheduler unavailable for harmonic playback.";
    }
  }
  return canSchedule;
}

function scheduleHarmonicChordAt(midiNotes, startTimeSec, holdSeconds, sequenceToken) {
  const midi = (Array.isArray(midiNotes) ? midiNotes : []).filter((note) => Number.isFinite(note));
  if (!midi.length) return;
  scheduleChordAtTime(midi, startTimeSec, holdSeconds, sequenceToken);
}

function scheduleChordAtTime(midiNotes, timeSec, durationSec, sequenceToken = paletteSequenceToken) {
  const midi = (Array.isArray(midiNotes) ? midiNotes : []).filter((note) => Number.isFinite(note));
  if (!midi.length) return;
  midi.forEach((note) => {
    scheduleSingleMidiNote(note, timeSec, durationSec, 0.8);
  });

  const nowSec = getSchedulerNowSeconds();
  const onDelayMs = Math.max(0, Math.round((timeSec - nowSec) * 1000));
  const highlightMs = Math.max(110, Math.round(durationSec * 1000));
  window.setTimeout(() => {
    if (sequenceToken !== paletteSequenceToken) return;
    highlightKeyboard(midi, highlightMs, true);
  }, onDelayMs);
}

function scheduleHarmonicCellSelection(cell, startTimeSec, durationSec, sequenceToken) {
  if (!cell) return;
  const nowSec = getSchedulerNowSeconds();
  const onDelayMs = Math.max(0, Math.round((startTimeSec - nowSec) * 1000));
  const offDelayMs = Math.max(onDelayMs + 40, Math.round((startTimeSec + durationSec - nowSec) * 1000));
  window.setTimeout(() => {
    if (sequenceToken !== paletteSequenceToken) return;
    clearChordTableSelection();
    cell.classList.add("is-selected");
  }, onDelayMs);
  window.setTimeout(() => {
    if (sequenceToken !== paletteSequenceToken) return;
    cell.classList.remove("is-selected");
  }, offDelayMs);
}

function scheduleHarmonicEventPlayback(eventPayload, startTimeSec, sequenceToken, cell = null) {
  if (!eventPayload || !Array.isArray(eventPayload.steps)) return startTimeSec;
  let cursor = startTimeSec;
  eventPayload.steps.forEach((step) => {
    const midi = Array.isArray(step?.midiNotes) && step.midiNotes.length
      ? step.midiNotes.filter((note) => Number.isFinite(note))
      : buildChordMidi(step.root, step.quality, "root position", 3);
    const stepDuration = getHarmonyStepDurationSeconds(step);
    const holdSeconds = Math.max(0.14, stepDuration * 0.9);
    scheduleHarmonicChordAt(midi, cursor, holdSeconds, sequenceToken);
    cursor += stepDuration;
  });
  if (cell) {
    scheduleHarmonicCellSelection(cell, startTimeSec, Math.max(0.12, cursor - startTimeSec), sequenceToken);
  }
  return cursor;
}

async function playHarmonicPaletteCell(cell, options = {}) {
  const eventPayload = getHarmonyCellEventFromCell(cell);
  if (!eventPayload) return null;
  const token = Number.isInteger(options.sequenceToken) ? options.sequenceToken : ++paletteSequenceToken;
  if (!options.skipEngineCheck) {
    const ready = await ensureHarmonicPlaybackReady();
    if (!ready) return null;
  }

  const nowSec = getSchedulerNowSeconds();
  const startTimeSec = Number.isFinite(options.startTimeSec)
    ? Math.max(options.startTimeSec, nowSec + 0.002)
    : nowSec + Math.max(0.01, getInteractiveStartLeadTimeSeconds());
  const endTimeSec = scheduleHarmonicEventPlayback(eventPayload, startTimeSec, token, cell);
  if (el.chordDisplay && options.updateOutput !== false) {
    el.chordDisplay.textContent = eventPayload.label;
  }
  return { eventPayload, startTimeSec, endTimeSec };
}

async function playHarmonicPaletteCellSequence(cells, label) {
  if (!Array.isArray(cells) || cells.length === 0) return;
  const playableCells = cells.filter((cell) => getHarmonyCellEventFromCell(cell));
  if (!playableCells.length) return;
  const startCell = playableCells[0];
  const startEvent = getHarmonyCellEventFromCell(startCell);
  const startStep = Array.isArray(startEvent?.steps) ? startEvent.steps[0] : null;
  const token = ++paletteSequenceToken;
  const ready = await ensureHarmonicPlaybackReady();
  if (!ready) return;

  let nextStartSec = getSchedulerNowSeconds() + Math.max(0.01, getInteractiveStartLeadTimeSeconds());
  playableCells.forEach((cell) => {
    const payload = getHarmonyCellEventFromCell(cell);
    if (!payload) return;
    nextStartSec = scheduleHarmonicEventPlayback(payload, nextStartSec, token, cell);
    nextStartSec += getHarmonySubdivisionSeconds();
  });

  const waitMs = Math.max(0, Math.round((nextStartSec - getSchedulerNowSeconds()) * 1000));
  if (waitMs > 0) {
    await wait(waitMs);
  }

  if (token !== paletteSequenceToken) return;
  if (startStep?.root && startStep?.quality) {
    const resolveHold = Math.max(0.14, getHarmonyBeatSeconds() * 1.8);
    const resolvedMidi = buildChordMidi(startStep.root, startStep.quality, "root position", 3).map((midi) => midi + 12);
    playCircularResolveAtStartCell(startCell, resolvedMidi, resolveHold);
  }
  if (el.chordDisplay) {
    const resolvedLabel = startStep?.root && startStep?.quality
      ? `${startStep.root}${CHORDS[startStep.quality]?.short || ""}↑`
      : "loop resolved";
    el.chordDisplay.textContent = `${label}: sweep complete -> ${resolvedLabel}`;
  }
  trackRep("chords", label);
}

function clearGuidedExerciseUiTimers() {
  guidedExerciseUiTimers.forEach((timerId) => window.clearTimeout(timerId));
  guidedExerciseUiTimers.clear();
}

function clearScheduledFallbackNoteTimers() {
  scheduledFallbackNoteTimers.forEach((timerId) => window.clearTimeout(timerId));
  scheduledFallbackNoteTimers.clear();
}

function registerGuidedExerciseUiTimer(timerId) {
  guidedExerciseUiTimers.add(timerId);
}

function stopAudioPoolMap(poolMap) {
  poolMap.forEach((pool) => {
    const voices = Array.isArray(pool?.voices) ? pool.voices : [];
    voices.forEach((voice) => {
      if (voice?.stopTimerId) {
        window.clearTimeout(voice.stopTimerId);
        voice.stopTimerId = null;
      }
      const audio = voice?.audio;
      if (!audio) return;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {
        // Ignore media teardown errors.
      }
    });
  });
}

function stopAllPlayback() {
  stopRepertoirePlayback({ preserveSelection: true, keepPausedState: false, resetPlayhead: false });
  cancelPaletteSequence();
  stopHarmonyExploration({ withResolution: false, clearLabel: true });
  clearExploreTimers();
  clearGuidedExerciseUiTimers();
  clearScheduledFallbackNoteTimers();
  clearPatternUiTimers();
  clearFingerOverlays();
  clearProgressionStep();
  clearCadenceStep();
  clearKeyboardHighlights();
  clearChordTableSelection();
  stopTheoryLessonAudio();
  if (toneSampler && typeof toneSampler.releaseAll === "function") {
    try {
      toneSampler.releaseAll();
    } catch {
      // Ignore tone release errors.
    }
  }
  stopAudioPoolMap(htmlSamplePools);
  stopAudioPoolMap(chordAssetHtmlPools);
}

function waitGuidedExercise(ms, token) {
  const safeMs = Math.max(0, Number(ms) || 0);
  return new Promise((resolve) => {
    const timerId = window.setTimeout(() => {
      guidedExerciseUiTimers.delete(timerId);
      resolve(token === paletteSequenceToken);
    }, safeMs);
    registerGuidedExerciseUiTimer(timerId);
  });
}

function isGuidedExerciseTokenActive(token) {
  return token === paletteSequenceToken;
}

function setGuidedExerciseInstruction(text) {
  if (!el.exerciseInstruction) return;
  el.exerciseInstruction.textContent = String(text || "");
}

function getGuidedExerciseContext() {
  const key = el.keySelect?.value || appState.root;
  const rootI = key;
  const rootIi = majorDegreeRoot(key, 1);
  const rootIv = majorDegreeRoot(key, 3);
  const rootV = majorDegreeRoot(key, 4);
  const rootVi = majorDegreeRoot(key, 5);
  const rootFlatVii = keyOffsetRoot(key, 10);
  const rootFlatIi = keyOffsetRoot(rootV, 6);
  return {
    key,
    rootI,
    rootIi,
    rootIv,
    rootV,
    rootVi,
    rootFlatVii,
    rootFlatIi
  };
}

function buildGuidedDominantLadderMidi(root, level) {
  const rootMidi = 12 * (3 + 1) + NOTES.indexOf(root);
  const build = (intervals) => Array.from(new Set(intervals.map((interval) => rootMidi + interval))).sort((a, b) => a - b);
  const safeLevel = Math.max(0, Math.min(3, Number(level) || 0));
  if (safeLevel === 0) return buildChordMidi(root, "dom7", "root position", 3);
  if (safeLevel === 1) return build([0, 4, 7, 10, 14]);       // add 9
  if (safeLevel === 2) return build([0, 4, 7, 10, 13, 18]);   // add b9 + #11
  return buildAlteredDominantMidi(root, 3);                   // strongest altered color
}

async function playGuidedExerciseChordSteps(steps, token) {
  const ready = await ensureHarmonicPlaybackReady();
  if (!ready || !isGuidedExerciseTokenActive(token)) return false;

  for (let i = 0; i < steps.length; i += 1) {
    if (!isGuidedExerciseTokenActive(token)) return false;
    const step = steps[i];
    if (!step) continue;
    if (Number.isFinite(step.pauseBeats) && step.pauseBeats > 0) {
      const pauseMs = Math.round(getHarmonyBeatSeconds() * step.pauseBeats * 1000);
      const stillActive = await waitGuidedExercise(pauseMs, token);
      if (!stillActive) return false;
      continue;
    }
    const stepDurationSec = getHarmonyStepDurationSeconds(step);
    const holdSeconds = Math.max(0.14, stepDurationSec * 0.9);
    const startTimeSec = getSchedulerNowSeconds() + Math.max(0.01, getInteractiveStartLeadTimeSeconds());
    const midiNotes = Array.isArray(step.midiNotes) && step.midiNotes.length
      ? step.midiNotes
      : buildChordMidi(step.root, step.quality, "root position", 3);
    scheduleChordAtTime(midiNotes, startTimeSec, holdSeconds, token);
    const waitMs = Math.max(60, Math.round(stepDurationSec * 1000));
    const stillActive = await waitGuidedExercise(waitMs, token);
    if (!stillActive) return false;
  }

  return isGuidedExerciseTokenActive(token);
}

async function playGuidedExerciseScale(root, intervals, token, options = {}) {
  if (!isGuidedExerciseTokenActive(token)) return false;
  const ascending = buildAscendingScaleMidiFromIntervals(root, intervals, 3, true);
  const sequence = buildAscendingDescendingSequence(ascending);
  const notes = sequence.map((midi) => midiToNoteName(midi));
  const showFingers = options.showFingers === true;
  const fingers = showFingers ? buildScaleFingering(notes, "right") : null;
  await playPatternScheduled({
    notes,
    fingers,
    showFingers,
    snapshot: false
  });
  return isGuidedExerciseTokenActive(token);
}

async function playGuidedExerciseArpeggio(root, quality, inversionIndex, token) {
  if (!isGuidedExerciseTokenActive(token)) return false;
  const triad = buildTriadMidiFromQuality(root, quality, 3);
  const inverted = invertChord(triad, inversionIndex);
  const midiSequence = buildArpeggioSequence(inverted);
  const notes = midiSequence.map((midi) => midiToNoteName(midi));
  const fingers = getTriadArpeggioFingering(midiSequence, inversionIndex, "right");
  await playPatternScheduled({
    notes,
    fingers,
    showFingers: true,
    snapshot: false
  });
  return isGuidedExerciseTokenActive(token);
}

async function runExercisePowerOfResolution(token, ctx) {
  return playGuidedExerciseChordSteps([
    { root: ctx.rootI, quality: "major", beats: 2 },
    { root: ctx.rootIv, quality: "major", beats: 2 },
    { root: ctx.rootI, quality: "major", beats: 2 },
    { pauseBeats: 1 },
    { root: ctx.rootI, quality: "major", beats: 2 },
    { root: ctx.rootV, quality: "dom7", beats: 2 },
    { root: ctx.rootI, quality: "major", beats: 2 },
    { pauseBeats: 1 },
    { root: ctx.rootI, quality: "major", beats: 2 },
    { root: ctx.rootV, quality: "dom7", beats: 2, midiNotes: buildAlteredDominantMidi(ctx.rootV, 3) },
    { root: ctx.rootI, quality: "major", beats: 2 }
  ], token);
}

async function runExerciseTensionLadder(token, ctx) {
  return playGuidedExerciseChordSteps([
    { root: ctx.rootV, quality: "dom7", measures: 1, midiNotes: buildGuidedDominantLadderMidi(ctx.rootV, 0) },
    { root: ctx.rootV, quality: "dom7", measures: 1, midiNotes: buildGuidedDominantLadderMidi(ctx.rootV, 1) },
    { root: ctx.rootV, quality: "dom7", measures: 1, midiNotes: buildGuidedDominantLadderMidi(ctx.rootV, 2) },
    { root: ctx.rootV, quality: "dom7", measures: 1, midiNotes: buildGuidedDominantLadderMidi(ctx.rootV, 3) },
    { root: ctx.rootV, quality: "dom7", beats: 2 },
    { root: ctx.rootI, quality: "major", beats: 2 }
  ], token);
}

async function runExerciseSecondarySpotlight(token, ctx) {
  const rootVofIi = keyOffsetRoot(ctx.rootIi, 7);
  const rootVofV = keyOffsetRoot(ctx.rootV, 7);
  return playGuidedExerciseChordSteps([
    { root: ctx.rootIi, quality: "minor", beats: 2 },
    { root: rootVofIi, quality: "dom7", beats: 2 },
    { root: ctx.rootIi, quality: "minor", beats: 2 },
    { root: rootVofV, quality: "dom7", beats: 2 },
    { root: ctx.rootV, quality: "dom7", beats: 2 },
    { root: ctx.rootI, quality: "major", beats: 2 }
  ], token);
}

async function runExerciseBorrowedMoodShift(token, ctx) {
  const rootFlatVi = keyOffsetRoot(ctx.key, 8);
  return playGuidedExerciseChordSteps([
    { root: ctx.rootI, quality: "major", beats: 2 },
    { root: ctx.rootIv, quality: "major", beats: 2 },
    { root: ctx.rootI, quality: "major", beats: 2 },
    { root: ctx.rootI, quality: "major", beats: 2 },
    { root: ctx.rootIv, quality: "minor", beats: 2 },
    { root: ctx.rootI, quality: "major", beats: 2 },
    { root: ctx.rootI, quality: "major", beats: 2 },
    { root: rootFlatVi, quality: "major", beats: 2 },
    { root: ctx.rootV, quality: "dom7", beats: 2 },
    { root: ctx.rootI, quality: "major", beats: 2 }
  ], token);
}

async function runExerciseTritoneSurprise(token, ctx) {
  return playGuidedExerciseChordSteps([
    { root: ctx.rootV, quality: "dom7", beats: 2 },
    { root: ctx.rootI, quality: "major", beats: 2 },
    { pauseBeats: 1 },
    { root: ctx.rootFlatIi, quality: "dom7", beats: 2 },
    { root: ctx.rootI, quality: "major", beats: 2 }
  ], token);
}

async function runExerciseIiVIBuild(token, ctx) {
  return playGuidedExerciseChordSteps([
    { root: ctx.rootIi, quality: "minor", beats: 2 },
    { root: ctx.rootV, quality: "dom7", beats: 2 },
    { root: ctx.rootI, quality: "major", beats: 2 },
    { root: ctx.rootIi, quality: "minor", beats: 2 },
    { root: ctx.rootV, quality: "dom7", beats: 2 },
    { root: ctx.rootI, quality: "major", beats: 2 },
    { root: ctx.rootVi, quality: "minor", beats: 2 },
    { root: ctx.rootIi, quality: "minor", beats: 2 },
    { root: ctx.rootV, quality: "dom7", beats: 2 },
    { root: ctx.rootI, quality: "major", beats: 2 }
  ], token);
}

async function runExerciseModalColorContrast(token, ctx) {
  const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
  const dorianIntervals = [0, 2, 3, 5, 7, 9, 10];
  const lydianIntervals = [0, 2, 4, 6, 7, 9, 11];
  const sequences = [majorIntervals, dorianIntervals, lydianIntervals];
  for (let i = 0; i < sequences.length; i += 1) {
    const ok = await playGuidedExerciseScale(ctx.key, sequences[i], token, { showFingers: false });
    if (!ok) return false;
    const chordOk = await playGuidedExerciseChordSteps([
      { root: ctx.rootI, quality: "major", beats: 2 }
    ], token);
    if (!chordOk) return false;
  }
  return isGuidedExerciseTokenActive(token);
}

async function runExerciseWholeToneAtmosphere(token, ctx) {
  const wholeToneIntervals = [0, 2, 4, 6, 8, 10];
  const ok = await playGuidedExerciseScale(ctx.key, wholeToneIntervals, token, { showFingers: false });
  if (!ok) return false;
  const rootMidi = 12 * (3 + 1) + NOTES.indexOf(ctx.key);
  const cluster = [0, 2, 4, 6].map((interval) => rootMidi + interval);
  return playGuidedExerciseChordSteps([
    { root: ctx.key, quality: "major", beats: 2, midiNotes: cluster },
    { root: ctx.rootI, quality: "major", beats: 2 }
  ], token);
}

async function runExerciseArpeggioArchitecture(token, ctx) {
  const steps = [
    { root: ctx.rootI, quality: "major", inversion: 0 },
    { root: ctx.rootI, quality: "major", inversion: 1 },
    { root: ctx.rootI, quality: "major", inversion: 2 },
    { root: ctx.rootIi, quality: "minor", inversion: 0 },
    { root: ctx.rootV, quality: "major", inversion: 0 },
    { root: ctx.rootI, quality: "major", inversion: 0 }
  ];
  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i];
    const ok = await playGuidedExerciseArpeggio(step.root, step.quality, step.inversion, token);
    if (!ok) return false;
    const stillActive = await waitGuidedExercise(Math.round(getHarmonyBeatSeconds() * 1000), token);
    if (!stillActive) return false;
  }
  return isGuidedExerciseTokenActive(token);
}

async function runExerciseCadenceLab(token, ctx) {
  return playGuidedExerciseChordSteps([
    { root: ctx.rootV, quality: "dom7", beats: 2 },
    { root: ctx.rootI, quality: "major", beats: 2 },
    { root: ctx.rootIv, quality: "major", beats: 2 },
    { root: ctx.rootI, quality: "major", beats: 2 },
    { root: ctx.rootV, quality: "dom7", beats: 2 },
    { root: ctx.rootVi, quality: "minor", beats: 2 },
    { root: ctx.rootFlatVii, quality: "dom7", beats: 2 },
    { root: ctx.rootI, quality: "major", beats: 2 }
  ], token);
}

function getGuidedExerciseRegistry() {
  return {
    power: {
      instruction: "Notice how dominant tension increases anticipation.",
      run: runExercisePowerOfResolution
    },
    tension: {
      instruction: "More tension creates stronger release.",
      run: runExerciseTensionLadder
    },
    secondary: {
      instruction: "Temporary tonicization shifts the center.",
      run: runExerciseSecondarySpotlight
    },
    borrowed: {
      instruction: "Parallel minor changes emotional color.",
      run: runExerciseBorrowedMoodShift
    },
    tritone: {
      instruction: "Different path. Same destination.",
      run: runExerciseTritoneSurprise
    },
    "ii-v-i": {
      instruction: "Forward motion through harmonic gravity.",
      run: runExerciseIiVIBuild
    },
    modal: {
      instruction: "Same root. Different universe.",
      run: runExerciseModalColorContrast
    },
    whole: {
      instruction: "Gravity dissolves in symmetry.",
      run: runExerciseWholeToneAtmosphere
    },
    arpeggio: {
      instruction: "Voice leading lives inside inversion.",
      run: runExerciseArpeggioArchitecture
    },
    cadence: {
      instruction: "Resolution takes many forms.",
      run: runExerciseCadenceLab
    }
  };
}

async function runGuidedExercise(exerciseId) {
  const registry = getGuidedExerciseRegistry();
  const entry = registry[String(exerciseId || "").trim()];
  if (!entry) return;
  repertoireState.activeExerciseId = String(exerciseId);
  updateExerciseRelatedStudyButton();
  highlightActiveExerciseButton();
  stopAllPlayback();
  const token = paletteSequenceToken;
  const context = getGuidedExerciseContext();
  setGuidedExerciseInstruction(entry.instruction);
  if (el.chordDisplay) {
    el.chordDisplay.textContent = `Exercise: ${entry.instruction}`;
  }
  await entry.run(token, context);
}

function normalizePitchClassName(raw) {
  const token = String(raw || "").trim();
  if (!token) return "";
  const first = token[0]?.toUpperCase?.() || "";
  const accidental = token.slice(1).replace(/\s+/g, "");
  const normalized = `${first}${accidental}`;
  return FLAT_TO_SHARP[normalized] || normalized;
}

function normalizeNoteToken(note) {
  const token = String(note || "").trim();
  const match = /^([A-Ga-g])([#b]?)(-?\d+)$/.exec(token);
  if (!match) return token;
  const pitch = normalizePitchClassName(`${match[1].toUpperCase()}${match[2] || ""}`);
  return `${pitch}${match[3]}`;
}

function getPitchClassIndex(raw) {
  const normalized = normalizePitchClassName(raw);
  return NOTES.indexOf(normalized);
}

function clampMidiRange(midi) {
  const value = Math.round(Number(midi));
  if (!Number.isFinite(value)) return null;
  return Math.max(21, Math.min(108, value));
}

function getRepertoireTransposeSemitones(item) {
  const selectedKey = appState.root || el.keySelect?.value || "C";
  const itemKey = normalizePitchClassName(item?.defaultKey || selectedKey);
  const selectedIdx = getPitchClassIndex(selectedKey);
  const itemIdx = getPitchClassIndex(itemKey);
  if (selectedIdx < 0 || itemIdx < 0) return 0;
  return selectedIdx - itemIdx;
}

function classifyRepertoireTrackRoleByName(trackName = "") {
  const text = String(trackName || "").toLowerCase();
  if (!text) return "";
  if (text.includes("melody") || text.includes("lead") || text.includes("right")) return "melody";
  if (text.includes("bass") || text.includes("left")) return "bass";
  if (text.includes("drum") || text.includes("perc")) return "drums";
  if (text.includes("pad") || text.includes("string")) return "pad";
  return "";
}

function buildRepertoireCacheKey(item) {
  const midiUrl = item?.arrangement?.midi?.url || "";
  return `${item?.id || "unknown"}::${midiUrl}`;
}

function buildRepertoireMidiFetchUrl(rawUrl) {
  const url = String(rawUrl || "").trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) {
    return `${REPERTOIRE_MIDI_PROXY_ENDPOINT}?url=${encodeURIComponent(url)}`;
  }
  return url;
}

async function getRepertoireCacheDb() {
  if (repertoireState.dbPromise) return repertoireState.dbPromise;
  if (!("indexedDB" in window)) return null;
  repertoireState.dbPromise = new Promise((resolve) => {
    const request = indexedDB.open(REPERTOIRE_CACHE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(REPERTOIRE_CACHE_STORE)) {
        db.createObjectStore(REPERTOIRE_CACHE_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
  return repertoireState.dbPromise;
}

async function readRepertoireCacheEntry(cacheKey) {
  try {
    const db = await getRepertoireCacheDb();
    if (!db) return null;
    return await new Promise((resolve) => {
      const tx = db.transaction(REPERTOIRE_CACHE_STORE, "readonly");
      const store = tx.objectStore(REPERTOIRE_CACHE_STORE);
      const req = store.get(cacheKey);
      req.onsuccess = () => resolve(req.result?.payload || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function writeRepertoireCacheEntry(cacheKey, payload) {
  try {
    const db = await getRepertoireCacheDb();
    if (!db) return false;
    return await new Promise((resolve) => {
      const tx = db.transaction(REPERTOIRE_CACHE_STORE, "readwrite");
      const store = tx.objectStore(REPERTOIRE_CACHE_STORE);
      store.put({
        id: cacheKey,
        payload,
        updatedAt: Date.now()
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    });
  } catch {
    return false;
  }
}

function parseMidiVarInt(view, state) {
  let value = 0;
  for (let i = 0; i < 4; i += 1) {
    if (state.offset >= view.byteLength) return value;
    const byte = view.getUint8(state.offset);
    state.offset += 1;
    value = (value << 7) | (byte & 0x7f);
    if ((byte & 0x80) === 0) return value;
  }
  return value;
}

function parseMidiString(view, state, length) {
  const safeLength = Math.max(0, Math.min(length, view.byteLength - state.offset));
  const bytes = new Uint8Array(view.buffer, view.byteOffset + state.offset, safeLength);
  state.offset += safeLength;
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(bytes);
}

function parseMidiArrayBufferToEvents(arrayBuffer, fallbackBpm = 80) {
  const view = new DataView(arrayBuffer);
  const state = { offset: 0 };
  const readU16 = () => {
    const value = view.getUint16(state.offset);
    state.offset += 2;
    return value;
  };
  const readU32 = () => {
    const value = view.getUint32(state.offset);
    state.offset += 4;
    return value;
  };
  const readU8 = () => {
    const value = view.getUint8(state.offset);
    state.offset += 1;
    return value;
  };
  const readChunkHeader = () => {
    const id = parseMidiString(view, state, 4);
    const length = readU32();
    return { id, length };
  };

  const headerChunk = readChunkHeader();
  if (headerChunk.id !== "MThd") {
    throw new Error("Invalid MIDI header.");
  }
  const headerEnd = state.offset + headerChunk.length;
  const format = readU16();
  const trackCount = readU16();
  const division = readU16();
  state.offset = headerEnd;

  const defaultTempoMicros = Math.round(60_000_000 / Math.max(30, Math.min(240, Number(fallbackBpm) || 80)));
  const ppq = (division & 0x8000) === 0 ? Math.max(1, division) : 480;
  const tempoMap = [{ tick: 0, microPerQuarter: defaultTempoMicros }];
  const noteEvents = [];
  const trackStats = new Map();

  const totalTracks = format === 0 ? 1 : trackCount;
  for (let trackIndex = 0; trackIndex < totalTracks; trackIndex += 1) {
    if (state.offset >= view.byteLength) break;
    const trackChunk = readChunkHeader();
    if (trackChunk.id !== "MTrk") {
      state.offset += trackChunk.length;
      continue;
    }

    const trackEnd = state.offset + trackChunk.length;
    let tick = 0;
    let runningStatus = null;
    let trackName = "";
    const activeNotes = new Map();

    while (state.offset < trackEnd) {
      const delta = parseMidiVarInt(view, state);
      tick += delta;
      if (state.offset >= trackEnd) break;

      let statusByte = readU8();
      if (statusByte < 0x80) {
        if (runningStatus === null) break;
        state.offset -= 1;
        statusByte = runningStatus;
      } else {
        runningStatus = statusByte;
      }

      if (statusByte === 0xff) {
        runningStatus = null;
        if (state.offset >= trackEnd) break;
        const metaType = readU8();
        const metaLength = parseMidiVarInt(view, state);
        if (metaType === 0x03) {
          trackName = parseMidiString(view, state, metaLength);
          continue;
        }
        if (metaType === 0x51 && metaLength === 3 && state.offset + 3 <= trackEnd) {
          const microPerQuarter = (readU8() << 16) | (readU8() << 8) | readU8();
          if (microPerQuarter > 0) {
            tempoMap.push({ tick, microPerQuarter });
          }
          continue;
        }
        state.offset += Math.max(0, Math.min(metaLength, trackEnd - state.offset));
        continue;
      }

      if (statusByte === 0xf0 || statusByte === 0xf7) {
        runningStatus = null;
        const sysexLength = parseMidiVarInt(view, state);
        state.offset += Math.max(0, Math.min(sysexLength, trackEnd - state.offset));
        continue;
      }

      const eventType = statusByte & 0xf0;
      const channel = statusByte & 0x0f;
      if (eventType === 0xc0 || eventType === 0xd0) {
        if (state.offset < trackEnd) readU8();
        continue;
      }

      if (state.offset + 2 > trackEnd) break;
      const note = readU8();
      const velocity = readU8();
      const noteKey = `${channel}:${note}`;
      const roleByName = classifyRepertoireTrackRoleByName(trackName);

      if (eventType === 0x90 && velocity > 0) {
        if (!activeNotes.has(noteKey)) activeNotes.set(noteKey, []);
        activeNotes.get(noteKey).push({
          tick,
          velocity,
          trackIndex,
          trackName,
          role: roleByName
        });
        continue;
      }

      if (eventType === 0x80 || (eventType === 0x90 && velocity === 0)) {
        const stack = activeNotes.get(noteKey);
        if (!stack || !stack.length) continue;
        const start = stack.pop();
        const durationTicks = Math.max(1, tick - start.tick);
        noteEvents.push({
          startTick: start.tick,
          durationTicks,
          midi: note,
          velocity: start.velocity / 127,
          channel,
          trackIndex,
          trackName: start.trackName || trackName || "",
          role: start.role || roleByName || ""
        });
      }
    }

    const trackRole = classifyRepertoireTrackRoleByName(trackName);
    trackStats.set(trackIndex, {
      name: trackName,
      role: trackRole
    });

    activeNotes.forEach((stack, noteKey) => {
      const [channelToken, noteToken] = noteKey.split(":");
      while (stack.length) {
        const start = stack.pop();
        const durationTicks = Math.max(1, tick - start.tick);
        noteEvents.push({
          startTick: start.tick,
          durationTicks,
          midi: Number(noteToken),
          velocity: start.velocity / 127,
          channel: Number(channelToken),
          trackIndex,
          trackName: start.trackName || trackName || "",
          role: start.role || trackRole || ""
        });
      }
    });

    state.offset = trackEnd;
  }

  noteEvents.sort((a, b) => {
    if (a.startTick !== b.startTick) return a.startTick - b.startTick;
    if (a.trackIndex !== b.trackIndex) return a.trackIndex - b.trackIndex;
    return a.midi - b.midi;
  });

  const byTrack = new Map();
  noteEvents.forEach((event) => {
    if (!byTrack.has(event.trackIndex)) {
      byTrack.set(event.trackIndex, { noteCount: 0, midiSum: 0, explicitRole: event.role || "" });
    }
    const stat = byTrack.get(event.trackIndex);
    stat.noteCount += 1;
    stat.midiSum += event.midi;
    if (!stat.explicitRole && event.role) {
      stat.explicitRole = event.role;
    }
  });

  let melodyTrack = -1;
  let melodyAvg = -Infinity;
  byTrack.forEach((stat, trackIndex) => {
    const avg = stat.noteCount > 0 ? stat.midiSum / stat.noteCount : -Infinity;
    if (avg > melodyAvg) {
      melodyAvg = avg;
      melodyTrack = trackIndex;
    }
  });

  const events = noteEvents.map((event) => {
    const trackInfo = byTrack.get(event.trackIndex) || { explicitRole: "" };
    let role = event.role || trackInfo.explicitRole || "";
    if (!role && melodyTrack >= 0 && event.trackIndex === melodyTrack) {
      role = "melody";
    }
    return {
      startBeat: event.startTick / ppq,
      durationBeats: Math.max(1 / 24, event.durationTicks / ppq),
      midi: event.midi,
      velocity: Math.max(0.2, Math.min(1, Number(event.velocity) || 0.8)),
      channel: event.channel,
      trackIndex: event.trackIndex,
      trackName: event.trackName || trackStats.get(event.trackIndex)?.name || "",
      role
    };
  });

  const polyphonyAtBeat = new Map();
  events.forEach((event) => {
    const key = event.startBeat.toFixed(4);
    polyphonyAtBeat.set(key, (polyphonyAtBeat.get(key) || 0) + 1);
  });
  events.forEach((event) => {
    event.polyphony = polyphonyAtBeat.get(event.startBeat.toFixed(4)) || 1;
  });

  const durationBeats = events.reduce((max, event) => {
    return Math.max(max, event.startBeat + event.durationBeats);
  }, 0);

  return {
    ppq,
    tempoMap,
    trackFormat: format,
    events,
    durationBeats
  };
}

function parseEmbeddedMidiEvents(rawEvents = []) {
  const sourceEvents = Array.isArray(rawEvents) ? rawEvents : [];
  const active = new Map();
  const notes = [];
  sourceEvents.forEach((raw) => {
    const type = String(raw?.type || "").toLowerCase();
    const t = Number(raw?.t);
    const noteToken = normalizeNoteToken(raw?.note);
    const noteMidi = noteNameToMidi(noteToken);
    if (!Number.isFinite(t) || !Number.isFinite(noteMidi)) return;
    const channel = Number(raw?.ch) || 0;
    const key = `${channel}:${noteMidi}`;
    if (type === "note_on" && Number(raw?.vel) > 0) {
      if (!active.has(key)) active.set(key, []);
      active.get(key).push({
        t,
        vel: Math.max(0.15, Math.min(1, Number(raw?.vel) || 0.8)),
        channel
      });
      return;
    }
    if (type === "note_off" || (type === "note_on" && Number(raw?.vel) === 0)) {
      const stack = active.get(key);
      if (!stack || !stack.length) return;
      const start = stack.pop();
      notes.push({
        startBeat: start.t,
        durationBeats: Math.max(1 / 24, t - start.t),
        midi: noteMidi,
        velocity: start.vel,
        channel,
        trackIndex: Number(raw?.track) || 0,
        trackName: String(raw?.trackName || ""),
        role: classifyRepertoireTrackRoleByName(raw?.trackName || "")
      });
    }
  });

  notes.sort((a, b) => a.startBeat - b.startBeat || a.midi - b.midi);
  const polyphonyAtBeat = new Map();
  notes.forEach((event) => {
    const key = event.startBeat.toFixed(4);
    polyphonyAtBeat.set(key, (polyphonyAtBeat.get(key) || 0) + 1);
  });
  notes.forEach((event) => {
    event.polyphony = polyphonyAtBeat.get(event.startBeat.toFixed(4)) || 1;
  });
  const durationBeats = notes.reduce((max, event) => {
    return Math.max(max, event.startBeat + event.durationBeats);
  }, 0);
  return {
    events: notes,
    durationBeats
  };
}

function parseChordSymbolToken(chordToken) {
  const token = String(chordToken || "").trim();
  const match = /^([A-Ga-g])([#b]?)(.*)$/.exec(token);
  if (!match) return null;
  const root = normalizePitchClassName(`${match[1].toUpperCase()}${match[2] || ""}`);
  const suffix = String(match[3] || "").trim();
  const normalized = suffix.toLowerCase().replace(/\s+/g, "");
  let quality = "major";
  if (!normalized || normalized === "maj") quality = "major";
  else if (normalized === "m" || normalized === "min") quality = "minor";
  else if (normalized === "7" || normalized === "dom7") quality = "dom7";
  else if (normalized === "maj7" || normalized === "ma7" || normalized === "delta7") quality = "maj7";
  else if (normalized === "m7" || normalized === "min7" || normalized === "-7") quality = "min7";
  else if (normalized === "dim" || normalized === "o" || normalized === "°") quality = "diminished";
  else if (normalized === "m7b5" || normalized === "ø" || normalized === "halfdim") quality = "m7b5";
  else if (normalized === "sus2") quality = "sus2";
  else if (normalized === "sus4" || normalized === "sus") quality = "sus4";
  else if (normalized === "+" || normalized === "aug") quality = "augmented";
  return {
    root,
    quality,
    suffix
  };
}

function applyProgressionVoicing(midiNotes, quality, voicing = "close") {
  const midi = (Array.isArray(midiNotes) ? midiNotes : []).filter((note) => Number.isFinite(note)).slice().sort((a, b) => a - b);
  if (!midi.length) return [];
  if (voicing === "shell") {
    if (["maj7", "min7", "dom7", "m7b5"].includes(quality) && midi.length >= 4) {
      return [midi[0], midi[1], midi[midi.length - 1]];
    }
    if (midi.length >= 3) {
      return [midi[0], midi[1], midi[2] + 12];
    }
  }
  if (voicing === "open") {
    if (midi.length >= 3) {
      return [midi[0], midi[1] + 12, midi[midi.length - 1]];
    }
  }
  return midi;
}

function prepareChordProgressionItem(item) {
  const progression = Array.isArray(item?.arrangement?.progression) ? item.arrangement.progression : [];
  let beatCursor = 0;
  const chordSteps = progression.map((step, index) => {
    const parsed = parseChordSymbolToken(step?.chord || "");
    if (!parsed) return null;
    const beats = Math.max(1 / 4, Number(step?.beats) || 4);
    const baseMidi = buildChordMidi(parsed.root, parsed.quality, "root position", 3);
    const voicing = String(step?.voicing || "close");
    const voicedMidi = applyProgressionVoicing(baseMidi, parsed.quality, voicing);
    const payload = {
      id: `${item.id}-step-${index}`,
      startBeat: beatCursor,
      beats,
      root: parsed.root,
      quality: parsed.quality,
      midi: voicedMidi,
      style: String(step?.style || "default"),
      voicing,
      label: `${parsed.root}${CHORDS[parsed.quality]?.short || ""}`
    };
    beatCursor += beats;
    return payload;
  }).filter(Boolean);
  const durationBeats = chordSteps.reduce((sum, step) => Math.max(sum, step.startBeat + step.beats), 0);
  return {
    id: item.id,
    type: "chord_progression",
    sourceItem: item,
    chordSteps,
    durationBeats
  };
}

async function fetchMidiDataForRepertoireItem(item) {
  const midiUrl = item?.arrangement?.midi?.url;
  const requestUrl = buildRepertoireMidiFetchUrl(midiUrl);
  if (!requestUrl) throw new Error("MIDI URL missing.");
  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error(`MIDI fetch failed (${response.status}).`);
  }
  return response.arrayBuffer();
}

async function prepareMidiFileItem(item) {
  const cacheKey = buildRepertoireCacheKey(item);
  if (repertoireState.midiMemoryCache.has(cacheKey)) {
    const memoryPayload = repertoireState.midiMemoryCache.get(cacheKey);
    return {
      id: item.id,
      type: "midi_events",
      sourceItem: item,
      noteEvents: memoryPayload.events,
      durationBeats: memoryPayload.durationBeats
    };
  }

  const dbPayload = await readRepertoireCacheEntry(cacheKey);
  if (dbPayload?.events?.length) {
    repertoireState.midiMemoryCache.set(cacheKey, dbPayload);
    return {
      id: item.id,
      type: "midi_events",
      sourceItem: item,
      noteEvents: dbPayload.events,
      durationBeats: dbPayload.durationBeats
    };
  }

  const arrayBuffer = await fetchMidiDataForRepertoireItem(item);
  const parsed = parseMidiArrayBufferToEvents(arrayBuffer, Number(item?.defaultBpm) || 80);
  const payload = {
    events: parsed.events,
    durationBeats: parsed.durationBeats,
    ppq: parsed.ppq,
    tempoMap: parsed.tempoMap
  };
  repertoireState.midiMemoryCache.set(cacheKey, payload);
  void writeRepertoireCacheEntry(cacheKey, payload);
  return {
    id: item.id,
    type: "midi_events",
    sourceItem: item,
    noteEvents: payload.events,
    durationBeats: payload.durationBeats
  };
}

function prepareEmbeddedMidiItem(item) {
  const normalized = parseEmbeddedMidiEvents(item?.arrangement?.events || []);
  return {
    id: item.id,
    type: "midi_events",
    sourceItem: item,
    noteEvents: normalized.events,
    durationBeats: normalized.durationBeats
  };
}

async function prepareRepertoireItem(item) {
  if (!item) return null;
  const arrangementType = String(item?.arrangement?.type || "").toLowerCase();
  if (arrangementType === "chord_progression") {
    return prepareChordProgressionItem(item);
  }
  if (arrangementType === "midi_events") {
    return prepareEmbeddedMidiItem(item);
  }
  return prepareMidiFileItem(item);
}

function normalizeRepertoireItem(rawItem) {
  const item = rawItem && typeof rawItem === "object" ? rawItem : {};
  const id = String(item.id || "").trim();
  if (!id) return null;
  const genre = String(item.genre || "study").trim() || "study";
  const loop = item.loop && typeof item.loop === "object" ? item.loop : {};
  return {
    ...item,
    id,
    title: String(item.title || id),
    composerOrSource: String(item.composerOrSource || "Unknown"),
    genre,
    tags: Array.isArray(item.tags) ? item.tags.map((tag) => String(tag)).filter(Boolean) : [],
    difficulty: Math.max(1, Math.min(5, Number(item.difficulty) || 1)),
    defaultKey: normalizePitchClassName(item.defaultKey || "C") || "C",
    defaultBpm: Math.max(30, Math.min(240, Number(item.defaultBpm) || 80)),
    loop: {
      enabled: loop.enabled !== false,
      startBeat: Math.max(0, Number(loop.startBeat) || 0),
      endBeat: Math.max(1, Number(loop.endBeat) || 16)
    },
    lessonLinks: Array.isArray(item.lessonLinks) ? item.lessonLinks : [],
    ui: item.ui && typeof item.ui === "object" ? item.ui : { description: "", section: "", showInFeatured: false }
  };
}

function readRepertoireSeedFromWindow() {
  const seed = window.BABY_STEPS_REPERTOIRE_SEED;
  if (!seed || typeof seed !== "object") return null;
  const itemsJson = Array.isArray(seed.items) ? seed.items : [];
  const stylesJson = seed.styles && typeof seed.styles === "object" ? seed.styles : {};
  const normalizedItems = itemsJson
    .map(normalizeRepertoireItem)
    .filter(Boolean);
  if (!normalizedItems.length) return null;
  return {
    items: normalizedItems,
    styles: stylesJson,
    source: "seed"
  };
}

function isFileProtocolMode() {
  return window.location.protocol === "file:";
}

async function loadRepertoireLibrary() {
  const seedFallback = readRepertoireSeedFromWindow();
  if (isFileProtocolMode() && seedFallback) {
    return seedFallback;
  }
  try {
    const [itemsResponse, stylesResponse] = await Promise.all([
      fetch(REPERTOIRE_DATA_URL),
      fetch(REPERTOIRE_STYLES_DATA_URL)
    ]);
    if (!itemsResponse.ok) {
      throw new Error(`Failed to load repertoire data (${itemsResponse.status}).`);
    }
    if (!stylesResponse.ok) {
      throw new Error(`Failed to load repertoire styles (${stylesResponse.status}).`);
    }
    const [itemsJson, stylesJson] = await Promise.all([
      itemsResponse.json(),
      stylesResponse.json()
    ]);
    const normalizedItems = (Array.isArray(itemsJson) ? itemsJson : [])
      .map(normalizeRepertoireItem)
      .filter(Boolean);
    return {
      items: normalizedItems,
      styles: stylesJson && typeof stylesJson === "object" ? stylesJson : {},
      source: "fetch"
    };
  } catch (error) {
    if (seedFallback) return seedFallback;
    throw error;
  }
}

function syncRepertoireControlState() {
  if (el.repertoireLoopToggle) el.repertoireLoopToggle.checked = repertoireState.loopEnabled;
  if (el.repertoireMuteMelodyToggle) el.repertoireMuteMelodyToggle.checked = repertoireState.muteMelody;
  if (el.repertoireOnlyChordsToggle) el.repertoireOnlyChordsToggle.checked = repertoireState.onlyChords;
  if (el.repertoireMetronomeToggle) el.repertoireMetronomeToggle.checked = repertoireState.metronomeEnabled;
  if (el.repertoireLoopStart) el.repertoireLoopStart.value = String(Math.round(repertoireState.loopStartBeat));
  if (el.repertoireLoopEnd) el.repertoireLoopEnd.value = String(Math.round(repertoireState.loopEndBeat));
  updateRepertoireLoopLabel();
  updateRepertoirePlayPauseButton();
}

function updateRepertoirePlayPauseButton() {
  if (!el.repertoirePlayPauseBtn) return;
  if (repertoireState.isPlaying) {
    el.repertoirePlayPauseBtn.textContent = "Pause";
    return;
  }
  if (repertoireState.isPaused) {
    el.repertoirePlayPauseBtn.textContent = "Resume";
    return;
  }
  el.repertoirePlayPauseBtn.textContent = "Play";
}

function updateRepertoireLoopLabel() {
  if (!el.repertoireLoopLabel) return;
  const start = Math.round(repertoireState.loopStartBeat);
  const end = Math.round(repertoireState.loopEndBeat);
  el.repertoireLoopLabel.textContent = `Loop: ${start} to ${end} beats`;
}

function getRepertoireFilterById(filterId) {
  return REPERTOIRE_FILTER_OPTIONS.find((entry) => entry.id === filterId) || REPERTOIRE_FILTER_OPTIONS[0];
}

function renderRepertoireFilterChips() {
  if (!el.repertoireFilterChips) return;
  el.repertoireFilterChips.innerHTML = "";
  REPERTOIRE_FILTER_OPTIONS.forEach((filterOption) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "repertoire-chip";
    if (filterOption.id === repertoireState.filteredGenre) {
      button.classList.add("is-active");
    }
    button.dataset.repertoireFilter = filterOption.id;
    button.textContent = filterOption.label;
    el.repertoireFilterChips.appendChild(button);
  });
}

function getFeaturedRepertoireItems() {
  const explicit = repertoireState.items.filter((item) => item.ui?.showInFeatured);
  if (explicit.length >= 6) return explicit.slice(0, 8);
  const combined = [...explicit];
  repertoireState.items.forEach((item) => {
    if (combined.some((entry) => entry.id === item.id)) return;
    if (combined.length >= 8) return;
    combined.push(item);
  });
  return combined;
}

function renderRepertoireFeatured() {
  if (!el.repertoireFeatured) return;
  el.repertoireFeatured.innerHTML = "";
  const featured = getFeaturedRepertoireItems();
  if (!featured.length) {
    const placeholder = document.createElement("div");
    placeholder.className = "repertoire-row-meta";
    placeholder.textContent = repertoireState.loadError
      ? "Could not load featured library."
      : "Loading featured library...";
    el.repertoireFeatured.appendChild(placeholder);
    return;
  }
  featured.forEach((item) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "repertoire-feature-card";
    card.dataset.repertoireFeaturedId = item.id;
    if (item.id === repertoireState.selectedId) {
      card.classList.add("is-selected");
    }
    const title = document.createElement("strong");
    title.textContent = item.title;
    const meta = document.createElement("span");
    meta.textContent = `${item.genre.replace("_", " ")} · ${item.composerOrSource}`;
    card.appendChild(title);
    card.appendChild(meta);
    el.repertoireFeatured.appendChild(card);
  });
}

function getFilteredRepertoireItems() {
  const search = repertoireState.searchQuery.trim().toLowerCase();
  const filter = getRepertoireFilterById(repertoireState.filteredGenre);
  return repertoireState.items.filter((item) => {
    if (filter.id !== "all" && !filter.genres.includes(item.genre)) {
      return false;
    }
    if (!search) return true;
    const haystack = [
      item.title,
      item.composerOrSource,
      item.genre,
      ...(Array.isArray(item.tags) ? item.tags : []),
      item.ui?.description || ""
    ].join(" ").toLowerCase();
    return haystack.includes(search);
  });
}

function updateRepertoireTransportSummary() {
  if (!el.repertoireTransport) return;
  const item = repertoireState.selectedItem;
  if (!item) {
    el.repertoireTransport.classList.add("is-hidden");
    if (el.repertoireSelectedTitle) el.repertoireSelectedTitle.textContent = "Select a repertoire item";
    if (el.repertoireSelectedMeta) el.repertoireSelectedMeta.textContent = "";
    return;
  }

  el.repertoireTransport.classList.remove("is-hidden");
  if (el.repertoireSelectedTitle) {
    el.repertoireSelectedTitle.textContent = item.title;
  }
  if (el.repertoireSelectedMeta) {
    const tags = (item.tags || []).slice(0, 4).join(" · ");
    el.repertoireSelectedMeta.textContent = `${item.composerOrSource} · ${item.genre} · key ${appState.root} · bpm ${appState.tempoBpm}${tags ? ` · ${tags}` : ""}`;
  }
  syncRepertoireControlState();
}

function renderRepertoireList() {
  if (!el.repertoireList) return;
  const items = getFilteredRepertoireItems();
  repertoireState.listSnapshot = items;
  el.repertoireList.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "repertoire-row-meta";
    if (repertoireState.loadError) {
      empty.textContent = `Repertoire unavailable: ${repertoireState.loadError}. Run from http://localhost:4010 (not file://).`;
    } else if (!repertoireState.hasLoaded) {
      empty.textContent = "Loading repertoire library...";
    } else {
      empty.textContent = "No items match this filter.";
    }
    el.repertoireList.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("article");
    row.className = "repertoire-row";
    row.dataset.repertoireId = item.id;
    row.setAttribute("role", "listitem");
    if (item.id === repertoireState.selectedId) row.classList.add("is-selected");

    const head = document.createElement("div");
    head.className = "repertoire-row-head";
    const title = document.createElement("div");
    title.className = "repertoire-row-title";
    title.textContent = item.title;
    const meta = document.createElement("div");
    meta.className = "repertoire-row-meta";
    meta.textContent = `${item.composerOrSource} · ${item.genre} · diff ${item.difficulty}`;
    head.appendChild(title);
    head.appendChild(meta);

    const tags = document.createElement("div");
    tags.className = "repertoire-tags";
    item.tags.slice(0, 6).forEach((tag) => {
      const pill = document.createElement("span");
      pill.className = "repertoire-tag";
      pill.textContent = tag;
      tags.appendChild(pill);
    });

    const actions = document.createElement("div");
    actions.className = "repertoire-row-actions";
    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.dataset.repertoireAction = "play";
    playBtn.textContent = "Play";
    const loopBtn = document.createElement("button");
    loopBtn.type = "button";
    loopBtn.dataset.repertoireAction = "loop";
    loopBtn.textContent = item.loop?.enabled === false ? "Loop Off" : "Loop";
    const infoBtn = document.createElement("button");
    infoBtn.type = "button";
    infoBtn.dataset.repertoireAction = "info";
    infoBtn.textContent = "Info";
    actions.appendChild(playBtn);
    actions.appendChild(loopBtn);
    actions.appendChild(infoBtn);

    row.appendChild(head);
    row.appendChild(tags);
    row.appendChild(actions);
    el.repertoireList.appendChild(row);
  });
}

function getRepertoireItemById(itemId) {
  const id = String(itemId || "");
  return repertoireState.items.find((item) => item.id === id) || null;
}

function closeRepertoireInfoModal() {
  if (!el.repertoireInfoModal) return;
  el.repertoireInfoModal.classList.add("is-hidden");
  el.repertoireInfoModal.textContent = "";
  repertoireState.infoItemId = "";
}

function renderRepertoireInfoModal(item) {
  if (!el.repertoireInfoModal || !item) return;
  const source = item.arrangement?.source || {};
  const attribution = source.attribution || {};
  el.repertoireInfoModal.innerHTML = "";
  const title = document.createElement("strong");
  title.textContent = `License: ${source.licenseSpdx || "Unknown"}`;
  const provider = document.createElement("p");
  provider.textContent = `Provider: ${source.provider || "Unknown"}`;
  const attributionLine = document.createElement("p");
  attributionLine.textContent = `Attribution: ${attribution.text || "Not provided"}`;
  const link = document.createElement("a");
  link.href = attribution.link || source.url || "#";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = attribution.link || source.url || "Source";
  const note = document.createElement("p");
  note.textContent = "Public domain and licenses may vary by country; verify if distributing commercially.";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "btn-tonal";
  close.dataset.repertoireInfoAction = "close";
  close.textContent = "Close";
  el.repertoireInfoModal.appendChild(title);
  el.repertoireInfoModal.appendChild(provider);
  el.repertoireInfoModal.appendChild(attributionLine);
  el.repertoireInfoModal.appendChild(link);
  el.repertoireInfoModal.appendChild(note);
  el.repertoireInfoModal.appendChild(close);
  el.repertoireInfoModal.classList.remove("is-hidden");
  repertoireState.infoItemId = item.id;
}

function setRepertoireLoopRange(startBeat, endBeat) {
  const minStart = 0;
  const maxBeat = Math.max(1, Number(el.repertoireLoopEnd?.max || 64));
  const safeStart = Math.max(minStart, Math.min(maxBeat - 1, Math.round(Number(startBeat) || 0)));
  const safeEnd = Math.max(safeStart + 1, Math.min(maxBeat, Math.round(Number(endBeat) || maxBeat)));
  repertoireState.loopStartBeat = safeStart;
  repertoireState.loopEndBeat = safeEnd;
  if (el.repertoireLoopStart) el.repertoireLoopStart.value = String(safeStart);
  if (el.repertoireLoopEnd) el.repertoireLoopEnd.value = String(safeEnd);
  updateRepertoireLoopLabel();
}

function getRepertoireLoopBounds(item, prepared) {
  const duration = Math.max(1, Math.ceil(Number(prepared?.durationBeats) || Number(item?.loop?.endBeat) || 16));
  const suggestedStart = Math.max(0, Math.round(Number(item?.loop?.startBeat) || 0));
  const suggestedEnd = Math.max(suggestedStart + 1, Math.round(Number(item?.loop?.endBeat) || duration));
  const start = Math.min(duration - 1, suggestedStart);
  const end = Math.min(duration, Math.max(start + 1, suggestedEnd));
  return { start, end, duration };
}

function updateRepertoireLoopControlsFromItem(item, prepared = null) {
  if (!item) return;
  const bounds = getRepertoireLoopBounds(item, prepared);
  if (el.repertoireLoopStart) {
    el.repertoireLoopStart.max = String(bounds.duration - 1);
  }
  if (el.repertoireLoopEnd) {
    el.repertoireLoopEnd.max = String(bounds.duration);
  }
  setRepertoireLoopRange(bounds.start, bounds.end);
  repertoireState.loopEnabled = item.loop?.enabled !== false;
  if (el.repertoireLoopToggle) {
    el.repertoireLoopToggle.checked = repertoireState.loopEnabled;
  }
}

function updateRepertoireSelectionUi() {
  renderRepertoireFeatured();
  renderRepertoireFilterChips();
  renderRepertoireList();
  updateRepertoireTransportSummary();
  renderRepertoireSuggestions();
  updateExerciseRelatedStudyButton();
}

function selectRepertoireItem(itemId, options = {}) {
  const item = getRepertoireItemById(itemId);
  if (!item) return;
  repertoireState.selectedId = item.id;
  repertoireState.selectedItem = item;
  repertoireState.prepared = null;
  repertoireState.isPaused = false;
  repertoireState.playheadBeat = 0;
  if (options.applyDefaults === true) {
    setTempoBpm(item.defaultBpm || appState.tempoBpm);
  }
  updateRepertoireLoopControlsFromItem(item);
  closeRepertoireInfoModal();
  updateRepertoireSelectionUi();
}

async function ensurePreparedSelectedRepertoireItem() {
  const item = repertoireState.selectedItem;
  if (!item) return null;
  const existing = repertoireState.preparedById.get(item.id);
  if (existing) {
    repertoireState.prepared = existing;
    updateRepertoireLoopControlsFromItem(item, existing);
    return existing;
  }
  const prepared = await prepareRepertoireItem(item);
  if (!prepared) return null;
  repertoireState.preparedById.set(item.id, prepared);
  repertoireState.prepared = prepared;
  updateRepertoireLoopControlsFromItem(item, prepared);
  return prepared;
}

function getActiveRepertoireLoopBounds(prepared, item) {
  const duration = Math.max(1, Number(prepared?.durationBeats) || 16);
  const start = Math.max(0, Math.min(duration - 1, Number(repertoireState.loopStartBeat) || 0));
  const end = Math.max(start + 1, Math.min(duration, Number(repertoireState.loopEndBeat) || duration));
  return { start, end, duration };
}

function scheduleRepertoireKeyboardFlash(midi, startAudioTime, durationSec) {
  const nowSec = getSchedulerNowSeconds();
  const onDelay = Math.max(0, Math.round((startAudioTime - nowSec) * 1000));
  const flashMs = Math.max(60, Math.round(durationSec * 1000));
  const timerId = window.setTimeout(() => {
    scheduledFallbackNoteTimers.delete(timerId);
    highlightKeyboard([midi], flashMs, false);
  }, onDelay);
  scheduledFallbackNoteTimers.add(timerId);
}

function getTransposedRepertoireMidi(midi, item) {
  const transposed = Number(midi) + getRepertoireTransposeSemitones(item);
  return clampMidiRange(transposed);
}

function shouldScheduleRepertoireNoteEvent(event) {
  if (!event) return false;
  if (repertoireState.muteMelody && event.role === "melody") return false;
  if (repertoireState.onlyChords && Number(event.polyphony || 1) < 2) return false;
  return true;
}

function scheduleRepertoireNoteChunk(prepared, beatFrom, beatTo, audioFrom, beatSeconds) {
  const item = prepared?.sourceItem;
  const events = Array.isArray(prepared?.noteEvents) ? prepared.noteEvents : [];
  if (!events.length) return;
  for (let i = 0; i < events.length; i += 1) {
    const event = events[i];
    if (event.startBeat < beatFrom || event.startBeat >= beatTo) continue;
    if (!shouldScheduleRepertoireNoteEvent(event)) continue;
    const midi = getTransposedRepertoireMidi(event.midi, item);
    if (!Number.isFinite(midi)) continue;
    const eventAudioTime = audioFrom + ((event.startBeat - beatFrom) * beatSeconds);
    const duration = Math.max(0.03, (Number(event.durationBeats) || 0.25) * beatSeconds * 0.96);
    const velocity = Math.max(0.2, Math.min(1, Number(event.velocity) || 0.78));
    scheduleSingleMidiNote(midi, eventAudioTime, duration, velocity);
    scheduleRepertoireKeyboardFlash(midi, eventAudioTime, duration);
  }
}

function buildRepertoireBassMidi(step, item) {
  const rootMidi = getTransposedRepertoireMidi(step?.midi?.[0], item);
  if (!Number.isFinite(rootMidi)) return null;
  return clampMidiRange(rootMidi - 12);
}

function scheduleRepertoireProgressionChunk(prepared, beatFrom, beatTo, audioFrom, beatSeconds) {
  const item = prepared?.sourceItem;
  const steps = Array.isArray(prepared?.chordSteps) ? prepared.chordSteps : [];
  if (!steps.length) return;
  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i];
    if (step.startBeat < beatFrom || step.startBeat >= beatTo) continue;
    const eventAudioTime = audioFrom + ((step.startBeat - beatFrom) * beatSeconds);
    const duration = Math.max(0.12, step.beats * beatSeconds * 0.9);
    const midi = step.midi
      .map((note) => getTransposedRepertoireMidi(note, item))
      .filter((note) => Number.isFinite(note));
    if (!midi.length) continue;
    scheduleChordAtTime(midi, eventAudioTime, duration, paletteSequenceToken);
    if (!repertoireState.onlyChords) {
      const bassMidi = buildRepertoireBassMidi(step, item);
      if (Number.isFinite(bassMidi)) {
        scheduleSingleMidiNote(bassMidi, eventAudioTime, Math.max(0.06, duration * 0.8), 0.54);
      }
    }
  }
}

function scheduleRepertoireMetronomeChunk(beatFrom, beatTo, audioFrom, beatSeconds) {
  if (!repertoireState.metronomeEnabled) return;
  const firstBeat = Math.ceil(beatFrom - 1e-9);
  const lastBeat = Math.floor(beatTo - 1e-9);
  for (let beat = firstBeat; beat <= lastBeat; beat += 1) {
    if (beat < beatFrom || beat >= beatTo) continue;
    const isDownbeat = Math.abs((beat - repertoireState.loopStartBeat) % 4) < 1e-6;
    const midi = isDownbeat ? 84 : 79;
    const eventAudioTime = audioFrom + ((beat - beatFrom) * beatSeconds);
    scheduleSingleMidiNote(midi, eventAudioTime, 0.03, 0.32);
  }
}

function alignRepertoirePlaybackClock() {
  if (!repertoireState.isPlaying || !repertoireState.prepared || !repertoireState.selectedItem) return;
  const now = getSchedulerNowSeconds();
  const beatSeconds = getHarmonyBeatSeconds();
  const elapsedBeats = Math.max(0, (now - repertoireState.playStartAudioTime) / beatSeconds);
  const bounds = getActiveRepertoireLoopBounds(repertoireState.prepared, repertoireState.selectedItem);
  let liveBeat = repertoireState.playheadBeat + elapsedBeats;
  if (repertoireState.loopEnabled) {
    const span = Math.max(1e-6, bounds.end - bounds.start);
    liveBeat = bounds.start + ((((liveBeat - bounds.start) % span) + span) % span);
  } else {
    liveBeat = Math.min(bounds.duration, liveBeat);
  }
  repertoireState.playheadBeat = liveBeat;
  repertoireState.playStartAudioTime = now;
  repertoireState.scheduleCursorBeat = liveBeat;
  repertoireState.scheduleCursorAudioTime = now + REPERTOIRE_LEAD_SECONDS;
}

function clearRepertoireScheduler() {
  if (!Number.isFinite(repertoireState.schedulerTimerId)) return;
  window.clearInterval(repertoireState.schedulerTimerId);
  repertoireState.schedulerTimerId = null;
}

function stopRepertoireVoices() {
  if (toneSampler && typeof toneSampler.releaseAll === "function") {
    try {
      toneSampler.releaseAll();
    } catch {
      // Ignore release errors.
    }
  }
  stopAudioPoolMap(htmlSamplePools);
}

function stopRepertoirePlayback(options = {}) {
  clearRepertoireScheduler();
  repertoireState.isPlaying = false;
  if (!options.keepPausedState) {
    repertoireState.isPaused = false;
  }
  if (options.resetPlayhead) {
    repertoireState.playheadBeat = repertoireState.loopStartBeat;
  }
  repertoireState.scheduleCursorAudioTime = 0;
  repertoireState.scheduleCursorBeat = repertoireState.playheadBeat;
  stopRepertoireVoices();
  updateRepertoirePlayPauseButton();
}

function tickRepertoireScheduler() {
  if (!repertoireState.isPlaying || !repertoireState.prepared || !repertoireState.selectedItem) return;
  const prepared = repertoireState.prepared;
  const now = getSchedulerNowSeconds();
  const lookAheadEnd = now + REPERTOIRE_SCHEDULE_LOOKAHEAD_SECONDS;
  const loopBounds = getActiveRepertoireLoopBounds(prepared, repertoireState.selectedItem);

  if (!Number.isFinite(repertoireState.scheduleCursorAudioTime) || repertoireState.scheduleCursorAudioTime < now) {
    repertoireState.scheduleCursorAudioTime = now + REPERTOIRE_LEAD_SECONDS;
  }

  while (repertoireState.scheduleCursorAudioTime < lookAheadEnd) {
    const beatSeconds = getHarmonyBeatSeconds();
    const beatFrom = repertoireState.scheduleCursorBeat;
    const boundary = repertoireState.loopEnabled ? loopBounds.end : loopBounds.duration;
    const beatsUntilBoundary = Math.max(0, boundary - beatFrom);
    const maxBeatsWindow = Math.max(0, (lookAheadEnd - repertoireState.scheduleCursorAudioTime) / beatSeconds);
    const chunkBeats = Math.min(beatsUntilBoundary, maxBeatsWindow);

    if (chunkBeats <= 1e-9) {
      if (!repertoireState.loopEnabled && beatFrom >= loopBounds.duration - 1e-9) {
        stopRepertoirePlayback({ resetPlayhead: true });
        return;
      }
      if (repertoireState.loopEnabled && beatFrom >= loopBounds.end - 1e-9) {
        repertoireState.scheduleCursorBeat = loopBounds.start;
        continue;
      }
      break;
    }

    const beatTo = beatFrom + chunkBeats;
    if (prepared.type === "chord_progression") {
      scheduleRepertoireProgressionChunk(prepared, beatFrom, beatTo, repertoireState.scheduleCursorAudioTime, beatSeconds);
    } else {
      scheduleRepertoireNoteChunk(prepared, beatFrom, beatTo, repertoireState.scheduleCursorAudioTime, beatSeconds);
    }
    scheduleRepertoireMetronomeChunk(beatFrom, beatTo, repertoireState.scheduleCursorAudioTime, beatSeconds);

    repertoireState.scheduleCursorAudioTime += chunkBeats * beatSeconds;
    repertoireState.scheduleCursorBeat = beatTo;
    repertoireState.playheadBeat = beatTo;

    if (repertoireState.loopEnabled && repertoireState.scheduleCursorBeat >= loopBounds.end - 1e-9) {
      repertoireState.scheduleCursorBeat = loopBounds.start;
    } else if (!repertoireState.loopEnabled && repertoireState.scheduleCursorBeat >= loopBounds.duration - 1e-9) {
      stopRepertoirePlayback({ resetPlayhead: true });
      return;
    }
  }
}

async function startRepertoirePlayback(options = {}) {
  if (!repertoireState.selectedItem) return false;
  stopAllPlayback();
  if (!ensureAudio()) return false;
  if (isToneEngineAvailable() && (!toneEngineReady || !toneSampler)) {
    await ensureToneEngine();
  }
  const prepared = await ensurePreparedSelectedRepertoireItem();
  if (!prepared) return false;

  clearRepertoireScheduler();
  const loopBounds = getActiveRepertoireLoopBounds(prepared, repertoireState.selectedItem);
  const now = getSchedulerNowSeconds();
  const startBeat = Number.isFinite(options.startBeat)
    ? Math.max(loopBounds.start, Math.min(loopBounds.end, Number(options.startBeat)))
    : Math.max(loopBounds.start, Math.min(loopBounds.end, repertoireState.playheadBeat || loopBounds.start));
  repertoireState.playheadBeat = startBeat;
  repertoireState.scheduleCursorBeat = startBeat;
  repertoireState.playStartAudioTime = now;
  repertoireState.scheduleCursorAudioTime = now + REPERTOIRE_LEAD_SECONDS;
  repertoireState.isPlaying = true;
  repertoireState.isPaused = false;
  updateRepertoirePlayPauseButton();

  tickRepertoireScheduler();
  repertoireState.schedulerTimerId = window.setInterval(tickRepertoireScheduler, REPERTOIRE_SCHEDULER_INTERVAL_MS);
  return true;
}

function pauseRepertoirePlayback() {
  if (!repertoireState.isPlaying) return;
  repertoireState.playheadBeat = repertoireState.scheduleCursorBeat;
  clearRepertoireScheduler();
  repertoireState.isPlaying = false;
  repertoireState.isPaused = true;
  stopRepertoireVoices();
  updateRepertoirePlayPauseButton();
}

function findExerciseForRepertoireItem(item) {
  if (!item) return "";
  const tags = Array.isArray(item.tags) ? item.tags : [];
  for (let i = 0; i < tags.length; i += 1) {
    const mapped = REPERTOIRE_TAG_TO_EXERCISE[tags[i]];
    if (mapped) return mapped;
  }
  return "";
}

function highlightActiveExerciseButton() {
  if (!el.exerciseList) return;
  const buttons = el.exerciseList.querySelectorAll("button[data-ex]");
  buttons.forEach((button) => {
    button.classList.toggle("is-spotlight", button.dataset.ex === repertoireState.activeExerciseId);
  });
}

function updateExerciseRelatedStudyButton() {
  if (!el.playRelatedStudyBtn) return;
  const relatedId = EXERCISE_RELATED_REPERTOIRE[repertoireState.activeExerciseId] || "";
  if (!relatedId) {
    el.playRelatedStudyBtn.classList.add("is-hidden");
    el.playRelatedStudyBtn.textContent = "Play Related Study";
    return;
  }
  const relatedItem = getRepertoireItemById(relatedId);
  if (!relatedItem) {
    el.playRelatedStudyBtn.classList.add("is-hidden");
    return;
  }
  el.playRelatedStudyBtn.classList.remove("is-hidden");
  el.playRelatedStudyBtn.textContent = `Play Related Study: ${relatedItem.title}`;
}

function buildRepertoireSuggestions(item) {
  const suggestions = [];
  const pushSuggestion = (entry) => {
    if (!entry || !entry.tab || !entry.action) return;
    const key = `${entry.tab}|${entry.action}|${JSON.stringify(entry.payload || {})}`;
    if (suggestions.some((candidate) => candidate._key === key)) return;
    suggestions.push({ ...entry, _key: key });
  };

  (Array.isArray(item?.lessonLinks) ? item.lessonLinks : []).forEach((link) => {
    pushSuggestion({
      tab: link.tab,
      action: link.action,
      payload: link.payload || {},
      focus: link.focus || `${link.tab}`
    });
  });

  const tags = Array.isArray(item?.tags) ? item.tags : [];
  tags.forEach((tag) => {
    const mapped = REPERTOIRE_TAG_TO_ACTIONS[tag];
    if (!Array.isArray(mapped)) return;
    mapped.forEach((entry) => {
      pushSuggestion({
        ...entry,
        focus: entry.focus || tag
      });
    });
  });

  return suggestions.slice(0, 6);
}

function renderRepertoireSuggestions() {
  if (!el.repertoireSuggestions) return;
  const selected = repertoireState.selectedItem;
  if (!selected || !repertoireState.suggestionEntries.length) {
    el.repertoireSuggestions.innerHTML = "";
    return;
  }
  el.repertoireSuggestions.innerHTML = "";
  repertoireState.suggestionEntries.forEach((entry, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn-tonal repertoire-suggestion-btn";
    button.dataset.repertoireSuggestionIndex = String(index);
    button.textContent = `${entry.tab}: ${entry.focus || entry.action}`;
    el.repertoireSuggestions.appendChild(button);
  });
}

function findPaletteRowButtonByName(rowName) {
  const rowButtons = Array.from(el.chordTableBody?.querySelectorAll(".axis-play-row") || []);
  const normalized = String(rowName || "").trim().toLowerCase();
  return rowButtons.find((btn) => String(btn.dataset.rowName || btn.textContent || "").trim().toLowerCase() === normalized) || null;
}

function findColumnIndexByHeaderLabel(label) {
  const headerButtons = Array.from(el.chordTableHead?.querySelectorAll(".axis-play-col") || []);
  const normalized = String(label || "").trim().toLowerCase();
  for (let i = 0; i < headerButtons.length; i += 1) {
    const candidate = String(headerButtons[i].dataset.columnRoman || headerButtons[i].textContent || "").trim().toLowerCase();
    if (candidate === normalized) return i;
  }
  for (let i = 0; i < headerButtons.length; i += 1) {
    const candidate = String(headerButtons[i].dataset.columnRoman || headerButtons[i].textContent || "").trim().toLowerCase();
    if (candidate.includes(normalized) || normalized.includes(candidate)) return i;
  }
  return -1;
}

function triggerPaletteSuggestion(entry) {
  const tabId = TAB_NAME_TO_ID[entry.tab] || TAB_NAME_TO_ID[String(entry.tab || "").toLowerCase()];
  if (!tabId) return;
  setPaletteTab(tabId);
  const payload = entry.payload || {};
  window.setTimeout(() => {
    if (entry.action === "play_row") {
      const rowButton = findPaletteRowButtonByName(payload.row);
      rowButton?.click();
      return;
    }
    if (entry.action === "play_cell") {
      const rowButton = findPaletteRowButtonByName(payload.row);
      const row = rowButton?.closest("tr");
      if (!row) return;
      const columnIndex = findColumnIndexByHeaderLabel(payload.col);
      const cells = Array.from(row.querySelectorAll("td"));
      const targetCell = columnIndex >= 0 ? cells[columnIndex] : cells[0];
      targetCell?.click();
    }
  }, 20);
}

function scrollExerciseIntoView(exerciseId) {
  const button = el.exerciseList?.querySelector(`button[data-ex="${exerciseId}"]`);
  if (!button) return;
  button.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function openRelatedExerciseForSelectedItem() {
  const item = repertoireState.selectedItem;
  if (!item) return;
  const exerciseId = findExerciseForRepertoireItem(item);
  if (!exerciseId) return;
  void runGuidedExercise(exerciseId);
  scrollExerciseIntoView(exerciseId);
}

async function initRepertoire() {
  try {
    repertoireState.loadError = "";
    const library = await loadRepertoireLibrary();
    repertoireState.items = library.items;
    repertoireState.stylePresets = library.styles;
    repertoireState.hasLoaded = true;
    renderRepertoireFeatured();
    renderRepertoireFilterChips();
    renderRepertoireList();
    const featured = repertoireState.items.find((item) => item.ui?.showInFeatured) || repertoireState.items[0] || null;
    if (featured) {
      selectRepertoireItem(featured.id, { applyDefaults: false });
    }
  } catch (error) {
    repertoireState.hasLoaded = true;
    repertoireState.loadError = error.message || "Failed to load library";
    renderRepertoireFeatured();
    if (el.repertoireList) {
      el.repertoireList.innerHTML = "";
      const msg = document.createElement("p");
      msg.className = "repertoire-row-meta";
      msg.textContent = `Repertoire unavailable: ${repertoireState.loadError}. Run from http://localhost:4010 (not file://).`;
      el.repertoireList.appendChild(msg);
    }
  }
}

function bindRepertoireEvents() {
  if (el.repertoireFeatured) {
    el.repertoireFeatured.addEventListener("click", (event) => {
      const card = event.target.closest("button[data-repertoire-featured-id]");
      if (!card) return;
      const itemId = card.dataset.repertoireFeaturedId;
      if (!itemId) return;
      selectRepertoireItem(itemId, { applyDefaults: false });
      void startRepertoirePlayback({ startBeat: repertoireState.loopStartBeat });
    });
  }

  if (el.repertoireFilterChips) {
    el.repertoireFilterChips.addEventListener("click", (event) => {
      const chip = event.target.closest("button[data-repertoire-filter]");
      if (!chip) return;
      repertoireState.filteredGenre = chip.dataset.repertoireFilter || "all";
      renderRepertoireFilterChips();
      renderRepertoireList();
    });
  }

  if (el.repertoireSearchInput) {
    el.repertoireSearchInput.addEventListener("input", () => {
      repertoireState.searchQuery = String(el.repertoireSearchInput.value || "");
      renderRepertoireList();
    });
  }

  if (el.repertoireList) {
    el.repertoireList.addEventListener("click", (event) => {
      const row = event.target.closest(".repertoire-row[data-repertoire-id]");
      if (!row) return;
      const itemId = row.dataset.repertoireId;
      if (!itemId) return;
      selectRepertoireItem(itemId, { applyDefaults: false });
      const actionBtn = event.target.closest("button[data-repertoire-action]");
      if (!actionBtn) return;
      const action = actionBtn.dataset.repertoireAction;
      if (action === "play") {
        void startRepertoirePlayback({ startBeat: repertoireState.loopStartBeat });
        return;
      }
      if (action === "loop") {
        repertoireState.loopEnabled = !repertoireState.loopEnabled;
        if (el.repertoireLoopToggle) el.repertoireLoopToggle.checked = repertoireState.loopEnabled;
        return;
      }
      if (action === "info") {
        renderRepertoireInfoModal(repertoireState.selectedItem);
      }
    });
  }

  if (el.repertoireInfoModal) {
    el.repertoireInfoModal.addEventListener("click", (event) => {
      const closeBtn = event.target.closest("button[data-repertoire-info-action='close']");
      if (closeBtn) closeRepertoireInfoModal();
    });
  }

  if (el.repertoirePlayPauseBtn) {
    el.repertoirePlayPauseBtn.addEventListener("click", () => {
      if (!repertoireState.selectedItem) return;
      if (repertoireState.isPlaying) {
        pauseRepertoirePlayback();
        return;
      }
      const startBeat = repertoireState.isPaused ? repertoireState.playheadBeat : repertoireState.loopStartBeat;
      void startRepertoirePlayback({ startBeat });
    });
  }

  if (el.repertoireStopBtn) {
    el.repertoireStopBtn.addEventListener("click", () => {
      stopRepertoirePlayback({ resetPlayhead: true });
      repertoireState.playheadBeat = repertoireState.loopStartBeat;
      repertoireState.isPaused = false;
      updateRepertoirePlayPauseButton();
    });
  }

  if (el.repertoireLoopToggle) {
    el.repertoireLoopToggle.addEventListener("change", () => {
      repertoireState.loopEnabled = Boolean(el.repertoireLoopToggle.checked);
    });
  }

  if (el.repertoireLoopStart) {
    el.repertoireLoopStart.addEventListener("input", () => {
      setRepertoireLoopRange(el.repertoireLoopStart.value, repertoireState.loopEndBeat);
      alignRepertoirePlaybackClock();
    });
  }

  if (el.repertoireLoopEnd) {
    el.repertoireLoopEnd.addEventListener("input", () => {
      setRepertoireLoopRange(repertoireState.loopStartBeat, el.repertoireLoopEnd.value);
      alignRepertoirePlaybackClock();
    });
  }

  if (el.repertoireMuteMelodyToggle) {
    el.repertoireMuteMelodyToggle.addEventListener("change", () => {
      repertoireState.muteMelody = Boolean(el.repertoireMuteMelodyToggle.checked);
    });
  }

  if (el.repertoireOnlyChordsToggle) {
    el.repertoireOnlyChordsToggle.addEventListener("change", () => {
      repertoireState.onlyChords = Boolean(el.repertoireOnlyChordsToggle.checked);
    });
  }

  if (el.repertoireMetronomeToggle) {
    el.repertoireMetronomeToggle.addEventListener("change", () => {
      repertoireState.metronomeEnabled = Boolean(el.repertoireMetronomeToggle.checked);
    });
  }

  if (el.repertoireShowChordsBtn) {
    el.repertoireShowChordsBtn.addEventListener("click", () => {
      setPaletteTab("chords");
      markChordTableCell(appState.root, "major");
    });
  }

  if (el.repertoireSuggestedBtn) {
    el.repertoireSuggestedBtn.addEventListener("click", () => {
      const selected = repertoireState.selectedItem;
      repertoireState.suggestionEntries = selected ? buildRepertoireSuggestions(selected) : [];
      renderRepertoireSuggestions();
    });
  }

  if (el.repertoireSuggestions) {
    el.repertoireSuggestions.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-repertoire-suggestion-index]");
      if (!button) return;
      const idx = Number(button.dataset.repertoireSuggestionIndex);
      if (!Number.isFinite(idx)) return;
      const entry = repertoireState.suggestionEntries[idx];
      if (!entry) return;
      triggerPaletteSuggestion(entry);
    });
  }

  if (el.repertoireOpenExerciseBtn) {
    el.repertoireOpenExerciseBtn.addEventListener("click", openRelatedExerciseForSelectedItem);
  }

  if (el.playRelatedStudyBtn) {
    el.playRelatedStudyBtn.addEventListener("click", () => {
      const relatedId = EXERCISE_RELATED_REPERTOIRE[repertoireState.activeExerciseId] || "";
      const item = getRepertoireItemById(relatedId);
      if (!item) return;
      selectRepertoireItem(item.id, { applyDefaults: false });
      void startRepertoirePlayback({ startBeat: repertoireState.loopStartBeat });
    });
  }
}

function renderProgressionStrip() {
  if (!el.progressionStrip) return;
  const progression = buildProgressionChords(getProgressionPaletteContext(), el.progressionSelect.value, getProgressionVoicingMode());
  el.progressionStrip.innerHTML = "";

  progression.forEach((step, idx) => {
    const div = document.createElement("div");
    div.className = "strip-step";
    div.dataset.stepIndex = String(idx);
    div.textContent = step.symbol;
    div.addEventListener("click", () => {
      activateProgressionStep(idx);
      playMidiNotes(step.midi, { hold: getHoldSeconds(), asChord: true, restrictToWindow: false });
      clearTimeout(clearStripStepTimer);
      clearStripStepTimer = setTimeout(clearProgressionStep, 340);
    });
    el.progressionStrip.appendChild(div);
  });
}

function renderProgressionPalette() {
  if (!el.progressionPaletteGrid) return;
  const context = getProgressionPaletteContext();
  const voicingMode = getProgressionVoicingMode();
  const activeGroup = PROGRESSION_PALETTE_GROUPS.find((group) => group.id === activeProgressionPaletteGroupId)
    || PROGRESSION_PALETTE_GROUPS[0];
  activeProgressionPaletteGroupId = activeGroup?.id || "pop";
  if (el.progressionPaletteKey) {
    const sourceLabel = context.source === "chord" ? "Selected chord" : "Key";
    el.progressionPaletteKey.textContent = `${sourceLabel}: ${context.label}`;
  }
  if (el.progressionPaletteTabs) {
    el.progressionPaletteTabs.innerHTML = PROGRESSION_PALETTE_GROUPS.map((group) => `
      <button class="${group.id === activeProgressionPaletteGroupId ? "active" : ""}" type="button"
        data-progression-group="${escapeHtml(group.id)}" role="tab"
        aria-selected="${group.id === activeProgressionPaletteGroupId ? "true" : "false"}">
        ${escapeHtml(group.title)}
      </button>
    `).join("");
  }
  el.progressionPaletteGrid.innerHTML = `
    <section class="progression-family" aria-label="${escapeHtml(activeGroup.title)}">
      <div class="progression-family-grid">
        ${activeGroup.items.map((item) => {
          const chords = buildProgressionPaletteChords(context, item, voicingMode);
          return `
            <button class="progression-card" type="button" data-progression-name="${escapeHtml(item.name)}">
              <strong>${escapeHtml(item.name)}</strong>
              <span>${escapeHtml(item.tagline)}</span>
              <small>${chords.map((chord) => escapeHtml(chord.symbol)).join(" -> ")}</small>
            </button>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

async function playProgressionPaletteItem(name) {
  const item = findProgressionPaletteItem(name);
  if (!item) return;
  const token = ++progressionPalettePlayToken;
  clearPatternUiTimers();
  clearPatternVisualState();
  const group = findProgressionPaletteGroupForItem(name);
  if (group) activeProgressionPaletteGroupId = group.id;
  const context = getProgressionPaletteContext();
  const voicingMode = getProgressionVoicingMode();
  const styleMode = getProgressionStyleMode();
  if (el.progressionSelect && PROGRESSIONS[name]) {
    el.progressionSelect.value = name;
    renderProgressionStrip();
  }
  renderProgressionPalette();
  el.progressionPaletteGrid?.querySelectorAll(".progression-card").forEach((card) => {
    card.classList.toggle("is-active", card.dataset.progressionName === name);
  });

  const chords = buildProgressionPaletteChords(context, item, voicingMode);
  currentStudyContext = { type: "progression", name: item.name };
  renderProgressionPaletteExplanation(item, context, chords);
  if (el.progressionOutput) {
    el.progressionOutput.textContent = `Progression palette: ${item.name} in ${context.label} (${progressionVoicingLabel(voicingMode)}, ${progressionStyleLabel(styleMode)}): ${chords.map((chord) => chord.symbol).join(" -> ")}`;
  }
  trackRep("progressions", `${context.label} ${item.name}`);
  renderPianoLabContext();
  renderNowStudyingPanel();
  renderLabMicroMissions();

  const timing = getProgressionPaletteTiming(item, chords, styleMode);
  await playStyledProgression(chords, timing, token);
}

function renderProgressionPaletteExplanation(item, keyOrContext, chords) {
  if (el.progressionPaletteExplain) {
    const context = typeof keyOrContext === "object" ? keyOrContext : { label: keyOrContext };
    const styleMode = getProgressionStyleMode();
    const timing = getProgressionPaletteTiming(item, chords, styleMode);
    const style = PROGRESSION_STYLE_PATTERNS[styleMode] || PROGRESSION_STYLE_PATTERNS.plain;
    el.progressionPaletteExplain.classList.remove("is-updating");
    el.progressionPaletteExplain.innerHTML = `
      <div class="progression-explain-head">
        <strong>${escapeHtml(item.name)} in ${escapeHtml(context.label || context.root || "C")}</strong>
        <span>${chords.map((chord) => `${escapeHtml(chord.degree)} ${escapeHtml(chord.symbol)}`).join(" -> ")}</span>
      </div>
      <p><strong>What you heard:</strong> ${escapeHtml(item.theory)}</p>
      <p><strong>Listen for:</strong> ${escapeHtml(item.listenFor)}</p>
      <p><strong>Style:</strong> ${escapeHtml(style.label)} - ${escapeHtml(style.whatChanges)}</p>
      ${renderProgressionSongExamples(item)}
      <p><strong>Feel:</strong> ${escapeHtml(item.feel || `${timing.label} at ${appState.bpm} BPM, with each chord held long enough to hear the color before it moves.`)}</p>
      <p><strong>Try next:</strong> change the key and press the same button. The chord names change, but the number story stays the same.</p>
    `;
    void el.progressionPaletteExplain.offsetWidth;
    el.progressionPaletteExplain.classList.add("is-updating");
  }
}

function renderProgressionSongExamples(item = {}) {
  const songs = Array.isArray(item.songs) ? item.songs.slice(0, 5) : [];
  if (!songs.length) return "";
  return `
    <div class="progression-song-row">
      <strong>Songs to listen for:</strong>
      ${songs.map((song) => `<span>${escapeHtml(song)}</span>`).join("")}
    </div>
  `;
}

async function playStyledProgression(chords = [], timing = {}, token = progressionPalettePlayToken) {
  const playableChords = Array.isArray(chords) ? chords.filter((chord) => Array.isArray(chord?.midi)) : [];
  if (!playableChords.length) return;
  if (!ensureAudio()) return;
  if (isToneEngineAvailable() && (!toneEngineReady || !toneSampler)) {
    await ensureToneEngine();
  }
  if (!toneEngineReady && shouldUseRnboPrimaryEngine() && !htmlSampleEngineActive && !rnboEngineActive && !rnboEngineFailedReason) {
    await initializeRnboEngine();
  }

  const nowSec = getSchedulerNowSeconds();
  const startSec = nowSec + Math.max(0.03, getInteractiveStartLeadTimeSeconds());
  let chordStartMs = 0;
  playableChords.forEach((chord, chordIndex) => {
    const chordMs = timing.chordMsByIndex?.[chordIndex] || timing.defaultChordMs || 1000;
    const events = timing.styleEventsByIndex?.[chordIndex] || [{
      offsetMs: 0,
      holdSeconds: timing.defaultHoldSeconds || 0.8,
      highlightMs: chordMs
    }];
    events.forEach((event) => {
      const eventStartSec = startSec + (chordStartMs + (Number(event.offsetMs) || 0)) / 1000;
      scheduleProgressionChordEvent(chord.midi, eventStartSec, event.holdSeconds || timing.defaultHoldSeconds || 0.6, event.velocity || 0.78);
      scheduleProgressionVisualEvent(chordIndex, chord.midi, eventStartSec, event.highlightMs || Math.min(chordMs, 520), token);
    });
    chordStartMs += chordMs;
  });

  const totalMs = timing.chordMsByIndex?.reduce((sum, value) => sum + value, 0)
    || playableChords.length * (timing.defaultChordMs || 1000);
  const clearTimerId = window.setTimeout(() => {
    if (token !== progressionPalettePlayToken) return;
    clearProgressionStep();
  }, Math.max(0, Math.round((startSec - nowSec) * 1000 + totalMs + 80)));
  registerPatternUiTimer(clearTimerId);
  await wait(totalMs + Math.round((startSec - nowSec) * 1000) + 90);
}

function scheduleProgressionChordEvent(midiNotes, startTimeSec, holdSeconds, velocity = 0.78) {
  const notes = Array.isArray(midiNotes) ? midiNotes.filter((midi) => Number.isFinite(midi)) : [];
  if (!notes.length) return;
  notes.forEach((midi) => {
    scheduleSingleMidiNote(midi, startTimeSec, holdSeconds, velocity);
  });
}

function scheduleProgressionVisualEvent(stepIndex, midiNotes, startTimeSec, highlightMs, token) {
  const nowSec = getSchedulerNowSeconds();
  const delayMs = Math.max(0, Math.round((startTimeSec - nowSec) * 1000));
  const onTimerId = window.setTimeout(() => {
    if (token !== progressionPalettePlayToken) return;
    activateProgressionStep(stepIndex);
    highlightKeyboard(midiNotes, highlightMs, false);
  }, delayMs);
  registerPatternUiTimer(onTimerId);
}

function getProgressionPaletteTiming(item = {}, chords = [], styleMode = getProgressionStyleMode()) {
  const beatMs = Math.round(60000 / Math.max(30, appState.bpm || 80));
  const chordCount = Math.max(1, chords.length || (PROGRESSIONS[item.name] || []).length || 4);
  const beatsByIndex = getProgressionPaletteBeats(item, chordCount);
  const chordMsByIndex = beatsByIndex.map((beats) => Math.round(beatMs * beats));
  const holdSecondsByIndex = chordMsByIndex.map((durationMs) => {
    const breathMs = Math.min(180, Math.max(70, beatMs * 0.2));
    return Math.max(0.62, (durationMs - breathMs) / 1000);
  });
  return {
    beatMs,
    beatsByIndex,
    chordMsByIndex,
    holdSecondsByIndex,
    styleMode,
    styleEventsByIndex: chordMsByIndex.map((chordMs, index) => buildProgressionStyleEvents(styleMode, chordMs, beatMs, holdSecondsByIndex[index])),
    defaultChordMs: chordMsByIndex[0] || beatMs * 2,
    defaultHoldSeconds: holdSecondsByIndex[0] || Math.max(0.62, (beatMs * 1.8) / 1000),
    label: describeProgressionPaletteTiming(item, beatsByIndex, styleMode)
  };
}

function buildProgressionStyleEvents(styleMode, chordMs, beatMs, fallbackHoldSeconds) {
  const style = normalizeProgressionStyleMode(styleMode);
  const clampWithinChord = (value) => Math.max(0, Math.min(chordMs - 80, Math.round(value)));
  const shortHold = Math.max(0.12, Math.min(0.34, beatMs / 1000 * 0.38));
  const mediumHold = Math.max(0.28, Math.min(0.58, beatMs / 1000 * 0.72));
  const longHold = Math.max(0.58, fallbackHoldSeconds || 0.8);
  if (style === "reggae") {
    return [0.5, 1.5].map((beat) => ({
      offsetMs: clampWithinChord(beatMs * beat),
      holdSeconds: shortHold,
      highlightMs: Math.round(shortHold * 1000)
    }));
  }
  if (style === "bossa") {
    return [0, 0.75, 1.5].map((beat) => ({
      offsetMs: clampWithinChord(beatMs * beat),
      holdSeconds: mediumHold,
      highlightMs: Math.round(mediumHold * 1000)
    }));
  }
  if (style === "latin") {
    return [0, 0.75, 1.25, 1.75].map((beat) => ({
      offsetMs: clampWithinChord(beatMs * beat),
      holdSeconds: shortHold,
      highlightMs: Math.round(shortHold * 1000)
    }));
  }
  if (style === "swing") {
    return [0, 1.33].map((beat, index) => ({
      offsetMs: clampWithinChord(beatMs * beat),
      holdSeconds: index === 0 ? mediumHold : shortHold,
      highlightMs: index === 0 ? Math.round(mediumHold * 1000) : Math.round(shortHold * 1000)
    }));
  }
  if (style === "pop") {
    return [0, 1].map((beat, index) => ({
      offsetMs: clampWithinChord(beatMs * beat),
      holdSeconds: index === 0 ? longHold * 0.58 : mediumHold,
      highlightMs: index === 0 ? Math.round(chordMs * 0.5) : Math.round(mediumHold * 1000)
    }));
  }
  return [{
    offsetMs: 0,
    holdSeconds: style === "classical" ? Math.max(longHold, chordMs / 1000 * 0.92) : longHold,
    highlightMs: chordMs
  }];
}

function getProgressionPaletteBeats(item = {}, chordCount = 4) {
  const name = item.name || "";
  if (name.includes("ii-V-I") && chordCount === 3) return [2, 2, 4];
  if (name.includes("IV-I (Amen")) return [2, 3];
  if (name.includes("12-Bar")) return Array.from({ length: chordCount }, () => 2);
  if (name.includes("Turnaround")) return Array.from({ length: chordCount }, () => 1);
  if (name.includes("7-3-6")) return [1.5, 1.5, 3];
  if (chordCount === 2) return [2, 3];
  if (chordCount === 3) return [2, 2, 3];
  return Array.from({ length: chordCount }, () => 2);
}

function describeProgressionPaletteTiming(item = {}, beatsByIndex = [], styleMode = getProgressionStyleMode()) {
  const name = item.name || "";
  const style = PROGRESSION_STYLE_PATTERNS[normalizeProgressionStyleMode(styleMode)] || PROGRESSION_STYLE_PATTERNS.plain;
  if (styleMode && styleMode !== "plain") return `${style.label}: ${style.summary}`;
  if (name.includes("ii-V-I") && beatsByIndex.length === 3) return "a jazz 2-2-4 resolution";
  if (name.includes("IV-I (Amen")) return "a gentle Amen cadence";
  if (name.includes("12-Bar")) return "a compact blues shuffle map";
  if (name.includes("Turnaround")) return "a quick turnaround pulse";
  if (name.includes("7-3-6")) return "a gospel passing move into a longer landing";
  if (beatsByIndex.every((beats) => beats === 2)) return "a normal two-beat chord loop";
  return `${beatsByIndex.join("-")} beat chord movement`;
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
      playMidiNotes(step.midi, { hold: getHoldSeconds(), asChord: true, restrictToWindow: false });
      clearTimeout(clearStripStepTimer);
      clearStripStepTimer = setTimeout(clearCadenceStep, 340);
    });
    el.cadenceStrip.appendChild(div);
  });
}

async function playChordTableCellSequence(cells, label) {
  if (!Array.isArray(cells) || cells.length === 0) return;
  const playableCells = cells.filter((cell) => cell?.dataset?.root && cell?.dataset?.quality);
  if (playableCells.length === 0) return;
  const beatSeconds = getHarmonyBeatSeconds();
  const stepSeconds = beatSeconds * 2;
  const hold = Math.max(0.14, stepSeconds * 0.9);
  const stepMs = Math.max(60, Math.round(stepSeconds * 1000));
  for (let i = 0; i < playableCells.length; i += 1) {
    const cell = playableCells[i];
    const root = cell?.dataset?.root;
    const quality = cell?.dataset?.quality;
    if (!root || !quality) continue;
    clearChordTableSelection();
    cell.classList.add("is-selected");
    const midi = buildChordMidiForPaletteCell(cell, "root position", 3);
    playMidiNotes(midi, {
      hold,
      asChord: true,
      highlightMs: getHighlightMs(hold, stepMs),
      restrictToWindow: false
    });
    if (i === playableCells.length - 1) {
      celebrateResolutionCell(cell);
    }
    await wait(stepMs);
  }

  if (el.chordDisplay) {
    const shortLabel = playableCells.map((cell) => cell?.dataset?.label).filter(Boolean).join(" -> ");
    el.chordDisplay.textContent = `${label}: ${shortLabel}`;
  }
  trackRep("chords", label);
}

function playCircularResolveAtStartCell(startCell, resolvedMidi, resolveHold, options = {}) {
  if (!startCell || !Array.isArray(resolvedMidi) || resolvedMidi.length === 0) return;
  const hold = Math.max(0.08, Number(resolveHold) || 0.2);
  const restrictToWindow = options.restrictToWindow === true;
  clearChordTableSelection();
  startCell.classList.add("is-selected");
  playMidiNotes(resolvedMidi, {
    hold,
    asChord: true,
    highlightMs: getHighlightMs(hold, Math.round(hold * 1000)),
    restrictToWindow
  });
  celebrateResolutionCell(startCell);
}

function cancelPaletteSequence() {
  paletteSequenceToken += 1;
  clearScheduledFallbackNoteTimers();
  clearKeyboardHighlights();
}

function registerExploreTimer(timerId, type = "timeout") {
  if (!Number.isFinite(Number(timerId))) return;
  appState.exploreTimers.push({ id: timerId, type });
}

function clearExploreTimer(timerId) {
  if (!Number.isFinite(Number(timerId))) return;
  window.clearTimeout(timerId);
  window.clearInterval(timerId);
  appState.exploreTimers = appState.exploreTimers.filter((entry) => entry.id !== timerId);
}

function clearExploreTimers() {
  appState.exploreTimers.forEach((entry) => {
    window.clearTimeout(entry.id);
    window.clearInterval(entry.id);
  });
  appState.exploreTimers = [];
}

function dominantRootForKey(key) {
  return NOTES[(NOTES.indexOf(key) + DEGREE_TO_SEMITONE[4]) % 12];
}

function isDominantExplorationChord(root, quality) {
  const normalizedQuality = String(quality || "");
  if (normalizedQuality === "dom7") return true;
  if (!normalizedQuality.includes("7")) return false;
  return root === dominantRootForKey(el.keySelect?.value || appState.root);
}

function buildTensionFragmentNotes(root, level) {
  const safeLevel = Math.max(0, Math.min(DOMINANT_TENSION_PATTERNS.length - 1, Number(level) || 0));
  const pattern = DOMINANT_TENSION_PATTERNS[safeLevel];
  const baseMidi = 12 * (3 + 1) + NOTES.indexOf(root);
  const ascending = [...pattern.map((offset) => baseMidi + offset), baseMidi + 12];
  const lastIdx = ascending.length - 1;
  const candidateIdx = [0, 2, 3, 5, lastIdx];
  const resolvedIdx = candidateIdx.filter((idx) => idx >= 0 && idx < ascending.length);
  const uniqueMidi = [];
  const seen = new Set();
  resolvedIdx.forEach((idx) => {
    const midi = ascending[idx];
    if (seen.has(midi)) return;
    seen.add(midi);
    uniqueMidi.push(midi);
  });
  return uniqueMidi.map((midi) => midiToNoteName(midi));
}

function playHarmonySustainPulse(chordMidi) {
  const midi = Array.isArray(chordMidi) ? chordMidi.filter((note) => Number.isFinite(note)) : [];
  if (!midi.length) return;
  const hold = Math.max(1.05, Math.min(1.75, getStepSeconds() * 3.2));
  const velocity = 0.56;
  const start = getSchedulerNowSeconds() + Math.max(0.002, getInteractiveStartLeadTimeSeconds());
  midi.forEach((note) => {
    scheduleSingleMidiNote(note, start, hold, velocity);
  });
}

function playHarmonyTensionFragment(root, level) {
  const notes = buildTensionFragmentNotes(root, level);
  if (!notes.length) return;
  void playPatternScheduled({
    notes,
    fingers: null,
    startTimeSec: getSchedulerNowSeconds() + Math.max(0.004, getInteractiveStartLeadTimeSeconds()),
    showFingers: false,
    snapshot: false
  });
}

function beginHarmonyExploration(chordContext) {
  if (!chordContext?.root || !Array.isArray(chordContext?.midi)) return;
  stopHarmonyExploration({ withResolution: false, clearLabel: false });
  appState.isExploring = true;
  appState.exploreLevel = 0;
  appState.exploreStartTime = Date.now();
  activeExploreChordContext = { ...chordContext };
  updateExploreHarmonyUi();
  setExploreTensionLabel(0);
  if (el.chordDisplay) {
    el.chordDisplay.textContent = `Exploring harmony: ${chordContext.label}`;
  }

  playHarmonySustainPulse(chordContext.midi);
  const sustainIntervalId = window.setInterval(() => {
    if (!appState.isExploring || !activeExploreChordContext) return;
    playHarmonySustainPulse(activeExploreChordContext.midi);
  }, Math.max(1300, Math.round(getStepSeconds() * 3600)));
  registerExploreTimer(sustainIntervalId, "interval");

  if (!isDominantExplorationChord(chordContext.root, chordContext.quality)) {
    return;
  }

  playHarmonyTensionFragment(chordContext.root, appState.exploreLevel);
  const cycleIntervalId = window.setInterval(() => {
    if (!appState.isExploring || !activeExploreChordContext) return;
    appState.exploreLevel = (appState.exploreLevel + 1) % TENSION_LEVEL_LABELS.length;
    setExploreTensionLabel(appState.exploreLevel);
    playHarmonyTensionFragment(activeExploreChordContext.root, appState.exploreLevel);
  }, EXPLORATION_CYCLE_MS);
  registerExploreTimer(cycleIntervalId, "interval");
}

function stopHarmonyExploration(options = {}) {
  const withResolution = options.withResolution === true;
  const clearLabel = options.clearLabel !== false;
  const wasExploring = appState.isExploring;
  clearExploreTimers();
  appState.isExploring = false;
  appState.exploreLevel = 0;
  if (clearLabel) {
    clearExploreTensionLabel();
  }

  const context = activeExploreChordContext;
  activeExploreChordContext = null;
  if (withResolution && wasExploring && context) {
    const tonicRoot = el.keySelect?.value || appState.root;
    const tonicMidi = buildChordMidi(tonicRoot, "major", "root position", 3);
    const hold = Math.max(0.18, Math.min(0.5, getStepSeconds() * 1.3));
    playMidiNotes(tonicMidi, { hold, asChord: true, restrictToWindow: false, highlightMs: getHighlightMs(hold, 120) });
  }
}

function celebrateResolutionCell(cell) {
  if (!cell) return;
  cell.classList.remove("victory-resolve");
  const existingBursts = cell.querySelectorAll(".resolve-burst");
  existingBursts.forEach((burst) => burst.remove());
  // Force restart so repeated plays retrigger glow animation.
  void cell.offsetWidth;
  cell.classList.add("victory-resolve");

  const burst = document.createElement("span");
  burst.className = "resolve-burst";
  const noteGlyphs = ["♪", "♫", "♬"];
  const particleCount = 8;

  for (let i = 0; i < particleCount; i += 1) {
    const note = document.createElement("span");
    note.className = "resolve-note";
    note.textContent = noteGlyphs[i % noteGlyphs.length];
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() * 0.35 - 0.17);
    const distance = 22 + Math.random() * 20;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    note.style.setProperty("--dx", `${dx.toFixed(2)}px`);
    note.style.setProperty("--dy", `${dy.toFixed(2)}px`);
    note.style.setProperty("--delay", `${Math.round(Math.random() * 85)}ms`);
    note.style.setProperty("--rot", `${Math.round((Math.random() - 0.5) * 80)}deg`);
    burst.appendChild(note);
  }

  cell.appendChild(burst);

  window.setTimeout(() => {
    burst.remove();
    cell.classList.remove("victory-resolve");
  }, 950);
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
  stopHarmonyExploration({ withResolution: false, clearLabel: true });
  cancelPaletteSequence();
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
  const sourceLessons = Array.isArray(track.lessons)
    ? track.lessons
    : Array.isArray(track.levels)
      ? track.levels
      : [];
  const baseLessons = sourceLessons.map((level, idx) => ({
    id: level.id || `${trackId}-${idx}`,
    trackId,
    title: level.title,
    description: level.desc,
    prerequisites: Array.isArray(level.prerequisites) ? level.prerequisites : [],
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

  if (lesson?.artifact && Array.isArray(lesson.artifact.sequence) && lesson.artifact.sequence.length > 0) {
    return buildGuidedPlanFromArtifactLesson(lesson.artifact, passCondition);
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

function buildGuidedPlanFromArtifactLesson(artifact, passCondition) {
  const key = String(artifact?.key || appState.root || "C");
  const sequence = Array.isArray(artifact?.sequence) ? artifact.sequence : [];
  const sequenceLabel = sequence.map((step) => step.chord || `${step.root}${step.quality}`).join(" -> ");
  return {
    objective: `Master the generated concept: ${artifact.title}`,
    steps: [
      "Hear the exact sequence and identify tension/release moments.",
      "Recreate the sequence without looking at the labels.",
      "Transpose it to one nearby key and keep timing steady."
    ],
    history: "This guided card was generated from your AI coach conversation and pinned into lesson mode.",
    funFact: "Short looped concept drills produce faster transfer than isolated theory memorization.",
    songs: [
      `Artifact focus sequence: ${sequenceLabel || "custom harmony sequence"}.`,
      "Apply the same movement to a song you already play."
    ],
    practice: {
      mode: "artifact_harmonic",
      key,
      sequence
    },
    passCondition
  };
}

function applyGuidedLessonSetup(plan) {
  const setup = plan.practice || {};
  const key = setup.key || appState.root;
  setRootContext(key);
  const normalizedKey = normalizePitchClass(key);
  if (el.rootSelect) el.rootSelect.value = normalizedKey;
  if (el.keySelect) el.keySelect.value = normalizedKey;
  if (el.scaleRootSelect) el.scaleRootSelect.value = normalizedKey;
  if (el.arpRootSelect) el.arpRootSelect.value = normalizedKey;
  if (el.conceptKeySelect) el.conceptKeySelect.value = normalizedKey;

  if (setup.mode === "progression" && setup.progressionName && el.progressionSelect && PROGRESSIONS[setup.progressionName]) {
    el.progressionSelect.value = setup.progressionName;
    renderProgressionStrip();
  }
  if (setup.mode === "cadence" && setup.cadenceName && el.cadenceSelect && CADENCES[setup.cadenceName]) {
    el.cadenceSelect.value = setup.cadenceName;
    renderCadenceStrip();
  }
  if (setup.mode === "scale" && setup.scaleType && el.scaleTypeSelect) {
    el.scaleTypeSelect.value = resolveScalePatternKey(setup.scaleType);
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
      playMidiNotes(step.midi, { hold, asChord: true, highlightMs: getHighlightMs(hold, 170), restrictToWindow: false });
      await wait(220);
    }
    return seq.flatMap((step) => step.midi);
  }

  if (setup.mode === "cadence") {
    const seq = buildCadenceChords(setup.key || appState.root, setup.cadenceName || "Authentic (V-I)");
    for (const step of seq) {
      playMidiNotes(step.midi, { hold, asChord: true, highlightMs: getHighlightMs(hold, 170), restrictToWindow: false });
      await wait(230);
    }
    return seq.flatMap((step) => step.midi);
  }

  if (setup.mode === "scale") {
    const patternKey = resolveScalePatternKey(setup.scaleType);
    const notes = buildScalePatternMidi(setup.key || appState.root, patternKey, 3);
    await playPatternScheduled({
      notes: notes.map((midi) => midiToNoteName(midi)),
      fingers: buildScaleFingering(notes.map((midi) => midiToNoteName(midi)), "right"),
      showFingers: true,
      snapshot: false
    });
    return notes;
  }

  if (setup.mode === "artifact_harmonic" && Array.isArray(setup.sequence) && setup.sequence.length > 0) {
    const beatSeconds = getHarmonyBeatSeconds();
    const stepSeconds = beatSeconds * 2;
    const hold = Math.max(0.14, stepSeconds * 0.9);
    for (const step of setup.sequence) {
      const root = String(step?.root || setup.key || appState.root);
      const quality = String(step?.quality || "major");
      const beats = Math.max(1, Math.min(8, Number(step?.beats) || 2));
      const midi = buildChordMidi(root, quality, "root position", 3);
      playMidiNotes(midi, { hold: Math.max(0.14, beatSeconds * beats * 0.9), asChord: true, highlightMs: getHighlightMs(hold, 170), restrictToWindow: false });
      await wait(Math.max(120, Math.round(beatSeconds * beats * 1000)));
    }
    return setup.sequence.flatMap((step) => buildChordMidi(step.root, step.quality, "root position", 3));
  }

  const chord = buildChordMidi(setup.key || appState.root, setup.chordQuality || appState.quality, setup.inversion || "root position", 3);
  playMidiNotes(chord, { hold, asChord: true, highlightMs: getHighlightMs(hold, 170), restrictToWindow: false });
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

function recordTheoryLessonCompletionEvent(lesson) {
  if (!lesson?.id) return;
  if (!Array.isArray(progress.recent)) progress.recent = [];
  const day = todayKey();
  const exists = progress.recent.some((entry) => (
    entry?.area === "theory"
    && entry?.lessonId === lesson.id
    && entry?.date === day
  ));
  if (exists) return;
  progress.recent.unshift({
    area: "theory",
    topic: lesson.title || "Theory lesson",
    lessonId: lesson.id,
    date: day
  });
  progress.recent = progress.recent.slice(0, 24);
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
    const wasCompleted = Boolean(progress.theoryCompletedLessons?.[lesson.id]);
    stats.passed = true;
    progress.theoryCompletedLessons[lesson.id] = true;
    if (!wasCompleted) {
      recordTheoryLessonCompletionEvent(lesson);
    }
    saveProgress();
    markCoachLessonStackCompleted(lesson.id);
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

  playMidiNotes(concept.midi, { hold, asChord: true, highlightMs: getHighlightMs(hold), restrictToWindow: false });
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
    playMidiNotes(chords[i].midi, { hold, asChord: true, restrictToWindow: false });
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
  playMidiNotes(midi, { hold: getHoldSeconds(), asChord: true, highlightMs: getHighlightMs(getHoldSeconds()), restrictToWindow: false });
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

function buildScalePatternMidi(root, patternKey, octave = 3, octaveCount = 1) {
  const resolvedPattern = resolveScalePatternKey(patternKey);
  const intervals = SCALE_PATTERN_LIBRARY[resolvedPattern]?.intervals || SCALE_PATTERN_LIBRARY.major.intervals;
  const base = 12 * (octave + 1) + NOTES.indexOf(root);
  const count = Math.max(1, Math.min(3, Number.parseInt(octaveCount, 10) || 1));
  const expandedIntervals = [];
  for (let octaveIndex = 0; octaveIndex < count; octaveIndex += 1) {
    intervals.forEach((interval) => {
      expandedIntervals.push(interval + octaveIndex * 12);
    });
  }
  expandedIntervals.push(count * 12);
  return expandedIntervals.map((interval) => base + interval);
}

function buildDescendingScalePatternMidi(root, patternKey, octave = 4, octaveCount = 1) {
  const ascending = buildScalePatternMidi(root, patternKey, octave - octaveCount, octaveCount);
  return ascending.reverse();
}

function buildScalePlaybackPlan(root, patternKey, octaveCount = 1, hand = "right", motion = "parallel") {
  const rightAscendingMidi = buildScalePatternMidi(root, patternKey, 4, octaveCount);
  const leftAscendingMidi = buildScalePatternMidi(root, patternKey, 3, octaveCount);
  const rightDescendingMidi = buildDescendingScalePatternMidi(root, patternKey, 4 + octaveCount, octaveCount);
  const leftDescendingMidi = buildDescendingScalePatternMidi(root, patternKey, 4, octaveCount);

  if (hand === "left") {
    const notes = leftAscendingMidi.map(midiToNoteName);
    const fingers = buildScaleFingering(notes, "left");
    return {
      events: notes.map((note, index) => ({ notes: [note], fingers: [fingers[index]] })),
      label: "left hand",
      summary: notes.join(" - ")
    };
  }

  if (hand !== "both") {
    const notes = rightAscendingMidi.map(midiToNoteName);
    const fingers = buildScaleFingering(notes, "right");
    return {
      events: notes.map((note, index) => ({ notes: [note], fingers: [fingers[index]] })),
      label: "right hand",
      summary: notes.join(" - ")
    };
  }

  const rightMidi = motion === "contrary-in" ? rightDescendingMidi : rightAscendingMidi;
  const leftMidi = motion === "contrary-out" ? leftDescendingMidi : leftAscendingMidi;
  const rightNotes = rightMidi.map(midiToNoteName);
  const leftNotes = leftMidi.map(midiToNoteName);
  const rightFingers = motion === "contrary-in"
    ? buildScaleFingering([...rightNotes].reverse(), "right").reverse()
    : buildScaleFingering(rightNotes, "right");
  const leftFingers = motion === "contrary-out"
    ? buildScaleFingering([...leftNotes].reverse(), "left").reverse()
    : buildScaleFingering(leftNotes, "left");
  const length = Math.min(rightNotes.length, leftNotes.length);
  const events = [];
  for (let index = 0; index < length; index += 1) {
    events.push({
      notes: [leftNotes[index], rightNotes[index]],
      fingers: [leftFingers[index], rightFingers[index]]
    });
  }
  const motionLabel = motion === "contrary-out"
    ? "both hands, contrary outward"
    : motion === "contrary-in"
      ? "both hands, contrary inward"
      : "both hands, together";
  return {
    events,
    label: motionLabel,
    summary: events.map((event) => event.notes.join(" + ")).join(" | ")
  };
}

function buildScaleFingering(notes, hand = "right") {
  const length = Array.isArray(notes) ? notes.length : 0;
  const defaultPattern = buildMultiOctaveScaleFingering(length, hand, false);
  const altPattern = buildMultiOctaveScaleFingering(length, hand, true);
  if (!scaleFingeringHasThumbOnBlack(notes, defaultPattern)) return defaultPattern;
  if (!scaleFingeringHasThumbOnBlack(notes, altPattern)) return altPattern;
  return defaultPattern;
}

function buildMultiOctaveScaleFingering(targetLength, hand = "right", useAlternative = false) {
  const length = Math.max(0, Number.parseInt(targetLength, 10) || 0);
  if (!length) return [];
  if (length <= 8) {
    if (hand === "left") return (useAlternative ? [5, 4, 3, 2, 1, 4, 3, 2] : [5, 4, 3, 2, 1, 3, 2, 1]).slice(0, length);
    return (useAlternative ? [1, 2, 3, 4, 1, 2, 3, 5] : [1, 2, 3, 1, 2, 3, 4, 5]).slice(0, length);
  }

  const fingers = [];
  if (hand === "left") {
    const firstOctave = useAlternative ? [5, 4, 3, 2, 1, 4, 3, 2] : [5, 4, 3, 2, 1, 3, 2, 1];
    const continuingOctave = useAlternative ? [4, 3, 2, 1, 4, 3, 2] : [4, 3, 2, 1, 3, 2, 1];
    fingers.push(...firstOctave);
    while (fingers.length < length) {
      fingers.push(...continuingOctave);
    }
    return fingers.slice(0, length);
  }

  const sevenNoteCycle = useAlternative ? [1, 2, 3, 4, 1, 2, 3] : [1, 2, 3, 1, 2, 3, 4];
  while (fingers.length < length - 1) {
    fingers.push(...sevenNoteCycle);
  }
  return [...fingers.slice(0, length - 1), 5];
}

function scaleFingeringHasThumbOnBlack(notes, pattern) {
  const length = Math.min(notes.length, pattern.length);
  for (let i = 0; i < length; i += 1) {
    if (pattern[i] !== 1) continue;
    if (String(notes[i]).includes("#")) return true;
  }
  return false;
}

function getKeyEl(note) {
  const midi = noteNameToMidi(note);
  if (!Number.isFinite(midi)) return null;
  return keyElsByMidi.get(midi) || null;
}

function showFingerOnKey(keyEl, fingerNum) {
  if (!keyEl || !Number.isFinite(Number(fingerNum))) return;
  let badge = keyEl.querySelector(".finger-number");
  if (!badge) {
    badge = document.createElement("div");
    badge.className = "finger-number";
    keyEl.appendChild(badge);
  }
  badge.textContent = String(fingerNum);
}

function highlightKey(note, fingerNum, showFingers = true) {
  const keyEl = getKeyEl(note);
  if (!keyEl) return;
  keyEl.classList.add("active", "used-note");
  if (showFingers && Number.isFinite(Number(fingerNum))) {
    showFingerOnKey(keyEl, fingerNum);
  }
}

function clearFingerOverlays() {
  keyElsByMidi.forEach((keyEl) => {
    const badge = keyEl.querySelector(".finger-number");
    if (badge) badge.remove();
  });
}

function clearPatternUiTimers() {
  patternUiTimerIds.forEach((timerId) => window.clearTimeout(timerId));
  patternUiTimerIds.clear();
}

function registerPatternUiTimer(timerId) {
  patternUiTimerIds.add(timerId);
}

function clearPatternVisualState() {
  keyElsByMidi.forEach((keyEl) => {
    keyEl.classList.remove("active", "used-note", "dimmed");
  });
  clearChordDiffPreview();
  reapplyTypingHeldHighlights();
}

function getSchedulerNowSeconds() {
  if (isToneEngineAvailable() && typeof window.Tone?.now === "function") {
    return window.Tone.now();
  }
  if (audioCtx) return audioCtx.currentTime;
  return 0;
}

function scheduleSingleMidiNote(midi, startTimeSec, holdSeconds, velocity) {
  if (isToneEngineAvailable() && toneEngineReady && toneSampler) {
    try {
      toneSampler.triggerAttackRelease(midiToNoteName(midi), holdSeconds, startTimeSec, velocity);
      return true;
    } catch {
      toneEngineReady = false;
      toneSampler = null;
    }
  }

  if (shouldUseRnboPrimaryEngine() && rnboEngineActive) {
    return scheduleRnboNote(midi, startTimeSec, holdSeconds, velocity);
  }

  if (sampleEngineReady && !htmlSampleEngineActive) {
    playPianoVoice(midi, startTimeSec, holdSeconds, velocity);
    return true;
  }

  if (htmlSampleEngineActive) {
    const nowSec = getSchedulerNowSeconds();
    const delayMs = Math.max(0, Math.round((startTimeSec - nowSec) * 1000));
    const timerId = window.setTimeout(() => {
      scheduledFallbackNoteTimers.delete(timerId);
      playHtmlSampleForMidi(midi, holdSeconds, velocity);
    }, delayMs);
    scheduledFallbackNoteTimers.add(timerId);
    return true;
  }

  return false;
}

async function playPatternScheduled({
  events = null,
  notes,
  fingers = null,
  startTimeSec = null,
  showFingers = true,
  snapshot = true,
  snapshotHoldMs = 800
}) {
  const eventList = Array.isArray(events) && events.length
    ? events.map((event) => {
      const eventNotes = Array.isArray(event?.notes) ? event.notes : [event?.note].filter(Boolean);
      const eventFingers = Array.isArray(event?.fingers) ? event.fingers : [];
      const midi = eventNotes
        .map((note) => noteNameToMidi(note))
        .filter((value) => Number.isFinite(value));
      return { midi, fingers: eventFingers };
    }).filter((event) => event.midi.length)
    : (Array.isArray(notes) ? notes : [])
      .map((note, index) => {
        const midi = noteNameToMidi(note);
        return Number.isFinite(midi)
          ? { midi: [midi], fingers: [Array.isArray(fingers) ? fingers[index] : null] }
          : null;
      })
      .filter(Boolean);
  if (!eventList.length) return;
  if (!ensureAudio()) return;

  const runId = Date.now() + Math.floor(Math.random() * 1000);
  activePatternRunId = runId;
  clearPatternUiTimers();
  clearFingerOverlays();
  clearPatternVisualState();

  if (isToneEngineAvailable() && (!toneEngineReady || !toneSampler)) {
    await ensureToneEngine();
  }

  if (!toneEngineReady && shouldUseRnboPrimaryEngine() && !htmlSampleEngineActive && !rnboEngineActive && !rnboEngineFailedReason) {
    await initializeRnboEngine();
  }

  const canSchedule = (isToneEngineAvailable() && toneEngineReady && toneSampler)
    || (shouldUseRnboPrimaryEngine() && rnboEngineActive)
    || (sampleEngineReady && !htmlSampleEngineActive)
    || htmlSampleEngineActive;
  if (!canSchedule) {
    if (el.scaleOutput) {
      el.scaleOutput.textContent = "Audio scheduler unavailable. Click a key once, then retry scale playback.";
    }
    activePatternRunId = 0;
    return;
  }

  const stepSeconds = getStepSeconds();
  const holdSeconds = Math.max(0.06, stepSeconds * 0.9);
  const velocity = 0.76;
  const nowSec = getSchedulerNowSeconds();
  const safeStart = Number.isFinite(startTimeSec)
    ? Math.max(startTimeSec, nowSec + 0.002)
    : nowSec + Math.max(0.01, getInteractiveStartLeadTimeSeconds());
  const usedNotes = new Set();

  eventList.forEach((event, idx) => {
    const noteStart = safeStart + idx * stepSeconds;
    const eventNotes = event.midi.map((midi) => midiToNoteName(midi));
    event.midi.forEach((midi) => {
      scheduleSingleMidiNote(midi, noteStart, holdSeconds, velocity);
      usedNotes.add(midiToNoteName(midi));
    });

    const onDelayMs = Math.max(0, Math.round((noteStart - nowSec) * 1000));
    const offDelayMs = Math.max(onDelayMs + 36, Math.round((noteStart + holdSeconds - nowSec) * 1000));
    const onTimerId = window.setTimeout(() => {
      if (activePatternRunId !== runId) return;
      eventNotes.forEach((note, noteIndex) => {
        highlightKey(note, event.fingers[noteIndex], showFingers);
      });
    }, onDelayMs);
    const offTimerId = window.setTimeout(() => {
      if (activePatternRunId !== runId) return;
      eventNotes.forEach((note) => {
        const keyEl = getKeyEl(note);
        if (keyEl) keyEl.classList.remove("active");
      });
    }, offDelayMs);
    registerPatternUiTimer(onTimerId);
    registerPatternUiTimer(offTimerId);
  });

  const patternDurationSeconds = (eventList.length - 1) * stepSeconds + holdSeconds;
  const finalDelayMs = Math.max(0, Math.round((safeStart + patternDurationSeconds - nowSec) * 1000));
  const finalizeTimerId = window.setTimeout(() => {
    if (activePatternRunId !== runId) return;
    keyElsByMidi.forEach((keyEl) => {
      keyEl.classList.remove("active");
      const keyNote = keyEl.dataset.note;
      if (!snapshot) {
        keyEl.classList.remove("dimmed", "used-note");
        return;
      }
      if (keyNote && usedNotes.has(keyNote)) {
        keyEl.classList.add("used-note");
        keyEl.classList.remove("dimmed");
      } else {
        keyEl.classList.add("dimmed");
      }
    });

    const cleanupDelayMs = snapshot ? Math.max(0, Number(snapshotHoldMs) || 800) : 0;
    const cleanupTimerId = window.setTimeout(() => {
      if (activePatternRunId !== runId) return;
      clearFingerOverlays();
      clearPatternVisualState();
      clearPatternUiTimers();
      activePatternRunId = 0;
    }, cleanupDelayMs);
    registerPatternUiTimer(cleanupTimerId);
  }, finalDelayMs);
  registerPatternUiTimer(finalizeTimerId);
}

function buildProgressionChords(keyOrContext, progressionName, voicingMode = "root position") {
  const degreeOffsets = PROGRESSIONS[progressionName];
  const context = typeof keyOrContext === "object"
    ? keyOrContext
    : { root: keyOrContext, mode: "major", quality: "major" };
  const key = context.root || "C";
  const keyIndex = NOTES.indexOf(key);
  const paletteItem = findProgressionPaletteItem(progressionName);
  const degreeMap = context.mode === "minor" || context.quality === "minor"
    ? MINOR_KEY_DEGREE_TO_SEMITONE
    : DEGREE_TO_SEMITONE;
  const preferFlats = shouldPreferFlatsForProgression(context, paletteItem || {});

  const chords = degreeOffsets.map((offset, i) => {
    const rootOffset = paletteItem?.rootOffsets?.[i] ?? degreeMap[offset % 7];
    const degreeRoot = NOTES[(keyIndex + rootOffset + 12) % 12];
    const quality = chooseDiatonicQuality(offset, progressionName, i, context);
    const inversion = normalizeProgressionVoicingMode(voicingMode) === "voice-led"
      ? "root position"
      : normalizeProgressionVoicingMode(voicingMode);
    const midi = buildChordMidi(degreeRoot, quality, inversion, 3);
    const displayRoot = formatHarmonyNoteName(degreeRoot, preferFlats);
    return {
      degree: paletteItem?.displayRomans?.[i] || romanForDegree(offset, context),
      root: degreeRoot,
      quality,
      name: `${displayRoot} ${CHORDS[quality].label}`,
      symbol: harmonyChordSymbol(degreeRoot, quality, { preferFlat: preferFlats }),
      midi,
      voicing: inversion
    };
  });
  return normalizeProgressionVoicingMode(voicingMode) === "voice-led"
    ? applyVoiceLeadingToProgressionChords(chords)
    : chords;
}

function findProgressionPaletteItem(name) {
  return PROGRESSION_PALETTE_GROUPS
    .flatMap((group) => group.items)
    .find((item) => item.name === name);
}

function findProgressionPaletteGroupForItem(name) {
  return PROGRESSION_PALETTE_GROUPS.find((group) => group.items.some((item) => item.name === name));
}

function setProgressionPaletteFocus(root, quality = "major", source = "key") {
  progressionPaletteFocus = {
    root: normalizePitchClass(root) || "C",
    quality: quality === "minor" ? "minor" : "major",
    source
  };
}

function getProgressionPaletteContext() {
  const root = normalizePitchClass(progressionPaletteFocus?.root || el.keySelect?.value || appState.root || "C");
  const isMinor = progressionPaletteFocus?.quality === "minor";
  return {
    root,
    mode: isMinor ? "minor" : "major",
    quality: isMinor ? "minor" : "major",
    source: progressionPaletteFocus?.source || "key",
    label: `${displayPitchClass(root, { preferFlat: shouldUseFlatKeyDisplay() })} ${isMinor ? "minor" : "major"}`
  };
}

function normalizeProgressionVoicingMode(value) {
  return ["root position", "1st inversion", "2nd inversion", "voice-led"].includes(value)
    ? value
    : "root position";
}

function getProgressionVoicingMode() {
  return normalizeProgressionVoicingMode(el.progressionVoicingSelect?.value || "root position");
}

function progressionVoicingLabel(value) {
  const mode = normalizeProgressionVoicingMode(value);
  if (mode === "voice-led") return "voice-led";
  return mode;
}

function normalizeProgressionStyleMode(value) {
  return Object.prototype.hasOwnProperty.call(PROGRESSION_STYLE_PATTERNS, value)
    ? value
    : "plain";
}

function getProgressionStyleMode() {
  return normalizeProgressionStyleMode(el.progressionStyleSelect?.value || "plain");
}

function progressionStyleLabel(value) {
  const mode = normalizeProgressionStyleMode(value);
  return PROGRESSION_STYLE_PATTERNS[mode]?.label || "Plain";
}

function buildProgressionPaletteChords(keyOrContext, item, voicingMode = "root position") {
  const context = typeof keyOrContext === "object"
    ? keyOrContext
    : { root: keyOrContext, mode: "major", quality: "major" };
  const key = context.root || "C";
  const isMinorContext = context.mode === "minor" || context.quality === "minor";
  const degreeMap = isMinorContext ? MINOR_KEY_DEGREE_TO_SEMITONE : DEGREE_TO_SEMITONE;
  const degreeOffsets = PROGRESSIONS[item.name] || [];
  const keyIndex = NOTES.indexOf(key);
  const preferFlats = shouldPreferFlatsForProgression(context, item);
  const normalizedVoicing = normalizeProgressionVoicingMode(voicingMode);
  const chords = degreeOffsets.map((offset, idx) => {
    const rootOffset = item.rootOffsets?.[idx] ?? degreeMap[offset % 7];
    const root = NOTES[(keyIndex + rootOffset + 12) % 12];
    const quality = item.qualities?.[idx] || chooseDiatonicQuality(offset, item.name, idx, context);
    const displayRoot = formatHarmonyNoteName(root, preferFlats);
    const inversion = normalizedVoicing === "voice-led" ? "root position" : normalizedVoicing;
    return {
      degree: item.displayRomans?.[idx] || romanForDegree(offset, context),
      root,
      quality,
      symbol: harmonyChordSymbol(root, quality, { preferFlat: preferFlats }),
      name: `${displayRoot} ${CHORDS[quality]?.label || quality}`,
      midi: buildChordMidi(root, quality, inversion, 3),
      voicing: inversion
    };
  });
  return normalizedVoicing === "voice-led"
    ? applyVoiceLeadingToProgressionChords(chords)
    : chords;
}

function applyVoiceLeadingToProgressionChords(chords = []) {
  let previous = null;
  return chords.map((chord, idx) => {
    const voicingOptions = buildChordVoicingOptions(chord.root, chord.quality, idx === 0 ? 3 : 3);
    const best = !previous
      ? chooseCenteredProgressionStart(voicingOptions)
      : voicingOptions.sort((a, b) => voiceLeadDistance(previous, a.midi) - voiceLeadDistance(previous, b.midi))[0];
    previous = best?.midi || chord.midi;
    return {
      ...chord,
      midi: previous,
      voicing: best?.inversion || "root position"
    };
  });
}

function chordCenterMidi(midi = []) {
  const notes = Array.isArray(midi) ? midi.filter((note) => Number.isFinite(note)) : [];
  if (!notes.length) return PROGRESSION_START_TARGET_MIDI;
  return notes.reduce((sum, note) => sum + note, 0) / notes.length;
}

function chooseCenteredProgressionStart(voicingOptions = []) {
  const options = Array.isArray(voicingOptions) ? voicingOptions.filter((option) => option?.midi?.length) : [];
  if (!options.length) return null;
  return [...options].sort((a, b) => {
    const centerDelta = Math.abs(chordCenterMidi(a.midi) - PROGRESSION_START_TARGET_MIDI)
      - Math.abs(chordCenterMidi(b.midi) - PROGRESSION_START_TARGET_MIDI);
    if (Math.abs(centerDelta) > 0.001) return centerDelta;
    const inversionDelta = a.inversion === "root position" ? -1 : b.inversion === "root position" ? 1 : 0;
    if (inversionDelta !== 0) return inversionDelta;
    return voiceLeadDistance([PROGRESSION_START_TARGET_MIDI], a.midi)
      - voiceLeadDistance([PROGRESSION_START_TARGET_MIDI], b.midi);
  })[0];
}

function buildChordVoicingOptions(root, quality, baseOctave = 3) {
  if (!root || !CHORDS[quality]) return [];
  const inversions = ["root position", "1st inversion", "2nd inversion"];
  const octaves = [baseOctave - 1, baseOctave, baseOctave + 1].filter((octave) => octave >= 1 && octave <= 5);
  return octaves.flatMap((octave) => inversions.map((inversion) => ({
    inversion,
    octave,
    midi: buildChordMidi(root, quality, inversion, octave)
  })));
}

function shouldPreferFlatsForProgression(context = {}, item = {}) {
  if (item.preferFlats === true) return true;
  if (shouldUseFlatKeyDisplay()) return true;
  const root = normalizePitchClass(context.root || "C");
  if (context.mode === "minor" || context.quality === "minor") {
    return ["F", "A#", "D#", "G#", "C#"].includes(root);
  }
  return root === "F";
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

function romanForDegree(degree, context = {}) {
  const idx = degree % 7;
  if (context.mode === "minor" || context.quality === "minor") {
    return ["i", "ii°", "III", "iv", "v", "VI", "VII"][idx] || "i";
  }
  return ROMAN[idx] || "I";
}

function degreeToSemitone(degreeIndex) {
  return DEGREE_TO_SEMITONE[degreeIndex % 7];
}

function chooseDiatonicQuality(degree, progressionName, index, context = {}) {
  const paletteItem = findProgressionPaletteItem(progressionName);
  if (paletteItem?.qualities?.[index]) return paletteItem.qualities[index];
  const isMinorContext = context.mode === "minor" || context.quality === "minor";

  if (progressionName.includes("12-Bar")) {
    if (index === 8 || index === 11) return "dom7";
    return isMinorContext ? "minor" : "major";
  }

  if (progressionName.includes("ii-V-I")) {
    if (isMinorContext) {
      if (degree === 1) return "m7b5";
      if (degree === 4) return "dom7";
      if (degree === 0) return "minor";
    }
    if (degree === 1) return "min7";
    if (degree === 4) return "dom7";
    if (degree === 0) return "maj7";
  }

  if (progressionName.includes("Turnaround") && isMinorContext) {
    if (degree === 1) return "m7b5";
    if (degree === 4) return "dom7";
    if (degree === 0 || degree === 5) return "minor";
  }

  const map = isMinorContext ? MINOR_KEY_TRIAD_QUALITIES : MAJOR_KEY_TRIAD_QUALITIES;
  return map[degree % 7] || "major";
}

function getHoldSeconds() {
  return 60 / Math.max(30, appState.bpm);
}

function toneColor() {
  const value = Number(el.toneInput?.value);
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
  if (htmlSampleEngineActive || emergencyToneEngineActive) {
    sampleEngineReady = true;
    return;
  }
  const total = getTotalRequiredSamples();
  sampleEngineReady = total > 0 && sampleBuffers.size >= total && failedSampleNotes.size === 0;
  if (sampleEngineReady) {
    emergencyToneEngineActive = false;
  }
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
  return USE_TONE_ENGINE && Boolean(window.Tone) && !htmlEngineForcedByProtocol;
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
      emergencyToneEngineActive = false;
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
  const sequenceSpacing = getSequenceSpacingSeconds(options);
  const startBase = audioCtx.currentTime + getInteractiveStartLeadTimeSeconds();
  midiNotes.forEach((midi, idx) => {
    const start = asChord ? startBase : startBase + idx * sequenceSpacing;
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
  const sequenceSpacing = getSequenceSpacingSeconds(options);

  const trigger = () => {
    const toneNotes = notes.map((midi) => midiToNoteName(midi));
    const start = window.Tone.now() + 0.002;
    if (asChord) {
      toneSampler.triggerAttackRelease(toneNotes, hold, start, velocity);
      return;
    }
    toneNotes.forEach((note, idx) => {
      toneSampler.triggerAttackRelease(note, hold, start + idx * sequenceSpacing, velocity);
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
    updateAudioStatusText();
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
  if (isFileProtocolMode()) return null;
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
    emergencyToneEngineActive = false;
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
          activateEmergencyToneEngine();
          flushPendingPlayRequests();
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
  const shouldHighlight = options.highlight !== false;
  const sequenceSpacing = getSequenceSpacingSeconds(options);
  const restrictToWindow = options.restrictToWindow === true;
  const skipStrictChordMode = options.__skipStrictChordMode === true;
  const isMultiNoteChord = asChord && Array.isArray(midiNotes) && midiNotes.length > 1;
  const highlightPlayedNotes = (explicitMs = options.highlightMs) => {
    if (!shouldHighlight) return;
    highlightKeyboard(midiNotes, getHighlightMs(hold, explicitMs), restrictToWindow);
  };

  const toneHandled = playMidiNotesWithToneEngine(midiNotes, options);
  if (toneHandled === true) {
    highlightPlayedNotes();
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
      highlightPlayedNotes(highlightMs);
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
      highlightPlayedNotes();
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
    highlightPlayedNotes();
    return;
  }

  if (htmlSampleEngineActive) {
    if (asChord) {
      playHtmlSampleChord(midiNotes, hold, velocity);
    } else {
      midiNotes.forEach((midi, idx) => {
        const delayMs = idx * sequenceSpacing * 1000;
        window.setTimeout(() => {
          playHtmlSampleForMidi(midi, hold, velocity);
        }, delayMs);
      });
    }
    highlightPlayedNotes();
    return;
  }

  if (emergencyToneEngineActive) {
    playEmergencyMidiNotes(midiNotes, options);
    highlightPlayedNotes();
    return;
  }

  if (!sampleEngineReady) {
    if (isSampleEngineLoading()) {
      enqueuePendingPlayRequest(midiNotes, options);
      updateAudioStatusText();
      return;
    }
    if (playEmergencyMidiNotes(midiNotes, options)) {
      highlightPlayedNotes();
      return;
    }
    updateAudioStatusText("error");
    return;
  }

  const scheduleNotes = () => {
    const now = audioCtx.currentTime + getInteractiveStartLeadTimeSeconds();
    midiNotes.forEach((midi, idx) => {
      const start = asChord ? now : now + idx * sequenceSpacing;
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

  highlightPlayedNotes();
}

function getSequenceSpacingSeconds(options = {}) {
  const spacing = Number(options.sequenceSpacingSeconds);
  if (!Number.isFinite(spacing) || spacing <= 0) return DEFAULT_SEQUENCE_SPACING_SECONDS;
  return Math.max(0.025, Math.min(0.18, spacing));
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
    if (playEmergencyMidiNotes([midi], { hold: holdSeconds, asChord: true, velocity })) {
      return;
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
  if (activePatternRunId) {
    activePatternRunId = 0;
    clearPatternUiTimers();
    clearFingerOverlays();
  }
  keyHighlightTimers.forEach((timerId) => clearTimeout(timerId));
  keyHighlightTimers.clear();
  keyElsByMidi.forEach((keyEl) => keyEl.classList.remove("active", "used-note", "dimmed"));
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
  const start = Number(el.highlightStartRight?.value);
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

function updateWindowKeyboardHint() {
  if (!el.windowKeyboardHint) return;
  el.windowKeyboardHint.textContent = "Drag the gold or blue bar to set each hand's octave.";
}

function clampHighlightStart(value) {
  const numeric = Number(value);
  const fallback = HIGHLIGHT_START_MIN_MIDI;
  const safeValue = Number.isFinite(numeric) ? numeric : fallback;
  return Math.max(HIGHLIGHT_START_MIN_MIDI, Math.min(HIGHLIGHT_START_MAX_MIDI, Math.round(safeValue)));
}

function syncHighlightWindowControls() {
  if (!el.highlightStartLeft || !el.highlightStartRight) return;
  let leftStart = clampHighlightStart(el.highlightStartLeft.value);
  let rightStart = clampHighlightStart(el.highlightStartRight.value);

  if (rightStart < leftStart + HIGHLIGHT_WINDOW_SPAN_SEMITONES) {
    rightStart = Math.min(HIGHLIGHT_START_MAX_MIDI, leftStart + HIGHLIGHT_WINDOW_SPAN_SEMITONES);
    leftStart = Math.min(leftStart, rightStart - HIGHLIGHT_WINDOW_SPAN_SEMITONES);
  }

  el.highlightStartLeft.min = String(HIGHLIGHT_START_MIN_MIDI);
  el.highlightStartLeft.max = String(HIGHLIGHT_START_MAX_MIDI);
  el.highlightStartRight.min = String(HIGHLIGHT_START_MIN_MIDI);
  el.highlightStartRight.max = String(HIGHLIGHT_START_MAX_MIDI);
  el.highlightStartLeft.value = String(clampHighlightStart(leftStart));
  el.highlightStartRight.value = String(clampHighlightStart(rightStart));
}

function updateHighlightLabels() {
  syncHighlightWindowControls();
  const leftStart = Number(el.highlightStartLeft?.value);
  const rightStart = Number(el.highlightStartRight?.value);
  if (el.highlightLabelLeft && Number.isFinite(leftStart)) {
    const end = leftStart + HIGHLIGHT_WINDOW_SPAN_SEMITONES;
    el.highlightLabelLeft.textContent = `LH: ${midiToNoteName(leftStart)}–${midiToNoteName(end)}`;
  }
  if (el.highlightLabelRight && Number.isFinite(rightStart)) {
    const end = rightStart + HIGHLIGHT_WINDOW_SPAN_SEMITONES;
    el.highlightLabelRight.textContent = `RH: ${midiToNoteName(rightStart)}–${midiToNoteName(end)}`;
  }
  updateWindowKeyboardHint();
  updateHighlightGlows();
}

function updateHighlightGlow(glowEl, startEl) {
  if (!startEl || !glowEl) return;
  const min = HIGHLIGHT_START_MIN_MIDI;
  const max = HIGHLIGHT_START_MAX_MIDI;
  const start = Number(startEl.value);
  const totalVisibleKeys = KEYBOARD_LAST_MIDI - KEYBOARD_FIRST_MIDI + 1;
  const windowKeys = HIGHLIGHT_WINDOW_SPAN_SEMITONES + 1;
  if (totalVisibleKeys <= 0 || windowKeys <= 0) return;
  const normalizedStart = Math.min(Math.max(start, min), max);
  const leftPct = ((normalizedStart - KEYBOARD_FIRST_MIDI) / totalVisibleKeys) * 100;
  const widthPct = (windowKeys / totalVisibleKeys) * 100;
  glowEl.style.left = `${leftPct}%`;
  glowEl.style.width = `${Math.max(0, widthPct)}%`;
}

function updateHighlightGlows() {
  updateHighlightGlow(el.highlightGlowLeft, el.highlightStartLeft);
  updateHighlightGlow(el.highlightGlowRight, el.highlightStartRight);
}

function setHighlightFromClientX(hand, clientX) {
  const startEl = hand === "left" ? el.highlightStartLeft : el.highlightStartRight;
  if (!el.highlightWindowTrack || !startEl) return;
  syncHighlightWindowControls();
  const rect = el.highlightWindowTrack.getBoundingClientRect();
  if (rect.width <= 0) return;
  let min = HIGHLIGHT_START_MIN_MIDI;
  let max = HIGHLIGHT_START_MAX_MIDI;
  const leftStart = Number(el.highlightStartLeft?.value);
  const rightStart = Number(el.highlightStartRight?.value);
  if (hand === "right" && Number.isFinite(leftStart)) {
    min = Math.max(min, leftStart + 12);
  }
  if (hand === "left" && Number.isFinite(rightStart)) {
    max = Math.min(max, rightStart - 12);
  }
  const totalVisibleKeys = KEYBOARD_LAST_MIDI - KEYBOARD_FIRST_MIDI + 1;
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  const pointedMidi = KEYBOARD_FIRST_MIDI + ratio * totalVisibleKeys;
  const next = Math.round(pointedMidi - highlightDragOffsetSemitones);
  startEl.value = String(Math.min(max, Math.max(min, next)));
  clearKeyboardHighlights();
  updateHighlightLabels();
  updateHighlightGlows();
}

function onHighlightPointerMove(event) {
  if (!highlightDragHand) return;
  setHighlightFromClientX(highlightDragHand, event.clientX);
}

function endHighlightDrag() {
  highlightDragHand = null;
  highlightDragOffsetSemitones = HIGHLIGHT_WINDOW_SPAN_SEMITONES / 2;
  window.removeEventListener("pointermove", onHighlightPointerMove);
  window.removeEventListener("pointerup", endHighlightDrag);
  window.removeEventListener("pointercancel", endHighlightDrag);
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

function noteNameToMidi(noteName) {
  const match = /^([A-G])(#?)(-?\d+)$/.exec(String(noteName).trim());
  if (!match) return null;
  const baseMap = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const letter = match[1];
  const sharp = match[2] === "#" ? 1 : 0;
  const octave = Number(match[3]);
  return 12 * (octave + 1) + baseMap[letter] + sharp;
}

function randomOf(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getActivePracticePath() {
  const paths = Array.isArray(window.BABY_STEPS_PRACTICE_PATHS) ? window.BABY_STEPS_PRACTICE_PATHS : [];
  return paths.find((path) => path.id === progress.activePracticePathId) || paths[0] || null;
}

function getPracticeDayInfo() {
  const path = getActivePracticePath();
  const startDate = progress.practicePathStartDate || todayKey();
  const today = todayKey();
  const start = new Date(`${startDate}T00:00:00`);
  const now = new Date(`${today}T00:00:00`);
  const rawDayIndex = Number.isFinite(start.getTime())
    ? Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)))
    : 0;
  const days = [];
  path?.weeks?.forEach((week, weekIndex) => {
    week.days.forEach((day, dayIndex) => {
      days.push({ ...day, weekTitle: week.title, weekFocus: week.focus, weekIndex, dayIndex });
    });
  });
  const boundedIndex = days.length ? Math.min(rawDayIndex, days.length - 1) : 0;
  return {
    path,
    startDate,
    today,
    dayNumber: boundedIndex + 1,
    totalDays: days.length,
    day: days[boundedIndex] || null,
    logKey: today
  };
}

function renderPracticeLab() {
  renderTodayPractice();
  renderChordMasteryMatrix();
}

function renderTodayPractice() {
  const info = getPracticeDayInfo();
  const day = info.day;
  if (el.practiceStartDateInput) {
    el.practiceStartDateInput.value = info.startDate || todayKey();
  }
  if (!day) return;
  const log = progress.dailyPracticeLog?.[info.logKey] || {};
  if (el.todayPracticeMeta) {
    el.todayPracticeMeta.textContent = `${info.path.title} • Day ${info.dayNumber}/${info.totalDays} • ${day.weekTitle}`;
  }
  if (el.todayPracticeTitle) el.todayPracticeTitle.textContent = day.title;
  if (el.todayPracticeFocus) {
    el.todayPracticeFocus.textContent = `${day.weekFocus} Suggested tempo: ${day.suggestedTempo || appState.tempoBpm} BPM.`;
  }
  if (el.todayPracticeExercises) {
    el.todayPracticeExercises.innerHTML = (day.exercises || [])
      .map((exercise) => `<li>${escapeHtml(exercise)}</li>`)
      .join("");
  }
  if (el.practiceMinutesInput) el.practiceMinutesInput.value = String(log.minutes || 20);
  if (el.practiceNotesInput) el.practiceNotesInput.value = log.notes || "";
  if (el.todayPracticeStatus) {
    el.todayPracticeStatus.textContent = log.done
      ? `Done today. ${log.minutes || 0} minutes logged.`
      : `Next action: open the ${labLabel(day.linkedLab)} lab, name the pattern, then play or click one clean rep.`;
  }
}

function labLabel(labId) {
  if (labId === "1564") return "1-5-6-4";
  if (labId === "vocabulary") return "Vocabulary";
  if (labId === "modulation") return "Modulation";
  return "Scale Notes to Chords";
}

function markTodayPracticeDone() {
  const info = getPracticeDayInfo();
  if (!info.day) return;
  const minutes = Math.max(0, Math.min(240, Number(el.practiceMinutesInput?.value || 0)));
  const notes = String(el.practiceNotesInput?.value || "").trim();
  progress.dailyPracticeLog[info.logKey] = {
    pathId: info.path.id,
    dayNumber: info.dayNumber,
    title: info.day.title,
    done: true,
    minutes,
    notes,
    completedAt: nowIsoString()
  };
  saveProgress();
  markSessionComplete({ quiet: true });
  emitFeelFeedback("complete", "Today's baby step complete.", { haptic: true });
  renderPracticeLab();
  renderProgress();
}

function getChordMasteryAverageForKey(key) {
  const scores = progress.chordMasteryScores?.[key] || {};
  const entered = CHORD_MASTERY_SKILLS
    .map((skill) => Number(scores[skill.id]))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (!entered.length) return 0;
  return entered.reduce((sum, value) => sum + value, 0) / entered.length;
}

function getChordMasterySummary() {
  const keyAverages = CHORD_MASTERY_KEYS.map((key) => ({
    key,
    average: getChordMasteryAverageForKey(key),
    weight: CHORD_MASTERY_KEY_WEIGHTS[key] || 1
  }));
  const entered = keyAverages.filter((entry) => entry.average > 0);
  const weightedScore = entered.length
    ? entered.reduce((sum, entry) => sum + entry.average * entry.weight, 0)
      / entered.reduce((sum, entry) => sum + entry.weight, 0)
    : 0;
  const strongest = [...entered].sort((a, b) => b.average - a.average)[0]?.key || "—";
  const weakest = [...keyAverages]
    .filter((entry) => entry.average < 8)
    .sort((a, b) => (a.average || -1) - (b.average || -1) || b.weight - a.weight)[0]?.key || "—";
  return { weightedScore, strongest, weakest };
}

function renderChordMasteryMatrix() {
  if (!el.chordMasteryMatrix) return;
  const summary = getChordMasterySummary();
  if (el.masteryWeightedScore) el.masteryWeightedScore.textContent = summary.weightedScore.toFixed(1);
  if (el.masteryStrongestKey) el.masteryStrongestKey.textContent = summary.strongest;
  if (el.masteryWeakestKey) el.masteryWeakestKey.textContent = summary.weakest;
  const header = `<tr><th>Key</th>${CHORD_MASTERY_SKILLS.map((skill) => `<th>${skill.label}</th>`).join("")}<th>Avg</th></tr>`;
  const rows = CHORD_MASTERY_KEYS.map((key) => {
    const scores = progress.chordMasteryScores?.[key] || {};
    const cells = CHORD_MASTERY_SKILLS.map((skill) => {
      const value = scores[skill.id];
      return `<td><input data-mastery-key="${key}" data-mastery-skill="${skill.id}" type="number" min="0" max="10" step="1" value="${Number.isFinite(Number(value)) ? Number(value) : ""}" aria-label="${key} ${skill.label}" /></td>`;
    }).join("");
    return `<tr><th>${key}</th>${cells}<td>${getChordMasteryAverageForKey(key).toFixed(1)}</td></tr>`;
  }).join("");
  el.chordMasteryMatrix.innerHTML = `<table><thead>${header}</thead><tbody>${rows}</tbody></table>`;
}

function updateChordMasteryScore(key, skillId, rawValue) {
  if (!CHORD_MASTERY_KEYS.includes(key) || !CHORD_MASTERY_SKILLS.some((skill) => skill.id === skillId)) return;
  const numeric = Number(rawValue);
  if (!progress.chordMasteryScores[key]) progress.chordMasteryScores[key] = {};
  if (!Number.isFinite(numeric) || rawValue === "") {
    delete progress.chordMasteryScores[key][skillId];
  } else {
    progress.chordMasteryScores[key][skillId] = Math.max(0, Math.min(10, Math.round(numeric)));
  }
  saveProgress();
  renderChordMasteryMatrix();
}

function renderExploreLabs() {
  renderStudyModeSwitch();
  renderPianoLabContext();
  renderNowStudyingPanel();
  renderLabMicroMissions();
  renderScaleChordLab();
  render1564Lab();
  renderVocabularyLab();
  renderModulationLab();
  renderSavedLabIdeas();
}

function getLabKey() {
  return el.keySelect?.value || appState.root || "C";
}

function getCurrentPaletteChordLabel() {
  const short = CHORDS[appState.quality]?.short || "";
  return `${appState.root}${short}`;
}

function renderPianoLabContext() {
  if (!el.pianoLabContext) return;
  const key = getLabKey();
  const paletteChord = getCurrentPaletteChordLabel();
  const progression = el.progressionSelect?.value || "I-vi-IV-V (Pop)";
  const modeLabel = progress.labLearningMode === "play" ? "Piano transfer" : "Computer study";
  const modeCopy = progress.labLearningMode === "play"
    ? "Hear it, see it, then take the same number idea to the keys."
    : "Name the numbers, compare the notes, and understand the pattern even without a piano.";
  el.pianoLabContext.innerHTML = `
    <div class="lab-context-copy">
      <span class="lab-context-kicker">Using current palette context</span>
      <strong>Key: ${escapeHtml(key)} Major</strong>
      <span>Selected chord: ${escapeHtml(paletteChord)}</span>
      <span>Progression lens: ${escapeHtml(progression)}</span>
      <span>${escapeHtml(modeLabel)}: ${escapeHtml(modeCopy)}</span>
    </div>
    <button id="jumpToChordPaletteBtn" class="btn-ghost" type="button">Show Chord Palette</button>
  `;
  const jumpBtn = el.pianoLabContext.querySelector("#jumpToChordPaletteBtn");
  jumpBtn?.addEventListener("click", () => {
    document.querySelector(".console")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function renderNowStudyingPanel() {
  if (!el.nowStudyingPanel) return;
  const type = currentStudyContext?.type || "chord";
  if (type === "progression") {
    el.nowStudyingPanel.innerHTML = renderProgressionStudyPanel(currentStudyContext.name || el.progressionSelect?.value);
    return;
  }
  if (type === "scale") {
    el.nowStudyingPanel.innerHTML = renderScaleStudyPanel(currentStudyContext);
    return;
  }
  el.nowStudyingPanel.innerHTML = renderChordStudyPanel(currentStudyContext);
}

function renderProgressionStudyPanel(name) {
  const context = getProgressionPaletteContext();
  const item = findProgressionPaletteItem(name) || findProgressionPaletteItem(el.progressionSelect?.value || "") || findProgressionPaletteItem("I-V-vi-IV (Anthem)");
  if (!item) {
    return `<p class="practice-meta">Choose a chord, progression, scale, or vocabulary sound above and this panel will explain it.</p>`;
  }
  const voicingMode = getProgressionVoicingMode();
  const chords = buildProgressionPaletteChords(context, item, voicingMode);
  const timing = getProgressionPaletteTiming(item, chords);
  return `
    <div class="now-study-head">
      <div>
        <p class="eyebrow">Now studying</p>
        <h3>${escapeHtml(item.name)} in ${escapeHtml(context.label)}</h3>
      </div>
      <span>${escapeHtml(progressionVoicingLabel(voicingMode))}</span>
    </div>
    <div class="now-study-token-row">
      ${chords.map((chord) => `<span>${escapeHtml(chord.degree)} ${escapeHtml(chord.symbol)}</span>`).join("")}
    </div>
    <div class="now-study-grid">
      <p><strong>What it means:</strong> ${escapeHtml(item.theory)}</p>
      <p><strong>Listen for:</strong> ${escapeHtml(item.listenFor)}</p>
      <p><strong>Move it:</strong> keep the numbers, change the key, and the chord names will update.</p>
    </div>
    ${renderProgressionSongExamples(item)}
  `;
}

function renderChordStudyPanel(context = {}) {
  const key = getLabKey();
  const root = context.root || appState.root || key;
  const quality = context.quality || appState.quality || "major";
  const symbol = chordSymbol(root, quality);
  const tones = buildChordMidi(root, quality, "root position", 3).map((midi) => NOTES[(midi % 12 + 12) % 12]);
  const diatonicMatch = diatonicTriadsForKey(key).find((chord) => chord.symbol === symbol);
  const location = diatonicMatch
    ? `${symbol} is the ${diatonicMatch.roman} chord in ${key} major.`
    : `${symbol} is a color chord against ${key} major, so listen for how it changes the mood.`;
  return `
    <div class="now-study-head">
      <div>
        <p class="eyebrow">Now studying</p>
        <h3>${escapeHtml(symbol)}</h3>
      </div>
      <span>${escapeHtml(CHORDS[quality]?.label || quality)}</span>
    </div>
    <div class="now-study-token-row">
      ${tones.map((tone) => `<span>${escapeHtml(tone)}</span>`).join("")}
    </div>
    <div class="now-study-grid">
      <p><strong>What it is:</strong> ${escapeHtml(symbol)} uses the chord tones ${tones.map(escapeHtml).join(", ")}.</p>
      <p><strong>Where it lives:</strong> ${escapeHtml(location)}</p>
      <p><strong>Try it:</strong> compare root position, 1st inversion, and 2nd inversion, then find the closest move into the next chord.</p>
    </div>
  `;
}

function renderScaleStudyPanel(context = {}) {
  const key = getLabKey();
  const row = getPaletteScaleRow(context.tab, context.rowId) || SCALES_PALETTE_ROWS[0];
  const intervals = row.intervals || getLabScaleIntervals(row.id);
  const notes = intervals.map((interval) => keyOffsetRoot(key, interval));
  const chords = diatonicTriadsForKey(key).slice(0, 7);
  return `
    <div class="now-study-head">
      <div>
        <p class="eyebrow">Now studying</p>
        <h3>${escapeHtml(key)} ${escapeHtml(row.name || "scale")}</h3>
      </div>
      <span>Scale color</span>
    </div>
    <div class="now-study-token-row">
      ${notes.map((note, idx) => `<span>${idx + 1}: ${escapeHtml(note)}</span>`).join("")}
    </div>
    <div class="now-study-grid">
      <p><strong>What it is:</strong> a note collection you can hear, compare, and turn into chord choices.</p>
      <p><strong>Chords from the key:</strong> ${chords.map((chord) => `${chord.roman} ${chord.symbol}`).join(", ")}.</p>
      <p><strong>Try it:</strong> play or click the scale, then land on I, IV, V, or vi to hear which notes feel stable.</p>
    </div>
  `;
}

function getPaletteScaleRow(tab, rowId) {
  const rowsByTab = {
    scales: SCALES_PALETTE_ROWS,
    modes: MODES_PALETTE_ROWS,
    pentatonic: PENTATONIC_PALETTE_ROWS,
    color: COLOR_PALETTE_ROWS
  };
  return (rowsByTab[tab] || []).find((row) => row.id === rowId);
}

function renderStudyModeSwitch() {
  if (!el.studyModeSwitch) return;
  const mode = progress.labLearningMode === "play" ? "play" : "study";
  el.studyModeSwitch.querySelectorAll("button[data-study-mode]").forEach((btn) => {
    const isActive = btn.dataset.studyMode === mode;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

function renderLabMicroMissions() {
  if (!el.labMicroMissions) return;
  const key = getLabKey();
  const chords = build1564LabChords(key, el.lab1564InversionSelect?.value || "root position");
  const firstChord = chords[0]?.symbol || key;
  const lastChord = chords[chords.length - 1]?.symbol || majorDegreeRoot(key, 4);
  const missions = progress.labLearningMode === "play"
    ? [
      { time: "30 sec", action: `Play or click ${firstChord}, then say "one" out loud.` },
      { time: "2 min", action: `Loop ${chords.map((chord) => chord.roman).join("-")} slowly and watch the keyboard highlights.` },
      { time: "5 min", action: `Move the same number idea to another key and save the result.` }
    ]
    : [
      { time: "30 sec", action: `Name the notes in ${key} major before pressing play.` },
      { time: "2 min", action: `Translate ${chords.map((chord) => chord.symbol).join(" -> ")} into numbers: ${chords.map((chord) => chord.roman).join(" -> ")}.` },
      { time: "5 min", action: `Explain why ${lastChord} feels different from ${firstChord}, then try a new key.` }
    ];
  el.labMicroMissions.innerHTML = missions.map((mission) => `
    <div class="micro-mission">
      <strong>${escapeHtml(mission.time)}</strong>
      <span>${escapeHtml(mission.action)}</span>
    </div>
  `).join("");
}

function resetToSafeLabStep() {
  progress.labLearningMode = "study";
  saveProgress();
  setMode("compose");
  renderExploreLabs();
  if (el.pianoLabContext) {
    el.pianoLabContext.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  if (el.chordDisplay) {
    const key = getLabKey();
    const chords = build1564LabChords(key, "root position");
    el.chordDisplay.textContent = `Reset point: ${key} major. Read the scale notes, name ${chords.map((chord) => chord.roman).join("-")}, then press Play when you want to hear it.`;
  }
}

function diatonicTriadsForKey(key) {
  return DEGREE_TO_SEMITONE.map((semi, idx) => {
    const root = NOTES[(NOTES.indexOf(key) + semi + 12) % 12];
    const quality = MAJOR_KEY_TRIAD_QUALITIES[idx];
    return { root, quality, roman: ROMAN[idx], symbol: chordSymbol(root, quality) };
  });
}

function renderScaleChordLab() {
  if (!el.scaleChordLab) return;
  const key = getLabKey();
  const notes = DEGREE_TO_SEMITONE.map((semi) => NOTES[(NOTES.indexOf(key) + semi + 12) % 12]);
  const chords = diatonicTriadsForKey(key);
  el.scaleChordLab.innerHTML = `
    <div class="lab-note-row">${notes.map((note, idx) => `<span>${idx + 1}: ${note}</span>`).join("")}</div>
    <div class="lab-note-row">${chords.map((chord) => `<span>${chord.roman}: ${chord.symbol}</span>`).join("")}</div>
    <p><strong>What it is:</strong> scale notes become chords when you stack every other note.</p>
    <p><strong>Study it:</strong> say the roman numerals first, then check the chord names.</p>
    <p><strong>Use it:</strong> move the same number pattern to any key when you want to transpose.</p>
  `;
}

function render1564Lab() {
  if (!el.lab1564Output) return;
  const key = getLabKey();
  const chords = build1564LabChords(key, el.lab1564InversionSelect?.value || "root position");
  el.lab1564Output.innerHTML = `
    <div>${escapeHtml(key)}: ${chords.map((chord) => `${escapeHtml(chord.roman)} ${escapeHtml(chord.symbol)}`).join(" -> ")}</div>
    <p><strong>What it is:</strong> a common song loop you can understand as numbers before you play it.</p>
    <p><strong>Study it:</strong> notice that the shape is still 1-5-6-4 even when the chord names change.</p>
    <p><strong>Play it now:</strong> use the button when you want to hear the loop or transfer it to piano.</p>
  `;
}

function build1564LabChords(key, inversion) {
  const degreeIndexes = [0, 4, 5, 3];
  return degreeIndexes.map((degreeIndex) => {
    const root = majorDegreeRoot(key, degreeIndex);
    const quality = MAJOR_KEY_TRIAD_QUALITIES[degreeIndex];
    return {
      roman: ROMAN[degreeIndex],
      root,
      quality,
      symbol: chordSymbol(root, quality),
      midi: buildChordMidi(root, quality, inversion, 3)
    };
  });
}

function labWait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function play1564Lab() {
  const ready = await ensureHarmonicPlaybackReady();
  if (!ready) return;
  const key = getLabKey();
  const inversion = el.lab1564InversionSelect?.value || "root position";
  const pattern = el.lab1564PatternSelect?.value || "blocks";
  const chords = pattern === "voice-led" ? buildVoiceLed1564Chords(key) : build1564LabChords(key, inversion);
  const hold = Math.max(0.35, getHarmonyBeatSeconds() * 1.8);
  for (const chord of chords) {
    if (pattern === "top-bottom-middle-top") {
      const sorted = [...chord.midi].sort((a, b) => a - b);
      const notes = [sorted[2], sorted[0], sorted[1], sorted[2]].filter(Number.isFinite);
      await playPatternScheduled({ notes: notes.map(midiToNoteName), showFingers: false, snapshot: true });
    } else {
      playMidiNotes(chord.midi, { hold, asChord: true, restrictToWindow: false });
    }
    await labWait(Math.max(320, hold * 650));
  }
  trackRep("progressions", `1-5-6-4 ${key}`);
}

function buildVoiceLed1564Chords(key) {
  const rootChords = build1564LabChords(key, "root position");
  let previous = null;
  return rootChords.map((chord) => {
    const options = ["root position", "1st inversion", "2nd inversion"].map((inv) => ({
      ...chord,
      midi: buildChordMidi(chord.root, chord.quality, inv, 3)
    }));
    const best = !previous ? options[0] : options.sort((a, b) => voiceLeadDistance(previous, a.midi) - voiceLeadDistance(previous, b.midi))[0];
    previous = best.midi;
    return best;
  });
}

function voiceLeadDistance(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return 999;
  return b.reduce((sum, note, idx) => sum + Math.abs(note - (a[idx] || note)), 0);
}

function renderVocabularyLab() {
  if (!el.vocabularyLab) return;
  el.vocabularyLab.innerHTML = VOCABULARY_LAB_ROWS.map((row) => `
    <button type="button" class="vocab-lab-row" data-vocab-id="${row.id}">
      <strong>${row.label}</strong><span>${row.note}</span>
      <small>${row.type === "scale" ? "Study sound color, then try it over a chord." : "Study the movement, then listen for the pull."}</small>
    </button>
  `).join("");
}

async function playVocabularyLabRow(rowId) {
  const row = VOCABULARY_LAB_ROWS.find((entry) => entry.id === rowId);
  if (!row) return;
  const key = getLabKey();
  if (row.type === "scale") {
    const root = row.degree === 1 ? majorDegreeRoot(key, 1) : row.degree === 4 ? majorDegreeRoot(key, 4) : key;
    const patternKey = row.scale || "major";
    const intervals = row.intervals || getLabScaleIntervals(patternKey);
    const notes = buildAscendingScaleMidiFromIntervals(root, intervals, 3, true).map(midiToNoteName);
    await playPatternScheduled({ notes, showFingers: false, snapshot: true });
    trackRep("scales", row.label);
    return;
  }
  const offsets = row.offsets || row.steps?.map((degreeIndex) => DEGREE_TO_SEMITONE[degreeIndex]) || [0];
  const hold = Math.max(0.35, getHarmonyBeatSeconds() * 1.7);
  for (let idx = 0; idx < offsets.length; idx += 1) {
    const root = keyOffsetRoot(key, offsets[idx]);
    const quality = row.qualities[idx] || "major";
    playMidiNotes(buildChordMidi(root, quality, "root position", 3), { hold, asChord: true, restrictToWindow: false });
    await labWait(Math.max(320, hold * 700));
  }
  trackRep("chords", row.label);
}

function getLabScaleIntervals(patternKey) {
  const allRows = [...SCALES_PALETTE_ROWS, ...MODES_PALETTE_ROWS, ...PENTATONIC_PALETTE_ROWS, ...COLOR_PALETTE_ROWS];
  const found = allRows.find((row) => row.id === patternKey);
  return found?.intervals || SCALE_PATTERN_LIBRARY[resolveScalePatternKey(patternKey)]?.intervals || SCALE_PATTERN_LIBRARY.major.intervals;
}

function renderModulationLab() {
  if (!el.modulationLabOutput) return;
  const fromKey = el.modFromKeySelect?.value || "C";
  const toKey = el.modToKeySelect?.value || "F";
  const path = el.modPathSelect?.value || "dominant";
  const labels = buildModulationSteps(fromKey, toKey, path).map((step) => step.symbol);
  el.modulationLabOutput.innerHTML = `
    <div>${escapeHtml(fromKey)} to ${escapeHtml(toKey)}: ${labels.map(escapeHtml).join(" -> ")}</div>
    <p><strong>What it is:</strong> a way to make one key feel like it naturally becomes another key.</p>
    <p><strong>Study it:</strong> identify the setup chord, then name the new home key.</p>
    <p><strong>Use it:</strong> move an idea by numbers instead of memorizing one fixed set of chord names.</p>
  `;
}

function buildModulationSteps(fromKey, toKey, path) {
  const targetV = keyOffsetRoot(toKey, 7);
  if (path === "pivot") {
    return [
      { root: fromKey, quality: "major", symbol: chordSymbol(fromKey, "major") },
      { root: majorDegreeRoot(fromKey, 5), quality: "minor", symbol: chordSymbol(majorDegreeRoot(fromKey, 5), "minor") },
      { root: targetV, quality: "dom7", symbol: chordSymbol(targetV, "dom7") },
      { root: toKey, quality: "major", symbol: chordSymbol(toKey, "major") }
    ];
  }
  if (path === "circle") {
    return [
      { root: fromKey, quality: "major", symbol: chordSymbol(fromKey, "major") },
      { root: keyOffsetRoot(fromKey, 7), quality: "dom7", symbol: chordSymbol(keyOffsetRoot(fromKey, 7), "dom7") },
      { root: targetV, quality: "dom7", symbol: chordSymbol(targetV, "dom7") },
      { root: toKey, quality: "major", symbol: chordSymbol(toKey, "major") }
    ];
  }
  if (path === "chromatic") {
    const passing = keyOffsetRoot(toKey, 11);
    return [
      { root: fromKey, quality: "major", symbol: chordSymbol(fromKey, "major") },
      { root: passing, quality: "diminished", symbol: chordSymbol(passing, "diminished") },
      { root: targetV, quality: "dom7", symbol: chordSymbol(targetV, "dom7") },
      { root: toKey, quality: "major", symbol: chordSymbol(toKey, "major") }
    ];
  }
  return [
    { root: fromKey, quality: "major", symbol: chordSymbol(fromKey, "major") },
    { root: targetV, quality: "dom7", symbol: chordSymbol(targetV, "dom7") },
    { root: toKey, quality: "major", symbol: chordSymbol(toKey, "major") }
  ];
}

async function playModulationLab() {
  const ready = await ensureHarmonicPlaybackReady();
  if (!ready) return;
  const fromKey = el.modFromKeySelect?.value || "C";
  const toKey = el.modToKeySelect?.value || "F";
  const path = el.modPathSelect?.value || "dominant";
  const hold = Math.max(0.35, getHarmonyBeatSeconds() * 1.8);
  for (const step of buildModulationSteps(fromKey, toKey, path)) {
    playMidiNotes(buildChordMidi(step.root, step.quality, "root position", 3), { hold, asChord: true, restrictToWindow: false });
    await labWait(Math.max(340, hold * 720));
  }
  trackRep("progressions", `modulation ${fromKey}-${toKey}`);
}

function saveCurrentLabIdea() {
  const key = getLabKey();
  const idea = {
    id: `lab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    title: `${key} ${progress.labLearningMode === "play" ? "play" : "study"} idea`,
    key,
    learningMode: progress.labLearningMode === "play" ? "play" : "study",
    createdAt: nowIsoString(),
    summary: [
      el.lab1564Output?.textContent || "",
      el.modulationLabOutput?.textContent || ""
    ].filter(Boolean).join(" | ")
  };
  progress.savedLabIdeas.unshift(idea);
  progress.savedLabIdeas = progress.savedLabIdeas.slice(0, 24);
  saveProgress();
  renderSavedLabIdeas();
  emitFeelFeedback("save", "Saved to your idea tray.", { haptic: true });
}

function renderSavedLabIdeas() {
  if (!el.savedLabIdeas) return;
  const ideas = Array.isArray(progress.savedLabIdeas) ? progress.savedLabIdeas : [];
  if (!ideas.length) {
    el.savedLabIdeas.innerHTML = `<p class="practice-meta">Saved ideas will appear here.</p>`;
    return;
  }
  el.savedLabIdeas.innerHTML = `<h3>Saved Lab Ideas</h3>${ideas.map((idea) => `
    <div class="saved-lab-idea">
      <strong>${escapeHtml(idea.title)}</strong>
      <span>${escapeHtml(idea.summary || "")}</span>
    </div>
  `).join("")}`;
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

function nowIsoString() {
  return new Date().toISOString();
}

function createCoachMessage(role, content, extras = {}) {
  const artifacts = normalizeCoachArtifacts(extras.artifacts || extras.artifact || null);
  return {
    id: extras.id || `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content: String(content || ""),
    createdAt: extras.createdAt || nowIsoString(),
    mode: extras.mode || "",
    warning: extras.warning || "",
    artifact: artifacts[0] || null,
    artifacts,
    pending: Boolean(extras.pending)
  };
}

function defaultCoachThreadTitle(index = 0) {
  return `Conversation ${index + 1}`;
}

function trimThreadTitleFromQuestion(question) {
  const raw = String(question || "").replace(/\s+/g, " ").trim();
  if (!raw) return "";
  return raw.length > 56 ? `${raw.slice(0, 56)}...` : raw;
}

function loadCoachThreads() {
  try {
    const raw = safeStorageGet(COACH_THREADS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((thread) => {
        const id = String(thread?.id || "").trim();
        const title = String(thread?.title || "").trim();
        const messages = Array.isArray(thread?.messages)
          ? thread.messages
            .map((msg) => {
              const role = msg?.role === "assistant" ? "assistant" : msg?.role === "user" ? "user" : "";
              const content = String(msg?.content || "");
              if (!role || !content.trim()) return null;
              return createCoachMessage(role, content, {
                id: String(msg?.id || "").trim() || undefined,
                createdAt: String(msg?.createdAt || "").trim() || undefined,
                mode: String(msg?.mode || "").trim(),
                warning: String(msg?.warning || "").trim(),
                artifact: msg?.artifact || null,
                artifacts: msg?.artifacts || msg?.artifact || null,
                pending: false
              });
            })
            .filter(Boolean)
          : [];
        if (!id) return null;
        return {
          id,
          title: title || defaultCoachThreadTitle(0),
          createdAt: String(thread?.createdAt || "").trim() || nowIsoString(),
          updatedAt: String(thread?.updatedAt || "").trim() || nowIsoString(),
          messages
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function saveCoachThreads() {
  const serializable = coachState.threads.map((thread) => ({
    id: thread.id,
    title: thread.title,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    messages: (Array.isArray(thread.messages) ? thread.messages : []).map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
      mode: msg.mode || "",
      warning: msg.warning || "",
      artifact: msg.artifact || null,
      artifacts: msg.artifacts || (msg.artifact ? [msg.artifact] : [])
    }))
  }));
  safeStorageSet(COACH_THREADS_STORAGE_KEY, JSON.stringify(serializable));
}

function loadCoachLessonStack() {
  try {
    const raw = safeStorageGet(COACH_LESSON_STACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => normalizeCoachLessonStackEntry(entry))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function saveCoachLessonStack() {
  safeStorageSet(COACH_LESSON_STACK_STORAGE_KEY, JSON.stringify(coachState.lessonStack));
}

function normalizeCoachLessonStackEntry(entry) {
  const normalizedArtifact = normalizeCoachArtifact(entry?.artifact || null);
  const id = String(entry?.id || normalizedArtifact?.id || "").trim();
  if (!id || !normalizedArtifact) return null;
  const savedAt = String(entry?.savedAt || "").trim() || nowIsoString();
  return {
    id,
    title: String(entry?.title || normalizedArtifact.title || "Lesson").trim() || "Lesson",
    type: String(entry?.type || normalizedArtifact.type || "artifact").trim() || "artifact",
    savedAt,
    lastOpenedAt: String(entry?.lastOpenedAt || "").trim(),
    trackId: String(entry?.trackId || "").trim(),
    lessonId: String(entry?.lessonId || "").trim(),
    completedAt: String(entry?.completedAt || "").trim(),
    artifact: normalizedArtifact
  };
}

function formatCoachDateTime(iso) {
  const value = String(iso || "").trim();
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function getCoachStackEntryStatus(entry) {
  const lessonId = String(entry?.lessonId || "").trim();
  const isCompleted = Boolean(lessonId && progress.theoryCompletedLessons?.[lessonId]);
  const runStats = lessonId ? getTheoryLessonRunStats(lessonId, false) : null;
  const activity = Number(runStats?.starts || 0) + Number(runStats?.examplePlays || 0) + Number(runStats?.attempts || 0);

  if (isCompleted) {
    const completedAt = formatCoachDateTime(entry?.completedAt || "");
    return {
      label: "Completed",
      className: "is-complete",
      detail: completedAt ? `Completed ${completedAt}` : "Completed"
    };
  }
  if (activity > 0) {
    return {
      label: "In Progress",
      className: "",
      detail: `${runStats.attempts || 0} attempts`
    };
  }
  return {
    label: "Saved",
    className: "",
    detail: formatCoachDateTime(entry?.savedAt || "") ? `Saved ${formatCoachDateTime(entry.savedAt)}` : "Saved"
  };
}

function renderCoachKanban() {
  if (!el.kanbanTodo || !el.kanbanActive || !el.kanbanDone) return;
  el.kanbanTodo.innerHTML = "";
  el.kanbanActive.innerHTML = "";
  el.kanbanDone.innerHTML = "";

  const stack = Array.isArray(coachState.lessonStack) ? coachState.lessonStack : [];
  if (!stack.length) {
    const empty = document.createElement("div");
    empty.className = "kanban-empty";
    empty.textContent = "No lessons yet";
    el.kanbanTodo.appendChild(empty);
    return;
  }

  stack.forEach((entry) => {
    const normalized = normalizeCoachLessonStackEntry(entry);
    if (!normalized) return;
    const status = getCoachStackEntryStatus(normalized);

    const card = document.createElement("div");
    card.className = "kanban-card";
    card.dataset.stackId = normalized.id;

    const titleEl = document.createElement("div");
    titleEl.className = "kanban-card-title";
    titleEl.textContent = normalized.title;
    card.appendChild(titleEl);

    const metaRow = document.createElement("div");
    metaRow.className = "kanban-card-meta";

    const badge = document.createElement("span");
    const badgeType = (normalized.type || "lesson").toLowerCase();
    badge.className = `kanban-card-badge ${badgeType.includes("quiz") ? "quiz" : badgeType.includes("drill") ? "drill" : "lesson"}`;
    badge.textContent = normalized.type || "Lesson";
    metaRow.appendChild(badge);

    const dateEl = document.createElement("span");
    dateEl.className = "kanban-card-date";
    dateEl.textContent = formatCoachDateTime(normalized.createdAt || normalized.savedAt);
    metaRow.appendChild(dateEl);
    card.appendChild(metaRow);

    const actions = document.createElement("div");
    actions.className = "kanban-card-actions";

    const continueBtn = document.createElement("button");
    continueBtn.type = "button";
    continueBtn.textContent = "Continue";
    continueBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      continueCoachLessonFromStack(normalized.id);
    });
    actions.appendChild(continueBtn);

    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.textContent = "▶ Play";
    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      void playCoachArtifact(normalized.artifact);
    });
    actions.appendChild(playBtn);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeCoachLessonStackEntry(normalized.id);
    });
    actions.appendChild(removeBtn);

    card.appendChild(actions);

    // Distribute into lanes based on status
    if (status.className === "is-complete") {
      el.kanbanDone.appendChild(card);
    } else if (normalized.attempts > 0 || status.label?.toLowerCase().includes("progress")) {
      el.kanbanActive.appendChild(card);
    } else {
      el.kanbanTodo.appendChild(card);
    }
  });

  // Add empty placeholders for empty lanes
  [el.kanbanTodo, el.kanbanActive, el.kanbanDone].forEach((lane) => {
    if (!lane.children.length) {
      const empty = document.createElement("div");
      empty.className = "kanban-empty";
      empty.textContent = "—";
      lane.appendChild(empty);
    }
  });
}

function createCoachThread(initialTitle = "") {
  const thread = {
    id: `thread-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title: initialTitle || defaultCoachThreadTitle(coachState.threads.length),
    createdAt: nowIsoString(),
    updatedAt: nowIsoString(),
    messages: []
  };
  coachState.threads.unshift(thread);
  coachState.activeThreadId = thread.id;
  saveCoachThreads();
  return thread;
}

function getActiveCoachThread() {
  const found = coachState.threads.find((thread) => thread.id === coachState.activeThreadId);
  if (found) return found;
  return createCoachThread();
}

function initializeCoachThreads() {
  coachState.lessonStack = loadCoachLessonStack();
  coachState.threads = loadCoachThreads();
  if (!coachState.threads.length) {
    createCoachThread("Conversation 1");
  } else if (!coachState.activeThreadId || !coachState.threads.some((thread) => thread.id === coachState.activeThreadId)) {
    coachState.activeThreadId = coachState.threads[0].id;
  }
  renderCoachThreadPills();
  renderCoachMessages();
  renderCoachKanban();
}

function renderCoachThreadPills() {
  if (!el.coachThreadPills) return;
  el.coachThreadPills.innerHTML = "";
  coachState.threads.forEach((thread) => {
    const pill = document.createElement("button");
    pill.className = `coach-thread-pill${thread.id === coachState.activeThreadId ? " is-active" : ""}`;
    pill.dataset.threadId = thread.id;
    pill.textContent = thread.title || defaultCoachThreadTitle(0);
    pill.role = "tab";
    pill.setAttribute("aria-selected", thread.id === coachState.activeThreadId ? "true" : "false");
    el.coachThreadPills.appendChild(pill);
  });
}

function formatCoachTimestamp(iso) {
  const value = String(iso || "").trim();
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/* ═══════════════════════════════════════════
 * DEEP LINKS — [[label|route]] wiki-link parser
 * Converts [[Major Scales|scales:major]] to clickable anchors
 * ═══════════════════════════════════════════ */

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function parseCoachDeepLinks(content) {
  if (!content) return "";
  const escaped = escapeHtml(content);
  return escaped.replace(
    /\[\[([^\]|]+)\|([^\]]+)\]\]/g,
    (_, label, route) => {
      const safeLabel = label.trim();
      const safeRoute = route.trim();
      return `<a class="coach-deep-link" href="#" data-route="${safeRoute}" title="Go to ${safeLabel}">${safeLabel}</a>`;
    }
  );
}

function navigateToLesson(lessonId) {
  if (!lessonId) return;
  const lesson = typeof getLessonById === "function" ? getLessonById(lessonId) : null;
  if (lesson && typeof switchMode === "function") {
    switchMode("theory");
    if (typeof highlightLesson === "function") highlightLesson(lessonId);
  } else {
    // Lesson not found in curriculum — log but do NOT force a mode switch.
    console.log(`[DeepLink] Route "${lessonId}" not found in curriculum — ignoring navigation.`);
  }
}

function renderCoachMessages() {
  if (!el.coachMessages) return;
  const thread = getActiveCoachThread();
  el.coachMessages.innerHTML = "";
  if (!thread.messages.length) {
    const placeholder = document.createElement("div");
    placeholder.className = "coach-message assistant";
    placeholder.textContent = "What makes V want to resolve to I? Which chord feels like home in this key? How would Dorian sound different from natural minor?";
    el.coachMessages.appendChild(placeholder);
    return;
  }

  thread.messages.forEach((msg) => {
    const bubble = document.createElement("div");
    bubble.className = `coach-message ${msg.role}`;
    bubble.dataset.msgId = msg.id;

    const text = document.createElement("div");
    text.className = "coach-message-text";
    text.innerHTML = parseCoachDeepLinks(msg.content || "");
    bubble.appendChild(text);

    if (msg.role === "assistant") {
      const artifacts = normalizeCoachArtifacts(msg.artifacts || msg.artifact || null);
      artifacts.forEach(a => {
        const rendered = buildCoachArtifactCardElement(a);
        if (rendered) bubble.appendChild(rendered);
      });
    }

    const meta = document.createElement("span");
    meta.className = "coach-message-meta";
    const modeLabel = msg.mode ? ` • ${formatCoachMode(msg.mode)}` : "";
    const pending = msg.pending ? " • typing..." : "";
    meta.textContent = `${formatCoachTimestamp(msg.createdAt)}${modeLabel}${pending}`.trim();
    bubble.appendChild(meta);

    el.coachMessages.appendChild(bubble);
  });

  el.coachMessages.scrollTop = el.coachMessages.scrollHeight;
}

function pushCoachMessage(thread, msg) {
  if (!thread || !msg) return;
  thread.messages.push(msg);
  thread.updatedAt = nowIsoString();
  if (thread.messages.length > 60) {
    thread.messages = thread.messages.slice(-60);
  }
}

function updatePendingAssistantMessage(thread, messageId, patch = {}) {
  if (!thread || !messageId) return;
  const msg = thread.messages.find((entry) => entry.id === messageId);
  if (!msg) return;
  if (Object.prototype.hasOwnProperty.call(patch, "content")) {
    msg.content = String(patch.content || "");
  }
  if (Object.prototype.hasOwnProperty.call(patch, "mode")) {
    msg.mode = patch.mode || "";
  }
  if (Object.prototype.hasOwnProperty.call(patch, "warning")) {
    msg.warning = patch.warning || "";
  }
  if (Object.prototype.hasOwnProperty.call(patch, "artifact")) {
    msg.artifact = normalizeCoachArtifact(patch.artifact || null);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "artifacts")) {
    msg.artifacts = normalizeCoachArtifacts(patch.artifacts || []);
    msg.artifact = msg.artifacts[0] || msg.artifact || null;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "pending")) {
    msg.pending = Boolean(patch.pending);
  }
}

/* ═══════════════════════════════════════════
 * GENERATIVE UI — Artifact Type System
 * 7 types: chord_sequence, lesson_card, playable_score,
 *          kanban_task, theory_concept, quiz_challenge, practice_drill
 * ═══════════════════════════════════════════ */

const ARTIFACT_NORMALIZERS = {
  chord_sequence: normalizeChordSequenceArtifact,
  lesson_card: normalizeLessonCardArtifact,
  playable_score: normalizePlayableScoreArtifact,
  kanban_task: normalizeKanbanTaskArtifact,
  theory_concept: normalizeTheoryConceptArtifact,
  quiz_challenge: normalizeQuizChallengeArtifact,
  practice_drill: normalizePracticeDrillArtifact,
};

const ARTIFACT_RENDERERS = {
  chord_sequence: renderArtifactChordSequence,
  lesson_card: renderArtifactLessonCard,
  playable_score: renderArtifactPlayableScore,
  kanban_task: renderArtifactKanbanTask,
  theory_concept: renderArtifactTheoryConcept,
  quiz_challenge: renderArtifactQuizChallenge,
  practice_drill: renderArtifactPracticeDrill,
};

const COACH_ARTIFACT_MAX_ITEMS = 3;
const COACH_ARTIFACT_MAX_TEXT = 240;
const COACH_ARTIFACT_MAX_LONG_TEXT = 900;
const COACH_ARTIFACT_MAX_SCORE_CHARS = 4000;
const COACH_ARTIFACT_ALLOWED_TYPES = new Set(Object.keys(ARTIFACT_NORMALIZERS));

function cleanCoachArtifactText(value, maxLength = COACH_ARTIFACT_MAX_TEXT) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function cleanCoachArtifactBlockText(value, maxLength = COACH_ARTIFACT_MAX_LONG_TEXT) {
  const text = String(value || "").replace(/\r\n/g, "\n").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function clampCoachArtifactNumber(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function createCoachArtifactId(rawId, type) {
  const raw = String(rawId || "").trim();
  const base = raw || `${type || "artifact"}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  return base
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    || `artifact-${Date.now().toString(36)}`;
}

function createCoachArtifactDomId(prefix, artifact) {
  return `${prefix}-${createCoachArtifactId(artifact?.id, artifact?.type)}`;
}

/** Dispatch normalizer. Also handles legacy artifacts without explicit type. */
function normalizeCoachArtifact(artifact) {
  if (!artifact || typeof artifact !== "object") return null;
  let type = String(artifact.type || "").trim().toLowerCase();
  // Legacy: if no type but has sequence, assume chord_sequence
  if (!type && Array.isArray(artifact.sequence) && artifact.sequence.length) {
    type = "chord_sequence";
  }
  if (!COACH_ARTIFACT_ALLOWED_TYPES.has(type)) return null;
  const normalizer = ARTIFACT_NORMALIZERS[type];
  if (!normalizer) return null;
  return normalizer(artifact);
}

/** Normalize an array of artifacts from the server response */
function normalizeCoachArtifacts(raw) {
  if (!raw) return [];
  const items = Array.isArray(raw) ? raw : [raw];
  return items
    .slice(0, COACH_ARTIFACT_MAX_ITEMS)
    .map(normalizeCoachArtifact)
    .filter(Boolean);
}

/* ── Chord Sequence (original type) ── */
function normalizeChordSequenceArtifact(artifact) {
  const title = cleanCoachArtifactText(artifact.title);
  const type = String(artifact.type || "chord_sequence").trim();
  const key = cleanCoachArtifactText(artifact.key || el.keySelect?.value || appState.root, 16);
  const bpm = clampCoachArtifactNumber(artifact.bpm, appState.tempoBpm, 30, 240);
  const policyMode = String(artifact?.playbackPolicy?.mode || "fixed_sequence").trim();
  const normalizedType = type.toLowerCase();
  const supportsCircularSweep = /(row|palette|sweep|loop)/.test(normalizedType) && !normalizedType.includes("cadence");
  const useCircularPolicy = policyMode === "circular_row_sweep" && supportsCircularSweep;
  const sequence = Array.isArray(artifact.sequence)
    ? artifact.sequence
      .slice(0, 16)
      .map((step) => {
        const root = cleanCoachArtifactText(step?.root, 12);
        const quality = cleanCoachArtifactText(step?.quality, 24);
        const chord = cleanCoachArtifactText(step?.chord, 32);
        const beats = clampCoachArtifactNumber(step?.beats, 2, 1, 8);
        if (!root || !quality) return null;
        return { root, quality, chord: chord || `${root}${quality}`, beats };
      })
      .filter(Boolean)
    : [];
  if (!title || !sequence.length) return null;
  return {
    id: createCoachArtifactId(artifact.id, "chord_sequence"),
    title, type: "chord_sequence", key, bpm,
    playbackPolicy: {
      mode: useCircularPolicy ? "circular_row_sweep" : "fixed_sequence",
      circularResolve: useCircularPolicy,
      finalConfetti: useCircularPolicy
    },
    sequence,
    quiz: {
      prompt: cleanCoachArtifactText(artifact?.quiz?.prompt) || `Play ${title} in another key.`,
      conceptId: cleanCoachArtifactText(artifact?.quiz?.conceptId, 80) || "core-harmony"
    },
    actions: ["play", "try", "save_to_stack", "open_full_lesson"]
  };
}

/* ── Lesson Card ── */
function normalizeLessonCardArtifact(artifact) {
  const lessonId = cleanCoachArtifactText(artifact.lessonId, 100);
  const title = cleanCoachArtifactText(artifact.title);
  if (!title && !lessonId) return null;
  const lesson = lessonId && typeof getLessonById === "function" ? getLessonById(lessonId) : null;
  return {
    id: createCoachArtifactId(artifact.id, "lesson_card"),
    type: "lesson_card",
    lessonId,
    title: title || (lesson?.title) || "Lesson",
    tier: clampCoachArtifactNumber(artifact.tier, lesson?.tier || 1, 1, 4),
    desc: cleanCoachArtifactText(artifact.description || artifact.desc || lesson?.desc || ""),
    category: cleanCoachArtifactText(lessonId.split(":")[0] || "", 40),
    tags: lesson?.tags || [],
    actions: ["go_to_lesson", "add_to_kanban"]
  };
}

/* ── Playable Score ── */
function normalizePlayableScoreArtifact(artifact) {
  const abc = cleanCoachArtifactBlockText(artifact.abc, COACH_ARTIFACT_MAX_SCORE_CHARS);
  const title = cleanCoachArtifactText(artifact.title || "Score");
  if (!abc) return null;
  return {
    id: createCoachArtifactId(artifact.id, "playable_score"),
    type: "playable_score",
    title,
    abc,
    key: cleanCoachArtifactText(artifact.key || "C", 16),
    bpm: clampCoachArtifactNumber(artifact.bpm, 120, 30, 240),
    actions: ["play", "loop", "speed"]
  };
}

/* ── Kanban Task ── */
function normalizeKanbanTaskArtifact(artifact) {
  const title = cleanCoachArtifactText(artifact.title);
  if (!title) return null;
  const validLanes = ["todo", "in-progress", "done"];
  const lane = validLanes.includes(artifact.lane) ? artifact.lane : "todo";
  return {
    id: createCoachArtifactId(artifact.id, "kanban_task"),
    type: "kanban_task",
    title,
    lane,
    desc: cleanCoachArtifactText(artifact.description || artifact.desc || ""),
    lessonId: cleanCoachArtifactText(artifact.lessonId, 100) || null,
    actions: ["add_to_board", "dismiss"]
  };
}

/* ── Theory Concept ── */
function normalizeTheoryConceptArtifact(artifact) {
  const title = cleanCoachArtifactText(artifact.title);
  if (!title) return null;
  const facts = Array.isArray(artifact.facts)
    ? artifact.facts.slice(0, 6).map(f => cleanCoachArtifactText(f)).filter(Boolean)
    : [];
  const relatedLessons = Array.isArray(artifact.relatedLessons)
    ? artifact.relatedLessons.slice(0, 6).map(id => cleanCoachArtifactText(id, 100)).filter(Boolean)
    : [];
  return {
    id: createCoachArtifactId(artifact.id, "theory_concept"),
    type: "theory_concept",
    title,
    facts,
    relatedLessons,
    actions: ["explore", "related_lessons"]
  };
}

/* ── Quiz Challenge ── */
function normalizeQuizChallengeArtifact(artifact) {
  const question = cleanCoachArtifactText(artifact.question);
  const options = Array.isArray(artifact.options)
    ? artifact.options.slice(0, 6).map(o => cleanCoachArtifactText(o)).filter(Boolean)
    : [];
  const correctIndex = Number(artifact.correctIndex);
  if (!question || options.length < 2 || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) return null;
  return {
    id: createCoachArtifactId(artifact.id, "quiz_challenge"),
    type: "quiz_challenge",
    question,
    options,
    correctIndex,
    explanation: cleanCoachArtifactText(artifact.explanation),
    actions: ["answer", "skip"]
  };
}

/* ── Practice Drill ── */
function normalizePracticeDrillArtifact(artifact) {
  const title = cleanCoachArtifactText(artifact.title);
  const instructions = cleanCoachArtifactText(artifact.instructions, COACH_ARTIFACT_MAX_LONG_TEXT);
  if (!title || !instructions) return null;
  return {
    id: createCoachArtifactId(artifact.id, "practice_drill"),
    type: "practice_drill",
    title,
    instructions,
    durationSec: clampCoachArtifactNumber(artifact.durationSec, 60, 10, 600),
    lessonId: cleanCoachArtifactText(artifact.lessonId, 100) || null,
    actions: ["start", "skip"]
  };
}

/* ═══════════════════════════════════════════
 * GENERATIVE UI — Artifact Renderers
 * Each returns a DOM element for a chat bubble
 * ═══════════════════════════════════════════ */

/** Create a styled action button */
function createArtifactAction(label, icon, className, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `coach-artifact-action ${className}`;
  setArtifactActionLabel(btn, icon, label);
  btn.addEventListener("click", onClick);
  return btn;
}

function setArtifactActionLabel(btn, icon, label) {
  if (!btn) return;
  btn.textContent = "";
  if (icon) {
    const iconSpan = document.createElement("span");
    iconSpan.className = "artifact-action-icon";
    iconSpan.setAttribute("aria-hidden", "true");
    iconSpan.textContent = icon;
    btn.appendChild(iconSpan);
  }
  btn.append(document.createTextNode(label));
}

/* ── Chord Sequence Renderer (existing, refactored) ── */
function renderArtifactChordSequence(artifact) {
  // Delegate to existing builder which handles Play/Try/Save/Open
  return buildCoachArtifactCardFromChordSequence(artifact);
}

/* ── Lesson Card Renderer ── */
function renderArtifactLessonCard(artifact) {
  const card = document.createElement("div");
  card.className = "coach-artifact-card coach-artifact-lesson";
  card.dataset.artifactType = "lesson_card";

  const tierColors = { 1: "#4ade80", 2: "#facc15", 3: "#fb923c", 4: "#f87171" };
  const tierNames = { 1: "Foundations", 2: "Building", 3: "Stretch", 4: "Challenge" };

  const header = document.createElement("div");
  header.className = "coach-artifact-header";
  const badge = document.createElement("span");
  badge.className = "artifact-tier-badge";
  badge.style.background = tierColors[artifact.tier] || "#94a3b8";
  badge.textContent = tierNames[artifact.tier] || "?";
  header.appendChild(badge);
  const categoryLabel = document.createElement("span");
  categoryLabel.className = "artifact-category";
  categoryLabel.textContent = artifact.category || "";
  header.appendChild(categoryLabel);
  card.appendChild(header);

  const title = document.createElement("div");
  title.className = "coach-artifact-title";
  title.textContent = artifact.title;
  card.appendChild(title);

  if (artifact.desc) {
    const desc = document.createElement("div");
    desc.className = "coach-artifact-summary";
    desc.textContent = artifact.desc;
    card.appendChild(desc);
  }

  const actions = document.createElement("div");
  actions.className = "coach-artifact-actions";
  if (artifact.lessonId) {
    actions.appendChild(createArtifactAction("Go to Lesson", "📖", "action-primary", () => {
      navigateToLesson(artifact.lessonId);
    }));
  }
  actions.appendChild(createArtifactAction("Add to Board", "📋", "action-secondary", () => {
    addCoachKanbanCardFromArtifact(artifact);
  }));
  card.appendChild(actions);
  return card;
}

/* ── Playable Score Renderer ── */
function renderArtifactPlayableScore(artifact) {
  const card = document.createElement("div");
  card.className = "coach-artifact-card coach-artifact-score";
  card.dataset.artifactType = "playable_score";

  const title = document.createElement("div");
  title.className = "coach-artifact-title";
  title.textContent = `🎵 ${artifact.title}`;
  card.appendChild(title);

  const notation = document.createElement("div");
  notation.className = "artifact-notation-container";
  notation.id = createCoachArtifactDomId("notation", artifact);
  card.appendChild(notation);

  requestAnimationFrame(() => {
    void renderArtifactScoreNotation(artifact, notation);
  });

  const meta = document.createElement("div");
  meta.className = "coach-artifact-summary";
  meta.textContent = `Key: ${artifact.key} • ${artifact.bpm} BPM`;
  card.appendChild(meta);

  const actions = document.createElement("div");
  actions.className = "coach-artifact-actions";
  let isPlaying = false;
  let synthControl = null;

  actions.appendChild(createArtifactAction("Play", "▶", "action-primary", async (e) => {
    if (isPlaying) {
      stopArtifactScoreSynth(synthControl);
      isPlaying = false;
      setArtifactActionLabel(e.currentTarget, "▶", "Play");
      return;
    }
    try {
      await ensureArtifactAbcjs();
      if (!window.ABCJS?.synth?.supportsAudio?.()) {
        e.currentTarget.disabled = true;
        setArtifactActionLabel(e.currentTarget, "▶", "Score only");
        return;
      }
      const visualObj = window.ABCJS.renderAbc(notation.id, artifact.abc, {
        responsive: "resize",
        staffwidth: 300,
        paddingtop: 0,
        paddingbottom: 0
      });
      if (!visualObj?.[0]) return;
      synthControl = new window.ABCJS.synth.CreateSynth();
      await synthControl.init({ visualObj: visualObj[0], options: { qpm: artifact.bpm } });
      await synthControl.prime();
      synthControl.start();
      isPlaying = true;
      setArtifactActionLabel(e.currentTarget, "⏸", "Pause");
    } catch (err) {
      console.error("Score playback error:", err);
      e.currentTarget.disabled = true;
      setArtifactActionLabel(e.currentTarget, "▶", "Unavailable");
    }
  }));

  card.appendChild(actions);
  return card;
}

async function ensureArtifactAbcjs() {
  if (window.ABCJS) return true;
  if (typeof loadAbcjs === "function") {
    await loadAbcjs();
  }
  return Boolean(window.ABCJS);
}

async function renderArtifactScoreNotation(artifact, notation) {
  if (!notation || !document.getElementById(notation.id)) return;
  try {
    await ensureArtifactAbcjs();
    if (window.ABCJS && document.getElementById(notation.id)) {
      window.ABCJS.renderAbc(notation.id, artifact.abc, {
        responsive: "resize",
        staffwidth: 300,
        paddingtop: 0,
        paddingbottom: 0
      });
      return;
    }
  } catch (err) {
    console.warn("Score notation render unavailable:", err);
  }
  notation.textContent = artifact.abc;
  notation.style.fontFamily = "monospace";
  notation.style.whiteSpace = "pre-wrap";
  notation.style.fontSize = "0.8rem";
}

function stopArtifactScoreSynth(synthControl) {
  if (!synthControl) return;
  try {
    if (typeof synthControl.pause === "function") synthControl.pause();
    else if (typeof synthControl.stop === "function") synthControl.stop();
    else if (typeof synthControl.destroy === "function") synthControl.destroy();
  } catch {
    // Score playback is optional; leave the app usable if ABCJS cannot stop cleanly.
  }
}

/* ── Kanban Task Renderer ── */
function renderArtifactKanbanTask(artifact) {
  const card = document.createElement("div");
  card.className = "coach-artifact-card coach-artifact-kanban";
  card.dataset.artifactType = "kanban_task";

  const laneColors = { todo: "#60a5fa", "in-progress": "#facc15", done: "#4ade80" };
  const laneIcons = { todo: "📝", "in-progress": "⏳", done: "✅" };

  const header = document.createElement("div");
  header.className = "coach-artifact-header";
  const laneBadge = document.createElement("span");
  laneBadge.className = "artifact-lane-badge";
  laneBadge.style.background = laneColors[artifact.lane] || "#94a3b8";
  laneBadge.textContent = `${laneIcons[artifact.lane] || "📋"} ${artifact.lane}`;
  header.appendChild(laneBadge);
  card.appendChild(header);

  const title = document.createElement("div");
  title.className = "coach-artifact-title";
  title.textContent = artifact.title;
  card.appendChild(title);

  if (artifact.desc) {
    const desc = document.createElement("div");
    desc.className = "coach-artifact-summary";
    desc.textContent = artifact.desc;
    card.appendChild(desc);
  }

  const actions = document.createElement("div");
  actions.className = "coach-artifact-actions";
  actions.appendChild(createArtifactAction("Add to Board", "📋", "action-primary", () => {
    addCoachKanbanCardFromArtifact(artifact);
    card.classList.add("artifact-added");
    const addButton = card.querySelector(".action-primary");
    setArtifactActionLabel(addButton, "✓", "Added");
    addButton.disabled = true;
  }));
  actions.appendChild(createArtifactAction("Dismiss", "✕", "action-ghost", () => {
    card.style.opacity = "0";
    setTimeout(() => card.remove(), 300);
  }));
  card.appendChild(actions);
  return card;
}

/* ── Theory Concept Renderer ── */
function renderArtifactTheoryConcept(artifact) {
  const card = document.createElement("div");
  card.className = "coach-artifact-card coach-artifact-concept";
  card.dataset.artifactType = "theory_concept";

  const title = document.createElement("div");
  title.className = "coach-artifact-title";
  title.textContent = `💡 ${artifact.title}`;
  card.appendChild(title);

  if (artifact.facts.length) {
    const factList = document.createElement("ul");
    factList.className = "artifact-fact-list";
    artifact.facts.forEach(fact => {
      const li = document.createElement("li");
      li.textContent = fact;
      factList.appendChild(li);
    });
    card.appendChild(factList);
  }

  if (artifact.relatedLessons.length) {
    const related = document.createElement("div");
    related.className = "artifact-related-lessons";
    related.innerHTML = "<span class='artifact-related-label'>Related Lessons:</span> ";
    artifact.relatedLessons.forEach(lessonId => {
      const lesson = typeof getLessonById === "function" ? getLessonById(lessonId) : null;
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "artifact-lesson-chip";
      chip.textContent = lesson ? lesson.title : lessonId;
      chip.addEventListener("click", () => navigateToLesson(lessonId));
      related.appendChild(chip);
    });
    card.appendChild(related);
  }

  return card;
}

/* ── Quiz Challenge Renderer ── */
function renderArtifactQuizChallenge(artifact) {
  const card = document.createElement("div");
  card.className = "coach-artifact-card coach-artifact-quiz-challenge";
  card.dataset.artifactType = "quiz_challenge";

  const question = document.createElement("div");
  question.className = "coach-artifact-title";
  question.textContent = `❓ ${artifact.question}`;
  card.appendChild(question);

  const optionsContainer = document.createElement("div");
  optionsContainer.className = "artifact-quiz-options";
  let answered = false;

  artifact.options.forEach((option, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "artifact-quiz-option";
    btn.textContent = `${String.fromCharCode(65 + idx)}. ${option}`;
    btn.addEventListener("click", () => {
      if (answered) return;
      answered = true;
      const isCorrect = idx === artifact.correctIndex;
      btn.classList.add(isCorrect ? "quiz-correct" : "quiz-incorrect");
      // Highlight the correct answer
      optionsContainer.querySelectorAll(".artifact-quiz-option").forEach((b, i) => {
        if (i === artifact.correctIndex) b.classList.add("quiz-correct");
        b.disabled = true;
      });
      // Show explanation
      if (artifact.explanation) {
        const explain = document.createElement("div");
        explain.className = "artifact-quiz-explanation";
        explain.textContent = isCorrect
          ? `✓ Correct! ${artifact.explanation}`
          : `✗ ${artifact.explanation}`;
        card.appendChild(explain);
      }
    });
    optionsContainer.appendChild(btn);
  });

  card.appendChild(optionsContainer);
  return card;
}

/* ── Practice Drill Renderer ── */
function renderArtifactPracticeDrill(artifact) {
  const card = document.createElement("div");
  card.className = "coach-artifact-card coach-artifact-drill";
  card.dataset.artifactType = "practice_drill";

  const title = document.createElement("div");
  title.className = "coach-artifact-title";
  title.textContent = `🏋️ ${artifact.title}`;
  card.appendChild(title);

  const instructions = document.createElement("div");
  instructions.className = "coach-artifact-summary";
  instructions.textContent = artifact.instructions;
  card.appendChild(instructions);

  const timerDisplay = document.createElement("div");
  timerDisplay.className = "artifact-drill-timer";
  timerDisplay.textContent = formatDrillTime(artifact.durationSec);
  timerDisplay.hidden = true;
  card.appendChild(timerDisplay);

  const actions = document.createElement("div");
  actions.className = "coach-artifact-actions";
  let timerInterval = null;
  let remaining = artifact.durationSec;

  actions.appendChild(createArtifactAction("Start", "▶", "action-primary", (e) => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      setArtifactActionLabel(e.currentTarget, "▶", "Resume");
      return;
    }
    timerDisplay.hidden = false;
    setArtifactActionLabel(e.currentTarget, "⏸", "Pause");
    timerInterval = setInterval(() => {
      remaining--;
      timerDisplay.textContent = formatDrillTime(remaining);
      if (remaining <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerDisplay.textContent = "✓ Complete!";
        timerDisplay.classList.add("drill-complete");
        e.currentTarget.remove();
      }
    }, 1000);
  }));

  if (artifact.lessonId) {
    actions.appendChild(createArtifactAction("Open Lesson", "📖", "action-secondary", () => {
      navigateToLesson(artifact.lessonId);
    }));
  }

  card.appendChild(actions);
  return card;
}

function formatDrillTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Helper: add a kanban card from any artifact */
function addCoachKanbanCardFromArtifact(artifact) {
  const normalized = normalizeCoachArtifact(artifact);
  if (!normalized) return null;
  const result = upsertCoachStackEntry(normalized, {
    ensureLesson: normalized.type === "chord_sequence",
    bumpToTop: true
  });
  if (result && el.coachOutput) {
    el.coachOutput.textContent = result.exists
      ? `Updated on board: ${result.entry.title}`
      : `Added to board: ${result.entry.title}`;
    emitFeelFeedback("save", result.exists ? "Updated on board." : "Added to board.", { haptic: true });
  }
  return result;
}

function coachNormalizeRoot(root) {
  const text = String(root || "").trim();
  if (!text) return "";
  const cased = text.length > 1 ? `${text[0].toUpperCase()}${text.slice(1)}` : text.toUpperCase();
  if (NOTES.includes(cased)) return cased;
  if (FLAT_TO_SHARP[cased]) return FLAT_TO_SHARP[cased];
  return "";
}

function coachDegreeInKey(root, key) {
  const normalizedRoot = coachNormalizeRoot(root);
  const normalizedKey = coachNormalizeRoot(key) || "C";
  const keyIndex = NOTES.indexOf(normalizedKey);
  const rootIndex = NOTES.indexOf(normalizedRoot);
  if (keyIndex < 0 || rootIndex < 0) return null;
  const distance = (rootIndex - keyIndex + 12) % 12;
  const degreeIndex = DEGREE_TO_SEMITONE.indexOf(distance);
  return degreeIndex >= 0 ? degreeIndex + 1 : null;
}

function coachIsCadenceArtifact(artifact) {
  const type = String(artifact?.type || "").toLowerCase();
  const conceptId = String(artifact?.quiz?.conceptId || "").toLowerCase();
  return type.includes("cadence") || conceptId.includes("cadence");
}

function coachInferCadenceOptionId(artifact) {
  const conceptId = String(artifact?.quiz?.conceptId || "").toLowerCase();
  if (conceptId.includes("plagal")) return "plagal";
  if (conceptId.includes("deceptive")) return "deceptive";
  if (conceptId.includes("half")) return "half";
  if (conceptId.includes("authentic")) return "authentic";

  const steps = Array.isArray(artifact?.sequence) ? artifact.sequence : [];
  if (steps.length >= 2) {
    const from = steps[steps.length - 2];
    const to = steps[steps.length - 1];
    const fromDegree = coachDegreeInKey(from?.root, artifact?.key);
    const toDegree = coachDegreeInKey(to?.root, artifact?.key);
    if (fromDegree === 5 && toDegree === 6) return "deceptive";
    if (fromDegree === 4 && toDegree === 1) return "plagal";
    if (fromDegree === 5 && toDegree === 1) return "authentic";
    if (toDegree === 5) return "half";
  }

  return "authentic";
}

function coachRotateCadenceOptions(artifactId) {
  const base = [...COACH_CADENCE_QUIZ_OPTIONS];
  const key = String(artifactId || "");
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  const offset = Math.abs(hash) % base.length;
  return base.map((_, idx) => base[(idx + offset) % base.length]);
}

function ensureCoachCadenceQuizSession(artifact) {
  if (!artifact?.id || !coachIsCadenceArtifact(artifact)) return null;
  const existing = coachState.quizSessions[artifact.id];
  if (existing && Array.isArray(existing.options) && existing.options.length) {
    return existing;
  }
  const correctOptionId = coachInferCadenceOptionId(artifact);
  const session = {
    id: `quiz-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    artifactId: artifact.id,
    conceptId: String(artifact?.quiz?.conceptId || "").trim() || `cadence-${correctOptionId}`,
    prompt: String(artifact?.quiz?.prompt || "").trim() || "Which cadence quality matches this artifact?",
    options: coachRotateCadenceOptions(artifact.id),
    correctOptionId,
    attempts: 0,
    lastSelectedId: "",
    lastResult: null,
    lastAttemptAt: ""
  };
  coachState.quizSessions[artifact.id] = session;
  return session;
}

function getCoachConceptMastery(conceptId) {
  const id = String(conceptId || "core-harmony").trim() || "core-harmony";
  const raw = progress.conceptMastery[id];
  if (!raw || typeof raw !== "object") {
    return {
      conceptId: id,
      attempts: 0,
      correct: 0,
      incorrect: 0,
      streak: 0,
      mastered: false,
      lastResult: "",
      updatedAt: ""
    };
  }
  return {
    conceptId: id,
    attempts: Number(raw.attempts) || 0,
    correct: Number(raw.correct) || 0,
    incorrect: Number(raw.incorrect) || 0,
    streak: Number(raw.streak) || 0,
    mastered: Boolean(raw.mastered),
    lastResult: String(raw.lastResult || ""),
    updatedAt: String(raw.updatedAt || "")
  };
}

function getCoachArtifactAttemptStats(artifactId) {
  const attempts = Array.isArray(progress.artifactAttempts) ? progress.artifactAttempts : [];
  return attempts.reduce((acc, attempt) => {
    if (attempt?.artifactId !== artifactId) return acc;
    acc.total += 1;
    if (attempt.isCorrect) acc.correct += 1;
    return acc;
  }, { total: 0, correct: 0 });
}

function recordCoachArtifactAttempt(artifact, session, selectedOptionId) {
  if (!artifact?.id || !session?.id) return null;
  const selectedId = String(selectedOptionId || "").trim();
  const correctId = String(session.correctOptionId || "").trim();
  const isCorrect = selectedId === correctId;
  const attempt = {
    id: `attempt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: nowIsoString(),
    artifactId: artifact.id,
    conceptId: session.conceptId,
    quizSessionId: session.id,
    selectedOptionId: selectedId,
    correctOptionId: correctId,
    isCorrect
  };
  progress.artifactAttempts.unshift(attempt);
  progress.artifactAttempts = progress.artifactAttempts.slice(0, COACH_MAX_ARTIFACT_ATTEMPTS);

  const mastery = getCoachConceptMastery(session.conceptId);
  mastery.attempts += 1;
  if (isCorrect) {
    mastery.correct += 1;
    mastery.streak = Math.max(1, mastery.streak + 1);
    mastery.lastResult = "correct";
  } else {
    mastery.incorrect += 1;
    mastery.streak = 0;
    mastery.lastResult = "incorrect";
  }
  mastery.updatedAt = attempt.createdAt;
  const accuracy = mastery.attempts > 0 ? mastery.correct / mastery.attempts : 0;
  mastery.mastered = mastery.correct >= COACH_MASTERY_CORRECT_TARGET && accuracy >= 0.75;
  progress.conceptMastery[session.conceptId] = mastery;

  session.attempts = (Number(session.attempts) || 0) + 1;
  session.lastSelectedId = selectedId;
  session.lastResult = isCorrect;
  session.lastAttemptAt = attempt.createdAt;
  saveProgress();

  return { isCorrect, selectedId, correctId, mastery };
}

function renderCoachArtifactQuizPanel(container, artifact) {
  if (!container) return;
  container.innerHTML = "";
  container.className = "coach-artifact-quiz";
  if (!coachIsCadenceArtifact(artifact)) {
    const hint = document.createElement("div");
    hint.className = "coach-quiz-help";
    hint.textContent = "Try: play this artifact in 3 keys, then explain the harmonic function out loud.";
    container.appendChild(hint);
    return;
  }

  const session = ensureCoachCadenceQuizSession(artifact);
  if (!session) return;

  const prompt = document.createElement("div");
  prompt.className = "coach-quiz-prompt";
  prompt.textContent = session.prompt || "Which cadence quality matches this artifact?";
  container.appendChild(prompt);

  const options = document.createElement("div");
  options.className = "coach-quiz-options";
  session.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "coach-quiz-option";
    btn.textContent = option.label;
    if (session.lastSelectedId === option.id) {
      btn.classList.add("is-selected");
    }
    if (session.lastResult !== null && option.id === session.correctOptionId) {
      btn.classList.add("is-correct");
    }
    if (session.lastResult === false && session.lastSelectedId === option.id && option.id !== session.correctOptionId) {
      btn.classList.add("is-incorrect");
    }
    btn.addEventListener("click", () => {
      const outcome = recordCoachArtifactAttempt(artifact, session, option.id);
      if (outcome && el.coachOutput) {
        const answerLabel = COACH_CADENCE_LABEL_BY_ID[outcome.correctId] || "Correct cadence";
        el.coachOutput.textContent = outcome.isCorrect
          ? `Correct. ${answerLabel}.`
          : `Not yet. Correct answer: ${answerLabel}.`;
        emitFeelFeedback(outcome.isCorrect ? "success" : "retry", outcome.isCorrect ? "Nice ear." : "Listen once more.", { haptic: true });
      }
      renderCoachArtifactQuizPanel(container, artifact);
    });
    options.appendChild(btn);
  });
  container.appendChild(options);

  const result = document.createElement("div");
  result.className = "coach-quiz-result";
  if (session.lastResult === true) {
    result.textContent = `Correct. ${COACH_CADENCE_LABEL_BY_ID[session.correctOptionId] || "Cadence identified."}`;
  } else if (session.lastResult === false) {
    result.textContent = `Try again. Correct answer: ${COACH_CADENCE_LABEL_BY_ID[session.correctOptionId] || "see highlighted option"}.`;
  } else {
    result.textContent = "Pick one answer to grade this cadence concept.";
  }
  container.appendChild(result);

  const stats = getCoachArtifactAttemptStats(artifact.id);
  const mastery = getCoachConceptMastery(session.conceptId);
  const masteryLine = document.createElement("div");
  masteryLine.className = "coach-quiz-mastery";
  const accuracyPercent = mastery.attempts > 0 ? Math.round((mastery.correct / mastery.attempts) * 100) : 0;
  const masteredSuffix = mastery.mastered ? " Mastered." : "";
  masteryLine.textContent = `Artifact attempts: ${stats.correct}/${stats.total} correct. Concept mastery: ${mastery.correct}/${mastery.attempts} (${accuracyPercent}%).${masteredSuffix}`;
  container.appendChild(masteryLine);
}

function findCoachArtifactStartCell(step) {
  const root = String(step?.root || "").trim();
  const quality = String(step?.quality || "").trim();
  if (!root || !quality) return null;
  return findChordCell(root, quality) || null;
}

function scheduleCoachCircularResolveCelebration(cell, atTimeSec, token) {
  if (!cell) return;
  const nowSec = getSchedulerNowSeconds();
  const delayMs = Math.max(0, Math.round((atTimeSec - nowSec) * 1000));
  window.setTimeout(() => {
    if (token !== paletteSequenceToken) return;
    clearChordTableSelection();
    cell.classList.add("is-selected");
    celebrateResolutionCell(cell);
  }, delayMs);
}

/** Route artifact to correct renderer via the type registry */
function buildCoachArtifactCardElement(artifact) {
  const normalized = normalizeCoachArtifact(artifact);
  if (!normalized) return null;
  const renderer = ARTIFACT_RENDERERS[normalized.type];
  return renderer ? renderer(normalized) : null;
}

/** Chord-sequence card builder (original implementation, renamed) */
function buildCoachArtifactCardFromChordSequence(artifact) {
  const normalized = normalizeChordSequenceArtifact(artifact);
  if (!normalized) return document.createElement("div");
  const card = document.createElement("div");
  card.className = "coach-artifact-card coach-artifact-chord-seq";
  card.dataset.artifactType = "chord_sequence";

  const title = document.createElement("div");
  title.className = "coach-artifact-title";
  title.textContent = normalized.title;
  card.appendChild(title);

  const summary = document.createElement("div");
  summary.className = "coach-artifact-summary";
  const sequenceLabel = normalized.sequence.map((step) => step.chord || `${step.root}${step.quality}`).join(" → ");
  summary.textContent = `${normalized.key} • ${normalized.bpm} BPM • ${sequenceLabel}`;
  card.appendChild(summary);

  const actions = document.createElement("div");
  actions.className = "coach-artifact-actions";

  const playBtn = document.createElement("button");
  playBtn.type = "button";
  playBtn.textContent = "Play";
  playBtn.addEventListener("click", () => {
    void playCoachArtifact(normalized);
  });
  actions.appendChild(playBtn);

  const tryBtn = document.createElement("button");
  tryBtn.type = "button";
  tryBtn.textContent = "Try";
  const quizPanel = document.createElement("div");
  quizPanel.className = "coach-artifact-quiz";
  renderCoachArtifactQuizPanel(quizPanel, normalized);
  tryBtn.addEventListener("click", () => {
    startCoachArtifactTry(normalized, quizPanel);
  });
  actions.appendChild(tryBtn);

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.textContent = "Save to Stack";
  saveBtn.addEventListener("click", () => {
    saveCoachArtifactToStack(normalized);
  });
  actions.appendChild(saveBtn);

  const openLessonBtn = document.createElement("button");
  openLessonBtn.type = "button";
  openLessonBtn.textContent = "Open Full Lesson";
  openLessonBtn.addEventListener("click", () => {
    openCoachArtifactFullLesson(normalized);
  });
  actions.appendChild(openLessonBtn);

  card.appendChild(actions);
  card.appendChild(quizPanel);
  return card;
}

async function playCoachArtifact(artifact) {
  if (!artifact || !Array.isArray(artifact.sequence) || !artifact.sequence.length) return;
  const ready = await ensureHarmonicPlaybackReady();
  if (!ready) return;
  cancelPaletteSequence();
  const token = ++paletteSequenceToken;
  const startTimeSec = getSchedulerNowSeconds() + Math.max(0.01, getInteractiveStartLeadTimeSeconds());
  const steps = artifact.sequence.map((step) => ({
    root: step.root,
    quality: step.quality,
    beats: Number(step.beats) || 2
  }));
  const payload = { steps };
  const useCircularPolicy = artifact?.playbackPolicy?.mode === "circular_row_sweep";
  if (useCircularPolicy && steps[0]?.root && steps[0]?.quality) {
    const startCell = findCoachArtifactStartCell(steps[0]);
    let endTimeSec = scheduleHarmonicEventPlayback(payload, startTimeSec, token, null);
    endTimeSec += getHarmonySubdivisionSeconds();
    const resolveHold = Math.max(0.14, getHarmonyBeatSeconds() * 1.8);
    const resolvedMidi = buildChordMidi(steps[0].root, steps[0].quality, "root position", 3).map((midi) => midi + 12);
    scheduleChordAtTime(resolvedMidi, endTimeSec, resolveHold, token);
    if (startCell) {
      scheduleHarmonicCellSelection(startCell, endTimeSec, resolveHold, token);
      scheduleCoachCircularResolveCelebration(startCell, endTimeSec, token);
    }
  } else {
    scheduleHarmonicEventPlayback(payload, startTimeSec, token, null);
  }
  if (el.coachOutput) {
    el.coachOutput.textContent = `Playing artifact: ${artifact.title}`;
  }
}

function startCoachArtifactTry(artifact, quizPanel = null) {
  const session = ensureCoachCadenceQuizSession(artifact);
  if (quizPanel) {
    renderCoachArtifactQuizPanel(quizPanel, artifact);
  }
  if (el.coachOutput) {
    if (session) {
      el.coachOutput.textContent = `${session.prompt} Choose one option below to grade your answer.`;
      return;
    }
    el.coachOutput.textContent = artifact?.quiz?.prompt || `Try this concept: ${artifact?.title || "lesson artifact"}.`;
  }
}

function mapArtifactToLessonTrack(artifact) {
  const type = String(artifact?.type || "").toLowerCase();
  if (type.includes("cadence")) return "classical";
  if (type.includes("arpeggio")) return "jazz";
  if (type.includes("scale")) return "classical";
  if (type === "theory_concept" || type === "lesson_card" || type === "quiz_challenge") return "classical";
  return "pop";
}

function mapArtifactTopic(artifact) {
  const type = String(artifact?.type || "").toLowerCase();
  if (type.includes("cadence")) return "cadences";
  if (type.includes("arpeggio")) return "voicings";
  if (type.includes("scale")) return "progressions";
  if (type === "theory_concept") return "foundations";
  if (type === "quiz_challenge") return "ear-training";
  if (type === "practice_drill") return "practice";
  return "progressions";
}

function describeCoachArtifactForLesson(artifact) {
  const type = String(artifact?.type || "").toLowerCase();
  if (type === "practice_drill") return artifact.instructions || artifact.title;
  if (type === "quiz_challenge") return artifact.question || artifact.title;
  if (type === "theory_concept" && Array.isArray(artifact.facts) && artifact.facts.length) {
    return artifact.facts.join(" ");
  }
  return artifact.desc || artifact.description || artifact.title || "Generated from AI coach.";
}

function getCoachArtifactLessonTokens(artifact) {
  const sequence = Array.isArray(artifact?.sequence) ? artifact.sequence : [];
  if (sequence.length) {
    return sequence
      .map((step) => step?.chord || `${step?.root || ""}${step?.quality || ""}`.trim())
      .filter(Boolean)
      .slice(0, 7);
  }
  if (Array.isArray(artifact?.options) && artifact.options.length) {
    return artifact.options.slice(0, 7);
  }
  if (Array.isArray(artifact?.facts) && artifact.facts.length) {
    return artifact.facts.slice(0, 7);
  }
  return String(artifact?.title || "Generated artifact")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 7);
}

function upsertCoachArtifactLesson(artifact) {
  const trackId = mapArtifactToLessonTrack(artifact);
  if (!progress.theoryCustomLessons[trackId]) {
    progress.theoryCustomLessons[trackId] = [];
  }
  const lessonId = `coach-artifact-${artifact.id}`;
  const bucket = progress.theoryCustomLessons[trackId];
  const hasCadenceShape = String(artifact?.type || "").includes("cadence")
    || String(artifact?.quiz?.conceptId || "").includes("cadence");
  const keyText = artifact.key ? ` Key ${artifact.key}.` : "";
  const bpmText = artifact.bpm ? ` ${artifact.bpm} BPM.` : "";
  const description = describeCoachArtifactForLesson(artifact);
  const lesson = {
    id: lessonId,
    trackId,
    customTopic: mapArtifactTopic(artifact),
    customLevel: "noob",
    title: artifact.title,
    description,
    resources: [{ label: "Generated Artifact", url: "" }],
    videoUrl: "",
    narration: `Practice ${artifact.title}.${keyText}${bpmText}`,
    infographicType: hasCadenceShape ? "ii-v-i" : "functional",
    customTokens: getCoachArtifactLessonTokens(artifact),
    artifact
  };
  const idx = bucket.findIndex((entry) => entry.id === lessonId);
  if (idx >= 0) {
    bucket[idx] = lesson;
  } else {
    bucket.unshift(lesson);
    progress.theoryCustomLessons[trackId] = bucket.slice(0, 40);
  }
  saveProgress();
  return { trackId, lessonId };
}

function upsertCoachStackEntry(artifact, options = {}) {
  const normalizedArtifact = normalizeCoachArtifact(artifact);
  if (!normalizedArtifact?.id) return null;
  const ensureLesson = options.ensureLesson === true;
  const bumpToTop = options.bumpToTop !== false;
  const now = nowIsoString();
  const index = coachState.lessonStack.findIndex((entry) => entry.id === normalizedArtifact.id);
  const existing = index >= 0 ? normalizeCoachLessonStackEntry(coachState.lessonStack[index]) : null;
  const nextEntry = {
    id: normalizedArtifact.id,
    title: normalizedArtifact.title,
    type: normalizedArtifact.type,
    savedAt: existing?.savedAt || now,
    lastOpenedAt: existing?.lastOpenedAt || "",
    trackId: existing?.trackId || "",
    lessonId: existing?.lessonId || "",
    completedAt: existing?.completedAt || "",
    artifact: normalizedArtifact
  };

  if (ensureLesson) {
    const linked = upsertCoachArtifactLesson(normalizedArtifact);
    nextEntry.trackId = linked.trackId;
    nextEntry.lessonId = linked.lessonId;
  }

  if (index >= 0) {
    coachState.lessonStack[index] = nextEntry;
    if (bumpToTop && index > 0) {
      coachState.lessonStack.splice(index, 1);
      coachState.lessonStack.unshift(nextEntry);
    }
  } else {
    coachState.lessonStack.unshift(nextEntry);
  }

  coachState.lessonStack = coachState.lessonStack
    .map((entry) => normalizeCoachLessonStackEntry(entry))
    .filter(Boolean)
    .slice(0, 120);
  saveCoachLessonStack();
  renderCoachKanban();
  return {
    entry: nextEntry,
    exists: index >= 0
  };
}

function saveCoachArtifactToStack(artifact) {
  const result = upsertCoachStackEntry(artifact, { ensureLesson: false, bumpToTop: true });
  if (!result) return;
  if (el.coachOutput) {
    el.coachOutput.textContent = result.exists
      ? `Updated in lesson stack: ${result.entry.title}`
      : `Saved to lesson stack: ${result.entry.title}`;
  }
  emitFeelFeedback("save", result.exists ? "Updated in lesson stack." : "Saved to lesson stack.", { haptic: true });
}

function removeCoachLessonStackEntry(entryId) {
  const id = String(entryId || "").trim();
  if (!id) return;
  const next = coachState.lessonStack.filter((entry) => entry.id !== id);
  if (next.length === coachState.lessonStack.length) return;
  coachState.lessonStack = next;
  saveCoachLessonStack();
  renderCoachKanban();
  if (el.coachOutput) {
    el.coachOutput.textContent = "Removed lesson from stack.";
  }
}

function openTheoryLessonFromCoachStack(trackId, lessonId, title = "Lesson") {
  if (!trackId || !lessonId) return false;
  setMode("theory");
  if (el.theoryTrackSelect) {
    el.theoryTrackSelect.value = trackId;
  }
  theoryState.trackId = trackId;
  theoryState.lessonId = lessonId;
  theoryState.isEditingLesson = false;
  theoryState.activeRunLessonId = "";
  theoryState.runKeyboardPresses = 0;
  renderTheoryLessonList();
  renderTheoryLessonDetail();
  renderTheoryProgressSummary();
  if (el.coachOutput) {
    el.coachOutput.textContent = `Opened full lesson: ${title}`;
  }
  return true;
}

function continueCoachLessonFromStack(entryId) {
  const id = String(entryId || "").trim();
  if (!id) return;
  const existing = coachState.lessonStack.find((entry) => entry.id === id);
  const normalized = normalizeCoachLessonStackEntry(existing);
  if (!normalized) {
    if (el.coachOutput) {
      el.coachOutput.textContent = "Lesson stack entry is unavailable.";
    }
    return;
  }
  const result = upsertCoachStackEntry(normalized.artifact, {
    ensureLesson: true,
    bumpToTop: true
  });
  if (!result?.entry?.trackId || !result?.entry?.lessonId) {
    if (el.coachOutput) {
      el.coachOutput.textContent = "Unable to continue lesson from this artifact.";
    }
    return;
  }
  result.entry.lastOpenedAt = nowIsoString();
  coachState.lessonStack[0] = normalizeCoachLessonStackEntry(result.entry);
  saveCoachLessonStack();
  renderCoachKanban();
  openTheoryLessonFromCoachStack(result.entry.trackId, result.entry.lessonId, result.entry.title);
}

function markCoachLessonStackCompleted(lessonId) {
  const id = String(lessonId || "").trim();
  if (!id) return;
  let changed = false;
  coachState.lessonStack = coachState.lessonStack.map((entry) => {
    const normalized = normalizeCoachLessonStackEntry(entry);
    if (!normalized) return entry;
    if (normalized.lessonId !== id) return normalized;
    if (!normalized.completedAt) {
      normalized.completedAt = nowIsoString();
      changed = true;
    }
    return normalized;
  });
  if (changed) {
    saveCoachLessonStack();
    renderCoachKanban();
  }
}

function openCoachArtifactFullLesson(artifact) {
  if (!artifact) return;
  const result = upsertCoachStackEntry(artifact, {
    ensureLesson: true,
    bumpToTop: true
  });
  if (!result?.entry) return;
  result.entry.lastOpenedAt = nowIsoString();
  coachState.lessonStack[0] = normalizeCoachLessonStackEntry(result.entry);
  saveCoachLessonStack();
  renderCoachKanban();
  if (result.entry.trackId && result.entry.lessonId) {
    openTheoryLessonFromCoachStack(result.entry.trackId, result.entry.lessonId, result.entry.title);
    emitFeelFeedback("soft", "Lesson opened.", { haptic: true });
  }
}

function formatCoachMode(mode) {
  const key = String(mode || "").toLowerCase();
  if (key === "ollama") return "Local Gemma (Ollama)";
  if (key === "openai") return "OpenAI";
  if (key === "pollinations") return "Cloud fallback model";
  if (key === "offline") return "Local smart tutor";
  return "Unknown";
}

function setCoachStatus(_text) {
  /* Status bar removed in chat UI redesign — kept as no-op for callers */
}

async function refreshCoachStatus() {
  /* No visible status bar in new chat UI */
}

function coachRequestContext() {
  const cadenceName = getSelectedCadenceName();
  const cadenceProfile = getCadenceProfile(cadenceName);
  return {
    progress,
    key: el.keySelect.value,
    progression: el.progressionSelect.value,
    cadence: cadenceName,
    cadenceEmotion: cadenceProfile.emotion,
    chord: `${appState.root}${CHORDS[appState.quality].short}`,
    arpeggio: `${el.arpRootSelect.value} ${el.arpTypeSelect.value}`,
    scale: `${el.scaleRootSelect.value} ${scalePatternLabel(resolveScalePatternKey(el.scaleTypeSelect.value))}`,
    tempo: appState.tempoBpm
  };
}

function buildCoachConversationPayload(thread, question) {
  const messages = thread.messages
    .filter((entry) => entry.role === "user" || entry.role === "assistant")
    .map((entry) => ({ role: entry.role, content: entry.content }))
    .slice(-COACH_MAX_CONTEXT_MESSAGES);
  return {
    threadId: thread.id,
    question,
    context: coachRequestContext(),
    messages
  };
}

async function streamCoachResponse(payload, { onMeta, onDelta, onDone }) {
  const res = await fetch("/api/coach/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok || !res.body) {
    throw new Error(`Coach stream failed (${res.status})`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    lines.forEach((line) => {
      const chunk = line.trim();
      if (!chunk) return;
      let eventPayload;
      try {
        eventPayload = JSON.parse(chunk);
      } catch {
        return;
      }
      if (eventPayload.type === "meta" && typeof onMeta === "function") onMeta(eventPayload);
      if (eventPayload.type === "delta" && typeof onDelta === "function") onDelta(eventPayload);
      if (eventPayload.type === "done" && typeof onDone === "function") onDone(eventPayload);
    });
  }
  if (buffer.trim()) {
    try {
      const trailing = JSON.parse(buffer.trim());
      if (trailing.type === "done" && typeof onDone === "function") onDone(trailing);
    } catch {
      // Ignore malformed trailing buffer.
    }
  }
}



async function askCoach() {
  if (coachState.isStreaming) return;
  const question = el.coachInput.value.trim();
  if (!question) return;

  const thread = getActiveCoachThread();
  if (!thread.messages.length || !thread.title || thread.title.startsWith("Conversation")) {
    thread.title = trimThreadTitleFromQuestion(question) || thread.title || defaultCoachThreadTitle(0);
  }
  const userMessage = createCoachMessage("user", question);
  pushCoachMessage(thread, userMessage);
  const assistantMessage = createCoachMessage("assistant", "", { pending: true, mode: "stream" });
  pushCoachMessage(thread, assistantMessage);
  coachState.isStreaming = true;
  saveCoachThreads();
  renderCoachThreadPills();
  renderCoachMessages();
  if (el.coachInput) el.coachInput.value = "";
  if (el.coachTyping) el.coachTyping.hidden = false;

  try {
    const payload = buildCoachConversationPayload(thread, question);
    let finalDone = null;
    await streamCoachResponse(payload, {
      onMeta: (_meta) => { },
      onDelta: (delta) => {
        if (el.coachTyping) el.coachTyping.hidden = true;
        const current = thread.messages.find((msg) => msg.id === assistantMessage.id)?.content || "";
        updatePendingAssistantMessage(thread, assistantMessage.id, { content: `${current}${delta.text || ""}` });
        renderCoachMessages();
      },
      onDone: (donePayload) => {
        finalDone = donePayload;
      }
    });

    const normalizedArtifacts = normalizeCoachArtifacts(finalDone?.artifacts || finalDone?.artifact || null);
    const finalText = String(finalDone?.assistantText || finalDone?.answer || "").trim()
      || buildClientCoachFallback(question);
    updatePendingAssistantMessage(thread, assistantMessage.id, {
      content: finalText,
      mode: String(finalDone?.mode || "offline"),
      warning: String(finalDone?.warning || "").trim(),
      artifact: normalizedArtifacts[0] || null,
      artifacts: normalizedArtifacts,
      pending: false
    });
  } catch (err) {
    updatePendingAssistantMessage(thread, assistantMessage.id, {
      content: buildClientCoachFallback(question),
      mode: "offline",
      warning: "",
      artifact: null,
      artifacts: [],
      pending: false
    });
  } finally {
    coachState.isStreaming = false;
    if (el.coachTyping) el.coachTyping.hidden = true;
    thread.updatedAt = nowIsoString();
    saveCoachThreads();
    renderCoachThreadPills();
    renderCoachMessages();
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

function markSessionComplete(options = {}) {
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
  if (!options.quiet) {
    emitFeelFeedback("complete", "Session complete.", { haptic: true });
  }
}

function renderProgress() {
  el.statSessions.textContent = String(progress.sessionsCompleted);
  el.statStreak.textContent = String(progress.streakDays);
  el.statChords.textContent = String(progress.chordReps);
  el.statScales.textContent = String(progress.scaleReps);
  el.statArps.textContent = String(progress.arpeggioReps);
  el.statProgressions.textContent = String(progress.progressionReps);
  renderPersonalizedSequence();
  renderPracticeLab();
  renderExploreLabs();
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
    chords: `Study ${appState.root}${CHORDS[appState.quality].short} in all inversions, then play or click them slow and connected.`,
    progressions: `Loop ${el.progressionSelect?.value || "I-vi-IV-V (Pop)"} in ${el.keySelect?.value || appState.root}, say chord function out loud.`,
    scales: `Map ${el.scaleRootSelect?.value || appState.root} ${scalePatternLabel(resolveScalePatternKey(el.scaleTypeSelect?.value))} @ ${appState.tempoBpm} BPM, then hear or play it.`,
    arpeggios: `Study ${el.arpRootSelect?.value || appState.root} ${el.arpTypeSelect?.value || "major triad"} as chord tones, then transfer it to one hand if a keyboard is nearby.`
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
        conceptMastery: { ...defaultProgress.conceptMastery },
        artifactAttempts: [...defaultProgress.artifactAttempts],
        theoryCompletedLessons: { ...defaultProgress.theoryCompletedLessons },
        theoryAudioByLesson: { ...defaultProgress.theoryAudioByLesson },
        theoryCustomLessons: { ...defaultProgress.theoryCustomLessons },
        theoryLessonRuns: { ...defaultProgress.theoryLessonRuns },
        dailyPracticeLog: { ...defaultProgress.dailyPracticeLog },
        chordMasteryScores: { ...defaultProgress.chordMasteryScores },
        savedLabIdeas: [...defaultProgress.savedLabIdeas],
        recent: []
      };
    }

    const parsed = JSON.parse(raw);
    return {
      ...defaultProgress,
      ...parsed,
      areas: { ...defaultProgress.areas, ...(parsed.areas || {}) },
      conceptMastery: { ...defaultProgress.conceptMastery, ...(parsed.conceptMastery || {}) },
      artifactAttempts: Array.isArray(parsed.artifactAttempts) ? parsed.artifactAttempts : [],
      theoryCompletedLessons: { ...defaultProgress.theoryCompletedLessons, ...(parsed.theoryCompletedLessons || {}) },
      theoryAudioByLesson: { ...defaultProgress.theoryAudioByLesson, ...(parsed.theoryAudioByLesson || {}) },
      theoryCustomLessons: { ...defaultProgress.theoryCustomLessons, ...(parsed.theoryCustomLessons || {}) },
      theoryLessonRuns: { ...defaultProgress.theoryLessonRuns, ...(parsed.theoryLessonRuns || {}) },
      dailyPracticeLog: { ...defaultProgress.dailyPracticeLog, ...(parsed.dailyPracticeLog || {}) },
      chordMasteryScores: { ...defaultProgress.chordMasteryScores, ...(parsed.chordMasteryScores || {}) },
      savedLabIdeas: Array.isArray(parsed.savedLabIdeas) ? parsed.savedLabIdeas : [],
      recent: Array.isArray(parsed.recent) ? parsed.recent : []
    };
  } catch {
    return {
      ...defaultProgress,
      areas: { ...defaultProgress.areas },
      conceptMastery: { ...defaultProgress.conceptMastery },
      artifactAttempts: [...defaultProgress.artifactAttempts],
      theoryCompletedLessons: { ...defaultProgress.theoryCompletedLessons },
      theoryAudioByLesson: { ...defaultProgress.theoryAudioByLesson },
      theoryCustomLessons: { ...defaultProgress.theoryCustomLessons },
      theoryLessonRuns: { ...defaultProgress.theoryLessonRuns },
      dailyPracticeLog: { ...defaultProgress.dailyPracticeLog },
      chordMasteryScores: { ...defaultProgress.chordMasteryScores },
      savedLabIdeas: [...defaultProgress.savedLabIdeas],
      recent: []
    };
  }
}

function saveProgress() {
  safeStorageSet(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  evaluateBadges();
  debouncedCloudSync();
}

let _cloudSyncTimer = null;
function debouncedCloudSync() {
  if (_cloudSyncTimer) clearTimeout(_cloudSyncTimer);
  _cloudSyncTimer = setTimeout(() => {
    _cloudSyncTimer = null;
    if (window.BabyStepsAuth && window.BabyStepsAuth.isSignedIn()) {
      const threads = coachState.threads || [];
      const stack = coachState.lessonStack || [];
      window.BabyStepsAuth.saveProgressToCloud(progress, threads, stack);
    }
  }, 2000);
}

function evaluateBadges() {
  BADGE_DEFINITIONS.forEach(badge => {
    if (earnedBadgesLocal.has(badge.id)) return;
    try {
      if (badge.rule(progress)) {
        earnedBadgesLocal.add(badge.id);
        safeStorageSet("baby-steps-badges-v1", JSON.stringify([...earnedBadgesLocal]));
        showBadgeToast(badge);
        if (window.BabyStepsAuth && window.BabyStepsAuth.isSignedIn()) {
          window.BabyStepsAuth.awardBadgeCloud(badge.id);
        }
        renderBadgeGrid();
      }
    } catch (e) { /* badge rule error – skip */ }
  });
}

function showBadgeToast(badge) {
  let toast = document.querySelector(".badge-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "badge-toast";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="badge-toast-icon">${badge.icon}</span> Badge earned: ${badge.label}`;
  toast.classList.remove("show");
  void toast.offsetWidth; // reflow
  toast.classList.add("show");
  emitFeelFeedback("complete", "", { haptic: true, visual: false });
  setTimeout(() => toast.classList.remove("show"), 3500);
}

function renderBadgeGrid() {
  if (!el.badgeGrid) return;
  el.badgeGrid.innerHTML = BADGE_DEFINITIONS.map(b => {
    const earned = earnedBadgesLocal.has(b.id);
    return `<div class="badge-card ${earned ? 'earned' : ''}" title="${b.label}">
      <span class="badge-icon">${b.icon}</span>
      <span class="badge-label">${b.label}</span>
    </div>`;
  }).join("");
}

function renderProfilePanel() {
  if (!el.profileSection) return;
  const user = window.BabyStepsAuth ? window.BabyStepsAuth.getUser() : null;
  if (!user) {
    el.profileSection.classList.add("is-hidden");
    return;
  }
  el.profileSection.classList.remove("is-hidden");
  const meta = user.user_metadata || {};
  if (el.profileAvatar) el.profileAvatar.src = meta.avatar_url || meta.picture || "";
  if (el.profileName) el.profileName.textContent = meta.full_name || meta.name || "Pianist";
  if (el.profileEmail) el.profileEmail.textContent = user.email || "";
  updateMasteryStats();
  renderBadgeGrid();
}

function updateMasteryStats() {
  if (el.masteryChords) el.masteryChords.textContent = progress.areas?.chords || 0;
  if (el.masteryScales) el.masteryScales.textContent = progress.areas?.scales || 0;
  if (el.masteryLessons) el.masteryLessons.textContent = Object.keys(progress.theoryCompletedLessons || {}).filter(k => progress.theoryCompletedLessons[k]).length;
  if (el.masteryCadences) el.masteryCadences.textContent = progress.conceptMastery?.cadence || 0;
}

function initAuth() {
  if (!window.BabyStepsAuth) return;

  if (el.authSignInBtn) {
    el.authSignInBtn.addEventListener("click", () => window.BabyStepsAuth.signInWithGoogle());
  }
  if (el.authSignOutBtn) {
    el.authSignOutBtn.addEventListener("click", () => window.BabyStepsAuth.signOut());
  }

  window.BabyStepsAuth.onAuthChange(async (state) => {
    const user = state.user;
    if (user) {
      // Signed in
      if (el.authSignInBtn) el.authSignInBtn.classList.add("is-hidden");
      if (el.authUserPill) {
        el.authUserPill.classList.remove("is-hidden");
        const meta = user.user_metadata || {};
        if (el.authAvatar) el.authAvatar.src = meta.avatar_url || meta.picture || "";
        if (el.authDisplayName) el.authDisplayName.textContent = (meta.full_name || meta.name || "Pianist").split(" ")[0];
      }

      // Ensure profile exists
      window.BabyStepsAuth.ensureProfile();

      // First-login migration: push local data to cloud if cloud is empty
      const localThreads = coachState.threads || [];
      const localStack = coachState.lessonStack || [];
      await window.BabyStepsAuth.migrateLocalToCloud(progress, localThreads, localStack);

      // Load cloud data (cloud wins)
      const cloudData = await window.BabyStepsAuth.loadProgressFromCloud();
      if (cloudData && cloudData.progress && Object.keys(cloudData.progress).length > 0) {
        progress = normalizeProgressShape(cloudData.progress);
        safeStorageSet(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
      }

      // Load cloud badges
      const cloudBadges = await window.BabyStepsAuth.loadBadgesFromCloud();
      cloudBadges.forEach(b => earnedBadgesLocal.add(b.badge_id));
      safeStorageSet("baby-steps-badges-v1", JSON.stringify([...earnedBadgesLocal]));

      renderProfilePanel();
    } else {
      // Signed out
      if (el.authSignInBtn) el.authSignInBtn.classList.remove("is-hidden");
      if (el.authUserPill) el.authUserPill.classList.add("is-hidden");
      if (el.profileSection) el.profileSection.classList.add("is-hidden");
    }
  });

  window.BabyStepsAuth.init();
}

function normalizeProgressShape(parsed = {}) {
  return {
    ...defaultProgress,
    ...parsed,
    areas: { ...defaultProgress.areas, ...(parsed.areas || {}) },
    conceptMastery: { ...defaultProgress.conceptMastery, ...(parsed.conceptMastery || {}) },
    artifactAttempts: Array.isArray(parsed.artifactAttempts) ? parsed.artifactAttempts : [],
    theoryCompletedLessons: { ...defaultProgress.theoryCompletedLessons, ...(parsed.theoryCompletedLessons || {}) },
    theoryAudioByLesson: { ...defaultProgress.theoryAudioByLesson, ...(parsed.theoryAudioByLesson || {}) },
    theoryCustomLessons: { ...defaultProgress.theoryCustomLessons, ...(parsed.theoryCustomLessons || {}) },
    theoryLessonRuns: { ...defaultProgress.theoryLessonRuns, ...(parsed.theoryLessonRuns || {}) },
    dailyPracticeLog: { ...defaultProgress.dailyPracticeLog, ...(parsed.dailyPracticeLog || {}) },
    chordMasteryScores: { ...defaultProgress.chordMasteryScores, ...(parsed.chordMasteryScores || {}) },
    savedLabIdeas: Array.isArray(parsed.savedLabIdeas) ? parsed.savedLabIdeas : [],
    recent: Array.isArray(parsed.recent) ? parsed.recent : []
  };
}

function resetProgressState() {
  safeStorageRemove(PROGRESS_STORAGE_KEY);
  LEGACY_PROGRESS_KEYS.forEach((key) => safeStorageRemove(key));
  progress = {
    ...defaultProgress,
    areas: { ...defaultProgress.areas },
    conceptMastery: { ...defaultProgress.conceptMastery },
    artifactAttempts: [...defaultProgress.artifactAttempts],
    theoryCompletedLessons: { ...defaultProgress.theoryCompletedLessons },
    theoryAudioByLesson: { ...defaultProgress.theoryAudioByLesson },
    theoryCustomLessons: { ...defaultProgress.theoryCustomLessons },
    theoryLessonRuns: { ...defaultProgress.theoryLessonRuns },
    dailyPracticeLog: { ...defaultProgress.dailyPracticeLog },
    chordMasteryScores: { ...defaultProgress.chordMasteryScores },
    savedLabIdeas: [...defaultProgress.savedLabIdeas],
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
  coachState.threads = [];
  coachState.activeThreadId = "";
  coachState.lessonStack = [];
  coachState.quizSessions = {};
  initializeCoachThreads();
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
  } else if (emergencyToneEngineActive) {
    text = "Audio: resilient fallback tone active while piano samples recover.";
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
  } else if (htmlSampleEngineActive) {
    text = window.location.protocol === "file:"
      ? "Audio: file mode uses compatibility playback. For best tone, run the local server."
      : "Audio: real piano samples active (compatibility mode).";
  } else if (!htmlSampleEngineActive && failed >= total && total > 0) {
    text = `Audio: sample engine failed (${failed}/${total}). Check sample files and reload.`;
  } else if (loaded > 0) {
    text = `Audio: real piano samples ready (${loaded}/${total}).`;
  } else if (loading) {
    text = `Audio: loading piano samples (${loaded}/${total})...`;
  } else {
    text = "Audio: waiting for first interaction to initialize piano samples.";
  }

  const isErrorStatus = !emergencyToneEngineActive
    && !htmlSampleEngineActive
    && failed >= total
    && total > 0;
  const isWarningStatus = (shouldUseRnboPrimaryEngine() && Boolean(rnboEngineFailedReason) && !rnboEngineActive)
    || window.location.protocol === "file:"
    || emergencyToneEngineActive
    || (htmlSampleEngineActive && !htmlEngineForcedByProtocol);
  const isLoadingStatus = loading
    || (isToneEngineAvailable() && toneEngineInitPromise && !toneEngineReady)
    || (shouldUseRnboPrimaryEngine() && rnboLoadPromise && !rnboEngineActive);
  const shouldShowStatus = isErrorStatus || isWarningStatus || isLoadingStatus;

  const visibleText = shouldShowStatus ? text : "";
  if (audioStatusLastRendered === visibleText) return;
  audioStatusLastRendered = visibleText;
  el.audioStatus.textContent = visibleText;
  el.audioStatus.hidden = !shouldShowStatus;
  el.audioStatus.classList.toggle("audio-status-error", isErrorStatus || isWarningStatus);
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
  emergencyToneEngineActive = false;
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
    playEmergencyMidiNotes([midi], { hold: holdSeconds, asChord: true, velocity });
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
  let emergencyFallbackStarted = false;
  preparedVoices.forEach((voice) => {
    void voice.audio.play().catch(() => {
      if (!emergencyFallbackStarted) {
        emergencyFallbackStarted = true;
        playEmergencyMidiNotes(midiNotes, { hold: holdSeconds, asChord: true, velocity });
      }
    });
    scheduleHtmlSampleStop(voice, holdSeconds);
  });
}

function activateEmergencyToneEngine() {
  if (!audioCtx || !audioMaster) return false;
  emergencyToneEngineActive = true;
  sampleEngineReady = true;
  updateAudioStatusText();
  return true;
}

function midiToFrequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

function playEmergencyToneForMidi(midi, startTime, holdSeconds, velocity) {
  if (!audioCtx || !audioMaster) return false;
  try {
    const frequency = midiToFrequency(midi);
    const hold = Math.max(0.18, Math.min(3.2, holdSeconds || 1.2));
    const release = Math.max(0.16, Math.min(0.7, hold * 0.42));
    const peak = Math.max(0.05, Math.min(0.34, (velocity || 0.78) * 0.3));
    const sustain = Math.max(0.018, peak * 0.28);
    const endTime = startTime + hold + release;
    const fundamental = audioCtx.createOscillator();
    const shimmer = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    fundamental.type = "triangle";
    shimmer.type = "sine";
    fundamental.frequency.setValueAtTime(frequency, startTime);
    shimmer.frequency.setValueAtTime(frequency * 2.01, startTime);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(Math.min(5200, Math.max(1400, frequency * 5.5)), startTime);
    filter.Q.setValueAtTime(0.7, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peak, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(sustain, startTime + 0.24);
    gain.gain.setValueAtTime(sustain, startTime + hold);
    gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

    fundamental.connect(filter);
    shimmer.connect(filter);
    filter.connect(gain);
    gain.connect(audioMaster);
    fundamental.start(startTime);
    shimmer.start(startTime);
    fundamental.stop(endTime + 0.02);
    shimmer.stop(endTime + 0.02);
    return true;
  } catch {
    return false;
  }
}

function playEmergencyMidiNotes(midiNotes, options = {}) {
  if (!activateEmergencyToneEngine()) return false;
  const notes = Array.isArray(midiNotes) ? midiNotes.filter((midi) => Number.isFinite(midi)) : [];
  if (notes.length === 0) return true;
  const hold = options.hold || 1.2;
  const asChord = options.asChord !== false;
  const velocity = Math.max(0.05, Math.min(1, options.velocity || 0.78));
  const sequenceSpacing = getSequenceSpacingSeconds(options);
  const schedule = () => {
    const startBase = audioCtx.currentTime + Math.max(0.01, getInteractiveStartLeadTimeSeconds());
    notes.forEach((midi, idx) => {
      const start = asChord ? startBase : startBase + idx * sequenceSpacing;
      playEmergencyToneForMidi(midi, start, hold, velocity);
    });
  };
  if (audioCtx.state === "running") {
    schedule();
    return true;
  }
  void audioCtx.resume().then(schedule).catch(() => {
    if (el.chordDisplay) {
      el.chordDisplay.textContent = "Audio is blocked. Click again to enable sound.";
    }
  });
  return true;
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

document.addEventListener("DOMContentLoaded", () => {
  init();
  initAuth();
  renderBadgeGrid();
  updateMasteryStats();
});
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
      playMidiNotes(midi, { hold: 1, asChord: true, restrictToWindow: false });
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

/* ═══════════════════════════════════════════════════════════════
   METRONOME
   ═══════════════════════════════════════════════════════════════ */
let metronomeIntervalId = null;

function setBpm(newBpm) {
  const numeric = Number(newBpm);
  if (!Number.isFinite(numeric)) {
    if (el.metronomeBpmDisplay) {
      el.metronomeBpmDisplay.value = String(appState.bpm);
    }
    return;
  }
  appState.bpm = Math.max(30, Math.min(240, Math.round(numeric)));
  if (el.metronomeBpmDisplay) {
    el.metronomeBpmDisplay.value = String(appState.bpm);
  }
  // Update pendulum swing speed via CSS custom property
  const metronomeEl = el.metronome;
  if (metronomeEl) {
    metronomeEl.style.setProperty('--swing-duration', `${60 / appState.bpm}s`);
  }
  // If running, restart interval at new tempo
  if (appState.metronomeRunning) {
    stopMetronomeTick();
    startMetronomeTick();
  }
}

function commitMetronomeBpmInput() {
  if (!el.metronomeBpmDisplay) return;
  const typedValue = el.metronomeBpmDisplay.value;
  if (typedValue === "") {
    el.metronomeBpmDisplay.value = String(appState.bpm);
    return;
  }
  setBpm(typedValue);
}

function startMetronome() {
  appState.metronomeRunning = true;
  if (el.metronome) el.metronome.classList.add('is-running');
  if (el.metronomeToggleBtn) {
    el.metronomeToggleBtn.querySelector('.metronome-toggle-icon').textContent = '⏸';
  }
  startMetronomeTick();
}

function stopMetronome() {
  appState.metronomeRunning = false;
  if (el.metronome) el.metronome.classList.remove('is-running');
  if (el.metronomeToggleBtn) {
    el.metronomeToggleBtn.querySelector('.metronome-toggle-icon').textContent = '▶';
  }
  stopMetronomeTick();
}

function startMetronomeTick() {
  stopMetronomeTick();
  const intervalMs = (60 / appState.bpm) * 1000;
  playMetronomeTick();
  metronomeIntervalId = setInterval(playMetronomeTick, intervalMs);
}

function stopMetronomeTick() {
  if (metronomeIntervalId !== null) {
    clearInterval(metronomeIntervalId);
    metronomeIntervalId = null;
  }
}

function playMetronomeTick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  } catch { /* silent fail */ }
}

function initMetronome() {
  if (el.metronome) {
    el.metronome.style.setProperty('--swing-duration', `${60 / appState.bpm}s`);
  }

  if (el.metronomeDecBtn) {
    el.metronomeDecBtn.addEventListener('click', () => setBpm(appState.bpm - 5));
  }
  if (el.metronomeIncBtn) {
    el.metronomeIncBtn.addEventListener('click', () => setBpm(appState.bpm + 5));
  }
  if (el.metronomeToggleBtn) {
    el.metronomeToggleBtn.addEventListener('click', () => {
      appState.metronomeRunning ? stopMetronome() : startMetronome();
    });
  }
  if (el.metronomeBpmDisplay) {
    el.metronomeBpmDisplay.value = String(appState.bpm);
    el.metronomeBpmDisplay.addEventListener('change', commitMetronomeBpmInput);
    el.metronomeBpmDisplay.addEventListener('blur', commitMetronomeBpmInput);
    el.metronomeBpmDisplay.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitMetronomeBpmInput();
        el.metronomeBpmDisplay.blur();
      }
      if (event.key === 'Escape') {
        el.metronomeBpmDisplay.value = String(appState.bpm);
        el.metronomeBpmDisplay.blur();
      }
    });
  }
}

// Wire metronome after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMetronome);
} else {
  // DOM is already loaded, but el might not be set yet — defer
  requestAnimationFrame(initMetronome);
}

/* ═══════════════════════════════════════════
 * ▸ SHEET MUSIC SCANNER MODULE
 * ═══════════════════════════════════════════ */

const scannerState = {
  pdfDoc: null,
  currentPage: 1,
  totalPages: 0,
  abcNotation: "",
  analysis: null,
  synthControl: null,
  isPlaying: false,
  abcjsLoaded: false,
  pdfjsLoaded: false
};

/* — lazy-load pdf.js — */
async function loadPdfJs() {
  if (scannerState.pdfjsLoaded) return;
  await new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      scannerState.pdfjsLoaded = true;
      res();
    };
    s.onerror = rej;
    document.head.appendChild(s);
  });
}

/* — lazy-load abcjs — */
async function loadAbcjs() {
  if (scannerState.abcjsLoaded) return;
  await new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/abcjs@6.4.4/dist/abcjs-basic-min.js";
    s.onload = () => { scannerState.abcjsLoaded = true; res(); };
    s.onerror = rej;
    document.head.appendChild(s);
  });
}

/* — render a PDF page to canvas — */
async function renderPdfPage(pageNum) {
  if (!scannerState.pdfDoc) return;
  const page = await scannerState.pdfDoc.getPage(pageNum);
  const scale = 1.5;
  const viewport = page.getViewport({ scale });
  const canvas = el.scannerCanvas;
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport }).promise;
  el.scannerPageInfo.textContent = `Page ${pageNum} / ${scannerState.totalPages}`;
}

/* — handle uploaded file — */
async function handleScannerFile(file) {
  if (!file) return;

  // Show preview, hide other sections
  el.scannerPreview.hidden = false;
  el.scannerNotation.hidden = true;
  el.scannerAnalysis.hidden = true;
  el.scannerSkills.hidden = true;

  if (file.type === "application/pdf") {
    await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    scannerState.pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    scannerState.totalPages = scannerState.pdfDoc.numPages;
    scannerState.currentPage = 1;
    await renderPdfPage(1);
  } else if (file.type.startsWith("image/")) {
    // Direct image — render to canvas
    const img = new Image();
    img.onload = () => {
      const canvas = el.scannerCanvas;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      scannerState.pdfDoc = null;
      scannerState.totalPages = 1;
      scannerState.currentPage = 1;
      el.scannerPageInfo.textContent = "Image";
    };
    img.src = URL.createObjectURL(file);
  }
}

/* — extract music using Gemini Vision — */
async function extractMusicFromCanvas() {
  el.scannerProcessing.hidden = false;
  el.scannerPreview.hidden = true;

  try {
    const canvas = el.scannerCanvas;
    const imageData = canvas.toDataURL("image/png").split(",")[1]; // base64

    const res = await fetch("/api/scanner/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageData })
    });

    if (!res.ok) {
      // Fallback — generate sample data for demo
      console.warn("Scanner API unavailable, using demo data");
      processScannerResult({
        abc: "X:1\nT:Sample Score\nM:4/4\nL:1/4\nK:C\nC D E F | G A B c | c B A G | F E D C |",
        analysis: {
          key: "C Major",
          time_sig: "4/4",
          tempo: "120",
          difficulty: "Beginner",
          chords: [
            { measure: 1, symbol: "C" },
            { measure: 2, symbol: "G" },
            { measure: 3, symbol: "Am" },
            { measure: 4, symbol: "F" }
          ],
          patterns: ["Stepwise motion", "Scale passage", "I-V-vi-IV progression"],
          hand_analysis: { left: "Root position triads", right: "Scalar melody" }
        }
      });
      return;
    }

    const data = await res.json();
    processScannerResult(data);
  } catch (err) {
    console.error("Scanner extraction error:", err);
    // Fallback demo
    processScannerResult({
      abc: "X:1\nT:Extracted Score\nM:4/4\nL:1/4\nK:C\nC E G c | B A G F | E D C2 |",
      analysis: {
        key: "C Major", time_sig: "4/4", tempo: "100", difficulty: "Beginner",
        chords: [{ measure: 1, symbol: "C" }, { measure: 2, symbol: "G7" }, { measure: 3, symbol: "C" }],
        patterns: ["Arpeggio", "Descending scale"],
        hand_analysis: { left: "Root notes", right: "Arpeggiated melody" }
      }
    });
  } finally {
    el.scannerProcessing.hidden = true;
  }
}

/* — process scanner result — */
async function processScannerResult(data) {
  scannerState.abcNotation = data.abc || "";
  scannerState.analysis = data.analysis || {};

  // Render notation
  await loadAbcjs();
  if (scannerState.abcNotation && el.scoreDisplay) {
    el.scannerNotation.hidden = false;
    window.ABCJS.renderAbc("scoreDisplay", scannerState.abcNotation, {
      responsive: "resize",
      add_classes: true
    });
  }

  // Render theory analysis
  renderScannerAnalysis(scannerState.analysis);

  // Render skill recommendations
  renderScannerSkills(scannerState.analysis);
}

/* — render theory analysis — */
function renderScannerAnalysis(analysis) {
  if (!analysis) return;
  el.scannerAnalysis.hidden = false;

  const setCardValue = (card, value) => {
    if (!card) return;
    const valEl = card.querySelector(".analysis-card-value");
    if (valEl) valEl.textContent = value || "—";
  };

  setCardValue(el.analysisKey, analysis.key);
  setCardValue(el.analysisTime, analysis.time_sig);
  setCardValue(el.analysisTempo, analysis.tempo ? `${analysis.tempo} BPM` : null);
  setCardValue(el.analysisDifficulty, analysis.difficulty);

  // Chord flow
  if (el.analysisChordFlow && Array.isArray(analysis.chords)) {
    el.analysisChordFlow.innerHTML = "";
    analysis.chords.forEach((chord) => {
      const pill = document.createElement("span");
      pill.className = "chord-pill";
      pill.textContent = chord.symbol || chord;
      if (typeof chord === "object" && chord.measure === 1) pill.classList.add("is-tonic");
      el.analysisChordFlow.appendChild(pill);
    });
  }

  // Patterns
  if (el.analysisPatternList && Array.isArray(analysis.patterns)) {
    el.analysisPatternList.innerHTML = "";
    analysis.patterns.forEach((pattern) => {
      const badge = document.createElement("span");
      badge.className = "pattern-badge";
      badge.textContent = pattern;
      el.analysisPatternList.appendChild(badge);
    });
  }
}

/* — match skills to THEORY_CURRICULUM — */
function renderScannerSkills(analysis) {
  if (!analysis || !el.skillTagsContainer) return;
  el.scannerSkills.hidden = false;
  el.skillTagsContainer.innerHTML = "";

  // Build skill matches from detected patterns
  const skillSet = new Set();
  const patterns = analysis.patterns || [];
  const chords = (analysis.chords || []).map(c => typeof c === "object" ? c.symbol : c);

  // Match key-based skills
  if (analysis.key) {
    skillSet.add(`${analysis.key} Scale`);
    skillSet.add(`Key of ${analysis.key}`);
  }

  // Match chord-based skills
  chords.forEach(ch => {
    if (ch) skillSet.add(`${ch} Chord`);
  });

  // Match pattern-based skills
  patterns.forEach(p => {
    skillSet.add(p);
  });

  // Add hand analysis skills
  if (analysis.hand_analysis) {
    if (analysis.hand_analysis.left) skillSet.add(`LH: ${analysis.hand_analysis.left}`);
    if (analysis.hand_analysis.right) skillSet.add(`RH: ${analysis.hand_analysis.right}`);
  }

  skillSet.forEach((skill) => {
    const tag = document.createElement("button");
    tag.type = "button";
    tag.className = "skill-tag";
    tag.textContent = skill;
    tag.addEventListener("click", () => {
      // Switch to theory mode and search for this skill
      const pill = document.querySelector('.mode-pill[data-mode-target="theory"]');
      if (pill) pill.click();
    });
    el.skillTagsContainer.appendChild(tag);
  });
}

/* — scanner playback with abcjs — */
function scannerPlay() {
  if (!scannerState.abcNotation || !window.ABCJS) return;
  const speed = parseFloat(el.scannerSpeedSlider?.value || 1);

  if (scannerState.synthControl) {
    scannerState.synthControl.destroy();
  }

  const visualObj = window.ABCJS.renderAbc("scoreDisplay", scannerState.abcNotation, {
    responsive: "resize",
    add_classes: true
  });

  if (window.ABCJS.synth && window.ABCJS.synth.supportsAudio()) {
    const synth = new window.ABCJS.synth.CreateSynth();
    synth.init({ visualObj: visualObj[0], options: { qpm: Math.round(120 * speed) } })
      .then(() => synth.prime())
      .then(() => {
        synth.start();
        scannerState.isPlaying = true;
        if (el.scannerPlayBtn) el.scannerPlayBtn.textContent = "⏸";
      })
      .catch(err => console.error("abcjs playback error:", err));
    scannerState.synthControl = synth;
  }
}

function scannerStop() {
  if (scannerState.synthControl) {
    try { scannerState.synthControl.stop(); } catch { }
  }
  scannerState.isPlaying = false;
  if (el.scannerPlayBtn) el.scannerPlayBtn.textContent = "▶";
}

/* — scanner event wiring — */
function initScanner() {
  if (!el.scannerUploadZone) return;

  // Click to browse
  el.scannerUploadZone.addEventListener("click", () => el.scannerFileInput?.click());
  el.scannerFileInput?.addEventListener("change", (e) => {
    if (e.target.files?.[0]) handleScannerFile(e.target.files[0]);
  });

  // Drag and drop
  el.scannerUploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    el.scannerUploadZone.classList.add("is-dragover");
  });
  el.scannerUploadZone.addEventListener("dragleave", () => {
    el.scannerUploadZone.classList.remove("is-dragover");
  });
  el.scannerUploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    el.scannerUploadZone.classList.remove("is-dragover");
    if (e.dataTransfer.files?.[0]) handleScannerFile(e.dataTransfer.files[0]);
  });

  // Page nav
  el.scannerPrevPage?.addEventListener("click", async () => {
    if (scannerState.currentPage > 1) {
      scannerState.currentPage--;
      await renderPdfPage(scannerState.currentPage);
    }
  });
  el.scannerNextPage?.addEventListener("click", async () => {
    if (scannerState.currentPage < scannerState.totalPages) {
      scannerState.currentPage++;
      await renderPdfPage(scannerState.currentPage);
    }
  });

  // Extract
  el.scannerExtractBtn?.addEventListener("click", extractMusicFromCanvas);

  // Playback
  el.scannerPlayBtn?.addEventListener("click", () => {
    if (scannerState.isPlaying) scannerStop();
    else scannerPlay();
  });
  el.scannerStopBtn?.addEventListener("click", scannerStop);

  // Speed slider
  el.scannerSpeedSlider?.addEventListener("input", () => {
    const val = parseFloat(el.scannerSpeedSlider.value).toFixed(1);
    if (el.scannerSpeedValue) el.scannerSpeedValue.textContent = `${val}×`;
  });
}

// Initialize scanner when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initScanner);
} else {
  requestAnimationFrame(initScanner);
}


/* — high-fidelity chord decoder study wheel — */
const circleKeys = [
  {
    label: "C",
    scale: ["C", "D", "E", "F", "G", "A", "B"],
    signature: "No sharps or flats"
  },
  {
    label: "G",
    scale: ["G", "A", "B", "C", "D", "E", "F#"],
    signature: "1 sharp: F#"
  },
  {
    label: "D",
    scale: ["D", "E", "F#", "G", "A", "B", "C#"],
    signature: "2 sharps: F#, C#"
  },
  {
    label: "A",
    scale: ["A", "B", "C#", "D", "E", "F#", "G#"],
    signature: "3 sharps: F#, C#, G#"
  },
  {
    label: "E",
    scale: ["E", "F#", "G#", "A", "B", "C#", "D#"],
    signature: "4 sharps: F#, C#, G#, D#"
  },
  {
    label: "B",
    scale: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
    signature: "5 sharps: F#, C#, G#, D#, A#"
  },
  {
    label: "F#",
    displayLabel: "F# / Gb",
    scale: ["F#", "G#", "A#", "B", "C#", "D#", "E#"],
    signature: "6 sharps: F#, C#, G#, D#, A#, E#"
  },
  {
    label: "Db",
    scale: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
    signature: "5 flats: Bb, Eb, Ab, Db, Gb"
  },
  {
    label: "Ab",
    scale: ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
    signature: "4 flats: Bb, Eb, Ab, Db"
  },
  {
    label: "Eb",
    scale: ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
    signature: "3 flats: Bb, Eb, Ab"
  },
  {
    label: "Bb",
    scale: ["Bb", "C", "D", "Eb", "F", "G", "A"],
    signature: "2 flats: Bb, Eb"
  },
  {
    label: "F",
    scale: ["F", "G", "A", "Bb", "C", "D", "E"],
    signature: "1 flat: Bb"
  }
];

const degreeInfo = [
  { roman: "I", index: 0, quality: "major", role: "tonic home", suffix: "" },
  { roman: "ii", index: 1, quality: "minor", role: "pre-dominant color", suffix: "m" },
  { roman: "iii", index: 2, quality: "minor", role: "tonic substitute", suffix: "m" },
  { roman: "IV", index: 3, quality: "major", role: "subdominant lift", suffix: "" },
  { roman: "V", index: 4, quality: "major", role: "dominant pull", suffix: "" },
  { roman: "vi", index: 5, quality: "minor", role: "relative minor", suffix: "m" },
  { roman: "vii°", index: 6, quality: "diminished", role: "leading-tone tension", suffix: "dim" }
];

const windowSlots = [
  { roman: "IV", x: 250, y: 188, r: 51, quick: ["4", "6", "1"], markerX: 213, markerY: 245 },
  { roman: "I", x: 400, y: 122, r: 56, quick: ["1", "3", "5"], markerX: 400, markerY: 198 },
  { roman: "V", x: 550, y: 188, r: 51, quick: ["5", "7", "2"], markerX: 587, markerY: 245 },
  { roman: "vii°", x: 210, y: 420, r: 49, quick: ["7", "2", "4"], markerX: 294, markerY: 458 },
  { roman: "iii", x: 292, y: 644, r: 50, quick: ["3", "5", "7"], markerX: 218, markerY: 622 },
  { roman: "vi", x: 400, y: 702, r: 58, quick: ["6", "1", "3"], markerX: 400, markerY: 642 },
  { roman: "ii", x: 522, y: 644, r: 50, quick: ["2", "4", "6"], markerX: 602, markerY: 622 }
];

const displayOrder = ["IV", "I", "V", "iii", "vii°", "vi", "ii"];

const progressions = [
  { name: "I - V - vi - IV", degrees: ["I", "V", "vi", "IV"] },
  { name: "ii - V - I", degrees: ["ii", "V", "I"] },
  { name: "I - vi - IV - V", degrees: ["I", "vi", "IV", "V"] },
  { name: "vi - IV - I - V", degrees: ["vi", "IV", "I", "V"] }
];

const noteSemitones = {
  C: 0,
  "B#": 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  "E#": 5,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
  Cb: 11
};

const preferredKeyByPitch = {
  C: "C",
  "C#": "Db",
  Db: "Db",
  D: "D",
  "D#": "Eb",
  Eb: "Eb",
  E: "E",
  Fb: "E",
  "E#": "F",
  F: "F",
  "F#": "F#",
  Gb: "F#",
  G: "G",
  "G#": "Ab",
  Ab: "Ab",
  A: "A",
  "A#": "Bb",
  Bb: "Bb",
  B: "B",
  Cb: "B"
};

const svgNS = "http://www.w3.org/2000/svg";
const center = { x: 400, y: 410 };
const snapStep = 30;

const state = {
  keyIndex: 0,
  selectedProgression: progressions[0].name,
  activeDegree: null,
  rotorAngle: 0,
  animationFrame: null,
  timers: [],
  drag: null
};

const elements = {
  activeKey: document.querySelector("#active-key"),
  signature: document.querySelector("#signature"),
  relativeMinor: document.querySelector("#relative-minor"),
  decoderSvg: document.querySelector("#decoder-svg"),
  chordGrid: document.querySelector("#chord-grid"),
  scaleNotes: document.querySelector("#scale-notes"),
  progressionControls: document.querySelector("#progression-controls"),
  progressionOutput: document.querySelector("#progression-output")
};

let rotorContent;

function getCurrentKey() {
  return circleKeys[state.keyIndex];
}

function getDegreeMap(keyData = getCurrentKey()) {
  return degreeInfo.reduce((map, degree) => {
    const triad = getTriad(keyData.scale, degree.index);
    map[degree.roman] = {
      ...degree,
      root: keyData.scale[degree.index],
      triad
    };
    return map;
  }, {});
}

function getTriad(scale, rootIndex) {
  return [
    scale[rootIndex],
    scale[(rootIndex + 2) % 7],
    scale[(rootIndex + 4) % 7]
  ];
}

function formatChordName(chord) {
  if (chord.quality === "major") {
    return `${chord.root} major`;
  }

  if (chord.quality === "minor") {
    return `${chord.root} minor`;
  }

  return `${chord.root} diminished`;
}

function createSvgElement(tag, attributes = {}, text = "") {
  const node = document.createElementNS(svgNS, tag);

  Object.entries(attributes).forEach(([name, value]) => {
    node.setAttribute(name, String(value));
  });

  if (text) {
    node.textContent = text;
  }

  return node;
}

function initControls() {
  progressions.forEach((progression) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "progression-button";
    button.textContent = progression.name;
    button.addEventListener("click", () => {
      state.selectedProgression = progression.name;
      renderReadouts();
      playProgression(progression);
    });
    elements.progressionControls.append(button);
  });
}

function initDecoderSvg() {
  elements.decoderSvg.setAttribute("tabindex", "0");
  elements.decoderSvg.replaceChildren();
  drawDefs();
  drawBasePlate();
  drawRotor();
  drawFaceplateInk();
  bindDragEvents();
  setRotorAngle(0);
}

function drawDefs() {
  const defs = createSvgElement("defs");

  const clipPath = createSvgElement("clipPath", { id: "decoder-window-mask" });
  windowSlots.forEach((slot) => {
    clipPath.append(createSvgElement("circle", { cx: slot.x, cy: slot.y, r: slot.r }));
  });
  clipPath.append(createSvgElement("rect", { x: 326, y: 242, width: 148, height: 56, rx: 10 }));
  clipPath.append(createSvgElement("rect", { x: 315, y: 308, width: 170, height: 30, rx: 7 }));
  defs.append(clipPath);

  const plateGradient = createSvgElement("linearGradient", {
    id: "plate-gradient",
    x1: "0%",
    x2: "100%",
    y1: "0%",
    y2: "100%"
  });
  plateGradient.append(createSvgElement("stop", { offset: "0%", "stop-color": "#ffe65d" }));
  plateGradient.append(createSvgElement("stop", { offset: "55%", "stop-color": "#f2ce22" }));
  plateGradient.append(createSvgElement("stop", { offset: "100%", "stop-color": "#d9af0c" }));
  defs.append(plateGradient);

  const windowGradient = createSvgElement("radialGradient", { id: "window-gradient", cx: "38%", cy: "30%" });
  windowGradient.append(createSvgElement("stop", { offset: "0%", "stop-color": "#384247" }));
  windowGradient.append(createSvgElement("stop", { offset: "100%", "stop-color": "#121719" }));
  defs.append(windowGradient);

  const arrowMarker = createSvgElement("marker", {
    id: "ink-arrow",
    markerWidth: 12,
    markerHeight: 12,
    refX: 10,
    refY: 6,
    orient: "auto",
    markerUnits: "strokeWidth"
  });
  arrowMarker.append(createSvgElement("path", {
    d: "M2 2 L10 6 L2 10",
    fill: "none",
    stroke: "#20282c",
    "stroke-width": 2,
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  }));
  defs.append(arrowMarker);

  elements.decoderSvg.append(defs);
}

function drawBasePlate() {
  const base = createSvgElement("g", { "aria-hidden": "true" });
  base.append(createSvgElement("rect", {
    x: 80,
    y: 42,
    width: 640,
    height: 760,
    rx: 58,
    fill: "url(#plate-gradient)",
    stroke: "#232b2e",
    "stroke-width": 6
  }));
  base.append(createSvgElement("path", {
    d: "M190 68 C260 36 327 70 400 70 C473 70 540 36 610 68",
    fill: "none",
    stroke: "rgba(255,255,255,0.55)",
    "stroke-width": 8,
    "stroke-linecap": "round"
  }));
  base.append(createSvgElement("circle", {
    cx: center.x,
    cy: center.y,
    r: 286,
    fill: "rgba(255,255,255,0.08)",
    stroke: "rgba(36,43,46,0.2)",
    "stroke-width": 2
  }));
  elements.decoderSvg.append(base);
}

function drawRotor() {
  const clipped = createSvgElement("g", { "clip-path": "url(#decoder-window-mask)" });
  rotorContent = createSvgElement("g", { id: "rotor-content" });

  clipped.append(rotorContent);
  elements.decoderSvg.append(clipped);
  renderRotorLabels();
}

function renderRotorLabels() {
  const keyData = getCurrentKey();
  const degreeMap = getDegreeMap(keyData);
  const keyGroup = createSvgElement("g", {
    transform: `rotate(${state.keyIndex * snapStep} ${center.x} ${center.y})`
  });

  windowSlots.forEach((slot) => {
    const chord = degreeMap[slot.roman];
    keyGroup.append(drawRotorChord(slot, chord));
  });

  keyGroup.append(drawRotorSignature(keyData));
  rotorContent.replaceChildren(keyGroup);
}

function drawRotorChord(slot, chord) {
  const group = createSvgElement("g", { transform: `translate(${slot.x} ${slot.y})` });
  const qualityClass = chord.quality === "major" ? "#f15a4e" : chord.quality === "minor" ? "#4ed0b3" : "#9ea8ff";
  const hasSuffix = Boolean(chord.suffix);
  const rootFontSize = chord.root.length > 1 ? (hasSuffix ? 38 : 44) : (hasSuffix ? 48 : 52);

  group.append(createSvgElement("circle", {
    cx: 0,
    cy: 0,
    r: slot.r + 3,
    fill: "url(#window-gradient)"
  }));
  group.append(createSvgElement("circle", {
    cx: 0,
    cy: 0,
    r: slot.r - 6,
    fill: "none",
    stroke: "rgba(255,255,255,0.12)",
    "stroke-width": 2
  }));

  const root = createSvgElement("text", {
    x: 0,
    y: hasSuffix ? 3 : 12,
    "text-anchor": "middle",
    "font-family": "Inter, Arial, sans-serif",
    "font-size": rootFontSize,
    "font-weight": 900,
    fill: "#f8faf3"
  }, chord.root);
  group.append(root);

  if (hasSuffix) {
    group.append(createSvgElement("text", {
      x: 0,
      y: 27,
      "text-anchor": "middle",
      "font-family": "Inter, Arial, sans-serif",
      "font-size": chord.suffix === "dim" ? 15 : 18,
      "font-weight": 900,
      fill: qualityClass
    }, chord.suffix));
  }

  group.append(createSvgElement("text", {
    x: 0,
    y: slot.r - 11,
    "text-anchor": "middle",
    "font-family": "Inter, Arial, sans-serif",
    "font-size": 12,
    "font-weight": 850,
    fill: qualityClass
  }, chord.roman));

  return group;
}

function drawRotorSignature(keyData) {
  const group = createSvgElement("g");
  group.append(createSvgElement("rect", {
    x: 326,
    y: 242,
    width: 148,
    height: 56,
    rx: 10,
    fill: "url(#window-gradient)"
  }));
  group.append(createSvgElement("text", {
    x: 400,
    y: 263,
    "text-anchor": "middle",
    "font-family": "Inter, Arial, sans-serif",
    "font-size": 15,
    "font-weight": 900,
    fill: "#f8faf3"
  }, keyData.displayLabel || keyData.label));
  group.append(createSvgElement("text", {
    x: 400,
    y: 284,
    "text-anchor": "middle",
    "font-family": "Inter, Arial, sans-serif",
    "font-size": 12,
    "font-weight": 780,
    fill: "#f8faf3"
  }, compactSignature(keyData.signature)));

  group.append(createSvgElement("rect", {
    x: 315,
    y: 308,
    width: 170,
    height: 30,
    rx: 7,
    fill: "rgba(18,23,25,0.95)"
  }));
  group.append(createSvgElement("text", {
    x: 400,
    y: 329,
    "text-anchor": "middle",
    "font-family": "Inter, Arial, sans-serif",
    "font-size": 12,
    "font-weight": 800,
    fill: "#f8faf3"
  }, keyData.scale.join(" ")));

  return group;
}

function drawFaceplateInk() {
  const face = createSvgElement("g", { "aria-hidden": "true" });

  face.append(createSvgElement("path", {
    d: "M250 188 C300 132 337 122 400 122 C463 122 500 132 550 188",
    fill: "none",
    stroke: "#222b2e",
    "stroke-width": 3,
    "stroke-linecap": "round"
  }));
  face.append(createSvgElement("path", {
    d: "M210 420 C256 524 302 592 400 702 C464 636 488 604 522 644",
    fill: "none",
    stroke: "#222b2e",
    "stroke-width": 2,
    "stroke-linecap": "round",
    "stroke-dasharray": "6 10"
  }));
  face.append(createSvgElement("line", {
    x1: 176,
    y1: 500,
    x2: 624,
    y2: 500,
    stroke: "#222b2e",
    "stroke-width": 2,
    "stroke-dasharray": "4 12"
  }));
  face.append(createSvgElement("line", {
    x1: 400,
    y1: 348,
    x2: 400,
    y2: 574,
    stroke: "#222b2e",
    "stroke-width": 2,
    "marker-end": ""
  }));

  drawWindowFrames(face);
  drawFaceText(face);
  drawPivot(face);

  elements.decoderSvg.append(face);
}

function drawWindowFrames(face) {
  windowSlots.forEach((slot) => {
    face.append(createSvgElement("circle", {
      cx: slot.x,
      cy: slot.y,
      r: slot.r + 6,
      fill: "none",
      stroke: "rgba(255,255,255,0.42)",
      "stroke-width": 7
    }));
    face.append(createSvgElement("circle", {
      cx: slot.x,
      cy: slot.y,
      r: slot.r + 5,
      fill: "none",
      stroke: "#232b2e",
      "stroke-width": 4
    }));
    drawQuickDots(face, slot);
    face.append(drawWindowHitTarget(slot));
  });

  face.append(createSvgElement("rect", {
    x: 322,
    y: 238,
    width: 156,
    height: 64,
    rx: 13,
    fill: "none",
    stroke: "#232b2e",
    "stroke-width": 4
  }));
  face.append(createSvgElement("rect", {
    x: 311,
    y: 304,
    width: 178,
    height: 38,
    rx: 10,
    fill: "none",
    stroke: "#232b2e",
    "stroke-width": 3
  }));
}

function drawWindowHitTarget(slot) {
  const target = createSvgElement("circle", {
    cx: slot.x,
    cy: slot.y,
    r: slot.r + 10,
    fill: "#ffffff",
    opacity: 0.01,
    class: "decoder-window-hit",
    tabindex: 0,
    role: "button",
    "aria-label": `Make the ${slot.roman} window note the key`
  });

  const activate = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setKeyFromWindowSlot(slot.roman);
  };

  target.addEventListener("pointerdown", activate);
  target.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      activate(event);
    }
  });

  return target;
}

function drawFaceText(face) {
  face.append(faceText("KEY", 400, 222, 15, 900));
  face.append(faceText("Signature", 400, 234, 10, 800));
  face.append(faceText("MAJOR", 492, 433, 30, 900));
  face.append(faceText("chords", 542, 455, 14, 800));
  face.append(faceText("minor", 492, 536, 29, 900));
  face.append(faceText("chords", 542, 557, 14, 800));
  face.append(faceText("relative minor", 400, 617, 13, 800));
  face.append(faceText("Chord", 160, 742, 19, 900));
  face.append(faceText("Decoder", 161, 765, 26, 900));
  face.append(faceText("Study Wheel", 158, 786, 14, 800));
  face.append(createSvgElement("path", {
    d: "M596 722 C588 708 575 696 562 684",
    fill: "none",
    stroke: "rgba(255,255,255,0.62)",
    "stroke-width": 8,
    "stroke-linecap": "round"
  }));
  face.append(createSvgElement("path", {
    d: "M596 722 C588 708 575 696 562 684",
    fill: "none",
    stroke: "#20282c",
    "stroke-width": 3,
    "stroke-linecap": "round",
    "marker-end": "url(#ink-arrow)"
  }));
  face.append(faceText("CUT-OUT WINDOWS", 609, 737, 13, 900));
  face.append(faceText("DRAG TO TURN", 610, 758, 19, 900));

  const labels = [
    ["IV", 250, 111],
    ["I", 400, 52],
    ["V", 550, 111],
    ["vii°", 210, 351],
    ["iii", 292, 578],
    ["vi", 400, 622],
    ["ii", 522, 578]
  ];

  labels.forEach(([text, x, y]) => {
    face.append(faceText(text, x, y, 18, 900));
  });
}

function drawQuickDots(face, slot) {
  const startX = slot.markerX - 22;
  slot.quick.forEach((value, index) => {
    const x = startX + index * 22;
    face.append(createSvgElement("circle", {
      cx: x,
      cy: slot.markerY,
      r: 10,
      fill: "rgba(35,43,46,0.96)"
    }));
    face.append(createSvgElement("text", {
      x,
      y: slot.markerY + 4,
      "text-anchor": "middle",
      "font-family": "Inter, Arial, sans-serif",
      "font-size": 11,
      "font-weight": 900,
      fill: "#f7eaa1"
    }, value));
  });
}

function drawPivot(face) {
  face.append(createSvgElement("circle", {
    cx: center.x,
    cy: center.y,
    r: 18,
    fill: "#d4aa0a",
    stroke: "#232b2e",
    "stroke-width": 4
  }));
  face.append(createSvgElement("circle", {
    cx: center.x,
    cy: center.y,
    r: 6,
    fill: "#232b2e"
  }));
}

function faceText(text, x, y, size, weight) {
  return createSvgElement("text", {
    x,
    y,
    "text-anchor": "middle",
    "font-family": "Inter, Arial, sans-serif",
    "font-size": size,
    "font-weight": weight,
    fill: "#20282c"
  }, text);
}

function bindDragEvents() {
  elements.decoderSvg.addEventListener("pointerdown", (event) => {
    elements.decoderSvg.setPointerCapture(event.pointerId);
    elements.decoderSvg.classList.add("is-dragging");
    cancelAnimation();
    state.drag = {
      startAngle: pointerAngle(event),
      startRotorAngle: state.rotorAngle
    };
  });

  elements.decoderSvg.addEventListener("pointermove", (event) => {
    if (!state.drag) {
      return;
    }

    const delta = pointerAngle(event) - state.drag.startAngle;
    const nextAngle = state.drag.startRotorAngle + delta;
    setRotorAngle(nextAngle);
    const index = angleToIndex(nextAngle);
    if (index !== state.keyIndex) {
      state.keyIndex = index;
      state.activeDegree = null;
      clearTimers();
      renderReadouts();
    }
  });

  elements.decoderSvg.addEventListener("pointerup", () => finishDrag());
  elements.decoderSvg.addEventListener("pointercancel", () => finishDrag());

  elements.decoderSvg.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      setKey((state.keyIndex + 1) % circleKeys.length);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      setKey((state.keyIndex - 1 + circleKeys.length) % circleKeys.length);
    }
  });
}

function finishDrag() {
  if (!state.drag) {
    return;
  }

  elements.decoderSvg.classList.remove("is-dragging");
  state.drag = null;
  const index = angleToIndex(state.rotorAngle);
  setKey(index);
}

function pointerAngle(event) {
  const point = elements.decoderSvg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const svgPoint = point.matrixTransform(elements.decoderSvg.getScreenCTM().inverse());
  return Math.atan2(svgPoint.y - center.y, svgPoint.x - center.x) * (180 / Math.PI);
}

function angleToIndex(angle) {
  return wrapIndex(Math.round(-angle / snapStep));
}

function wrapIndex(index) {
  return ((index % circleKeys.length) + circleKeys.length) % circleKeys.length;
}

function setKey(index) {
  state.keyIndex = wrapIndex(index);
  state.activeDegree = null;
  clearTimers();
  renderReadouts();
  animateRotorTo(-state.keyIndex * snapStep);
}

function setKeyFromWindowSlot(roman) {
  const chord = getDegreeMap()[roman];
  if (!chord?.root) {
    return;
  }

  const index = getKeyIndexForRoot(chord.root);
  if (index >= 0) {
    setKey(index);
  }
}

function getKeyIndexForRoot(root) {
  const preferredLabel = preferredKeyByPitch[root] || root;
  return circleKeys.findIndex((keyData) => keyData.label === preferredLabel);
}

function setRotorAngle(angle) {
  state.rotorAngle = angle;
  rotorContent.setAttribute("transform", `rotate(${angle} ${center.x} ${center.y})`);
}

function animateRotorTo(targetAngle) {
  cancelAnimation();
  const startAngle = state.rotorAngle;
  const adjustedTarget = targetAngle + Math.round((startAngle - targetAngle) / 360) * 360;
  const duration = 260;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    setRotorAngle(startAngle + (adjustedTarget - startAngle) * eased);

    if (progress < 1) {
      state.animationFrame = requestAnimationFrame(tick);
      return;
    }

    state.animationFrame = null;
    setRotorAngle(targetAngle);
  }

  state.animationFrame = requestAnimationFrame(tick);
}

function cancelAnimation() {
  if (state.animationFrame) {
    cancelAnimationFrame(state.animationFrame);
    state.animationFrame = null;
  }
}

function renderReadouts() {
  const keyData = getCurrentKey();
  const degreeMap = getDegreeMap(keyData);

  elements.activeKey.textContent = keyData.displayLabel || keyData.label;
  elements.signature.textContent = keyData.signature;
  elements.relativeMinor.textContent = `${keyData.scale[5]} minor`;
  elements.scaleNotes.textContent = `Scale notes: ${keyData.scale.join("  ")}`;

  renderRotorLabels();
  renderChordGrid(degreeMap);
  renderProgressions(degreeMap);
}

function renderChordGrid(degreeMap) {
  elements.chordGrid.replaceChildren();

  displayOrder.forEach((roman) => {
    const chord = degreeMap[roman];
    const card = document.createElement("article");
    card.className = "chord-card";
    card.dataset.degree = roman;
    card.dataset.quality = chord.quality;
    card.classList.toggle("is-active", state.activeDegree === roman);

    const degree = document.createElement("div");
    degree.className = "degree";
    degree.textContent = roman;

    const name = document.createElement("div");
    name.className = "chord-name";
    name.textContent = formatChordName(chord);

    const triad = document.createElement("p");
    triad.className = "chord-meta";
    triad.textContent = `Triad: ${chord.triad.join(" - ")}`;

    const role = document.createElement("p");
    role.className = "chord-meta";
    role.textContent = chord.role;

    card.append(degree, name, triad, role);
    elements.chordGrid.append(card);
  });
}

function renderProgressions(degreeMap) {
  const selected = progressions.find((item) => item.name === state.selectedProgression) || progressions[0];

  [...elements.progressionControls.querySelectorAll(".progression-button")].forEach((button) => {
    button.classList.toggle("is-selected", button.textContent === selected.name);
  });

  elements.progressionOutput.replaceChildren();
  selected.degrees.forEach((roman) => {
    const chord = degreeMap[roman];
    const pill = document.createElement("span");
    pill.className = "progression-pill";
    pill.textContent = `${roman}: ${formatChordName(chord)}`;
    elements.progressionOutput.append(pill);
  });
}

function playProgression(progression) {
  clearTimers();

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = AudioContext ? new AudioContext() : null;
  const degreeMap = getDegreeMap();

  progression.degrees.forEach((roman, index) => {
    const timer = window.setTimeout(() => {
      state.activeDegree = roman;
      renderChordGrid(degreeMap);

      if (audioContext) {
        playChord(audioContext, degreeMap[roman].triad, index * 0.02);
      }
    }, index * 620);
    state.timers.push(timer);
  });

  const resetTimer = window.setTimeout(() => {
    state.activeDegree = null;
    renderChordGrid(degreeMap);
    if (audioContext) {
      audioContext.close();
    }
  }, progression.degrees.length * 620 + 250);
  state.timers.push(resetTimer);
}

function playChord(audioContext, notes, offset) {
  const now = audioContext.currentTime + offset;
  notes.forEach((note, voiceIndex) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = noteToFrequency(note, voiceIndex);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.55);
  });
}

function noteToFrequency(note, voiceIndex) {
  const semitone = noteSemitones[note] ?? 0;
  const midi = 60 + semitone + voiceIndex * 12;
  return 440 * 2 ** ((midi - 69) / 12);
}

function clearTimers() {
  state.timers.forEach((timer) => window.clearTimeout(timer));
  state.timers = [];
}

function compactSignature(signature) {
  return signature
    .replace("No sharps or flats", "0 sharps / flats")
    .replace("sharps:", "#:")
    .replace("sharp:", "#:")
    .replace("flats:", "b:")
    .replace("flat:", "b:");
}

initControls();
initDecoderSvg();
renderReadouts();
