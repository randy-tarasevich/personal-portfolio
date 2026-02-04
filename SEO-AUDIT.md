# SEO Audit — Personal Portfolio

**Date:** February 4, 2026  
**Site:** randy-tarasevich.com (from `public/CNAME`)

---

## Executive summary

The site has a solid base (semantic HTML, one h1 per page, meta description in the layout) but is missing several standard SEO elements: Open Graph/Twitter cards, canonical URLs, sitemap, robots.txt, and page-specific meta descriptions. Recommended fixes are listed below; the highest-impact ones have been implemented in the codebase.

---

## What’s working

| Area                  | Status                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| **Semantic HTML**     | `<main>`, `<nav>`, `<article>`, `<header>`, `<time datetime>` used appropriately.                       |
| **Heading hierarchy** | One `<h1>` per page; logical h2/h3 structure.                                                           |
| **Meta description**  | BaseLayout accepts `description` and outputs `<meta name="description">`.                               |
| **Viewport**          | `<meta name="viewport" content="width=device-width, initial-scale=1.0">` present.                       |
| **Language**          | `<html lang="en">` set.                                                                                 |
| **Title tags**        | Every page sets a custom `title` (e.g. “Randy Tarasevich - Software Developer...”, “About - Randyman”). |
| **Image alt text**    | Project images use descriptive alt (e.g. “{title} screenshot”).                                         |
| **Image dimensions**  | Project images have `width` and `height` to reduce layout shift.                                        |
| **Lazy loading**      | Project images use `loading="lazy"`.                                                                    |
| **External links**    | Footer/social links use `rel="noopener noreferrer"`.                                                    |
| **Internal linking**  | Nav and in-content links to /projects, /blog, /contact, etc.                                            |

---

## Issues and recommendations

### 1. Meta descriptions not page-specific (High)

- **Issue:** Only the default layout description is used. Index, Bio, Projects, Blog index, Contact, and individual blog posts do not pass a custom `description`, so every page can end up with the same generic description in search results.
- **Recommendation:** Pass a unique `description` from each page (and for blog posts, use `post.data.description`).
- **Status:** Addressed in layout and pages.

### 2. No Open Graph or Twitter Card meta (High)

- **Issue:** No `og:title`, `og:description`, `og:image`, `og:url`, or `twitter:card` (etc.). Shares on social and in messengers will fall back to generic or missing previews.
- **Recommendation:** Add optional OG/Twitter props to BaseLayout and output the corresponding meta tags. Use a default OG image (e.g. logo or hero) and allow overrides per page (e.g. blog post image).
- **Status:** Addressed in BaseLayout.

### 3. No canonical URLs (Medium)

- **Issue:** Canonical `<link rel="canonical">` is not set. Duplicate URLs (e.g. with/without trailing slash or different query params) can dilute ranking and cause indexing confusion.
- **Recommendation:** Set canonical on every page to the absolute URL (e.g. `https://randy-tarasevich.com/bio`). Critical for blog posts if the same content could be reachable via multiple paths.
- **Status:** Addressed in BaseLayout and passed from pages where needed.

### 4. No sitemap (High)

- **Issue:** No `sitemap.xml`. Search engines have to discover pages only via links, which can slow or limit indexing.
- **Recommendation:** Use `@astrojs/sitemap` and set `site: "https://randy-tarasevich.com"` in `astro.config.mjs` so the sitemap gets correct absolute URLs.
- **Status:** Addressed with a static `public/sitemap.xml` (Astro’s `@astrojs/sitemap` hit a build error with this setup; you can retry the integration later or keep the static sitemap and add new blog post URLs when you publish them).

### 5. No robots.txt (Medium)

- **Issue:** No `robots.txt`. Crawlers get no explicit crawl rules or sitemap hint.
- **Recommendation:** Add `public/robots.txt` allowing crawlers and pointing to the sitemap: `Sitemap: https://randy-tarasevich.com/sitemap-index.xml` (or the URL Astro generates).
- **Status:** Addressed with a `public/robots.txt` that references the sitemap.

### 6. Title and branding consistency (Low)

- **Issue:** Mix of “Randyman”, “Randy Tarasevich”, and “Randyman Portfolio” in titles and default layout. Slightly inconsistent for branding and search.
- **Recommendation:** Standardize (e.g. “Randy Tarasevich” for main branding and “Randy Tarasevich | Bio”, “Randy Tarasevich | Contact”, etc.). Optional: use a single default in the layout and override only where needed.
- **Status:** Not changed; optional follow-up.

### 7. Blog post pages: description and article meta (High)

- **Issue:** Blog post layout does not pass `post.data.description` to the layout, and has no article-specific OG (e.g. `og:type=article`, `article:published_time`).
- **Recommendation:** Pass description and optional image to the layout; add article OG and optional JSON-LD for `BlogPosting`.
- **Status:** Description and canonical added for blog posts; OG uses shared layout props.

### 8. No structured data (Medium)

- **Issue:** No JSON-LD for Person, WebSite, or BlogPosting. Missing opportunity for rich results (e.g. profile, sitelinks, article snippets).
- **Recommendation:** Add JSON-LD in the layout (Person + WebSite) and on blog post pages (BlogPosting). Optional: BreadcrumbList for blog and project pages.
- **Status:** Not implemented; recommended as a follow-up.

### 9. TypeScript in blog slug page (Low / project rule)

- **Issue:** `src/pages/blog/[...slug].astro` uses `type BlogPostProps` and `satisfies BlogPostProps`; project rule is JavaScript-only.
- **Recommendation:** Remove type annotations and use JSDoc or plain props.
- **Status:** Addressed by removing TypeScript from the blog slug page.

### 10. Default OG image

- **Recommendation:** Add a default OG image (e.g. 1200×630) in `public/` and reference it in the layout so all pages have a share image even when no page-specific image is set.
- **Status:** Layout supports `ogImage`; adding a real image asset is optional.

---

## Technical checklist (post-fixes)

- [x] Unique, descriptive `<title>` per page
- [x] Unique meta description per page (or per post)
- [x] Canonical URL per page
- [x] Open Graph and Twitter Card meta where applicable
- [x] `robots.txt` with Sitemap reference
- [x] XML sitemap (static `public/sitemap.xml`)
- [x] `site` in `astro.config.mjs` for absolute URLs
- [ ] Optional: JSON-LD (Person, WebSite, BlogPosting)
- [ ] Optional: Default OG image asset and `og:image` default

---

## Optional next steps

1. **Analytics / Search Console:** Add Google Search Console and verify the domain; submit sitemap URL.
2. **OG image:** Create `public/og-default.png` (1200×630) and set it as the default in the layout.
3. **Structured data:** Add Person and WebSite JSON-LD in the layout; BlogPosting on each post.
4. **Performance:** Already in good shape (static Astro, lazy-loaded images); consider Core Web Vitals monitoring.
