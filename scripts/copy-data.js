const fs = require('fs');
const path = require('path');

// Destination directory (Next.js public)
const destDir = path.join(__dirname, '..', 'public', 'data');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// List of required data files
const requiredFiles = [
  'quran_metadata.json.gz',
  'quran_tj_ayati.json.gz',
  'quran_transliteration.json.gz',
  'quran_tafsir_osonbayon.json.gz',
  'quran_tj_alomuddin.json.gz',
  'quran_tj_pioneers.json.gz',
  'quran_fa_translation.json.gz',
  'quran_ru_kuliev.json.gz',
  'quranic_duas.json.gz',
  'tasbeehs.json.gz',
  'Prophets.json.gz',
  'prophets_duas.json.gz',
  'most_quoted_verses.json.gz',
  '99_Names_Of_Allah_detailed.json.gz',
  'full_surah_reciters.json.gz',
  'verse_by_verse_reciters.json.gz',
  'word_counts.json.gz',
  '85quranic-words.json',
];

console.log('Checking for required data files in public/data/...\n');

let missingCount = 0;
requiredFiles.forEach((file) => {
  const filePath = path.join(destDir, file);
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✓ Found ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.warn(`⚠ Missing: ${file}`);
    missingCount++;
  }
});

console.log('\n' + '='.repeat(50));
if (missingCount === 0) {
  console.log('✓ All required data files are present!');
} else {
  console.log(`⚠ Warning: ${missingCount} file(s) are missing.`);
  console.log('Please add the missing files to public/data/');
}

