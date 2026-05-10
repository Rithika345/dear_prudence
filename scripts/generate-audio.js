// Generate pre-recorded ElevenLabs audio for all phrase cards
// Run: node scripts/generate-audio.js
// Requires ELEVENLABS_API_KEY in .env

import { config } from 'dotenv';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
config();

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';

if (!API_KEY) { console.error('Set ELEVENLABS_API_KEY in .env'); process.exit(1); }

const PHRASES = {
  hindi: [
    'क्या इस व्यंजन में दूध या प्याज़ है?',
    'मुझे गंभीर एलर्जी है। कृपया रसोई से पुष्टि करें।',
    'क्या यह दूध और प्याज़ के बिना बनाया जा सकता है?',
    'यदि मैंने यह खाया तो मेरी जान जा सकती है। यह आपातकाल है।',
    'मुझे एलर्जी की प्रतिक्रिया हो रही है। एम्बुलेंस बुलाएँ।',
  ],
  french: [
    'Est-ce que ce plat contient des cacahuètes ou des fruits à coque ?',
    "J'ai une allergie grave aux cacahuètes. Veuillez confirmer avec le chef.",
    'Peut-on préparer ce plat sans aucun fruit à coque et sans traces ?',
    "Je pourrais mourir si je mange des cacahuètes. C'est une urgence médicale.",
    "Je fais une réaction allergique. Appelez le SAMU, s'il vous plaît.",
  ],
  japanese: [
    'この料理に小麦や甲殻類は入っていますか。',
    'セリアック病と甲殻類アレルギーがあります。厨房に確認してください。',
    '醤油と小麦を使わずに作れますか。',
    '小麦で重症になる可能性があります。これは医療上の緊急事態です。',
    'アレルギー反応が出ています。救急車を呼んでください。',
  ],
  spanish: [
    '¿Este plato contiene huevo o pescado?',
    'Tengo enfermedad renal e intolerancia a la histamina. Por favor confirme los ingredientes.',
    '¿Se puede preparar sin ingredientes fermentados o curados y sin alimentos altos en potasio?',
    'Mi condición podría empeorar gravemente. Es una emergencia médica.',
    'Me siento muy mal. Por favor llame a una ambulancia.',
  ],
};

async function generateAudio(text, filename) {
  console.log(`  Generating: ${filename}`);
  const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'xi-api-key': API_KEY },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.75, similarity_boost: 0.75, style: 0.5 },
    }),
  });
  if (!resp.ok) { console.error(`  FAILED: ${resp.status} ${await resp.text()}`); return; }
  const buf = Buffer.from(await resp.arrayBuffer());
  writeFileSync(filename, buf);
  console.log(`  ✓ ${filename} (${(buf.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  const dir = './public/audio';
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  for (const [lang, texts] of Object.entries(PHRASES)) {
    console.log(`\n--- ${lang} ---`);
    for (let i = 0; i < texts.length; i++) {
      await generateAudio(texts[i], `${dir}/${lang}_phrase_${i}.mp3`);
      // Rate limit: wait 500ms between requests
      await new Promise(r => setTimeout(r, 500));
    }
  }
  console.log('\n✓ All audio files generated.\n');
}

main().catch(console.error);
