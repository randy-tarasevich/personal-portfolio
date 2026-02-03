# Randy Tarasevich's Personal Portfolio

A personal portfolio website built with Astro.js and Tailwind CSS, featuring an astro.build-inspired dark theme with subtle purple/blue glows.

## Quick Start

1. **Open in Cursor:**
   - Open Cursor
   - File → Open Folder → Select this `personal-portfolio` folder

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **View in browser:**
   Open [http://localhost:4321](http://localhost:4321)

## Project Structure

```
perosnal-portfolio/
├── src/
│   ├── components/     # Reusable components
│   ├── layouts/        # Page layouts
│   │   └── BaseLayout.astro
│   ├── pages/          # Route pages
│   │   ├── index.astro
│   │   ├── bio.astro
│   │   ├── projects.astro
│   │   ├── blog.astro
│   │   └── contact.astro
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## Design System

### Colors (Astro.build-inspired)
- **Background:** `#0D1117` (primary), `#161B22` (secondary), `#21262D` (tertiary)
- **Text:** `#E6EDF3` (primary), `#8B949E` (secondary)
- **Accents:** `#A371F7` (purple), `#58A6FF` (blue), `#F778BA` (pink)

### Key Features
- Subtle background glows (not heavy gradients)
- Clean, minimal Inter typography
- Dark theme with editorial feel
- Responsive mobile navigation
- Smooth hover transitions

## Commands

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build for production to `./dist/` |
| `npm run preview` | Preview production build locally |

## Customization

### Update Content
- Edit page files in `src/pages/`
- Modify projects, blog posts, and personal info directly

### Update Colors
- Edit `tailwind.config.mjs` to change the color palette
- Glow effects are defined in `src/styles/global.css`

### Add Blog Posts
- Create markdown files in `src/content/blog/` (add content collection)
- Or add static blog post pages in `src/pages/blog/`

## Deployment

Build for production:
```bash
npm run build
```

Deploy the `dist/` folder to any static host:
- Netlify
- Vercel
- DigitalOcean App Platform
- GitHub Pages

## Next Steps

- [ ] Add real images/photos
- [ ] Configure form submission (Netlify Forms, Formspree, etc.)
- [ ] Add blog content collection for dynamic posts
- [ ] Set up SEO meta tags
- [ ] Add sitemap and RSS feed
- [ ] Configure analytics
