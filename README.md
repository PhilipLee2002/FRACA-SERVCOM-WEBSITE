# Fraca Servcom Ltd — Static Website

A responsive, static website for Fraca Servcom Ltd showcasing furniture, hardware and general supplies. Built with plain HTML, Tailwind (via CDN) and a small custom stylesheet. The site includes product galleries, contact and feedback forms (static), an embedded Google Map, and responsive navigation.

## Short repository description (for GitHub)

Fraca Servcom Ltd — A responsive static website showcasing furniture, hardware and supplies with product galleries, contact forms, and responsive navigation. Built with Tailwind CSS and a small custom stylesheet.

## Features

- Responsive landing page (`index.html`) with hero, product categories, testimonials and CTA.
- Product pages and galleries (e.g., `FURNITURE.html`, `HARDWARE.html`, `Executive-chairs.html`, plus many product-specific pages under the project root).
- Local image assets located under `IMAGES/` (product photos referenced from pages).
- Contact and feedback forms (static markup; no backend integration included).
- Embedded Google Maps iframe for office location.
- Accessibility improvements: descriptive `title` attributes for icon-only controls and `iframe`, alt text on images, keyboard-accessible navigation.
- Styling via Tailwind CDN and a small `style.css` for custom styles.

## Project structure (representative)

```
index.html
style.css
FURNITURE.html
HARDWARE.html
Executive-chairs.html
Executive-tables.html
Beds.html
Dining-sets.html
Coffee-tables.html
Wardrobes.html
Workstations.html
IMAGES/   (product photos referenced by pages)
README.md
```

(There are additional product HTML pages in the project root — this is a representative list.)

## Preview locally

Option 1 — Open `index.html` directly in your browser:
- Double-click `index.html` in File Explorer.

Option 2 — Serve with a lightweight HTTP server (recommended for proper relative path and map loading):

PowerShell (if Python is installed):

```powershell
# from the project root
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Or using VS Code Live Server extension (recommended for fast iteration):
- Install Live Server extension
- Right-click `index.html` -> "Open with Live Server"

## GitHub push instructions (PowerShell)

1. Create a new empty repository on GitHub (via web UI) named e.g. `fraca-servcom-website`.
2. From the project root in PowerShell run:

```powershell
cd "C:\LEE'S PROJECTS(NO PHP)\FRACA-SERVCOM WEBSITE"
git init
git add .
git commit -m "Initial commit — Fraca Servcom static website"
git branch -M main
# replace <YOUR-REPO-URL> with the HTTPS repo url from GitHub (e.g. https://github.com/yourname/fraca-servcom-website.git)
git remote add origin <YOUR-REPO-URL>
git push -u origin main
```

If you have the GitHub CLI (`gh`) installed you can create the repo and push in one flow:

```powershell
gh repo create yourname/fraca-servcom-website --public --source="." --remote=origin --push
```

## Accessibility & best-practice notes

- Icon-only controls now include `title` attributes; the Google Maps iframe has a `title` attribute.
- Images should include meaningful `alt` text (many product images already have `alt` attributes; review and add more where needed).
- Forms are static HTML — to capture submissions, wire them to a backend endpoint or a service (Formspree, Netlify Forms, or a custom server).
- Consider optimizing images (resize/compress) before publishing to reduce load times.

## Deployment suggestions

- GitHub Pages: push the `main` branch and enable Pages in the repo settings (serve from `main` branch root).
- Netlify / Vercel: drag-and-drop the site folder or connect the GitHub repo for continuous deployment.

## Recommended .gitignore (create in repo root)

```
# OS
Thumbs.db
.DS_Store

# Node (if you later add tooling)
node_modules/

# IDE
.vscode/

# Images (if you prefer to keep large originals out of repo)
# IMAGES/originals/
```

## Next steps you might want me to help with

- Create/commit a `README.md` (done), add a `.gitignore`, and optionally a `LICENSE` file.
- Wire forms to a form service or a simple server endpoint.
- Optimize image assets and add lazy-loading attributes where helpful.
- Add a small deploy workflow (GitHub Actions) to build/optimize assets and publish to GitHub Pages or Netlify.

## License

This repository's code (HTML, CSS, small JavaScript snippets) is licensed under the MIT License. See `LICENSE` for full text.

Images, product photos, logos and other branding assets are proprietary to Fraca Servcom Ltd. See `ASSETS.md` for details.

---

Repository name on GitHub: `FRACA-SERVCOM-WEBSITE` (GitHub will convert spaces to hyphens for the URL).

If you want I can now:
- create the `README.md` file (already created),
- create a recommended `.gitignore`, and
- show the exact PowerShell commands to run to push the repo and enable GitHub Pages.

Which of these would you like next?