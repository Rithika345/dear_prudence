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
  thai: [
    'อาหารจานนี้มีถั่วลิสงไหม',
    'ฉันแพ้ถั่วลิสงรุนแรง โปรดยืนยันกับเชฟ',
    'ทำโดยไม่ใส่ถั่วและน้ำพริกถั่วได้ไหม',
    'ฉันอาจตายได้ถ้ากินถั่วลิสง นี่คือเหตุฉุกเฉินทางการแพทย์',
    'ฉันกำลังแพ้อาหารรุนแรง โปรดเรียกรถพยาบาล',
  ],
  japanese: [
    'この料理に小麦や甲殻類は入っていますか。',
    'セリアック病と甲殻類アレルギーがあります。厨房に確認してください。',
    '醤油と小麦を使わずに作れますか。',
    '小麦で重症になる可能性があります。これは医療上の緊急事態です。',
    'アレルギー反応が出ています。救急車を呼んでください。',
  ],
  kannada: [
    'ಈ ಖಾದ್ಯದಲ್ಲಿ ಮೊಟ್ಟೆ ಅಥವಾ ಮೀನು ಇದೆಯೇ?',
    'ನನಗೆ ಸಿಕೆಡಿ ಮತ್ತು ಹಿಸ್ಟಮಿನ್ ಅಸಹಿಷ್ಣುತೆ ಇದೆ. ಪದಾರ್ಥಗಳನ್ನು ದೃಢೀಕರಿಸಿ.',
    'ಹುದುಗಿಸಿದ ಬೆಲ್ಲ ಮತ್ತು ಹೆಚ್ಚು ಪೊಟಾಸಿಯಂ ಪದಾರ್ಥಗಳಿಲ್ಲದೆ ಇದನ್ನು ಮಾಡಬಹುದೇ?',
    'ನನ್ನ ಆರೋಗ್ಯ ಸ್ಥಿತಿ ಗಂಭೀರವಾಗಬಹುದು. ಇದು ವೈದ್ಯಕೀಯ ಕಾಳಜಿ.',
    'ನನಗೆ ಅಸ್ವಸ್ಥವಾಗಿದೆ. ದಯವಿಟ್ಟು ಆಂಬುಲೆನ್ಸ್ ಕರೆಯಿರಿ.',
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
