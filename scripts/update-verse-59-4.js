const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// New transliteration for surah 59 verse 4
const newTransliteration = 'Залика би аннаҳум шаққуллоҳа ва расулаҳ. Ва ма-н юшаққиллоҳа фа инналлоҳа шадӣду-л-ъиқоб.';

const surahNumber = 59;
const verseNumber = 4;

// Update quran_mirror_with_translations.json.gz
console.log('Updating transliteration for surah 59 verse 4...');
const translationsPath = path.join(__dirname, '..', 'public', 'data', 'quran_mirror_with_translations.json.gz');
const translationsData = zlib.gunzipSync(fs.readFileSync(translationsPath));
const translationsJson = JSON.parse(translationsData.toString());

const surah = translationsJson.data?.surahs?.find(s => s.number === surahNumber);
if (!surah) {
  console.error(`Surah ${surahNumber} not found in translations file`);
  process.exit(1);
}

const verse4 = surah.ayahs?.find(a => a.number === verseNumber);
if (!verse4) {
  console.error(`Verse ${verseNumber} not found in surah ${surahNumber}`);
  process.exit(1);
}

// Update only transliteration, keep everything else unchanged
console.log(`Updating transliteration for verse ${verseNumber}...`);
console.log(`Old transliteration: ${verse4.transliteration || '(empty)'}`);
verse4.transliteration = newTransliteration;
console.log(`New transliteration: ${verse4.transliteration}`);

// Compress and save
const updatedTranslationsJson = JSON.stringify(translationsJson);
const compressedTranslations = zlib.gzipSync(updatedTranslationsJson);
fs.writeFileSync(translationsPath, compressedTranslations);
console.log('✓ Updated quran_mirror_with_translations.json.gz');

console.log('\n✓ Update completed successfully!');
