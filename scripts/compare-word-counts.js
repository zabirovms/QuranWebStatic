const fs = require('fs');
const path = require('path');

// Load alignment data
const alignmentPath = path.join(process.cwd(), 'Alafasy_128kbps.json');
const alignmentData = JSON.parse(fs.readFileSync(alignmentPath, 'utf-8'));

// Load word-by-word data
const wordDataPath = path.join(process.cwd(), 'public', 'data', 'qpc-hafs-word-by-word.json');
const wordData = JSON.parse(fs.readFileSync(wordDataPath, 'utf-8'));

console.log('=== COMPARING WORD COUNTS ===\n');

// Check surah 1, ayah 1
const surah1Ayah1 = 1;
const alignmentEntry = alignmentData.find(e => e.surah === 1 && e.ayah === 1);

if (alignmentEntry) {
  console.log(`Surah ${surah1Ayah1}, Ayah ${surah1Ayah1}:`);
  console.log(`  Alignment segments: ${alignmentEntry.segments.length}`);
  console.log(`  Last segment word_end: ${alignmentEntry.segments[alignmentEntry.segments.length - 1][1]}`);
  console.log(`  Total words (from alignment): ${alignmentEntry.segments[alignmentEntry.segments.length - 1][1]}`);
  
  // Get words from word-by-word data
  const wordPrefix = `1:1:`;
  const words = [];
  for (const key in wordData) {
    if (key.startsWith(wordPrefix)) {
      words.push(wordData[key]);
    }
  }
  words.sort((a, b) => parseInt(a.word) - parseInt(b.word));
  
  // Filter out verse number markers
  const actualWords = words.filter(w => {
    const text = w.text.trim();
    const isVerseNumber = /^[\u0660-\u0669]+$/.test(text);
    return !isVerseNumber;
  });
  
  console.log(`  Words from qpc-hafs: ${actualWords.length}`);
  console.log(`  Word numbers: ${actualWords.map(w => w.word).join(', ')}`);
  console.log(`  Match: ${alignmentEntry.segments.length === actualWords.length ? 'YES ✓' : 'NO ✗'}`);
  
  // Show first few words
  console.log(`\n  First 3 words from qpc-hafs:`);
  actualWords.slice(0, 3).forEach((w, i) => {
    console.log(`    Word ${w.word} (index ${i}): "${w.text}"`);
  });
  
  console.log(`\n  First 3 alignment segments:`);
  alignmentEntry.segments.slice(0, 3).forEach((seg, i) => {
    console.log(`    Segment ${i}: words [${seg[0]}-${seg[1]}) at ${seg[2]}-${seg[3]}ms`);
  });
}

// Check surah 2, ayah 1
console.log(`\n=== SURAH 2, AYAH 1 ===`);
const alignmentEntry2 = alignmentData.find(e => e.surah === 2 && e.ayah === 1);
if (alignmentEntry2) {
  const wordPrefix2 = `2:1:`;
  const words2 = [];
  for (const key in wordData) {
    if (key.startsWith(wordPrefix2)) {
      words2.push(wordData[key]);
    }
  }
  words2.sort((a, b) => parseInt(a.word) - parseInt(b.word));
  const actualWords2 = words2.filter(w => {
    const text = w.text.trim();
    const isVerseNumber = /^[\u0660-\u0669]+$/.test(text);
    return !isVerseNumber;
  });
  
  console.log(`  Alignment segments: ${alignmentEntry2.segments.length}`);
  console.log(`  Words from qpc-hafs: ${actualWords2.length}`);
  console.log(`  Match: ${alignmentEntry2.segments.length === actualWords2.length ? 'YES ✓' : 'NO ✗'}`);
}

// Check surah 2, ayah 2
console.log(`\n=== SURAH 2, AYAH 2 ===`);
const alignmentEntry3 = alignmentData.find(e => e.surah === 2 && e.ayah === 2);
if (alignmentEntry3) {
  const wordPrefix3 = `2:2:`;
  const words3 = [];
  for (const key in wordData) {
    if (key.startsWith(wordPrefix3)) {
      words3.push(wordData[key]);
    }
  }
  words3.sort((a, b) => parseInt(a.word) - parseInt(b.word));
  const actualWords3 = words3.filter(w => {
    const text = w.text.trim();
    const isVerseNumber = /^[\u0660-\u0669]+$/.test(text);
    return !isVerseNumber;
  });
  
  console.log(`  Alignment segments: ${alignmentEntry3.segments.length}`);
  console.log(`  Words from qpc-hafs: ${actualWords3.length}`);
  console.log(`  Match: ${alignmentEntry3.segments.length === actualWords3.length ? 'YES ✓' : 'NO ✗'}`);
  
  if (alignmentEntry3.segments.length !== actualWords3.length) {
    console.log(`  Difference: ${Math.abs(alignmentEntry3.segments.length - actualWords3.length)} words`);
  }
}
