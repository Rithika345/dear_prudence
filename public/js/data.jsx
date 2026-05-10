// Prudence — data with richer allergen profiles

const PROFILES = [
  { id: 'ringo', name: 'Ringo', pin: '1968', cuisine: 'north_indian', cuisineLabel: 'North India · Rishikesh', region: 'Rishikesh, India', bio: 'Allium, dairy, and tree nut sensitive. Visiting the foothills.', allergens: ['allium', 'milk', 'tree_nut', 'soy'], conditions: [], severity: 'moderate', insight: 'Ghee is dairy. Cashew paste is tree nut. Staff insist both are fine.', language: 'hindi' },
  { id: 'maya', name: 'Maya', pin: '2024', cuisine: 'french', cuisineLabel: 'France · Paris', region: 'Paris, France', bio: 'Anaphylactic to peanut. Cross-reactive to tree nuts and sesame.', allergens: ['peanut', 'tree_nut', 'sesame'], conditions: [], severity: 'anaphylaxis', insight: 'French pastry is built on almonds and hazelnuts. Cross-reactivity cascades through everything.', language: 'french' },
  { id: 'kenji', name: 'Kenji', pin: '3030', cuisine: 'japanese', cuisineLabel: 'Japan · Kyoto', region: 'Kyoto, Japan', bio: 'Celiac with shellfish, soy, and egg allergies.', allergens: ['wheat', 'shellfish', 'soy', 'egg'], conditions: ['celiac'], severity: 'moderate', insight: 'Soy sauce has wheat. Miso has wheat. Tamagoyaki is egg. Nearly everything triggers.', language: 'japanese' },
  { id: 'priya', name: 'Priya', pin: '4040', cuisine: 'spanish', cuisineLabel: 'Spain · Barcelona', region: 'Barcelona, Spain', bio: 'CKD and histamine intolerance. Egg, fish, and dairy restricted.', allergens: ['egg', 'fish', 'milk', 'sesame'], conditions: ['ckd', 'histamine_intolerance'], severity: 'intolerance', insight: 'Jamón is histamine. Tortilla is egg. Manchego is dairy. Half the menu vanishes.', language: 'spanish' },
];

const ALLERGENS_FALCPA = [
  { id: 'milk', glyph: 'M', label: 'Milk' }, { id: 'egg', glyph: 'E', label: 'Egg' },
  { id: 'peanut', glyph: 'P', label: 'Peanut' }, { id: 'tree_nut', glyph: 'T', label: 'Tree nut' },
  { id: 'fish', glyph: 'F', label: 'Fish' }, { id: 'shellfish', glyph: 'S', label: 'Shellfish' },
  { id: 'wheat', glyph: 'W', label: 'Wheat' }, { id: 'soy', glyph: 'Y', label: 'Soy' },
  { id: 'sesame', glyph: 'X', label: 'Sesame' },
];
const ALLERGENS_EXT = [
  { id: 'allium', glyph: 'A', label: 'Allium' }, { id: 'gluten', glyph: 'G', label: 'Gluten' },
  { id: 'buckwheat', glyph: 'B', label: 'Buckwheat' }, { id: 'coconut', glyph: 'C', label: 'Coconut' },
];

const CONDITIONS = [
  { id: 'celiac', label: 'Celiac' }, { id: 'ckd', label: 'CKD' }, { id: 'diabetes', label: 'Diabetes' },
  { id: 'gout', label: 'Gout' }, { id: 'histamine_intolerance', label: 'Histamine intolerance' }, { id: 'fodmap', label: 'FODMAP' },
];

const CROSS_REACT = {
  peanut: [['tree_nut', 0.30], ['lupin', 0.50], ['soy', 0.05]],
  tree_nut: [['peanut', 0.30], ['coconut', 0.10], ['sesame', 0.10]],
  shellfish: [['crustacean', 0.75], ['mollusk', 0.40], ['squid', 0.40]],
  fish: [['shellfish', 0.10]],
  milk: [['ghee', 0.95], ['casein', 1.0], ['whey', 1.0], ['goat_milk', 0.90]],
  wheat: [['barley', 0.60], ['rye', 0.55], ['soy_sauce', 0.85]],
  egg: [['mayonnaise', 0.95], ['meringue', 1.0]],
  allium: [['asafoetida', 0.40], ['chives', 0.90], ['leek', 0.85]],
  soy: [['peanut', 0.05], ['edamame', 1.0]],
  sesame: [['tahini', 1.0], ['poppy_seed', 0.15]],
};

const FOOD_EMOJI = {
  'Butter Chicken':'🍛','Palak Paneer':'🥬','Malai Kofta':'🧆','Naan':'🫓','Chole Bhature':'🍲','Rajma':'🫘','Plain Dal Tadka':'🥣','Idli':'🍙','Dosa':'🫓',
  'Macaron':'🍪','Galette des Rois':'🥧','Salade aux Noix':'🥗','Croissant':'🥐','Pain au Chocolat':'🍫','Crêpe Suzette':'🥞','Croque Monsieur':'🥪','Steak Frites':'🥩',"Soupe à l'Oignon":'🧅',
  'Tempura':'🍤','Ramen':'🍜','Okonomiyaki':'🥞','Udon':'🍜','Gyoza':'🥟','Miso Soup':'🍲','Sashimi':'🍣','Yakitori':'🍢','Onigiri':'🍙','Edamame':'🫛',
  'Tortilla Española':'🍳','Boquerones en Vinagre':'🐟','Croquetas de Bacalao':'🧆','Jamón Ibérico':'🥓','Manchego Cheese':'🧀','Patatas Bravas':'🥔','Gazpacho':'🍅','Pa amb Tomàquet':'🍞',
};

const BRIEFINGS = {
  north_indian: {
    region: 'NORTH INDIA · RISHIKESH',
    overview: 'Vegetarian by default, dairy by reflex. Allium, ghee, and cashew paste thread through nearly every gravy.',
    threats: [
      { name: 'Ghee in everything', risk: 'avoid', why: 'Dairy fat used as cooking medium. Staff insist ghee "isn\'t really dairy."' },
      { name: 'Onion / garlic base', risk: 'avoid', why: 'Foundation of most gravies. Jain preparations omit it.' },
      { name: 'Cashew paste in creams', risk: 'avoid', why: 'Tree nut thickener in makhani/korma sauces. Rarely listed.' },
      { name: 'Soy sauce in Indo-Chinese', risk: 'ask', why: 'Manchurian, fried rice — soy is the base.' },
    ],
    crossContamination: ['Shared tandoor — naan beside kebabs.', 'Single ladle moves between gravies.', 'Sweet shops fry savouries in ghee.'],
    safeAlternatives: ['Ask for Jain preparation: no onion, no garlic, no root vegetables.', 'Steamed dishes: idli, plain dal, jeera rice.', 'Coconut-oil South Indian items where available.'],
    emergency: { lang: 'Hindi', script: 'मुझे गंभीर एलर्जी है। कृपया एम्बुलेंस बुलाएँ।', translit: 'Mujhe gambhīr elerjī hai. Kṛpayā ambulance bulāyẽ.', english: 'I have a severe allergy. Please call an ambulance.', phone: '112', hospital: 'AIIMS Rishikesh · 6 km', epipen: 'OTC adrenaline at major pharmacies. EpiPen brand not widely stocked.' },
  },
  french: {
    region: 'FRANCE · PARIS',
    overview: 'Tree nuts are the architecture of French pastry. Almonds, hazelnuts, walnuts, and sesame hide everywhere.',
    threats: [
      { name: 'Macarons — almond flour', risk: 'emergency', why: 'Made entirely from ground almonds. Cross-reacts with peanut at 30%.' },
      { name: 'Praliné and frangipane', risk: 'emergency', why: 'Hazelnut or almond paste in pastries, galettes, and desserts.' },
      { name: 'Sesame on breads', risk: 'avoid', why: 'Baguettes, burger buns, and brioche frequently topped with sesame.' },
      { name: 'Shared pâtisserie surfaces', risk: 'avoid', why: 'Boulangeries prepare nut and non-nut items on same surfaces.' },
    ],
    crossContamination: ['Same display case for nut and plain pastries.', 'Butter used across all preparations — nut residue transfers.', 'Sesame seeds on shared bread trays.'],
    safeAlternatives: ['Croque monsieur — ham, cheese, bread. No nuts.', 'Steak frites — meat and potatoes. Confirm oil.', "Soupe à l'oignon — onion, bread, cheese."],
    emergency: { lang: 'French', script: "J'ai une allergie grave aux cacahuètes. Appelez une ambulance, s'il vous plaît.", translit: 'Jay oon ah-lair-ZHEE grahv oh kah-kah-WET.', english: 'I have a severe peanut allergy. Please call an ambulance.', phone: '15 (SAMU)', hospital: 'Hôpital Hôtel-Dieu · 1 km', epipen: 'Prescription required. Available at any pharmacie.' },
  },
  japanese: {
    region: 'JAPAN · KYOTO',
    overview: 'Wheat in soy sauce, egg in everything, shellfish in dashi, soy as seasoning. Four allergens collide in nearly every dish.',
    threats: [
      { name: 'Soy sauce contains wheat', risk: 'avoid', why: 'Standard shoyu is wheat-fermented. Tamari is the wheat-free variant.' },
      { name: 'Egg in batters and omelets', risk: 'avoid', why: 'Tempura batter, tamagoyaki, ramen topping — egg is everywhere.' },
      { name: 'Shellfish in dashi stock', risk: 'avoid', why: 'Bonito + niboshi. Even "vegetable" dishes use fish-based dashi.' },
      { name: 'Soy in everything savory', risk: 'avoid', why: 'Edamame, tofu, miso, soy sauce — the entire umami layer.' },
    ],
    crossContamination: ['Conveyor sushi shares the same rice batch.', 'Tempura fryer is rarely dedicated.', 'Shoyu drizzled at the pass on most dishes.'],
    safeAlternatives: ['Onigiri with umeboshi filling — rice, salt, plum.', 'Grilled fish with shio (salt, no soy).', 'Plain steamed rice with pickled vegetables.'],
    emergency: { lang: 'Japanese', script: '重度のアレルギーがあります。救急車を呼んでください。', translit: 'Jūdo no arerugī ga arimasu. Kyūkyūsha o yonde kudasai.', english: 'I have a severe allergy. Please call an ambulance.', phone: '119', hospital: 'Kyoto University Hospital · 2 km', epipen: 'Prescription required. Hospital pharmacies only. Ask for エピペン.' },
  },
  spanish: {
    region: 'SPAIN · BARCELONA',
    overview: 'Cured meats, aged cheese, vinegar, eggs, fish, and dairy dominate tapas. Five of your triggers in every pintxo bar.',
    threats: [
      { name: 'Tortilla española', risk: 'avoid', why: 'Eggs + dairy. Served everywhere, all day.' },
      { name: 'Jamón ibérico', risk: 'avoid', why: 'Cured 18–36 months. Extremely high histamine.' },
      { name: 'Manchego and aged cheeses', risk: 'avoid', why: 'Aged dairy = histamine + CKD phosphorus. Double flag.' },
      { name: 'Boquerones en vinagre', risk: 'avoid', why: 'Anchovies (fish) in vinegar (histamine). Triple trigger.' },
    ],
    crossContamination: ['Tapas bars prep all items on shared surfaces.', 'Olive oil reused across fish and meat dishes.', 'Egg wash on empanadas sharing the oven.'],
    safeAlternatives: ['Pa amb tomàquet — bread, fresh tomato, olive oil.', 'Grilled vegetables (escalivada) — no dairy, no egg.', 'Plain rice dishes without stock.'],
    emergency: { lang: 'Spanish', script: 'Tengo una alergia grave. Por favor llame a una ambulancia.', translit: 'TEN-go oo-na ah-LAIR-hee-ah GRAH-veh.', english: 'I have a severe allergy. Please call an ambulance.', phone: '112', hospital: 'Hospital Clínic de Barcelona · 2 km', epipen: 'Prescription required. Available at any farmacia.' },
  },
};

const ASSESSMENTS = {
  ringo: [
    { dish: 'Butter Chicken', native: 'मुर्ग़ मखनी', risk: 'avoid', why: 'Butter + cream (dairy), cashew paste (tree nut), onion-garlic (allium). Triple trigger.' },
    { dish: 'Palak Paneer', native: 'पालक पनीर', risk: 'avoid', why: 'Paneer (dairy), cream finish, garlic-onion gravy (allium).' },
    { dish: 'Malai Kofta', native: 'मलाई कोफ़्ता', risk: 'avoid', why: 'Cream (dairy), cashew paste (tree nut), paneer filling, allium base. Quad trigger.' },
    { dish: 'Korma', native: 'कोरमा', risk: 'avoid', why: 'Yogurt (dairy), cashew-almond paste (tree nut), onion (allium).' },
    { dish: 'Naan', native: 'नान', risk: 'ask', why: 'Milk (dairy). Ghee brushed post-bake. Ask for oil and plain.' },
    { dish: 'Chole Bhature', native: 'छोले भटूरे', risk: 'ask', why: 'Allium base. Dairy-free if no cream. Request Jain.' },
    { dish: 'Rajma', native: 'राजमा', risk: 'ask', why: 'Onion-garlic base (allium). No dairy/nut if no ghee tempering.' },
    { dish: 'Idli', native: 'इडली', risk: 'low', why: 'Rice + lentil batter. No allium, no dairy, no tree nut, no soy.' },
    { dish: 'Dosa', native: 'दोसा', risk: 'low', why: 'Rice + urad dal. Masala filling may contain onion — ask.' },
  ],
  maya: [
    { dish: 'Macaron', native: 'Macaron', risk: 'emergency', why: 'Ground almonds (tree nut → peanut cross-reaction 30%). Sesame in some varieties.' },
    { dish: 'Galette des Rois', native: 'Galette des Rois', risk: 'emergency', why: 'Frangipane = pure almond cream (tree nut). Peanut cross-reactive.' },
    { dish: 'Salade aux Noix', native: 'Salade aux Noix', risk: 'emergency', why: 'Walnut (tree nut) as primary. Walnut oil dressing. Sesame croutons possible.' },
    { dish: 'Croissant', native: 'Croissant', risk: 'ask', why: 'No nuts in recipe, but baked alongside nut pastries. Sesame variants exist.' },
    { dish: 'Pain au Chocolat', native: 'Pain au Chocolat', risk: 'ask', why: 'Chocolate may contain nut traces. Shared equipment.' },
    { dish: 'Crêpe Suzette', native: 'Crêpe Suzette', risk: 'ask', why: 'Basic crêpe is nut-free. Nutella filling is not. Ask.' },
    { dish: 'Croque Monsieur', native: 'Croque Monsieur', risk: 'low', why: 'Ham, cheese, bread, béchamel. No nuts, no sesame.' },
    { dish: 'Steak Frites', native: 'Steak Frites', risk: 'low', why: 'Beef and potatoes. Confirm frying oil is not nut-based.' },
    { dish: "Soupe à l'Oignon", native: "Soupe à l'Oignon", risk: 'low', why: 'Onion, bread, Gruyère. Zero nut/sesame risk.' },
  ],
  kenji: [
    { dish: 'Tempura', native: '天ぷら', risk: 'avoid', why: 'Wheat batter, egg batter, shared fryer with shrimp (shellfish). All four allergens.', condFlag: 'Celiac: wheat flour' },
    { dish: 'Ramen', native: 'ラーメン', risk: 'avoid', why: 'Wheat noodles, soy broth, egg topping, shellfish dashi. Everything triggers.', condFlag: 'Celiac: wheat noodles' },
    { dish: 'Okonomiyaki', native: 'お好み焼き', risk: 'avoid', why: 'Wheat batter, egg, shrimp, soy sauce. Quad trigger.', condFlag: 'Celiac: wheat batter' },
    { dish: 'Tamagoyaki', native: '卵焼き', risk: 'avoid', why: 'Egg is the dish. Soy sauce mixed into the egg. Dashi stock (shellfish).' },
    { dish: 'Gyoza', native: '餃子', risk: 'avoid', why: 'Wheat wrapper, soy dipping sauce.' },
    { dish: 'Miso Soup', native: '味噌汁', risk: 'ask', why: 'Wheat in miso koji. Soy base. Dashi = dried fish.', condFlag: 'Celiac: wheat in miso' },
    { dish: 'Sashimi', native: '刺身', risk: 'ask', why: 'Raw fish safe, but soy sauce alongside. Skip ebi/hotate (shellfish).' },
    { dish: 'Yakitori', native: '焼き鳥', risk: 'ask', why: 'Tare = soy sauce (wheat + soy). Order shio (salt) only.' },
    { dish: 'Onigiri', native: 'おにぎり', risk: 'low', why: 'Rice, nori, umeboshi filling. No wheat, no egg, no soy, no shellfish.' },
    { dish: 'Edamame', native: '枝豆', risk: 'avoid', why: 'Soybeans — direct soy allergen match.' },
  ],
  priya: [
    { dish: 'Tortilla Española', native: 'Tortilla Española', risk: 'avoid', why: 'Egg (primary), often finished with dairy. Potato = CKD potassium.', condFlag: 'CKD: potato (potassium)' },
    { dish: 'Boquerones en Vinagre', native: 'Boquerones en Vinagre', risk: 'avoid', why: 'Fish (anchovy) + vinegar (histamine). Both allergen and condition fire.' },
    { dish: 'Croquetas de Bacalao', native: 'Croquetas de Bacalao', risk: 'avoid', why: 'Fish (cod) + egg batter + dairy (béchamel). Triple allergen.' },
    { dish: 'Jamón Ibérico', native: 'Jamón Ibérico', risk: 'avoid', why: 'Cured 18–36 months. Histamine extreme. CKD: high sodium.', condFlag: 'Histamine: long-cured meat' },
    { dish: 'Manchego Cheese', native: 'Queso Manchego', risk: 'avoid', why: 'Dairy (milk) + aged (histamine) + CKD (phosphorus). Triple flag.', condFlag: 'Histamine + CKD: aged dairy' },
    { dish: 'Patatas Bravas', native: 'Patatas Bravas', risk: 'ask', why: 'No egg/fish/dairy in base. But CKD flags potato (potassium). Aioli has egg.', condFlag: 'CKD: potato' },
    { dish: 'Gazpacho', native: 'Gazpacho', risk: 'ask', why: 'Tomato (CKD) + vinegar (histamine). No allergens in base recipe.', condFlag: 'CKD + Histamine' },
    { dish: 'Pa amb Tomàquet', native: 'Pa amb Tomàquet', risk: 'low', why: 'Bread, fresh tomato, olive oil. No egg, fish, or dairy. Not fermented.' },
    { dish: 'Paella Mixta*', native: 'Paella', risk: 'avoid', why: 'Fish stock, shellfish, sometimes egg. Inferred by Claude.', inferred: true },
    { dish: 'Churros*', native: 'Churros', risk: 'ask', why: 'Some recipes use egg, some dairy. Varies. Inferred.', inferred: true },
  ],
};

const PHRASES = {
  hindi: [
    { tier: 'low', english: 'Does this dish contain milk, onion, nuts, or soy?', script: 'क्या इस व्यंजन में दूध, प्याज़, मेवे, या सोया है?', translit: 'Kyā is vyañjan mẽ dūdh, pyāz, meve, yā soyā hai?' },
    { tier: 'ask', english: 'I have severe allergies. Please confirm with the kitchen.', script: 'मुझे गंभीर एलर्जी है। कृपया रसोई से पुष्टि करें।', translit: 'Mujhe gambhīr elerjī hai. Kṛpayā rasoī se puṣṭi karẽ.' },
    { tier: 'avoid', english: 'Can this be prepared without dairy, onion, nuts, and soy?', script: 'क्या यह डेयरी, प्याज़, मेवे, और सोया के बिना बनाया जा सकता है?', translit: 'Kyā yah ḍerī, pyāz, meve, aur soyā ke binā banāyā jā saktā hai?' },
    { tier: 'emergency', english: 'I could die if I eat this. This is a medical emergency.', script: 'यदि मैंने यह खाया तो मेरी जान जा सकती है। यह आपातकाल है।', translit: 'Yadi mainē yah khāyā to merī jān jā saktī hai. Yah āpātkāl hai.' },
    { tier: 'emergency', english: 'I am having an allergic reaction. Call an ambulance.', script: 'मुझे एलर्जी की प्रतिक्रिया हो रही है। एम्बुलेंस बुलाएँ।', translit: 'Mujhe elerjī kī pratikriyā ho rahī hai. Ambulance bulāyẽ.' },
  ],
  french: [
    { tier: 'low', english: 'Does this dish contain peanuts, tree nuts, or sesame?', script: 'Est-ce que ce plat contient des cacahuètes, des fruits à coque, ou du sésame ?', translit: 'Ess-kuh suh plah kon-TYEN day kah-kah-WET, day frwee ah kok, oo dew say-ZAM?' },
    { tier: 'ask', english: 'I have a severe nut and sesame allergy. Please confirm with the chef.', script: "J'ai une allergie grave aux noix et au sésame. Veuillez confirmer avec le chef.", translit: 'Jay oon ah-lair-ZHEE grahv oh nwah ay oh say-ZAM.' },
    { tier: 'avoid', english: 'Can this be prepared without any nuts, peanuts, and sesame?', script: 'Peut-on préparer ce plat sans noix, cacahuètes, et sésame ?', translit: 'Puh-ton pray-pah-RAY suh plah sahn nwah, kah-kah-WET, ay say-ZAM?' },
    { tier: 'emergency', english: 'I could die if I eat nuts. This is a medical emergency.', script: "Je pourrais mourir si je mange des noix. C'est une urgence médicale.", translit: 'Zhuh poo-RAY moo-REER see zhuh mahnzh day nwah.' },
    { tier: 'emergency', english: 'I am having an allergic reaction. Call SAMU.', script: "Je fais une réaction allergique. Appelez le SAMU, s'il vous plaît.", translit: 'Zhuh fay oon ray-ak-SYON ah-lair-ZHEEK. Ah-play luh sah-MOO.' },
  ],
  japanese: [
    { tier: 'low', english: 'Does this contain wheat, shellfish, soy, or egg?', script: 'この料理に小麦、甲殻類、大豆、卵は入っていますか。', translit: 'Kono ryōri ni komugi, kōkakurui, daizu, tamago wa haitte imasu ka?' },
    { tier: 'ask', english: 'I have celiac disease and multiple food allergies. Please confirm.', script: 'セリアック病と複数の食物アレルギーがあります。確認してください。', translit: 'Seriakku-byō to fukusū no shokumotsu arerugī ga arimasu.' },
    { tier: 'avoid', english: 'Can this be made without soy sauce, egg, and shellfish?', script: '醤油、卵、甲殻類を使わずに作れますか。', translit: 'Shōyu, tamago, kōkakurui o tsukawazu ni tsukuremasu ka?' },
    { tier: 'emergency', english: 'I could become very ill. This is a medical emergency.', script: '重症になる可能性があります。これは医療上の緊急事態です。', translit: 'Jūshō ni naru kanōsei ga arimasu. Kore wa iryōjō no kinkyū jitai desu.' },
    { tier: 'emergency', english: 'Allergic reaction. Call an ambulance.', script: 'アレルギー反応が出ています。救急車を呼んでください。', translit: 'Arerugī hannō ga dete imasu. Kyūkyūsha o yonde kudasai.' },
  ],
  spanish: [
    { tier: 'low', english: 'Does this dish contain egg, fish, dairy, or sesame?', script: '¿Este plato contiene huevo, pescado, lácteos, o sésamo?', translit: 'ES-teh PLAH-toh kon-TYEH-neh WEH-voh, pes-KAH-doh, LAK-teh-os, oh SEH-sah-moh?' },
    { tier: 'ask', english: 'I have kidney disease, histamine intolerance, and food allergies. Please confirm ingredients.', script: 'Tengo enfermedad renal, intolerancia a la histamina, y alergias alimentarias. Confirme los ingredientes.', translit: 'TEN-go en-fer-meh-DAHD reh-NAHL, in-toh-leh-RAHN-syah...' },
    { tier: 'avoid', english: 'Can this be made without egg, fish, dairy, and fermented ingredients?', script: '¿Se puede preparar sin huevo, pescado, lácteos, e ingredientes fermentados?', translit: 'Seh PWEH-deh preh-pah-RAHR seen WEH-voh, pes-KAH-doh, LAK-teh-os...' },
    { tier: 'emergency', english: 'My condition could become very serious. Medical emergency.', script: 'Mi condición podría empeorar gravemente. Es una emergencia médica.', translit: 'Mee kon-dee-SYON poh-DREE-ah em-peh-oh-RAHR grah-veh-MEN-teh.' },
    { tier: 'emergency', english: 'I feel very unwell. Please call an ambulance.', script: 'Me siento muy mal. Por favor llame a una ambulancia.', translit: 'Meh SYEN-toh mooy mahl. Por fah-VOR YAH-meh...' },
  ],
};

const TABS = [
  { id: 'body', numeral: 'i', label: 'Body' }, { id: 'place', numeral: 'ii', label: 'Place' },
  { id: 'food', numeral: 'iii', label: 'Food' }, { id: 'voice', numeral: 'iv', label: 'Voice' },
  { id: 'about', numeral: 'v', label: 'About' },
];

Object.assign(window, { PROFILES, ALLERGENS_FALCPA, ALLERGENS_EXT, CONDITIONS, CROSS_REACT, BRIEFINGS, ASSESSMENTS, PHRASES, TABS, FOOD_EMOJI });
