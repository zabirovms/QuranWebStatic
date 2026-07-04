const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const dataPath = path.join(__dirname, '..', 'public', 'data', 'farzi-ayn.json.gz');
const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

try {
  console.log('--- Phase 1 Verification Script ---');
  
  // 1. Check if compressed data file exists
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Data file not found at: ${dataPath}`);
  }
  console.log('✓ Farzi Ayn compressed data file exists.');

  // 2. Read and parse data
  const dataBuffer = fs.readFileSync(dataPath);
  const jsonContent = zlib.gunzipSync(dataBuffer).toString('utf8');
  const sections = JSON.parse(jsonContent);
  console.log(`✓ Data parses correctly: found ${sections.length} sections.`);

  // 3. Verify section structures and slugs
  const slugSet = new Set();
  let errorCount = 0;

  sections.forEach((section, index) => {
    if (!section.id || typeof section.id !== 'string') {
      console.error(`✕ Section at index ${index} is missing a string ID`);
      errorCount++;
    } else {
      slugSet.add(section.id);
    }

    if (!section.title) {
      console.error(`✕ Section "${section.id || index}" is missing a title`);
      errorCount++;
    }

    if (!section.category) {
      console.error(`✕ Section "${section.id || index}" is missing a category`);
      errorCount++;
    }

    if (!Array.isArray(section.content) || section.content.length === 0) {
      console.error(`✕ Section "${section.id || index}" has empty or invalid content blocks`);
      errorCount++;
    }
  });

  if (errorCount === 0) {
    console.log(`✓ Checked all ${sections.length} sections: structural integrity is 100% correct.`);
    console.log(`✓ Total unique Latin slugs: ${slugSet.size}`);
  } else {
    throw new Error(`Integrity check failed with ${errorCount} errors.`);
  }

  // 4. Verify sitemap.xml entries
  if (!fs.existsSync(sitemapPath)) {
    throw new Error(`Sitemap not found at: ${sitemapPath}`);
  }
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

  // Verify /farzi-ayn entry
  const hasFarziAynRoot = sitemapContent.includes('<loc>https://www.quran.tj/farzi-ayn</loc>');
  if (!hasFarziAynRoot) {
    console.error('✕ Sitemap is missing the main "/farzi-ayn" route.');
    errorCount++;
  } else {
    console.log('✓ Main "/farzi-ayn" route is present in sitemap.');
  }

  // Verify all dynamic subpage entries
  let missingSitemapSlugs = 0;
  sections.forEach((section) => {
    const sitemapUrl = `<loc>https://www.quran.tj/farzi-ayn/${section.id}</loc>`;
    if (!sitemapContent.includes(sitemapUrl)) {
      console.error(`✕ Sitemap is missing dynamic route: ${sitemapUrl}`);
      missingSitemapSlugs++;
      errorCount++;
    }
  });

  if (missingSitemapSlugs === 0) {
    console.log(`✓ All ${sections.length} dynamic subpages are correctly registered in sitemap.xml.`);
  } else {
    console.error(`✕ Total missing dynamic slugs in sitemap: ${missingSitemapSlugs}`);
  }

  console.log('\n====================================');
  if (errorCount === 0) {
    console.log('🎉 Phase 1 Verification: ALL PASSED!');
  } else {
    console.log('✕ Phase 1 Verification: FAILED.');
    process.exit(1);
  }
} catch (error) {
  console.error('✕ Verification script execution failed:', error.message);
  process.exit(1);
}
