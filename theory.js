const THEORY_CURRICULUM = {
    pop: {
        title: "Pop & Contemporary",
        description: "Master the charts. From 4-chord loops to power ballads.",
        levels: [
            {
                title: "Noob: The 4 Chords",
                desc: "Learn the I-V-vi-IV progression that built the 2000s.",
                resources: [
                    { label: "Axis of Awesome - 4 Chords", url: "https://www.youtube.com/watch?v=5pidokakU4I" },
                    { label: "Hooktheory - Pop Analysis", url: "https://www.hooktheory.com/theorytab" }
                ]
            },
            {
                title: "Intermediate: Sus & Add Chords",
                desc: "Add color without changing the function. Csus4, Cadd9.",
                resources: [
                    { label: "PianoOTE - Pop Voicings", url: "https://www.pianote.com/blog/pop-piano-chords/" }
                ]
            },
            {
                title: "Pro: Neo-Soul Influence",
                desc: "Gospel passing chords and tritone substitutions in pop.",
                resources: [
                    { label: "Jeff Schneider - Neo Soul", url: "https://www.youtube.com/c/JeffSchneiderMusic" }
                ]
            }
        ]
    },
    classical: {
        title: "Classical Piano",
        description: "The foundation of everything. Sight reading and technique.",
        levels: [
            {
                title: "Noob: The Stave",
                desc: "Reading treble and bass clef. Middle C orientation.",
                resources: [
                    { label: "Musictheory.net - Basics", url: "https://www.musictheory.net/lessons" }
                ]
            },
            {
                title: "Intermediate: Counterpoint",
                desc: "Bach, inventions, and independent hand movement.",
                resources: [
                    { label: "Henle Verlag - Urtext", url: "https://www.henle.de/en/" },
                    { label: "IMSLP - Free Sheet Music", url: "https://imslp.org/" }
                ]
            },
            {
                title: "Concert: Sonata Form",
                desc: "Exposition, Development, Recapitulation. Beethoven & Mozart.",
                resources: [
                    { label: "Coursera - Beethoven Sonatas", url: "https://www.coursera.org/learn/beethoven-piano-sonatas" }
                ]
            }
        ]
    },
    jazz: {
        title: "Jazz & Improvisation",
        description: "Freedom within structure. Swing, extensions, and ii-V-I.",
        levels: [
            {
                title: "Noob: Shell Voicings",
                desc: "3rd and 7th. The bare minimum to sound like jazz.",
                resources: [
                    { label: "Open Studio - Shells", url: "https://www.youtube.com/watch?v=KzdbNfkfqT0" }
                ]
            },
            {
                title: "Intermediate: Rootless Voicings",
                desc: "Bill Evans style. Left hand texture, Right hand melody.",
                resources: [
                    { label: "The Jazz Piano Site", url: "https://www.thejazzpianosite.com/" }
                ]
            },
            {
                title: "Pro: Upper Structures",
                desc: "Polychords and altering the dominant. 13b9, #11.",
                resources: [
                    { label: "Berklee Online - Jazz", url: "https://online.berklee.edu/courses/interest/jazz" }
                ]
            }
        ]
    }
};

window.THEORY_CURRICULUM = THEORY_CURRICULUM;
