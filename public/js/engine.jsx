// Prudence — Knowledge Graph Engine + Voice Pipeline
// Ported from ES modules to browser globals for CDN React build

// ─── LEVENSHTEIN DISTANCE ───
function levenshtein(a, b) {
  const an = a.length, bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;
  if (an > bn) return levenshtein(b, a);
  let prev = Array.from({ length: an + 1 }, (_, i) => i);
  let curr = new Array(an + 1);
  for (let j = 1; j <= bn; j++) {
    curr[0] = j;
    for (let i = 1; i <= an; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[i] = Math.min(curr[i - 1] + 1, prev[i] + 1, prev[i - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[an];
}

function normalizeDishName(name) {
  return name.toLowerCase().trim()
    .replace(/[''`]/g, '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ')
    .replace(/chh/g, 'ch').replace(/ee/g, 'i').replace(/oo/g, 'u')
    .replace(/th/g, 't').replace(/dh/g, 'd').replace(/bh/g, 'b')
    .replace(/gh/g, 'g').replace(/ph/g, 'f').replace(/sh/g, 's');
}

function fuzzyMatchDish(query, dishes, maxResults = 3, threshold = 0.4) {
  const nq = normalizeDishName(query);
  const results = [];
  for (const dish of dishes) {
    const names = [dish.dish?.toLowerCase(), normalizeDishName(dish.dish || '')].filter(Boolean);
    let bestScore = 0, matchType = 'none';
    for (const name of names) {
      if (name === query.toLowerCase() || name === nq) { bestScore = 1.0; matchType = 'exact'; break; }
      if (name.includes(nq) || nq.includes(name)) {
        const cs = Math.min(name.length, nq.length) / Math.max(name.length, nq.length);
        if (cs > bestScore) { bestScore = Math.max(cs, 0.8); matchType = 'substring'; }
      }
      const d = levenshtein(nq, name);
      const r = 1 - (d / Math.max(nq.length, name.length));
      if (r > bestScore && r >= (1 - threshold)) { bestScore = r; matchType = 'fuzzy'; }
    }
    if (bestScore > 0 && matchType !== 'none') results.push({ dish, score: bestScore, matchType });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
}

// ─── CROSS-REACTIVITY GRAPH ───
const CROSS_REACTIVITY_GRAPH = {
  shrimp: [{ target: 'crab', probability: 0.75 }, { target: 'lobster', probability: 0.75 }, { target: 'shellfish', probability: 0.75 }],
  shellfish: [{ target: 'shrimp', probability: 0.80 }, { target: 'crab', probability: 0.80 }, { target: 'lobster', probability: 0.80 }, { target: 'squid', probability: 0.40 }],
  peanut: [{ target: 'tree_nut', probability: 0.30 }, { target: 'soy', probability: 0.05 }, { target: 'lupin', probability: 0.50 }],
  tree_nut: [{ target: 'peanut', probability: 0.30 }, { target: 'coconut', probability: 0.10 }],
  milk: [{ target: 'goat_milk', probability: 0.90 }, { target: 'sheep_milk', probability: 0.90 }],
  egg: [{ target: 'chicken', probability: 0.05 }],
  wheat: [{ target: 'rye', probability: 0.20 }, { target: 'barley', probability: 0.20 }],
  fish: [{ target: 'shellfish', probability: 0.0 }],
  soy: [{ target: 'peanut', probability: 0.05 }],
  coconut: [{ target: 'tree_nut', probability: 0.10 }],
  sesame: [{ target: 'tree_nut', probability: 0.10 }, { target: 'poppy_seed', probability: 0.15 }],
  allium: [{ target: 'asafoetida', probability: 0.40 }],
};

function traverseCrossReactivity(userAllergens, minProb = 0.10) {
  const reachable = new Map();
  for (const a of userAllergens) {
    reachable.set(a, { probability: 1.0, path: [a], isDirect: true });
  }
  const queue = userAllergens.map(a => ({ allergen: a, probability: 1.0, path: [a] }));
  const visited = new Set(userAllergens);
  while (queue.length > 0) {
    const { allergen, probability, path } = queue.shift();
    for (const edge of (CROSS_REACTIVITY_GRAPH[allergen] || [])) {
      const np = probability * edge.probability;
      if (np < minProb) continue;
      const ex = reachable.get(edge.target);
      if (ex && ex.probability >= np) continue;
      const newPath = [...path, edge.target];
      reachable.set(edge.target, { probability: np, path: newPath, isDirect: false });
      if (!visited.has(edge.target)) { visited.add(edge.target); queue.push({ allergen: edge.target, probability: np, path: newPath }); }
    }
  }
  return reachable;
}

// ─── RISK SCORING ───
const SEV_W = { primary_ingredient: 1.0, base_ingredient: 0.8, optional_ingredient: 0.4, trace_risk: 0.2 };
const USR_M = { intolerance: 0.5, moderate: 1.0, anaphylaxis: 2.0 };
const KIT_M = { fine_dining: 0.7, casual: 1.0, street_food: 1.5 };

const CONDITION_RULES = {
  celiac: { triggers: ['wheat', 'barley', 'rye', 'soy sauce', 'flour', 'naan', 'roti', 'udon', 'ramen', 'panko'], message: 'Contains gluten — intestinal damage risk' },
  ckd: { triggers: ['potato', 'tomato', 'banana', 'dairy', 'paneer', 'cream', 'nuts', 'cashew', 'almond', 'kidney bean', 'dal', 'lentil', 'rajma'], message: 'High potassium/phosphorus — limit for CKD' },
  diabetes: { triggers: ['sugar', 'rice', 'naan', 'bread', 'potato', 'sweet', 'jaggery'], message: 'High glycemic content' },
  gout: { triggers: ['organ', 'liver', 'kidney', 'shrimp', 'shellfish', 'sardine', 'kidney bean', 'lentil'], message: 'High purine — may trigger gout flare' },
  histamine_intolerance: { triggers: ['fermented', 'miso', 'soy sauce', 'fish sauce', 'vinegar', 'pickle', 'aged', 'smoked', 'cured', 'dosa', 'idli'], message: 'Fermented/aged — histamine trigger' },
  fodmap: { triggers: ['onion', 'garlic', 'wheat', 'lentil', 'chickpea', 'kidney bean', 'mushroom'], message: 'High-FODMAP ingredients' },
};

function checkConditionFlags(dish, userConditions) {
  if (!userConditions || userConditions.length === 0) return [];
  const flags = [];
  const iStr = (dish.ingredients || []).join(' ').toLowerCase() + ' ' + (dish.dish || '').toLowerCase();
  for (const cond of userConditions) {
    const rules = CONDITION_RULES[cond];
    if (!rules) continue;
    const matched = rules.triggers.filter(t => iStr.includes(t));
    if (matched.length > 0) flags.push({ condition: cond, message: rules.message, triggeredBy: matched });
  }
  return flags;
}

function scoreDishRisk(dish, profile, crossMap, kitchenType = 'casual') {
  const triggers = [];
  let maxRS = 0, cumRS = 0;
  for (const [aId, aInfo] of Object.entries(dish.allergens || {})) {
    if (!aInfo.present) continue;
    const dm = crossMap.get(aId);
    if (!dm) continue;
    const iw = SEV_W[aInfo.severity] || 0.5;
    const uw = USR_M[profile.severity] || 1.0;
    const kw = KIT_M[kitchenType] || 1.0;
    const rs = iw * uw * kw * dm.probability;
    triggers.push({ allergen: aId, source: aInfo.source, severity: aInfo.severity, isDirect: dm.isDirect, crossReactivity: dm.isDirect ? null : { probability: dm.probability, path: dm.path }, riskScore: rs });
    maxRS = Math.max(maxRS, rs);
    cumRS += rs;
  }
  const condFlags = checkConditionFlags(dish, profile.conditions);
  let riskLevel, riskLabel;
  if (maxRS >= 1.2 || (maxRS >= 0.8 && triggers.some(t => t.isDirect && t.severity === 'primary_ingredient'))) {
    riskLevel = 'avoid'; riskLabel = 'AVOID';
  } else if (maxRS >= 0.3 || triggers.length > 0) {
    riskLevel = 'ask'; riskLabel = 'ASK';
  } else if (condFlags.length > 0) {
    riskLevel = 'ask'; riskLabel = 'ASK';
  } else {
    riskLevel = 'low'; riskLabel = 'LOW RISK';
  }
  // Emergency override: anaphylaxis + primary ingredient = emergency
  if (profile.severity === 'anaphylaxis' && triggers.some(t => t.isDirect && (t.severity === 'primary_ingredient' || t.severity === 'base_ingredient'))) {
    riskLevel = 'emergency'; riskLabel = 'EMERGENCY';
  }
  return { dish: dish.dish, riskLevel, riskLabel, maxRiskScore: maxRS, triggers, conditionFlags: condFlags, hiddenRisks: dish.hidden_risks || null, alternatives: dish.alternatives || null };
}

function assessMenu(dishNames, kbDishes, profile, kitchenType = 'casual') {
  const crossMap = traverseCrossReactivity(profile.allergens);
  const results = [];
  for (const name of dishNames) {
    const matches = fuzzyMatchDish(name, kbDishes);
    if (matches.length > 0) {
      const best = matches[0];
      const risk = scoreDishRisk(best.dish, profile, crossMap, kitchenType);
      results.push({ ...risk, inputName: name, matchConfidence: best.score, matchType: best.matchType, requiresCloudFallback: false });
    } else {
      results.push({ dish: name, inputName: name, riskLevel: 'ask', riskLabel: 'UNKNOWN', maxRiskScore: 0, triggers: [], conditionFlags: [], hiddenRisks: 'Not in knowledge graph. Claude inference needed.', alternatives: null, matchConfidence: 0, requiresCloudFallback: true });
    }
  }
  const order = { emergency: 0, avoid: 1, ask: 2, low: 3 };
  return results.sort((a, b) => (order[a.riskLevel] ?? 2) - (order[b.riskLevel] ?? 2));
}

// ─── ENTITY EXTRACTION FROM VOICE TRANSCRIPT ───
function extractDishEntities(transcript, kbDishes, threshold = 0.55) {
  const cleaned = transcript.toLowerCase()
    .replace(/[,;.!?]/g, ' ').replace(/\band\b/g, ' ').replace(/\bor\b/g, ' ')
    .replace(/\bwith\b/g, ' ').replace(/\bthe\b/g, ' ').replace(/\bsome\b/g, ' ')
    .replace(/\bwe have\b/g, ' ').replace(/\btoday\b/g, ' ').replace(/\bspecial\b/g, ' ')
    .replace(/\s+/g, ' ').trim();
  const words = cleaned.split(' ').filter(w => w.length > 1);
  const detected = [];
  const used = new Set();
  for (let n = 4; n >= 1; n--) {
    for (let i = 0; i <= words.length - n; i++) {
      const idxs = Array.from({ length: n }, (_, k) => i + k);
      if (idxs.some(x => used.has(x))) continue;
      const cand = idxs.map(x => words[x]).join(' ');
      if (cand.length < 3) continue;
      const matches = fuzzyMatchDish(cand, kbDishes, 1, 0.45);
      if (matches.length > 0 && matches[0].score >= threshold) {
        detected.push({ inputText: cand, matchedDish: matches[0].dish, confidence: matches[0].score });
        idxs.forEach(x => used.add(x));
      }
    }
  }
  return detected;
}

// ─── DEMO TRANSCRIPTS ───
const DEMO_TRANSCRIPTS = {
  north_indian: 'palak paneer, butter chicken, idli, chole bhature, rajma, dosa, malai kofta, dal makhani, naan',
  japanese: 'miso soup, edamame, tempura, ramen, sashimi, onigiri, yakitori, okonomiyaki',
  thai: 'pad thai, massaman curry, satay, green curry, tom yum soup, larb, mango sticky rice, panang curry',
  south_indian: 'idli, dosa, sambar, rasam, upma, curd rice',
};

// Export to window
Object.assign(window, {
  levenshtein, normalizeDishName, fuzzyMatchDish,
  traverseCrossReactivity, scoreDishRisk, assessMenu,
  extractDishEntities, DEMO_TRANSCRIPTS, CROSS_REACTIVITY_GRAPH,
  checkConditionFlags, SEV_W, USR_M, KIT_M,
});
