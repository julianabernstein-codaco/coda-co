import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/app/admin/lib";

export const metadata: Metadata = {
  title: "Incomplete signups — Admin | CodaCo",
};

// Live admin view — reflects the current set of in-progress signups.
export const dynamic = "force-dynamic";

function fmt(d: Date): string {
  // "2026-08-28 14:32" — enough to gauge how stale a draft is.
  return d.toISOString().replace("T", " ").slice(0, 16);
}

function kindLabel(kind: string): string {
  if (kind === "goods") return "Goods";
  if (kind === "services") return "Services";
  if (kind === "both") return "Goods & services";
  return "—";
}

export default async function AdminSignupsPage() {
  await requireAdminPage("/admin/signups");

  const drafts = await prisma.vendorSignupDraft.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      orgName: true,
      email: true,
      kind: true,
      lastStep: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-pl2">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Admin", href: "/admin" },
            { label: "Incomplete signups" },
          ]}
        />
        <div className="mb-7 mt-2">
          <p className="text-xs font-medium uppercase tracking-widest text-tr mb-1.5">Admin</p>
          <h1 className="font-serif text-4xl text-ch">
            Incomplete signups{" "}
            <span className="text-cl text-2xl">({drafts.length})</span>
          </h1>
          <p className="text-cm text-sm mt-1.5 max-w-[640px]">
            People who started listing as a vendor but haven&apos;t submitted.
            A row disappears here once they finish (a real application is
            created). Emails are from their existing account.
          </p>
        </div>

        {drafts.length === 0 ? (
          <div className="bg-white rounded-[10px] border border-line p-8 text-center text-cm text-sm">
            No incomplete signups right now.
          </div>
        ) : (
          <div className="bg-white rounded-[10px] border border-line overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pl border-b border-line">
                <tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Listing</Th>
                  <Th>Progress</Th>
                  <Th>Started</Th>
                  <Th>Last activity</Th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((d) => (
                  <tr key={d.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3 align-top text-[14px] text-ch">
                      {d.orgName || <span className="text-cl">—</span>}
                    </td>
                    <td className="px-4 py-3 align-top text-[13px] text-cm">
                      {d.email ? (
                        <a href={`mailto:${d.email}`} className="text-tr no-underline hover:underline">
                          {d.email}
                        </a>
                      ) : (
                        <span className="text-cl">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-[13px] text-cm">{kindLabel(d.kind)}</td>
                    <td className="px-4 py-3 align-top text-[13px] text-cm whitespace-nowrap">
                      Step {d.lastStep + 1}
                    </td>
                    <td className="px-4 py-3 align-top text-[12px] text-cl whitespace-nowrap">
                      {fmt(d.createdAt)}
                    </td>
                    <td className="px-4 py-3 align-top text-[12px] text-cl whitespace-nowrap">
                      {fmt(d.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-cl whitespace-nowrap">
      {children}
    </th>
  );
}
