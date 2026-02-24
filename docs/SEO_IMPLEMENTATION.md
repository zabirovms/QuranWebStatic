# SEO Implementation Guide
## Complete SEO Optimization for Quran Web Static Site

**Date:** Implementation Complete  
**Target:** Cloudflare Pages Static Deployment  
**Base URL:** https://quran.tj

---

## 1. Canonical URL Strategy ✅

### Implementation

**Surah Pages (`/surah/{n}/`):**
- Self-referencing canonical: `https://quran.tj/surah/{n}/`
- Implemented in: `web-static/app/surah/[number]/layout.tsx`
- Uses Next.js `generateMetadata` with `alternates.canonical`

**Verse Pages (`/surah/{n}/{v}/`):**
- Self-referencing canonical: `https://quran.tj/surah/{n}/{v}/`
- Implemented in: `web-static/app/surah/[number]/[verseNumber]/layout.tsx`
- Uses Next.js `generateMetadata` with `alternates.canonical`

**Query Parameter URLs (`/surah/{n}?verse={v}`):**
- Canonical to base surah page: `https://quran.tj/surah/{n}/`
- Implemented via: `web-static/components/CanonicalHead.tsx`
- Client-side injection for static export compatibility
- **NOT treated as standalone documents** - canonical points to surah page

### Example Canonical Tags

**Surah Page:**
```html
<link rel="canonical" href="https://quran.tj/surah/2/" />
```

**Verse Page:**
```html
<link rel="canonical" href="https://quran.tj/surah/2/255/" />
```

**Query Parameter URL (`/surah/2?verse=255`):**
```html
<link rel="canonical" href="https://quran.tj/surah/2/" />
```

---

## 2. Indexing Rules ✅

### Indexable Pages (First-Class Content)
- ✅ All surah pages (`/surah/{n}/`) - Optimized for full surah reading search intent
- ✅ All verse pages (`/surah/{n}/{v}/`) - Optimized for individual verse reading search intent
- ✅ All static content pages
- Both surah and verse pages are independently indexable and serve different user search intents

### Non-Indexable (via Canonical, NOT robots.txt)
- Query parameter URLs (`/surah/{n}?verse={v}`) → Canonical to `/surah/{n}/`
- These are UI navigation helpers, not standalone content pages
- No robots.txt blocking needed - canonical handles deduplication

### robots.txt Configuration
**File:** `web-static/public/robots.txt`

```
Allow: /surah/
Allow: /surah/*/
Allow: /surah/*/*/
```

**Note:** Both surah and verse pages are explicitly allowed for indexing. Query parameter URLs are handled via canonical tags, ensuring search engines understand they are UI helpers pointing to the base surah page, not separate content pages.

---

## 3. Titles and Meta Descriptions ✅

### Surah Pages

**Format:**
```
Title: {SurahName} | Қуръон бо Тафсири Осонбаён
Description: Хондани пурраи сураи {SurahName} бо {verseCount} оят. Тарҷума ва тафсири осонбаён дар забони тоҷикӣ.
```

**Example:**
```html
<title>Ал-Бақара | Қуръон бо Тафсири Осонбаён</title>
<meta name="description" content="Хондани пурраи сураи Ал-Бақара бо 286 оят. Тарҷума ва тафсири осонбаён дар забони тоҷикӣ." />
```

**Implementation:** `web-static/app/surah/[number]/layout.tsx`

### Verse Pages

**Format:**
```
Title: {SurahName} {surahNumber}:{verseNumber} - Тарҷума | Қуръон бо Тафсири Осонбаён
Description: Оят {verseNumber} аз сураи {SurahName} бо тарҷумаи Pioneers of Translation Center. {verseTextPreview}
```

**Example:**
```html
<title>Ал-Бақара 2:255 - Тарҷума | Қуръон бо Тафсири Осонбаён</title>
<meta name="description" content="Оят 255 аз сураи Ал-Бақара бо тарҷумаи Pioneers of Translation Center. Аллоҳу ло илоҳа илла ҳувал-ҳаййул-қаййум..." />
```

**Implementation:** `web-static/app/surah/[number]/[verseNumber]/layout.tsx`

---

## 4. Duplicate Content Prevention ✅

### Strategy

1. **Surah and Verse Pages - Different Search Intents:**
   - **Surah pages** (`/surah/{n}/`): First-class indexable pages optimized for full surah reading intent
   - **Verse pages** (`/surah/{n}/{v}/`): First-class indexable pages optimized for individual verse reading intent
   - Both page types are independently indexable and serve distinct user search intents
   - When verse text appears in both contexts, each page maintains its own canonical URL and serves its specific purpose

2. **Query Parameter Handling:**
   - `/surah/{n}?verse={v}` → Canonical to `/surah/{n}/`
   - Prevents indexing of UI-only highlight URLs (these are not standalone documents)
   - Query parameter URLs are UI navigation helpers, not separate content pages
   - No duplicate content issues between query URLs and canonical pages

3. **No Translation-Specific URLs:**
   - Single URL per verse regardless of translation
   - Translation selection is UI-only, not URL-based

### Content Uniqueness
- Each verse page has unique content and purpose (single verse focus with translation)
- Each surah page has unique content and purpose (full surah with all verses)
- Both page types are indexable and rank for their respective search intents
- No conflicting canonical URLs - each page type has its own self-referencing canonical

---

## 5. Sitemap Generation ✅

### Implementation

**File:** `web-static/scripts/generate-sitemap.js`  
**Output:** `web-static/public/sitemap.xml`  
**Total URLs:** 6,371

### Sitemap Contents

1. **Static Pages (21):**
   - Home, Quran, Duas, Tasbeeh, etc.
   - Priority: 0.8
   - Change frequency: weekly

2. **Surah Pages (114):**
   - `/surah/1/` through `/surah/114/`
   - Priority: 0.9
   - Change frequency: weekly

3. **Verse Pages (6,236):**
   - `/surah/{n}/{v}/` for all verses
   - Priority: 0.7
   - Change frequency: monthly

### Sitemap Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://quran.tj/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://quran.tj/surah/2/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://quran.tj/surah/2/255/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <!-- ... 6,368 more URLs ... -->
</urlset>
```

### Generation Command

```bash
cd web-static
node scripts/generate-sitemap.js
```

**Note:** Sitemap is automatically generated during build process (see `package.json` scripts).

---

## 6. robots.txt Configuration ✅

**File:** `web-static/public/robots.txt`

### Current Configuration

```
User-agent: *
Allow: /

# Explicitly allow all surah and verse pages
Allow: /surah/
Allow: /surah/*/
Allow: /surah/*/*/

# Disallow non-SEO dynamic routes
Disallow: /youtube/
Disallow: /live/
Disallow: /audio-home/reciter/
Disallow: /qaida/lesson/*/letter/
Disallow: /vocabulary/lesson/*/word/
Disallow: /vocabulary/lesson/*/quiz/
Disallow: /prophets/detail/
Disallow: /duas/prophets/detail/

# Sitemap location
Sitemap: https://quran.tj/sitemap.xml
```

### Key Points

- ✅ All surah and verse URLs are explicitly allowed
- ✅ Query parameter URLs are NOT blocked (handled via canonical)
- ✅ Non-SEO routes are disallowed
- ✅ Sitemap location specified

---

## 7. Structured Data (Schema.org) ✅

### Implementation

**Component:** `web-static/components/StructuredData.tsx`  
**Type:** JSON-LD (injected client-side for static export compatibility)

### Surah Page Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "Book",
  "@id": "https://quran.tj/surah/2/",
  "name": "Ал-Бақара",
  "description": "Сураи Ал-Бақара аз Қуръони Карим",
  "inLanguage": ["ar", "tg"],
  "about": {
    "@type": "Thing",
    "name": "Quran"
  },
  "bookFormat": "Digital",
  "genre": "Religious Text"
}
```

### Verse Page Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "@id": "https://quran.tj/surah/2/255/",
  "name": "Ал-Бақара 2:255",
  "description": "Оят 255 аз сураи Ал-Бақара",
  "inLanguage": ["ar", "tg"],
  "about": {
    "@type": "Thing",
    "name": "Quran"
  },
  "partOf": {
    "@type": "CreativeWork",
    "name": "Ал-Бақара",
    "@id": "https://quran.tj/surah/2/"
  },
  "position": 255,
  "text": "{arabic text}",
  "translation": "{translation text}"
}
```

### Usage

**Surah Page:**
```tsx
<StructuredData
  type="surah"
  surahNumber={2}
  surahName="Ал-Бақара"
/>
```

**Verse Page:**
```tsx
<StructuredData
  type="verse"
  surahNumber={2}
  surahName="Ал-Бақара"
  verseNumber={255}
  verseText={verse.arabicText}
  verseTranslation={verse.tj3}
/>
```

---

## 8. Static Deployment Compatibility ✅

### All SEO Features Work with Static Export

1. **Metadata:** Generated at build time via Next.js `generateMetadata`
2. **Canonical URLs:** 
   - Base canonicals in layout files (server-side generation)
   - Query parameter handling via client-side component
3. **Structured Data:** Client-side injection (compatible with static export)
4. **Sitemap:** Pre-generated static file
5. **robots.txt:** Static file in public directory

### No Server-Side Dependencies

- ✅ All metadata generated at build time
- ✅ Canonical URLs work in static HTML
- ✅ Structured data injected client-side
- ✅ Fully compatible with Cloudflare Pages

---

## 9. Example <head> Markup

### Surah Page (`/surah/2/`)

```html
<head>
  <title>Ал-Бақара | Қуръон бо Тафсири Осонбаён</title>
  <meta name="description" content="Хондани пурраи сураи Ал-Бақара бо 286 оят. Тарҷума ва тафсири осонбаён дар забони тоҷикӣ." />
  <link rel="canonical" href="https://quran.tj/surah/2/" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="Ал-Бақара - Қуръон" />
  <meta property="og:description" content="Хондани пурраи сураи Ал-Бақара бо 286 оят..." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://quran.tj/surah/2/" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Ал-Бақара - Қуръон" />
  <meta name="twitter:description" content="Хондани пурраи сураи Ал-Бақара бо 286 оят..." />
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": "https://quran.tj/surah/2/",
    "name": "Ал-Бақара",
    ...
  }
  </script>
</head>
```

### Verse Page (`/surah/2/255/`)

```html
<head>
  <title>Ал-Бақара 2:255 - Тарҷума | Қуръон бо Тафсири Осонбаён</title>
  <meta name="description" content="Оят 255 аз сураи Ал-Бақара бо тарҷумаи Pioneers of Translation Center. Аллоҳу ло илоҳа илла ҳувал-ҳаййул-қаййум..." />
  <link rel="canonical" href="https://quran.tj/surah/2/255/" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="Ал-Бақара 2:255 - Тарҷума" />
  <meta property="og:description" content="Оят 255 аз сураи Ал-Бақара..." />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://quran.tj/surah/2/255/" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Ал-Бақара 2:255" />
  <meta name="twitter:description" content="Оят 255 аз сураи Ал-Бақара..." />
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": "https://quran.tj/surah/2/255/",
    "name": "Ал-Бақара 2:255",
    ...
  }
  </script>
</head>
```

### Query Parameter URL (`/surah/2?verse=255`)

```html
<head>
  <title>Ал-Бақара | Қуръон бо Тафсири Осонбаён</title>
  <meta name="description" content="Хондани пурраи сураи Ал-Бақара бо 286 оят..." />
  <link rel="canonical" href="https://quran.tj/surah/2/" />
  <!-- Canonical points to base surah page, not verse page -->
</head>
```

---

## 10. SEO Goals Achievement ✅

### ✅ Surah-Level Search Rankings
- Unique titles and descriptions for each surah
- Canonical URLs prevent duplicate content
- Structured data helps search engines understand content
- Sitemap includes all surah pages

### ✅ Verse-Specific Search Rankings
- Unique titles: `{SurahName} {n}:{v} - Тарҷума`
- Verse-specific descriptions with translation preview
- Canonical URLs for each verse page
- Structured data with verse position and content
- All 6,236 verses in sitemap

### ✅ Duplicate Content Prevention
- Query parameter URLs canonical to surah pages (UI-only URLs, not standalone documents)
- Both surah and verse pages are first-class indexable pages with self-referencing canonicals
- Each page type serves different search intents (full surah reading vs. individual verse reading)
- No conflicting canonical URLs - clear separation between page types

### ✅ Static Deployment Ready
- All metadata generated at build time
- Client-side components for dynamic canonical handling
- Pre-generated sitemap
- No server-side rendering required
- Fully compatible with Cloudflare Pages

---

## 11. Files Modified/Created

### New Files
1. `web-static/app/surah/[number]/layout.tsx` - Surah page metadata
2. `web-static/components/CanonicalHead.tsx` - Query parameter canonical handling
3. `web-static/components/StructuredData.tsx` - Schema.org structured data

### Modified Files
1. `web-static/app/surah/[number]/[verseNumber]/layout.tsx` - Enhanced verse metadata
2. `web-static/app/surah/[number]/page.tsx` - Added CanonicalHead and StructuredData
3. `web-static/app/surah/[number]/[verseNumber]/page.tsx` - Added StructuredData
4. `web-static/scripts/generate-sitemap.js` - Added verse page generation
5. `web-static/public/robots.txt` - Updated for SEO
6. `web-static/public/sitemap.xml` - Regenerated with all pages

---

## 12. Testing & Verification

### Pre-Deployment Checklist

- [x] ✅ Canonical URLs set correctly for all page types
- [x] ✅ Metadata generated for all surah and verse pages
- [x] ✅ Sitemap includes all 6,371 URLs
- [x] ✅ robots.txt allows crawling of surah/verse pages
- [x] ✅ Structured data injected correctly
- [x] ✅ Query parameter URLs canonical to base pages
- [x] ✅ No duplicate content issues
- [x] ✅ Static export compatible

### Verification Commands

```bash
# Generate sitemap
cd web-static
node scripts/generate-sitemap.js

# Verify sitemap contains verse pages
grep -c "/surah/[0-9]*/[0-9]*/" public/sitemap.xml

# Build and verify static export
npm run build
# Check out/ directory for generated HTML files
```

---

## 13. Google Search Console Setup

### Recommended Actions

1. **Submit Sitemap:**
   - URL: `https://quran.tj/sitemap.xml`
   - Submit in Google Search Console → Sitemaps

2. **Verify Coverage:**
   - Check indexed pages
   - Monitor canonical tag usage
   - Verify no duplicate content issues

3. **Monitor Performance:**
   - Track rankings for surah names
   - Track rankings for verse queries (e.g., "Бақара 2:255")
   - Monitor click-through rates

---

## 14. Summary

### ✅ Complete SEO Implementation

**Canonical Strategy:**
- ✅ Surah pages: Self-referencing
- ✅ Verse pages: Self-referencing
- ✅ Query URLs: Canonical to surah pages

**Indexing:**
- ✅ All surah and verse pages indexable
- ✅ Query parameter URLs handled via canonical (not robots.txt)

**Metadata:**
- ✅ Unique titles and descriptions for all pages
- ✅ Verse pages include "translation" in title
- ✅ Open Graph and Twitter Card tags

**Sitemap:**
- ✅ 6,371 URLs total
- ✅ All surah and verse pages included
- ✅ Query parameter URLs excluded

**Structured Data:**
- ✅ Schema.org JSON-LD for surahs and verses
- ✅ Compatible with static export

**Static Deployment:**
- ✅ All features work with Cloudflare Pages
- ✅ No server-side dependencies
- ✅ Pre-generated at build time

---

**Status:** ✅ **FULLY IMPLEMENTED AND READY FOR DEPLOYMENT**

All SEO requirements have been implemented and tested. The site is ready for Cloudflare Pages deployment with complete SEO optimization.

