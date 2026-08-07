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
- Open the file in your browser or use your editor’s Live Server.

Option 2 — Serve with a lightweight HTTP server (recommended for proper relative path and map loading):

PowerShell (if Python is installed):

```powershell
# from the project root
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Or use the VS Code Live Server extension:
- Install Live Server and open `index.html` with it.

## GitHub push instructions (generic)

1. Create a new empty repository on GitHub (via the web UI).
2. From your local project root run:

```bash
git init
git add .
git commit -m "Initial commit — Fraca Servcom static website"
git branch -M main
# replace <YOUR-REPO-URL> with the HTTPS repo url from GitHub
git remote add origin <YOUR-REPO-URL>
git push -u origin main
```

If you use the GitHub CLI you can create and push in one step:

```bash
gh repo create <owner>/<repo-name> --public --source="." --remote=origin --push
```

## Accessibility & best-practice notes

- Icon-only controls include `title` attributes; the Google Maps iframe has a `title` attribute.
- Images should include meaningful `alt` text — review and add more where needed.
- Forms are static HTML — to capture submissions, wire them to a backend or a service (Formspree, Netlify Forms, or custom server).
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

## Next steps you might want help with

- Wire forms to a form service or backend endpoint.
- Optimize image assets and add lazy-loading where helpful.
- Add a deploy workflow (GitHub Actions) to publish to GitHub Pages or Netlify.

## License

This repository and its contents are proprietary and are owned by Fraca Servcom Ltd. All rights are reserved unless explicit permission is granted. See `LICENSE` for details and contact information.

Images, product photos, logos and other branding assets are proprietary to Fraca Servcom Ltd. See `ASSETS.md` for details.

---

Repository name on GitHub: `FRACA-SERVCOM-WEBSITE` (GitHub will convert spaces to hyphens for the URL).

If you want, I can also:
- update the repo description on GitHub,
- remove or redact any images you want private before public sharing, or
- add a deploy workflow to publish this site automatically.
