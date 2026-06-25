// Cover-image backfill — attaches static cover photos to the example
// product listings from files in public/products, named by slug
// (e.g. public/products/urn-sage-001.jpg). See public/products/README.md.
//
// Safe to run on every deploy: it is NON-DESTRUCTIVE and idempotent. It
// only *sets* coverImageUrl on a product when a matching public file
// exists AND the value would change. It never nulls or overwrites a
// cover that doesn't have a matching static file, so real vendor
// listings (whose covers live in Vercel Blob) are never touched — those
// slugs have no file in public/products, so they're skipped.
//
// Wired into scripts/build.mjs after `prisma db seed`. Can also be run
// manually: `npm run db:backfill-covers`.

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";
import { normalizeSslmode } from "../lib/connectionString";

config({ path: ".env" });

const COVER_EXTS = ["jpg", "jpeg", "png", "webp"];

// Returns the public path (e.g. "/products/urn-sage-001.jpg") if a cover
// file for this slug exists in public/products, else null.
function coverImageForSlug(slug: string): string | null {
  for (const ext of COVER_EXTS) {
    const rel = `products/${slug}.${ext}`;
    if (existsSync(path.join(process.cwd(), "public", rel))) {
      return `/${rel}`;
    }
  }
  return null;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[backfill-covers] DATABASE_URL not set; skipping.");
    return;
  }

  const adapter = new PrismaPg({
    connectionString: normalizeSslmode(process.env.DATABASE_URL),
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const products = await prisma.product.findMany({
      select: { id: true, slug: true, coverImageUrl: true },
    });

    let updated = 0;
    for (const p of products) {
      const cover = coverImageForSlug(p.slug);
      // Only set when a static file exists and the value actually
      // changes. No file → leave the row alone (don't clobber Blob
      // covers or re-null anything).
      if (cover && cover !== p.coverImageUrl) {
        await prisma.product.update({
          where: { id: p.id },
          data: { coverImageUrl: cover },
        });
        updated++;
        console.log(`[backfill-covers] ${p.slug} -> ${cover}`);
      }
    }
    console.log(
      `[backfill-covers] done; ${updated} cover(s) updated across ${products.length} product(s).`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("[backfill-covers] failed:", err);
  process.exit(1);
});
