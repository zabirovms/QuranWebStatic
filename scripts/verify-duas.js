const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const dataDir = path.join(__dirname, '..', 'public', 'data', 'duas');
const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

const categoryFiles = [
  'etiquette-of-supplication.json.gz',
  'praise-and-glorification.json.gz',
  'duas-in-prayer.json.gz',
  'seeking-refuge.json.gz',
  'morning-adhkar.json.gz',
  'evening-adhkar.json.gz',
  'ruqya-healing.json.gz'
];

try {
  console.log('--- Phase 3 Verification Script ---');
  let errorCount = 0;

  // 1. Check data directory & files
  if (!fs.existsSync(dataDir)) {
    throw new Error(`Data directory not found at: ${dataDir}`);
  }
  console.log('✓ Duas compressed data directory exists.');

  categoryFiles.forEach((file) => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`✕ File not found: ${file}`);
      errorCount++;
      return;
    }
    
    // Parse check
    try {
      const buffer = fs.readFileSync(filePath);
      const decompressed = zlib.gunzipSync(buffer).toString('utf8');
      const data = JSON.parse(decompressed);
      
      console.log(`✓ Parse OK: ${file} (contains ${data.duas?.length || 0} items)`);
      
      if (!data.category_name_tajik) {
        console.error(`✕ File "${file}" is missing category_name_tajik`);
        errorCount++;
      }
      if (!Array.isArray(data.duas) || data.duas.length === 0) {
        console.error(`✕ File "${file}" has missing or empty duas array`);
        errorCount++;
      }
    } catch (err) {
      console.error(`✕ Decompression/parsing failed for ${file}:`, err.message);
      errorCount++;
    }
  });

  // 2. Check sitemap.xml registration
  if (!fs.existsSync(sitemapPath)) {
    throw new Error(`Sitemap not found at: ${sitemapPath}`);
  }
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

  // Verify main route
  if (!sitemapContent.includes('<loc>https://www.quran.tj/duas</loc>')) {
    console.error('✕ Sitemap is missing the main "/duas" route.');
    errorCount++;
  } else {
    console.log('✓ Main "/duas" route is present in sitemap.');
  }

  // Verify dynamic subpage routes
  let missingSlugs = 0;
  categoryFiles.forEach((file) => {
    const slug = file.replace('.json.gz', '');
    const expectedUrl = `<loc>https://www.quran.tj/duas/${slug}</loc>`;
    if (!sitemapContent.includes(expectedUrl)) {
      console.error(`✕ Sitemap is missing dynamic category route: ${expectedUrl}`);
      missingSlugs++;
      errorCount++;
    }
  });

  if (missingSlugs === 0) {
    console.log('✓ All 7 dynamic daily Adhkar category routes are registered in sitemap.xml.');
  }

  console.log('\n====================================');
  if (errorCount === 0) {
    console.log('🎉 Phase 3 Verification: ALL PASSED!');
  } else {
    console.log('✕ Phase 3 Verification: FAILED.');
    process.exit(1);
  }
} catch (error) {
  console.error('✕ Verification script execution failed:', error.message);
  process.exit(1);
}
