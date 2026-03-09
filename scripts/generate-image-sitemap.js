/**
 * Generate sitemap-images.xml for gallery images (SEO)
 * Fetches picture and wallpaper lists from CDN and writes an image sitemap.
 * Run before deploy so current and new (e.g. daily) images are discoverable.
 *
 * Usage: node scripts/generate-image-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.quran.tj';
const GALLERY_URL = `${BASE_URL}/gallery`;
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap-images.xml');

const PICTURES_LIST_URL = 'https://cdn.quran.tj/pictures/list';
const WALLPAPERS_LIST_URL = 'https://cdn.quran.tj/wallpapers/list';
const PICTURES_BASE_URL = 'https://cdn.quran.tj/pictures/';
const WALLPAPERS_BASE_URL = 'https://cdn.quran.tj/wallpapers/';

function filenameToCaption(filename) {
  const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
  return nameWithoutExt.replace(/_/g, ' ').replace(/-/g, ' ').trim() || filename;
}

function buildImageEntries(filenames, baseUrl) {
  return filenames.map((filename) => {
    const imageUrl = `${baseUrl}${encodeURIComponent(filename)}`;
    const caption = escapeXml(filenameToCaption(filename));
    return `    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:caption>${caption}</image:caption>
    </image:image>`;
  }).join('\n');
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
  let wallpapers = [];

  try {
    const [picturesList, wallpapersList] = await Promise.all([
      fetchJson(PICTURES_LIST_URL),
      fetchJson(WALLPAPERS_LIST_URL),
    ]);
    pictures = picturesList;
    wallpapers = wallpapersList;
  } catch (err) {
    console.error('Error fetching image lists:', err.message);
    process.exit(1);
  }

  const pictureEntries = buildImageEntries(pictures, PICTURES_BASE_URL);
  const wallpaperEntries = buildImageEntries(wallpapers, WALLPAPERS_BASE_URL);
  const allEntries = [pictureEntries, wallpaperEntries].filter(Boolean).join('\n');

  const totalImages = pictures.length + wallpapers.length;
  if (totalImages === 0) {
    console.warn('⚠️  No images found; writing sitemap with single gallery URL and no images.');
  } else {
    console.log(`   Pictures: ${pictures.length}, Wallpapers: ${wallpapers.length}, Total images: ${totalImages}`);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${escapeXml(GALLERY_URL)}</loc>
${allEntries || '    <!-- No images at build time -->'}
  </url>
</urlset>`;

  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_PATH, sitemap, 'utf-8');
  console.log(`✅ Image sitemap written to ${OUTPUT_PATH}`);
}

if (require.main === module) {
  generateImageSitemap().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { generateImageSitemap };
