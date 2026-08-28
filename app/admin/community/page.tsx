import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getServiceTypes } from "@/lib/api/serviceTypes";
import { requireAdminPage } from "@/app/admin/lib";
import { CommunityForm } from "./CommunityForm";

export const metadata: Metadata = {
  title: "Community listings — Admin | CodaCo",
};

export const dynamic = "force-dynamic";

export default async function AdminCommunityPage() {
  await requireAdminPage("/admin/community");
  const serviceTypes = await getServiceTypes();

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
      </div>
    </div>
  );
}
