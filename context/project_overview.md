# Project Overview

## Product Goal
Baby Steps Piano Lab is an adult-focused music theory learning lab. It helps learners connect harmony, scales, cadences, repertoire, and guided theory lessons to immediate visual and audio feedback.

## Product Value Thesis
- Baby Steps should protect first contact with music: sound, hand, curiosity, and willingness to return matter before terminology, evaluation, or correctness pressure.
- The smallest learning unit is a Baby Step: a tiny playable musical action that introduces at most one new element, produces audible meaning, can be returned to safely, defers theory labels until after contact, and has a defined transfer destination.
- Sequence learning as Touch, Move, Feel, Notice, Name, Transfer. Theory is not avoided; it is revealed as recognition after the learner has felt and heard the idea.
- Design for adult beginner and re-entering learners, including people with attentional variability or prior discouraging learning experiences. Keep the tone serious, warm, non-clinical, and non-childish.
- Progress should use Practiced, Confident, and Mastered states rather than harsh pass/fail framing. Mastery requires delayed retrieval and transfer, not just one comfortable in-session run.
- The flagship pedagogical path is Left-Hand Chord Freedom: make the left hand feel like a reliable harmonic anchor so learners can experience musical freedom earlier.
- Treat the pedagogy as evidence-informed and testable, not proven. Avoid clinical, therapeutic, diagnostic, or comparative-superiority claims until the staged validation roadmap earns them.
- Durable source context for this thesis lives in `docs/product-context/`; do not load the PDFs by default during ordinary coding.

## Primary Users
Adult piano learners, especially users who benefit from ADHD-friendly study surfaces, compact controls, and concrete musical examples. Secondary users include instructors or agents creating guided lessons, theory drills, and playable concept artifacts.

## Core Workflows
- Explore chords, scales, arpeggios, modes, cadences, and progressions in a selected key.
- Hear playable examples through the Tone.js/RNBO-backed audio stack.
- Use Theory mode for topic-based lessons, generated lesson packs, guided pass criteria, and progress tracking.
- Use the AI coach for threaded explanations, structured artifacts, and lesson-stack routing.
- Persist progress locally and, where enabled, through Supabase profile workflows.

## Current Milestone
Milestone 4: make Baby Steps usable across devices by finishing Supabase Google sign-in, signed-in profile persistence, local-to-cloud migration, lesson stack sync, concept mastery sync, artifact attempt sync, and profile/badge verification.

## Non-Goals
- Do not replace the existing piano lab, AI coach, or audio engine.
- Do not add a new framework or build system.
- Do not add remote image assets or copied product artwork.
- Do not disturb existing progression playback defaults, chord-palette behavior, or threaded coach behavior.
- Do not make the app childish, mascot-driven, noisy, or gamified in a way that distracts from serious music learning.
- Do not break signed-out localStorage progress, the existing lesson stack surface, or the existing profile/badge surface while adding signed-in sync.
