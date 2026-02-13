import fs from 'fs/promises';
import path from 'path';
import { chromium } from 'playwright';

const BASE_URL = process.env.CHORD_RENDER_BASE_URL || 'http://127.0.0.1:4010/';
const OUTPUT_DIR = path.resolve('assets/chords');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');
const SAMPLE_RATE = 44100;
const DURATION_SECONDS = 2.6;
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
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
const INVERSIONS = ['root position', '1st inversion', '2nd inversion'];

function noteToPc(note) {
  const pc = NOTES.indexOf(note);
  if (pc < 0) throw new Error(`Unknown note ${note}`);
  return pc;
}

function buildChordMidi(root, quality, inversion, octave = 3) {
  const rootMidi = 12 * (octave + 1) + noteToPc(root);
  const intervals = CHORDS[quality];
  const midi = intervals.map((semitone) => rootMidi + semitone);
  if (inversion === '1st inversion') {
    midi.push(midi.shift() + 12);
  } else if (inversion === '2nd inversion') {
    midi.push(midi.shift() + 12);
    midi.push(midi.shift() + 12);
  }
  return midi;
}

function invSlug(inversion) {
  if (inversion === 'root position') return 'root';
  if (inversion === '1st inversion') return 'inv1';
  if (inversion === '2nd inversion') return 'inv2';
  return 'inv';
}

function fileSlug(root, quality, inversion) {
  return `${root.replace('#', 's')}_${quality}_${invSlug(inversion)}.wav`;
}

function midiSignature(midi) {
  return Array.from(new Set(midi.filter((v) => Number.isFinite(v)))).sort((a, b) => a - b).join(',');
}

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function main() {
  await ensureOutputDir();
  const buildStamp = Date.now();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  const entries = [];
  let idx = 0;
  const total = NOTES.length * Object.keys(CHORDS).length * INVERSIONS.length;

  for (const root of NOTES) {
    for (const [quality] of Object.entries(CHORDS)) {
      for (const inversion of INVERSIONS) {
        idx += 1;
        const midi = buildChordMidi(root, quality, inversion, 3);
        const file = fileSlug(root, quality, inversion);
        const outPath = path.join(OUTPUT_DIR, file);
        process.stdout.write(`\rRendering ${idx}/${total}: ${root} ${quality} ${inversion}   `);

        const { base64, duration } = await page.evaluate(async ({ midi, sampleRate, durationSeconds }) => {
          const SALAMANDER_SAMPLE_NOTES = [
            'A0', 'C1', 'Ds1', 'Fs1', 'A1', 'C2', 'Ds2', 'Fs2', 'A2', 'C3',
            'Ds3', 'Fs3', 'A3', 'C4', 'Ds4', 'Fs4', 'A4', 'C5', 'Ds5', 'Fs5',
            'A5', 'C6', 'Ds6', 'Fs6', 'A6', 'C7', 'Ds7', 'Fs7', 'A7', 'C8'
          ];
          const SAMPLE_ONSET_SCAN_SECONDS = 0.4;
          const SAMPLE_ONSET_MIN_THRESHOLD = 0.0035;
          const SAMPLE_ONSET_MAX_THRESHOLD = 0.03;
          const SAMPLE_ONSET_RATIO = 0.12;
          const SAMPLE_ONSET_CONFIRM_SAMPLES = 24;
          const CHORD_TRANSIENT_TRIM_SECONDS = 0.008;
          const CHORD_UNIFIED_ATTACK_DELAY_SECONDS = 0.008;
          const CHORD_UNIFIED_ATTACK_RAMP_SECONDS = 0.008;

          const sampleCache = (window.__chordRenderSampleCache ||= new Map());

          const sampleNoteToMidi = (sampleNote) => {
            const match = /^([A-G])(s?)(-?\d+)$/.exec(sampleNote);
            if (!match) return 60;
            const letter = match[1];
            const sharp = match[2] === 's';
            const octave = Number(match[3]);
            const baseMap = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
            const semitone = baseMap[letter] + (sharp ? 1 : 0);
            return 12 * (octave + 1) + semitone;
          };

          const SAMPLE_MIDI = SALAMANDER_SAMPLE_NOTES.map(sampleNoteToMidi);
          const getNearestSample = (targetMidi) => {
            let nearestIndex = 0;
            let minDistance = Math.abs(targetMidi - SAMPLE_MIDI[0]);
            for (let i = 0; i < SAMPLE_MIDI.length; i += 1) {
              const distance = Math.abs(targetMidi - SAMPLE_MIDI[i]);
              if (distance < minDistance) {
                nearestIndex = i;
                minDistance = distance;
              }
            }
            return { note: SALAMANDER_SAMPLE_NOTES[nearestIndex], midi: SAMPLE_MIDI[nearestIndex] };
          };

          const detectSampleOnsetSeconds = (buffer) => {
            if (!buffer || typeof buffer.getChannelData !== 'function') return 0;
            const channel = buffer.getChannelData(0);
            if (!channel || channel.length === 0) return 0;
            const scanLength = Math.min(channel.length, Math.max(1, Math.floor(buffer.sampleRate * SAMPLE_ONSET_SCAN_SECONDS)));
            let peak = 0;
            for (let i = 0; i < scanLength; i += 1) {
              const abs = Math.abs(channel[i]);
              if (abs > peak) peak = abs;
            }
            if (peak <= 0) return 0;
            const threshold = Math.min(SAMPLE_ONSET_MAX_THRESHOLD, Math.max(SAMPLE_ONSET_MIN_THRESHOLD, peak * SAMPLE_ONSET_RATIO));
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
            return Math.max(0, onsetIndex - preRoll) / buffer.sampleRate;
          };

          const loadSample = async (sampleNote) => {
            if (sampleCache.has(sampleNote)) return sampleCache.get(sampleNote);
            const res = await fetch(`./assets/salamander/${sampleNote}.mp3`, { cache: 'force-cache' });
            if (!res.ok) throw new Error(`Missing sample ${sampleNote}`);
            const arr = await res.arrayBuffer();
            const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate });
            const buffer = await ctx.decodeAudioData(arr.slice(0));
            await ctx.close();
            const onset = detectSampleOnsetSeconds(buffer);
            const cached = { buffer, onset };
            sampleCache.set(sampleNote, cached);
            return cached;
          };

          const frameCount = Math.floor(sampleRate * durationSeconds);
          const offline = new OfflineAudioContext(2, frameCount, sampleRate);
          const chordBus = offline.createGain();
          chordBus.gain.setValueAtTime(0.0001, 0);
          chordBus.gain.setValueAtTime(0.0001, CHORD_UNIFIED_ATTACK_DELAY_SECONDS);
          chordBus.gain.linearRampToValueAtTime(
            1,
            CHORD_UNIFIED_ATTACK_DELAY_SECONDS + CHORD_UNIFIED_ATTACK_RAMP_SECONDS
          );
          chordBus.connect(offline.destination);
          const plans = [];
          for (const noteMidi of midi) {
            const sample = getNearestSample(noteMidi);
            const sampleData = await loadSample(sample.note);
            const rate = 2 ** ((noteMidi - sample.midi) / 12);
            const onset = Math.max(0, sampleData.onset - CHORD_TRANSIENT_TRIM_SECONDS);
            plans.push({
              noteMidi,
              sampleMidi: sample.midi,
              buffer: sampleData.buffer,
              rate,
              onsetOffsetSeconds: onset
            });
          }

          for (const plan of plans) {
            const source = offline.createBufferSource();
            const gain = offline.createGain();
            source.buffer = plan.buffer;
            source.playbackRate.value = plan.rate;
            const startTime = 0.004;
            const noteVelocity = 0.86 / Math.max(1, plans.length * 0.9);
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.linearRampToValueAtTime(noteVelocity, startTime + 0.004);
            gain.gain.exponentialRampToValueAtTime(Math.max(0.07, noteVelocity * 0.38), startTime + 0.15);
            gain.gain.setValueAtTime(Math.max(0.07, noteVelocity * 0.38), Math.min(durationSeconds - 0.25, startTime + 1.2));
            gain.gain.exponentialRampToValueAtTime(0.0001, Math.max(startTime + 1.6, durationSeconds - 0.12));
            source.connect(gain);
            gain.connect(chordBus);
            const startOffset = Math.max(
              0,
              Math.min(
                Math.max(0, plan.buffer.duration - 0.02),
                plan.buffer.duration > 0.02 ? plan.onsetOffsetSeconds : 0
              )
            );
            source.start(startTime, startOffset);
            source.stop(durationSeconds - 0.02);
          }

          const rendered = await offline.startRendering();
          const channels = rendered.numberOfChannels;
          const samples = rendered.length;
          const bytesPerSample = 2;
          const dataLength = samples * channels * bytesPerSample;
          const wav = new ArrayBuffer(44 + dataLength);
          const view = new DataView(wav);

          const writeString = (offset, str) => {
            for (let i = 0; i < str.length; i += 1) {
              view.setUint8(offset + i, str.charCodeAt(i));
            }
          };

          writeString(0, 'RIFF');
          view.setUint32(4, 36 + dataLength, true);
          writeString(8, 'WAVE');
          writeString(12, 'fmt ');
          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true);
          view.setUint16(22, channels, true);
          view.setUint32(24, rendered.sampleRate, true);
          view.setUint32(28, rendered.sampleRate * channels * bytesPerSample, true);
          view.setUint16(32, channels * bytesPerSample, true);
          view.setUint16(34, 16, true);
          writeString(36, 'data');
          view.setUint32(40, dataLength, true);

          const channelData = [];
          for (let c = 0; c < channels; c += 1) {
            channelData.push(rendered.getChannelData(c));
          }

          let offset = 44;
          for (let i = 0; i < samples; i += 1) {
            for (let c = 0; c < channels; c += 1) {
              const clamped = Math.max(-1, Math.min(1, channelData[c][i] || 0));
              const pcm = clamped < 0 ? clamped * 32768 : clamped * 32767;
              view.setInt16(offset, pcm, true);
              offset += 2;
            }
          }

          const bytes = new Uint8Array(wav);
          let binary = '';
          const chunk = 0x8000;
          for (let i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
          }
          return {
            base64: btoa(binary),
            duration: rendered.duration
          };
        }, { midi, sampleRate: SAMPLE_RATE, durationSeconds: DURATION_SECONDS });

        await fs.writeFile(outPath, Buffer.from(base64, 'base64'));
        entries.push({
          id: `${root}-${quality}-${invSlug(inversion)}`,
          root,
          quality,
          inversion,
          midi,
          midiSignature: midiSignature(midi),
          file,
          url: `./assets/chords/${file}?v=${buildStamp}`,
          duration
        });
      }
    }
  }

  process.stdout.write('\n');

  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: 'offline-rendered-from-salamander',
    entries
  };
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  await browser.close();
  console.log(`Generated ${entries.length} chord files to ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
