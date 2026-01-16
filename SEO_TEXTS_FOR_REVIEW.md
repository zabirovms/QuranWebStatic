# SEO Texts - For Review and Rewriting

This document contains all SEO-related texts (titles, meta descriptions, Open Graph, Twitter Cards) currently implemented in the project. Review and rewrite these as needed.

---

## 1. Root/Home Page

**File:** `web-static/app/layout.tsx`

**Current Implementation:**
```typescript
title: 'Қуръон бо Тафсири Осонбаён'
description: 'Тарҷума ва тафсири осонбаёни Қуръони Карим бо забони тоҷикӣ'
```

**Current Text:**
- **Title:** `Қуръон бо Тафсири Осонбаён`
- **Description:** `Тарҷума ва тафсири осонбаёни Қуръони Карим бо забони тоҷикӣ`

**Note:** This is the default title/description for pages that don't have their own metadata.

---

## 2. Surah Pages

**File:** `web-static/app/surah/[number]/layout.tsx`

**Template Pattern:**
```typescript
title: `Сураи ${surahName} - Тарҷума ва Тафсири тоҷикӣ`
// With surah data (includes revelation type and order):
description: `Хондани Сураи ${surahName} бо тафсир ва тарҷумаи тоҷикӣ. Ин сура аз ${verseCount} оят иборат буда дар ${revelationType} нозил шудааст. Тартиби нузулаш ${revelationOrder}-умин сура аст. Курони Карим - Тарчумаи точики`
// Without revelation order (if not available):
description: `Хондани Сураи ${surahName} бо тафсир ва тарҷумаи тоҷикӣ. Ин сура аз ${verseCount} оят иборат буда дар ${revelationType} нозил шудааст. Курони Карим - Тарчумаи точики`
// Fallback if surah data not found:
description: `Сураи ${surahName} бо тафсир ва тарҷумаи тоҷикӣ`
```

**Current Text Templates:**

### Title
- **Pattern:** `Сураи {SurahName} - Тарҷума ва Тафсир`
- **Example:** `Сураи Ал-Бақара - Тарҷума ва Тафсир`
- **Example:** `Сураи Ал-Фотиҳа - Тарҷума ва Тафсир`

### Meta Description
- **Pattern (with revelation order):** `Хондани Сураи {SurahName} бо тафсир ва тарҷумаи тоҷикӣ. Ин сура аз {verseCount} оят иборат буда дар {revelationType} нозил шудааст. Тартиби нузулаш {revelationOrder}-умин сура аст. Курони Карим - Тарчумаи точики`
- **Example:** `Хондани Сураи Ал-Бақара бо тафсир ва тарҷумаи тоҷикӣ. Ин сура аз 286 оят иборат буда дар Мадинӣ нозил шудааст. Тартиби нузулаш 87-умин сура аст. Курони Карим - Тарчумаи точики`
- **Pattern (without revelation order):** `Хондани Сураи {SurahName} бо тафсир ва тарҷумаи тоҷикӣ. Ин сура аз {verseCount} оят иборат буда дар {revelationType} нозил шудааст. Курони Карим - Тарчумаи точики`
- **Fallback:** `Сураи {SurahName} бо тафсир ва тарҷумаи тоҷикӣ`
- **Note:** Revelation order is based on Tanzil's chronological order. Revelation type is either "Маккӣ" (Meccan) or "Мадинӣ" (Medinan).

### Open Graph Title
- **Pattern:** `{SurahName} - Қуръон`
- **Example:** `Ал-Бақара - Қуръон`

### Open Graph Description
- Same as meta description

### Twitter Card Title
- **Pattern:** `{SurahName} - Қуръон`
- **Example:** `Ал-Бақара - Қуръон`

### Twitter Card Description
- Same as meta description

---

## 3. Verse Pages

**File:** `web-static/app/surah/[number]/[verseNumber]/layout.tsx`

**Template Pattern:**
```typescript
title: `Сураи ${surahName} ояти ${verseNumber}`
description: `${verseTextPreview} (Қуръон ${surahNumber}:${verseNumber})`
```

**Current Text Templates:**

### Title
- **Pattern:** `{SurahName} {surahNumber}:{verseNumber} - Тарҷума | Қуръон бо Тафсири Осонбаён`
- **Example:** `Ал-Бақара 2:255 - Тарҷума | Қуръон бо Тафсири Осонбаён`
- **Example:** `Ал-Фотиҳа 1:1 - Тарҷума | Қуръон бо Тафсири Осонбаён`

### Meta Description
- **Pattern:** `Оят {verseNumber} аз сураи {SurahName} бо тарҷумаи Pioneers of Translation Center. {verseTextPreview}`
- **Example:** `Оят 255 аз сураи Ал-Бақара бо тарҷумаи Pioneers of Translation Center. Аллоҳу ло илоҳа илла ҳувал-ҳаййул-қаййум...`
- **Note:** `verseTextPreview` is the first 150 characters of the verse translation (tj3 field)

### Open Graph Title
- **Pattern:** `{SurahName} {surahNumber}:{verseNumber} - Тарҷума`
- **Example:** `Ал-Бақара 2:255 - Тарҷума`

### Open Graph Description
- Same as meta description

### Twitter Card Title
- **Pattern:** `{SurahName} {surahNumber}:{verseNumber}`
- **Example:** `Ал-Бақара 2:255`

### Twitter Card Description
- Same as meta description

---

## 4. Structured Data Text

**File:** `web-static/components/StructuredData.tsx`

### Surah Page Structured Data

**Current Text:**
```json
{
  "name": "{surahName}",
  "description": "Сураи {surahName} аз Қуръони Карим"
}
```

**Example:**
- **name:** `Ал-Бақара`
- **description:** `Сураи Ал-Бақара аз Қуръони Карим`

### Verse Page Structured Data

**Current Text:**
```json
{
  "name": "{surahName} {surahNumber}:{verseNumber}",
  "description": "Оят {verseNumber} аз сураи {surahName}"
}
```

**Example:**
- **name:** `Ал-Бақара 2:255`
- **description:** `Оят 255 аз сураи Ал-Бақара`

---

## 5. Summary of All SEO Text Patterns

### Root/Home Page
- **Title:** `Қуръон бо Тафсири Осонбаён`
- **Description:** `Complete Quran in Tajik with translations and tafsir`

### Surah Pages (114 pages)
- **Title:** `Сураи {SurahName} - Қуръони Карим`
- **Description:** `Хондани Сураи {SurahName} бо тафсир ва тарҷумаи тоҷикӣ. Ин сура аз {verseCount} оят иборат буда дар {revelationType} нозил шудааст. Тартиби нузулаш {revelationOrder}-умин сура аст. Курони Карим - Тарчумаи точики`
- **OG Title:** `{SurahName} - Қуръон`
- **Twitter Title:** `{SurahName} - Қуръон`
- **Note:** Includes revelation type (Маккӣ/Мадинӣ) and revelation order (based on Tanzil's chronological order)

### Verse Pages (6,236 pages)
- **Title:** `Сураи {SurahName} ояти {verseNumber}`
- **Description:** `{verseTextPreview} (Қуръон {surahNumber}:{verseNumber})`
- **OG Title:** `Сураи {SurahName} ояти {verseNumber}`
- **Twitter Title:** `Сураи {SurahName} ояти {verseNumber}`
- **Note:** `verseTextPreview` is the first 150 characters of the verse translation (tj3 field)

---

## 6. Variables Used

### Dynamic Variables
- `{surahName}` - Tajik name of the surah (e.g., "Ал-Бақара", "Ал-Фотиҳа")
- `{surahNumber}` - Surah number (1-114)
- `{verseNumber}` - Verse number within the surah
- `{verseCount}` - Total number of verses in the surah
- `{verseTextPreview}` - First 150 characters of verse translation (tj3 field)

### Static Text
- `Қуръон бо Тафсири Осонбаён` - Site name/brand
- `Тарҷума` - Translation
- `Pioneers of Translation Center` - Translation source name
- `Хондани пурраи сураи` - "Reading full surah"
- `Тарҷума ва тафсири осонбаён дар забони тоҷикӣ` - "Translation and easy tafsir in Tajik"
- `Оят ... аз сураи` - "Verse ... from surah"
- `бо тарҷумаи` - "with translation of"

---

## 7. Files to Update When Rewriting

If you rewrite these texts, update them in:

1. **Root Layout:** `web-static/app/layout.tsx` (lines 10-11)
2. **Surah Page Layout:** `web-static/app/surah/[number]/layout.tsx` (lines 18-21, 30, 37)
3. **Verse Page Layout:** `web-static/app/surah/[number]/[verseNumber]/layout.tsx` (lines 23-24, 33, 40)
4. **Structured Data Component:** `web-static/components/StructuredData.tsx` (if you change structured data descriptions)

---

## 8. Notes for Rewriting

### Best Practices
- **Titles:** Keep under 60 characters for optimal display in search results
- **Descriptions:** Keep under 160 characters for optimal display
- **Include keywords:** Surah names, verse numbers, "translation", "Quran"
- **Language:** Currently mixed Tajik and English - consider consistency
- **Brand consistency:** Keep "Қуръон бо Тафсири Осонбаён" consistent across pages

### Current Language Mix
- Titles: Mostly Tajik with English site name
- Descriptions: Mix of Tajik and English
- Translation source: English ("Pioneers of Translation Center")

### Suggestions
- Consider making all text Tajik for consistency
- Or make all SEO text English for broader international reach
- Or create bilingual versions

---

## 9. Other Pages (SEO Metadata Implemented)

**Status:** ✅ All pages now have custom SEO metadata implemented via `layout.tsx` files or `generateMetadata` exports.

### Pages With SEO Metadata

1. **Home Page** (`/`)
   - Route: `web-static/app/page.tsx`
   - **Metadata:** ✅ Implemented
   - **Title:** `Қуръон бо Тафсири Осонбаён`
   - **Description:** `Хондани Қуръони Карим бо тарҷума ва тафсири осонбаён бо забони тоҷикӣ. Дуоҳо, тасбеҳ, номҳои Аллоҳ, паёмбарон ва маводҳои дигари дар вебсайти Quran.tj.`
   - **Canonical:** `https://quran.tj/`

2. **Quran Page** (`/quran/`)
   - Route: `web-static/app/quran/layout.tsx`
   - **Metadata:** ✅ Implemented
   - **Title:** `Қуръон | Роҳнамои Сураҳо, Ҷузъҳо ва Саҳифаҳо`
   - **Description:** `Роҳнамои пурраи Қуръони Карим: рӯйхати 114 сура, 30 ҷузъ ва 604 саҳифа. Навигатсияи осон барои ёфтани сураҳо, ҷузъҳо ва саҳифаҳои муайян.`
   - **Canonical:** `https://quran.tj/quran/`

3. **Duas Menu** (`/duas/`)
   - Route: `web-static/app/duas/layout.tsx`
   - **Metadata:** ✅ Implemented
   - **Title:** `Дуоҳо | Дуоҳои Раббано ва Паёмбарон`
   - **Description:** `Рӯйхати пурраи дуоҳои Раббано ва дуоҳои паёмбарон аз Қуръони Карим. Хондани дуоҳо бо тарҷума ва тафсири осонбаён дар забони тоҷикӣ.`
   - **Canonical:** `https://quran.tj/duas/`

4. **Rabbano Duas** (`/duas/rabbano/`)
   - Route: `web-static/app/duas/rabbano/layout.tsx`
   - **Metadata:** ✅ Implemented
   - **Title:** `Дуоҳои Раббано | Дуоҳое, ки ба "Раббано" оғоз мешаванд`
   - **Description:** `Рӯйхати пурраи дуоҳои Раббано аз Қуръони Карим. Дуоҳое, ки ба калимаи "Раббано" оғоз мешаванд бо тарҷума ва тафсири осонбаён.`
   - **Canonical:** `https://quran.tj/duas/rabbano/`

5. **Prophets Duas** (`/duas/prophets/`)
   - Route: `web-static/app/duas/prophets/layout.tsx`
   - **Metadata:** ✅ Implemented
   - **Title:** `Дуоҳои Паёмбарон | Дуоҳои паёмбарон дар Қуръон`
   - **Description:** `Рӯйхати пурраи дуоҳои паёмбарон аз Қуръони Карим. Дуоҳои Муҳаммад (с), Иброҳим, Мусо, Исо ва дигар паёмбарон бо тарҷума ва тафсири осонбаён.`
   - **Canonical:** `https://quran.tj/duas/prophets/`

6. **Prophet Dua Detail** (`/duas/prophets/detail/?name=...`)
   - Route: `web-static/app/duas/prophets/detail/layout.tsx` + `page.tsx` (DynamicMetadata)
   - **Metadata:** ✅ Implemented (indexable with dynamic metadata)
   - **Title:** `Дуоҳои {Prophet Name} | Дуоҳои паёмбар дар Қуръон` (dynamic, uses actual prophet name)
   - **Description:**
     - With data: `Дуоҳои паёмбар {Prophet Name} дар Қуръони Карим. Рӯйхати пурраи {duaCount} дуоҳое, ки {Prophet Name} дар {surahCount} сураи Қуръон кардаанд. Хондани дуоҳои {Prophet Name} бо тарҷума ва тафсири осонбаён дар забони тоҷикӣ.`
     - With dua count only: `Дуоҳои паёмбар {Prophet Name} дар Қуръони Карим. Рӯйхати пурраи {duaCount} дуоҳое, ки {Prophet Name} дар Қуръон кардаанд. Хондани дуоҳои {Prophet Name} бо тарҷума ва тафсири осонбаён.`
     - Fallback: `Дуоҳои паёмбар {Prophet Name} дар Қуръон. Рӯйхати дуоҳое, ки {Prophet Name} дар Қуръони Карим кардаанд бо тарҷума ва тафсири осонбаён.`
   - **Robots:** `index, follow` (fully indexable)
   - **Canonical:** `https://quran.tj/duas/prophets/detail/?name={prophetName}` (dynamic, includes encoded prophet name)
   - **Note:** Uses client-side DynamicMetadata component to update metadata with actual prophet name and specific details (dua count, surah count)

7. **Tasbeeh Page** (`/tasbeeh/`)
   - Route: `web-static/app/tasbeeh/layout.tsx`
   - **Metadata:** ✅ Implemented
   - **Title:** `Тасбеҳ | Шумориши тасбеҳ ва зикр`
   - **Description:** `Шумориши тасбеҳ ва зикрҳои муқарраршуда. Тасбеҳи дигиталӣ барои зикрҳои рӯзона ва тасбеҳҳои махсус.`
   - **Canonical:** `https://quran.tj/tasbeeh/`

8. **Asmaul Husna** (`/asmaul-husna/`)
   - Route: `web-static/app/asmaul-husna/layout.tsx`
   - **Metadata:** ✅ Implemented
   - **Title:** `Асмоул Ҳусно | 99 Номи Аллоҳ`
   - **Description:** `Рӯйхати пурраи 99 номи зебои Аллоҳ (Асмоул Ҳусно) бо тарҷума ва тафсири осонбаён дар забони тоҷикӣ.`
   - **Canonical:** `https://quran.tj/asmaul-husna/`

9. **Prophets Page** (`/prophets/`)
   - Route: `web-static/app/prophets/layout.tsx`
   - **Metadata:** ✅ Implemented
   - **Title:** `Паёмбарон | Рӯйхати паёмбарон дар Қуръон`
   - **Description:** `Рӯйхати пурраи паёмбарон, ки дар Қуръони Карим зикр шудаанд: Муҳаммад (с), Иброҳим, Мусо, Исо, Нӯҳ, Юсуф ва дигарон. Таърих ва қиссаҳои паёмбарон бо тафсири осонбаён.`
   - **Canonical:** `https://quran.tj/prophets/`

10. **Prophet Detail** (`/prophets/detail/?name=...`)
    - Route: `web-static/app/prophets/detail/layout.tsx` + `page.tsx` (DynamicMetadata)
    - **Metadata:** ✅ Implemented (indexable with dynamic metadata)
    - **Title:** `{Prophet Name} | Паёмбар дар Қуръон` (dynamic, uses actual prophet name)
    - **Description:** 
      - With data: `Тафсилоти паёмбар {Prophet Name} дар Қуръони Карим. Оятҳо, қиссаҳо ва таърихи {Prophet Name}. {Prophet Name} дар {surahCount} сура ва {verseCount} оят зикр шудааст. Маълумоти пурра дар бораи {Prophet Name} дар Қуръон бо тарҷума ва тафсири осонбаён.`
      - With summary: `Тафсилоти паёмбар {Prophet Name} дар Қуръони Карим. {summaryText}. Оятҳо, қиссаҳо ва таърихи {Prophet Name} бо тарҷума ва тафсири осонбаён дар забони тоҷикӣ.`
      - Fallback: `Тафсилоти паёмбар {Prophet Name} дар Қуръон. Оятҳо, қиссаҳо ва таърихи {Prophet Name} бо тарҷума ва тафсири осонбаён.`
    - **Robots:** `index, follow` (fully indexable)
    - **Canonical:** `https://quran.tj/prophets/detail/?name={prophetName}` (dynamic, includes encoded prophet name)
    - **Note:** Uses client-side DynamicMetadata component to update metadata with actual prophet name and specific details (surah count, verse count)

11. **Quoted Verses** (`/quoted-verses/`)
    - Route: `web-static/app/quoted-verses/layout.tsx`
    - **Metadata:** ✅ Implemented
    - **Title:** `Иқтибос аз Қуръон | Оятҳои машҳур ва иқтибосшуда`
    - **Description:** `Рӯйхати оятҳои машҳур ва иқтибосшуда аз Қуръони Карим. Оятҳое, ки дар ҳаёти рӯзона ва дар маҷлисҳо зикр мешаванд бо тарҷума ва тафсири осонбаён.`
    - **Canonical:** `https://quran.tj/quoted-verses/`

12. **Qaida Page** (`/qaida/`)
    - Route: `web-static/app/qaida/layout.tsx`
    - **Metadata:** ✅ Implemented
    - **Title:** `Қоида | Омӯзиши хондани Қуръон`
    - **Description:** `Омӯзиши асосии хондани Қуръон: ҳарфҳо, ҳаракатҳо, таҷвид ва қоидаҳои асосии хондани Қуръони Карим.`
    - **Canonical:** `https://quran.tj/qaida/`

13. **Qaida Lesson** (`/qaida/lesson/[lessonId]/`)
    - Route: `web-static/app/qaida/lesson/[lessonId]/layout.tsx`
    - **Metadata:** ✅ Implemented (dynamic)
    - **Title:** `Дарси {lessonId} | Қоида`
    - **Description:** `Дарси {lessonId} аз қоидаи хондани Қуръон. Омӯзиши ҳарфҳо, ҳаракатҳо ва қоидаҳои асосии хондани Қуръони Карим.`
    - **Canonical:** `https://quran.tj/qaida/lesson/{lessonId}/`

14. **Vocabulary Page** (`/vocabulary/`)
    - Route: `web-static/app/vocabulary/layout.tsx`
    - **Metadata:** ✅ Implemented
    - **Title:** `Луғат | Омӯзиши калимаҳои Қуръон`
    - **Description:** `Омӯзиши калимаҳои асосии Қуръони Карим. Луғат, тарҷума ва тафсири калимаҳои муҳим бо роҳҳои осонбаён.`
    - **Canonical:** `https://quran.tj/vocabulary/`

15. **Vocabulary Lesson** (`/vocabulary/lesson/[lessonId]/`)
    - Route: `web-static/app/vocabulary/lesson/[lessonId]/layout.tsx`
    - **Metadata:** ✅ Implemented (dynamic)
    - **Title:** `Дарси {lessonId} | Луғат`
    - **Description:** `Дарси {lessonId} аз луғати Қуръон. Омӯзиши калимаҳои асосии Қуръони Карим бо тарҷума ва тафсири осонбаён.`
    - **Canonical:** `https://quran.tj/vocabulary/lesson/{lessonId}/`

16. **Search Page** (`/search/`)
    - Route: `web-static/app/search/layout.tsx`
    - **Metadata:** ✅ Implemented (noindex)
    - **Title:** `Ҷустуҷӯ | Ҷустуҷӯи оятҳо ва калимаҳо дар Қуръон`
    - **Description:** `Ҷустуҷӯи оятҳо, калимаҳо ва мавзӯъҳо дар Қуръони Карим. Ёфтани оятҳои муайян бо роҳҳои осон.`
    - **Robots:** `noindex, follow` (dynamic search results)
    - **Canonical:** `https://quran.tj/search/`

17. **Bookmarks Page** (`/bookmarks/`)
    - Route: `web-static/app/bookmarks/layout.tsx`
    - **Metadata:** ✅ Implemented (noindex)
    - **Title:** `Хатҳо | Хатҳои шумо`
    - **Description:** `Хатҳои шумо дар Қуръон. Рӯйхати оятҳое, ки шумо хат кардаед.`
    - **Robots:** `noindex, follow` (user-specific content)
    - **Canonical:** `https://quran.tj/bookmarks/`

18. **Settings Page** (`/settings/`)
    - Route: `web-static/app/settings/layout.tsx`
    - **Metadata:** ✅ Implemented (noindex)
    - **Title:** `Танзимот | Танзимоти барнома`
    - **Description:** `Танзимоти барнома: забон, овоз, тарҷума ва дигар хусусиятҳо.`
    - **Robots:** `noindex, follow` (user settings page)
    - **Canonical:** `https://quran.tj/settings/`

19. **Audio Home** (`/audio-home/`)
    - Route: `web-static/app/audio-home/layout.tsx`
    - **Metadata:** ✅ Implemented
    - **Title:** `Овози Қуръон | Китобхонаи таҷвид ва тартил`
    - **Description:** `Китобхонаи пурраи овози Қуръон бо таҷвид ва тартил. Гӯш кардани Қуръон бо овозхонҳои машҳури ҷаҳон.`
    - **Canonical:** `https://quran.tj/audio-home/`

20. **All Reciters** (`/audio-home/all-reciters/`)
    - Route: `web-static/app/audio-home/all-reciters/layout.tsx`
    - **Metadata:** ✅ Implemented
    - **Title:** `Ҳамаи Овозхонҳо | Рӯйхати овозхонҳои Қуръон`
    - **Description:** `Рӯйхати пурраи овозхонҳои машҳури Қуръон. Овозхонҳое, ки таҷвид ва тартили Қуръонро мехонанд.`
    - **Canonical:** `https://quran.tj/audio-home/all-reciters/`

21. **Audio Library** (`/audio-home/library/`)
    - Route: `web-static/app/audio-home/library/layout.tsx`
    - **Metadata:** ✅ Implemented (noindex)
    - **Title:** `Китобхона | Китобхонаи овози шумо`
    - **Description:** `Китобхонаи овози шумо. Рӯйхати овозҳое, ки шумо интихоб кардаед.`
    - **Robots:** `noindex, follow` (user-specific library)
    - **Canonical:** `https://quran.tj/audio-home/library/`

22. **Audio Player** (`/audio-home/player/`)
    - Route: `web-static/app/audio-home/player/layout.tsx`
    - **Metadata:** ✅ Implemented (noindex)
    - **Title:** `Плеер | Плеери овози Қуръон`
    - **Description:** `Плеери овози Қуръон. Гӯш кардани таҷвид ва тартил.`
    - **Robots:** `noindex, follow` (UI-only player interface)
    - **Canonical:** `https://quran.tj/audio-home/player/`

23. **Reciter Page** (`/audio-home/reciter/[reciterId]/`)
    - Route: `web-static/app/audio-home/reciter/[reciterId]/layout.tsx`
    - **Metadata:** ✅ Implemented (noindex)
    - **Title:** `Овозхон | Китобхонаи овози Қуръон`
    - **Description:** `Китобхонаи овози Қуръон бо овозхон. Гӯш кардани таҷвид ва тартил.`
    - **Robots:** `noindex, follow` (UI-only navigation page)
    - **Canonical:** `https://quran.tj/audio-home/`

24. **Gallery Page** (`/gallery/`)
    - Route: `web-static/app/gallery/layout.tsx`
    - **Metadata:** ✅ Implemented
    - **Title:** `Галерея | Тасвирҳои динӣ ва Қуръон`
    - **Description:** `Галереяи тасвирҳои динӣ, калиграфияҳои Қуръонӣ ва тасвирҳои машҳур дар бораи Қуръон ва ислом.`
    - **Canonical:** `https://quran.tj/gallery/`

25. **Learn Words** (`/learn-words/`)
    - Route: `web-static/app/learn-words/layout.tsx`
    - **Metadata:** ✅ Implemented
    - **Title:** `Омӯзиши Калимаҳо | Омӯзиши калимаҳои Қуръон`
    - **Description:** `Омӯзиши калимаҳои асосии Қуръони Карим бо роҳҳои интерактивӣ. Омӯзиши луғат ва маъноҳои калимаҳои муҳим.`
    - **Canonical:** `https://quran.tj/learn-words/`

26. **Scheduler** (`/scheduler/`)
    - Route: `web-static/app/scheduler/layout.tsx`
    - **Metadata:** ✅ Implemented (noindex)
    - **Title:** `Барнома | Барномаи хондани Қуръон`
    - **Description:** `Барномаи хондани Қуръон. Ташкил кардани барномаи хондани сураҳо ва оятҳо.`
    - **Robots:** `noindex, follow` (user-specific scheduling)
    - **Canonical:** `https://quran.tj/scheduler/`

27. **Live Stream** (`/live/[streamId]/`)
    - Route: `web-static/app/live/[streamId]/layout.tsx`
    - **Metadata:** ✅ Implemented (noindex)
    - **Title:** `Пахши зинда | Пахши динӣ`
    - **Description:** `Пахши зиндаи динӣ. Тамошои пахшҳои динӣ ва таълимоти исломӣ.`
    - **Robots:** `noindex, follow` (temporary/streaming content)
    - **Canonical:** `https://quran.tj/`

28. **YouTube Video** (`/youtube/[videoId]/`)
    - Route: `web-static/app/youtube/[videoId]/layout.tsx`
    - **Metadata:** ✅ Implemented (noindex)
    - **Title:** `Видео | Видеои динӣ`
    - **Description:** `Тамошои видеои динӣ ва таълимоти исломӣ.`
    - **Robots:** `noindex, follow` (external YouTube content)
    - **Canonical:** `https://quran.tj/`

### Summary

- **Indexable Pages:** 20 pages with full SEO metadata (home, quran, duas, tasbeeh, asmaul-husna, prophets, quoted-verses, qaida, vocabulary, gallery, learn-words, audio-home, all-reciters)
- **Dynamic Indexable Pages:** 4 page types with dynamic metadata:
  - Qaida lessons (`/qaida/lesson/[lessonId]/`)
  - Vocabulary lessons (`/vocabulary/lesson/[lessonId]/`)
  - Prophet detail (`/prophets/detail/?name=...`) - uses client-side DynamicMetadata
  - Prophet dua detail (`/duas/prophets/detail/?name=...`) - uses client-side DynamicMetadata
- **Noindex Pages:** 8 pages marked as noindex (search, bookmarks, settings, audio-library, audio-player, reciter-detail, live-stream, youtube-video)
- **All pages have:** Canonical URLs, Open Graph tags, Twitter Card tags

---

**Total SEO Text Locations:**
- 1 Root page (default metadata)
- 1 Home page (✅ custom metadata)
- 114 Surah pages (✅ has metadata)
- 6,236 Verse pages (✅ has metadata)
- 20 Static other pages (✅ has metadata)
- 2 Dynamic page types (✅ has metadata)
- **Total: ~6,374 pages with custom SEO metadata**

