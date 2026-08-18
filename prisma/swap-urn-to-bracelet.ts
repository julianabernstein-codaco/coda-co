// ONE-OFF data fix — converts the `urn-sage-001` example listing into
// `remains-bracelet-001` in an already-seeded database.
//
// Why this exists: the example catalog is defined in lib/data/products.ts
// but only loaded by `npm run db:mock`, which WIPES the database and so
// never runs on a deploy. A database seeded before that file changed keeps
// showing the old urn. This script applies just that one change in place,
// non-destructively, so a preview deploy reflects the new listing.
//
// SAFETY:
//   - Preview only. Refuses to run unless VERCEL_ENV=preview, so merging
//     to main can never rewrite the production catalog. Set
//     ALLOW_LISTING_SWAP=1 to run it deliberately somewhere else.
//   - Idempotent. Once the bracelet exists it is a no-op, so repeat
//     deploys do nothing.
//   - No deletes. The product row is updated in place, which keeps its
//     reviews attached; variants are relabelled rather than replaced, so
//     nothing referencing a variant can break.
//
// Wired into scripts/build.mjs ahead of the cover backfill (which then
// attaches public/products/remains-bracelet-001.jpg by the new slug).
//
// DELETE THIS once the preview has been confirmed and the target
// databases have been reseeded from lib/data/products.ts.

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { products } from "../lib/data/products";
import { normalizeSslmode } from "../lib/connectionString";

config({ path: ".env" });

const OLD_SLUG = "urn-sage-001";
const NEW_SLUG = "remains-bracelet-001";

const TAG = "[swap-urn-to-bracelet]";

async function main() {
  const allowed =
    process.env.VERCEL_ENV === "preview" || process.env.ALLOW_LISTING_SWAP === "1";
  if (!allowed) {
    console.log(
      `${TAG} skipped: preview deploys only (VERCEL_ENV=${process.env.VERCEL_ENV ?? "unset"}).`,
    );
    return;
  }
  if (!process.env.DATABASE_URL) {
    console.log(`${TAG} skipped: DATABASE_URL not set.`);
    return;
  }

  // Single source of truth — the listing as defined for the mock seed.
  const seed = products.find((p) => p.id === NEW_SLUG);
  if (!seed) {
    console.log(`${TAG} skipped: ${NEW_SLUG} is no longer in lib/data/products.ts.`);
    return;
  }

  const adapter = new PrismaPg({
    connectionString: normalizeSslmode(process.env.DATABASE_URL),
  });
  const prisma = new PrismaClient({ adapter });

  try {
    if (await prisma.product.findUnique({ where: { slug: NEW_SLUG } })) {
      console.log(`${TAG} nothing to do: ${NEW_SLUG} already exists.`);
      return;
    }

    const old = await prisma.product.findUnique({
      where: { slug: OLD_SLUG },
      include: { variants: { orderBy: { createdAt: "asc" } } },
    });
    if (!old) {
      console.log(
        `${TAG} nothing to do: neither ${OLD_SLUG} nor ${NEW_SLUG} is in this database — ` +
          "it has no example catalog to convert. Run `npm run db:mock` against it to load one.",
      );
      return;
    }

    const productType = await prisma.productType.findUnique({
      where: { slug: seed.productType },
    });
    if (!productType) {
      // The system seed (`prisma db seed`) runs earlier in the build chain,
      // so this should be unreachable — bail loudly rather than guess.
      throw new Error(`product_type "${seed.productType}" missing; run \`prisma db seed\` first.`);
    }

    await prisma.product.update({
      where: { id: old.id },
      data: {
        slug: seed.id,
        title: seed.title,
        description: seed.description,
        details: seed.details as object,
        status: seed.status,
        verified: seed.verified,
        lifeStages: seed.lifeStages,
        productTypeId: productType.id,
      },
    });

    // Relabel the variants the row already has, then add any shortfall.
    // Surplus variants (the old urn had 3) are left alone deliberately:
    // deleting one that a cart or order references would fail.
    for (const [i, v] of seed.variants.entries()) {
      const existing = old.variants[i];
      const data = {
        label: v.label,
        priceCents: Math.round(v.price * 100),
        currency: v.currency,
        stock: v.stock,
      };
      if (existing) {
        await prisma.productVariant.update({ where: { id: existing.id }, data });
      } else {
        await prisma.productVariant.create({ data: { ...data, productId: old.id } });
      }
    }
    const surplus = old.variants.length - seed.variants.length;
    if (surplus > 0) {
      console.log(`${TAG} note: ${surplus} leftover variant(s) kept (safe to prune by hand).`);
    }

    console.log(
      `${TAG} converted ${OLD_SLUG} -> ${NEW_SLUG} ("${seed.title}"), ` +
        `${seed.variants.length} variant(s) rewritten. Reviews preserved.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(`${TAG} failed:`, err);
  process.exit(1);
});
