# Security Audit — Personal Portfolio

**Date:** February 4, 2026  
**Scope:** Source code, dependencies, form handling, and deployment surface.

---

## Executive summary

The site is a static Astro build with no server-side application logic, which reduces attack surface. The main issues are: **a Web3Forms access key committed in source**, **known dependency vulnerabilities** in Astro and its dependencies, and a few minor hardening opportunities. Recommended actions: move the form key to an environment variable, plan an Astro upgrade, and ensure the hosting provider sets security headers.

---

## What’s in good shape

| Area                                    | Status                                                                                        |
| --------------------------------------- | --------------------------------------------------------------------------------------------- |
| **No dangerous DOM APIs**               | No `innerHTML`, `eval()`, or `document.write` in the codebase.                                |
| **External links**                      | All `target="_blank"` links use `rel="noopener noreferrer"` (prevents tab-nabbing).           |
| **Content sources**                     | Blog and projects are from your own Markdown/content collections, not user input.             |
| **URL validation**                      | Project `href` in content uses `z.string().url().optional()`, so only valid URLs are allowed. |
| **.gitignore**                          | `.env` and `.env.*` are ignored; env files are not committed.                                 |
| **Form structure**                      | Hidden honeypot (`botcheck`) is present for basic bot mitigation.                             |
| **No inline scripts from user content** | Scripts are fixed in Astro/HTML; no dynamic script injection from content.                    |
| **Static output**                       | No server runtime or database; build produces static HTML/assets.                             |

---

## Issues and recommendations

### 1. Web3Forms access key in source (High)

- **Issue:** The contact form uses a hardcoded `access_key` in `src/pages/contact.astro` (value `43a560b2-da27-4999-be3d-fb3a4b2a44f7`). Anyone with access to the repo (or built HTML) can see and reuse it.
- **Risk:** Form abuse (spam, quota consumption). If the repo is or becomes public, the key is exposed in history.
- **Recommendation:** Move the key to an environment variable (e.g. `PUBLIC_WEB3FORMS_ACCESS_KEY`), set it in `.env` locally and in your deployment platform, and remove the value from the repo. Use a fallback only for local dev if you want the form to work without configuring env.
- **Status:** Addressed: key is read from `import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY`; `.env.example` added; hardcoded value removed from the page. Set the variable in production and in `.env` for local dev.

---

### 2. Dependency vulnerabilities (High)

- **Issue:** `npm audit` reports vulnerabilities in **Astro** and its dependencies (e.g. esbuild, Vite), including:
  - Astro: X-Forwarded-Host reflection, URL manipulation / middleware bypass, reflected XSS (server islands), dev server file read, Cloudflare adapter XSS, auth bypass via double URL encoding.
  - esbuild: dev server request/response exposure.
- **Fix path:** `npm audit fix --force` would upgrade to Astro 5.x (breaking change). Staying on Astro 4.x leaves these issues unfixed.
- **Recommendation:** Plan an upgrade to a patched Astro version (e.g. 5.17.1 or whatever is current and secure). Test locally and in preview before switching production. For now, avoid using the Astro dev server in untrusted networks and avoid server islands / middleware for sensitive checks until upgraded.
- **Status:** Documented; no code change (upgrade is a separate task).

---

### 3. No CSRF token on contact form (Low)

- **Issue:** The form submits via client-side `fetch()` to Web3Forms; there is no CSRF token.
- **Context:** Web3Forms is a third-party API that accepts submissions from any origin by design. A malicious site could trigger a user’s browser to submit the form to Web3Forms (CSRF against that API).
- **Impact:** Limited to submitting form data through the user’s session; an attacker cannot read the response or your Web3Forms dashboard. Risk is mainly spam or noise.
- **Recommendation:** Rely on Web3Forms’ own protections (rate limiting, domain allowlisting if available). Optionally add a double-submit cookie or same-site token if you later move the form to your own backend.
- **Status:** Accepted risk for current setup; no change.

---

### 4. Placeholder link `href="#"` (Low)

- **Issue:** The X (Twitter) link in `contact.astro` uses `href="#"`, which can scroll to top or cause minor UX issues.
- **Recommendation:** Replace with a real profile URL when available, or use `role="button"` and `tabindex="0"` with JavaScript, or `href="javascript:void(0)"` and `aria-disabled="true"` if it’s intentionally non-functional for now.
- **Status:** Optional; left as-is.

---

### 5. Security headers (Informational)

- **Issue:** Security headers (e.g. Content-Security-Policy, X-Frame-Options, X-Content-Type-Options) are not set in the Astro app; for a static site they are usually set by the host (GitHub Pages, Netlify, Vercel, etc.).
- **Recommendation:** In your hosting dashboard or config, enable:
  - **X-Content-Type-Options: nosniff**
  - **X-Frame-Options: DENY** (or SAMEORIGIN if you need to embed)
  - **Content-Security-Policy** (e.g. default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' if you use inline styles; adjust for any third-party scripts)
  - **Referrer-Policy: strict-origin-when-cross-origin** (or similar)
- **Status:** Documented; configure on the host.

---

### 6. Content / Markdown and XSS (Low in current setup)

- **Issue:** Blog and project content are rendered via Astro’s `<Content />` and schema-validated data. Markdown can sometimes include raw HTML depending on the renderer.
- **Current state:** Content is authored by you in the repo; risk is low. Astro’s content layer and typical Markdown pipelines do not blindly inject unsanitized HTML into the page.
- **Recommendation:** If you ever allow untrusted Markdown (e.g. from a CMS), ensure the Markdown/HTML pipeline sanitizes or disallows `<script>`, event handlers, and `javascript:` URLs. For current repo-only content, no change needed.
- **Status:** Noted; no change.

---

### 7. Form validation (Informational)

- **Issue:** Validation is only client-side (`required`, `type="email"`). Web3Forms will validate on its side.
- **Recommendation:** For a contact form this is acceptable. If you add your own backend later, add server-side validation and length limits (e.g. on message body) to reduce abuse and payload size.
- **Status:** Accepted; no change.

---

## Checklist (after fixes)

- [x] No secrets hardcoded in source (Web3Forms key moved to env)
- [x] .env.example added; .env in .gitignore
- [ ] Dependency upgrade planned (Astro + deps)
- [ ] Security headers configured on hosting
- [x] External links use `rel="noopener noreferrer"`
- [x] No unsafe DOM APIs (innerHTML, eval, etc.)
- [x] Content URLs validated (projects href schema)

---

## Optional next steps

1. **Web3Forms:** In the Web3Forms dashboard, restrict submissions by domain (e.g. `randy-tarasevich.com`) if the option exists.
2. **Rate limiting:** Rely on Web3Forms’ limits; if you move to your own backend, add rate limiting per IP or per session.
3. **Upgrade Astro:** Schedule and test an upgrade to a patched Astro (and related) version; re-run `npm audit` after upgrading.
