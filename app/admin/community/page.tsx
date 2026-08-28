import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getServiceTypes } from "@/lib/api/serviceTypes";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/app/admin/lib";
import { CommunityForm } from "./CommunityForm";

export const metadata: Metadata = {
  title: "Community listings — Admin | CodaCo",
};

export const dynamic = "force-dynamic";

export default async function AdminCommunityPage() {
  await requireAdminPage("/admin/community");
  const [serviceTypes, listings] = await Promise.all([
    getServiceTypes(),
    prisma.vendorProfile.findMany({
      where: { communityListing: true },
      select: { slug: true, displayName: true, location: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-pl2">
      <div className="max-w-screen-md mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Admin", href: "/admin" },
            { label: "Community listings" },
          ]}
        />
        <div className="mb-7 mt-2">
          <p className="text-xs font-medium uppercase tracking-widest text-tr mb-1.5">Admin</p>
          <h1 className="font-serif text-4xl text-ch">Create a community listing</h1>
          <p className="text-cm text-sm mt-1.5 max-w-[640px]">
            For volunteer-led end-of-life resources (Death Cafés, grief circles,
            hotlines) that meet our community guidelines. Creates a free,
            published listing with a &ldquo;Community resource&rdquo; badge — no
            subscription, no charge. The org has no login; client inquiries
            reach the contact email you enter, and you maintain the listing.
          </p>
        </div>

        <CommunityForm serviceTypes={serviceTypes} />

        <div className="mt-10">
          <h2 className="font-serif text-2xl text-ch mb-3">
            Existing community listings{" "}
            <span className="text-cl text-lg">({listings.length})</span>
          </h2>
          {listings.length === 0 ? (
            <p className="text-cm text-sm">None yet.</p>
          ) : (
            <div className="bg-white rounded-[10px] border border-line">
              {listings.map((l) => (
                <div
                  key={l.slug}
                  className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="text-[15px] font-medium text-ch truncate">{l.displayName}</div>
                    <div className="text-[13px] text-cl">{l.location}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href={`/services/${l.slug}`}
                      className="text-[13px] text-cm no-underline hover:text-tr"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/community/${l.slug}`}
                      className="btn-ghost btn-sm no-underline"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
