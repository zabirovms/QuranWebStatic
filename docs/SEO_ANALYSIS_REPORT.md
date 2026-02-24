# SEO Analysis Report for quran.tj

**Date:** Analysis Date  
**Issue:** Search results showing "Quranic Universal Library" instead of proper site description

---

## 🔍 Current Search Result Analysis

### What Google is Showing:
```
quran.tj
https://www.quran.tj
·
Translate this page
Quranic Universal Library. Мо дар: Instagram. Facebook. YouTube. Барномаи мобилӣ. info@quran.tj. Пайвандҳои зуд. Асосӣ Қуръон Омӯзиш Қироат Иқтибосҳо ...
```

### Problems Identified:

1. **❌ Wrong Description Source**
   - Google is extracting "Quranic Universal Library" from the Footer component
   - This is actually a link to an external resource (qul.tarteel.ai), not your site description
   - The footer text is appearing in search snippets instead of proper meta descriptions

2. **❌ Social Media Links in Snippet**
   - Instagram, Facebook, YouTube links are appearing in search results
   - These are footer links, not main content
   - Makes the snippet look unprofessional

3. **❌ Generic Description**
   - Your actual site description should be: "Қуръони Карим - Тафсири Осонбаён бо забони тоҷикӣ"
   - But Google is not using it

---

## ✅ What's Properly Implemented

### 1. Root Layout Metadata ✅
**File:** `app/layout.tsx`
```typescript
title: 'Қуръони Карим - Тафсири Осонбаён бо забони тоҷикӣ'
description: 'Хондани Қуръони Карим бо тарҷумаи тоҷикӣ ва тафсири осонбаён. Рӯйхати ҳамаи 114 сураҳои Қуръони Карим. Тиловати оят ба оят ва кулли сура тавассути 150+ қориҳои машҳури ҷаҳон.'
metadataBase: new URL('https://www.quran.tj')
```

### 2. Home Page Metadata ✅
**File:** `app/page.tsx`
```typescript
title: 'Қуръон бо Тафсири Осонбаён'
description: 'Хондани Қуръони Карим бо тарҷума ва тафсири осонбаён бо забони тоҷикӣ. Дуоҳо, зикрҳо, тиловат, Қоидаи Бағдодӣ, Фарзи Айн, номҳои мубораки Аллоҳ, паёмбарон ва маводҳои дигар.'
```

### 3. Surah Pages Metadata ✅
**File:** `app/surah/[number]/layout.tsx`
- Dynamic titles and descriptions per surah
- Proper canonical URLs
- Open Graph and Twitter Card tags

### 4. Structured Data ✅
- JSON-LD schema implemented
- Proper Book and CreativeWork types
- Breadcrumb navigation

### 5. robots.txt ✅
- Properly configured
- Sitemap reference included

### 6. Sitemap.xml ✅
- All pages included
- Proper priorities and change frequencies

---

## 🚨 Issues to Fix

### Issue 1: Footer Content Appearing in Search Results

**Problem:**
- Footer contains "Quranic Universal Library" (external link)
- Social media links are prominent in footer
- Google is extracting this as page description

**Solution:**
1. **Add `data-nosnippet` to Footer** - Prevent Google from using footer content in snippets
2. **Move "Quranic Universal Library" to less prominent position** - Or mark it with `data-nosnippet`
3. **Ensure meta descriptions are in HTML head** - Verify they're being rendered correctly

### Issue 2: Meta Descriptions Not Being Used

**Possible Causes:**
1. **Static Export Issue** - Meta tags might not be in the generated HTML
2. **Client-Side Rendering** - Some metadata might be added client-side only
3. **Google Cache** - Old cached version might still be indexed

**Solution:**
1. **Verify HTML Output** - Check if meta tags are in the static HTML files
2. **Use Server-Side Metadata** - Ensure all metadata is in `layout.tsx` files (not client-side)
3. **Request Re-indexing** - Use Google Search Console to request re-crawling

### Issue 3: Home Page Has Conflicting Metadata

**Problem:**
- Root layout has one description
- Home page (`app/page.tsx`) has a different description
- This might confuse search engines

**Solution:**
- Ensure home page metadata overrides root layout properly
- Use consistent branding across all pages

---

## 📋 Recommended Fixes

### Priority 1: Fix Footer SEO Impact

1. **Add `data-nosnippet` to Footer Section**
   ```tsx
   <footer data-nosnippet style={{...}}>
   ```

2. **Mark External Links Appropriately**
   ```tsx
   <FooterLink
     text="Quranic Universal Library"
     url="https://qul.tarteel.ai/"
     data-nosnippet // Add this
   />
   ```

### Priority 2: Verify Meta Tags in HTML

1. **Check Generated HTML**
   - After build, verify `out/index.html` contains proper meta tags
   - Ensure description is in `<head>` section

2. **Add Open Graph Image**
   - Add `og:image` to improve social sharing
   - This also helps with search results

### Priority 3: Improve Home Page Description

1. **Make Description More Specific**
   - Current: Generic description
   - Better: Include key features and value proposition
   - Include primary keywords naturally

2. **Add Structured Data for Organization**
   - Add Organization schema
   - Include contact information
   - Add social media profiles properly

---

## 🔧 Technical Recommendations

### 1. Verify Static Export Metadata

**Check if metadata is in HTML:**
```bash
# After build, check the HTML
grep -r "meta name=\"description\"" out/
```

### 2. Add Organization Schema

**File:** `app/layout.tsx` or create `components/OrganizationSchema.tsx`
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Quran.tj",
  "url": "https://www.quran.tj",
  "logo": "https://www.quran.tj/logo.png",
  "sameAs": [
    "https://www.instagram.com/quran.tj.official",
    "https://www.youtube.com/@balkhiverse"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "info@quran.tj"
  }
}
```

### 3. Improve Home Page Metadata

**Current:**
```typescript
description: 'Хондани Қуръони Карим бо тарҷума ва тафсири осонбаён бо забони тоҷикӣ. Дуоҳо, зикрҳо, тиловат, Қоидаи Бағдодӣ, Фарзи Айн, номҳои мубораки Аллоҳ, паёмбарон ва маводҳои дигар.'
```

**Recommended:**
```typescript
description: 'Қуръони Карим бо тарҷума ва тафсири осонбаён дар забони тоҷикӣ. Хондани 114 сура, тиловати аудиоӣ, дуоҳо, тафсир, тасбеҳ ва маводҳои дигари динӣ. Барномаи ройгони онлайн ва мобилӣ.'
```

### 4. Add Open Graph Image

**Add to root layout:**
```typescript
openGraph: {
  images: [
    {
      url: 'https://www.quran.tj/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Қуръон бо Тафсири Осонбаён',
    },
  ],
}
```

---

## 📊 SEO Checklist

### Current Status:
- ✅ Meta titles implemented
- ✅ Meta descriptions implemented
- ✅ Canonical URLs implemented
- ✅ Open Graph tags implemented
- ✅ Twitter Cards implemented
- ✅ Structured data (JSON-LD) implemented
- ✅ robots.txt configured
- ✅ Sitemap.xml generated
- ❌ Footer content affecting snippets
- ❌ Missing Organization schema
- ❌ Missing Open Graph image
- ⚠️ Need to verify HTML output

---

## 🎯 Action Items

1. **Immediate (High Priority)**
   - [ ] Add `data-nosnippet` to Footer component
   - [ ] Verify meta tags are in generated HTML
   - [ ] Request Google re-crawl in Search Console

2. **Short Term (Medium Priority)**
   - [ ] Add Organization structured data
   - [ ] Create and add Open Graph image
   - [ ] Improve home page description
   - [ ] Add `og:image` to all pages

3. **Long Term (Low Priority)**
   - [ ] Monitor search results after fixes
   - [ ] A/B test different descriptions
   - [ ] Add more structured data types
   - [ ] Implement breadcrumb schema on all pages

---

## 🔍 How to Verify Fixes

1. **Check HTML Source**
   ```bash
   curl https://www.quran.tj/ | grep -A 2 "meta name=\"description\""
   ```

2. **Use Google Rich Results Test**
   - https://search.google.com/test/rich-results
   - Test your homepage URL

3. **Use Google Search Console**
   - Request re-indexing
   - Monitor search appearance
   - Check which description Google is using

4. **Check Social Media Preview**
   - Use Facebook Sharing Debugger
   - Use Twitter Card Validator
   - Verify Open Graph tags

---

## 📝 Notes

- The SEO implementation is **technically correct** in the code
- The issue is likely that Google is **extracting visible content** instead of meta tags
- Footer content is too prominent and being used as description
- Need to explicitly tell Google to ignore footer content in snippets
- After fixes, it may take 1-2 weeks for Google to update search results

---

## ✅ Conclusion

Your SEO implementation is **mostly correct**, but Google is currently using footer content instead of your meta descriptions. The main fix is to:

1. **Mark footer as `data-nosnippet`** to prevent Google from using it
2. **Verify meta tags are in HTML** output
3. **Request re-indexing** in Google Search Console

After these fixes, your proper descriptions should appear in search results.
