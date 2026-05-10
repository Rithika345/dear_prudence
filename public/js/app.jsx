// Prudence — App shell (sidebar + top bar + screen routing + iOS frame demo)

const { useState, useEffect } = React;

function Sidebar({ active, onNav }) {
  return (
    <nav style={{ width: 280, minHeight: '100vh', padding: '56px 0 40px', boxShadow: 'inset -10px 0 18px -16px rgba(42,42,42,0.18)', display: 'flex', flexDirection: 'column' }} className="paper">
      <div style={{ padding: '0 36px 40px' }}>
        <div className="serif italic" style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Contents</div>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {window.TABS.map(t => {
          const on = active === t.id;
          return (
            <li key={t.id}>
              <button onClick={() => onNav(t.id)} style={{ display: 'flex', alignItems: 'baseline', gap: 18, width: '100%', padding: '16px 36px', background: on ? 'var(--accent-tint)' : 'transparent', color: on ? 'var(--accent-deep)' : 'var(--ink-soft)', textAlign: 'left', cursor: 'pointer', transition: 'background 0.12s, color 0.12s' }}
                onMouseEnter={e => { if (!on) e.currentTarget.style.color = 'var(--ink)'; }}
                onMouseLeave={e => { if (!on) e.currentTarget.style.color = 'var(--ink-soft)'; }}>
                <span className="numeral" style={{ fontSize: 22, minWidth: 30, textAlign: 'right', color: on ? 'var(--accent)' : 'var(--ink-faint)' }}>{t.numeral}</span>
                <span style={{ fontSize: 15, fontWeight: on ? 500 : 300 }}>{t.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div style={{ marginTop: 'auto', padding: '40px 36px 0' }}>
        <div className="serif italic" style={{ fontSize: 14, color: 'var(--ink-mute)' }}>Prudence</div>
        <div className="serif italic" style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 4 }}>Won't you come out to play?</div>
      </div>
    </nav>
  );
}

function TopBar({ profile, onSwitch, frameMode, onToggleFrame }) {
  return (
    <header className="paper" style={{ borderBottom: '1px solid var(--rule)', display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', padding: '0 36px', minHeight: 56 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span className="serif" style={{ fontSize: 22, fontWeight: 400, color: 'var(--ink)' }}>Prudence</span>
        <span className="serif italic" style={{ fontSize: 13, color: 'var(--ink-mute)' }}>\u00b7 {profile.cuisineLabel}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
        {window.PROFILES.map(p => {
          const on = p.id === profile.id;
          return (
            <button key={p.id} onClick={() => onSwitch(p)} style={{ padding: '0 18px', display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: on ? 500 : 300, color: on ? 'var(--ink)' : 'var(--ink-mute)', borderBottom: on ? '2px solid var(--ink)' : '2px solid transparent', cursor: 'pointer', transition: 'color 0.12s' }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.color = 'var(--ink-soft)'; }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.color = 'var(--ink-mute)'; }}>
              {p.name}
            </button>
          );
        })}
        <div style={{ width: 1, background: 'var(--rule)', margin: '12px 18px' }}></div>
        <button onClick={onToggleFrame} style={{ padding: '0 18px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: frameMode ? 'var(--accent-deep)' : 'var(--ink-mute)', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
          <span style={{ width: 9, height: 14, border: '1px solid currentColor', borderRadius: 2, display: 'inline-block' }}></span>
          {frameMode ? 'Exit frame' : 'iOS frame'}
        </button>
      </div>
    </header>
  );
}

function MobileShell({ profile, screen, onNav, onLock, kb }) {
  const renderScreen = () => {
    switch (screen) {
      case 'body': return <window.BodyScreen profile={profile} />;
      case 'place': return <window.PlaceScreen profile={profile} />;
      case 'food': return <window.FoodScreen profile={profile} kb={kb} />;
      case 'voice': return <window.VoiceScreen profile={profile} />;
      case 'about': return <window.AboutScreen profile={profile} onLock={onLock} />;
      default: return null;
    }
  };
  return (
    <div className="paper" style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '64px 24px 110px' }}>
        <div key={screen} className="fade-in mobile-screen">{renderScreen()}</div>
      </div>
      <nav style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, var(--paper) 60%, rgba(246,242,232,0))', padding: '24px 16px 30px', display: 'flex', justifyContent: 'space-around' }}>
        {window.TABS.map(t => {
          const on = screen === t.id;
          return (
            <button key={t.id} onClick={() => onNav(t.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: on ? 'var(--ink)' : 'var(--ink-faint)', cursor: 'pointer' }}>
              <span className="numeral" style={{ fontSize: 16 }}>{t.numeral}</span>
              <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{t.label}</span>
            </button>
          );
        })}
      </nav>
      <style>{`.mobile-screen h1 { font-size: 36px !important; } .mobile-screen header { margin-bottom: 28px !important; }`}</style>
    </div>
  );
}

function App() {
  const [profile, setProfile] = useState(null);
  const [screen, setScreen] = useState('body');
  const [frameMode, setFrameMode] = useState(false);
  const [kb, setKb] = useState(null);

  // Load knowledge base from server (fallback to null — static assessments still work)
  useEffect(() => {
    fetch('/api/kb').then(r => r.json()).then(setKb).catch(() => console.log('KB: using static assessments only'));
  }, []);

  const handleUnlock = (p) => { setProfile(p); setScreen('body'); };
  const handleLock = () => { setProfile(null); };

  if (!profile) return <window.PinScreen onUnlock={handleUnlock} />;

  // iOS frame mode
  if (frameMode) {
    return (
      <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', flexDirection: 'column', gap: 24 }}>
        <div style={{ position: 'fixed', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#888', fontSize: 12, fontFamily: 'var(--sans)' }}>
          <span className="serif italic" style={{ color: '#aaa', fontSize: 14 }}>Prudence \u00b7 iOS demo \u00b7 {profile.name}</span>
          <div style={{ display: 'flex', gap: 16 }}>
            {window.PROFILES.map(p => (
              <button key={p.id} onClick={() => setProfile(p)} style={{ color: p.id === profile.id ? '#fff' : '#666', cursor: 'pointer', fontSize: 12, borderBottom: p.id === profile.id ? '1px solid #fff' : 'none', paddingBottom: 2 }}>{p.name}</button>
            ))}
            <button onClick={() => setFrameMode(false)} style={{ color: '#aaa', cursor: 'pointer', fontSize: 11, border: '1px solid #444', padding: '4px 10px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Exit frame</button>
          </div>
        </div>
        <window.IOSDevice width={402} height={874}>
          <MobileShell profile={profile} screen={screen} onNav={setScreen} onLock={handleLock} kb={kb} />
        </window.IOSDevice>
      </div>
    );
  }

  // Desktop layout
  const renderScreen = () => {
    switch (screen) {
      case 'body': return <window.BodyScreen profile={profile} />;
      case 'place': return <window.PlaceScreen profile={profile} />;
      case 'food': return <window.FoodScreen profile={profile} kb={kb} />;
      case 'voice': return <window.VoiceScreen profile={profile} />;
      case 'about': return <window.AboutScreen profile={profile} onLock={handleLock} />;
      default: return null;
    }
  };

  return (
    <div className="paper" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar active={screen} onNav={setScreen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar profile={profile} onSwitch={setProfile} frameMode={frameMode} onToggleFrame={() => setFrameMode(true)} />
        <main className="paper" style={{ flex: 1, padding: '64px 64px 96px', overflowY: 'auto' }}>
          <div key={screen + profile.id} style={{ maxWidth: 960, margin: '0 auto' }}>{renderScreen()}</div>
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
