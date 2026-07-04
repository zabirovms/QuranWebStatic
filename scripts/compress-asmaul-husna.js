const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const sourcePath = 'C:\\Users\\Anas\\AndroidStudioProjects\\QuranApp_replit\\assets\\data\\misc\\asmaul_husna.json';
const destDir = path.join(__dirname, '..', 'public', 'data');
const destPath = path.join(destDir, '99_Names_Of_Allah_detailed.json.gz');

// Simple Cyrillic-to-Latin mapping for clean slugs
function generateSlug(tajikName) {
  const mapping = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya', 'ғ': 'gh', 'ӣ': 'i', 'қ': 'q', 'ӯ': 'u', 'ҳ': 'h', 'ҷ': 'j'
  };
  
  let slug = tajikName.toLowerCase();
  // Map Cyrillic characters
  slug = slug.split('').map(char => mapping[char] !== undefined ? mapping[char] : char).join('');
  // Replace non-alphanumeric with dashes
  slug = slug.replace(/[^a-z0-9]+/g, '-');
  // Trim leading/trailing dashes
  slug = slug.replace(/^-+|-+$/g, '');
  return slug;
}

// Generate short meaning from description
function extractShortMeaning(description) {
  // Try splitting by long dash, short dash, or "ба маънои"
  let parts = description.split(/ – | - | ба маънои /);
  if (parts.length > 1) {
    let clean = parts[1].split('.')[0].trim();
    // Capitalize first letter
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  // Fallback to first sentence
  return description.split(/[.!\n]/)[0].trim();
}

try {
  console.log('Reading source JSON from:', sourcePath);
  const jsonContent = fs.readFileSync(sourcePath, 'utf8');
  const rawData = JSON.parse(jsonContent);
  console.log('✓ Source JSON parsed successfully.');
  
  const names = rawData.names.map((n, idx) => {
    const slug = generateSlug(n.name);
    const shortMeaning = extractShortMeaning(n.description);
    return {
      ...n,
      slug,
      shortMeaning
    };
  });
  
  const outputData = {
    intro: rawData.intro,
    names: names
  };
  
  console.log('Compressing JSON with gzip...');
  const outputBuffer = zlib.gzipSync(Buffer.from(JSON.stringify(outputData), 'utf8'));
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log('Created destination directory:', destDir);
  }
  
  fs.writeFileSync(destPath, outputBuffer);
  console.log(`✓ Successfully compiled Asmaul Husna to: ${destPath}`);
  console.log(`  Processed ${names.length} names with unique URL slugs.`);
  console.log(`  Size: ${(outputBuffer.length / 1024).toFixed(2)} KB (original was ${(jsonContent.length / 1024).toFixed(2)} KB)`);
} catch (error) {
  console.error('Failed to compress Asmaul Husna JSON:', error);
  process.exit(1);
}
