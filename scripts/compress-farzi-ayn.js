const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const sourcePath = 'C:\\Users\\Anas\\AndroidStudioProjects\\QuranApp_replit\\assets\\data\\misc\\farzi-ayn.json';
const destDir = path.join(__dirname, '..', 'public', 'data');
const destPath = path.join(destDir, 'farzi-ayn.json.gz');

try {
  console.log('Reading source JSON from:', sourcePath);
  const jsonContent = fs.readFileSync(sourcePath, 'utf8');
  
  // Validate JSON syntax
  const sections = JSON.parse(jsonContent);
  console.log('✓ Source JSON syntax validated successfully.');
  
  // Resolve duplicate IDs to prevent Next.js static generation collisions
  const seenIds = new Set();
  const normalizedSections = sections.map((section, idx) => {
    let id = section.id || `section-${idx}`;
    if (seenIds.has(id)) {
      const oldId = id;
      id = `${id}-2`;
      console.log(`⚠ Duplicate ID resolved: renamed section at index ${idx} from "${oldId}" to "${id}"`);
    }
    seenIds.add(id);
    return { ...section, id };
  });

  const normalizedContent = JSON.stringify(normalizedSections);
  
  console.log('Compressing JSON with gzip...');
  const gzipBuffer = zlib.gzipSync(Buffer.from(normalizedContent, 'utf8'));
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log('Created destination directory:', destDir);
  }
  
  fs.writeFileSync(destPath, gzipBuffer);
  console.log(`✓ Successfully compressed Farzi Ayn JSON to: ${destPath}`);
  console.log(`  Size: ${(gzipBuffer.length / 1024).toFixed(2)} KB (original was ${(jsonContent.length / 1024).toFixed(2)} KB)`);
} catch (error) {
  console.error('Failed to compress Farzi Ayn JSON:', error);
  process.exit(1);
}
