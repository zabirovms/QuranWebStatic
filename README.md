# Quran Web Static

A fully static Next.js application for reading the Quran with Tajik translation, ready for deployment to Cloudflare Pages.

## Features

- ✅ Fully static export (6,817 pre-rendered pages)
- ✅ Server-rendered content for SEO
- ✅ Clean URLs without `.html` extensions
- ✅ All dynamic routes pre-rendered at build time
- ✅ Critical content included in initial HTML

## Build

```bash
npm install
npm run build
```

The build outputs to the `out/` directory, ready for Cloudflare Pages deployment.

## Deployment

### Cloudflare Pages

- **Build command:** `npm run build`
- **Build output directory:** `out`
- **Node version:** 18 or 20

The `_redirects` file in `public/` will be automatically copied to `out/` for URL redirects.

## Project Structure

- `app/` - Next.js app directory with pages
- `lib/` - Utilities and data loaders
- `components/` - React components
- `public/` - Static assets and data files
- `out/` - Build output (generated)

## Static Export Configuration

The app is configured for full static export:
- All dynamic routes have `generateStaticParams()`
- Critical pages use server components for initial data
- Client components receive pre-rendered data as props
- All content is included in initial HTML for SEO
