// Prudence — static demo data (mirrors backend shape from spec)

const PROFILES = [
  { id: 'ringo', name: 'Ringo', pin: '1968', cuisine: 'north_indian', cuisineLabel: 'North India · Rishikesh', region: 'Rishikesh, India', bio: 'Allium and dairy sensitive. Visiting the foothills.', allergens: ['allium', 'milk'], conditions: [], severity: 'moderate', insight: 'Ghee is dairy. Staff routinely insist it isn\u2019t.', language: 'hindi' },
  { id: 'maya', name: 'Maya', pin: '2024', cuisine: 'thai', cuisineLabel: 'Thailand · Bangkok', region: 'Bangkok, Thailand', bio: 'Anaphylactic to peanut. Three nights in Bangkok.', allergens: ['peanut'], conditions: [], severity: 'anaphylaxis', insight: 'Peanuts are ground into the curry paste itself.', language: 'thai' },
  { id: 'kenji', name: 'Kenji', pin: '3030', cuisine: 'japanese', cuisineLabel: 'Japan · Kyoto', region: 'Kyoto, Japan', bio: 'Celiac and shellfish allergic. Long visit.', allergens: ['wheat', 'shellfish'], conditions: ['celiac'], severity: 'moderate', insight: 'Soy sauce contains wheat. So does most miso.', language: 'japanese' },
  { id: 'priya', name: 'Priya', pin: '4040', cuisine: 'south_indian', cuisineLabel: 'South India · Bengaluru', region: 'Bengaluru, India', bio: 'CKD and histamine intolerance. Egg- and fish-free.', allergens: ['egg', 'fish'], conditions: ['ckd', 'histamine_intolerance'], severity: 'intolerance', insight: 'Idli is allergen-safe yet histamine-flagged. Fermented.', language: 'kannada' },
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
  peanut: [['tree_nut', 0.30], ['lupin', 0.50]], tree_nut: [['peanut', 0.30], ['coconut', 0.10]],
  shellfish: [['crustacean', 0.75], ['mollusk', 0.40]], fish: [['shellfish', 0.10]],
  milk: [['ghee', 0.95], ['casein', 1.0], ['whey', 1.0]], wheat: [['barley', 0.60], ['rye', 0.55], ['soy_sauce', 0.85]],
  egg: [['mayonnaise', 0.95]], allium: [['asafoetida', 0.40]],
};

const BRIEFINGS = {
  north_indian: {
    region: 'NORTH INDIA · RISHIKESH',
    overview: 'Vegetarian by default, dairy by reflex. Allium and ghee thread through nearly every gravy.',
    threats: [
      { name: 'Ghee in everything', risk: 'avoid', why: 'Dairy fat used as cooking medium. Often invisible on the menu.' },
      { name: 'Onion / garlic base', risk: 'avoid', why: 'Foundation of most gravies. Jain preparations omit it.' },
      { name: 'Cashew paste in creams', risk: 'ask', why: 'Thickener for makhani-style sauces. Rarely listed.' },
      { name: 'Yogurt marinades', risk: 'ask', why: 'Tandoori dishes are marinated in dahi.' },
    ],
    crossContamination: ['Shared tandoor \u2014 naan beside kebabs.', 'Single ladle moves between gravies.', 'Sweet shops fry savouries in ghee.'],
    safeAlternatives: ['Ask for Jain preparation: no onion, no garlic, no root vegetables.', 'Steamed dishes: idli, plain dal, jeera rice.', 'Coconut-oil South Indian items where available.'],
    emergency: { lang: 'Hindi', script: '\u092e\u0941\u091d\u0947 \u0917\u0902\u092d\u0940\u0930 \u090f\u0932\u0930\u094d\u091c\u0940 \u0939\u0948\u0964 \u0915\u0943\u092a\u092f\u093e \u090f\u092e\u094d\u092c\u0941\u0932\u0947\u0902\u0938 \u092c\u0941\u0932\u093e\u090f\u0901\u0964', translit: 'Mujhe gambh\u012br elerj\u012b hai. K\u1e5bpay\u0101 ambulance bul\u0101y\u1ebd.', english: 'I have a severe allergy. Please call an ambulance.', phone: '112', hospital: 'AIIMS Rishikesh \u00b7 6 km' },
  },
  thai: {
    region: 'THAILAND · BANGKOK',
    overview: 'Peanut, fish sauce and shellfish are not garnishes \u2014 they are the medium.',
    threats: [
      { name: 'Peanut in curry paste', risk: 'emergency', why: 'Massaman and panang grind peanut into the paste itself.' },
      { name: 'Fish sauce', risk: 'avoid', why: 'Salting agent in nearly every dish, including vegetable stir-fries.' },
      { name: 'Shrimp paste', risk: 'avoid', why: 'Background note in many curries and som tam.' },
      { name: 'Wok cross-contact', risk: 'ask', why: 'Single wok, hundreds of dishes per shift.' },
    ],
    crossContamination: ['Same mortar grinds peanut and chili paste.', 'Stalls reuse oil across dishes.', 'Sticky rice steamers shared with shrimp dim sum.'],
    safeAlternatives: ['Larb (laab) without nam pla.', 'Steamed jasmine rice with grilled chicken.', 'Mango sticky rice \u2014 coconut, not peanut.'],
    emergency: { lang: 'Thai', script: '\u0e09\u0e31\u0e19\u0e41\u0e1e\u0e49\u0e2d\u0e32\u0e2b\u0e32\u0e23\u0e23\u0e38\u0e19\u0e41\u0e23\u0e07 \u0e42\u0e1b\u0e23\u0e14\u0e40\u0e23\u0e35\u0e22\u0e01\u0e23\u0e16\u0e1e\u0e22\u0e32\u0e1a\u0e32\u0e25', translit: 'Ch\u0103n p\u00e1e aah\u0103an run-raeng. Pr\u00f2ht r\u00eeak r\u00f3t p\u00e1-yaa-baan.', english: 'I have a severe food allergy. Please call an ambulance.', phone: '1669', hospital: 'Bumrungrad International \u00b7 3 km' },
  },
  japanese: {
    region: 'JAPAN · KYOTO',
    overview: 'Wheat hides in soy sauce, in miso, in dashi packets \u2014 nearly everywhere savoury lives.',
    threats: [
      { name: 'Soy sauce contains wheat', risk: 'avoid', why: 'Standard shoyu is wheat-fermented. Tamari is the wheat-free variant.' },
      { name: 'Miso paste', risk: 'avoid', why: 'Most miso uses wheat koji. Ask for mugi-free.' },
      { name: 'Dashi from packets', risk: 'ask', why: 'Instant dashi often contains wheat protein.' },
      { name: 'Tempura batter', risk: 'avoid', why: 'Wheat flour, often shared fryer with shrimp.' },
    ],
    crossContamination: ['Conveyor sushi shares the same rice batch.', 'Tempura fryer is rarely dedicated.', 'Shoyu drizzled at the pass on most dishes.'],
    safeAlternatives: ['Onigiri (rice ball) with umeboshi or salmon.', 'Sashimi \u2014 request no soy at the pass.', 'Yakitori with shio (salt) seasoning, not tare.'],
    emergency: { lang: 'Japanese', script: '\u91cd\u5ea6\u306e\u30a2\u30ec\u30eb\u30ae\u30fc\u304c\u3042\u308a\u307e\u3059\u3002\u6551\u6025\u8eca\u3092\u547c\u3093\u3067\u304f\u3060\u3055\u3044\u3002', translit: 'J\u016bdo no arerug\u012b ga arimasu. Ky\u016bky\u016bsha o yonde kudasai.', english: 'I have a severe allergy. Please call an ambulance.', phone: '119', hospital: 'Kyoto University Hospital \u00b7 2 km' },
  },
  south_indian: {
    region: 'SOUTH INDIA · BENGALURU',
    overview: 'Fermentation is the cuisine. Coconut and tamarind are the sauce. Egg and fish hide in surprising places.',
    threats: [
      { name: 'Fermented batters', risk: 'avoid', why: 'Idli, dosa, uttapam \u2014 flagged by histamine intolerance even when allergen-safe.' },
      { name: 'Kidney beans / rajma', risk: 'avoid', why: 'High potassium \u2014 flagged by CKD though no allergens.' },
      { name: 'Coconut in everything', risk: 'ask', why: 'Sambar, chutney, curries. Cross-reactive with tree nut for some.' },
      { name: 'Tamarind sour broths', risk: 'low', why: 'Generally safe; check for shrimp in some rasams.' },
    ],
    crossContamination: ['Sambar pots reused across the meal.', 'Banana leaf service shares hand contact.', 'Coconut oil and ghee both common.'],
    safeAlternatives: ['Plain steamed rice with rasam (no shrimp).', 'Fresh, unfermented chapati.', 'Curd rice (skip if dairy-restricted).'],
    emergency: { lang: 'Kannada', script: '\u0ca8\u0ca8\u0c97\u0cc6 \u0ca4\u0cc0\u0cb5\u0ccd\u0cb0 \u0c85\u0cb2\u0cb0\u0ccd\u0c9c\u0cbf \u0c87\u0ca6\u0cc6. \u0ca6\u0caf\u0cb5\u0cbf\u0c9f\u0ccd\u0c9f\u0cc1 \u0c86\u0c82\u0cac\u0cc1\u0cb2\u0cc6\u0ca8\u0ccd\u0cb8\u0ccd \u0c95\u0cb0\u0cc6\u0caf\u0cbf\u0cb0\u0cbf.', translit: 'Nanage t\u012bvra alarji ide. Dayavi\u1e6d\u1e6du ambulence kareyiri.', english: 'I have a severe allergy. Please call an ambulance.', phone: '108', hospital: 'Manipal Hospital \u00b7 4 km' },
  },
};

// Pre-computed assessment data per profile (matches what the live engine would produce)
const ASSESSMENTS = {
  ringo: [
    { dish: 'Butter Chicken', native: '\u092e\u0941\u0930\u094d\u0917\u093c \u092e\u0916\u0928\u0940', risk: 'avoid', why: 'Butter, cream, yogurt, cashew paste. Allium base.', detail: 'Hidden cashew paste thickens the gravy. Even tikka versions retain dairy.' },
    { dish: 'Palak Paneer', native: '\u092a\u093e\u0932\u0915 \u092a\u0928\u0940\u0930', risk: 'avoid', why: 'Paneer is fresh cheese. Cream finish. Garlic-onion gravy.', detail: 'No dairy-free preparation exists in standard menus.' },
    { dish: 'Malai Kofta', native: '\u092e\u0932\u093e\u0908 \u0915\u094b\u092b\u093c\u094d\u0924\u093e', risk: 'avoid', why: 'Cream sauce, cashew paste, paneer filling. Allium base.', detail: 'Triple dairy: cream, paneer, and ghee. Cannot be modified.' },
    { dish: 'Naan', native: '\u0928\u093e\u0928', risk: 'ask', why: 'Contains milk and wheat. Baked in shared tandoor with ghee.', detail: 'Ghee brushed on after baking. Ask for oil instead.' },
    { dish: 'Chole Bhature', native: '\u091b\u094b\u0932\u0947 \u092d\u091f\u0942\u0930\u0947', risk: 'ask', why: 'Allium base in chole, but dairy-free if no cream finish.', detail: 'Request Jain preparation. Bhature itself is dairy-free.' },
    { dish: 'Rajma', native: '\u0930\u093e\u091c\u092e\u093e', risk: 'ask', why: 'Onion-garlic base. No dairy unless ghee tempering.', detail: 'Ask for oil instead of ghee. Onion cannot be removed.' },
    { dish: 'Plain Dal Tadka', native: '\u0926\u093e\u0932 \u0924\u0921\u093c\u0915\u093e', risk: 'ask', why: 'Lentils with ghee tempering. Garlic in tadka.', detail: 'Ghee is the only dairy. Easily substituted with oil.' },
    { dish: 'Idli', native: '\u0907\u0921\u0932\u0940', risk: 'low', why: 'Rice and lentil batter. No allium, no dairy.', detail: 'Safe across both your allergens. South Indian staple.' },
    { dish: 'Dosa', native: '\u0926\u094b\u0938\u093e', risk: 'low', why: 'Rice and urad dal batter. No allium, no dairy.', detail: 'Masala dosa filling may contain onion \u2014 ask.' },
    { dish: 'Matcha Tiramisu*', native: '\u2014', risk: 'ask', why: 'Mascarpone, ladyfingers (eggs, wheat). Inferred composition.', detail: 'Not in the knowledge graph. Composition reasoned from name.', inferred: true },
  ],
  maya: [
    { dish: 'Massaman Curry', native: '\u0e41\u0e01\u0e07\u0e21\u0e31\u0e2a\u0e21\u0e31\u0e48\u0e19', risk: 'emergency', why: 'Peanuts ground INTO the curry paste. Cannot be removed.', detail: 'The paste itself is made with peanuts. Even if the chef tries to omit, traces remain in the mortar.' },
    { dish: 'Panang Curry', native: '\u0e41\u0e01\u0e07\u0e1e\u0e30\u0e41\u0e19\u0e07', risk: 'emergency', why: 'Peanut is a primary ingredient in panang paste.', detail: 'Ground roasted peanuts are essential. No safe preparation exists.' },
    { dish: 'Pad Thai', native: '\u0e1c\u0e31\u0e14\u0e44\u0e17\u0e22', risk: 'emergency', why: 'Crushed peanuts as topping. Shared wok from peanut dishes.', detail: 'Even without topping, wok cross-contamination is near-certain at street stalls.' },
    { dish: 'Satay', native: '\u0e2a\u0e30\u0e40\u0e15\u0e4a\u0e30', risk: 'emergency', why: 'Peanut sauce is the defining accompaniment.', detail: 'Grilling skewers are often basted with peanut-containing marinade.' },
    { dish: 'Som Tam', native: '\u0e2a\u0e49\u0e21\u0e15\u0e33', risk: 'avoid', why: 'Peanuts commonly added. Shared mortar.', detail: 'Can be ordered without, but same mortar used for peanut batches.' },
    { dish: 'Green Curry', native: '\u0e41\u0e01\u0e07\u0e40\u0e02\u0e35\u0e22\u0e27\u0e2b\u0e27\u0e32\u0e19', risk: 'ask', why: 'No peanut in paste, but shared kitchen equipment.', detail: 'Lower risk than massaman/panang but cross-contamination is possible.' },
    { dish: 'Tom Yum Soup', native: '\u0e15\u0e49\u0e21\u0e22\u0e33', risk: 'low', why: 'No peanut. Lemongrass, galangal, lime base.', detail: 'Generally safe. Contains shrimp (not your allergen).' },
    { dish: 'Larb', native: '\u0e25\u0e32\u0e1a', risk: 'low', why: 'Minced meat, herbs, lime. No peanut.', detail: 'Safe choice. Confirm no peanut garnish.' },
    { dish: 'Mango Sticky Rice', native: '\u0e02\u0e49\u0e32\u0e27\u0e40\u0e2b\u0e19\u0e35\u0e22\u0e27\u0e21\u0e30\u0e21\u0e48\u0e27\u0e07', risk: 'low', why: 'Coconut milk, rice, mango. No peanut.', detail: 'Safe dessert. No cross-contamination risk.' },
  ],
  kenji: [
    { dish: 'Tempura', native: '\u5929\u3077\u3089', risk: 'avoid', why: 'Wheat flour batter. Shared fryer with shrimp tempura.', detail: 'Both wheat AND shellfish in one dish. Celiac condition flag fires on top.', condFlag: 'Celiac: wheat flour causes intestinal damage' },
    { dish: 'Ramen', native: '\u30e9\u30fc\u30e1\u30f3', risk: 'avoid', why: 'Wheat noodles. Soy sauce broth. Wheat is the dish.', detail: 'No safe preparation exists for celiac. Even gluten-free ramen shops use shared equipment.', condFlag: 'Celiac: wheat noodles' },
    { dish: 'Okonomiyaki', native: '\u304a\u597d\u307f\u713c\u304d', risk: 'avoid', why: 'Wheat batter base. Often contains shrimp. Soy sauce topping.', detail: 'The batter IS wheat. Cannot be modified.', condFlag: 'Celiac: wheat batter' },
    { dish: 'Udon', native: '\u3046\u3069\u3093', risk: 'avoid', why: 'Thick wheat noodles in dashi + soy sauce broth.', detail: 'Pure wheat. Soba (buckwheat) is the alternative, but verify no wheat blend.', condFlag: 'Celiac: wheat noodles' },
    { dish: 'Gyoza', native: '\u9903\u5b50', risk: 'avoid', why: 'Wheat wrapper. Soy sauce dipping.', detail: 'Wheat in the skin. No alternative preparation.' },
    { dish: 'Miso Soup', native: '\u5473\u564c\u6c41', risk: 'ask', why: 'Most miso uses wheat koji. Dashi may contain dried fish.', detail: 'Ask for hatcho miso (soybean only, no wheat). Kombu dashi instead of bonito.', condFlag: 'Celiac: wheat in miso paste' },
    { dish: 'Sashimi', native: '\u523a\u8eab', risk: 'ask', why: 'Raw fish is safe, but soy sauce served alongside. Some shellfish varieties.', detail: 'Request tamari (wheat-free soy sauce). Avoid ebi (shrimp) and hotate if unsure.' },
    { dish: 'Yakitori', native: '\u713c\u304d\u9ce5', risk: 'ask', why: 'Tare sauce contains soy sauce (wheat). Shio (salt) version is safe.', detail: 'Order shio (salt) only. Tare glaze contains wheat via soy sauce.' },
    { dish: 'Onigiri', native: '\u304a\u306b\u304e\u308a', risk: 'low', why: 'Rice, nori, filling. Umeboshi and salmon fillings are wheat-free.', detail: 'Safe grab-and-go option. Avoid fillings with soy sauce marinade.' },
    { dish: 'Edamame', native: '\u679d\u8c46', risk: 'low', why: 'Soybeans with salt. No wheat, no shellfish.', detail: 'Safe appetizer. Just salt and soy beans.' },
    { dish: 'Matcha Tiramisu*', native: '\u2014', risk: 'ask', why: 'Mascarpone (dairy), ladyfingers (wheat, eggs). Inferred.', detail: 'Not in the knowledge graph. Claude infers wheat in ladyfingers.', inferred: true, condFlag: 'Celiac: wheat in ladyfingers' },
  ],
  priya: [
    { dish: 'Idli', native: '\u0c87\u0ca1\u0ccd\u0cb2\u0cbf', risk: 'ask', why: 'No egg or fish. BUT: fermented batter triggers histamine.', detail: 'Allergen-safe but medically dangerous. The batter ferments 8\u201312 hours, producing histamine.', condFlag: 'Histamine: fermented batter' },
    { dish: 'Dosa', native: '\u0ca6\u0ccb\u0cb8\u0cc6', risk: 'ask', why: 'No egg or fish. BUT: same fermented batter as idli.', detail: 'Histamine flag. Masala filling adds potato (CKD: potassium).', condFlag: 'Histamine + CKD: fermented + potato' },
    { dish: 'Sambar', native: '\u0cb8\u0cbe\u0c82\u0cac\u0cbe\u0cb0\u0ccd', risk: 'ask', why: 'Lentil-based. No egg/fish, but CKD flags lentil (potassium).', detail: 'Toor dal is moderate-potassium. Limit portion size.', condFlag: 'CKD: lentils, potassium' },
    { dish: 'Rajma', native: '\u0cb0\u0cbe\u0c9c\u0ccd\u0cae\u0cbe', risk: 'ask', why: 'No egg or fish, but kidney beans are HIGH potassium.', detail: 'CKD red flag. Kidney beans are among the highest-potassium legumes. Avoid.', condFlag: 'CKD: kidney beans, high potassium' },
    { dish: 'Fish Curry', native: '\u0cae\u0cc0\u0ca8\u0cc1 \u0cb8\u0cbe\u0cb0\u0cc1', risk: 'avoid', why: 'Fish is a primary ingredient.', detail: 'Direct allergen match. No modification possible.' },
    { dish: 'Egg Appam', native: '\u0cae\u0cca\u0c9f\u0ccd\u0c9f\u0cc6 \u0c85\u0caa\u0ccd\u0caa\u0c82', risk: 'avoid', why: 'Egg is the centerpiece.', detail: 'Direct allergen match.' },
    { dish: 'Curd Rice', native: '\u0cae\u0cca\u0cb8\u0cb0\u0cc1 \u0c85\u0ca8\u0ccd\u0ca8', risk: 'ask', why: 'No egg/fish. Dairy is fine for you, but CKD flags dairy (phosphorus).', detail: 'Moderate phosphorus from yogurt. Small portion acceptable.', condFlag: 'CKD: dairy, phosphorus' },
    { dish: 'Upma', native: '\u0c89\u0caa\u0ccd\u0cae\u0cbe', risk: 'low', why: 'Semolina, vegetables, oil. No egg, no fish, not fermented.', detail: 'Safe choice. Not fermented, low potassium.' },
    { dish: 'Plain Rice + Rasam', native: '\u0c85\u0ca8\u0ccd\u0ca8 \u0cb0\u0cb8\u0c82', risk: 'low', why: 'Tamarind broth, no egg/fish. Not fermented.', detail: 'Safe if rasam has no shrimp. Confirm with kitchen.' },
    { dish: 'Miso Soup (cross-cuisine)', native: '\u5473\u564c\u6c41', risk: 'avoid', why: 'Fish dashi base. Miso is fermented \u2014 histamine trigger.', detail: 'Both allergen (fish) and condition (histamine) flags fire.', condFlag: 'Histamine: fermented miso + Fish allergen' },
  ],
};

const PHRASES = {
  hindi: [
    { tier: 'low', english: 'Does this dish contain milk or onion?', script: '\u0915\u094d\u092f\u093e \u0907\u0938 \u0935\u094d\u092f\u0902\u091c\u0928 \u092e\u0947\u0902 \u0926\u0942\u0927 \u092f\u093e \u092a\u094d\u092f\u093e\u091c\u093c \u0939\u0948?', translit: 'Ky\u0101 is vya\u00f1jan m\u1ebd d\u016bdh y\u0101 py\u0101z hai?' },
    { tier: 'ask', english: 'I have a severe allergy. Please confirm with the kitchen.', script: '\u092e\u0941\u091d\u0947 \u0917\u0902\u092d\u0940\u0930 \u090f\u0932\u0930\u094d\u091c\u0940 \u0939\u0948\u0964 \u0915\u0943\u092a\u092f\u093e \u0930\u0938\u094b\u0908 \u0938\u0947 \u092a\u0941\u0937\u094d\u091f\u093f \u0915\u0930\u0947\u0902\u0964', translit: 'Mujhe gambh\u012br elerj\u012b hai. K\u1e5bpay\u0101 raso\u012b se pu\u1e63\u1e6di kar\u1ebd.' },
    { tier: 'avoid', english: 'Can this be prepared without milk and onion?', script: '\u0915\u094d\u092f\u093e \u092f\u0939 \u0926\u0942\u0927 \u0914\u0930 \u092a\u094d\u092f\u093e\u091c\u093c \u0915\u0947 \u092c\u093f\u0928\u093e \u092c\u0928\u093e\u092f\u093e \u091c\u093e \u0938\u0915\u0924\u093e \u0939\u0948?', translit: 'Ky\u0101 yah d\u016bdh aur py\u0101z ke bin\u0101 ban\u0101y\u0101 j\u0101 sakt\u0101 hai?' },
    { tier: 'emergency', english: 'I could die if I eat this. This is a medical emergency.', script: '\u092f\u0926\u093f \u092e\u0948\u0902\u0928\u0947 \u092f\u0939 \u0916\u093e\u092f\u093e \u0924\u094b \u092e\u0947\u0930\u0940 \u091c\u093e\u0928 \u091c\u093e \u0938\u0915\u0924\u0940 \u0939\u0948\u0964 \u092f\u0939 \u0906\u092a\u093e\u0924\u0915\u093e\u0932 \u0939\u0948\u0964', translit: 'Yadi main\u0113 yah kh\u0101y\u0101 to mer\u012b j\u0101n j\u0101 sakt\u012b hai. Yah \u0101p\u0101tk\u0101l hai.' },
    { tier: 'emergency', english: 'I am having an allergic reaction. Call an ambulance.', script: '\u092e\u0941\u091d\u0947 \u090f\u0932\u0930\u094d\u091c\u0940 \u0915\u0940 \u092a\u094d\u0930\u0924\u093f\u0915\u094d\u0930\u093f\u092f\u093e \u0939\u094b \u0930\u0939\u0940 \u0939\u0948\u0964 \u090f\u092e\u094d\u092c\u0941\u0932\u0947\u0902\u0938 \u092c\u0941\u0932\u093e\u090f\u0901\u0964', translit: 'Mujhe elerj\u012b k\u012b pratikriy\u0101 ho rah\u012b hai. Ambulance bul\u0101y\u1ebd.' },
  ],
  thai: [
    { tier: 'low', english: 'Does this dish contain peanut?', script: '\u0e2d\u0e32\u0e2b\u0e32\u0e23\u0e08\u0e32\u0e19\u0e19\u0e35\u0e49\u0e21\u0e35\u0e16\u0e31\u0e48\u0e27\u0e25\u0e34\u0e2a\u0e07\u0e44\u0e2b\u0e21', translit: 'Aah\u0103an jaan n\u00edi mii th\u00f9a-l\u00ed-s\u014fng m\u00e1i?' },
    { tier: 'ask', english: 'I have a severe peanut allergy. Please confirm with the chef.', script: '\u0e09\u0e31\u0e19\u0e41\u0e1e\u0e49\u0e16\u0e31\u0e48\u0e27\u0e25\u0e34\u0e2a\u0e07\u0e23\u0e38\u0e19\u0e41\u0e23\u0e07 \u0e42\u0e1b\u0e23\u0e14\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e01\u0e31\u0e1a\u0e40\u0e0a\u0e1f', translit: 'Ch\u0103n p\u00e1e th\u00f9a-l\u00ed-s\u014fng run-raeng. Pr\u00f2ht y\u0289\u0289n-yan g\u00e0p ch\u00e9f.' },
    { tier: 'avoid', english: 'Can this be made without peanut and without peanut paste?', script: '\u0e17\u0e33\u0e42\u0e14\u0e22\u0e44\u0e21\u0e48\u0e43\u0e2a\u0e48\u0e16\u0e31\u0e48\u0e27\u0e41\u0e25\u0e30\u0e19\u0e49\u0e33\u0e1e\u0e23\u0e34\u0e01\u0e16\u0e31\u0e48\u0e27\u0e44\u0e14\u0e49\u0e44\u0e2b\u0e21', translit: 'Tham doi m\u00e2i s\u00e0i th\u00f9a l\u00e1e n\u00e1m-pr\u00edk th\u00f9a d\u00e2i m\u00e1i?' },
    { tier: 'emergency', english: 'I could die if I eat peanut. This is a medical emergency.', script: '\u0e09\u0e31\u0e19\u0e2d\u0e32\u0e08\u0e15\u0e32\u0e22\u0e44\u0e14\u0e49\u0e16\u0e49\u0e32\u0e01\u0e34\u0e19\u0e16\u0e31\u0e48\u0e27\u0e25\u0e34\u0e2a\u0e07 \u0e19\u0e35\u0e48\u0e04\u0e37\u0e2d\u0e40\u0e2b\u0e15\u0e38\u0e09\u0e38\u0e01\u0e40\u0e09\u0e34\u0e19\u0e17\u0e32\u0e07\u0e01\u0e32\u0e23\u0e41\u0e1e\u0e17\u0e22\u0e4c', translit: 'Ch\u0103n \u00e0at taai d\u00e2i th\u00e2a gin th\u00f9a-l\u00ed-s\u014fng. N\u00eei k\u0289\u0289 h\u00e8ht ch\u00f9k-ch\u011brn thaang gaan-p\u00e2et.' },
    { tier: 'emergency', english: 'I am having an allergic reaction. Call an ambulance.', script: '\u0e09\u0e31\u0e19\u0e01\u0e33\u0e25\u0e31\u0e07\u0e41\u0e1e\u0e49\u0e2d\u0e32\u0e2b\u0e32\u0e23\u0e23\u0e38\u0e19\u0e41\u0e23\u0e07 \u0e42\u0e1b\u0e23\u0e14\u0e40\u0e23\u0e35\u0e22\u0e01\u0e23\u0e16\u0e1e\u0e22\u0e32\u0e1a\u0e32\u0e25', translit: 'Ch\u0103n gam-lang p\u00e1e aah\u0103an run-raeng. Pr\u00f2ht r\u00eeak r\u00f3t p\u00e1-yaa-baan.' },
  ],
  japanese: [
    { tier: 'low', english: 'Does this dish contain wheat or shellfish?', script: '\u3053\u306e\u6599\u7406\u306b\u5c0f\u9ea6\u3084\u7532\u6bbb\u985e\u306f\u5165\u3063\u3066\u3044\u307e\u3059\u304b\u3002', translit: 'Kono ry\u014dri ni komugi ya k\u014dkakurui wa haitte imasu ka?' },
    { tier: 'ask', english: 'I have celiac disease and a shellfish allergy. Please confirm with the kitchen.', script: '\u30bb\u30ea\u30a2\u30c3\u30af\u75c5\u3068\u7532\u6bbb\u985e\u30a2\u30ec\u30eb\u30ae\u30fc\u304c\u3042\u308a\u307e\u3059\u3002\u53a8\u623f\u306b\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044\u3002', translit: 'Seriakku-by\u014d to k\u014dkakurui arerug\u012b ga arimasu. Ch\u016bb\u014d ni kakunin shite kudasai.' },
    { tier: 'avoid', english: 'Can this be made without soy sauce and without wheat?', script: '\u91a4\u6cb9\u3068\u5c0f\u9ea6\u3092\u4f7f\u308f\u305a\u306b\u4f5c\u308c\u307e\u3059\u304b\u3002', translit: 'Sh\u014dyu to komugi o tsukawazu ni tsukuremasu ka?' },
    { tier: 'emergency', english: 'I could become very ill from wheat. This is a medical emergency.', script: '\u5c0f\u9ea6\u3067\u91cd\u75c7\u306b\u306a\u308b\u53ef\u80fd\u6027\u304c\u3042\u308a\u307e\u3059\u3002\u3053\u308c\u306f\u533b\u7642\u4e0a\u306e\u7dca\u6025\u4e8b\u614b\u3067\u3059\u3002', translit: 'Komugi de j\u016bsh\u014d ni naru kan\u014dsei ga arimasu. Kore wa iry\u014dj\u014d no kinky\u016b jitai desu.' },
    { tier: 'emergency', english: 'I am having an allergic reaction. Call an ambulance.', script: '\u30a2\u30ec\u30eb\u30ae\u30fc\u53cd\u5fdc\u304c\u51fa\u3066\u3044\u307e\u3059\u3002\u6551\u6025\u8eca\u3092\u547c\u3093\u3067\u304f\u3060\u3055\u3044\u3002', translit: 'Arerug\u012b hann\u014d ga dete imasu. Ky\u016bky\u016bsha o yonde kudasai.' },
  ],
  kannada: [
    { tier: 'low', english: 'Does this dish contain egg or fish?', script: '\u0c88 \u0c96\u0cbe\u0ca6\u0ccd\u0caf\u0ca6\u0cb2\u0ccd\u0cb2\u0cbf \u0cae\u0cca\u0c9f\u0ccd\u0c9f\u0cc6 \u0c85\u0ca5\u0cb5\u0cbe \u0cae\u0cc0\u0ca8\u0cc1 \u0c87\u0ca6\u0cc6\u0caf\u0cc7?', translit: '\u012a kh\u0101dyadalli mo\u1e6d\u1e6de athav\u0101 m\u012bnu idey\u0113?' },
    { tier: 'ask', english: 'I have CKD and histamine intolerance. Please confirm ingredients.', script: '\u0ca8\u0ca8\u0c97\u0cc6 \u0cb8\u0cbf\u0c95\u0cc6\u0ca1\u0cbf \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 \u0cb9\u0cbf\u0cb8\u0ccd\u0c9f\u0cae\u0cbf\u0ca8\u0ccd \u0c85\u0cb8\u0cb9\u0cbf\u0cb7\u0ccd\u0ca3\u0cc1\u0ca4\u0cc6 \u0c87\u0ca6\u0cc6. \u0caa\u0ca6\u0cbe\u0cb0\u0ccd\u0ca5\u0c97\u0cb3\u0ca8\u0ccd\u0ca8\u0cc1 \u0ca6\u0cc3\u0ca2\u0cc0\u0c95\u0cb0\u0cbf\u0cb8\u0cbf.', translit: 'Nanage CKD mattu histamine asahi\u1e63\u1e47ute ide. Pad\u0101rthaga\u1e37annu d\u1e5b\u1e0dh\u012bkarisi.' },
    { tier: 'avoid', english: 'Can this be made without fermented batter and without high-potassium ingredients?', script: '\u0cb9\u0cc1\u0ca6\u0cc1\u0c97\u0cbf\u0cb8\u0cbf\u0ca6 \u0cac\u0cc6\u0cb2\u0ccd\u0cb2 \u0cae\u0ca4\u0ccd\u0ca4\u0cc1 \u0cb9\u0cc6\u0c9a\u0ccd\u0c9a\u0cc1 \u0caa\u0cca\u0c9f\u0cbe\u0cb8\u0cbf\u0caf\u0c82 \u0caa\u0ca6\u0cbe\u0cb0\u0ccd\u0ca5\u0c97\u0cb3\u0cbf\u0cb2\u0ccd\u0cb2\u0ca6\u0cc6 \u0c87\u0ca6\u0ca8\u0ccd\u0ca8\u0cc1 \u0cae\u0cbe\u0ca1\u0cac\u0cb9\u0cc1\u0ca6\u0cc7?', translit: 'Hudugisida bella mattu heccu po\u1e6d\u0101siyam pad\u0101rthaga\u1e37illade idannu m\u0101\u1e0dabahud\u0113?' },
    { tier: 'emergency', english: 'My condition could become serious. This is a medical concern.', script: '\u0ca8\u0ca8\u0ccd\u0ca8 \u0c86\u0cb0\u0ccb\u0c97\u0ccd\u0caf \u0cb8\u0ccd\u0ca5\u0cbf\u0ca4\u0cbf \u0c97\u0c82\u0cad\u0cc0\u0cb0\u0cb5\u0cbe\u0c97\u0cac\u0cb9\u0cc1\u0ca6\u0cc1. \u0c87\u0ca6\u0cc1 \u0cb5\u0cc8\u0ca6\u0ccd\u0caf\u0c95\u0cc0\u0caf \u0c95\u0cbe\u0cb3\u0c9c\u0cbf.', translit: 'Nanna \u0101r\u014dgya sthiti gambh\u012brav\u0101gabahudu. Idu vaidyak\u012bya k\u0101\u1e37aji.' },
    { tier: 'emergency', english: 'I am unwell. Please call an ambulance.', script: '\u0ca8\u0ca8\u0c97\u0cc6 \u0c85\u0cb8\u0ccd\u0cb5\u0cb8\u0ccd\u0ca5\u0cb5\u0cbe\u0c97\u0cbf\u0ca6\u0cc6. \u0ca6\u0caf\u0cb5\u0cbf\u0c9f\u0ccd\u0c9f\u0cc1 \u0c86\u0c82\u0cac\u0cc1\u0cb2\u0cc6\u0ca8\u0ccd\u0cb8\u0ccd \u0c95\u0cb0\u0cc6\u0caf\u0cbf\u0cb0\u0cbf.', translit: 'Nanage asvasth\u0101v\u0101gide. Dayavi\u1e6d\u1e6du ambulence kareyiri.' },
  ],
};

const TABS = [
  { id: 'body', numeral: 'i', label: 'Body' }, { id: 'place', numeral: 'ii', label: 'Place' },
  { id: 'food', numeral: 'iii', label: 'Food' }, { id: 'voice', numeral: 'iv', label: 'Voice' },
  { id: 'about', numeral: 'v', label: 'About' },
];

Object.assign(window, { PROFILES, ALLERGENS_FALCPA, ALLERGENS_EXT, CONDITIONS, CROSS_REACT, BRIEFINGS, ASSESSMENTS, PHRASES, TABS });
