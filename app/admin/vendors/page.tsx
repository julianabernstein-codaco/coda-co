import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getVendors } from "@/lib/api/vendors";
import { ContactToggle } from "./ContactToggle";

export const metadata: Metadata = {
  title: "Vendor contact links — Admin | CodaCo",
};

// Live view — visibility toggles mutate the DB; never static-prerender.
export const dynamic = "force-dynamic";

export default async function AdminVendorsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/admin/vendors");
  if (session.user.role !== "admin") redirect("/");

  const vendors = await getVendors();

  return (
    <div className="min-h-screen bg-pl2">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Admin", href: "/admin" },
            { label: "Vendor contact links" },
          ]}
        />
        <div className="mb-7 mt-2">
          <p className="text-xs font-medium uppercase tracking-widest text-tr mb-1.5">
            Admin
          </p>
          <h1 className="font-serif text-4xl text-ch">Vendor contact links</h1>
          <p className="text-cm text-sm mt-1.5 max-w-[640px]">
            Choose whether each vendor&apos;s website and Instagram appear on
            their public profile. Both are collected at signup but stay hidden
            until you switch them on. A switch is disabled when the vendor
            hasn&apos;t provided that link.
          </p>
        </div>

        <div className="bg-white rounded-[10px] border border-line overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1.3fr_2fr_2fr] gap-4 px-5 py-3 border-b border-line text-[12px] uppercase tracking-wide text-cl">
            <div>Vendor</div>
            <div>Website</div>
            <div>Instagram</div>
          </div>

          {vendors.length === 0 ? (
            <p className="px-5 py-8 text-[15px] text-cl">No vendors yet.</p>
          ) : (
            vendors.map((v) => (
              <div
                key={v.id}
                className="grid grid-cols-1 sm:grid-cols-[1.3fr_2fr_2fr] gap-3 sm:gap-4 px-5 py-4 border-b border-line last:border-b-0 sm:items-center"
              >
                <div>
                  <div className="text-[15px] font-medium text-ch">{v.name}</div>
                  <div className="text-[12px] text-cl capitalize">{v.kind}</div>
                </div>

                <LinkCell
                  label="Website"
                  value={
                    v.websiteUrl
                      ? v.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
                      : null
                  }
                  href={v.websiteUrl ?? null}
                  toggle={
                    <ContactToggle
                      slug={v.id}
                      field="showWebsite"
                      initial={Boolean(v.showWebsite)}
                      disabled={!v.websiteUrl}
                    />
                  }
                />

                <LinkCell
                  label="Instagram"
                  value={v.instagramHandle ? `@${v.instagramHandle}` : null}
                  href={
                    v.instagramHandle
                      ? `https://instagram.com/${v.instagramHandle}`
                      : null
                  }
                  toggle={
                    <ContactToggle
                      slug={v.id}
                      field="showInstagram"
                      initial={Boolean(v.showInstagram)}
                      disabled={!v.instagramHandle}
                    />
                  }
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function LinkCell({
  label,
  value,
  href,
  toggle,
}: {
  label: string;
  value: string | null;
  href: string | null;
  toggle: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="sm:hidden text-[12px] uppercase tracking-wide text-cl mb-0.5">
          {label}
        </div>
        {value ? (
          href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-[14px] text-tr no-underline hover:underline break-all"
            >
              {value}
            </a>
          ) : (
            <span className="text-[14px] text-ch break-all">{value}</span>
          )
        ) : (
          <span className="text-[14px] text-cl">— none provided</span>
        )}
      </div>
      {toggle}
    </div>
  );
}
