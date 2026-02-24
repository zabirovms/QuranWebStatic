# QPC-V4 (qpc-v4.json) — What It Is and What You Can Do

## What is it?

**qpc-v4.json** is a **word-by-word Quran script in V4 Glyphs (With Tajweed)** format, aligned with the [Quranic Universal Library (QUL) resource 47](https://qul.tarteel.ai/resources/quran-script/47).

- **Format**: One JSON object; keys are word locations `surah:ayah:word` (e.g. `"1:1:1"`, `"2:255:3"`).
- **Value per key**: `{ id, surah, ayah, word, location, text }`
  - `text`: a **single Unicode glyph** (e.g. U+F741). Each word is one glyph in the **p574-v4-tajweed** (QCF V4) font.
- **Font**: Rendered with **p574-v4-tajweed** (Quran Foundation: **QCF V4 Tajweed**). Without this font, glyphs show as empty squares or wrong characters.

So: it’s a **glyph-based**, **word-keyed** Quran text with Tajweed, not plain Arabic Unicode.

## Relation to QUL resource 47

- **QUL 47** is verse-keyed: key `"1:1"` → full verse text + `words[]` with Unicode word text.
- **Your qpc-v4.json** is word-keyed: key `"1:1:1"` → one word entry whose `text` is the **V4 glyph** for that word. Same script type (V4 Tajweed), different keying (verse vs word).

## What you can do with it

1. **Show Quran with Tajweed colors**  
   Use V4 Tajweed fonts (e.g. from [Quran Foundation CDN](https://api-docs.quran.foundation/docs/tutorials/fonts/font-rendering/)) and render each word’s `text` with that font (e.g. `innerHTML` / `dangerouslySetInnerHTML`).

2. **Word-by-word features**  
   Keys are word locations, so you can:
   - Highlight or underline a specific word.
   - Link each word to word-by-word audio (e.g. using `location` like `1:1:1` with your reciter timestamp data).

3. **Use as a script option in your app**  
   Keep your current Uthmani/other script for default view; add a “V4 Tajweed” option that uses qpc-v4.json + V4 fonts.

4. **Build verses from words**  
   Group by `surah:ayah` (e.g. all keys `1:1:*`), sort by `word`, concatenate each entry’s `text` (with spaces) and render with the V4 font to get full-verse Tajweed display.

## Font loading (for web)

- V4 Tajweed fonts are **per Mushaf page** (1–604). Example CDN (Quran Foundation):
  - COLRv1 (Chrome, Safari, Edge):  
    `https://verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p{PAGE}.woff2`
  - For Surah Al-Fatiha (page 1): use `p1.woff2` and set `font-family: p1-v4` (or equivalent) when rendering.
- Render glyphs with **innerHTML** (or React `dangerouslySetInnerHTML`), not `textContent`, so the special Unicode glyphs display correctly.

See the standalone **qpc-v4-preview.html** for a minimal working example using page-1 font and Al-Fatiha.

---

## Why rectangles? Codepoint mismatch (local font vs qpc-v4)

**Root cause:** Your local font **woff2/p1.woff2** (internal name **QCF4001_COLOR**) does **not** use the same Unicode codepoints as **qpc-v4.json**.

| Source | Codepoint range | Block |
|--------|-----------------|--------|
| **qpc-v4.json** | U+F741, U+F742, … (PUA) | Private Use Area (U+E000–U+F8FF) |
| **Your font (QCF4001_COLOR)** | U+FC41, U+FC42, … | Arabic Presentation Forms-A (U+FC00–U+FDFF) |

The font has **44 glyphs** at **U+FC41–U+FC64** (and a few control/space codepoints). It has **no** glyphs in the PUA. So when the page renders qpc-v4’s U+F741 with this font, the font has no glyph for that codepoint → the browser shows the “missing glyph” shape (rectangle).

**Fix:** Remap qpc-v4 codepoints to the font’s codepoints when using this font: **add 0x500** (e.g. U+F741 → U+FC41). The preview HTML does this so the same qpc-v4 data displays correctly with **woff2/p1.woff2**.

**To inspect your font:** run `node scripts/inspect-woff2-cmap.js` to list the font’s codepoints and confirm it has no U+F741+.
