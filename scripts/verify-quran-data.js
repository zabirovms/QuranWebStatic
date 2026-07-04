const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const dataDir = path.join(__dirname, '..', 'public', 'data');

const translationFiles = [
  'quran_tj_ayati.json.gz',
  'quran_transliteration.json.gz',
  'quran_tafsir_osonbayon.json.gz'
];

const secondaryFiles = [
  'quran_tj_alomuddin.json.gz',
  'quran_tj_pioneers.json.gz',
  'quran_fa_translation.json.gz',
  'quran_ru_kuliev.json.gz'
];

try {
  console.log('--- Phase 4 Verification Script ---');
  let errorCount = 0;

  // 1. Verify metadata file
  const metaPath = path.join(dataDir, 'quran_metadata.json.gz');
  if (!fs.existsSync(metaPath)) {
    console.error('✕ File not found: quran_metadata.json.gz');
    errorCount++;
  } else {
    try {
      const buffer = fs.readFileSync(metaPath);
      const decompressed = zlib.gunzipSync(buffer).toString('utf8');
      const data = JSON.parse(decompressed);
      const surahs = data?.data?.surahs || [];
      
      console.log(`✓ Parse OK: quran_metadata.json.gz (contains ${surahs.length} surahs)`);
      
      if (surahs.length !== 114) {
        console.error(`✕ Expected exactly 114 surahs, found ${surahs.length}`);
        errorCount++;
      } else {
        // Sample validation
        const fatiha = surahs[0];
        if (fatiha.number !== 1 || fatiha.name_tajik !== 'Фотиҳа') {
          console.error(`✕ Surah 1 metadata mismatch:`, fatiha);
          errorCount++;
        }
        if (!fatiha.description || fatiha.description.length < 20) {
          console.error(`✕ Surah 1 has missing or too short description`);
          errorCount++;
        }
        console.log(`✓ Metadata validation passed (description present).`);
      }
    } catch (err) {
      console.error('✕ Decompression/parsing failed for quran_metadata.json.gz:', err.message);
      errorCount++;
    }
  }

  // 2. Verify split translation files
  translationFiles.forEach((file) => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`✕ File not found: ${file}`);
      errorCount++;
      return;
    }
    
    try {
      const buffer = fs.readFileSync(filePath);
      const decompressed = zlib.gunzipSync(buffer).toString('utf8');
      const data = JSON.parse(decompressed);
      const surahs = data?.data?.surahs || [];
      
      console.log(`✓ Parse OK: ${file} (contains ${surahs.length} surahs)`);
      if (surahs.length !== 114) {
        console.error(`✕ Expected 114 surahs in ${file}, found ${surahs.length}`);
        errorCount++;
      }
    } catch (err) {
      console.error(`✕ Decompression/parsing failed for ${file}:`, err.message);
      errorCount++;
    }
  });

  // 3. Verify secondary translations
  secondaryFiles.forEach((file) => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`✕ File not found: ${file}`);
      errorCount++;
      return;
    }
    
    try {
      const buffer = fs.readFileSync(filePath);
      const decompressed = zlib.gunzipSync(buffer).toString('utf8');
      const data = JSON.parse(decompressed);
      const keys = Object.keys(data);
      
      console.log(`✓ Parse OK: ${file} (contains ${keys.length} surahs entries)`);
      if (keys.length !== 114) {
        console.error(`✕ Expected 114 surah keys in ${file}, found ${keys.length}`);
        errorCount++;
      }
      
      // Check structure of first surah
      const s1 = data['1'] || [];
      if (s1.length === 0 || !s1[0].hasOwnProperty('verse') || !s1[0].hasOwnProperty('text')) {
        console.error(`✕ Invalid VerseDataByKey structure in ${file}:`, s1[0]);
        errorCount++;
      }
    } catch (err) {
      console.error(`✕ Decompression/parsing failed for ${file}:`, err.message);
      errorCount++;
    }
  });

  console.log('\n====================================');
  if (errorCount === 0) {
    console.log('🎉 Phase 4 Verification: ALL PASSED!');
  } else {
    console.log('✕ Phase 4 Verification: FAILED.');
    process.exit(1);
  }
} catch (error) {
  console.error('✕ Verification execution failed:', error.message);
  process.exit(1);
}
