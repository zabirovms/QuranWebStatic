# Setup Instructions

## Prerequisites

- Node.js 18+ and npm

## Initial Setup

1. **Install dependencies:**
   ```bash
   cd web-static
   npm install
   ```

2. **Data files:**
   
   All required data files are already in `web-static/public/data/`. If you need to update them, place the following files in `public/data/`:
   
   Required files:
   - `alquran_cloud_complete_quran.json.gz`
   - `quran_mirror_with_translations.json.gz`
   - `quran_tj_2_AbuAlomuddin.json.gz`
   - `quran_tj_3_PioneersTranslationCenter.json.gz`
   - `quran_farsi_Farsi.json.gz`
   - `quran_ru.json.gz`
   - `quranic_duas.json.gz`
   - `tasbeehs.json.gz`
   - `Prophets.json.gz`
   - `most_quoted_verses.json.gz`
   - `99_Names_Of_Allah.json.gz`

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```
   
   This generates a fully static site in the `out` directory.

## Project Structure

```
web-static/
├── app/                    # Next.js app directory (pages)
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── surah/              # Surah pages
│       └── [number]/
│           ├── page.tsx    # Surah detail page
│           └── verse/
│               └── [verseNumber]/
│                   └── page.tsx  # Verse detail page
├── lib/
│   ├── data/               # Data loading functions
│   ├── types/              # TypeScript type definitions
│   └── utils/               # Utility functions
├── public/
│   └── data/                # Compressed JSON data files
└── scripts/                 # Setup scripts
```

## Features Implemented

- ✅ Home page with all surahs
- ✅ Surah detail pages with all verses
- ✅ Verse detail pages
- ✅ Static site generation (SSG)
- ✅ SEO optimization (meta tags)
- ✅ RTL support for Arabic/Tajik text

## Features To Be Implemented

- [ ] Duas pages
- [ ] Tasbeeh pages
- [ ] Prophets pages
- [ ] Asmaul Husna page
- [ ] Search functionality
- [ ] Audio player
- [ ] Theme support
- [ ] Sitemap generation
- [ ] Structured data (JSON-LD)

