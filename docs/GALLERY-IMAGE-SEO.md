# Gallery & Image SEO – Analysis & Recommendations

This document summarizes how your gallery is set up for SEO and how to optimize **current** and **future** (e.g. daily) images so they appear in search results.

---

## Current state (what you already have)

| Area | Status | Notes |
|------|--------|--------|
| **Page metadata** | ✅ | Gallery layout has title, description, canonical, Open Graph, Twitter in `app/gallery/layout.tsx`. |
| **Initial content in HTML** | ✅ | Server component fetches first 40 pictures + 40 wallpapers at build time; content is in the initial HTML for crawlers. |
| **Alt text** | ✅ | All gallery layouts use `alt={image.name}`. Name is derived from filename (extension removed, `_`/`-` → space). |
| **Lazy loading** | ✅ | `loading="lazy"` and `decoding="async"` used; good for performance and still crawlable. |
| **Structured data** | ⚠️ | ImageGallery JSON-LD exists but is injected **client-side** (useEffect). Crawlers that don’t run JS may not see it. |
| **Social preview image** | ❌ | No `og:image` or `twitter:image`; card type is `summary` not `summary_large_image`. |
| **Image sitemap** | ❌ | Main sitemap only has `/gallery`; no image sitemap listing image URLs. |
| **Per-image URLs** | ❌ | No dedicated page per image (e.g. `/gallery/image/123`); all images live on one gallery page. |

---

## How search engines find your images

1. **HTML** – Crawlers read `<img src="..." alt="...">` and optional `<figure>`/`<figcaption>`.
2. **Structured data** – JSON-LD `ImageObject` / `ImageGallery` can help Google understand and show images in results (e.g. Google Images).
3. **Image sitemaps** – Listing image URLs (and optional captions) in a sitemap helps discovery, especially when you add many new images (e.g. daily uploads).
4. **Page quality** – Strong page title, meta description, and clear context (e.g. “Islamic images gallery”) help the page and its images rank.

Your images are on **cdn.quran.tj**; that’s fine. Google can index images on a CDN as long as they’re linked from your site and not blocked by robots.txt on the CDN.

---

## Recommendations

### 1. **Structured data in initial HTML (high impact)**

- **Issue:** Gallery JSON-LD is added in the client; some crawlers may not run JS.
- **Fix:** Emit the same ImageGallery (and optionally more ImageObjects) from the **server** in the gallery page so it’s in the first HTML response. Keep the client component only if you need to update it dynamically; otherwise server-only is enough.
- **Result:** Google and others reliably see “this page is an image gallery” and can use it for rich results.

### 2. **Social preview image and Twitter card (high impact)**

- **Issue:** No default image for shares; Twitter uses `summary` (no big image).
- **Fix:** In `app/gallery/layout.tsx` (or via dynamic metadata that has access to the first image), set:
  - `openGraph.images` – at least one image, e.g. first picture from build-time data.
  - `twitter.images` and `twitter.card = 'summary_large_image'`.
- Use a **stable URL** (e.g. first image from your CDN) so shares always show a preview. If the “first” image changes daily, you can either use a fixed “brand” image or accept that the preview will change.

### 3. **Image sitemap (high impact for current + future images)**

- **Issue:** Only the `/gallery` URL is in the sitemap; images are not listed.
- **Fix:** A **separate** script generates the image sitemap:
  - Run: `npm run generate-image-sitemap` (or `node scripts/generate-image-sitemap.js`).
  - It fetches `https://cdn.quran.tj/pictures/list` and `https://cdn.quran.tj/wallpapers/list`, then writes `public/sitemap-images.xml` with:
    - One `<url>` for `https://www.quran.tj/gallery` and many `<image:image>` entries (CDN URL + caption from filename).
  - `robots.txt` references both `sitemap.xml` and `sitemap-images.xml`.
- **Result:** Every current and newly added image is submitted when you re-run the script. For daily uploads, run `npm run generate-image-sitemap` as part of your deploy (e.g. after uploading new images) so new images are included.

### 4. **Better, consistent image “names” (medium impact)**

- **Current:** Name (and thus `alt`) comes only from filename: remove extension, replace `_` and `-` with spaces.
- **Recommendation:**
  - **Short term:** Use **descriptive, keyword-rich filenames** for every new image (Tajik + transliteration if useful), e.g. `dua-qunoot-tajik.jpg`, `ramadan-mubarak-2025.jpg`, `ayatul-kursi-arabic.jpg`. Avoid generic names like `image_001.jpg`.
  - **Long term (optional):** If you add a CMS or API for daily uploads, store a **title** and **short description** per image and use those for `alt`, `<figcaption>`, and sitemap `<image:caption>`/`<image:title>`. Until then, the filename is the main lever for SEO.

### 5. **Semantic HTML (medium impact)** ✅ Done

- **Implemented:** All three gallery layouts use `<figure>` and `<figcaption>` for each image (caption from `image.name`). The gallery block is wrapped in `<section aria-label="...">` for a clear landmark.
- **StandardGalleryLayout:** Figure per thumbnail with a small text caption below; section wraps the grid.
- **GalleryWithTextLayout / GalleryZardevorLayout:** Figure per item with figcaption as the bottom gradient overlay (same visual as before, now semantic).

### 6. **Per-image pages (optional, larger project)**

- **Idea:** Add routes like `/gallery/picture/[slug]` or `/gallery/image/[id]` that show one image with:
  - Unique `<title>` and meta description (e.g. “Dua Qunoot – Islamic image – Quran.tj”).
  - JSON-LD `ImageObject` with `name`, `description`, `contentUrl`.
  - Open Graph/Twitter image pointing to that image.
- **Benefit:** Each image has its own indexable URL and can rank in both web and image search. Best combined with descriptive slugs and metadata from filenames or a backend.

### 7. **CDN and robots**

- Ensure **cdn.quran.tj** is not blocking crawlers (e.g. no `Disallow: /` in its robots.txt if you want those images indexed). Your main site’s `robots.txt` only needs to allow `/` and point to the sitemaps; it doesn’t need to list the CDN.

---

## Checklist for daily/new uploads

- [ ] Use **descriptive filenames** (e.g. `topic-keyword-tajik.jpg`).
- [ ] Re-run **image sitemap** after adding images: `npm run generate-image-sitemap`, then redeploy so new URLs are submitted.
- [ ] If you add metadata (title/description) later, use it for `alt`, captions, and sitemap `<image:caption>`/`<image:title>`.

---

## Summary

- You already have solid basics: server-rendered gallery content, alt from filename, and page-level metadata.
- **Biggest gains:** (1) Server-rendered ImageGallery JSON-LD, (2) og:image + Twitter large image for the gallery, (3) Image sitemap that includes all current and new images and is regenerated when you add daily uploads.
- **Ongoing:** Consistently use descriptive filenames for new images and keep the image sitemap in sync with your CDN list (e.g. by running the build/sitemap step after each batch of uploads).
