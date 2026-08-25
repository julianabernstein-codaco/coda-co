// One-off: flag existing mock/sample vendors as `demo` so they render with
// the "Example" badge and disabled contact/purchase. Mock accounts use the
// reserved `@codaco.local` email domain (see prisma/mock.ts), which real
// users can't collide with — that's the marker. Idempotent.
//
//   DATABASE_URL=... npm run demo:flag
//
// New mock seeds set demo=true directly; this backfills a DB that was
// seeded before the flag existed.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { normalizeSslmode } from "../lib/connectionString";

config({ path: ".env" });

const adapter = new PrismaPg({
  connectionString: normalizeSslmode(process.env.DATABASE_URL!),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const mock = await prisma.vendorProfile.findMany({
    where: { user: { email: { endsWith: "@codaco.local" } } },
    select: { id: true, slug: true },
  });
  if (mock.length === 0) {
    console.log("No @codaco.local vendors found — nothing to flag.");
    return;
  }
  const result = await prisma.vendorProfile.updateMany({
    where: { id: { in: mock.map((v) => v.id) } },
    data: { demo: true },
  });
  console.log(
    `Flagged ${result.count} vendor(s) as demo: ${mock.map((v) => v.slug).join(", ")}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
