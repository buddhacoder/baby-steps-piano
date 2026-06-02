/* ═══════════════════════════════════════════
 * THEORY CURRICULUM — 72 lessons
 * 8 skill categories × 4 tiers + 3 genre tracks
 * ═══════════════════════════════════════════ */

const THEORY_CURRICULUM = {

    /* ── 1. Foundations ── */
    foundations: {
        title: "Foundations",
        icon: "🏗️",
        description: "The building blocks of reading and understanding music.",
        lessons: [
            {
                id: "foundations:keyboard-layout",
                tier: 1, title: "Keyboard Geography",
                desc: "White keys, black keys, octaves, and middle C orientation.",
                prerequisites: [],
                abc: "X:1\nT:Middle C Position\nM:4/4\nL:1/4\nK:C\nC D E F | G A B c |",
                resources: [
                    { label: "Musictheory.net — Keyboard", url: "https://www.musictheory.net/lessons/10" }
                ],
                tags: ["keyboard", "beginner", "orientation"]
            },
            {
                id: "foundations:staff-reading",
                tier: 1, title: "The Grand Staff",
                desc: "Treble clef, bass clef, ledger lines, and note placement.",
                prerequisites: ["foundations:keyboard-layout"],
                abc: "X:1\nT:Staff Notes\nM:4/4\nL:1/4\nK:C\nC, D, E, F, | G, A, B, C |",
                resources: [
                    { label: "Musictheory.net — Staff", url: "https://www.musictheory.net/lessons/10" }
                ],
                tags: ["staff", "clef", "reading", "beginner"]
            },
            {
                id: "foundations:note-values",
                tier: 1, title: "Note Values & Rests",
                desc: "Whole → sixteenth notes, dotted notes, ties, and rests.",
                prerequisites: ["foundations:staff-reading"],
                abc: "X:1\nT:Note Values\nM:4/4\nL:1/16\nK:C\nC4 C4 C4 C4 | C8 C8 | C16 |",
                resources: [
                    { label: "Musictheory.net — Rhythm", url: "https://www.musictheory.net/lessons/12" }
                ],
                tags: ["rhythm", "notes", "rests", "beginner"]
            },
            {
                id: "foundations:intervals",
                tier: 2, title: "Intervals",
                desc: "2nds through octaves. Quality: major, minor, perfect, augmented, diminished.",
                prerequisites: ["foundations:keyboard-layout"],
                abc: "X:1\nT:Common Intervals\nM:4/4\nL:1/2\nK:C\n[CE] [CF] | [CG] [Cc] |",
                resources: [
                    { label: "Musictheory.net — Intervals", url: "https://www.musictheory.net/lessons/31" }
                ],
                tags: ["intervals", "distance", "quality"]
            },
            {
                id: "foundations:key-signatures",
                tier: 2, title: "Key Signatures",
                desc: "Sharps, flats, and memorization tricks for all 15 keys.",
                prerequisites: ["foundations:staff-reading"],
                resources: [
                    { label: "Musictheory.net — Key Signatures", url: "https://www.musictheory.net/lessons/25" }
                ],
                tags: ["keys", "sharps", "flats", "signatures"]
            },
            {
                id: "foundations:circle-of-fifths",
                tier: 3, title: "Circle of Fifths Deep Dive",
                desc: "Key relationships, relative majors/minors, and modulation paths.",
                prerequisites: ["foundations:key-signatures"],
                resources: [
                    { label: "Circle of Fifths Interactive", url: "https://www.musictheory.net/calculators/circle" }
                ],
                tags: ["circle", "fifths", "modulation", "relationships"]
            },
            {
                id: "foundations:transposition",
                tier: 3, title: "Transposition",
                desc: "Moving pieces between keys while preserving intervals.",
                prerequisites: ["foundations:intervals", "foundations:key-signatures"],
                resources: [
                    { label: "Teoria — Transposition", url: "https://www.teoria.com/" }
                ],
                tags: ["transposition", "keys", "moving"]
            }
        ]
    },

    /* ── 2. Scales & Modes ── */
    scales: {
        title: "Scales & Modes",
        icon: "🎹",
        description: "The raw material of melody — from major to exotic.",
        lessons: [
            {
                id: "scales:major",
                tier: 1, title: "Major Scales",
                desc: "C, G, D, F — the whole/half step pattern (W-W-H-W-W-W-H).",
                prerequisites: ["foundations:keyboard-layout"],
                abc: "X:1\nT:C Major Scale\nM:4/4\nL:1/4\nK:C\nC D E F | G A B c |",
                resources: [
                    { label: "Pianote — Major Scales", url: "https://www.pianote.com/blog/piano-scales/" }
                ],
                tags: ["scale", "major", "beginner", "pattern"]
            },
            {
                id: "scales:minor-natural",
                tier: 1, title: "Natural Minor",
                desc: "A minor and the relative minor concept. W-H-W-W-H-W-W.",
                prerequisites: ["scales:major"],
                abc: "X:1\nT:A Natural Minor\nM:4/4\nL:1/4\nK:Am\nA B c d | e f g a |",
                resources: [
                    { label: "Musictheory.net — Minor", url: "https://www.musictheory.net/lessons/22" }
                ],
                tags: ["scale", "minor", "natural", "relative"]
            },
            {
                id: "scales:minor-harmonic",
                tier: 2, title: "Harmonic Minor",
                desc: "Raised 7th degree — the \"exotic\" sound. Creates a dominant V chord.",
                prerequisites: ["scales:minor-natural"],
                abc: "X:1\nT:A Harmonic Minor\nM:4/4\nL:1/4\nK:Am\nA B c d | e f ^g a |",
                resources: [
                    { label: "Pianote — Harmonic Minor", url: "https://www.pianote.com/blog/harmonic-minor-scale/" }
                ],
                tags: ["scale", "minor", "harmonic", "raised-seventh"]
            },
            {
                id: "scales:minor-melodic",
                tier: 2, title: "Melodic Minor",
                desc: "Raised 6th and 7th ascending, natural descending. Jazz staple.",
                prerequisites: ["scales:minor-harmonic"],
                abc: "X:1\nT:A Melodic Minor\nM:4/4\nL:1/4\nK:Am\nA B c d | e ^f ^g a | g f e d | c B A2 |",
                resources: [
                    { label: "Jazz Tutorial — Melodic Minor", url: "https://www.thejazzpianosite.com/jazz-piano-lessons/jazz-scales/melodic-minor-scale/" }
                ],
                tags: ["scale", "minor", "melodic", "jazz"]
            },
            {
                id: "scales:pentatonic",
                tier: 2, title: "Pentatonic Scales",
                desc: "5-note scales — major and minor pentatonic. Blues and pop foundation.",
                prerequisites: ["scales:major"],
                abc: "X:1\nT:C Major Pentatonic\nM:4/4\nL:1/4\nK:C\nC D E G | A c2 z |",
                resources: [
                    { label: "Pianote — Pentatonic", url: "https://www.pianote.com/blog/pentatonic-scale-piano/" }
                ],
                tags: ["scale", "pentatonic", "blues", "pop"]
            },
            {
                id: "scales:chromatic",
                tier: 2, title: "Chromatic Scale",
                desc: "All 12 notes in order. Fingering patterns and exercises.",
                prerequisites: ["foundations:keyboard-layout"],
                abc: "X:1\nT:Chromatic Scale\nM:4/4\nL:1/8\nK:C\nC ^C D ^D E F | ^F G ^G A ^A B | c2 z2 z4 |",
                resources: [],
                tags: ["scale", "chromatic", "all-notes"]
            },
            {
                id: "scales:modes",
                tier: 3, title: "The 7 Modes",
                desc: "Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian — same notes, different feels.",
                prerequisites: ["scales:major", "foundations:intervals"],
                abc: "X:1\nT:D Dorian\nM:4/4\nL:1/4\nK:C\nD E F G | A B c d |",
                resources: [
                    { label: "The Jazz Piano Site — Modes", url: "https://www.thejazzpianosite.com/jazz-piano-lessons/jazz-scales/modes/" }
                ],
                tags: ["modes", "dorian", "lydian", "mixolydian", "phrygian"]
            },
            {
                id: "scales:blues",
                tier: 3, title: "Blues Scale",
                desc: "Minor pentatonic + ♭5. The soul of blues and rock piano.",
                prerequisites: ["scales:pentatonic"],
                abc: "X:1\nT:C Blues Scale\nM:4/4\nL:1/4\nK:C\nC _E F _G | G _B c2 |",
                resources: [
                    { label: "Pianote — Blues Scale", url: "https://www.pianote.com/blog/blues-scale-piano/" }
                ],
                tags: ["scale", "blues", "flat-five", "soul"]
            },
            {
                id: "scales:bebop",
                tier: 4, title: "Bebop Scales",
                desc: "Adding passing tones so chord tones land on strong beats. Jazz lines.",
                prerequisites: ["scales:modes", "chords:seventh"],
                abc: "X:1\nT:C Bebop Dominant\nM:4/4\nL:1/8\nK:C\nC D E F G A _B B | c2 z6 |",
                resources: [
                    { label: "Jazz Tutorial — Bebop", url: "https://www.thejazzpianosite.com/jazz-piano-lessons/jazz-scales/the-bebop-scale/" }
                ],
                tags: ["scale", "bebop", "jazz", "passing-tones"]
            },
            {
                id: "scales:whole-tone",
                tier: 4, title: "Whole Tone & Diminished",
                desc: "Symmetric scales for color and tension. Debussy to Coltrane.",
                prerequisites: ["scales:modes"],
                abc: "X:1\nT:C Whole Tone\nM:4/4\nL:1/4\nK:C\nC D E ^F | ^G ^A c2 |",
                resources: [],
                tags: ["scale", "whole-tone", "diminished", "symmetric"]
            }
        ]
    },

    /* ── 3. Chords & Voicings ── */
    chords: {
        title: "Chords & Voicings",
        icon: "🎶",
        description: "From simple triads to dense jazz voicings.",
        lessons: [
            {
                id: "chords:major-minor-triads",
                tier: 1, title: "Major & Minor Triads",
                desc: "Root position triads built from scales. The harmonic foundation.",
                prerequisites: ["foundations:intervals"],
                abc: "X:1\nT:C Major & A Minor Triads\nM:4/4\nL:1/2\nK:C\n[CEG] [CEG] | [ACE] [ACE] |",
                resources: [
                    { label: "Musictheory.net — Triads", url: "https://www.musictheory.net/lessons/40" }
                ],
                tags: ["chord", "triad", "major", "minor", "beginner"]
            },
            {
                id: "chords:power-chords",
                tier: 1, title: "Fifth Chords (Power Chords)",
                desc: "Root + 5th — no 3rd. Common in pop, rock, and EDM.",
                prerequisites: ["foundations:intervals"],
                abc: "X:1\nT:Power Chords\nM:4/4\nL:1/2\nK:C\n[CG] [DG] | [EA] [FB] |",
                resources: [],
                tags: ["chord", "power", "fifth", "pop", "rock"]
            },
            {
                id: "chords:inversions",
                tier: 2, title: "Chord Inversions",
                desc: "Root, 1st, 2nd inversion — smooth voice leading between chords.",
                prerequisites: ["chords:major-minor-triads"],
                abc: "X:1\nT:C Major Inversions\nM:4/4\nL:1/2\nK:C\n[CEG] [EGc] | [Gce] [ceg] |",
                resources: [
                    { label: "Musictheory.net — Inversions", url: "https://www.musictheory.net/lessons/42" }
                ],
                tags: ["chord", "inversion", "voice-leading"]
            },
            {
                id: "chords:seventh",
                tier: 2, title: "Seventh Chords",
                desc: "Maj7, min7, dom7, dim7, half-dim7 — the four-note family.",
                prerequisites: ["chords:major-minor-triads"],
                abc: "X:1\nT:Seventh Chord Types\nM:4/4\nL:1/2\nK:C\n[CEGB] [CEG_B] | [C_EG_B] [C_E_G_B] |",
                resources: [
                    { label: "Pianote — 7th Chords", url: "https://www.pianote.com/blog/seventh-chords/" }
                ],
                tags: ["chord", "seventh", "maj7", "min7", "dom7"]
            },
            {
                id: "chords:sus-add",
                tier: 2, title: "Sus & Add Chords",
                desc: "Sus2, sus4, add9 — adding color without changing function. Pop staple.",
                prerequisites: ["chords:major-minor-triads"],
                abc: "X:1\nT:Sus & Add\nM:4/4\nL:1/2\nK:C\n[CDG] [CFG] | [CEGD] z |",
                resources: [
                    { label: "Pianote — Pop Voicings", url: "https://www.pianote.com/blog/pop-piano-chords/" }
                ],
                tags: ["chord", "sus", "add", "pop", "color"]
            },
            {
                id: "chords:extended",
                tier: 3, title: "Extended Chords",
                desc: "9ths, 11ths, 13ths — stacking 3rds beyond the 7th.",
                prerequisites: ["chords:seventh"],
                abc: "X:1\nT:C9 Chord\nM:4/4\nL:1\nK:C\n[CEG_BD] |",
                resources: [
                    { label: "Jazz Piano Site — Extensions", url: "https://www.thejazzpianosite.com/jazz-piano-lessons/jazz-chords/extensions/" }
                ],
                tags: ["chord", "extended", "ninth", "eleventh", "thirteenth"]
            },
            {
                id: "chords:altered",
                tier: 3, title: "Altered Dominants",
                desc: "♭9, ♯9, ♯11, ♭13 — maximum tension before resolution.",
                prerequisites: ["chords:extended"],
                abc: "X:1\nT:G7alt\nM:4/4\nL:1\nK:C\n[GB_d^f_a] |",
                resources: [],
                tags: ["chord", "altered", "dominant", "tension"]
            },
            {
                id: "chords:shell-voicings",
                tier: 3, title: "Shell Voicings",
                desc: "3rd + 7th only — the bare minimum to sound like jazz. Less is more.",
                prerequisites: ["chords:seventh"],
                abc: "X:1\nT:ii-V-I Shells\nM:4/4\nL:1/2\nK:C\n[DF_B] [B,F] | [CE_B] z |",
                resources: [
                    { label: "Open Studio — Shells", url: "https://www.youtube.com/watch?v=KzdbNfkfqT0" }
                ],
                tags: ["chord", "shell", "jazz", "voicing", "minimal"]
            },
            {
                id: "chords:rootless",
                tier: 4, title: "Rootless Voicings",
                desc: "Bill Evans style — let the bass handle the root. Rich left-hand comping.",
                prerequisites: ["chords:shell-voicings", "chords:extended"],
                resources: [
                    { label: "The Jazz Piano Site — Rootless", url: "https://www.thejazzpianosite.com/jazz-piano-lessons/jazz-chord-voicings/rootless-voicings/" }
                ],
                tags: ["chord", "rootless", "evans", "jazz", "comping"]
            },
            {
                id: "chords:upper-structures",
                tier: 4, title: "Upper Structure Triads",
                desc: "Polychords — stack a simple triad over a dominant 7th for dense color.",
                prerequisites: ["chords:rootless", "chords:altered"],
                resources: [
                    { label: "Berklee Online — Jazz", url: "https://online.berklee.edu/courses/interest/jazz" }
                ],
                tags: ["chord", "upper-structure", "polychord", "jazz", "dense"]
            }
        ]
    },

    /* ── 4. Progressions & Harmony ── */
    progressions: {
        title: "Progressions & Harmony",
        icon: "🔄",
        description: "How chords move — from pop anthems to Giant Steps.",
        lessons: [
            {
                id: "progressions:i-iv-v",
                tier: 1, title: "I-IV-V",
                desc: "The 3-chord foundation of rock, blues, country, and folk.",
                prerequisites: ["chords:major-minor-triads"],
                abc: "X:1\nT:I-IV-V in C\nM:4/4\nL:1/2\nK:C\n[CEG] [FAc] | [GBd] [CEG] |",
                resources: [
                    { label: "Hooktheory", url: "https://www.hooktheory.com/theorytab" }
                ],
                tags: ["progression", "three-chord", "foundation", "rock"]
            },
            {
                id: "progressions:i-v-vi-iv",
                tier: 1, title: "I-V-vi-IV",
                desc: "The pop anthem progression. Axis of Awesome's 4 chords.",
                prerequisites: ["chords:major-minor-triads"],
                abc: "X:1\nT:I-V-vi-IV in C\nM:4/4\nL:1/2\nK:C\n[CEG] [GBd] | [Ace] [FAc] |",
                resources: [
                    { label: "Axis of Awesome — 4 Chords", url: "https://www.youtube.com/watch?v=5pidokakU4I" },
                    { label: "Hooktheory — Pop Analysis", url: "https://www.hooktheory.com/theorytab" }
                ],
                tags: ["progression", "pop", "four-chords", "anthem"]
            },
            {
                id: "progressions:ii-v-i",
                tier: 2, title: "ii-V-I",
                desc: "The jazz backbone. Most common progression in jazz standards.",
                prerequisites: ["chords:seventh"],
                abc: "X:1\nT:ii-V-I in C\nM:4/4\nL:1/2\nK:C\n[DFAc] [GBdF] | [CEGBc] z |",
                resources: [
                    { label: "Jazz Piano Site — ii-V-I", url: "https://www.thejazzpianosite.com/jazz-piano-lessons/jazz-chord-progressions/ii-v-i/" }
                ],
                tags: ["progression", "jazz", "ii-V-I", "backbone"]
            },
            {
                id: "progressions:cadences",
                tier: 2, title: "Cadences",
                desc: "Authentic, plagal, half, and deceptive — musical punctuation.",
                prerequisites: ["progressions:i-iv-v"],
                resources: [
                    { label: "Musictheory.net — Cadences", url: "https://www.musictheory.net/lessons/55" }
                ],
                tags: ["cadence", "authentic", "plagal", "deceptive", "resolution"]
            },
            {
                id: "progressions:secondary-dominants",
                tier: 2, title: "Secondary Dominants",
                desc: "V/V, V/ii — borrowing dominant tension to tonicize other chords.",
                prerequisites: ["progressions:cadences", "chords:seventh"],
                resources: [
                    { label: "Musictheory.net — Secondary", url: "https://www.musictheory.net/lessons/57" }
                ],
                tags: ["progression", "secondary", "dominant", "tonicize"]
            },
            {
                id: "progressions:modal-interchange",
                tier: 3, title: "Modal Interchange",
                desc: "Borrowing chords from parallel keys — ♭VII, ♭III, iv in major.",
                prerequisites: ["scales:modes", "foundations:key-signatures"],
                resources: [],
                tags: ["progression", "modal", "interchange", "borrowed", "parallel"]
            },
            {
                id: "progressions:tritone-sub",
                tier: 3, title: "Tritone Substitution",
                desc: "♭II7 replaces V7 — smooth chromatic bass motion to the tonic.",
                prerequisites: ["progressions:ii-v-i", "chords:seventh"],
                resources: [
                    { label: "Jazz Piano Site — Tritone Sub", url: "https://www.thejazzpianosite.com/jazz-piano-lessons/jazz-chord-progressions/tritone-substitution/" }
                ],
                tags: ["progression", "tritone", "substitution", "jazz", "chromatic"]
            },
            {
                id: "progressions:turnarounds",
                tier: 3, title: "Jazz Turnarounds",
                desc: "I-vi-ii-V and variations — cycling back to the top of the form.",
                prerequisites: ["progressions:ii-v-i"],
                resources: [
                    { label: "Jazz Piano Site — Turnarounds", url: "https://www.thejazzpianosite.com/jazz-piano-lessons/jazz-chord-progressions/turnarounds/" }
                ],
                tags: ["progression", "turnaround", "jazz", "cycling"]
            },
            {
                id: "progressions:coltrane-changes",
                tier: 4, title: "Coltrane Changes",
                desc: "Giant Steps — multi-tonic systems and thirds-based motion.",
                prerequisites: ["progressions:tritone-sub", "scales:modes"],
                resources: [
                    { label: "Giant Steps Analysis", url: "https://www.thejazzpianosite.com/jazz-piano-lessons/jazz-chord-progressions/coltrane-changes/" }
                ],
                tags: ["progression", "coltrane", "giant-steps", "multi-tonic"]
            },
            {
                id: "progressions:neo-soul",
                tier: 4, title: "Neo-Soul Harmony",
                desc: "Gospel passing chords, ♯iv, chromatic mediants, erykah-badu-core.",
                prerequisites: ["chords:extended", "progressions:secondary-dominants"],
                resources: [
                    { label: "Jeff Schneider — Neo Soul", url: "https://www.youtube.com/c/JeffSchneiderMusic" }
                ],
                tags: ["progression", "neo-soul", "gospel", "chromatic", "r&b"]
            }
        ]
    },

    /* ── 5. Rhythm & Time ── */
    rhythm: {
        title: "Rhythm & Time",
        icon: "🥁",
        description: "Feel, groove, and the mathematics of time.",
        lessons: [
            {
                id: "rhythm:time-signatures",
                tier: 1, title: "Time Signatures",
                desc: "4/4, 3/4, 2/4 — counting beats and understanding the pulse.",
                prerequisites: ["foundations:note-values"],
                resources: [
                    { label: "Musictheory.net — Time Sig", url: "https://www.musictheory.net/lessons/13" }
                ],
                tags: ["rhythm", "time-signature", "beats", "pulse"]
            },
            {
                id: "rhythm:subdivisions",
                tier: 1, title: "Subdivisions",
                desc: "Eighth notes, sixteenths, triplets — dividing the beat.",
                prerequisites: ["rhythm:time-signatures"],
                resources: [],
                tags: ["rhythm", "subdivision", "eighth", "sixteenth", "triplet"]
            },
            {
                id: "rhythm:syncopation",
                tier: 2, title: "Syncopation",
                desc: "Off-beat accents and anticipation. The groove secret.",
                prerequisites: ["rhythm:subdivisions"],
                resources: [
                    { label: "Pianote — Syncopation", url: "https://www.pianote.com/blog/syncopation/" }
                ],
                tags: ["rhythm", "syncopation", "offbeat", "groove"]
            },
            {
                id: "rhythm:swing",
                tier: 2, title: "Swing Feel",
                desc: "Triplet-based groove — straight vs swing eighth notes.",
                prerequisites: ["rhythm:subdivisions"],
                resources: [
                    { label: "Jazz Piano Site — Swing", url: "https://www.thejazzpianosite.com/jazz-piano-lessons/jazz-fundamentals/swing-feel/" }
                ],
                tags: ["rhythm", "swing", "triplet", "jazz", "feel"]
            },
            {
                id: "rhythm:odd-meters",
                tier: 3, title: "Odd Time Signatures",
                desc: "5/4, 7/8, mixed meter — Take Five territory.",
                prerequisites: ["rhythm:syncopation"],
                resources: [],
                tags: ["rhythm", "odd", "five-four", "seven-eight", "mixed"]
            },
            {
                id: "rhythm:polyrhythm",
                tier: 3, title: "Polyrhythms",
                desc: "3 against 2, 4 against 3 — independent layers of pulse.",
                prerequisites: ["rhythm:syncopation"],
                resources: [],
                tags: ["rhythm", "polyrhythm", "three-two", "cross-rhythm"]
            },
            {
                id: "rhythm:metric-modulation",
                tier: 4, title: "Metric Modulation",
                desc: "Tempo pivots via rhythmic ratios — advanced temporal architecture.",
                prerequisites: ["rhythm:polyrhythm", "rhythm:odd-meters"],
                resources: [],
                tags: ["rhythm", "modulation", "tempo", "advanced"]
            }
        ]
    },

    /* ── 6. Technique ── */
    technique: {
        title: "Technique",
        icon: "🤲",
        description: "The physical craft — fingers, hands, wrists, and arms.",
        lessons: [
            {
                id: "technique:hand-position",
                tier: 1, title: "Hand Position & Posture",
                desc: "Curved fingers, relaxed wrist, bench height, and arm weight.",
                prerequisites: [],
                resources: [],
                tags: ["technique", "posture", "hand", "position", "beginner"]
            },
            {
                id: "technique:fingering",
                tier: 1, title: "Fingering Patterns",
                desc: "Scale fingering, thumb crossings, and economy of motion.",
                prerequisites: ["technique:hand-position"],
                resources: [],
                tags: ["technique", "fingering", "thumb", "crossing"]
            },
            {
                id: "technique:arpeggios",
                tier: 2, title: "Arpeggios",
                desc: "Broken chords across the keyboard — speed and fluency builder.",
                prerequisites: ["chords:inversions", "technique:fingering"],
                abc: "X:1\nT:C Major Arpeggio\nM:4/4\nL:1/8\nK:C\nC E G c G E C2 |",
                resources: [],
                tags: ["technique", "arpeggio", "broken-chord", "fluency"]
            },
            {
                id: "technique:dynamics",
                tier: 2, title: "Dynamics & Expression",
                desc: "Piano → forte, crescendo, decrescendo, accents, and musical phrasing.",
                prerequisites: ["technique:hand-position"],
                resources: [],
                tags: ["technique", "dynamics", "expression", "piano", "forte"]
            },
            {
                id: "technique:pedaling",
                tier: 2, title: "Pedal Technique",
                desc: "Sustain pedal, legato pedaling, half-pedal, and una corda.",
                prerequisites: ["technique:hand-position"],
                resources: [],
                tags: ["technique", "pedal", "sustain", "legato"]
            },
            {
                id: "technique:hand-independence",
                tier: 3, title: "Hand Independence",
                desc: "Left hand does one thing, right hand another. Counterpoint in action.",
                prerequisites: ["technique:fingering", "rhythm:subdivisions"],
                resources: [],
                tags: ["technique", "independence", "hands", "counterpoint"]
            },
            {
                id: "technique:sight-reading",
                tier: 3, title: "Sight Reading",
                desc: "First-time reading strategies — look ahead, recognize patterns.",
                prerequisites: ["foundations:staff-reading", "foundations:key-signatures"],
                resources: [],
                tags: ["technique", "sight-reading", "reading", "patterns"]
            },
            {
                id: "technique:velocity-control",
                tier: 4, title: "Velocity & Touch Control",
                desc: "Dynamic layering, voicing inner melodies, tonal shading.",
                prerequisites: ["technique:dynamics", "technique:hand-independence"],
                resources: [],
                tags: ["technique", "velocity", "touch", "voicing", "shading"]
            }
        ]
    },

    /* ── 7. Ear Training ── */
    ear: {
        title: "Ear Training",
        icon: "👂",
        description: "Hear it before you play it — the musician's superpower.",
        lessons: [
            {
                id: "ear:pitch-matching",
                tier: 1, title: "Pitch Matching",
                desc: "Hear a note, find it on the keyboard. The starting point.",
                prerequisites: ["foundations:keyboard-layout"],
                resources: [
                    { label: "ToneSavvy — Ear Training", url: "https://tonesavvy.com/" }
                ],
                tags: ["ear", "pitch", "matching", "beginner"]
            },
            {
                id: "ear:interval-recognition",
                tier: 2, title: "Interval Recognition",
                desc: "Hear two notes — name the interval. Song-based mnemonics.",
                prerequisites: ["foundations:intervals", "ear:pitch-matching"],
                resources: [
                    { label: "Teoria — Interval Ear", url: "https://www.teoria.com/en/exercises/ie.php" }
                ],
                tags: ["ear", "interval", "recognition", "mnemonics"]
            },
            {
                id: "ear:chord-quality",
                tier: 2, title: "Chord Quality by Ear",
                desc: "Major vs minor vs diminished vs augmented — by sound alone.",
                prerequisites: ["chords:major-minor-triads", "ear:pitch-matching"],
                resources: [
                    { label: "Teoria — Chord Ear", url: "https://www.teoria.com/en/exercises/ce.php" }
                ],
                tags: ["ear", "chord", "quality", "major", "minor"]
            },
            {
                id: "ear:progression-recognition",
                tier: 3, title: "Progression Recognition",
                desc: "Hear a 4-bar loop — identify the chord changes.",
                prerequisites: ["ear:chord-quality", "progressions:i-v-vi-iv"],
                resources: [],
                tags: ["ear", "progression", "recognition", "loop"]
            },
            {
                id: "ear:transcription",
                tier: 4, title: "Transcription",
                desc: "Lift melodies and chords from recordings. The ultimate ear skill.",
                prerequisites: ["ear:progression-recognition", "technique:sight-reading"],
                resources: [],
                tags: ["ear", "transcription", "lift", "recording"]
            }
        ]
    },

    /* ── 8. Composition & Creativity ── */
    compose: {
        title: "Composition & Creativity",
        icon: "✍️",
        description: "Make your own music — from melodies to full arrangements.",
        lessons: [
            {
                id: "compose:melody-writing",
                tier: 1, title: "Melody Writing",
                desc: "Question/answer phrases, stepwise motion, and target notes.",
                prerequisites: ["scales:major"],
                resources: [],
                tags: ["compose", "melody", "phrase", "writing"]
            },
            {
                id: "compose:harmonization",
                tier: 2, title: "Harmonization",
                desc: "Adding chords to a melody — which chords fit which notes?",
                prerequisites: ["chords:major-minor-triads", "progressions:i-iv-v"],
                resources: [],
                tags: ["compose", "harmonization", "chords", "melody"]
            },
            {
                id: "compose:song-form",
                tier: 2, title: "Song Form",
                desc: "Verse / chorus / bridge, AABA, 12-bar blues — structural blueprints.",
                prerequisites: ["progressions:i-v-vi-iv"],
                resources: [],
                tags: ["compose", "form", "verse", "chorus", "bridge", "blues"]
            },
            {
                id: "compose:reharmonization",
                tier: 3, title: "Reharmonization",
                desc: "Same melody, different chords underneath — transforming the feel.",
                prerequisites: ["compose:harmonization", "progressions:secondary-dominants"],
                resources: [],
                tags: ["compose", "reharmonization", "transform", "chords"]
            },
            {
                id: "compose:voice-leading",
                tier: 3, title: "Voice Leading",
                desc: "Smooth part writing — common tones, stepwise motion, avoiding parallels.",
                prerequisites: ["chords:inversions"],
                resources: [],
                tags: ["compose", "voice-leading", "smooth", "part-writing"]
            },
            {
                id: "compose:counterpoint",
                tier: 4, title: "Counterpoint",
                desc: "Species counterpoint, canon, fugue basics — Bach territory.",
                prerequisites: ["compose:voice-leading", "technique:hand-independence"],
                resources: [],
                tags: ["compose", "counterpoint", "fugue", "bach", "canon"]
            }
        ]
    },

    /* ── Genre Application Tracks ── */
    genres: {
        title: "Genre Tracks",
        icon: "🎸",
        description: "Apply your skills in real musical styles.",
        lessons: [
            // Pop
            {
                id: "genre:pop:4-chords",
                tier: 1, title: "Pop: The 4 Chords",
                desc: "I-V-vi-IV in action — play 100 hit songs with one progression.",
                prerequisites: ["progressions:i-v-vi-iv", "chords:major-minor-triads"],
                resources: [
                    { label: "Axis of Awesome — 4 Chords", url: "https://www.youtube.com/watch?v=5pidokakU4I" }
                ],
                tags: ["genre", "pop", "four-chords", "hits"]
            },
            {
                id: "genre:pop:color-chords",
                tier: 2, title: "Pop: Color Chords",
                desc: "Sus, add, and slash chords that make pop piano shimmer.",
                prerequisites: ["chords:sus-add", "chords:inversions"],
                resources: [
                    { label: "Pianote — Pop Voicings", url: "https://www.pianote.com/blog/pop-piano-chords/" }
                ],
                tags: ["genre", "pop", "color", "sus", "add"]
            },
            {
                id: "genre:pop:neo-soul-influence",
                tier: 3, title: "Pop: Neo-Soul Influence",
                desc: "Gospel passing chords and tritone subs bleeding into modern pop.",
                prerequisites: ["progressions:neo-soul", "chords:extended"],
                resources: [
                    { label: "Jeff Schneider — Neo Soul", url: "https://www.youtube.com/c/JeffSchneiderMusic" }
                ],
                tags: ["genre", "pop", "neo-soul", "gospel"]
            },
            // Classical
            {
                id: "genre:classical:stave",
                tier: 1, title: "Classical: Reading the Stave",
                desc: "Treble + bass clef orientation for classical repertoire.",
                prerequisites: ["foundations:staff-reading", "foundations:note-values"],
                resources: [
                    { label: "Musictheory.net — Basics", url: "https://www.musictheory.net/lessons" }
                ],
                tags: ["genre", "classical", "reading", "stave"]
            },
            {
                id: "genre:classical:counterpoint",
                tier: 2, title: "Classical: Counterpoint & Inventions",
                desc: "Bach's two-part inventions — independent hand movement.",
                prerequisites: ["technique:hand-independence", "compose:counterpoint"],
                resources: [
                    { label: "IMSLP — Free Sheet Music", url: "https://imslp.org/" },
                    { label: "Henle Verlag — Urtext", url: "https://www.henle.de/en/" }
                ],
                tags: ["genre", "classical", "counterpoint", "bach", "inventions"]
            },
            {
                id: "genre:classical:sonata",
                tier: 3, title: "Classical: Sonata Form",
                desc: "Exposition, Development, Recapitulation — Beethoven & Mozart.",
                prerequisites: ["compose:song-form", "progressions:cadences"],
                resources: [
                    { label: "Coursera — Beethoven Sonatas", url: "https://www.coursera.org/learn/beethoven-piano-sonatas" }
                ],
                tags: ["genre", "classical", "sonata", "beethoven", "mozart"]
            },
            // Jazz
            {
                id: "genre:jazz:shells",
                tier: 1, title: "Jazz: Shell Voicings",
                desc: "3rd + 7th over ii-V-I — your first jazz sound.",
                prerequisites: ["chords:shell-voicings", "progressions:ii-v-i"],
                resources: [
                    { label: "Open Studio — Shells", url: "https://www.youtube.com/watch?v=KzdbNfkfqT0" }
                ],
                tags: ["genre", "jazz", "shell", "ii-V-I"]
            },
            {
                id: "genre:jazz:rootless",
                tier: 2, title: "Jazz: Rootless Comping",
                desc: "Bill Evans left-hand voicings with modal right-hand lines.",
                prerequisites: ["chords:rootless", "scales:modes"],
                resources: [
                    { label: "The Jazz Piano Site", url: "https://www.thejazzpianosite.com/" }
                ],
                tags: ["genre", "jazz", "rootless", "evans", "comping"]
            },
            {
                id: "genre:jazz:upper-structures",
                tier: 3, title: "Jazz: Upper Structure Mastery",
                desc: "Polychords and altered dominants — advanced jazz piano.",
                prerequisites: ["chords:upper-structures", "progressions:coltrane-changes"],
                resources: [
                    { label: "Berklee Online — Jazz", url: "https://online.berklee.edu/courses/interest/jazz" }
                ],
                tags: ["genre", "jazz", "upper-structure", "polychord", "advanced"]
            }
        ]
    }
};

THEORY_CURRICULUM.chordMastery = {
    title: "Chord Mastery",
    icon: "🎛️",
    description: "Think in keys, numbers, chord shapes, inversions, and smooth movement.",
    lessons: [
        {
            id: "chordMastery:scale-notes-to-chords",
            tier: 1,
            title: "From Scale Notes to Chords",
            desc: "Turn any major scale into diatonic triads by stacking every other note.",
            prerequisites: ["scales:major"],
            resources: [],
            tags: ["chords", "scale-degrees", "diatonic", "numbers"]
        },
        {
            id: "chordMastery:inversion-fluency",
            tier: 1,
            title: "Inversion Fluency",
            desc: "Use root, 1st, and 2nd inversion as playable hand shapes, not vocabulary trivia.",
            prerequisites: ["chordMastery:scale-notes-to-chords"],
            resources: [],
            tags: ["inversions", "triads", "shapes"]
        },
        {
            id: "chordMastery:one-five-six-four",
            tier: 2,
            title: "1-5-6-4 Progression Lab",
            desc: "Move a core pop progression through keys, inversions, and simple patterns.",
            prerequisites: ["chordMastery:inversion-fluency"],
            resources: [],
            tags: ["progressions", "1564", "transpose", "pop"]
        },
        {
            id: "chordMastery:voice-led-progressions",
            tier: 2,
            title: "Voice-Led Progressions",
            desc: "Choose the closest inversion so chord changes feel connected under the hands.",
            prerequisites: ["chordMastery:one-five-six-four"],
            resources: [],
            tags: ["voice-leading", "inversions", "smooth"]
        }
    ]
};

THEORY_CURRICULUM.bluesLanguage = {
    title: "Blues Language",
    icon: "🎚️",
    description: "Blues scales, dominant chords, call-and-response, turnarounds, and feel.",
    lessons: [
        {
            id: "bluesLanguage:minor-blues-scale",
            tier: 1,
            title: "Minor Blues Scale",
            desc: "Use the minor blues scale as a compact improvising vocabulary over dominant chords.",
            prerequisites: ["scales:pentatonic"],
            resources: [],
            tags: ["blues", "scale", "improvisation"]
        },
        {
            id: "bluesLanguage:dominant-seventh-home",
            tier: 2,
            title: "Dominant Seventh Home Base",
            desc: "Hear I7, IV7, and V7 as the sound of blues harmony.",
            prerequisites: ["chords:seventh"],
            resources: [],
            tags: ["blues", "dominant", "12-bar"]
        },
        {
            id: "bluesLanguage:call-response",
            tier: 2,
            title: "Call and Response Licks",
            desc: "Make short phrases answer the chord instead of running scales endlessly.",
            prerequisites: ["bluesLanguage:minor-blues-scale"],
            resources: [],
            tags: ["blues", "phrasing", "licks"]
        }
    ]
};

THEORY_CURRICULUM.jazzVocabulary = {
    title: "Jazz Vocabulary",
    icon: "🎷",
    description: "Modes, ii-V-I, guide tones, bebop color, and dominant movement.",
    lessons: [
        {
            id: "jazzVocabulary:dorian-mixolydian",
            tier: 2,
            title: "Dorian to Mixolydian",
            desc: "Connect ii and V with scale colors that point toward I.",
            prerequisites: ["scales:modes", "progressions:ii-v-i"],
            resources: [],
            tags: ["jazz", "modes", "ii-v-i"]
        },
        {
            id: "jazzVocabulary:guide-tone-paths",
            tier: 3,
            title: "Guide-Tone Paths",
            desc: "Track 3rds and 7ths so jazz chords move with purpose.",
            prerequisites: ["chords:seventh"],
            resources: [],
            tags: ["jazz", "guide-tones", "voice-leading"]
        },
        {
            id: "jazzVocabulary:dominant-colors",
            tier: 3,
            title: "Dominant Colors",
            desc: "Compare plain V7, altered V7, backdoor dominant, and tritone substitute.",
            prerequisites: ["progressions:tritone-sub"],
            resources: [],
            tags: ["jazz", "dominant", "substitution"]
        }
    ]
};

THEORY_CURRICULUM.churchHarmony = {
    title: "Church Harmony",
    icon: "⛪",
    description: "Gospel movement, Amen/plagal color, passing chords, and emotional resolution.",
    lessons: [
        {
            id: "churchHarmony:amen-movement",
            tier: 1,
            title: "Amen Movement",
            desc: "Use IV to I as a warm plagal resolution and compare it with V to I.",
            prerequisites: ["progressions:cadences"],
            resources: [],
            tags: ["church", "gospel", "plagal"]
        },
        {
            id: "churchHarmony:passing-to-four",
            tier: 2,
            title: "Passing to IV",
            desc: "Use bass motion and passing chords to make I to IV feel alive.",
            prerequisites: ["chordMastery:scale-notes-to-chords"],
            resources: [],
            tags: ["church", "passing-chords", "bass"]
        },
        {
            id: "churchHarmony:seven-three-six",
            tier: 3,
            title: "7-3-6 Movement",
            desc: "Hear gospel/jazz gravity into vi through half-diminished and dominant color.",
            prerequisites: ["chords:seventh"],
            resources: [],
            tags: ["church", "gospel", "736"]
        }
    ]
};

THEORY_CURRICULUM.modulation = {
    title: "Modulation",
    icon: "🧭",
    description: "Move ideas between keys with number thinking, pivots, dominants, and circle motion.",
    lessons: [
        {
            id: "modulation:number-thinking",
            tier: 2,
            title: "Move by Numbers",
            desc: "Translate progressions by roman numerals before naming the new chords.",
            prerequisites: ["foundations:transposition", "chordMastery:scale-notes-to-chords"],
            resources: [],
            tags: ["modulation", "numbers", "transposition"]
        },
        {
            id: "modulation:dominant-setup",
            tier: 3,
            title: "Dominant Setup",
            desc: "Use the V7 of the destination key to make the new key feel inevitable.",
            prerequisites: ["progressions:secondary-dominants"],
            resources: [],
            tags: ["modulation", "dominant", "resolution"]
        },
        {
            id: "modulation:pivot-and-circle",
            tier: 3,
            title: "Pivot and Circle Motion",
            desc: "Compare common-chord pivots, circle motion, and chromatic passing routes.",
            prerequisites: ["foundations:circle-of-fifths"],
            resources: [],
            tags: ["modulation", "pivot", "circle"]
        }
    ]
};

/* ── Curriculum Helpers ── */

/** Flat array of all lessons */
function getAllLessons() {
    const all = [];
    for (const cat of Object.values(THEORY_CURRICULUM)) {
        if (cat.lessons) all.push(...cat.lessons);
    }
    return all;
}

/** Find a lesson by route ID */
function getLessonById(id) {
    return getAllLessons().find(l => l.id === id) || null;
}

/** Get lessons matching any of the given tags */
function getLessonsByTags(tags) {
    const tagSet = new Set(tags.map(t => t.toLowerCase()));
    return getAllLessons().filter(l =>
        l.tags && l.tags.some(t => tagSet.has(t.toLowerCase()))
    );
}

/** Get lessons for a specific tier (1-4) */
function getLessonsByTier(tier) {
    return getAllLessons().filter(l => l.tier === tier);
}

/** Get prerequisite chain for a lesson */
function getPrerequisiteChain(id, visited = new Set()) {
    const lesson = getLessonById(id);
    if (!lesson || !lesson.prerequisites) return [];
    const chain = [];
    for (const preId of lesson.prerequisites) {
        if (visited.has(preId)) continue;
        visited.add(preId);
        chain.push(...getPrerequisiteChain(preId, visited));
        const pre = getLessonById(preId);
        if (pre) chain.push(pre);
    }
    return chain;
}

/** Get category metadata (without lessons) */
function getCategoryMeta() {
    return Object.entries(THEORY_CURRICULUM).map(([key, cat]) => ({
        key,
        title: cat.title,
        icon: cat.icon,
        description: cat.description,
        lessonCount: cat.lessons ? cat.lessons.length : 0
    }));
}

/** Tier label helper */
function tierLabel(tier) {
    return ["", "🟢 Noob", "🟡 Intermediate", "🟠 Advanced", "🔴 Pro"][tier] || "";
}

/* ── Export ── */
window.THEORY_CURRICULUM = THEORY_CURRICULUM;
window.getAllLessons = getAllLessons;
window.getLessonById = getLessonById;
window.getLessonsByTags = getLessonsByTags;
window.getLessonsByTier = getLessonsByTier;
window.getPrerequisiteChain = getPrerequisiteChain;
window.getCategoryMeta = getCategoryMeta;
window.tierLabel = tierLabel;
