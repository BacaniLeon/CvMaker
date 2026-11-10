# CV Maker

Browser-based CV builder (Nuxt 3). Fill in your details, see a live A4 preview, export a PDF —
and later **upload that CV again to keep editing** instead of starting over.

## Features

- **Live preview** on a real A4 page with page-break markers
- **18 templates** (modern, professional, creative, minimal and ATS-friendly) with a filterable gallery, any accent colour, 3 fonts, EN / HR section headings
- **Autosave** to `localStorage` — close the tab and continue later
- **Import an existing CV**
  - PDF exported by CV Maker → exact restore (the editable data is embedded in the PDF as `cvmaker-data.json`)
  - `.json` backup (or a [JSON Resume](https://jsonresume.org) file) → exact restore
  - **LinkedIn**: the profile "Save to PDF" file, or the full data export `.zip` (CSV files) → mapped into the editor
  - Any other text-based PDF or Word `.docx` → text is parsed into sections for you to review
  - Image-only PDFs (scans, PDFs from the old 2024 version) can't be read — you get a clear message
- Everything runs in the browser; nothing is uploaded to a server

## Project structure

| Path | What it does |
| --- | --- |
| `pages/index.vue` | Landing page: new CV, continue draft, import |
| `pages/cvmaker.vue` | Editor + live preview (client-only route) |
| `composables/useCv.js` | CV data model, normalisation, autosave |
| `utils/cvImport.js` | PDF / DOCX / JSON / LinkedIn import and the section parser |
| `utils/cvExport.js` | PDF export (html2pdf + pdf-lib attachment), JSON backup, photo resize |
| `components/Cv/*` | The A4 paper and the templates (`TemplateX.vue` is picked up automatically; add it to `cvTemplates` in `utils/cvView.js`) |
| `components/Editor/*` | Collapsible sections, entry lists, tag input |
| `assets/styles/pages/*` | SCSS per page (`rem` scaling via `include-media`) |

## Development

```bash
npm install
npm run dev
```

Production build: `npm run build`, then `node .output/server/index.mjs`.
