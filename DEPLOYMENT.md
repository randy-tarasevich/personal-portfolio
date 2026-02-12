# Deployment & Contact Form

## Contact form (Web3Forms)

The contact form uses [Web3Forms](https://web3forms.com). The access key is loaded from an environment variable so it is not committed to the repo.

### If you build on your own computer (most common for S3/CloudFront)

You **do not need to set any environment variable in AWS or anywhere else.**

1. You have a `.env` file in this project (already created) with:
   ```
   PUBLIC_WEB3FORMS_ACCESS_KEY=43a560b2-da27-4999-be3d-fb3a4b2a44f7
   ```
2. When you run `npm run build` on your machine, Astro reads `.env` and puts the key into the built HTML.
3. You upload the `dist/` folder to S3 (e.g. `aws s3 sync dist/ s3://YOUR-BUCKET --delete`). That HTML already contains the key.
4. The contact form on the live site will work. No extra configuration needed.

**Summary:** As long as you run `npm run build` on the same computer where the `.env` file lives, the production site will have a working contact form. You never set the key in AWS—it’s only needed when building.

### Local development

- **Do not commit `.env`** (it is in `.gitignore`).
- Run `npm run dev` or `npm run build` as usual; the key is read automatically from `.env`.

### Production: set the env var only if you build in the cloud

The key must be available **at build time**. If you build **on your computer**, `.env` is enough (see above). Only if you build in CI (e.g. GitHub Actions) or on another server do you need to set the variable there:

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

**Option A: Build on your computer (recommended)**  
Your `.env` already has the key. Run `npm run build`, then upload `dist/` (see below). **No env setup in AWS—the key is in the HTML when you build.**

**Option B: Build in CI (e.g. GitHub Actions)**  
Only if you want the build to run in the cloud: add the secret `PUBLIC_WEB3FORMS_ACCESS_KEY` in the repo’s **Settings → Secrets and variables → Actions**, and in the workflow set `env: PUBLIC_WEB3FORMS_ACCESS_KEY: ${{ secrets.PUBLIC_WEB3FORMS_ACCESS_KEY }}` for the step that runs `npm run build`.

**Deploying the built site to S3 + CloudFront**

1. **Create an S3 bucket** (e.g. `randy-tarasevich.com` or `www.randy-tarasevich.com`):

   - Keep **Block public access** **on**; use **Origin access control (OAC)** so only CloudFront can read from the bucket (no public bucket needed).

2. **Build** (on your machine, `.env` is used automatically):

   ```bash
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

**If you see "Access Denied" in the browser**

- **Every page (including the homepage):** The bucket is not allowing CloudFront to read. In **S3 → bucket → Permissions**: (1) Keep **Block public access** on. (2) Under **Bucket policy**, ensure the policy allows the CloudFront distribution (via **Origin Access Control**): the policy should have a `Principal` that references your OAC (e.g. the OAC ID or the distribution’s service principal) and `GetObject` on the bucket. If you use OAC, run **Copy policy** from the CloudFront origin (S3 origin → Edit → Origin access → Copy policy) and paste it into the bucket policy, then save.
- **Only some URLs (e.g. a blog post like `/blog/astro-js-go-to-framework`):** S3 has no “directory index”: the file is `blog/astro-js-go-to-framework/index.html`, but the request is for `blog/astro-js-go-to-framework`, so S3 returns 403. Fix: add a **CloudFront Function** that rewrites the request so paths without a file extension get `/index.html` appended.

  1. In **CloudFront → your distribution → Behaviors**, confirm the default behavior uses the S3 origin.
  2. **CloudFront → Functions** → Create function, e.g. name `rewrite-spa-index`, runtime **cloudfront-js-1.0**.
  3. Paste this code (rewrites paths that don’t look like files to `path/index.html`):

  ```javascript
  function handler(event) {
    var request = event.request
    var uri = request.uri
    if (!uri.includes('.')) {
      if (uri.endsWith('/')) {
        request.uri = uri + 'index.html'
      } else {
        request.uri = uri + '/index.html'
      }
    }
    return request
  }
  ```

  4. Save, then **Publish** the function.
  5. **Behaviors** → Edit default behavior → **Viewer request** → Function type **CloudFront Functions**, select `rewrite-spa-index` → Save.
  6. Invalidate again: `aws cloudfront create-invalidation --distribution-id YOUR-DISTRIBUTION-ID --paths "/*"`.

After that, URLs like `/blog/astro-js-go-to-framework` will be served from `blog/astro-js-go-to-framework/index.html`.

#### Other hosts (Cloudflare Pages, DigitalOcean, etc.)

Add an environment variable named **`PUBLIC_WEB3FORMS_ACCESS_KEY`** with value `43a560b2-da27-4999-be3d-fb3a4b2a44f7` in the build settings, then run `npm run build` in that environment.

---

## Quick check

- **Local:** `npm run dev` → open `/contact` → submit the form. You should see a success message and receive the email.
- **Production:** After setting the env var and redeploying, submit the form on the live site; same behavior.

If the form fails, confirm the variable name is exactly `PUBLIC_WEB3FORMS_ACCESS_KEY` and that the build (not only the runtime) has access to it.
