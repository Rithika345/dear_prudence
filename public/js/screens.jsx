// Prudence — screen components (interactive, animated, camera, live engine)
const { useState, useEffect, useRef, useMemo, useCallback } = React;

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
  <header className="fade-up" style={{ marginBottom: 36 }}>
    {eyebrow && <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>{numeral && <span className="numeral" style={{ fontSize: 22, color: 'var(--ink-mute)' }}>{numeral}</span>}<span className="eyebrow">{eyebrow}</span></div>}
    <h1 className="serif italic" style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.01em', color: 'var(--ink)', lineHeight: 1.05, marginBottom: sub ? 14 : 0 }}>{children}</h1>
    {sub && <p style={{ fontSize: 16, color: 'var(--ink-soft)', maxWidth: 560, fontWeight: 300 }}>{sub}</p>}
  </header>
);

// ── PIN SCREEN ──
function PinScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);
  const [encrypting, setEncrypting] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);

  useEffect(() => { (async () => { setEncrypting(true); await window.initDemoProfiles(window.PROFILES); setEncrypting(false); })(); }, []);

  const press = (k) => {
    if (k === 'del') { setPin(p => p.slice(0, -1)); setErr(false); return; }
    if (pin.length >= 4) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 4) {
      setTimeout(async () => {
        for (const p of window.PROFILES) {
          const dec = await window.unlockDemoProfile(p.id, next);
          if (dec) { onUnlock(p); setPin(''); return; }
        }
        setErr(true); setTimeout(() => { setPin(''); setErr(false); }, 500);
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
            {[0,1,2,3].map(i => <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: pin.length > i ? 'var(--ink)' : 'transparent', border: '1px solid ' + (pin.length > i ? 'var(--ink)' : 'var(--rule-strong)'), transition: 'all 0.15s' }} />)}
          </div>
          {encrypting && <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 16 }}><span className="spinner" style={{ marginRight: 8 }}></span>Encrypting with PBKDF2…</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 4 }}>
            {[1,2,3,4,5,6,7,8,9,'',0,'del'].map((k, i) => (
              <button key={i} onClick={() => k !== '' && press(String(k))} disabled={k === '' || encrypting}
                style={{ height: 64, fontFamily: 'var(--serif)', fontWeight: 300, fontSize: k === 'del' ? 16 : 26, color: k === '' ? 'transparent' : 'var(--ink)', background: 'transparent', borderBottom: k !== '' ? '1px solid var(--rule)' : 'none', cursor: k === '' ? 'default' : 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => k !== '' && (e.currentTarget.style.background = 'var(--nautilus-tint)')}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {k === 'del' ? '←' : k}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ textAlign: 'center', marginBottom: 22 }}><span className="serif italic" style={{ fontSize: 15, color: 'var(--ink-soft)' }}>Four travellers. Tap to enter.</span></div>
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--rule)', border: '1px solid var(--rule)' }}>
            {window.PROFILES.map(p => (
              <button key={p.id} onClick={() => onUnlock(p)} style={{ background: 'var(--paper)', padding: '24px 20px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 160 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--nautilus-tint)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--paper)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                <span className="eyebrow">PIN · {p.pin}</span>
                <span className="serif italic" style={{ fontSize: 28, fontWeight: 400, color: 'var(--ink)' }}>{p.name}</span>
                <span style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 'auto', lineHeight: 1.45 }}>{p.cuisineLabel}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Emergency bypass */}
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <button onClick={() => setShowEmergency(s => !s)} style={{ fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--emergency)', cursor: 'pointer', background: 'transparent', border: '1px solid var(--emergency)', padding: '10px 24px', transition: 'all 0.2s' }}>
            {showEmergency ? 'Close' : '⚠ Emergency — no PIN needed'}
          </button>
          {showEmergency && (
            <div className="scale-in" style={{ marginTop: 24, textAlign: 'left', border: '1px solid var(--emergency)', padding: '28px 32px' }}>
              <div className="eyebrow" style={{ color: 'var(--emergency)', marginBottom: 16 }}>Stored unencrypted — bystander access during anaphylaxis</div>
              {window.PROFILES.map(p => { const b = window.BRIEFINGS[p.cuisine]; if (!b) return null; return (
                <div key={p.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--rule)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <span className="serif italic" style={{ fontSize: 18 }}>{p.name} — {b.region}</span>
                    <span className="serif" style={{ fontSize: 22, fontWeight: 500 }}>{b.emergency.phone}</span>
                  </div>
                  <p className="serif" style={{ fontSize: 16, lineHeight: 1.5, marginBottom: 4 }}>{b.emergency.script}</p>
                  <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{b.emergency.english}</p>
                  <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 4 }}>{b.emergency.hospital}</p>
                </div>
              ); })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── BODY — interactive allergen toggling ──
function BodyScreen({ profile, liveAllergens, liveSeverity, liveConditions, onToggleAllergen, onSetSeverity, onToggleCondition }) {
  const isOn = (id) => liveAllergens.includes(id);
  const condOn = (id) => liveConditions.includes(id);
  const AllergenCell = ({ a }) => {
    const on = isOn(a.id);
    return (
      <div className="allergen-cell" onClick={() => onToggleAllergen(a.id)} style={{ padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 16, background: on ? 'var(--ink)' : 'var(--nautilus-tint)', color: on ? 'var(--paper)' : 'var(--ink)', transition: 'all 0.2s', cursor: 'pointer' }}>
        <div className="serif italic" style={{ fontSize: 30, fontWeight: 300, lineHeight: 1, width: 28, textAlign: 'center', color: on ? 'var(--paper)' : 'var(--ink-faint)' }}>{a.glyph}</div>
        <div style={{ fontSize: 14, fontWeight: on ? 600 : 300 }}>{a.label}</div>
        {on && <span style={{ marginLeft: 'auto', fontSize: 14 }}>✓</span>}
      </div>
    );
  };
  return (
    <div className="fade-in">
      <PageTitle numeral="i" eyebrow="The body" sub="Tap allergens to toggle. The assessment and graph update live.">Your profile</PageTitle>
      <section className="scale-in" style={{ marginBottom: 48 }}>
        <Eyebrow num="i.a">FALCPA 9 · top allergens — tap to toggle</Eyebrow>
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--rule)', border: '1px solid var(--rule)' }}>
          {window.ALLERGENS_FALCPA.map(a => <div key={a.id} style={{ background: 'var(--paper)' }}><AllergenCell a={a} /></div>)}
        </div>
      </section>
      <section className="scale-in" style={{ marginBottom: 48, animationDelay: '100ms' }}>
        <Eyebrow num="i.b">Extended</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--rule)', border: '1px solid var(--rule)' }}>
          {window.ALLERGENS_EXT.map(a => <div key={a.id} style={{ background: 'var(--paper)' }}><AllergenCell a={a} /></div>)}
        </div>
      </section>
      <section className="scale-in" style={{ marginBottom: 48, animationDelay: '200ms' }}>
        <Eyebrow num="i.c">Severity — tap to set</Eyebrow>
        <div style={{ display: 'flex', border: '1px solid var(--rule-strong)' }}>
          {['intolerance', 'moderate', 'anaphylaxis'].map((s, i) => {
            const on = liveSeverity === s;
            return <div key={s} onClick={() => onSetSeverity(s)} style={{ flex: 1, padding: '18px 20px', background: on ? 'var(--ink)' : 'transparent', color: on ? 'var(--paper)' : 'var(--ink-soft)', borderLeft: i > 0 ? '1px solid var(--rule-strong)' : 'none', fontSize: 13, fontWeight: on ? 600 : 300, letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>{s}</div>;
          })}
        </div>
      </section>
      <section className="scale-in" style={{ animationDelay: '300ms' }}>
        <Eyebrow num="i.d">Medical conditions — tap to toggle</Eyebrow>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {window.CONDITIONS.map(c => <span key={c.id} className={'chip ' + (condOn(c.id) ? 'on' : '')} onClick={() => onToggleCondition(c.id)}>{c.label}</span>)}
        </div>
      </section>
      {/* Live summary */}
      <section className="slide-in-left" style={{ marginTop: 48, padding: '24px 28px', background: 'var(--nautilus-tint)', border: '1px solid var(--nautilus)' }}>
        <div className="eyebrow" style={{ marginBottom: 12, color: 'var(--accent)' }}>Live profile summary</div>
        <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.7 }}>
          Because <strong>{profile.name}</strong> has declared <strong>{liveAllergens.length > 0 ? liveAllergens.join(', ') : 'no allergens'}</strong> at <strong>{liveSeverity}</strong> severity
          {liveConditions.length > 0 && <span> with <strong>{liveConditions.join(', ')}</strong></span>},
          the system will flag {liveAllergens.length > 0 ? 'direct matches plus cross-reactive compounds (via BFS graph traversal)' : 'no allergens'}{liveConditions.length > 0 ? ' and apply medical condition rules' : ''}.
        </p>
      </section>
    </div>
  );
}

// ── PLACE ──
function PlaceScreen({ profile }) {
  const b = window.BRIEFINGS[profile.cuisine]; if (!b) return null;
  return (
    <div className="fade-in">
      <PageTitle numeral="ii" eyebrow={b.region} sub={b.overview}>The place</PageTitle>
      <div className="slide-in-left" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--ink)', borderBottom: '1px solid var(--rule)', marginBottom: 40 }}>
        <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Briefing for <span className="serif italic" style={{ color: 'var(--ink)' }}>{profile.name}</span></span>
      </div>
      <section className="stagger" style={{ marginBottom: 48 }}>
        <Eyebrow num="ii.a">Threat landscape</Eyebrow>
        {b.threats.map((t, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 110px', gap: 28, padding: '22px 18px', background: t.risk === 'avoid' || t.risk === 'emergency' ? 'var(--accent-tint)' : 'transparent', borderBottom: '1px solid var(--rule)', alignItems: 'baseline' }}>
            <div className="serif" style={{ fontSize: 18 }}>{t.name}</div>
            <div style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.55 }}>{t.why}</div>
            <div style={{ textAlign: 'right' }}><RiskTag level={t.risk} /></div>
          </div>
        ))}
      </section>
      <section style={{ marginBottom: 48, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <div><Eyebrow num="ii.b">Cross-contamination</Eyebrow><ul style={{ listStyle: 'none', padding: 0 }}>{b.crossContamination.map((c, i) => <li key={i} style={{ fontSize: 14, color: 'var(--ink-soft)', padding: '12px 0', borderBottom: '1px solid var(--rule)', display: 'flex', gap: 14 }}><span className="numeral" style={{ color: 'var(--ink-faint)', fontSize: 14 }}>{i+1}</span><span>{c}</span></li>)}</ul></div>
        <div><Eyebrow num="ii.c">Safe alternatives</Eyebrow><ul style={{ listStyle: 'none', padding: 0 }}>{b.safeAlternatives.map((c, i) => <li key={i} style={{ fontSize: 14, color: 'var(--ink-soft)', padding: '12px 0', borderBottom: '1px solid var(--rule)', display: 'flex', gap: 14 }}><span className="numeral" style={{ color: 'var(--ink-faint)', fontSize: 14 }}>{i+1}</span><span>{c}</span></li>)}</ul></div>
      </section>
      <section className="paper-deep scale-in" style={{ padding: '36px 40px', marginTop: 16 }}>
        <Eyebrow num="ii.d" style={{ marginBottom: 22 }}>If something goes wrong</Eyebrow>
        <p className="serif italic" style={{ fontSize: 32, fontWeight: 400, color: 'var(--ink)', lineHeight: 1.35, marginBottom: 18 }}>{b.emergency.script}</p>
        <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--ink-soft)', marginBottom: 8 }}>{b.emergency.translit}</p>
        <p style={{ fontSize: 14, color: 'var(--ink-mute)', marginBottom: 28 }}>{b.emergency.english}</p>
        <div style={{ background: 'var(--ink-faint)', height: 1, marginBottom: 22 }}></div>
        <div style={{ display: 'flex', gap: 56 }}>
          <div><div className="eyebrow" style={{ marginBottom: 6 }}>Emergency</div><div className="serif" style={{ fontSize: 28 }}>{b.emergency.phone}</div></div>
          <div><div className="eyebrow" style={{ marginBottom: 6 }}>Nearest hospital</div><div className="serif" style={{ fontSize: 18 }}>{b.emergency.hospital}</div></div>
        </div>
        {b.emergency.epipen && <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid var(--ink-faint)' }}><div className="eyebrow" style={{ marginBottom: 6 }}>Epinephrine access</div><div style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6 }}>{b.emergency.epipen}</div></div>}
      </section>
    </div>
  );
}

// ── FOOD — live engine + camera + Claude fallback ──
function WaveMic({ listening, onToggle }) {
  return (
    <button onClick={onToggle} style={{ width: 180, height: 180, borderRadius: '50%', border: '2px solid ' + (listening ? 'var(--nautilus-deep)' : 'var(--rule-strong)'), background: listening ? 'var(--nautilus-tint)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 48 }}>
        {[0,1,2,3,4,5,6].map(i => <div key={i} style={{ width: 3, height: 48, background: listening ? 'var(--ink)' : 'var(--ink-faint)', transformOrigin: 'center', animation: listening ? 'wave 1.' + (4+(i%4)) + 's ease-in-out ' + (i*0.08) + 's infinite' : 'none', transform: listening ? undefined : 'scaleY(' + (0.25 + 0.15 * Math.abs(3-i)) + ')' }} />)}
      </div>
    </button>
  );
}

function KnowledgeGraph({ allergens, profileName }) {
  const userSet = new Set(allergens);
  const nodes = [], edges = [], nodeMap = new Map();
  const addNode = (id, kind) => { if (!nodeMap.has(id)) { nodeMap.set(id, { id, kind }); nodes.push(nodeMap.get(id)); } };
  allergens.forEach(a => addNode(a, 'user'));
  allergens.forEach(a => { (window.CROSS_REACT[a] || []).forEach(([b, prob]) => { addNode(b, userSet.has(b) ? 'user' : 'reactive'); edges.push({ from: a, to: b, prob }); }); });
  if (nodes.length === 0) return <p style={{ color: 'var(--ink-mute)', fontSize: 14, padding: '24px 0' }}>No allergens declared — select allergens on the Body tab.</p>;

  const W = 880, H = 480, cx = W / 2, cy = H / 2;
  const userNodes = nodes.filter(n => n.kind === 'user'), reactiveNodes = nodes.filter(n => n.kind === 'reactive');
  const positions = new Map();
  const innerR = userNodes.length === 1 ? 0 : Math.min(130, 50 + userNodes.length * 25);
  const outerR = innerR + 120;
  userNodes.forEach((n, i) => { const t = userNodes.length; if (t === 1) positions.set(n.id, { x: cx, y: cy }); else { const a = -Math.PI/2 + (i/t)*Math.PI*2; positions.set(n.id, { x: cx + Math.cos(a)*innerR, y: cy + Math.sin(a)*innerR }); } });
  reactiveNodes.forEach((n, i) => { const t = reactiveNodes.length; const off = userNodes.length === 1 ? 0 : 0.3; const a = -Math.PI/2 + (i/Math.max(t,1))*Math.PI*2 + off; positions.set(n.id, { x: cx + Math.cos(a)*outerR, y: cy + Math.sin(a)*outerR }); });
  const fmt = id => id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div style={{ width: '100%', overflow: 'hidden', background: 'var(--paper-deep)', padding: '32px 24px', border: '1px solid var(--rule)' }}>
      {/* Explanation */}
      <div className="slide-in-left" style={{ marginBottom: 24, padding: '16px 20px', background: 'var(--nautilus-tint)', border: '1px solid var(--nautilus)', fontSize: 14, color: 'var(--ink)', lineHeight: 1.65 }}>
        Because <strong>{profileName}</strong> declared <strong>{allergens.join(', ')}</strong>, the BFS traversal found <strong>{reactiveNodes.length} cross-reactive compound{reactiveNodes.length !== 1 ? 's' : ''}</strong> across <strong>{edges.length} edges</strong>.
        {edges.filter(e => e.prob >= 0.5).length > 0 && <span> <strong>{edges.filter(e => e.prob >= 0.5).length} high-probability</strong> connections (≥50%) are pulsing below.</span>}
      </div>
      <svg viewBox={'0 0 '+W+' '+H} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <style>{'@keyframes ep{0%,100%{opacity:.25}50%{opacity:.8}}.eh{animation:ep 2.5s ease-in-out infinite}'}</style>
        {innerR > 0 && <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="var(--rule)" strokeWidth={0.5} strokeDasharray="4 4" />}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="var(--rule)" strokeWidth={0.5} strokeDasharray="4 4" />
        {edges.map((e, i) => { const a=positions.get(e.from), b=positions.get(e.to); if(!a||!b) return null; const h=e.prob>=0.5; return (
          <g key={'e'+i}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--ink)" strokeWidth={h?2.5:1} strokeDasharray={h?'':'6 4'} className={h?'eh':''} opacity={0.15+e.prob*0.6} />
          <rect x={(a.x+b.x)/2-18} y={(a.y+b.y)/2-10} width={36} height={18} rx={3} fill="var(--paper-deep)" stroke="var(--rule)" strokeWidth={0.5} />
          <text x={(a.x+b.x)/2} y={(a.y+b.y)/2+3} fill="var(--ink)" fontSize="11" fontFamily="var(--sans)" fontWeight="500" textAnchor="middle">{Math.round(e.prob*100)}%</text></g>
        ); })}
        {nodes.map(n => { const p=positions.get(n.id); if(!p) return null; const isU=n.kind==='user'; const r=isU?28:18; return (
          <g key={n.id}>{isU && <circle cx={p.x} cy={p.y} r={r+6} fill="none" stroke="var(--ink)" strokeWidth={0.5} opacity={0.15} />}
          <circle cx={p.x} cy={p.y} r={r} fill={isU?'var(--ink)':'var(--paper)'} stroke={isU?'var(--ink)':'var(--ink-soft)'} strokeWidth={isU?0:1.5} />
          <text x={p.x} y={p.y+4} fill={isU?'var(--paper)':'var(--ink)'} fontSize={isU?11:10} fontFamily="var(--sans)" fontWeight={isU?600:400} textAnchor="middle">{fmt(n.id)}</text></g>
        ); })}
        <text x={16} y={24} fill="var(--ink-mute)" fontSize="10" fontFamily="var(--sans)" fontWeight="500" letterSpacing="0.12em">BFS CROSS-REACTIVITY TRAVERSAL</text>
        <text x={W-16} y={24} fill="var(--ink-mute)" fontSize="10" fontFamily="var(--sans)" textAnchor="end">{nodes.length} nodes · {edges.length} edges</text>
      </svg>
      <div style={{ display: 'flex', gap: 24, marginTop: 16, fontSize: 12, color: 'var(--ink-soft)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--ink)', display: 'inline-block' }}></span>Declared</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--paper)', border: '1.5px solid var(--ink-soft)', display: 'inline-block' }}></span>Cross-reactive</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 24, height: 2, background: 'var(--ink)', display: 'inline-block', opacity: 0.5 }}></span>High prob (≥50%)</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 24, borderTop: '2px dashed var(--ink)', display: 'inline-block', opacity: 0.3 }}></span>Low prob</span>
      </div>
    </div>
  );
}

function FoodScreen({ profile, kb, liveAllergens, liveSeverity, liveConditions }) {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState('');
  const [kitchenType, setKitchenType] = useState('casual');
  const [liveResults, setLiveResults] = useState([]);
  const [claudeLoading, setClaudeLoading] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [menuImage, setMenuImage] = useState(null);
  const [scanningMenu, setScanningMenu] = useState(false);
  const recognitionRef = useRef(null);
  const fileRef = useRef(null);
  const liveProfile = { allergens: liveAllergens, severity: liveSeverity, conditions: liveConditions };
  const staticDishes = window.ASSESSMENTS[profile.id] || window.ASSESSMENTS.ringo;
  const allDishes = liveResults.length > 0 ? liveResults : staticDishes;
  const inferredCount = allDishes.filter(d => d.inferred).length;
  const kbDishes = useMemo(() => { if (!kb) return []; return kb.dishes?.[profile.cuisine] || Object.values(kb.dishes || {}).flat(); }, [kb, profile.cuisine]);

  const handleManualLookup = useCallback(async () => {
    if (!text.trim()) return;
    if (kbDishes.length > 0) {
      const results = window.assessMenu([text.trim()], kbDishes, liveProfile, kitchenType);
      if (results.length > 0 && results[0].requiresCloudFallback) {
        setClaudeLoading(text.trim());
        try {
          const resp = await fetch('/api/claude', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ systemPrompt: 'You are a food allergen analyst. Given a dish name and user allergens, reason about likely ingredients. Respond ONLY in JSON: {"dish":"...","risk":"avoid|ask|low","why":"...","detail":"..."}', userMessage: 'Dish: "' + text.trim() + '" | Allergens: ' + liveAllergens.join(', ') + ' | Conditions: ' + (liveConditions.join(', ') || 'none') + ' | Severity: ' + liveSeverity }) });
          const data = await resp.json();
          try { const p = JSON.parse(data.content); results[0] = { ...results[0], dish: p.dish || text.trim(), riskLevel: p.risk, riskLabel: (p.risk||'ask').toUpperCase(), why: p.why, inferred: true, requiresCloudFallback: false }; } catch {}
        } catch (e) { console.error('Claude:', e); }
        setClaudeLoading(null);
      }
      setLiveResults(prev => [...prev, ...results]);
    }
    setText('');
  }, [text, kbDishes, liveProfile, kitchenType, liveAllergens, liveSeverity, liveConditions]);

  const toggleListening = useCallback(() => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome for voice.'); return; }
    const rec = new SR(); rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
    rec.onresult = (e) => { let f = ''; for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) f += e.results[i][0].transcript;
      if (f && kbDishes.length > 0) { setTranscript(p => p + ' ' + f); const ents = window.extractDishEntities(f, kbDishes); if (ents.length > 0) { const res = window.assessMenu(ents.map(e => e.matchedDish.dish), kbDishes, liveProfile, kitchenType); setLiveResults(p => { const ex = new Set(p.map(r => r.dish)); return [...p, ...res.filter(r => !ex.has(r.dish))]; }); } } };
    rec.onend = () => { if (listening) try { rec.start(); } catch {} }; rec.start(); recognitionRef.current = rec; setListening(true);
  }, [listening, kbDishes, liveProfile, kitchenType]);

  const playDemo = useCallback(() => {
    if (kbDishes.length === 0) return;
    const dt = window.DEMO_TRANSCRIPTS[profile.cuisine] || window.DEMO_TRANSCRIPTS.north_indian;
    setTranscript(dt);
    const audio = new Audio('/audio/' + profile.cuisine + '_demo.mp3'); audio.play().catch(() => {});
    const ents = window.extractDishEntities(dt, kbDishes);
    const res = window.assessMenu(ents.map(e => e.matchedDish.dish), kbDishes, liveProfile, kitchenType);
    res.forEach((r, i) => { setTimeout(() => setLiveResults(p => [...p, r]), i * 500); });
  }, [kbDishes, profile, kitchenType, liveProfile]);

  // Camera / menu photo scan
  const handleMenuPhoto = useCallback(async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result.split(',')[1];
      setMenuImage(ev.target.result); setScanningMenu(true);
      try {
        const resp = await fetch('/api/claude', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ systemPrompt: 'You are analyzing a restaurant menu photo. Extract all dish names you can read. Return ONLY a JSON array of dish name strings, nothing else.', userMessage: 'Extract all dish names from this menu image.', imageBase64: base64, mediaType: file.type }) });
        const data = await resp.json();
        try {
          const dishes = JSON.parse(data.content);
          if (Array.isArray(dishes) && kbDishes.length > 0) {
            const res = window.assessMenu(dishes.slice(0, 15), kbDishes, liveProfile, kitchenType);
            res.forEach((r, i) => { setTimeout(() => setLiveResults(p => [...p, r]), i * 400); });
          }
        } catch { console.log('Menu parse:', data.content); }
      } catch (e) { console.error('Menu scan:', e); }
      setScanningMenu(false);
    };
    reader.readAsDataURL(file);
  }, [kbDishes, liveProfile, kitchenType]);

  useEffect(() => { setLiveResults([]); setTranscript(''); setMenuImage(null); }, [profile.id]);

  return (
    <div className="fade-in">
      <PageTitle numeral="iii" eyebrow="The food" sub="Speak a dish, type it, or photograph a menu. Risk scored against your live allergen profile and the knowledge graph.">Assess</PageTitle>
      <section className="slide-in-left" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="eyebrow" style={{ marginRight: 8 }}>Kitchen</span>
          {[['street_food', 'Street ×1.5'], ['casual', 'Casual ×1.0'], ['fine_dining', 'Fine ×0.7']].map(([k, l]) => <button key={k} onClick={() => { setKitchenType(k); setLiveResults([]); }} className={'chip ' + (kitchenType === k ? 'on' : '')} style={{ fontSize: 11 }}>{l}</button>)}
        </div>
      </section>
      <section style={{ display: 'flex', gap: 32, alignItems: 'flex-start', padding: '24px 0 36px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <WaveMic listening={listening} onToggle={toggleListening} />
          <p className="serif italic" style={{ fontSize: 15, color: 'var(--ink-soft)', marginTop: 16 }}>{listening ? 'Listening…' : 'Tap & speak'}</p>
          <button className="btn-ghost" onClick={playDemo} style={{ marginTop: 12, fontSize: 11 }}>▶ demo audio</button>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="camera-zone" onClick={() => fileRef.current?.click()} style={{ width: 180, height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {scanningMenu ? <><span className="spinner"></span><span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Scanning menu…</span></> : menuImage ? <img src={menuImage} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <><span style={{ fontSize: 36 }}>📷</span><span style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Photo a menu</span></>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleMenuPhoto} style={{ display: 'none' }} />
          <p className="serif italic" style={{ fontSize: 15, color: 'var(--ink-soft)', marginTop: 16 }}>Claude Vision OCR</p>
        </div>
      </section>
      {transcript && <p className="fade-in" style={{ marginBottom: 16, fontSize: 13, color: 'var(--ink-mute)', fontStyle: 'italic', textAlign: 'center', maxWidth: 480, margin: '0 auto 16px' }}>"{transcript.trim()}"</p>}
      <section style={{ marginBottom: 48 }}>
        <div className="rule"></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '4px 0' }}>
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleManualLookup()} placeholder="…or type a dish name" style={{ flex: 1, fontSize: 18, fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300, color: 'var(--ink)', padding: '14px 0', background: 'transparent', border: 'none' }} />
          <button className="btn-nautilus" onClick={handleManualLookup}>{claudeLoading ? <><span className="spinner" style={{ width: 14, height: 14, marginRight: 6 }}></span>Inferring</> : 'Assess'}</button>
        </div>
        <div className="rule"></div>
      </section>
      <section className="stagger" style={{ marginBottom: 56 }}>
        <Eyebrow num="iii.a">Assessment — {allDishes.length} dishes</Eyebrow>
        {allDishes.map((d, i) => { const emoji = window.FOOD_EMOJI?.[d.dish] || '🍽️'; return (
          <div key={d.dish+i} className="fade-up" style={{ animationDelay: i*60+'ms', display: 'grid', gridTemplateColumns: '44px 1fr 100px', gap: 16, padding: '18px 16px', background: (d.risk||d.riskLevel) === 'avoid' || (d.risk||d.riskLevel) === 'emergency' ? 'var(--accent-tint)' : 'transparent', borderBottom: '1px solid var(--rule)', alignItems: 'center' }}>
            <span style={{ fontSize: 28 }}>{emoji}</span>
            <div>
              <div className="serif" style={{ fontSize: 18, fontWeight: 400, marginBottom: 2 }}>{d.dish}{d.inferred && <sup style={{ fontSize: 11, color: 'var(--ink-mute)', marginLeft: 3 }}>Claude*</sup>}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 2 }}>{d.why}</div>
              {d.condFlag && <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4, fontWeight: 600 }}>⚕ {d.condFlag}</div>}
              {d.conditionFlags?.map((cf, j) => <div key={j} style={{ fontSize: 12, color: 'var(--accent)', marginTop: 2, fontWeight: 600 }}>⚕ {cf.condition}: {cf.message}</div>)}
            </div>
            <div style={{ textAlign: 'right' }}><RiskTag level={d.risk || d.riskLevel} /></div>
          </div>
        ); })}
        {inferredCount > 0 && <p style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-mute)', fontStyle: 'italic' }}>* Composition inferred by Claude — not in the on-device knowledge graph.</p>}
      </section>
      <section style={{ marginBottom: 56 }}>
        <Eyebrow num="iii.b">Knowledge graph · cross-reactivity</Eyebrow>
        <KnowledgeGraph allergens={liveAllergens} profileName={profile.name} />
      </section>
    </div>
  );
}

// ── VOICE — phrase cards with TTS ──
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
    const af = '/audio/' + lang + '_phrase_' + idx + '.mp3';
    try { const a = new Audio(af); await a.play(); a.onended = () => setPlaying(false); return; } catch {}
    try { const r = await fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, language: lang }) }); if (r.ok) { const b = await r.blob(); const u = URL.createObjectURL(b); const a = new Audio(u); a.onended = () => { setPlaying(false); URL.revokeObjectURL(u); }; a.play(); return; } } catch {}
    try { const u = new SpeechSynthesisUtterance(text); u.lang = { hindi: 'hi-IN', french: 'fr-FR', japanese: 'ja-JP', spanish: 'es-ES' }[lang] || 'en-US'; u.onend = () => setPlaying(false); speechSynthesis.speak(u); } catch { setPlaying(false); }
  }, [lang, idx]);

  if (!cur) return null;
  return (
    <div className="fade-in">
      <PageTitle numeral="iv" eyebrow="Your voice" sub="Hold the phone up to a server. Tap audio to play. Cards escalate by severity.">Phrase cards</PageTitle>
      <div style={{ display: 'flex', gap: 8, marginBottom: 36 }}>
        {['hindi', 'french', 'japanese', 'spanish'].map(l => <button key={l} onClick={() => setLang(l)} className={'chip ' + (lang === l ? 'on' : '')} style={{ textTransform: 'capitalize' }}>{l}</button>)}
      </div>
      <div className="paper-deep scale-in" style={{ padding: '64px 56px', minHeight: 440, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
            <RiskTag level={cur.tier} /><span className="numeral" style={{ fontSize: 16, color: 'var(--ink-mute)' }}>{idx+1} / {phrases.length}</span>
          </div>
          <p className="serif" style={{ fontSize: 38, fontWeight: 400, color: 'var(--ink)', lineHeight: 1.4, marginBottom: 28 }}>{cur.script}</p>
          <p style={{ fontSize: 16, fontStyle: 'italic', color: 'var(--ink-soft)', marginBottom: 8, fontFamily: 'var(--serif)' }}>{cur.translit}</p>
          <div className="rule" style={{ margin: '20px 0', background: 'var(--ink-faint)' }}></div>
          <p style={{ fontSize: 15, color: 'var(--ink-soft)' }}>{cur.english}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 48 }}>
          <button className="btn-nautilus" onClick={() => playAudio(cur.script)} disabled={playing} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>{playing ? <><span className="spinner" style={{ width: 14, height: 14 }}></span> Playing</> : '▶ Play audio'}</button>
          <div style={{ display: 'flex', gap: 4 }}>{phrases.map((_, i) => <button key={i} onClick={() => setIdx(i)} style={{ width: 22, height: 6, background: i === idx ? 'var(--ink)' : 'var(--ink-faint)', cursor: 'pointer', transition: 'background 0.15s' }} />)}</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <button className="btn-ghost" onClick={() => setIdx(i => Math.max(0, i-1))} disabled={idx === 0}>← prev</button>
            <button className="btn-ghost" onClick={() => setIdx(i => Math.min(phrases.length-1, i+1))} disabled={idx === phrases.length-1}>next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ABOUT ──
function AboutScreen({ profile, onLock }) {
  return (
    <div className="fade-in">
      <PageTitle numeral="v" eyebrow="The book">About</PageTitle>
      <section className="fade-up" style={{ marginBottom: 48, maxWidth: 620 }}>
        <p className="serif italic" style={{ fontSize: 22, fontWeight: 300, color: 'var(--ink)', lineHeight: 1.55, marginBottom: 24 }}>Named for the song written at Rishikesh — the same trip where one drummer cut his stay short because he could not eat the food.</p>
        <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.7 }}>Prudence is a personal dietary threat intelligence system. It knows your body, knows the place, assesses the food, and speaks for you.</p>
      </section>
      <section className="stagger" style={{ marginBottom: 48 }}>
        <Eyebrow num="v.a">Architecture</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          {[['0','On-device knowledge graph','Levenshtein fuzzy matching, BFS cross-reactivity traversal, severity-weighted scoring. Runs offline.'],['1','Claude inference','Unknown dishes reasoned compositionally. Menu photos analyzed via Claude Vision.'],['2','ElevenLabs TTS','Multilingual phrase cards with 3-tier fallback: pre-generated → server TTS → browser speech.']].map(([n,t,d]) => (
            <div key={n} style={{ padding: '24px 0', borderTop: '2px solid var(--ink)' }}>
              <div className="numeral" style={{ fontSize: 28, color: 'var(--ink-mute)', marginBottom: 12 }}>{n}</div>
              <div className="serif" style={{ fontSize: 17, marginBottom: 8 }}>{t}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-mute)', lineHeight: 1.6 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="fade-up" style={{ marginBottom: 48 }}>
        <Eyebrow num="v.b">Security</Eyebrow>
        <p style={{ fontSize: 14, color: 'var(--ink-soft)', maxWidth: 620, lineHeight: 1.7 }}>PBKDF2 (100k iterations) + AES-256-GCM from PIN. Emergency info stored unencrypted — bystander access during anaphylaxis. Voice processed on-device via Cactus/Whisper when available.</p>
      </section>
      <section style={{ display: 'flex', gap: 18 }}>
        <button className="btn-ink" onClick={onLock}>Lock session</button>
      </section>
      <div style={{ marginTop: 96, textAlign: 'center' }}>
        <div className="serif italic" style={{ fontSize: 28, color: 'var(--ink-mute)' }}>Prudence</div>
        <div className="serif italic" style={{ fontSize: 13, color: 'var(--ink-faint)', marginTop: 4 }}>Won't you come out to play?</div>
      </div>
    </div>
  );
}

Object.assign(window, { PinScreen, BodyScreen, PlaceScreen, FoodScreen, VoiceScreen, AboutScreen });
