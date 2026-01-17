const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// New data for surah 4 verse 148
const newTransliteration = '۞ Ло юҳиббуллоҳу-л-ҷаҳра би-с-суи мина-л-қавли илло ман зулим. Ва коналлоҳу Самиъан Ъалимо.';
const newTranslation = 'Худованд ошкор (баланд) гуфтани сухани бадро дӯст намедорад, магар касе ки бар вай ситам шудааст. Ва Аллоҳ шунавову доно аст.';
const newTafsir = 'Ояти мазкур дар бораи яке аз дастурҳои ахлоқии исломӣ хабар дода, фармудааст, ки Аллоҳтаъоло суханҳои бадро, мисли бонг задан, суханҳои фаҳш гуфтан, дашном додан, бадгӯӣ ва ошкор кардани айбу амалҳои зишти касе ё пардаи сирри касеро дарондан ва резондани обрӯи касеро дӯст намедорад. Касоне, ки ба чунин корҳо даст мезананд, маълум аст, ки дар дили онҳо тақво ва виҷдон нест. Аз ин рӯ гуфтану ошкор сохтани суханҳои бад барои онҳо осон аст. Зарари ошкор сохтани суханҳои бад, мисли балоест, ки болои аҳли ҷомеа мерезад. Дар натиҷа мардум ҳамдигарро ғайбату бӯҳтон мекунанд, гӯё ҳамдигарро аз гиребон мегиранду то ин ки ҳалок шавад, лаби ҷар оварда тела медиҳанд. \nБинобар ин, дар ҷомеаи исломӣ қатъиян ошкор сохтани суханҳои баду фитнаовар ба истиснои як тоифа манъ карда шудааст. Яъне шахси мазлум барои дифои худ метавонад ва ҳақ дорад барои ифшои зулми золим дар назди сардор иқдом ба шикоят кунад ва то ҳаққи худро нагирад ва ситами ӯро аз худ дур насозад, метавонад золимро ошкоро мазаммат намояд. Зеро шахси золим сазовори ҳимояи исломӣ нест. Дар охири ояти мазкур барои ин ки дигарон аз ин гуна истисно сӯистифода накунанд ва ба ҳар баҳона, гӯё мазлум шудаанд, айбҳои мардумро ошкор насозанд, фармудааст, ки Худованд суханонро мешунавад ва аз ниятҳои чунин шахсон огоҳ аст. Яъне доду фарёди мазлумро мешунавад ва зулми золимро медонад. Муҷоҳид (р) дар бораи сухани бадро ошкоро кардан гуфтааст: Шахсе ба меҳмонӣ равад, мизбон ӯро зиёфати хубе накунад, ӯ аз он ҷо баромада, фалончӣ ҳурмати маро ба ҷой наовард, зиёфати нағз накард, гӯён назди дигарон сухан кунад, ӯ сухани бадеро ошкор кардааст. \nАбӯ Довуд аз Абӯҳурайра (р) ривоят кардааст, ки Расулуллоҳ (с) фармуданд: "Ду шахсе ҳамдигарро дашном диҳанд, гуноҳ бар зарари ибтидокунанда аст, ба шарте мазлум аз ӯ нагузаронад." \nДар бораи ҳурмати меҳмон ҳадисҳо бисёранд. Имом Аҳмад ва ғайри ӯ ҳурмати меҳмонро ба қадри тоқат воҷиб гуфтаанд. Агар ба меҳмон ҳеҷ илтифоте нашавад, меҳмон дар гуруснагӣ, ташнагӣ, шабро дар сармо рӯз кунад, ӯ мазлум шудааст. Ҳақ дорад ин амалро ошкор созад, то мизбон ки худро мусалмон меҳисобад, огоҳ шавад ва дигар ин суннати падари миллати мо Иброҳим (а)-ро, ки воҷиб аст, тарк накунад. \nМусалмонон дар ҳама даврҳо ба таълимоти мазкур амал намудаанд ва дар байни халқҳои рӯи Замин мақоми ахлоқии олиро соҳиб шудаанд.';

const surahNumber = 4;
const verseNumber = 148;

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

const verse148 = surah.ayahs?.find(a => a.number === verseNumber);
if (!verse148) {
  console.error(`Verse ${verseNumber} not found in surah ${surahNumber}`);
  process.exit(1);
}

// Update transliteration and tafsir, but keep existing translation unchanged
console.log(`Updating verse ${verseNumber}...`);
console.log(`Old transliteration: ${verse148.transliteration || '(empty)'}`);
verse148.transliteration = newTransliteration;
console.log(`New transliteration: ${verse148.transliteration}`);

// Keep existing translation (tajik_text) as is - do not update
console.log(`Translation (kept as is): ${verse148.tajik_text || '(empty)'}`);

console.log(`Updating tafsir...`);
verse148.tafsir = newTafsir;

// Compress and save
const updatedTranslationsJson = JSON.stringify(translationsJson);
const compressedTranslations = zlib.gzipSync(updatedTranslationsJson);
fs.writeFileSync(translationsPath, compressedTranslations);
console.log('✓ Updated quran_mirror_with_translations.json.gz');

// Update quran_tj_2_AbuAlomuddin.json.gz
console.log('\nUpdating quran_tj_2_AbuAlomuddin.json.gz...');
const tj2Path = path.join(__dirname, '..', 'public', 'data', 'quran_tj_2_AbuAlomuddin.json.gz');
const tj2Data = zlib.gunzipSync(fs.readFileSync(tj2Path));
const tj2Json = JSON.parse(tj2Data.toString());

const surahKey = surahNumber.toString();
if (!tj2Json[surahKey]) {
  tj2Json[surahKey] = [];
}

let verse148Tj2 = tj2Json[surahKey].find(v => v.verse === verseNumber);
if (!verse148Tj2) {
  // Add new verse
  console.log(`Verse ${verseNumber} not found in tj2, adding it...`);
  verse148Tj2 = {
    verse: verseNumber,
    text: newTranslation
  };
  tj2Json[surahKey].push(verse148Tj2);
  // Sort by verse number
  tj2Json[surahKey].sort((a, b) => a.verse - b.verse);
} else {
  // Update existing verse
  console.log(`Updating existing verse ${verseNumber} in tj2...`);
  console.log(`Old translation: ${verse148Tj2.text || '(empty)'}`);
  verse148Tj2.text = newTranslation;
  console.log(`New translation: ${verse148Tj2.text}`);
}

// Compress and save
const updatedTj2Json = JSON.stringify(tj2Json);
const compressedTj2 = zlib.gzipSync(updatedTj2Json);
fs.writeFileSync(tj2Path, compressedTj2);
console.log('✓ Updated quran_tj_2_AbuAlomuddin.json.gz');

console.log('\n✓ All updates completed successfully!');
