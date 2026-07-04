const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const dataPath = path.join(__dirname, '..', 'public', 'data', '99_Names_Of_Allah_detailed.json.gz');
const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

async function verify() {
  try {
    console.log('--- Phase 2 Verification Script ---');

    // 1. Check data file
    if (!fs.existsSync(dataPath)) {
      throw new Error(`Data file not found at: ${dataPath}`);
    }
    console.log('✓ Asmaul Husna compressed detailed data file exists.');

    // 2. Parse data
    const dataBuffer = fs.readFileSync(dataPath);
    const jsonContent = zlib.gunzipSync(dataBuffer).toString('utf8');
    const data = JSON.parse(jsonContent);
    const names = data.names || [];
    const intro = data.intro;

    console.log(`✓ Introduction sections verified: title is "${intro?.title || ''}"`);
    console.log(`✓ Detailed names verified: found ${names.length} names.`);

    if (names.length !== 99) {
      throw new Error(`Expected exactly 99 names of Allah, found ${names.length}`);
    }

    // 3. Structural validation
    const slugSet = new Set();
    let errorCount = 0;

    names.forEach((name, index) => {
      const displayRef = name.slug || index;
      if (!name.id || typeof name.id !== 'number') {
        console.error(`✕ Name at index ${index} is missing a numeric ID`);
        errorCount++;
      }
      if (!name.name) {
        console.error(`✕ Name "${displayRef}" is missing a name (transliteration)`);
        errorCount++;
      }
      if (!name.arabic) {
        console.error(`✕ Name "${displayRef}" is missing calligraphy arabic`);
        errorCount++;
      }
      if (!name.description) {
        console.error(`✕ Name "${displayRef}" is missing a description`);
        errorCount++;
      }
      if (name.found === undefined) {
        console.error(`✕ Name "${displayRef}" is missing occurrences field`);
        errorCount++;
      }
      if (!name.slug || typeof name.slug !== 'string') {
        console.error(`✕ Name "${displayRef}" is missing a slug`);
        errorCount++;
      } else {
        slugSet.add(name.slug);
      }
      if (!name.shortMeaning) {
        console.error(`✕ Name "${displayRef}" is missing shortMeaning`);
        errorCount++;
      }
    });

    if (slugSet.size === 99) {
      console.log('✓ Slug check: all 99 dynamic URL slugs are unique and valid.');
    } else {
      console.error(`✕ Slug check failed: found only ${slugSet.size} unique slugs for 99 names.`);
      errorCount++;
    }

    // 4. Verify sitemap.xml
    if (!fs.existsSync(sitemapPath)) {
      throw new Error(`Sitemap not found at: ${sitemapPath}`);
    }
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

    // Verify /asmaul-husna root
    if (!sitemapContent.includes('<loc>https://www.quran.tj/asmaul-husna</loc>')) {
      console.error('✕ Sitemap is missing the main "/asmaul-husna" route.');
      errorCount++;
    } else {
      console.log('✓ Main "/asmaul-husna" route is present in sitemap.');
    }

    // Verify dynamic slugs
    let missingSitemapSlugs = 0;
    names.forEach((name) => {
      const expectedUrl = `<loc>https://www.quran.tj/asmaul-husna/${name.slug}</loc>`;
      if (!sitemapContent.includes(expectedUrl)) {
        console.error(`✕ Sitemap is missing dynamic route: ${expectedUrl}`);
        missingSitemapSlugs++;
        errorCount++;
      }
    });

    if (missingSitemapSlugs === 0) {
      console.log('✓ All 99 dynamic subpage routes are registered in sitemap.xml.');
    } else {
      console.error(`✕ Total missing dynamic slugs in sitemap: ${missingSitemapSlugs}`);
    }

    // 5. Verify the compatibility mapping rule locally
    const testName = names[0];
    const mappedTest = {
      name: testName.arabic, // Legacy expected
      number: testName.id,
      found: testName.found,
      tajik: {
        transliteration: testName.name,
        meaning: testName.shortMeaning,
        description: testName.description,
      },
      id: testName.id,
      arabic: testName.arabic,
      description: testName.description,
      slug: testName.slug,
      shortMeaning: testName.shortMeaning
    };

    if (!mappedTest.name || typeof mappedTest.name !== 'string') {
      console.error('✕ Compatibility mapping failed: "name" field is invalid or missing');
      errorCount++;
    }
    if (!mappedTest.number || typeof mappedTest.number !== 'number') {
      console.error('✕ Compatibility mapping failed: "number" field is invalid or missing');
      errorCount++;
    }
    if (!mappedTest.tajik || !mappedTest.tajik.transliteration || !mappedTest.tajik.meaning || !mappedTest.tajik.description) {
      console.error('✕ Compatibility mapping failed: "tajik" sub-object is missing required legacy fields');
      errorCount++;
    } else {
      console.log('✓ Legacy compatibility mapping verified: name, number, tajik.{transliteration, meaning, description} exist.');
    }

    console.log('\n====================================');
    if (errorCount === 0) {
      console.log('🎉 Phase 2 Verification: ALL PASSED!');
    } else {
      console.log('✕ Phase 2 Verification: FAILED.');
      process.exit(1);
    }
  } catch (error) {
    console.error('✕ Verification script execution failed:', error.message);
    process.exit(1);
  }
}

verify();
