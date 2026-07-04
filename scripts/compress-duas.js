const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const sourceDir = 'C:\\Users\\Anas\\AndroidStudioProjects\\QuranApp_replit\\assets\\data\\duas\\categories';
const destDir = path.join(__dirname, '..', 'public', 'data', 'duas');

const categoryFiles = [
  'etiquette-of-supplication.json',
  'praise-and-glorification.json',
  'duas-in-prayer.json',
  'seeking-refuge.json',
  'morning-adhkar.json',
  'evening-adhkar.json',
  'ruqya-healing.json'
];

try {
  console.log('Starting Duas categories compression...');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log('Created destination directory:', destDir);
  }

  categoryFiles.forEach(file => {
    const srcPath = path.join(sourceDir, file);
    const destFile = file.replace('.json', '.json.gz');
    const destPath = path.join(destDir, destFile);

    if (fs.existsSync(srcPath)) {
      const content = fs.readFileSync(srcPath, 'utf8');
      // Validate JSON syntax
      JSON.parse(content);
      const compressed = zlib.gzipSync(Buffer.from(content, 'utf8'));
      fs.writeFileSync(destPath, compressed);
      console.log(`✓ Compressed: ${file} -> ${destFile} (${(compressed.length / 1024).toFixed(2)} KB)`);
    } else {
      console.warn(`⚠ Source file not found: ${srcPath}`);
    }
  });
  console.log('✓ Duas compression complete.');
} catch (error) {
  console.error('Failed to compress Duas:', error);
  process.exit(1);
}
