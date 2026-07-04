/**
 * Generate sitemap-images.xml for gallery pictures (SEO)
 * Fetches picture list from CDN and writes individual url entries for each image page.
 * Excludes wallpapers as they are decorative.
 * Run before deploy so current and new pictures are discoverable.
 *
 * Usage: node scripts/generate-image-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.quran.tj';
const PICTURES_LIST_URL = 'https://cdn.quran.tj/pictures/list';
const PICTURES_BASE_URL = 'https://cdn.quran.tj/pictures/';
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap-images.xml');

function filenameToCaption(filename) {
  const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
  return nameWithoutExt.replace(/_/g, ' ').replace(/-/g, ' ').trim() || filename;
}

function slugify(text) {
  if (!text) return '';
  let cleanText = text;
  if (text.includes('.')) {
    const parts = text.split('.');
    const lastPart = parts[parts.length - 1].toLowerCase();
    if (lastPart.length >= 2 && lastPart.length <= 4) {
      cleanText = parts.slice(0, -1).join('.');
    }
  }
  return cleanText
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeXml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchJson(url) {
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function generateImageSitemap() {
  let pictures = [];

  try {
    console.log(`Fetching pictures list from ${PICTURES_LIST_URL}...`);
    pictures = await fetchJson(PICTURES_LIST_URL);
  } catch (err) {
    console.error('Error fetching image lists:', err.message);
    process.exit(1);
  }

  console.log(`Fetched ${pictures.length} pictures. Generating sitemap entries...`);

  const urlEntries = pictures.map((filename) => {
    const slug = slugify(filename);
    const pageUrl = `${BASE_URL}/gallery/${slug}`;
    const imageUrl = `${PICTURES_BASE_URL}${encodeURIComponent(filename)}`;
    const caption = escapeXml(filenameToCaption(filename));

    return `  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:title>${caption}</image:title>
      <image:caption>${caption}</image:caption>
    </image:image>
  </url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries || '  <!-- No images found at build time -->'}
</urlset>`;

  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_PATH, sitemap, 'utf-8');
  console.log(`✅ Image sitemap written to ${OUTPUT_PATH} (contains ${pictures.length} entries)`);
}

if (require.main === module) {
  generateImageSitemap().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { generateImageSitemap };
