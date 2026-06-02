/* Baby Steps practice paths: original app-native drills, not copied course text. */

const BABY_STEPS_PRACTICE_PATHS = [
  {
    id: "chord-mastery-foundation",
    title: "Chord Mastery Foundation",
    description: "Build a practical chord brain: keys, diatonic chords, inversions, 1-5-6-4, voice leading, and groove.",
    weeks: [
      {
        title: "Diagnostics and Key Shapes",
        focus: "Find the chords in a key, score what feels easy, and make C major feel automatic.",
        days: [
          {
            title: "C Major Baseline",
            targetSkills: ["cm-root", "cm-inv1", "cm-inv2"],
            suggestedTempo: 45,
            linkedLab: "scale-chords",
            exercises: [
              "Build every C major diatonic triad from scale notes.",
              "Play each chord in root position, then score confidence.",
              "Say the number and chord name: I C, ii Dm, iii Em, IV F, V G, vi Am, vii Bdim."
            ]
          },
          {
            title: "Inversion Walk",
            targetSkills: ["cm-inv1", "cm-inv2"],
            suggestedTempo: 50,
            linkedLab: "scale-chords",
            exercises: [
              "Play C major chords root, 1st, 2nd, 1st, root before moving to the next scale chord.",
              "Computer study: name the root and inversion shape before listening.",
              "Piano transfer: keep one bass note steady while the upper shape changes.",
              "Keep timing steady before increasing tempo."
            ]
          },
          {
            title: "Black-Key Key Map",
            targetSkills: ["scale-to-chords"],
            suggestedTempo: 45,
            linkedLab: "scale-chords",
            exercises: [
              "Pick Db, Eb, Gb, Ab, Bb, or B and name the scale notes.",
              "Stack every other note to discover the diatonic chords.",
              "Score only what you touched today; provisional scores are useful."
            ]
          },
          {
            title: "1-5-6-4 Arpeggio",
            targetSkills: ["1564-root", "1564-inv1", "1564-inv2"],
            suggestedTempo: 75,
            linkedLab: "1564",
            exercises: [
              "Loop 1-5-6-4 in C, then in yesterday's new key.",
              "Use a top-bottom-middle-top right-hand pattern.",
              "Try root, 1st, and 2nd inversion starts."
            ]
          },
          {
            title: "B Major Reality Check",
            targetSkills: ["scale-to-chords", "cm-root"],
            suggestedTempo: 45,
            linkedLab: "scale-chords",
            exercises: [
              "Map B major slowly and build the diatonic triads.",
              "Run the same diagnostics without trying to perfect them.",
              "Notice which chord shapes hesitate and mark the score honestly."
            ]
          },
          {
            title: "Rest or Review",
            targetSkills: ["review"],
            suggestedTempo: 60,
            linkedLab: "1564",
            exercises: ["Replay the two easiest drills and stop while it still feels clean."]
          },
          {
            title: "Rest or Review",
            targetSkills: ["review"],
            suggestedTempo: 60,
            linkedLab: "scale-chords",
            exercises: ["Review one weak key for five focused minutes."]
          }
        ]
      },
      {
        title: "Chord Types and Progression Thinking",
        focus: "Understand major-scale thirds, chord qualities, V-I pull, and transposing the process.",
        days: [
          {
            title: "Thirds Make Chords",
            targetSkills: ["scale-to-chords", "chord-types"],
            suggestedTempo: 55,
            linkedLab: "scale-chords",
            exercises: [
              "Build triads in C by taking every other scale note.",
              "Change one root through major, minor, diminished, and augmented colors.",
              "Turn Bdim into G7 by hearing it as dominant tension."
            ]
          },
          {
            title: "F Major Transfer",
            targetSkills: ["scale-to-chords", "transpose"],
            suggestedTempo: 55,
            linkedLab: "scale-chords",
            exercises: [
              "Repeat the scale-to-chords process in F.",
              "Name every number before every chord name.",
              "Compare which shapes feel easier than C."
            ]
          },
          {
            title: "Dominant Gravity",
            targetSkills: ["function", "dominants"],
            suggestedTempo: 60,
            linkedLab: "vocabulary",
            exercises: [
              "Play V7 to I in three keys.",
              "Try plain V7, tritone sub, and backdoor colors.",
              "Say what changed emotionally before moving on."
            ]
          },
          {
            title: "1-5-6-4 Voice Lead",
            targetSkills: ["1564-voice"],
            suggestedTempo: 70,
            linkedLab: "1564",
            exercises: [
              "Choose the closest inversion for every chord in 1-5-6-4.",
              "Keep the top note as smooth as possible.",
              "Score voice-led confidence separately from root-position confidence."
            ]
          },
          {
            title: "Two-Key Check",
            targetSkills: ["transpose", "review"],
            suggestedTempo: 60,
            linkedLab: "1564",
            exercises: [
              "Play one drill in C and one drill in F.",
              "Move by numbers, not memorized chord names.",
              "Save one idea you want to revisit."
            ]
          },
          {
            title: "Rest or Review",
            targetSkills: ["review"],
            suggestedTempo: 60,
            linkedLab: "scale-chords",
            exercises: ["Use the weakest-key recommendation for a short review."]
          },
          {
            title: "Weekly Reset",
            targetSkills: ["review"],
            suggestedTempo: 60,
            linkedLab: "vocabulary",
            exercises: ["Replay one favorite sound and one uncomfortable sound."]
          }
        ]
      },
      {
        title: "Rhythm, Groove, and Pattern Application",
        focus: "Make the chords feel like music with counting, hand coordination, patterns, and style vocabulary.",
        days: [
          {
            title: "Pattern Count-In",
            targetSkills: ["rhythm", "1564-inv1", "1564-inv2"],
            suggestedTempo: 70,
            linkedLab: "1564",
            exercises: [
              "Loop 1-5-6-4 in D with a slow count.",
              "Computer study: say the numbers first, then the chord names.",
              "Piano transfer: keep the bass simple and let the upper pattern move.",
              "Try root, 1st, and 2nd inversion starts."
            ]
          },
          {
            title: "Blues Color Day",
            targetSkills: ["blues-scale", "dominant"],
            suggestedTempo: 75,
            linkedLab: "vocabulary",
            exercises: [
              "Play minor blues scale over I7, IV7, and V7.",
              "Answer a chord with a two-note lick.",
              "Keep the phrase short enough to repeat."
            ]
          },
          {
            title: "Church Movement Day",
            targetSkills: ["church", "passing-chords"],
            suggestedTempo: 65,
            linkedLab: "vocabulary",
            exercises: [
              "Play I to IV plainly, then with a passing movement.",
              "Compare plagal/Amen motion with dominant motion.",
              "Keep the bass path easy to sing."
            ]
          },
          {
            title: "Jazz Scale Day",
            targetSkills: ["jazz-scales", "modes"],
            suggestedTempo: 70,
            linkedLab: "vocabulary",
            exercises: [
              "Try Dorian over ii and Mixolydian over V.",
              "Resolve a short line into I.",
              "Name where the color wants to land."
            ]
          },
          {
            title: "Modulation Map",
            targetSkills: ["modulation", "transpose"],
            suggestedTempo: 60,
            linkedLab: "modulation",
            exercises: [
              "Move a 1-5-6-4 idea from C to F.",
              "Try a dominant setup into the new key.",
              "Say the numbers before the chord names."
            ]
          },
          {
            title: "Record One Clean Loop",
            targetSkills: ["performance"],
            suggestedTempo: 75,
            linkedLab: "1564",
            exercises: ["Record or mentally bookmark one clean loop at a comfortable tempo."]
          },
          {
            title: "Review and Save",
            targetSkills: ["review", "create"],
            suggestedTempo: 60,
            linkedLab: "vocabulary",
            exercises: ["Save one lab idea that felt musical enough to keep."]
          }
        ]
      }
    ]
  }
];

window.BABY_STEPS_PRACTICE_PATHS = BABY_STEPS_PRACTICE_PATHS;
