import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { execFileSync } from "child_process";

const ZIP_PATH = path.resolve("external/dcd-audio.zip");
const CSV_PATH = path.resolve("external/DCD_predictors.csv");
const OUTPUT_AUDIO_DIR = path.resolve("assets/chords-recorded");
const MANIFEST_DIR = path.resolve("assets/chords");
const MANIFEST_PATH = path.join(MANIFEST_DIR, "manifest.json");
const BUILD_STAMP = Date.now();

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const CHORDS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dom7: [0, 4, 7, 10],
  m7b5: [0, 3, 6, 10]
};
const INVERSIONS = ["root position", "1st inversion", "2nd inversion"];
const CANDIDATE_BASES = [52, 64, 40];
const REGISTER_BY_BASE = {
  40: "-12",
  52: "0",
  64: "12"
};

function invSlug(inversion) {
  if (inversion === "root position") return "root";
  if (inversion === "1st inversion") return "inv1";
  if (inversion === "2nd inversion") return "inv2";
  return "inv";
}

function noteToPc(note) {
  const pc = NOTES.indexOf(note);
  if (pc < 0) throw new Error(`Unknown note ${note}`);
  return pc;
}

function buildChordMidi(root, quality, inversion, octave = 3) {
  const rootMidi = 12 * (octave + 1) + noteToPc(root);
  const intervals = CHORDS[quality];
  const midi = intervals.map((semitone) => rootMidi + semitone);
  if (inversion === "1st inversion") {
    midi.push(midi.shift() + 12);
  } else if (inversion === "2nd inversion") {
    midi.push(midi.shift() + 12);
    midi.push(midi.shift() + 12);
  }
  return midi.sort((a, b) => a - b);
}

function midiSignature(midi) {
  return Array.from(new Set(midi.filter((v) => Number.isFinite(v))))
    .sort((a, b) => a - b)
    .join(",");
}

function parseDcdLookup(csvRaw) {
  const lines = csvRaw.split(/\r?\n/).filter(Boolean);
  const lookup = new Map();
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    const match = line.match(/^"([^"]+)","([^"]+)","([^"]+)","([^"]+)"/);
    if (!match) continue;
    const [, id, register, numtones, midi] = match;
    lookup.set(`${numtones}|${register}|${midi}`, id);
  }
  return lookup;
}

function chooseRecordedSourceId(targetMidi, lookup) {
  const sortedTarget = [...targetMidi].sort((a, b) => a - b);
  const minMidi = sortedTarget[0];
  let best = null;

  for (const base of CANDIDATE_BASES) {
    const shift = minMidi - base;
    const normalized = sortedTarget.map((note) => note - shift).sort((a, b) => a - b);
    if (normalized[0] !== base) continue;
    if (normalized[normalized.length - 1] > base + 12) continue;
    const register = REGISTER_BY_BASE[base];
    const key = `${normalized.length}|${register}|${normalized.join("-")}`;
    const sourceId = lookup.get(key);
    if (!sourceId) continue;
    const score = Math.abs(shift);
    if (!best || score < best.score) {
      best = {
        sourceId,
        transposeSemitones: shift
      };
    }
  }

  if (!best) {
    throw new Error(`No DCD match found for midi ${sortedTarget.join("-")}`);
  }
  return best;
}

async function main() {
  if (!existsSync(ZIP_PATH)) {
    throw new Error(`Missing ${ZIP_PATH}. Download the DCD audio zip first.`);
  }
  if (!existsSync(CSV_PATH)) {
    throw new Error(`Missing ${CSV_PATH}. Download DCD_predictors.csv first.`);
  }

  await fs.mkdir(OUTPUT_AUDIO_DIR, { recursive: true });
  await fs.mkdir(MANIFEST_DIR, { recursive: true });

  const csvRaw = await fs.readFile(CSV_PATH, "utf8");
  const dcdLookup = parseDcdLookup(csvRaw);
  const sourceIds = new Set();
  const entries = [];

  for (const root of NOTES) {
    for (const quality of Object.keys(CHORDS)) {
      for (const inversion of INVERSIONS) {
        const midi = buildChordMidi(root, quality, inversion, 3);
        const { sourceId, transposeSemitones } = chooseRecordedSourceId(midi, dcdLookup);
        sourceIds.add(sourceId);
        const sourceFile = `Chord${sourceId}.mp3`;
        entries.push({
          id: `${root}-${quality}-${invSlug(inversion)}`,
          root,
          quality,
          inversion,
          midi,
          midiSignature: midiSignature(midi),
          file: sourceFile,
          sourceChordId: sourceId,
          transposeSemitones,
          url: `./assets/chords-recorded/${sourceFile}?v=${BUILD_STAMP}`
        });
      }
    }
  }

  const zipMembers = Array.from(sourceIds)
    .sort()
    .map((id) => `audio/Chord${id}.mp3`);
  execFileSync("unzip", ["-o", "-j", ZIP_PATH, ...zipMembers, "-d", OUTPUT_AUDIO_DIR], {
    stdio: "inherit"
  });

  const manifest = {
    version: 2,
    generatedAt: new Date().toISOString(),
    source: "dcd-ivory-grand-one-shots",
    buildStamp: BUILD_STAMP,
    uniqueSourceFiles: sourceIds.size,
    entries
  };
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Mapped ${entries.length} chord entries to ${sourceIds.size} recorded source files.`);
  console.log(`Wrote ${MANIFEST_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
