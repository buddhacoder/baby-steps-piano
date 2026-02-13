const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

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
  '.wav': 'audio/wav'
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
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > 1_000_000) req.destroy();
  });

  req.on('end', async () => {
    try {
      const parsed = JSON.parse(body || '{}');
      const question = String(parsed.question || '').trim();
      const context = parsed.context || {};

      if (!question) {
        sendJson(res, 400, { error: 'Question is required.' });
        return;
      }

      if (!OPENAI_API_KEY) {
        sendJson(res, 200, {
          answer: buildOfflineCoachAnswer(question, context),
          mode: 'offline'
        });
        return;
      }

      const systemPrompt = [
        'You are an adult ADHD-friendly piano coach.',
        'Teach clearly, short chunks, practical examples.',
        'Always include: chord/progression theory, when to use it, and a 12-minute micro-session.',
        'Use supportive but direct language and avoid fluff.'
      ].join(' ');

      const userPrompt = [
        `Question: ${question}`,
        `Context JSON: ${JSON.stringify(context)}`
      ].join('\n');

      const apiRes = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          input: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_output_tokens: 500
        })
      });

      const apiJson = await apiRes.json();

      if (!apiRes.ok) {
        sendJson(res, 200, {
          answer: buildOfflineCoachAnswer(question, context),
          mode: 'offline',
          warning: apiJson?.error?.message || 'OpenAI request failed.'
        });
        return;
      }

      const answer = extractResponseText(apiJson);
      sendJson(res, 200, { answer: answer || 'No coach response generated.' });
    } catch (err) {
      sendJson(res, 200, {
        answer: buildOfflineCoachAnswer('Fallback request', {}),
        mode: 'offline',
        warning: `Coach error: ${err.message}`
      });
    }
  });
}

function buildOfflineCoachAnswer(question, context) {
  const key = String(context?.key || 'C');
  const progression = String(context?.progression || 'I-vi-IV-V (Pop)');
  const cadence = String(context?.cadence || 'Authentic (V-I)');
  const cadenceEmotion = String(context?.cadenceEmotion || 'resolved and grounded');
  const chord = String(context?.chord || `${key}`);
  const tempo = Number(context?.tempo) || 90;
  return [
    `Offline Coach (no API key):`,
    `Question focus: ${question}`,
    `Theory: In ${key}, treat ${chord} as your anchor voicing and connect voice-leading through ${progression}.`,
    `Cadence focus: ${cadence}. Emotional rationale: ${cadenceEmotion}.`,
    `Use-case: Keep LH roots or shells, RH triads/7ths, and target one guide tone movement per chord.`,
    `12-minute plan:`,
    `1) 4 min @ ${tempo} BPM: play progression with whole-note chords, no pedal.`,
    `2) 4 min: keep LH minimal, add RH color tones (7th or 9th where stable).`,
    `3) 4 min: improvise a 2-bar motif and repeat it through each chord.`,
    `Check: if timing slips, drop tempo by 10 and prioritize smooth transitions.`
  ].join(' ');
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

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'POST' && reqUrl.pathname === '/api/coach') {
    handleCoach(req, res);
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
