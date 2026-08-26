# Fraca Servcom Ltd — Static Website

Responsive static website for Fraca Servcom Ltd (Eldoret, Kenya) showcasing furniture, bags and supplies. Built with plain HTML, Tailwind CDN, shared `style.css` / `main.js`, and product galleries.

## Features

- Landing page with full-bleed product hero, about, divisions, testimonials, bags (coming soon), and contact form
- Furniture hub (`furniture.html`) with live collections and **Coming soon** categories
- Shared gallery + lightbox (`gallery-data.js` + `FracaGallery` in `main.js`)
- Contact form ready for [Formspree](https://formspree.io) (WhatsApp CTA always available)
- Mobile nav, scroll reveal, and consistent header/footer across pages

## Project structure

```
index.html          # Home
furniture.html      # Furniture catalog hub (use this filename on case-sensitive hosts)
style.css           # Design system
main.js             # Nav, lightbox, gallery helpers, form submit
gallery-data.js     # Product image catalogs
Beds.html …         # Category galleries (live or coming soon)
IMAGES/             # Local product photos
README.md
ASSETS.md
LICENSE
```

### Live galleries (photos in `IMAGES/`)

Beds, Coffee Tables, Dining Sets, Dressing Mirrors, Executive Chairs, Pulpits, Utility Chairs, Wardrobes

### Coming soon (inquire for stock)

Bags, Sofa Sets, Workstations, Conference Tables, Student Desks, Filing Cabinets, Entertainment Units, Office Partitioning, Executive Tables

## Preview locally

Open `index.html` in a browser, or serve the folder:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Contact form (Formspree)

1. Create a free form at [formspree.io](https://formspree.io).
2. In `index.html`, replace `YOUR_FORM_ID` in the form `action` URL:

```html
<form id="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

Until that ID is set, the site shows a clear message and still offers email/WhatsApp.

## Accessibility notes

- Icon controls include `aria-label` / `title` where needed
- Map iframe has a descriptive `title`
- Gallery images use `alt` text and `loading="lazy"`

## Deployment

- **GitHub Pages:** enable Pages from the `main` branch root
- **Netlify / Vercel:** connect the repo or drag-and-drop the folder

On Linux/GitHub Pages, keep the furniture hub as lowercase `furniture.html` (already linked site-wide).

## License

Proprietary — Ac Fraca Servcom Ltd. See `LICENSE` and `ASSETS.md`.

