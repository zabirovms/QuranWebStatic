Short answer about Phase 1 and LCP
Just moving data loading into an API is not the optimal LCP fix for a static, mobile‑first site.
It helps by moving heavy JSON parsing off the main thread, but you still:
Pay the network cost twice (HTML + API)
Delay content until the API returns, which is bad for LCP
For best LCP on a static site, the right strategy is:
Precompute data at build time (SSG) or on the server (RSC)
Render LCP content directly in the initial HTML, with no client API calls needed for the first view
Use APIs only for post‑LCP interactions (e.g. search after typing)
Below is a .md version of the plan, adjusted with that in mind and focused on LCP + mobile‑first static.
Performance Refactor Plan (LCP‑Focused, Mobile‑First, Static)
Goals
Keep logic and functionality 100% identical
Maximise LCP and mobile performance:
No extra client‑side data fetching for above‑the‑fold content
Minimal JavaScript on initial load
Heavy JSON loading and processing only:
At build time (SSG) or
On the server (RSC / API) and only after user interaction
Phase 1 – LCP‑First Data Strategy (No Behaviour Changes)
> Focus: ensure the initial page load (especially / and /quran) does not do heavy work in the browser.
1.1 Use server/build‑time data modules for initial render
Current:
Client modules lib/data/verse-data-client.ts and lib/data/surah-data-client.ts load large gzipped JSON files in the browser (or via client utilities).
Target:
For LCP‑critical views, use only server/build‑time modules:
lib/data/verse-data.ts
lib/data/surah-data.ts
These modules:
Run on server or at build time
Produce the exact same Verse/Surah shapes as the client modules.
Why this helps LCP
Above‑the‑fold content is already in the HTML; the browser doesn’t wait for APIs or parse huge JSON blobs before showing it.
1.2 Remove client JSON parsing for initial views
For pages that are part of the LCP path:
/ (home)
/quran
any other landing page linked from outside
Ensure they do not call:
getAllVerses() from verse-data-client
getAllSurahs() from surah-data-client
Instead, they use server‑side equivalents from verse-data.ts / surah-data.ts in:
Server components
generateStaticParams / generateMetadata
Build‑time helpers
Note on APIs in Phase 1
Use APIs only where you cannot avoid client interaction (e.g. search after the user types).
Do not move initial LCP data into /api/... and then fetch from the client for critical content; that improves TBT but often worsens or doesn’t improve LCP.
Phase 2 – /quran Page: Same UX, Server‑Rendered Lists
> Goal: /quran should feel identical but be mostly static HTML on first paint.
2.1 Keep the public behaviour as‑is
Same:
Tabs (surah, juz, page, bookmarks)
Sorting
Links and labels
Only change where the lists are built (server vs client), not how.
2.2 Build surah/juz/page lists on the server
Move the logic that:
Calls getAllSurahs() and getAllVerses()
Builds juzList and pageList
Into a server‑side function that uses lib/data/verse-data.ts and lib/data/surah-data.ts.
Render:
Surah grid
Juz grid
Page grid
directly in the RSC tree (or during static generation), so they are:
Already present in the HTML
Ready before hydration
2.3 Thin client wrapper for interactivity only
Keep 'use client' only around:
Tab state
Sort toggle
Bookmark add/remove behaviour
These client parts operate on data already rendered into the DOM, not fetching/building large datasets.
Result for LCP
Browser receives full surah/juz/page lists in the HTML.
No blocking getAllVerses() on the main thread.
Hydration cost is smaller; mobile devices do less work to reach first usable state.
Phase 3 – Search: Same Results, No Heavy Work Before Typing
> Goal: Search UX remains identical, but heavy work is not on the initial render or main thread.
3.1 Preserve SearchPlaceholder behaviour as spec
Keep:
Query parsing (verse, juz, page, surah name, text)
Same result ranking and limits
Same SearchResult shape and UI.
3.2 Move search computation off the main thread
Implement a server search endpoint (or server action) that:
Uses lib/data/verse-data.ts / lib/data/surah-data.ts.
Runs the same searchSurahs and searchVerses logic.
Returns results in the exact current shape.
Update SearchPlaceholder:
Keep all UI and state logic (focus, debouncing, filters).
For text searches:
Call /api/search (or action) instead of getAllVerses() + local searchVerses.
For direct navigation (e.g. 2:255, ҷузи 6, саҳифаи 9):
Either:
Use tiny metadata embedded in the page (precomputed Juz/page → surah:ayah map), or
Call very small APIs that only return a single verse reference.
LCP impact
Before the user types, none of this runs; the search box is a simple input.
When they type, heavy search work runs on the server, not on the mobile CPU.
Phase 4 – Home Page: Minimal Above‑the‑Fold Data
> Goal: Home page’s hero section + key content load fast on mobile.
4.1 Precompute “featured” data at build time
Replace:
getAllDuas() + .slice(0, 5)
getAllTasbeehs() + .slice(0, 5)
getAllQuotedVerses() + .slice(0, 5)
etc.
With build‑time or static imports that return exactly those subsets:
e.g. getFeaturedDuas(), getFeaturedQuotedVerses(), implemented as direct imports from small JSON files or precomputed arrays.
4.2 Keep full pages separate
Full lists (/duas, /tasbeeh, /quoted-verses, /prophets, /gallery) remain as they are, but:
Data loading moves to server/build‑time modules.
Pages are server components or SSG so that their initial lists are HTML, not API‑driven.
Phase 5 – Gradual Client→Server Conversion of Other Pages
> Each step must keep behaviour identical; only execution place changes.
Audit 'use client' pages:
If a page is mostly static lists/cards, convert it to:
A server component that renders from static/SSR data
With small client islands for any local state (e.g. drawers, dialogs, counters).
Confirm:
Routes and URLs unchanged
Data and HTML output unchanged (aside from unobservable server vs client differences)
Phase 6 – JS & CSS Polish (Optional, Post‑LCP)
After data and layout are server‑side:
Continue converting pure visual hover/press effects to CSS (as you’ve started).
Remove logging in production builds from data loaders.
Re‑run Lighthouse focusing on:
LCP
TBT
Mobile throttling (Slow 4G + Moto G)
Summary related to your concern
Best for LCP and mobile‑first static:
Do not rely on client‑side APIs for initial content.
Render all LCP‑important content with server components / SSG using your existing server data modules.
Use APIs only for post‑interaction concerns like search.
Moving data to an API alone is not enough and may even hurt LCP if the page waits on that API before painting.
The plan above explicitly keeps initial content server‑rendered, with no client API wait for what’s above the fold.
If you want, I can next take one concrete page (e.g. /quran) and draft the exact code changes following this plan, without altering any visible behaviour.