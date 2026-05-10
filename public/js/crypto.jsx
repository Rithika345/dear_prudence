// Prudence — Profile Encryption (PBKDF2 → AES-256-GCM)
// PIN → 100k PBKDF2 iterations → AES-256-GCM key
// Wrong PIN = decryption fails = no access

const SALT_LEN = 16, IV_LEN = 12, PBKDF2_ITER = 100000;

async function _deriveKey(pin, salt) {
  const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits','deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: PBKDF2_ITER, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt','decrypt']);
}

async function encryptProfile(profile, pin) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key = await _deriveKey(pin, salt);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(profile)));
  const packed = new Uint8Array(salt.length + iv.length + ct.byteLength);
  packed.set(salt, 0); packed.set(iv, salt.length); packed.set(new Uint8Array(ct), salt.length + iv.length);
  return btoa(String.fromCharCode(...packed));
}

async function decryptProfile(blob, pin) {
  try {
    const packed = Uint8Array.from(atob(blob), c => c.charCodeAt(0));
    const salt = packed.slice(0, SALT_LEN), iv = packed.slice(SALT_LEN, SALT_LEN + IV_LEN), ct = packed.slice(SALT_LEN + IV_LEN);
    const key = await _deriveKey(pin, salt);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return JSON.parse(new TextDecoder().decode(pt));
  } catch { return null; }
}

// Session manager with auto-lock
class ProfileSession {
  constructor() { this.profile = null; this.pin = null; this.isLocked = true; this._tid = null; this.timeoutMs = 10 * 60 * 1000; }

  async createProfile(profile, pin) {
    this.profile = profile; this.pin = pin; this.isLocked = false;
    const enc = await encryptProfile(profile, pin);
    localStorage.setItem('dp_profile', enc);
    // Emergency info stored UNENCRYPTED — bystander access during anaphylaxis
    localStorage.setItem('dp_emergency', JSON.stringify({ severity: profile.severity, allergens: profile.allergens }));
    this._startLock();
    return true;
  }

  async unlock(pin) {
    const enc = localStorage.getItem('dp_profile');
    if (!enc) return { success: false, reason: 'no_profile' };
    const p = await decryptProfile(enc, pin);
    if (!p) return { success: false, reason: 'wrong_pin' };
    this.profile = p; this.pin = pin; this.isLocked = false;
    this._startLock();
    return { success: true, profile: p };
  }

  lock() { this.profile = null; this.pin = null; this.isLocked = true; if (this._tid) clearTimeout(this._tid); }

  hasProfile() { return !!localStorage.getItem('dp_profile'); }

  getEmergencyInfo() { try { return JSON.parse(localStorage.getItem('dp_emergency')); } catch { return null; } }

  _startLock() {
    if (this._tid) clearTimeout(this._tid);
    this._tid = setTimeout(() => { this.lock(); window.dispatchEvent(new CustomEvent('dp-session-locked')); }, this.timeoutMs);
  }
}

// Initialize demo profiles encrypted in localStorage
async function initDemoProfiles(profiles) {
  if (localStorage.getItem('dp_demos_init')) return;
  for (const p of profiles) {
    const key = `dp_demo_${p.id}`;
    if (!localStorage.getItem(key)) {
      const enc = await encryptProfile(p, p.pin);
      localStorage.setItem(key, enc);
    }
  }
  localStorage.setItem('dp_demos_init', 'true');
}

async function unlockDemoProfile(demoId, pin) {
  const enc = localStorage.getItem(`dp_demo_${demoId}`);
  if (!enc) return null;
  return await decryptProfile(enc, pin);
}

Object.assign(window, { encryptProfile, decryptProfile, ProfileSession, initDemoProfiles, unlockDemoProfile });
