const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'Alafasy_128kbps.json');

console.log('Reading alignment file...');
const content = fs.readFileSync(filePath, 'utf-8');
const data = JSON.parse(content);

console.log('\n=== FILE STRUCTURE ANALYSIS ===\n');
console.log(`Total entries: ${data.length}`);

if (data.length > 0) {
  // Check structure
  const first = data[0];
  console.log('\n=== STRUCTURE ===');
  console.log('Keys:', Object.keys(first));
  console.log('First entry sample:', JSON.stringify(first, null, 2).substring(0, 300));
  
  // Check surah 1 coverage
  const surah1 = data.filter(entry => entry.surah === 1);
  console.log(`\n=== SURAH 1 ===`);
  console.log(`Entries: ${surah1.length}`);
  const ayahs = surah1.map(e => e.ayah).sort((a, b) => a - b);
  console.log(`Ayahs present: ${ayahs.join(', ')}`);
  console.log(`Missing ayahs: ${[1,2,3,4,5,6,7].filter(a => !ayahs.includes(a)).join(', ') || 'none'}`);
  
  // Check surah 2 coverage
  const surah2 = data.filter(entry => entry.surah === 2);
  console.log(`\n=== SURAH 2 ===`);
  console.log(`Entries: ${surah2.length}`);
  const ayahs2 = surah2.map(e => e.ayah).sort((a, b) => a - b);
  console.log(`First 10 ayahs: ${ayahs2.slice(0, 10).join(', ')}`);
  console.log(`Last 10 ayahs: ${ayahs2.slice(-10).join(', ')}`);
  console.log(`Missing first few: ${[1,2,3,4,5].filter(a => !ayahs2.includes(a)).join(', ') || 'none'}`);
  
  // Analyze segment structure
  const ayah1 = surah1.find(e => e.ayah === 1);
  if (ayah1) {
    console.log(`\n=== SEGMENT ANALYSIS (Surah 1, Ayah 1) ===`);
    console.log(`Total segments: ${ayah1.segments.length}`);
    ayah1.segments.forEach((seg, i) => {
      console.log(`  Segment ${i}: [word_start=${seg[0]}, word_end=${seg[1]}, start_ms=${seg[2]}, end_ms=${seg[3]}]`);
    });
    console.log(`\nInterpretation:`);
    console.log(`  - Word indices are 0-based`);
    console.log(`  - word_end is exclusive (word_end_index is AFTER last word)`);
    console.log(`  - So segment [0, 1, 60, 610] means word 0 plays from 60ms to 610ms`);
    console.log(`  - Segment [1, 2, 620, 1310] means word 1 plays from 620ms to 1310ms`);
  }
  
  // Check if data covers all verses or just some
  console.log(`\n=== COVERAGE CHECK ===`);
  const surahs = [...new Set(data.map(e => e.surah))].sort((a, b) => a - b);
  console.log(`Surahs present: ${surahs.length} (${surahs.slice(0, 10).join(', ')}...)`);
  
  // Check a specific surah for completeness
  const testSurah = 2;
  const testSurahEntries = data.filter(e => e.surah === testSurah);
  const testAyahs = testSurahEntries.map(e => e.ayah).sort((a, b) => a - b);
  console.log(`\nSurah ${testSurah} has ${testSurahEntries.length} entries`);
  console.log(`Expected 286 verses, got entries for: ${testAyahs.length} unique ayahs`);
  console.log(`First ayah: ${testAyahs[0]}, Last ayah: ${testAyahs[testAyahs.length - 1]}`);
  console.log(`Missing ayahs (first 20): ${[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].filter(a => !testAyahs.includes(a)).join(', ') || 'none'}`);
  
  // Check timing continuity
  console.log(`\n=== TIMING CHECK (Surah 1, Ayah 1) ===`);
  if (ayah1 && ayah1.segments.length > 1) {
    const gaps = [];
    for (let i = 0; i < ayah1.segments.length - 1; i++) {
      const currentEnd = ayah1.segments[i][3];
      const nextStart = ayah1.segments[i + 1][2];
      const gap = nextStart - currentEnd;
      gaps.push(gap);
    }
    console.log(`Gaps between segments: ${gaps.join('ms, ')}ms`);
    console.log(`Average gap: ${Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)}ms`);
  }
}
