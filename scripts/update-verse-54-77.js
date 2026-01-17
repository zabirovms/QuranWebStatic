const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// New data for surah 54 verse 77
const newTransliteration = 'Иннаҳу ла Қур-анун Карӣм.';
const newTranslation = 'Батаҳқиқ, ин Қуръон боиззат (олиқадр) аст.';
const newTafsir = 'Ин оят ҷавоби қасам аст. Валлоҳу аълам Парвардигор ба мушрикони ёвабоф посух гардонидааст, ки ин Қуръон сеҳр нест, аз назди фолбинҳо наомадааст ва сухани бофта ҳам нест, балки Қуръони кариму маҷид дар Лавҳулмаҳфуз мастуру аз табдилу таҳрифи душманҳо маҳфуз аст. Қуръоне, ки Муҳаммад (с) ба шумо овардааст, сухани Худованди муттаъол буда, онро муъҷизаи Пайғамбари Худ гардонид ва дар он хайру баракат ва манфиати зиёде маҳфуз гузоштааст ва он…';

const surahNumber = 56;
const verseNumber = 77;

// Update quran_mirror_with_translations.json.gz
console.log('Updating quran_mirror_with_translations.json.gz...');
const translationsPath = path.join(__dirname, '..', 'public', 'data', 'quran_mirror_with_translations.json.gz');
const translationsData = zlib.gunzipSync(fs.readFileSync(translationsPath));
const translationsJson = JSON.parse(translationsData.toString());

const surah = translationsJson.data?.surahs?.find(s => s.number === surahNumber);
if (!surah) {
  console.error(`Surah ${surahNumber} not found in translations file`);
  process.exit(1);
}

let verse77 = surah.ayahs?.find(a => a.number === verseNumber);
if (!verse77) {
  // Add new verse
  console.log(`Verse ${verseNumber} not found, adding it...`);
  // If verse doesn't exist, we still need to add it, but we'll use existing translation if available
  // For new verses, we'll use the new translation, but for existing ones we keep the old one
  verse77 = {
    number: verseNumber,
    transliteration: newTransliteration,
    tajik_text: '', // Will be set from existing if available
    tafsir: newTafsir
  };
  surah.ayahs.push(verse77);
  // Sort by verse number
  surah.ayahs.sort((a, b) => a.number - b.number);
} else {
  // Update existing verse
  console.log(`Updating existing verse ${verseNumber}...`);
  verse77.transliteration = newTransliteration;
  verse77.tafsir = newTafsir;
  // Keep existing tajik_text (translation) as is - do not update
}

// Compress and save
const updatedTranslationsJson = JSON.stringify(translationsJson);
const compressedTranslations = zlib.gzipSync(updatedTranslationsJson);
fs.writeFileSync(translationsPath, compressedTranslations);
console.log('✓ Updated quran_mirror_with_translations.json.gz');

// Update quran_tj_2_AbuAlomuddin.json.gz
console.log('Updating quran_tj_2_AbuAlomuddin.json.gz...');
const tj2Path = path.join(__dirname, '..', 'public', 'data', 'quran_tj_2_AbuAlomuddin.json.gz');
const tj2Data = zlib.gunzipSync(fs.readFileSync(tj2Path));
const tj2Json = JSON.parse(tj2Data.toString());

const surahKey = surahNumber.toString();
if (!tj2Json[surahKey]) {
  tj2Json[surahKey] = [];
}

let verse77Tj2 = tj2Json[surahKey].find(v => v.verse === verseNumber);
if (!verse77Tj2) {
  // Add new verse
  console.log(`Verse ${verseNumber} not found in tj2, adding it...`);
  verse77Tj2 = {
    verse: verseNumber,
    text: newTranslation
  };
  tj2Json[surahKey].push(verse77Tj2);
  // Sort by verse number
  tj2Json[surahKey].sort((a, b) => a.verse - b.verse);
} else {
  // Update existing verse
  console.log(`Updating existing verse ${verseNumber} in tj2...`);
  verse77Tj2.text = newTranslation;
}

// Compress and save
const updatedTj2Json = JSON.stringify(tj2Json);
const compressedTj2 = zlib.gzipSync(updatedTj2Json);
fs.writeFileSync(tj2Path, compressedTj2);
console.log('✓ Updated quran_tj_2_AbuAlomuddin.json.gz');

console.log('\n✓ All updates completed successfully!');
