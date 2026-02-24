/**
 * Inspect woff2/p1.woff2: which Unicode codepoints it has.
 * qpc-v4.json uses U+F741..U+F765 for Al-Fatiha; we check if the font has those.
 */
const fontkit = require('fontkit');
const path = require('path');

const fontPath = path.join(__dirname, '..', 'woff2', 'p1.woff2');
const font = fontkit.openSync(fontPath);

console.log('Font:', font.fullName || font.postscriptName);
console.log('Character set size:', font.characterSet.length);

// Codepoints qpc-v4.json uses for Al-Fatiha (1:1–1:7)
const qpcV4Codepoints = [
  0xF741, 0xF742, 0xF743, 0xF744, 0xF745, // 1:1
  0xF746, 0xF747, 0xF748, 0xF749, 0xF74A, // 1:2
  0xF74B, 0xF74C, 0xF74D,                   // 1:3
  0xF74E, 0xF74F, 0xF750, 0xF751,          // 1:4
  0xF752, 0xF753, 0xF754, 0xF755, 0xF756, // 1:5
  0xF757, 0xF758, 0xF759, 0xF75A,          // 1:6
  0xF75B, 0xF75C, 0xF75D, 0xF75E, 0xF75F, 0xF760, 0xF761, 0xF762, 0xF763, 0xF764, 0xF765 // 1:7
];

console.log('\n--- qpc-v4.json codepoints (U+F741..U+F765) in this font? ---');
let hasAll = true;
qpcV4Codepoints.forEach((cp, i) => {
  const has = font.hasGlyphForCodePoint(cp);
  if (!has) hasAll = false;
  if (i < 10 || !has) console.log(`  U+${cp.toString(16).toUpperCase().padStart(4,'0')}: ${has ? 'YES' : 'NO'}`);
});
if (hasAll) {
  console.log('  ... (all 33 codepoints: YES)');
} else {
  console.log('\n  => Font does NOT have the codepoints qpc-v4.json uses. Rectangles expected.');
}

// What codepoints does the font actually have?
const cs = font.characterSet;
console.log('\n--- All font codepoints (' + cs.length + ') ---');
const sorted = [...cs].sort((a,b) => a - b);
console.log('  Codepoints:', sorted.map(c => 'U+' + c.toString(16).toUpperCase().padStart(4,'0')).join(', '));

const pua = cs.filter(c => c >= 0xE000 && c <= 0xF8FF);
console.log('\n--- Font PUA codepoints (U+E000..U+F8FF) count:', pua.length, '---');
if (pua.length > 0) {
  const puaSorted = [...pua].sort((a,b) => a - b);
  console.log('  First 20:', puaSorted.slice(0, 20).map(c => 'U+' + c.toString(16).toUpperCase()).join(', '));
  if (puaSorted[0] !== 0xF741) {
    console.log('\n  => Font uses a DIFFERENT PUA range than qpc-v4.json (which uses U+F741+).');
  }
} else {
  console.log('  => This font has NO PUA glyphs. qpc-v4.json requires a font that maps words to U+F741+ (PUA).');
  console.log('  => Your font (QCF4001_COLOR) likely uses standard Unicode Arabic or a different encoding.');
}
