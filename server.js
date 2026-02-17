require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const COACH_PROVIDER = String(process.env.COACH_PROVIDER || 'auto').toLowerCase();
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma3:4b';
const POLLINATIONS_ENABLED = String(process.env.POLLINATIONS_ENABLED || 'true').toLowerCase() !== 'false';
const POLLINATIONS_URL = process.env.POLLINATIONS_URL || 'https://text.pollinations.ai/openai';
const POLLINATIONS_MODEL = process.env.POLLINATIONS_MODEL || 'openai';
const COACH_STREAM_CHUNK_DELAY_MS = 14;
const COACH_MAX_HISTORY_MESSAGES = 14;
const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_NAME_TO_PITCH_CLASS = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.mid': 'audio/midi'
};

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function safePath(urlPath) {
  const pathname = decodeURIComponent(urlPath.split('?')[0]);
  const filePath = pathname === '/' ? '/index.html' : pathname;
  const resolved = path.normalize(path.join(ROOT, filePath));
  if (!resolved.startsWith(ROOT)) return null;
  return resolved;
}

async function handleCoach(req, res) {
  try {
    const parsed = await readJsonBody(req);
    const coachTurn = await generateCoachTurn(parsed);
    sendJson(res, 200, {
      answer: coachTurn.assistantText,
      assistantText: coachTurn.assistantText,
      artifact: coachTurn.artifact || null,
      artifacts: coachTurn.artifacts || [],
      threadId: coachTurn.threadId || '',
      mode: coachTurn.mode,
      warning: coachTurn.warning
    });
  } catch (err) {
    sendJson(res, 200, {
      answer: buildOfflineCoachAnswer('Fallback request', {}),
      assistantText: buildOfflineCoachAnswer('Fallback request', {}),
      artifact: null,
      mode: 'offline',
      warning: `Coach error: ${err.message}`
    });
  }
}

async function handleCoachStream(req, res) {
  try {
    const parsed = await readJsonBody(req);
    const coachTurn = await generateCoachTurn(parsed);
    const chunks = chunkTextForStream(coachTurn.assistantText);

    res.writeHead(200, {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Transfer-Encoding': 'chunked'
    });

    res.write(`${JSON.stringify({
      type: 'meta',
      mode: coachTurn.mode,
      warning: coachTurn.warning,
      threadId: coachTurn.threadId || ''
    })}\n`);

    for (const chunk of chunks) {
      res.write(`${JSON.stringify({ type: 'delta', text: chunk })}\n`);
      await wait(COACH_STREAM_CHUNK_DELAY_MS);
    }

    res.write(`${JSON.stringify({
      type: 'done',
      answer: coachTurn.assistantText,
      assistantText: coachTurn.assistantText,
      artifact: coachTurn.artifact || null,
      artifacts: coachTurn.artifacts || [],
      mode: coachTurn.mode,
      warning: coachTurn.warning,
      threadId: coachTurn.threadId || ''
    })}\n`);
    res.end();
  } catch (err) {
    res.writeHead(200, {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform'
    });
    res.write(`${JSON.stringify({
      type: 'done',
      answer: buildOfflineCoachAnswer('Fallback request', {}),
      assistantText: buildOfflineCoachAnswer('Fallback request', {}),
      artifact: null,
      mode: 'offline',
      warning: `Coach stream error: ${err.message}`,
      threadId: ''
    })}\n`);
    res.end();
  }
}

async function readJsonBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    const piece = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += piece.length;
    if (total > 1_000_000) {
      throw new Error('Request body too large.');
    }
    chunks.push(piece);
  }
  const text = Buffer.concat(chunks).toString('utf8').trim();
  if (!text) return {};
  return JSON.parse(text);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunkTextForStream(text) {
  const source = String(text || '').trim();
  if (!source) return [];
  const words = source.split(/\s+/).filter(Boolean);
  const chunks = [];
  let cursor = '';
  words.forEach((word) => {
    const candidate = cursor ? `${cursor} ${word}` : word;
    if (candidate.length > 26) {
      if (cursor) chunks.push(`${cursor} `);
      cursor = word;
    } else {
      cursor = candidate;
    }
  });
  if (cursor) chunks.push(cursor);
  return chunks;
}

async function generateCoachTurn(parsed = {}) {
  const normalized = normalizeCoachRequest(parsed);
  const { question, context, threadId, messages } = normalized;
  if (!question) {
    throw new Error('Question is required.');
  }

  const systemPrompt = buildCoachSystemPrompt();
  const providerMessages = appendContextToConversation(messages, context, question);
  const warnings = [];
  let rawAnswer = '';
  let mode = 'offline';

  const order = resolveCoachProviderOrder();
  for (const provider of order) {
    if (provider === 'ollama') {
      const result = await requestOllamaCoach(systemPrompt, providerMessages);
      if (result?.answer) {
        rawAnswer = result.answer;
        mode = result.mode || 'ollama';
        break;
      }
      if (result?.warning) warnings.push(result.warning);
    }

    if (provider === 'openai') {
      const result = await requestOpenAiCoach(systemPrompt, providerMessages);
      if (result?.answer) {
        rawAnswer = result.answer;
        mode = result.mode || 'openai';
        break;
      }
      if (result?.warning) warnings.push(result.warning);
    }

    if (provider === 'pollinations') {
      const result = await requestPollinationsCoach(systemPrompt, providerMessages);
      if (result?.answer) {
        rawAnswer = result.answer;
        mode = result.mode || 'pollinations';
        break;
      }
      if (result?.warning) warnings.push(result.warning);
    }
  }

  if (!rawAnswer) {
    rawAnswer = buildOfflineCoachAnswer(question, context);
    mode = 'offline';
  }

  const structured = extractStructuredCoachResponse(rawAnswer, {
    question,
    context
  });

  return {
    threadId,
    assistantText: structured.assistantText,
    artifact: structured.artifact || null,
    artifacts: structured.artifacts || [],
    mode,
    warning: warnings.length ? warnings.join(' | ') : undefined
  };
}

function appendContextToConversation(messages, context, question) {
  const base = Array.isArray(messages) ? messages.map((entry) => ({ ...entry })) : [];
  const contextPayload = JSON.stringify(context || {});
  if (!base.length) {
    return [{ role: 'user', content: `Question: ${question}\nContext JSON: ${contextPayload}` }];
  }
  const last = base[base.length - 1];
  if (last.role === 'user') {
    last.content = `${last.content}\nContext JSON: ${contextPayload}`;
    return base;
  }
  base.push({ role: 'user', content: `Question: ${question}\nContext JSON: ${contextPayload}` });
  return base;
}

function normalizeCoachRequest(parsed = {}) {
  const context = parsed?.context && typeof parsed.context === 'object' ? parsed.context : {};
  const directQuestion = String(parsed?.question || '').trim();
  const threadId = String(parsed?.threadId || '').trim();
  const history = sanitizeCoachMessages(parsed?.messages);
  const inferredQuestion = directQuestion || history.filter((entry) => entry.role === 'user').at(-1)?.content || '';
  const question = String(inferredQuestion || '').trim();

  const messages = history.length ? history : (question ? [{ role: 'user', content: question }] : []);
  if (!messages.length && question) {
    messages.push({ role: 'user', content: question });
  }
  const tail = messages[messages.length - 1];
  if (tail?.role !== 'user' || tail?.content !== question) {
    messages.push({ role: 'user', content: question });
  }
  return {
    question,
    context,
    threadId,
    messages: messages.slice(-COACH_MAX_HISTORY_MESSAGES)
  };
}

function sanitizeCoachMessages(input) {
  if (!Array.isArray(input)) return [];
  return input
    .map((entry) => {
      const role = String(entry?.role || '').toLowerCase();
      const content = String(entry?.content || '').trim();
      if (!content) return null;
      if (role !== 'user' && role !== 'assistant') return null;
      return { role, content };
    })
    .filter(Boolean)
    .slice(-COACH_MAX_HISTORY_MESSAGES);
}

function buildCoachSystemPrompt() {
  return [
    'You are an expert adult piano teacher and practice coach for the Baby Steps Piano app.',
    'You teach with clear pedagogy, musical context, and concrete drills.',
    'Use direct language and practical examples.',
    'Always include harmony explanation, why it works, and a 12-minute micro-session.',
    '',
    '## RESPONSE FORMAT',
    'Return strict JSON with these top-level keys:',
    '{ "assistantText": string, "artifact": object|null, "artifacts": object[] }',
    '',
    '## ARTIFACT SCHEMAS',
    'Include relevant artifacts to make your response interactive. Each artifact needs a "type" field.',
    '',
    'CHORD_SEQUENCE: { type:"chord_sequence", title:string, key:string, bpm:number, playbackPolicy:{mode:"fixed_sequence"|"circular_row_sweep"}, sequence:[{chord:string, root:string, quality:string, beats:number}], quiz:{prompt:string, conceptId:string} }',
    'LESSON_CARD: { type:"lesson_card", lessonId:string, title:string, tier:number(1-4), description:string }',
    'PLAYABLE_SCORE: { type:"playable_score", title:string, abc:string(ABC notation), key:string, bpm:number }',
    'KANBAN_TASK: { type:"kanban_task", title:string, lane:"todo"|"doing"|"done", description:string, lessonId?:string }',
    'THEORY_CONCEPT: { type:"theory_concept", title:string, facts:string[], relatedLessons:string[] }',
    'QUIZ_CHALLENGE: { type:"quiz_challenge", question:string, options:string[], correctIndex:number, explanation:string }',
    'PRACTICE_DRILL: { type:"practice_drill", title:string, instructions:string, durationSec:number, lessonId?:string }',
    '',
    '## DEEP LINKS',
    'In your assistantText, link to lessons using [[Label|route]] wiki syntax.',
    'Example: "Start with [[Major Scales|scales:major]] then try [[Circle of Fifths|foundations:circle-of-fifths]]."',
    'Available lesson route IDs follow the pattern category:lesson-name (e.g. scales:major, chords:triads, rhythm:time-signatures).',
    '',
    '## RULES',
    '- Always include at least one artifact when suggesting practice concepts',
    '- Use deep links [[label|route]] when referencing lessons in text',
    '- For chord drills, always include a chord_sequence artifact',
    '- For theory explanations, include a theory_concept artifact',
    '- For practice suggestions, include a practice_drill or kanban_task artifact'
  ].join('\n');
}

function extractStructuredCoachResponse(rawAnswer, { question, context }) {
  const parsed = tryParseJsonFromText(rawAnswer);
  if (parsed && typeof parsed === 'object') {
    const assistantText = String(parsed.assistantText || parsed.answer || '').trim();

    // Support both singular artifact and artifacts array
    let artifacts = [];
    if (Array.isArray(parsed.artifacts) && parsed.artifacts.length) {
      artifacts = parsed.artifacts
        .map(a => normalizeCoachArtifact(a, { question, context }))
        .filter(Boolean);
    }
    const singleArtifact = normalizeCoachArtifact(parsed.artifact, { question, context });
    if (singleArtifact && !artifacts.length) {
      artifacts = [singleArtifact];
    }

    if (assistantText) {
      const fallback = buildFallbackCoachArtifact(question, context);
      return {
        assistantText,
        artifact: artifacts[0] || fallback,
        artifacts: artifacts.length ? artifacts : (fallback ? [fallback] : [])
      };
    }
  }
  const fallback = buildFallbackCoachArtifact(question, context);
  return {
    assistantText: String(rawAnswer || '').trim(),
    artifact: fallback,
    artifacts: fallback ? [fallback] : []
  };
}

function tryParseJsonFromText(raw) {
  const text = String(raw || '').trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // Continue.
  }
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1]);
    } catch {
      return null;
    }
  }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    } catch {
      return null;
    }
  }
  return null;
}

function normalizeCoachArtifact(rawArtifact, { question, context }) {
  if (!rawArtifact || typeof rawArtifact !== 'object') return null;
  const title = String(rawArtifact.title || '').trim();
  const type = String(rawArtifact.type || '').trim();
  const key = normalizeKeyName(rawArtifact.key || context?.key || 'C');
  const bpm = clampNumber(rawArtifact.bpm, Number(context?.tempo) || 80, 30, 240);
  const policyMode = String(rawArtifact?.playbackPolicy?.mode || 'fixed_sequence').trim();
  const sequence = normalizeArtifactSequence(rawArtifact.sequence, key);
  if (!title || !type || !sequence.length) return null;
  const playbackPolicy = {
    mode: policyMode === 'circular_row_sweep' ? 'circular_row_sweep' : 'fixed_sequence',
    circularResolve: policyMode === 'circular_row_sweep',
    finalConfetti: policyMode === 'circular_row_sweep'
  };
  const quizPrompt = String(rawArtifact?.quiz?.prompt || '').trim();
  const conceptId = String(rawArtifact?.quiz?.conceptId || '').trim() || inferConceptIdFromQuestion(question, context);
  return {
    id: String(rawArtifact.id || `coach-${Date.now()}`).trim(),
    title,
    type,
    key,
    bpm,
    playbackPolicy,
    sequence,
    quiz: {
      prompt: quizPrompt || `Recreate ${title} in another key.`,
      conceptId
    },
    actions: ['play', 'try', 'save_to_stack', 'open_full_lesson']
  };
}

function normalizeArtifactSequence(rawSequence, key) {
  if (!Array.isArray(rawSequence)) return [];
  const normalized = [];
  rawSequence.forEach((step) => {
    if (!step || typeof step !== 'object') return;
    const root = normalizeKeyName(step.root || parseRootFromChord(step.chord) || key);
    const quality = normalizeChordQuality(step.quality || parseQualityFromChord(step.chord));
    if (!root || !quality) return;
    const chord = String(step.chord || `${root}${qualityToSuffix(quality)}`).trim();
    const beats = clampNumber(step.beats, 2, 1, 8);
    normalized.push({ chord, root, quality, beats });
  });
  return normalized;
}

function buildFallbackCoachArtifact(question, context) {
  const key = normalizeKeyName(context?.key || 'C');
  const cadence = String(context?.cadence || '').toLowerCase();
  const progression = String(context?.progression || '').toLowerCase();
  const questionText = String(question || '').toLowerCase();
  const bpm = clampNumber(context?.tempo, 80, 30, 240);

  let sequence = [];
  let title = '';
  let type = 'progression_drill';
  let conceptId = 'core-harmony';

  if (cadence.includes('plagal') || questionText.includes('plagal')) {
    sequence = [
      buildDegreeStep(key, 4, 'major', 2),
      buildDegreeStep(key, 1, 'major', 2)
    ];
    title = `Plagal Cadence in ${key}`;
    type = 'cadence_drill';
    conceptId = 'cadence-plagal';
  } else if (cadence.includes('deceptive') || questionText.includes('deceptive')) {
    sequence = [
      buildDegreeStep(key, 5, 'dom7', 2),
      buildDegreeStep(key, 6, 'minor', 2)
    ];
    title = `Deceptive Cadence in ${key}`;
    type = 'cadence_drill';
    conceptId = 'cadence-deceptive';
  } else if (cadence.includes('half') || questionText.includes('half cadence')) {
    sequence = [
      buildDegreeStep(key, 2, 'minor', 2),
      buildDegreeStep(key, 5, 'dom7', 2)
    ];
    title = `Half Cadence in ${key}`;
    type = 'cadence_drill';
    conceptId = 'cadence-half';
  } else if (cadence.includes('authentic') || questionText.includes('authentic') || questionText.includes('v7')) {
    sequence = [
      buildDegreeStep(key, 5, 'dom7', 2),
      buildDegreeStep(key, 1, 'major', 2)
    ];
    title = `Authentic Cadence in ${key}`;
    type = 'cadence_drill';
    conceptId = 'cadence-authentic';
  } else if (progression.includes('ii-v-i') || questionText.includes('ii-v-i')) {
    sequence = [
      buildDegreeStep(key, 2, 'min7', 2),
      buildDegreeStep(key, 5, 'dom7', 2),
      buildDegreeStep(key, 1, 'maj7', 2)
    ];
    title = `ii-V-I Builder in ${key}`;
    type = 'progression_drill';
    conceptId = 'progression-ii-v-i';
  } else {
    sequence = [
      buildDegreeStep(key, 1, 'major', 2),
      buildDegreeStep(key, 4, 'major', 2),
      buildDegreeStep(key, 5, 'dom7', 2),
      buildDegreeStep(key, 1, 'major', 2)
    ];
    title = `Functional Harmony Loop in ${key}`;
    type = 'progression_drill';
    conceptId = 'progression-functional';
  }

  if (!sequence.length) return null;
  return {
    id: `coach-${Date.now()}`,
    title,
    type,
    key,
    bpm,
    playbackPolicy: {
      mode: 'fixed_sequence',
      circularResolve: false,
      finalConfetti: false
    },
    sequence,
    quiz: {
      prompt: `Play this concept in a new key: ${title}.`,
      conceptId
    },
    actions: ['play', 'try', 'save_to_stack', 'open_full_lesson']
  };
}

function buildDegreeStep(key, degree, quality, beats) {
  const root = degreeToRoot(key, degree);
  return {
    chord: `${root}${qualityToSuffix(quality)}`,
    root,
    quality,
    beats
  };
}

function degreeToRoot(key, degree) {
  const majorScaleSemitones = [0, 2, 4, 5, 7, 9, 11];
  const tonicPc = noteNameToPitchClass(key);
  const idx = Math.max(1, Math.min(7, Number(degree) || 1)) - 1;
  const pc = (tonicPc + majorScaleSemitones[idx]) % 12;
  return NOTE_NAMES_SHARP[pc];
}

function noteNameToPitchClass(note) {
  const value = NOTE_NAME_TO_PITCH_CLASS[String(note || '').trim()];
  if (Number.isFinite(value)) return value;
  return 0;
}

function normalizeKeyName(value) {
  const text = String(value || '').trim();
  if (!text) return 'C';
  const normalized = text.length > 1 ? `${text[0].toUpperCase()}${text.slice(1)}` : text.toUpperCase();
  if (Number.isFinite(NOTE_NAME_TO_PITCH_CLASS[normalized])) return normalized;
  return 'C';
}

function normalizeChordQuality(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  const alias = {
    '': 'major',
    major: 'major',
    maj: 'major',
    minor: 'minor',
    min: 'minor',
    m: 'minor',
    dim: 'diminished',
    diminished: 'diminished',
    maj7: 'maj7',
    major7: 'maj7',
    min7: 'min7',
    m7: 'min7',
    dom7: 'dom7',
    dominant7: 'dom7',
    '7': 'dom7',
    m7b5: 'm7b5',
    halfdiminished: 'm7b5'
  };
  return alias[raw] || '';
}

function parseRootFromChord(chordSymbol) {
  const text = String(chordSymbol || '').trim();
  const match = text.match(/^([A-G](?:#|b)?)/);
  return match ? normalizeKeyName(match[1]) : '';
}

function parseQualityFromChord(chordSymbol) {
  const text = String(chordSymbol || '').trim();
  if (!text) return '';
  if (/m7b5/i.test(text)) return 'm7b5';
  if (/maj7/i.test(text)) return 'maj7';
  if (/m7/i.test(text)) return 'min7';
  if (/dim/i.test(text)) return 'diminished';
  if (/m(?!aj)/i.test(text)) return 'minor';
  if (/7/.test(text)) return 'dom7';
  return 'major';
}

function qualityToSuffix(quality) {
  const q = normalizeChordQuality(quality);
  if (q === 'major') return '';
  if (q === 'minor') return 'm';
  if (q === 'diminished') return 'dim';
  if (q === 'maj7') return 'maj7';
  if (q === 'min7') return 'm7';
  if (q === 'dom7') return '7';
  if (q === 'm7b5') return 'm7b5';
  return '';
}

function clampNumber(value, fallback, min, max) {
  const num = Number(value);
  const safe = Number.isFinite(num) ? num : fallback;
  return Math.max(min, Math.min(max, safe));
}

function inferConceptIdFromQuestion(question, context) {
  const text = `${question || ''} ${context?.cadence || ''} ${context?.progression || ''}`.toLowerCase();
  if (text.includes('plagal')) return 'cadence-plagal';
  if (text.includes('deceptive')) return 'cadence-deceptive';
  if (text.includes('half')) return 'cadence-half';
  if (text.includes('authentic') || text.includes('v7')) return 'cadence-authentic';
  if (text.includes('ii-v-i')) return 'progression-ii-v-i';
  return 'core-harmony';
}

function resolveCoachProviderOrder() {
  if (COACH_PROVIDER === 'openai') return ['openai', 'ollama', 'pollinations'];
  if (COACH_PROVIDER === 'ollama') return ['ollama', 'openai', 'pollinations'];
  if (COACH_PROVIDER === 'pollinations') return ['pollinations', 'ollama', 'openai'];
  if (COACH_PROVIDER === 'offline') return [];
  return ['ollama', 'openai', 'pollinations'];
}

async function handleCoachStatus(req, res) {
  const ollama = await probeOllamaStatus();
  const pollinations = await probePollinationsStatus();
  sendJson(res, 200, {
    providerPreference: COACH_PROVIDER,
    activeOrder: resolveCoachProviderOrder(),
    openaiConfigured: Boolean(OPENAI_API_KEY),
    openaiModel: OPENAI_MODEL,
    ollama,
    pollinations,
    recommendation: ollama.reachable && ollama.modelInstalled
      ? 'Local Gemma is ready.'
      : Boolean(OPENAI_API_KEY)
        ? 'OpenAI is configured and will be used when local Ollama is unavailable.'
        : pollinations.reachable
          ? 'No local model detected. Cloud fallback is enabled.'
          : 'No online provider is currently available; fallback coach responses only.'
  });
}

async function handleRepertoireMidiProxy(req, res, reqUrl) {
  const target = String(reqUrl.searchParams.get('url') || '').trim();
  if (!target) {
    sendJson(res, 400, { error: 'Missing url query parameter.' });
    return;
  }

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    sendJson(res, 400, { error: 'Invalid MIDI source URL.' });
    return;
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    sendJson(res, 400, { error: 'Only http/https URLs are supported.' });
    return;
  }

  try {
    const response = await fetchWithTimeout(parsed.toString(), { method: 'GET' }, 15000);
    if (!response.ok) {
      sendJson(res, 502, { error: `Upstream MIDI request failed (${response.status}).` });
      return;
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.writeHead(200, {
      'Content-Type': 'audio/midi',
      'Cache-Control': 'public, max-age=43200'
    });
    res.end(buffer);
  } catch (error) {
    sendJson(res, 502, { error: `Unable to fetch MIDI: ${error.message}` });
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function requestOllamaCoach(systemPrompt, conversationMessages) {
  const ollamaBase = String(OLLAMA_URL || '').trim();
  if (!ollamaBase) {
    return { warning: 'Ollama URL is not configured.' };
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(Array.isArray(conversationMessages) ? conversationMessages : [])
  ];

  try {
    const response = await fetchWithTimeout(`${ollamaBase.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages,
        options: {
          temperature: 0.3
        }
      })
    }, 12000);

    const payload = await response.json();
    if (!response.ok) {
      return { warning: payload?.error || `Ollama request failed (${response.status}).` };
    }

    const answer = String(payload?.message?.content || payload?.response || '').trim();
    if (!answer) {
      const transcript = messages
        .map((entry) => `${entry.role.toUpperCase()}: ${entry.content}`)
        .join('\n');
      const generateFallback = await fetchWithTimeout(`${ollamaBase.replace(/\/$/, '')}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          stream: false,
          prompt: transcript,
          options: { temperature: 0.3 }
        })
      }, 12000);
      const fallbackPayload = await generateFallback.json();
      const fallbackAnswer = String(fallbackPayload?.response || '').trim();
      if (!fallbackAnswer) {
        return { warning: 'Ollama returned an empty response.' };
      }
      return { answer: fallbackAnswer, mode: 'ollama' };
    }
    return { answer, mode: 'ollama' };
  } catch (error) {
    return { warning: `Ollama unavailable: ${error.message}` };
  }
}

async function requestOpenAiCoach(systemPrompt, conversationMessages) {
  if (!OPENAI_API_KEY) {
    return { warning: 'OpenAI API key is not configured.' };
  }

  try {
    const apiRes = await fetchWithTimeout('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: [
          { role: 'system', content: systemPrompt },
          ...(Array.isArray(conversationMessages) ? conversationMessages : [])
        ],
        max_output_tokens: 500
      })
    }, 14000);

    const apiJson = await apiRes.json();
    if (!apiRes.ok) {
      return { warning: apiJson?.error?.message || `OpenAI request failed (${apiRes.status}).` };
    }

    const answer = extractResponseText(apiJson);
    if (!answer) {
      return { warning: 'OpenAI returned an empty response.' };
    }
    return { answer, mode: 'openai' };
  } catch (error) {
    return { warning: `OpenAI unavailable: ${error.message}` };
  }
}

async function requestPollinationsCoach(systemPrompt, conversationMessages) {
  if (!POLLINATIONS_ENABLED) {
    return { warning: 'Pollinations fallback is disabled.' };
  }

  try {
    const response = await fetchWithTimeout(POLLINATIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'curl/8.4.0'
      },
      body: JSON.stringify({
        model: POLLINATIONS_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...(Array.isArray(conversationMessages) ? conversationMessages : [])
        ],
        temperature: 0.3
      })
    }, 14000);

    const raw = await response.text();
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return { warning: `Pollinations returned non-JSON response (${response.status}).` };
    }
    if (!response.ok) {
      return { warning: payload?.error?.message || `Pollinations request failed (${response.status}).` };
    }

    const answer = extractChatCompletionText(payload);
    if (!answer) {
      return { warning: 'Pollinations returned an empty response.' };
    }
    return { answer, mode: 'pollinations' };
  } catch (error) {
    return { warning: `Pollinations unavailable: ${error.message}` };
  }
}

function buildOfflineCoachAnswer(question, context) {
  const key = String(context?.key || 'C');
  const progression = String(context?.progression || 'I-vi-IV-V (Pop)');
  const cadence = String(context?.cadence || 'Authentic (V-I)');
  const cadenceEmotion = String(context?.cadenceEmotion || 'resolved and grounded');
  const chord = String(context?.chord || `${key}`);
  const tempo = Number(context?.tempo) || 90;
  const intent = detectCoachIntent(question);
  const theory = buildLocalTheoryExplanation(intent, {
    key,
    progression,
    cadence,
    cadenceEmotion,
    chord
  });
  const appDrill = buildLocalAppDrill(intent, {
    key,
    progression,
    cadence,
    chord
  });
  const transfer = buildLocalTransferPrompt(intent, {
    key,
    progression,
    cadence
  });

  return [
    `Local Coach (${intent.label}).`,
    `Question focus: ${question}.`,
    `Why it works: ${theory}`,
    `Try it in the app now: ${appDrill}`,
    `12-minute micro-session @ ${tempo} BPM:`,
    `1) 4 min: play ${progression} in ${key} with steady pulse and clean releases.`,
    `2) 4 min: keep LH roots/shells; in RH, move only one guide tone at a time.`,
    `3) 4 min: create a 2-bar motif and loop it through the full progression.`,
    `Transfer to real piano: ${transfer}`,
    `Checkpoint: record one clean pass where the ${cadence} cadence still feels ${cadenceEmotion}.`
  ].join(' ');
}

function detectCoachIntent(question) {
  const q = String(question || '').toLowerCase();
  if (/(voicing|voice[- ]?leading|voice[- ]?lead|inversion|guide tone)/.test(q)) {
    return { key: 'voicing', label: 'Voicing + Voice-Leading' };
  }
  if (/(scale|mode|pentatonic|color|diminished|whole tone)/.test(q)) {
    return { key: 'scale', label: 'Scale + Color' };
  }
  if (/(cadence|resolve|resolution|authentic|plagal|deceptive|half)/.test(q)) {
    return { key: 'cadence', label: 'Cadence Mechanics' };
  }
  if (/(ear|hear|recognize|listen)/.test(q)) {
    return { key: 'ear', label: 'Ear Training' };
  }
  return { key: 'general', label: 'Core Harmony' };
}

function buildLocalTheoryExplanation(intent, data) {
  if (intent.key === 'voicing') {
    return `In ${data.key}, treat ${data.chord} as the anchor and connect voices with the smallest motion between chords in ${data.progression}.`;
  }
  if (intent.key === 'scale') {
    return `Use ${data.key} chord tones as landing notes; scales are color between stable tones, and the ${data.cadence} cadence confirms home.`;
  }
  if (intent.key === 'cadence') {
    return `${data.cadence} works because tension tones lean into stable chord tones, so the listener hears release instead of random motion.`;
  }
  if (intent.key === 'ear') {
    return `Hearing improves when you predict the next harmony before playing; ${data.progression} gives a repeatable tension-release map in ${data.key}.`;
  }
  return `In ${data.key}, ${data.progression} creates direction; ${data.cadence} closes the phrase with a ${data.cadenceEmotion} finish.`;
}

function buildLocalAppDrill(intent, data) {
  if (intent.key === 'voicing') {
    return `Open Chords tab, hold each chord in ${data.progression}, and compare only the notes that changed before releasing.`;
  }
  if (intent.key === 'scale') {
    return `Play a scale row in Scales, then immediately play a matching chord row so you hear scale-to-chord targeting in one key.`;
  }
  if (intent.key === 'cadence') {
    return `Open Cadences and trigger ${data.cadence}, then transpose to 2 nearby keys and compare emotional pull.`;
  }
  if (intent.key === 'ear') {
    return `Play a progression sweep, pause before the last chord, sing the target note, then check accuracy by playing it.`;
  }
  return `Use ${data.chord} as your start voicing, then run ${data.progression} at tempo and keep timing locked.`;
}

function buildLocalTransferPrompt(intent, data) {
  if (intent.key === 'voicing') {
    return `On piano, keep top voice nearly static while moving through ${data.progression} in ${data.key}.`;
  }
  if (intent.key === 'scale') {
    return `On piano, improvise one short phrase per chord, landing on a chord tone at each change.`;
  }
  if (intent.key === 'cadence') {
    return `Play the cadence in ${data.key}, then immediately repeat in two new keys without stopping.`;
  }
  if (intent.key === 'ear') {
    return `Before each chord, say out loud whether you expect tension or release, then verify by playing.`;
  }
  return `Play ${data.progression} in ${data.key} on real piano with no pedal first, then add pedal only after timing is clean.`;
}

function extractResponseText(payload) {
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload.output) ? payload.output : [];
  for (const item of output) {
    const content = Array.isArray(item.content) ? item.content : [];
    for (const part of content) {
      if (typeof part.text === 'string' && part.text.trim()) return part.text.trim();
    }
  }
  return '';
}

function extractChatCompletionText(payload) {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === 'string' && content.trim()) {
    return content.trim();
  }
  if (Array.isArray(content)) {
    const text = content
      .map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .join('')
      .trim();
    if (text) return text;
  }
  return '';
}

async function probeOllamaStatus() {
  const ollamaBase = String(OLLAMA_URL || '').trim();
  if (!ollamaBase) {
    return {
      configured: false,
      reachable: false,
      model: OLLAMA_MODEL,
      modelInstalled: false,
      warning: 'Ollama URL is not configured.'
    };
  }

  try {
    const response = await fetchWithTimeout(`${ollamaBase.replace(/\/$/, '')}/api/tags`, { method: 'GET' }, 2000);
    if (!response.ok) {
      return {
        configured: true,
        reachable: false,
        model: OLLAMA_MODEL,
        modelInstalled: false,
        warning: `Ollama tags failed (${response.status}).`
      };
    }

    const payload = await response.json();
    const models = Array.isArray(payload?.models) ? payload.models : [];
    const installedNames = models.map((model) => String(model?.name || '').trim());
    const modelInstalled = installedNames.includes(OLLAMA_MODEL);
    return {
      configured: true,
      reachable: true,
      model: OLLAMA_MODEL,
      modelInstalled
    };
  } catch (error) {
    return {
      configured: true,
      reachable: false,
      model: OLLAMA_MODEL,
      modelInstalled: false,
      warning: `Ollama unreachable: ${error.message}`
    };
  }
}

async function probePollinationsStatus() {
  if (!POLLINATIONS_ENABLED) {
    return {
      enabled: false,
      reachable: false,
      url: POLLINATIONS_URL,
      model: POLLINATIONS_MODEL,
      warning: 'Pollinations is disabled by config.'
    };
  }

  try {
    const response = await fetchWithTimeout(POLLINATIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'curl/8.4.0'
      },
      body: JSON.stringify({
        model: POLLINATIONS_MODEL,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 8
      })
    }, 3000);

    const raw = await response.text();
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    const reachable = response.ok && Boolean(extractChatCompletionText(parsed || {}));
    return {
      enabled: true,
      reachable,
      url: POLLINATIONS_URL,
      model: POLLINATIONS_MODEL,
      warning: reachable ? undefined : `Pollinations probe failed (${response.status}).`
    };
  } catch (error) {
    return {
      enabled: true,
      reachable: false,
      url: POLLINATIONS_URL,
      model: POLLINATIONS_MODEL,
      warning: `Pollinations unreachable: ${error.message}`
    };
  }
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'POST' && reqUrl.pathname === '/api/coach') {
    void handleCoach(req, res);
    return;
  }

  if (req.method === 'POST' && reqUrl.pathname === '/api/coach/stream') {
    void handleCoachStream(req, res);
    return;
  }

  if (req.method === 'GET' && reqUrl.pathname === '/api/coach/status') {
    handleCoachStatus(req, res);
    return;
  }

  if (req.method === 'GET' && reqUrl.pathname === '/api/repertoire/midi') {
    handleRepertoireMidiProxy(req, res, reqUrl);
    return;
  }

  if (req.method === 'GET' && reqUrl.pathname === '/api/config') {
    sendJson(res, 200, {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
    });
    return;
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const filePath = safePath(reqUrl.pathname);
  if (!filePath) {
    sendJson(res, 400, { error: 'Invalid path' });
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        sendJson(res, 404, { error: 'Not found' });
        return;
      }
      sendJson(res, 500, { error: 'Failed to read file' });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Baby Steps server running on http://localhost:${PORT}`);
});
