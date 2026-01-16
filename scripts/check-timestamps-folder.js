const fs = require('fs');
const path = require('path');

const folderPath = path.join(process.cwd(), 'public', 'data', 'reciters-wbw-timestamps');

console.log('=== CHECKING RECITERS-WBW-TIMESTAMPS FOLDER ===\n');

// List all files
const files2 = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));
console.log(`Found ${files2.length} JSON files:`);
files2.forEach(f => console.log(`  - ${f}`));

// Check Alafasy file in folder vs root
console.log(`\n=== COMPARING Alafasy FILES ===`);
const folderAlafasy = path.join(folderPath, 'Alafasy_128kbps.json');
const rootAlafasy = path.join(process.cwd(), 'Alafasy_128kbps.json');

if (fs.existsSync(folderAlafasy) && fs.existsSync(rootAlafasy)) {
  const folderData = JSON.parse(fs.readFileSync(folderAlafasy, 'utf-8'));
  const rootData = JSON.parse(fs.readFileSync(rootAlafasy, 'utf-8'));
  
  console.log(`Folder file entries: ${folderData.length}`);
  console.log(`Root file entries: ${rootData.length}`);
  console.log(`Same: ${folderData.length === rootData.length ? 'YES ✓' : 'NO ✗'}`);
  
  // Compare first entry
  const folderFirst = folderData.find(e => e.surah === 1 && e.ayah === 1);
  const rootFirst = rootData.find(e => e.surah === 1 && e.ayah === 1);
  
  if (folderFirst && rootFirst) {
    console.log(`\nSurah 1, Ayah 1:`);
    console.log(`  Folder segments: ${folderFirst.segments.length}`);
    console.log(`  Root segments: ${rootFirst.segments.length}`);
    const identical = JSON.stringify(folderFirst.segments) === JSON.stringify(rootFirst.segments);
    console.log(`  Segments identical: ${identical ? 'YES ✓' : 'NO ✗'}`);
    
    if (!identical) {
      console.log(`  Folder first segment: ${JSON.stringify(folderFirst.segments[0])}`);
      console.log(`  Root first segment: ${JSON.stringify(rootFirst.segments[0])}`);
    }
  }
} else {
  console.log(`Root file exists: ${fs.existsSync(rootAlafasy)}`);
  console.log(`Folder file exists: ${fs.existsSync(folderAlafasy)}`);
}

// Check structure of a different reciter
console.log(`\n=== CHECKING DIFFERENT RECITER ===`);
const otherFile = files2.find(f => f !== 'Alafasy_128kbps.json');
if (otherFile) {
  const otherPath = path.join(folderPath, otherFile);
  const otherData = JSON.parse(fs.readFileSync(otherPath, 'utf-8'));
  
  console.log(`File: ${otherFile}`);
  console.log(`Entries: ${otherData.length}`);
  
  const otherFirst = otherData.find(e => e.surah === 1 && e.ayah === 1);
  if (otherFirst) {
    console.log(`Surah 1, Ayah 1 segments: ${otherFirst.segments.length}`);
    console.log(`First segment: ${JSON.stringify(otherFirst.segments[0])}`);
  }
}
