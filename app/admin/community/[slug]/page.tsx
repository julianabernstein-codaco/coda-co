import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getServiceTypes } from "@/lib/api/serviceTypes";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/app/admin/lib";
import { CommunityForm, type CommunityFormInitial } from "../CommunityForm";

export const metadata: Metadata = {
  title: "Edit community listing — Admin | CodaCo",
};

export const dynamic = "force-dynamic";

export default async function EditCommunityListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireAdminPage(`/admin/community/${slug}`);

  const [serviceTypes, vendor] = await Promise.all([
    getServiceTypes(),
    prisma.vendorProfile.findUnique({
      where: { slug },
      select: {
        slug: true,
        communityListing: true,
        displayName: true,
        bio: true,
        location: true,
        zip: true,
        serviceDescription: true,
        websiteUrl: true,
        photoSrc: true,
        user: { select: { email: true } },
        services: {
          orderBy: { createdAt: "asc" },
          take: 1,
          select: { locationType: true, serviceType: { select: { slug: true } } },
        },
      },
    }),
  ]);

  // This editor is only for community listings — regular vendors edit from
  // their own dashboard.
  if (!vendor || !vendor.communityListing) notFound();

  // location is stored as "City, ST" — split on the last comma.
  const idx = vendor.location.lastIndexOf(", ");
  const city = idx >= 0 ? vendor.location.slice(0, idx) : vendor.location;
  const state = idx >= 0 ? vendor.location.slice(idx + 2) : "";

  const svc = vendor.services[0];
  const rawLoc = svc?.locationType;
  const locationType: "in_person" | "virtual" | "both" =
    rawLoc === "virtual" || rawLoc === "both" ? rawLoc : "in_person";

  const initial: CommunityFormInitial = {
    orgName: vendor.displayName,
    contactEmail: vendor.user.email,
    city,
    state,
    zip: vendor.zip ?? "",
    serviceTypeSlug: svc?.serviceType.slug ?? "",
    locationType,
    bio: vendor.bio,
    serviceDescription: vendor.serviceDescription ?? "",
    website: vendor.websiteUrl ?? "",
    currentPhotoSrc: vendor.photoSrc,
  };

  return (
    <div className="min-h-screen bg-pl2">
      <div className="max-w-screen-md mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Admin", href: "/admin" },
            { label: "Community listings", href: "/admin/community" },
            { label: vendor.displayName },
          ]}
        />
        <div className="mb-7 mt-2">
          <p className="text-xs font-medium uppercase tracking-widest text-tr mb-1.5">Admin</p>
          <h1 className="font-serif text-4xl text-ch">Edit community listing</h1>
          <p className="text-cm text-sm mt-1.5 max-w-[640px]">
            Update this organization&apos;s public profile. Changing the contact
            email keeps their inquiries routing correctly. The listing stays
            free and published.
          </p>
        </div>

        <CommunityForm serviceTypes={serviceTypes} initial={initial} editSlug={vendor.slug} />
      </div>
    </div>
  );
}
