# Deployment Guide

This guide covers the deployment process for the Quran Web Static site to Cloudflare Pages.

## Pre-Deployment Checklist

- [x] ✅ Static export configured
- [x] ✅ No server-side dependencies
- [x] ✅ No exposed secrets
- [x] ✅ .gitignore properly configured
- [x] ✅ Console.logs removed in production builds
- [x] ✅ robots.txt created
- [x] ✅ sitemap.xml generator script created

## Build Process

The build process automatically:
1. Generates `sitemap.xml` in the `public/` directory
2. Builds the Next.js static site to the `out/` directory
3. Removes console.log statements (keeps console.error and console.warn)

### Manual Build

```bash
cd web-static
npm install
npm run build
```

The static site will be generated in `web-static/out/`.

### Build Scripts

- `npm run build` - Full build with sitemap generation
- `npm run build:no-sitemap` - Build without sitemap (for testing)
- `npm run generate-sitemap` - Generate sitemap only
- `npm run dev` - Development server

## Cloudflare Pages Deployment

### Step 1: Connect Repository

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Pages**
2. Click **"Create a project"** → **"Connect to Git"**
3. Select your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Cloudflare to access your repository
5. Select your repository

### Step 2: Configure Build Settings

Configure the following settings in Cloudflare Pages:

- **Framework preset:** `Next.js (Static HTML Export)` or `None`
- **Build command:** `cd web-static && npm install && npm run build`
- **Build output directory:** `web-static/out`
- **Root directory:** `/` (leave empty or set to root)
- **Node version:** `18` or `20` (recommended: 18)

### Step 3: Environment Variables

**No environment variables are required** - all services are publicly accessible.

If you need to add environment variables later:
- Go to your project → **Settings** → **Environment variables**
- Add variables as needed (they will be available during build)

### Step 4: Deploy

1. Click **"Save and Deploy"**
2. Cloudflare will:
   - Install dependencies
   - Run the build command (which generates sitemap and builds the site)
   - Deploy the static files from `web-static/out/`
3. Your site will be available at `https://your-project.pages.dev`

### Step 5: Custom Domain (Optional)

1. Go to your project → **Custom domains**
2. Click **"Set up a custom domain"**
3. Enter your domain (e.g., `quran.tj`)
4. Follow DNS configuration instructions
5. Cloudflare will automatically provision SSL certificates

### Automatic Deployments

Cloudflare Pages automatically deploys:
- **Production:** Every push to your default branch (usually `main` or `master`)
- **Preview:** Every pull request gets a preview deployment URL

You can also trigger manual deployments from the Cloudflare dashboard.

## Generated Files

### robots.txt
- Location: `public/robots.txt`
- Automatically included in build output
- Allows all search engines to index the site
- Points to sitemap at `/sitemap.xml`

### sitemap.xml
- Location: `public/sitemap.xml`
- Generated automatically before each build
- Includes all static routes and all 114 surah pages
- Total: 135 URLs

**To regenerate manually:**
```bash
cd web-static
npm run generate-sitemap
```

## Production Optimizations

### Console Log Removal
- `console.log` statements are automatically removed in production builds
- `console.error` and `console.warn` are kept for error tracking
- Configured in `next.config.js` using Next.js compiler options

### Static Export
- All pages are pre-rendered at build time
- No server-side rendering required
- Fully static HTML, CSS, and JavaScript

### Image Optimization
- Images are set to `unoptimized: true` (required for static export)
- Consider using Cloudflare Images or similar CDN for dynamic optimization

## Troubleshooting

### Build Fails
- Ensure Node.js version 18 or 20 is used
- Run `npm ci` to ensure clean install
- Check that all data files exist in `public/data/`

### Sitemap Not Generated
- Run `npm run generate-sitemap` manually
- Check that `public/` directory is writable
- Verify script path: `scripts/generate-sitemap.js`

### Console Logs Still Appearing
- Ensure `NODE_ENV=production` is set during build
- Check `next.config.js` compiler configuration
- Clear `.next/` cache and rebuild

## Post-Deployment

After deployment, verify:
1. ✅ Site loads correctly
2. ✅ All routes are accessible
3. ✅ `robots.txt` is accessible at `/robots.txt`
4. ✅ `sitemap.xml` is accessible at `/sitemap.xml`
5. ✅ External API calls work (CDN, YouTube, etc.)
6. ✅ No console.log statements in production build

## Support

For issues or questions:
- Check the main `DEPLOYMENT_READINESS_REPORT.md`
- Review Next.js static export documentation
- Check [Cloudflare Pages documentation](https://developers.cloudflare.com/pages/)

