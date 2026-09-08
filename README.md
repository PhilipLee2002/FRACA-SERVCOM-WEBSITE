# Fraca Servcom Ltd — Static Website

Responsive static website for Fraca Servcom Ltd (Eldoret, Kenya) showcasing furniture, bags and supplies. Built with plain HTML, Tailwind CDN, shared `style.css` / `main.js`, and product galleries.

## Features

- Landing page with full-bleed product hero, about, divisions, testimonials, bags gallery, and contact form
- Furniture hub (`furniture.html`) with live collections and **Coming soon** categories
- Shared gallery + lightbox (`gallery-data.js` + `FracaGallery` in `main.js`)
- Contact form posts to a small custom API (`POST /api/contact`) — WhatsApp CTA always available
- Mobile nav, scroll reveal, and consistent header/footer across pages

## Project structure

```
index.html          # Home
furniture.html      # Furniture catalog hub (use this filename on case-sensitive hosts)
style.css           # Design system
main.js             # Nav, lightbox, gallery helpers, form submit
gallery-data.js     # Product image catalogs
api/contact.js      # POST /api/contact (Vercel function + local server)
lib/contact.js      # Validation, email, store, CORS
.env.example        # Contact API env vars
Beds.html …         # Category galleries (live or coming soon)
IMAGES/             # Local product photos
README.md
ASSETS.md
LICENSE
```

### Live galleries (photos in `IMAGES/`)

29 categories including beds, office chairs, executive chairs, reception desks, pedestal desks, conference tables, sofa sets, filing cabinets, and more. See `furniture.html` for the full catalog.

Regenerate `gallery-data.js` after adding images: run a folder scan script or add entries manually to match folder names under `IMAGES/`.

## Preview locally

Serve the static site and the contact API together:

```powershell
node api/contact.js
```

Then visit `http://127.0.0.1:3000`. Without `RESEND_API_KEY`, inquiries are stored in `data/inquiries.jsonl`.

Or open `index.html` / `python -m http.server 8000` for static-only preview (the contact form needs the API above).

## Contact API

`POST /api/contact` accepts `name`, `email`, `subject`, `phone`, and `message`. It validates, then emails the shop and/or stores the inquiry.

The form on `index.html` posts to `/api/contact` on the same origin (Vercel serves static pages + this function). If the API is ever a separate origin, set `data-api-base` on the form or `window.FRACA_API_BASE`.

### Production email (Resend)

1. Create a [Resend](https://resend.com) API key and verify `fracaservcom.co.ke`.
2. In the Vercel project, set:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL=info@fracaservcomltd.co.ke`
- `CONTACT_FROM_EMAIL=Fraca Servcom Ltd <noreply@fracaservcom.co.ke>`

Until the domain is verified, Resend’s test sender (`beth.t@example.com`) only delivers to the account owner. Do not set `CONTACT_STORE=file` on Vercel (the filesystem is not a database).

Optional: `INQUIRY_WEBHOOK_URL` to forward a JSON copy (Sheets/Make/n8n). Copy `.env.example` for local keys. WhatsApp (`254725151495`) remains the backup channel.

## Accessibility notes

- Icon controls include `aria-label` / `title` where needed
- Map iframe has a descriptive `title`
- Gallery images use `alt` text and `loading="lazy"`

## Deployment

Live site: [fracaservcom.co.ke](https://fracaservcom.co.ke) (Vercel).

Pushes to `main` on GitHub deploy automatically. To deploy from the CLI:

```powershell
npx plugins add vercel/vercel-plugin --target cursor --yes
vercel link --yes --project fraca-servcom-website
vercel --prod --yes
```

GitHub Pages and Netlify still work from the repo root. On Linux/GitHub Pages, keep the furniture hub as lowercase `furniture.html` (already linked site-wide).

## License

Proprietary — Ac Fraca Servcom Ltd. See `LICENSE` and `ASSETS.md`.

