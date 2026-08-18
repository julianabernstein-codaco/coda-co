import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { redirectIfVendor } from "@/app/dashboard/lib";
import { GoodsForm } from "@/components/vendor/GoodsForm";
import { prisma } from "@/lib/db";
import { paidFlowsOpenFor } from "@/lib/launch";

export const metadata: Metadata = {
  title: "List goods — CodaCo",
};

// The form posts to a server action that requires a signed-in user. We
// also redirect anonymous visitors here so they don't fill out four
// steps before being asked to sign up.
export default async function ListGoodsPage() {
  const session = await auth();
  if (!session?.user) redirect("/signup?next=/list-with-us/goods");
  await redirectIfVendor(session.user.id);

  // Step 2 collects the seller's first listing, so it needs the same
  // product-type list the dashboard's product form uses.
  const [paidOpen, productTypes] = await Promise.all([
    paidFlowsOpenFor(session.user.role),
    prisma.productType.findMany({
      orderBy: { name: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "List with us", href: "/list-with-us" },
          { label: "List goods" },
        ]}
      />
      <GoodsForm paidOpen={paidOpen} productTypes={productTypes} />
    </>
  );
}
