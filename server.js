import express from 'express';
import { readFileSync, existsSync } from 'fs';
import { spawn } from 'child_process';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3001;

// Serve static files
app.use(express.static(join(__dirname, 'public')));
app.use('/audio', express.static(join(__dirname, 'public', 'audio')));

// ─── CLAUDE API ───
app.post('/api/claude', async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'No ANTHROPIC_API_KEY' });
  const { systemPrompt, userMessage, imageBase64, mediaType } = req.body;
  try {
    const messages = [];
    if (imageBase64) {
      messages.push({ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 } },
        { type: 'text', text: userMessage },
      ]});
    } else {
      messages.push({ role: 'user', content: userMessage });
    }
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt || '',
        messages,
      }),
    });
    const data = await resp.json();
    const content = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    res.json({ content });
  } catch (e) {
    console.error('Claude error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── ELEVENLABS TTS ───
app.post('/api/tts', async (req, res) => {
  if (!process.env.ELEVENLABS_API_KEY) return res.status(503).json({ error: 'No ELEVENLABS_API_KEY' });
  const { text, language } = req.body;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';
  try {
    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': process.env.ELEVENLABS_API_KEY },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.75, similarity_boost: 0.75, style: 0.5 },
      }),
    });
    if (!resp.ok) throw new Error(`ElevenLabs ${resp.status}`);
    const buf = await resp.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(buf));
  } catch (e) {
    console.error('TTS error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── CACTUS TRANSCRIPTION BRIDGE ───
let cactusProc = null;
let cactusText = '';

app.post('/api/cactus/transcribe/start', (req, res) => {
  const cPath = process.env.CACTUS_PATH || './cactus';
  if (cactusProc) return res.json({ status: 'already_running' });
  try {
    cactusProc = spawn('bash', ['-c', `cd "${cPath}" && source venv/bin/activate && cactus transcribe`], {
      env: { ...process.env, PATH: `${cPath}/venv/bin:${process.env.PATH}` },
    });
    cactusText = '';
    cactusProc.stdout.on('data', d => {
      const t = d.toString();
      if (t && !t.includes('Loading') && !t.includes('Listening') && !t.includes('===='))
        cactusText += ' ' + t.trim();
    });
    cactusProc.stderr.on('data', d => console.error('Cactus:', d.toString()));
    cactusProc.on('close', () => { cactusProc = null; });
    res.json({ status: 'started' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/cactus/transcribe/poll', (req, res) => {
  const t = cactusText.trim();
  cactusText = '';
  res.json({ transcript: t || null });
});

app.post('/api/cactus/transcribe/stop', (req, res) => {
  if (cactusProc) { cactusProc.kill(); cactusProc = null; }
  res.json({ status: 'stopped' });
});

app.post('/api/cactus/transcribe/file', (req, res) => {
  const { filePath } = req.body;
  const cPath = process.env.CACTUS_PATH || './cactus';
  const proc = spawn('bash', ['-c', `cd "${cPath}" && source venv/bin/activate && cactus transcribe --file "${filePath}"`]);
  let out = '';
  proc.stdout.on('data', d => { out += d.toString(); });
  proc.on('close', () => {
    const lines = out.split('\n').filter(l => l.trim() && !l.includes('Loading') && !l.includes('===='));
    res.json({ transcript: lines.join(' ').trim() });
  });
});

// ─── KNOWLEDGE BASE ───
app.get('/api/kb', (req, res) => {
  try {
    const kb = JSON.parse(readFileSync(join(__dirname, 'data', 'knowledge-base.json'), 'utf-8'));
    res.json(kb);
  } catch (e) { res.status(500).json({ error: 'KB load failed' }); }
});

app.get('/api/kb/:cuisine', (req, res) => {
  try {
    const kb = JSON.parse(readFileSync(join(__dirname, 'data', 'knowledge-base.json'), 'utf-8'));
    const dishes = kb.dishes[req.params.cuisine];
    if (!dishes) return res.status(404).json({ error: 'Cuisine not found' });
    res.json({ cuisine: req.params.cuisine, dishes, briefing: kb.cuisine_briefings[req.params.cuisine], phrases: kb.emergency_phrases, conditions: kb.medical_conditions_flags });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', services: { claude: !!process.env.ANTHROPIC_API_KEY, elevenlabs: !!process.env.ELEVENLABS_API_KEY, cactus: !!cactusProc }, ts: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n  Prudence · http://localhost:${PORT}`);
  console.log(`  Claude:     ${process.env.ANTHROPIC_API_KEY ? '✓' : '✗'}`);
  console.log(`  ElevenLabs: ${process.env.ELEVENLABS_API_KEY ? '✓' : '✗'}`);
  console.log(`  Cactus:     bridge ready\n`);
});
