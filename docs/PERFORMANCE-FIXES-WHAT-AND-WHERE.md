# Performance: What and Where to Fix

Target: PageSpeed mobile 48, LCP 26.7s, TBT 1,630ms, 12.6 MB payload, 17 long tasks, 1,936 non-composited animations.

---

## 1. LCP (Largest Contentful Paint) – ~26.7s

### 1.1 Hero image (likely LCP element)

| Where | What to fix |
|-------|-------------|
| **`app/page.tsx`** ~515–526 | Hero uses `<img src="/alquran.svg" fetchPriority="high">`. Add **preload** in document head so the image starts loading before parser reaches it. |
| **`app/layout.tsx`** | Add `<link rel="preload" href="/alquran.svg" as="image">` in `<head>` (e.g. via metadata or a small head component). Only do this on the homepage or use a route-aware layout so other routes don’t preload this. |
| **`app/page.tsx`** | Prefer **`next/image`** with `priority` for the hero image so Next can optimize and prioritize it (with `next.config.js` `images.unoptimized: true` it still helps with loading priority). If you keep `<img>`, keep `fetchPriority="high"` and ensure preload. |

### 1.2 Render-blocking resources

| Where | What to fix |
|-------|-------------|
| **`app/layout.tsx`** line 3 | `import './globals.css'` – single large CSS file blocks first paint. Consider: (a) splitting critical above-the-fold CSS (hero, TopBar, base tokens) from the rest and inlining or loading critical first; (b) deferring non-critical CSS (e.g. `media="print" onload="this.media='all'"` or load below-fold styles later). |
| **`next.config.js`** | No bundle analyzer. Add `@next/bundle-analyzer` in dev to see which chunks are large and split heavy screens (e.g. settings, gallery, audio-home) into separate chunks if not already. |

---

## 2. TBT (Total Blocking Time) / Long tasks

### 2.1 Homepage data (server)

| Where | What to fix |
|-------|-------------|
| **`lib/data/home-featured.ts`** | `getHomeFeaturedContent()` runs **7 parallel data fetches** (getAllDuas, getAllTasbeehs, getAllQuotedVerses, getAllAsmaulHusna, getProphetSummaries, getAllLiveStreams, getAllSurahs). Only small slices are used (e.g. 5, 5, 5, 10, 8). **Fix:** Fetch only the slice needed per section (e.g. “top 5 quoted verses”, “top 8 prophets”) via dedicated functions that read minimal data, instead of loading full datasets and slicing in JS. That reduces server work and size of data serialized into the page. |
| **`app/page.tsx`** ~1069 | `<AllSurahsList surahs={allSurahs} />` – **114 surahs** kept in HTML for accessibility/SEO. **Fix (done):** Render in a lightweight way: CSS-only hover (class `surahs-grid-link`) and explicit composited transitions (transform, box-shadow, border-color, background-color); no inline onMouseEnter/onMouseLeave or `transition: all`. |

### 2.2 Layout and global components

| Where | What to fix |
|-------|-------------|
| **`app/layout.tsx`** | TopBar, Footer, MainContentWrapper are always mounted. TopBar already defers drawer open and lazy-mounts drawers. **Optional:** Lazy-load Footer below the fold (e.g. dynamic import with no SSR) so it doesn’t block first paint. |
| **`components/MainContentWrapper.tsx`** | If it does any layout (e.g. getBoundingClientRect) on mount or scroll, defer or throttle and avoid setState in hot paths. |

### 2.3 Forced reflow (layout thrashing)

| Where | What to fix |
|-------|-------------|
| **`lib/services/settings-service.ts`** ~309 | `void document.documentElement.offsetHeight` forces a reflow after setting `data-theme`. **Fix:** Remove this line. Theme is applied via attribute and CSS variables; a reflow is not required for correctness and it adds cost. |
| **`app/surah/[number]/page-client.tsx`** | Scroll handler already throttled; any remaining `getBoundingClientRect` or offset reads in the same frame as DOM writes can cause thrashing. **Fix:** Ensure all layout reads happen in one batch, then all writes (or use a single requestAnimationFrame that reads first, then updates state). |
| **`components/TranslationDropdown.tsx`** | Uses `getBoundingClientRect` for positioning. **Fix:** Defer positioning until after open (e.g. requestAnimationFrame after setState(true)) and avoid repeated reads during resize/scroll; cache rect and update on open only. |

### 2.4 Heavy client components on homepage

| Where | What to fix |
|-------|-------------|
| **`app/page.tsx`** | Many sections (Featured surahs, Quoted verses, Duas, Tasbeehs, Asmaul Husna, Prophets, Live streams, Prayer times, YouTube, Hadith, Gallery, All surahs) render on first load. **Fix:** Wrap below-the-fold sections in `dynamic(..., { ssr: false })` with a simple loading placeholder (some already are). Ensure **AllSurahsList** is dynamic and only mounts when in view or after a short delay so 114 items don’t all mount at once. |
| **`components/AllSurahsList.tsx`** | Renders 114 links. **Fix (done):** Use CSS class `surahs-grid-link` for hover and transitions; no inline onMouseEnter/onMouseLeave; explicit `transition: transform, box-shadow, border-color, background-color` in globals.css. |

---

## 3. Payload (12.6 MB)

| Where | What to fix |
|-------|-------------|
| **Homepage HTML** | Server sends full `getHomeFeaturedContent()` result (allSurahs, displayDuas, displayTasbeehs, etc.) in the page. **Fix:** Reduce server payload by fetching only needed slices (see 2.1) and by not embedding all 114 surahs in the initial document (see 2.1 / 2.4). |
| **`public/`** | Check size of `/alquran.svg` and other hero images. Optimize SVGs (minify, reduce paths) and consider a smaller LCP image for mobile (e.g. responsive `srcset` or different asset for small viewports). |
| **JS bundles** | Use `@next/bundle-analyzer` to find large dependencies. Lazy-load routes/screens that aren’t needed for first paint (e.g. settings, gallery, audio-home). Ensure dynamic imports are used for heavy components (SearchPlaceholder, PrayerTimesSection, YouTubeVideosSection, HadithSection, GallerySection, AllSurahsList are already dynamic). |

---

## 4. Non-composited animations (1,936)

Animations that change layout or paint (e.g. `top`, `left`, `width`, `height`, `box-shadow`, `border`, `background`) instead of only `transform`/`opacity` cause extra work.

### 4.1 Use only composited properties where possible

| Where | What to fix |
|-------|-------------|
| **`app/globals.css`** ~578 | `.app-bar`: `transition: top 0.3s ease-in-out` – animating `top` is non-composited. **Fix:** Prefer `transform: translateY(...)` for show/hide (e.g. top: 0 → translateY(0), hidden → translateY(-100%)) and transition `transform`. |
| **`app/globals.css`** ~646, ~739 | `.btn` and other: `transition: all var(--transition-base)`. **Fix:** Replace with explicit properties, e.g. `transition: background-color, color, box-shadow var(--transition-base)` and avoid transitioning layout (width, height, margin, padding). |
| **`components/AllSurahsList.tsx`** ~41 | Each of 114 links: `transition: 'all 0.2s ease'`. **Fix:** Use `transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease` (no `all`) and move hover styles to CSS class so no inline style transitions. |

### 4.2 Reduce number of animated elements

| Where | What to fix |
|-------|-------------|
| **Homepage** | Many cards (Featured surahs, Quoted verses, Duas, Tasbeehs, Prophets, Live streams, All surahs grid) use hover transitions. **Fix:** Keep hover effects but ensure they use only `transform` and `opacity` (and minimal `box-shadow` if needed). Prefer CSS-based hover (e.g. `.hoverable-card:hover`) instead of inline styles so the engine can optimize. |
| **`app/globals.css`** | `.hoverable-card` and `.surah-card-hoverable` already use `transform, box-shadow, border-color` – good. Remove any remaining `transition: all` in globals and in component inline styles. |

---

## 5. Quick checklist (file → action)

| File | Action |
|------|--------|
| **`app/layout.tsx`** | **Done:** Preload for `/alquran.svg` in `<head>`. Consider critical CSS split. |
| **`app/page.tsx`** | **Done:** Hero uses `next/image` with `priority` and `fill`; preload in layout. |
| **`lib/data/home-featured.ts`** | Fetch only needed slices (e.g. “top 5 quoted”, “top 8 prophets”) instead of full datasets. |
| **`app/page.tsx`** | Don’t pass full `allSurahs` to AllSurahsList; load surah list client-side when section is near viewport or use a minimal server payload. |
| **`lib/services/settings-service.ts`** | **Done:** Removed forced reflow (`offsetHeight`). |
| **`components/AllSurahsList.tsx`** | **Done:** CSS class `surahs-grid-link`, no inline hover handlers, explicit transitions. |
| **`app/globals.css`** | **Done:** `.app-bar` uses `transform`; `.btn` and `.surah-card` use explicit transition properties. |
| **`components/TranslationDropdown.tsx`** | Defer getBoundingClientRect until after open; avoid repeated layout reads. |
| **`next.config.js`** | **Done:** Bundle analyzer with `ANALYZE=true`; run `npm run build:analyze` to open report. |
| **`public/alquran.svg`** | **Done:** Optional script `npm run optimize:svgs` (uses svgo) to minify SVGs in public. |

---

## 6. Priority order

1. **LCP:** Preload hero image + prefer `next/image` with priority; reduce blocking CSS.
2. **Payload:** Slice homepage data where possible; surah list kept in HTML by design, rendered lightweight (CSS-only hover, composited transitions).
3. **TBT:** Remove forced reflow in settings-service; ensure AllSurahsList and TranslationDropdown don’t do redundant layout reads.
4. **Animations:** Replace `transition: top` with `transform` on .app-bar; replace `transition: all` with explicit properties and use CSS hover for AllSurahsList.

Implementing 1 and 2 should have the largest impact on mobile PageSpeed and LCP; then 3 and 4 for TBT and animation cost.
