// Prudence — screen components (wired to live engine + APIs)

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ===== Shared =====
const RiskTag = ({ level }) => {
  const cls = { low: 'risk-low', ask: 'risk-ask', avoid: 'risk-avoid', emergency: 'risk-emergency' }[level] || 'risk-ask';
  const text = { low: 'Low', ask: 'Ask', avoid: 'Avoid', emergency: 'Emergency' }[level] || level;
  return <span className={cls}>{text}</span>;
};

const Eyebrow = ({ children, num, style }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 18, ...style }}>
    {num && <span className="numeral" style={{ fontSize: 18, color: 'var(--ink-faint)' }}>{num}</span>}
    <span className="eyebrow">{children}</span>
  </div>
);

const PageTitle = ({ numeral, eyebrow, children, sub }) => (
  <header style={{ marginBottom: 36 }}>
    {eyebrow && (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
        {numeral && <span className="numeral" style={{ fontSize: 22, color: 'var(--ink-mute)' }}>{numeral}</span>}
        <span className="eyebrow">{eyebrow}</span>
      </div>
    )}
    <h1 className="serif italic" style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.01em', color: 'var(--ink)', lineHeight: 1.05, marginBottom: sub ? 14 : 0 }}>{children}</h1>
    {sub && <p style={{ fontSize: 16, color: 'var(--ink-soft)', maxWidth: 560, fontWeight: 300 }}>{sub}</p>}
  </header>
);

// ============================================================
// 0. PIN LOCK — real PBKDF2 encryption
// ============================================================
function PinScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);
  const [encrypting, setEncrypting] = useState(false);

  // Initialize encrypted demo profiles on first load
  useEffect(() => {
    (async () => {
      setEncrypting(true);
      await window.initDemoProfiles(window.PROFILES);
      setEncrypting(false);
    })();
  }, []);

  const press = (k) => {
    if (k === 'del') { setPin(p => p.slice(0, -1)); setErr(false); return; }
    if (pin.length >= 4) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 4) {
      setTimeout(async () => {
        // Try each demo profile
        for (const p of window.PROFILES) {
          const decrypted = await window.unlockDemoProfile(p.id, next);
          if (decrypted) {
            onUnlock(p); // Use the full profile object with metadata
            setPin('');
            return;
          }
        }
        setErr(true);
        setTimeout(() => { setPin(''); setErr(false); }, 500);
      }, 200);
    }
  };

  return (
    <div className="paper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px' }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 920 }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h1 className="serif" style={{ fontSize: 84, fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--ink)', lineHeight: 1 }}>Prudence</h1>
          <p className="serif italic" style={{ fontSize: 20, color: 'var(--ink-mute)', marginTop: 14, fontWeight: 300 }}>Won't you come out to play?</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 56 }}>
          <div className={err ? 'shake' : ''} style={{ display: 'flex', gap: 22, marginBottom: 32 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: pin.length > i ? 'var(--ink)' : 'transparent', border: '1px solid ' + (pin.length > i ? 'var(--ink)' : 'var(--rule-strong)'), transition: 'all 0.12s' }} />
            ))}
          </div>
          {encrypting && <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 16 }}>Encrypting profiles with PBKDF2...</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 4 }}>
            {[1,2,3,4,5,6,7,8,9,'',0,'del'].map((k, i) => (
              <button key={i} onClick={() => k !== '' && press(String(k))} disabled={k === '' || encrypting}
                style={{ height: 64, fontFamily: 'var(--serif)', fontWeight: 300, fontSize: k === 'del' ? 16 : 26, color: k === '' ? 'transparent' : 'var(--ink)', background: 'transparent', borderBottom: k !== '' ? '1px solid var(--rule)' : 'none', cursor: k === '' ? 'default' : 'pointer', transition: 'background 0.12s' }}
                onMouseEnter={e => k !== '' && (e.currentTarget.style.background = 'var(--accent-tint)')}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {k === 'del' ? '\u2190' : k}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            <span className="serif italic" style={{ fontSize: 15, color: 'var(--ink-soft)' }}>Four travellers waiting in the room. Tap to enter.</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--rule)', border: '1px solid var(--rule)' }}>
            {window.PROFILES.map(p => (
              <button key={p.id} onClick={() => onUnlock(p)}
                style={{ background: 'var(--paper)', padding: '24px 20px', textAlign: 'left', cursor: 'pointer', transition: 'background 0.12s', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 160 }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-tint)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--paper)'}>
                <span className="eyebrow">PIN \u00b7 {p.pin}</span>
                <span className="serif italic" style={{ fontSize: 28, fontWeight: 400, color: 'var(--ink)' }}>{p.name}</span>
                <span style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 'auto', lineHeight: 1.45 }}>{p.cuisineLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 1. BODY — allergen profile
// ============================================================
function BodyScreen({ profile }) {
  const isOn = (id) => profile.allergens.includes(id);
  const condOn = (id) => profile.conditions.includes(id);
  const AllergenCell = ({ a }) => {
    const on = isOn(a.id);
    return (
      <div style={{ padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 16, background: on ? 'var(--ink)' : 'transparent', color: on ? 'var(--paper)' : 'var(--ink-soft)', transition: 'all 0.12s' }}>
        <div className="serif italic" style={{ fontSize: 30, fontWeight: 300, lineHeight: 1, width: 28, textAlign: 'center', color: on ? 'var(--paper)' : 'var(--ink-faint)' }}>{a.glyph}</div>
        <div style={{ fontSize: 14, fontWeight: on ? 500 : 300 }}>{a.label}</div>
      </div>
    );
  };
  return (
    <div className="fade-in">
      <PageTitle numeral="i" eyebrow="The body" sub={profile.bio}>Your profile</PageTitle>
      <section style={{ marginBottom: 48 }}>
        <Eyebrow num="i.a">FALCPA 9 \u00b7 top allergens</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--rule)', border: '1px solid var(--rule)' }}>
          {window.ALLERGENS_FALCPA.map(a => <div key={a.id} style={{ background: 'var(--paper)' }}><AllergenCell a={a} /></div>)}
        </div>
      </section>
      <section style={{ marginBottom: 48 }}>
        <Eyebrow num="i.b">Extended</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--rule)', border: '1px solid var(--rule)' }}>
          {window.ALLERGENS_EXT.map(a => <div key={a.id} style={{ background: 'var(--paper)' }}><AllergenCell a={a} /></div>)}
        </div>
      </section>
      <section style={{ marginBottom: 48 }}>
        <Eyebrow num="i.c">Severity</Eyebrow>
        <div style={{ display: 'flex', border: '1px solid var(--rule-strong)' }}>
          {['intolerance', 'moderate', 'anaphylaxis'].map((s, i) => {
            const on = profile.severity === s;
            return <div key={s} style={{ flex: 1, padding: '18px 20px', background: on ? 'var(--ink)' : 'transparent', color: on ? 'var(--paper)' : 'var(--ink-soft)', borderLeft: i > 0 ? '1px solid var(--rule-strong)' : 'none', fontSize: 13, fontWeight: on ? 500 : 300, letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center' }}>{s}</div>;
          })}
        </div>
      </section>
      <section>
        <Eyebrow num="i.d">Medical conditions</Eyebrow>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {window.CONDITIONS.map(c => <span key={c.id} className={'chip ' + (condOn(c.id) ? 'on' : '')}>{c.label}</span>)}
        </div>
      </section>
    </div>
  );
}

// ============================================================
// 2. PLACE — briefing + emergency
// ============================================================
function PlaceScreen({ profile }) {
  const b = window.BRIEFINGS[profile.cuisine];
  if (!b) return null;
  return (
    <div className="fade-in">
      <PageTitle numeral="ii" eyebrow={b.region} sub={b.overview}>The place</PageTitle>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--ink)', borderBottom: '1px solid var(--rule)', marginBottom: 40 }}>
        <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Briefing personalised for <span className="serif italic" style={{ color: 'var(--ink)' }}>{profile.name}</span></span>
        <button className="btn-ghost">Change region</button>
      </div>
      <section style={{ marginBottom: 48 }}>
        <Eyebrow num="ii.a">Threat landscape</Eyebrow>
        {b.threats.map((t, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 110px', gap: 28, padding: '22px 18px', background: t.risk === 'avoid' || t.risk === 'emergency' ? 'var(--accent-tint)' : 'transparent', borderTop: i === 0 ? '1px solid var(--rule)' : 'none', borderBottom: '1px solid var(--rule)', alignItems: 'baseline' }}>
            <div className="serif" style={{ fontSize: 18, fontWeight: 400 }}>{t.name}</div>
            <div style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.55 }}>{t.why}</div>
            <div style={{ textAlign: 'right' }}><RiskTag level={t.risk} /></div>
          </div>
        ))}
      </section>
      <section style={{ marginBottom: 48, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <div>
          <Eyebrow num="ii.b">Cross-contamination</Eyebrow>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {b.crossContamination.map((c, i) => <li key={i} style={{ fontSize: 14, color: 'var(--ink-soft)', padding: '12px 0', borderBottom: '1px solid var(--rule)', display: 'flex', gap: 14 }}><span className="numeral" style={{ color: 'var(--ink-faint)', fontSize: 14 }}>{i+1}</span><span>{c}</span></li>)}
          </ul>
        </div>
        <div>
          <Eyebrow num="ii.c">Safe alternatives</Eyebrow>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {b.safeAlternatives.map((c, i) => <li key={i} style={{ fontSize: 14, color: 'var(--ink-soft)', padding: '12px 0', borderBottom: '1px solid var(--rule)', display: 'flex', gap: 14 }}><span className="numeral" style={{ color: 'var(--ink-faint)', fontSize: 14 }}>{i+1}</span><span>{c}</span></li>)}
          </ul>
        </div>
      </section>
      <section className="paper-deep" style={{ padding: '36px 40px', marginTop: 16 }}>
        <Eyebrow num="ii.d" style={{ marginBottom: 22 }}>If something goes wrong</Eyebrow>
        <p className="serif italic" style={{ fontSize: 32, fontWeight: 400, color: 'var(--ink)', lineHeight: 1.35, marginBottom: 18 }}>{b.emergency.script}</p>
        <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--ink-soft)', marginBottom: 8 }}>{b.emergency.translit}</p>
        <p style={{ fontSize: 14, color: 'var(--ink-mute)', marginBottom: 28 }}>{b.emergency.english}</p>
        <div style={{ background: 'var(--ink-faint)', height: 1, marginBottom: 22 }}></div>
        <div style={{ display: 'flex', gap: 56 }}>
          <div><div className="eyebrow" style={{ marginBottom: 6 }}>Emergency</div><div className="serif" style={{ fontSize: 28 }}>{b.emergency.phone}</div></div>
          <div><div className="eyebrow" style={{ marginBottom: 6 }}>Nearest hospital</div><div className="serif" style={{ fontSize: 18 }}>{b.emergency.hospital}</div></div>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// 3. FOOD — live engine + Claude fallback + voice + kitchen type
// ============================================================
function WaveMic({ listening, onToggle }) {
  return (
    <button onClick={onToggle} style={{ width: 220, height: 220, borderRadius: '50%', border: '1px solid ' + (listening ? 'var(--accent)' : 'var(--rule-strong)'), background: listening ? 'var(--accent-tint)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 56 }}>
        {[0,1,2,3,4,5,6].map(i => (
          <div key={i} style={{ width: 4, height: 56, background: listening ? 'var(--accent)' : 'var(--ink-faint)', transformOrigin: 'center', animation: listening ? `wave 1.${4 + (i % 4)}s ease-in-out ${i * 0.08}s infinite` : 'none', transform: listening ? undefined : `scaleY(${0.25 + 0.15 * Math.abs(3 - i)})` }} />
        ))}
      </div>
    </button>
  );
}

function KnowledgeGraph({ allergens }) {
  const userSet = new Set(allergens);
  const nodes = [], edges = [], nodeMap = new Map();
  const addNode = (id, kind) => { if (!nodeMap.has(id)) { nodeMap.set(id, { id, kind }); nodes.push(nodeMap.get(id)); } };
  allergens.forEach(a => addNode(a, 'user'));
  allergens.forEach(a => { (window.CROSS_REACT[a] || []).forEach(([b, prob]) => { addNode(b, userSet.has(b) ? 'user' : 'reactive'); edges.push({ from: a, to: b, prob }); }); });
  if (nodes.length === 0) return <p style={{ color: 'var(--ink-mute)', fontSize: 14, padding: '24px 0' }}>No allergens declared.</p>;
  const W = 880, H = 380, cx = W / 2, cy = H / 2, inner = 80, outer = 150;
  const userNodes = nodes.filter(n => n.kind === 'user'), reactiveNodes = nodes.filter(n => n.kind === 'reactive');
  const positions = new Map();
  userNodes.forEach((n, i) => { const total = userNodes.length; if (total === 1) { positions.set(n.id, { x: cx, y: cy }); } else { const angle = -Math.PI / 2 + (i / total) * Math.PI * 2; positions.set(n.id, { x: cx + Math.cos(angle) * inner, y: cy + Math.sin(angle) * inner }); } });
  reactiveNodes.forEach((n, i) => { const total = reactiveNodes.length; const angle = -Math.PI / 2 + (i / Math.max(total, 1)) * Math.PI * 2 + 0.3; positions.set(n.id, { x: cx + Math.cos(angle) * outer * 1.6, y: cy + Math.sin(angle) * outer * 0.95 }); });
  const fmt = (id) => id.replace(/_/g, ' ');
  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {edges.map((e, i) => { const a = positions.get(e.from), b = positions.get(e.to); if (!a || !b) return null; return (<g key={i}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--ink-faint)" strokeWidth={1} strokeDasharray={e.prob < 0.5 ? '3 3' : ''} opacity={0.4 + e.prob * 0.5} /><text x={(a.x+b.x)/2} y={(a.y+b.y)/2-4} fill="var(--ink-mute)" fontSize="10" fontFamily="var(--sans)" textAnchor="middle" style={{ paintOrder: 'stroke', stroke: 'var(--paper)', strokeWidth: 4 }}>{Math.round(e.prob*100)}%</text></g>); })}
        {nodes.map(n => { const p = positions.get(n.id); if (!p) return null; const isU = n.kind === 'user'; return (<g key={n.id}><circle cx={p.x} cy={p.y} r={isU ? 9 : 5} fill={isU ? 'var(--ink)' : 'var(--paper)'} stroke={isU ? 'var(--ink)' : 'var(--ink-mute)'} strokeWidth={1} /><text x={p.x} y={p.y + (isU ? 26 : 20)} fill={isU ? 'var(--ink)' : 'var(--ink-soft)'} fontSize={isU ? 13 : 11} fontFamily="var(--serif)" fontStyle={isU ? 'normal' : 'italic'} fontWeight={isU ? 500 : 400} textAnchor="middle">{fmt(n.id)}</text></g>); })}
      </svg>
      <div style={{ display: 'flex', gap: 28, marginTop: 4, fontSize: 12, color: 'var(--ink-mute)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--ink)', display: 'inline-block' }}></span>Declared</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--paper)', border: '1px solid var(--ink-mute)', display: 'inline-block' }}></span>Cross-reactive</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 24, height: 1, background: 'var(--ink-faint)', display: 'inline-block' }}></span>edge weight = probability</span>
      </div>
    </div>
  );
}

function FoodScreen({ profile, kb }) {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState('');
  const [kitchenType, setKitchenType] = useState('casual');
  const [liveResults, setLiveResults] = useState([]);
  const [claudeLoading, setClaudeLoading] = useState(null);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Pre-computed static assessments
  const staticDishes = window.ASSESSMENTS[profile.id] || window.ASSESSMENTS.ringo;

  // All dishes to display: static + live
  const allDishes = liveResults.length > 0 ? liveResults : staticDishes;
  const inferredCount = allDishes.filter(d => d.inferred).length;

  // Get KB dishes for the profile's cuisine
  const kbDishes = useMemo(() => {
    if (!kb) return [];
    return kb.dishes?.[profile.cuisine] || Object.values(kb.dishes || {}).flat();
  }, [kb, profile.cuisine]);

  // ─── Manual dish lookup via live engine ───
  const handleManualLookup = useCallback(async () => {
    if (!text.trim() || kbDishes.length === 0) return;
    const results = window.assessMenu([text.trim()], kbDishes, profile, kitchenType);
    // If unknown, try Claude fallback
    if (results.length > 0 && results[0].requiresCloudFallback) {
      setClaudeLoading(text.trim());
      try {
        const resp = await fetch('/api/claude', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemPrompt: 'You are a food allergen analyst. Given a dish name and a user\'s allergens, reason about the likely ingredients and allergen risks. Respond in JSON: {"dish":"...","risk":"avoid|ask|low","why":"...","detail":"...","ingredients":["..."]}',
            userMessage: `Dish: "${text.trim()}" | Cuisine context: ${profile.cuisine} | User allergens: ${profile.allergens.join(', ')} | User conditions: ${profile.conditions.join(', ') || 'none'} | Severity: ${profile.severity}`,
          }),
        });
        const data = await resp.json();
        try {
          const parsed = JSON.parse(data.content);
          results[0] = { ...results[0], dish: parsed.dish || text.trim(), riskLevel: parsed.risk || 'ask', riskLabel: (parsed.risk || 'ask').toUpperCase(), why: parsed.why, detail: parsed.detail, inferred: true, requiresCloudFallback: false };
        } catch { /* Claude response wasn't JSON, keep as unknown */ }
      } catch (e) { console.error('Claude fallback error:', e); }
      setClaudeLoading(null);
    }
    setLiveResults(prev => [...prev, ...results]);
    setText('');
  }, [text, kbDishes, profile, kitchenType]);

  // ─── Voice: Web Speech API ───
  const toggleListening = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Web Speech API not supported. Use Chrome.'); return; }
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
    rec.onresult = (e) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final && kbDishes.length > 0) {
        setTranscript(prev => prev + ' ' + final);
        const entities = window.extractDishEntities(final, kbDishes);
        if (entities.length > 0) {
          const names = entities.map(e => e.matchedDish.dish);
          const results = window.assessMenu(names, kbDishes, profile, kitchenType);
          setLiveResults(prev => {
            const existing = new Set(prev.map(r => r.dish));
            return [...prev, ...results.filter(r => !existing.has(r.dish))];
          });
        }
      }
    };
    rec.onend = () => { if (listening) try { rec.start(); } catch {} };
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }, [listening, kbDishes, profile, kitchenType]);

  // ─── Play demo transcript ───
  const playDemo = useCallback(() => {
    if (kbDishes.length === 0) return;
    const demoText = window.DEMO_TRANSCRIPTS[profile.cuisine] || window.DEMO_TRANSCRIPTS.north_indian;
    setTranscript(demoText);
    // Try to play audio file
    const audioFile = `/audio/${profile.cuisine}_demo.mp3`;
    const audio = new Audio(audioFile);
    audio.play().catch(() => {}); // Silently fail if no audio file

    const entities = window.extractDishEntities(demoText, kbDishes);
    const names = entities.map(e => e.matchedDish.dish);
    const results = window.assessMenu(names, kbDishes, profile, kitchenType);
    // Stagger results for dramatic effect
    results.forEach((r, i) => {
      setTimeout(() => {
        setLiveResults(prev => [...prev, r]);
      }, i * 600);
    });
  }, [kbDishes, profile, kitchenType]);

  // Clear results when profile changes
  useEffect(() => { setLiveResults([]); setTranscript(''); }, [profile.id]);

  return (
    <div className="fade-in">
      <PageTitle numeral="iii" eyebrow="The food" sub="Speak the dish, type it, or hold up a menu. Risk is assessed against your declared profile and the cuisine knowledge graph.">Assess</PageTitle>

      {/* Kitchen type selector */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="eyebrow" style={{ marginRight: 8 }}>Kitchen type</span>
          {[['street_food', 'Street food \u00d71.5'], ['casual', 'Casual \u00d71.0'], ['fine_dining', 'Fine dining \u00d70.7']].map(([k, label]) => (
            <button key={k} onClick={() => { setKitchenType(k); setLiveResults([]); }} className={'chip ' + (kitchenType === k ? 'on' : '')} style={{ fontSize: 11 }}>{label}</button>
          ))}
        </div>
      </section>

      {/* Mic */}
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 36px' }}>
        <WaveMic listening={listening} onToggle={toggleListening} />
        <p className="serif italic" style={{ fontSize: 17, color: 'var(--ink-soft)', marginTop: 24, fontWeight: 400 }}>
          {listening ? 'Listening \u00b7 tap to stop' : 'Tap & speak the dish'}
        </p>
        <button className="btn-ghost" onClick={playDemo} style={{ marginTop: 14, fontSize: 12 }}>play demo audio</button>
        {transcript && <p style={{ marginTop: 14, fontSize: 13, color: 'var(--ink-mute)', fontStyle: 'italic', textAlign: 'center', maxWidth: 480 }}>"{transcript.trim()}"</p>}
      </section>

      {/* Text input */}
      <section style={{ marginBottom: 48 }}>
        <div className="rule"></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '4px 0' }}>
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleManualLookup()}
            placeholder="\u2026or type a dish name" style={{ flex: 1, fontSize: 18, fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300, color: 'var(--ink)', padding: '14px 0', background: 'transparent', border: 'none' }} />
          <button className="btn-ghost" onClick={handleManualLookup}>{claudeLoading ? 'Inferring\u2026' : 'Assess'}</button>
        </div>
        <div className="rule"></div>
      </section>

      {/* Results */}
      <section style={{ marginBottom: 56 }}>
        <Eyebrow num="iii.a">Assessment</Eyebrow>
        {allDishes.map((d, i) => (
          <div key={d.dish + i} className="fade-up" style={{ animationDelay: `${i * 60}ms`, display: 'grid', gridTemplateColumns: '1fr 200px 100px', gap: 24, padding: '22px 18px', background: d.risk === 'avoid' || d.risk === 'emergency' || d.riskLevel === 'avoid' || d.riskLevel === 'emergency' ? 'var(--accent-tint)' : 'transparent', borderTop: i === 0 ? '1px solid var(--rule)' : 'none', borderBottom: '1px solid var(--rule)', alignItems: 'baseline' }}>
            <div>
              <div className="serif" style={{ fontSize: 20, fontWeight: 400, color: 'var(--ink)', marginBottom: 4 }}>
                {d.dish}{d.inferred && <sup style={{ fontSize: 12, color: 'var(--ink-mute)', marginLeft: 2 }}>*</sup>}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 4 }}>{d.why}</div>
              {d.condFlag && <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 6, fontWeight: 500 }}>{d.condFlag}</div>}
              {d.conditionFlags?.length > 0 && d.conditionFlags.map((cf, j) => <div key={j} style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4, fontWeight: 500 }}>{cf.condition}: {cf.message}</div>)}
            </div>
            <div className="serif italic" style={{ fontSize: 16, color: 'var(--ink-soft)', fontWeight: 300 }}>{d.native || ''}</div>
            <div style={{ textAlign: 'right' }}><RiskTag level={d.risk || d.riskLevel} /></div>
          </div>
        ))}
        {inferredCount > 0 && <p style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-mute)', fontStyle: 'italic' }}><sup>*</sup> Composition inferred by Claude. Not in the on-device knowledge graph.</p>}
      </section>

      {/* Knowledge Graph */}
      <section style={{ marginBottom: 56 }}>
        <Eyebrow num="iii.b">Knowledge graph \u00b7 cross-reactivity</Eyebrow>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 28, maxWidth: 620 }}>Your declared allergens are expanded by BFS through a weighted reactivity graph. Edges show probability of cross-reaction.</p>
        <KnowledgeGraph allergens={profile.allergens} />
      </section>
    </div>
  );
}

// ============================================================
// 4. VOICE — phrase cards with TTS
// ============================================================
function VoiceScreen({ profile }) {
  const [lang, setLang] = useState(profile.language);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const phrases = window.PHRASES[lang] || [];
  const cur = phrases[idx];

  useEffect(() => { setIdx(0); }, [lang]);
  useEffect(() => { setLang(profile.language); setIdx(0); }, [profile.id]);

  const playAudio = useCallback(async (text) => {
    setPlaying(true);
    // Try pre-generated audio file first
    const audioFile = `/audio/${lang}_phrase_${idx}.mp3`;
    const audio = new Audio(audioFile);
    try {
      await audio.play();
      audio.onended = () => setPlaying(false);
      return;
    } catch {}
    // Try ElevenLabs via server
    try {
      const resp = await fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, language: lang }) });
      if (resp.ok) {
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a2 = new Audio(url);
        a2.onended = () => { setPlaying(false); URL.revokeObjectURL(url); };
        a2.play();
        return;
      }
    } catch {}
    // Fallback: browser speech synthesis
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = { hindi: 'hi-IN', thai: 'th-TH', japanese: 'ja-JP', kannada: 'kn-IN' }[lang] || 'en-US';
      u.onend = () => setPlaying(false);
      speechSynthesis.speak(u);
    } catch { setPlaying(false); }
  }, [lang, idx]);

  if (!cur) return null;
  return (
    <div className="fade-in">
      <PageTitle numeral="iv" eyebrow="Your voice" sub="Hold the phone up to a server. Tap audio to play. The card escalates by tier.">Phrase cards</PageTitle>
      <div style={{ display: 'flex', gap: 8, marginBottom: 36 }}>
        {['hindi', 'thai', 'japanese', 'kannada'].map(l => (
          <button key={l} onClick={() => setLang(l)} className={'chip ' + (lang === l ? 'on' : '')} style={{ textTransform: 'capitalize' }}>{l}</button>
        ))}
      </div>
      <div className="paper-deep" style={{ padding: '64px 56px', minHeight: 480, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
            <RiskTag level={cur.tier} />
            <span className="numeral" style={{ fontSize: 16, color: 'var(--ink-mute)' }}>{idx + 1} / {phrases.length}</span>
          </div>
          <p className="serif" style={{ fontSize: 38, fontWeight: 400, color: 'var(--ink)', lineHeight: 1.4, marginBottom: 28 }}>{cur.script}</p>
          <p style={{ fontSize: 16, fontStyle: 'italic', color: 'var(--ink-soft)', marginBottom: 8, fontFamily: 'var(--serif)' }}>{cur.translit}</p>
          <div className="rule" style={{ margin: '20px 0', background: 'var(--ink-faint)' }}></div>
          <p style={{ fontSize: 15, color: 'var(--ink-soft)' }}>{cur.english}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 48 }}>
          <button className="btn-ghost" onClick={() => playAudio(cur.script)} disabled={playing} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
            <span style={{ fontSize: 10 }}>{playing ? '\u25A0' : '\u25B6'}</span> {playing ? 'Playing\u2026' : 'Play audio'}
          </button>
          <div style={{ display: 'flex', gap: 4 }}>
            {phrases.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} style={{ width: 22, height: 6, background: i === idx ? 'var(--ink)' : 'var(--ink-faint)', cursor: 'pointer', transition: 'background 0.12s' }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <button className="btn-ghost" onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}>\u2190 prev</button>
            <button className="btn-ghost" onClick={() => setIdx(i => Math.min(phrases.length - 1, i + 1))} disabled={idx === phrases.length - 1}>next \u2192</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 5. ABOUT
// ============================================================
function AboutScreen({ profile, onLock }) {
  return (
    <div className="fade-in">
      <PageTitle numeral="v" eyebrow="The book">About</PageTitle>
      <section style={{ marginBottom: 48, maxWidth: 620 }}>
        <p className="serif italic" style={{ fontSize: 22, fontWeight: 300, color: 'var(--ink)', lineHeight: 1.55, marginBottom: 24 }}>Named for the song written at Rishikesh \u2014 the same trip where one drummer cut his stay short because he could not eat the food.</p>
        <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.7 }}>Prudence is a personal dietary threat intelligence system. It knows your body, knows the place, assesses the food, and speaks for you in the local language. You don't have to hide from unfamiliar food.</p>
      </section>
      <section style={{ marginBottom: 48 }}>
        <Eyebrow num="v.a">Architecture</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div style={{ padding: '24px 0', borderTop: '1px solid var(--rule-strong)' }}>
            <div className="numeral" style={{ fontSize: 28, color: 'var(--ink-mute)', marginBottom: 12 }}>0</div>
            <div className="serif" style={{ fontSize: 18, marginBottom: 6 }}>On-device knowledge graph</div>
            <div style={{ fontSize: 13, color: 'var(--ink-mute)', lineHeight: 1.6 }}>Curated dish data, allergen mappings, weighted cross-reactivity edges. Levenshtein fuzzy matching. Runs offline.</div>
          </div>
          <div style={{ padding: '24px 0', borderTop: '1px solid var(--rule-strong)' }}>
            <div className="numeral" style={{ fontSize: 28, color: 'var(--ink-mute)', marginBottom: 12 }}>1</div>
            <div className="serif" style={{ fontSize: 18, marginBottom: 6 }}>Claude inference fallback</div>
            <div style={{ fontSize: 13, color: 'var(--ink-mute)', lineHeight: 1.6 }}>Unknown dishes reasoned about compositionally, marked with asterisk. Anthropic API via server proxy.</div>
          </div>
        </div>
      </section>
      <section style={{ marginBottom: 48 }}>
        <Eyebrow num="v.b">Security</Eyebrow>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', maxWidth: 620, lineHeight: 1.7 }}>Profile encrypted at rest with PBKDF2 (100,000 iterations) + AES-256-GCM derived from your PIN. Voice processed on-device via Cactus/Whisper when possible. Emergency information stored unencrypted, accessible without auth so a bystander can read it during anaphylaxis.</p>
      </section>
      <section style={{ marginBottom: 48 }}>
        <Eyebrow num="v.c">Voice pipeline</Eyebrow>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', maxWidth: 620, lineHeight: 1.7 }}>Three interchangeable STT backends: Cactus + Whisper (on-device, offline), Web Speech API (browser-native), pre-recorded audio (demo fallback). All three produce text which feeds into N-gram entity extraction against the knowledge graph vocabulary.</p>
      </section>
      <section style={{ marginBottom: 48 }}>
        <Eyebrow num="v.d">ElevenLabs TTS</Eyebrow>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', maxWidth: 620, lineHeight: 1.7 }}>Phrase cards rendered with multilingual TTS via ElevenLabs eleven_multilingual_v2 model. Hindi, Thai, Japanese, Kannada. Falls back to browser speech synthesis when offline.</p>
      </section>
      <section style={{ display: 'flex', gap: 18 }}>
        <button className="btn-ghost" onClick={onLock}>Lock</button>
      </section>
      <div style={{ marginTop: 96, textAlign: 'center' }}>
        <div className="serif italic" style={{ fontSize: 28, color: 'var(--ink-mute)' }}>Prudence</div>
        <div className="serif italic" style={{ fontSize: 13, color: 'var(--ink-faint)', marginTop: 4 }}>Won't you come out to play?</div>
      </div>
    </div>
  );
}

Object.assign(window, { PinScreen, BodyScreen, PlaceScreen, FoodScreen, VoiceScreen, AboutScreen });
