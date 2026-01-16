/**
 * Generate sitemap.xml for the static site
 * Includes all surah pages, verse pages, and prophet detail pages
 * Run this script before building: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');
const { gunzipSync } = require('zlib');

const BASE_URL = 'https://www.quran.tj';
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');
const DATA_DIR = path.join(__dirname, '../public/data');

// Verse counts per surah (Quran has 6,236 verses total across 114 surahs)
// This is a static list to avoid loading data files during build
const versesPerSurah = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
];

// Static routes that should be included (no trailing slashes except root)
const staticRoutes = [
  '/',
  '/quran',
  '/duas',
  '/duas/rabbano',
  '/duas/prophets',
  '/tasbeeh',
  '/asmaul-husna',
  '/prophets',
  '/quoted-verses',
  '/qaida',
  '/vocabulary',
  '/search',
  '/audio-home',
  '/audio-home/all-reciters',
  '/gallery',
  '/learn-words',
  '/scheduler',
  '/bukhari',
  '/vaqti-namoz',
];

// Generate surah routes (1-114) - no trailing slashes
const surahRoutes = [];
for (let i = 1; i <= 114; i++) {
  surahRoutes.push(`/surah/${i}`);
}

// Generate verse routes for all surahs - no trailing slashes
const verseRoutes = [];
for (let surahNum = 1; surahNum <= 114; surahNum++) {
  const verseCount = versesPerSurah[surahNum - 1];
  for (let verseNum = 1; verseNum <= verseCount; verseNum++) {
    verseRoutes.push(`/surah/${surahNum}/${verseNum}`);
  }
}

// Load prophet data and generate prophet detail routes
function loadProphets() {
  try {
    const filePath = path.join(DATA_DIR, 'Prophets.json.gz');
    const compressedBuffer = fs.readFileSync(filePath);
    const decompressedBuffer = gunzipSync(compressedBuffer);
    const jsonString = decompressedBuffer.toString('utf-8');
    const prophets = JSON.parse(jsonString);
    return Array.isArray(prophets) ? prophets : [];
  } catch (error) {
    console.warn('⚠️  Could not load prophets data for sitemap:', error.message);
    return [];
  }
}

// Load prophet duas data to determine which prophets have duas
function loadProphetDuas() {
  try {
    const filePath = path.join(DATA_DIR, 'prophets_duas.json.gz');
    const compressedBuffer = fs.readFileSync(filePath);
    const decompressedBuffer = gunzipSync(compressedBuffer);
    const jsonString = decompressedBuffer.toString('utf-8');
    const duas = JSON.parse(jsonString);
    return Array.isArray(duas) ? duas : [];
  } catch (error) {
    console.warn('⚠️  Could not load prophet duas data for sitemap:', error.message);
    return [];
  }
}

// Generate prophet detail routes
function generateProphetRoutes() {
  const prophets = loadProphets();
  const routes = [];
  
  for (const prophet of prophets) {
    const prophetName = prophet.name || prophet.nameTajik || '';
    if (prophetName) {
      // URL encode the prophet name for the query parameter
      const encodedName = encodeURIComponent(prophetName);
      routes.push(`/prophets/detail/?name=${encodedName}`);
    }
  }
  
  return routes;
}

// Generate prophet dua detail routes
function generateProphetDuaRoutes() {
  const duas = loadProphetDuas();
  const prophetSet = new Set();
  
  // Find all unique prophets that have duas
  for (const dua of duas) {
    if (dua.prophet) {
      prophetSet.add(dua.prophet);
    }
  }
  
  const routes = [];
  for (const prophetName of prophetSet) {
    const encodedName = encodeURIComponent(prophetName);
    routes.push(`/duas/prophets/detail/?name=${encodedName}`);
  }
  
  return routes;
}

// Load reciters data
function loadReciters() {
  try {
    const reciterMap = new Map();
    
    // Load full surah reciters
    try {
      const fullSurahPath = path.join(DATA_DIR, 'full_surah_reciters.json.gz');
      const fullSurahBuffer = fs.readFileSync(fullSurahPath);
      const fullSurahDecompressed = gunzipSync(fullSurahBuffer);
      const fullSurahData = JSON.parse(fullSurahDecompressed.toString('utf-8'));
      
      if (Array.isArray(fullSurahData)) {
        fullSurahData.forEach((item) => {
          const id = item.id || item.identifier || '';
          if (id) {
            reciterMap.set(id, {
              id,
              nameTajik: item.nameTajik || item.name || '',
            });
          }
        });
      }
    } catch (error) {
      console.warn('⚠️  Could not load full surah reciters:', error.message);
    }
    
    // Load verse-by-verse reciters
    try {
      const verseByVersePath = path.join(DATA_DIR, 'verse_by_verse_reciters.json.gz');
      const verseByVerseBuffer = fs.readFileSync(verseByVersePath);
      const verseByVerseDecompressed = gunzipSync(verseByVerseBuffer);
      const verseByVerseData = JSON.parse(verseByVerseDecompressed.toString('utf-8'));
      
      if (Array.isArray(verseByVerseData)) {
        verseByVerseData.forEach((item) => {
          const id = item.id || item.identifier || '';
          if (id && !reciterMap.has(id)) {
            reciterMap.set(id, {
              id,
              nameTajik: item.nameTajik || item.name || '',
            });
          }
        });
      }
    } catch (error) {
      console.warn('⚠️  Could not load verse-by-verse reciters:', error.message);
    }
    
    return Array.from(reciterMap.values());
  } catch (error) {
    console.warn('⚠️  Could not load reciters data for sitemap:', error.message);
    return [];
  }
}

// Generate reciter routes
function generateReciterRoutes() {
  const reciters = loadReciters();
  const routes = [];
  
  for (const reciter of reciters) {
    if (reciter.id) {
      routes.push(`/audio-home/reciter/${reciter.id}`);
    }
  }
  
  return routes;
}

// Load Bukhari books metadata
function loadBukhariBooks() {
  try {
    const bukhariDir = path.join(DATA_DIR, 'bukhari');
    const files = fs.readdirSync(bukhariDir);
    const books = [];
    
    for (const file of files) {
      if (file.startsWith('book_') && file.endsWith('.json')) {
        try {
          const filePath = path.join(bukhariDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const bookData = JSON.parse(content);
          
          if (bookData.number !== undefined) {
            const bookNumber = bookData.number;
            const subNumber = bookData.sub_number || null;
            const bookNumberStr = subNumber ? `${bookNumber}-${subNumber}` : String(bookNumber);
            books.push({
              number: bookNumber,
              subNumber: subNumber,
              bookNumberStr: bookNumberStr,
              chapters: bookData.chapters || [],
            });
          }
        } catch (error) {
          console.warn(`⚠️  Could not load Bukhari book file ${file}:`, error.message);
        }
      }
    }
    
    return books.sort((a, b) => {
      if (a.number !== b.number) return a.number - b.number;
      return (a.subNumber || 0) - (b.subNumber || 0);
    });
  } catch (error) {
    console.warn('⚠️  Could not load Bukhari books data for sitemap:', error.message);
    return [];
  }
}

// Generate Bukhari book routes
function generateBukhariBookRoutes() {
  const books = loadBukhariBooks();
  const routes = [];
  
  for (const book of books) {
    routes.push(`/bukhari/${book.bookNumberStr}`);
  }
  
  return routes;
}

// Generate Bukhari chapter routes
function generateBukhariChapterRoutes() {
  const books = loadBukhariBooks();
  const routes = [];
  
  for (const book of books) {
    if (book.chapters && Array.isArray(book.chapters)) {
      for (const chapter of book.chapters) {
        if (chapter.number !== undefined) {
          routes.push(`/bukhari/${book.bookNumberStr}/${chapter.number}`);
        }
      }
    }
  }
  
  return routes;
}

// Generate sitemap XML
function generateSitemap() {
  const prophetRoutes = generateProphetRoutes();
  const prophetDuaRoutes = generateProphetDuaRoutes();
  const reciterRoutes = generateReciterRoutes();
  const bukhariBookRoutes = generateBukhariBookRoutes();
  const bukhariChapterRoutes = generateBukhariChapterRoutes();
  const urls = [...staticRoutes, ...surahRoutes, ...verseRoutes, ...prophetRoutes, ...prophetDuaRoutes, ...reciterRoutes, ...bukhariBookRoutes, ...bukhariChapterRoutes];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.map(url => {
    let priority = '0.8';
    let changefreq = 'weekly';
    
    if (url === '/') {
      priority = '1.0';
      changefreq = 'daily';
    } else if (url.startsWith('/surah/') && url.match(/^\/surah\/\d+$/)) {
      // Surah pages (no trailing slash)
      priority = '0.9';
      changefreq = 'weekly';
    } else if (url.match(/^\/surah\/\d+\/\d+$/)) {
      // Verse pages (no trailing slash)
      priority = '0.7';
      changefreq = 'monthly';
    } else if (url.includes('/prophets/detail/') || url.includes('/duas/prophets/detail/')) {
      // Prophet detail pages
      priority = '0.8';
      changefreq = 'monthly';
    } else if (url.includes('/audio-home/reciter/')) {
      // Reciter pages
      priority = '0.7';
      changefreq = 'monthly';
    } else if (url === '/bukhari') {
      // Bukhari home page
      priority = '0.9';
      changefreq = 'weekly';
    } else if (url.match(/^\/bukhari\/\d+(-\d+)?$/)) {
      // Bukhari book pages
      priority = '0.8';
      changefreq = 'monthly';
    } else if (url.match(/^\/bukhari\/\d+(-\d+)?\/\d+$/)) {
      // Bukhari chapter pages
      priority = '0.7';
      changefreq = 'monthly';
    }
    
    return `  <url>
    <loc>${BASE_URL}${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n')}
</urlset>`;

  // Write to public directory
  fs.writeFileSync(OUTPUT_PATH, sitemap, 'utf-8');
  console.log(`✅ Sitemap generated successfully at ${OUTPUT_PATH}`);
  console.log(`   Total URLs: ${urls.length}`);
  console.log(`   - Static pages: ${staticRoutes.length}`);
  console.log(`   - Surah pages: ${surahRoutes.length}`);
  console.log(`   - Verse pages: ${verseRoutes.length}`);
  console.log(`   - Prophet detail pages: ${prophetRoutes.length}`);
  console.log(`   - Prophet dua detail pages: ${prophetDuaRoutes.length}`);
  console.log(`   - Reciter pages: ${reciterRoutes.length}`);
  console.log(`   - Bukhari book pages: ${bukhariBookRoutes.length}`);
  console.log(`   - Bukhari chapter pages: ${bukhariChapterRoutes.length}`);
}

// Run if called directly
if (require.main === module) {
  generateSitemap();
}

module.exports = { generateSitemap };

