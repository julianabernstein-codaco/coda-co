# Product cover images

Static cover photos for the **example** product listings (the mock-seed
catalog). Real vendor listings get their covers via the dashboard
uploader (stored in Vercel Blob) — this folder is only for seeded
example goods.

## How to add a cover

1. Save the image here named by the listing's **slug** (its `id` in
   `lib/data/products.ts`) plus an extension, e.g.:

   ```
   public/products/urn-sage-001.jpg
   ```

2. Use a **square** image (1:1), ~**1024×1024px**, as `.jpg`, `.png`,
   or `.webp`. Keep it lean (ideally a few hundred KB).

3. Re-run `npm run db:mock` to attach covers to the seeded listings.

The mock seed sets a product's `coverImageUrl` to
`/products/<slug>.<ext>` when a matching file is present here; with no
file, the listing falls back to its SVG icon.

## Example-listing slugs

| Listing | Filename |
|---|---|
| Hand-thrown ceramic urn, sage glaze | `urn-sage-001.jpg` |
| Ceramic urn, terracotta glaze | `urn-terra-002.jpg` |
| Keepsake urn, ceramic mini | `urn-keepsake-003.jpg` |
| Memorial ash pendant, sterling silver | `pendant-silver-001.jpg` |
| Organic cotton burial shroud, undyed | `shroud-cotton-001.jpg` |
| Memorial portrait, custom illustration | `portrait-custom-001.jpg` |
| End of life planning workbook | `planning-workbook-001.jpg` |
| Advance care planning template set | `planning-template-001.jpg` |
| Eco burial guide & resource kit | `burial-guide-001.jpg` |
| Funeral planning workbook | `funeral-planning-workbook-001.jpg` |
| Simple will & estate creation kit | `will-kit-001.jpg` |
