# Deployment & Contact Form

## Contact form (Web3Forms)

The contact form uses [Web3Forms](https://web3forms.com). The access key is loaded from an environment variable so it is not committed to the repo.

### Local development

A `.env` file has been created in the project root with:

```
PUBLIC_WEB3FORMS_ACCESS_KEY=43a560b2-da27-4999-be3d-fb3a4b2a44f7
```

- **Do not commit `.env`** (it is in `.gitignore`).
- Run `npm run dev` or `npm run build` as usual; the key is read automatically.

### Production: set the env var where you build

The key must be available **at build time** (Astro inlines it into the built HTML). Set it in your deployment platform as follows.

#### Netlify

1. Site → **Site configuration** → **Environment variables**
2. Add variable:
   - **Key:** `PUBLIC_WEB3FORMS_ACCESS_KEY`
   - **Value:** `43a560b2-da27-4999-be3d-fb3a4b2a44f7`
3. Trigger a new deploy (or push a commit) so the build runs with the new variable.

#### Vercel

1. Project → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `PUBLIC_WEB3FORMS_ACCESS_KEY`
   - **Value:** `43a560b2-da27-4999-be3d-fb3a4b2a44f7`
   - Scopes: Production (and Preview if you want)
3. Redeploy.

#### GitHub Pages (GitHub Actions)

1. Repo → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret:**
   - **Name:** `PUBLIC_WEB3FORMS_ACCESS_KEY`
   - **Value:** `43a560b2-da27-4999-be3d-fb3a4b2a44f7`
3. In your workflow file (e.g. `.github/workflows/deploy.yml`), pass it into the build step:

   ```yaml
   - name: Build
     env:
       PUBLIC_WEB3FORMS_ACCESS_KEY: ${{ secrets.PUBLIC_WEB3FORMS_ACCESS_KEY }}
     run: npm run build
   ```

4. Commit and push; the next run will use the secret.

#### GitHub Pages (build locally, push `dist/`)

If you run `npm run build` on your machine and push the `dist/` folder (or use a branch that contains only built output), your local `.env` is already used when you build. No extra step.

#### AWS S3 + CloudFront

The key must be available when you run `npm run build`. Two options:

**Option A: Build locally (simplest)**  
Your `.env` already has the key. Run `npm run build`, then upload `dist/` (see below). No extra config.

**Option B: Build in CI (e.g. GitHub Actions)**

1. In the repo: **Settings** → **Secrets and variables** → **Actions** → add secret `PUBLIC_WEB3FORMS_ACCESS_KEY`.
2. In your workflow, before `npm run build`, set the env var from the secret (same as the GitHub Pages example above).
3. Then run the S3 sync and CloudFront invalidation steps from the workflow.

**Deploying the built site to S3 + CloudFront**

1. **Create an S3 bucket** (e.g. `randy-tarasevich.com` or `www.randy-tarasevich.com`):

   - Keep **Block public access** **on**; use **Origin access control (OAC)** so only CloudFront can read from the bucket (no public bucket needed).

2. **Build with the key set** (if not using `.env`):

   ```bash
   export PUBLIC_WEB3FORMS_ACCESS_KEY=43a560b2-da27-4999-be3d-fb3a4b2a44f7
   npm run build
   ```

3. **Upload `dist/` to S3:**

   ```bash
   aws s3 sync dist/ s3://YOUR-BUCKET-NAME --delete
   ```

   Optional: add `--cache-control "public, max-age=31536000, immutable"` for `dist/_astro/` in a separate sync for long-lived caching of hashed assets.

4. **CloudFront distribution:**

   - **Origin:** Your S3 bucket (use **Origin access control** recommended, or legacy OAI).
   - **Default root object:** `index.html`.
   - **Error pages (optional):** 403 and 404 → respond with `index.html`, code 200 (for SPA-style routing if you add it later).
   - **Alternate domain (CNAME):** `randy-tarasevich.com` and/or `www.randy-tarasevich.com`.
   - **SSL:** Use ACM in **us-east-1** to request/import a cert for the domain and attach it to the distribution.
   - Attach the CloudFront OAC (or OAI) to the bucket policy so only CloudFront can read from S3.

5. **DNS (Route 53 or your registrar):**  
   Point `randy-tarasevich.com` (and optionally `www`) to the CloudFront distribution (A/AAAA alias or CNAME).

6. **After each deploy, invalidate the cache:**
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR-DISTRIBUTION-ID --paths "/*"
   ```

**One-off deploy from your machine (with `.env` already set):**

```bash
npm run build
aws s3 sync dist/ s3://YOUR-BUCKET-NAME --delete
aws cloudfront create-invalidation --distribution-id YOUR-DISTRIBUTION-ID --paths "/*"
```

#### Other hosts (Cloudflare Pages, DigitalOcean, etc.)

Add an environment variable named **`PUBLIC_WEB3FORMS_ACCESS_KEY`** with value `43a560b2-da27-4999-be3d-fb3a4b2a44f7` in the build settings, then run `npm run build` in that environment.

---

## Quick check

- **Local:** `npm run dev` → open `/contact` → submit the form. You should see a success message and receive the email.
- **Production:** After setting the env var and redeploying, submit the form on the live site; same behavior.

If the form fails, confirm the variable name is exactly `PUBLIC_WEB3FORMS_ACCESS_KEY` and that the build (not only the runtime) has access to it.
