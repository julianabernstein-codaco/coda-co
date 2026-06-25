import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Container } from "@/components/ui/Container";
import {
  getWaitlistInterestCounts,
  getWaitlistSignups,
  WAITLIST_INTEREST_LABELS,
} from "@/lib/api/waitlist";

export const metadata: Metadata = {
  title: "Waitlist — Admin | CodaCo",
};

// Live admin view — never static-prerender. Each render reflects the
// current set of pre-launch signups.
export const dynamic = "force-dynamic";

export default async function AdminWaitlistPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/admin/waitlist");
  if (session.user.role !== "admin") redirect("/");

  const [signups, counts] = await Promise.all([
    getWaitlistSignups(),
    getWaitlistInterestCounts(),
  ]);

  const summary = [
    { label: "Total", count: signups.length, color: "bg-pl border-pl2" },
    { label: "Customers", count: counts.customer, color: "bg-sg-p border-sg-l/40" },
    { label: "Vendors", count: counts.vendor, color: "bg-sg-p border-sg-l/40" },
    { label: "Makers", count: counts.maker, color: "bg-tr-p border-tr-l/40" },
    // "No interest picked" signups — Total minus the three above.
    { label: "Unspecified", count: counts.unknown, color: "bg-pl2 border-line" },
  ];

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Waitlist" },
        ]}
      />

      <section className="bg-pl2 px-4 sm:px-10 py-10 min-h-screen">
        <Container width="wide">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[.14em] uppercase text-tr mb-1.5">Admin</p>
              <h1 className="font-serif text-[32px] font-light text-ch">Waitlist</h1>
              <p className="text-[13px] text-cl mt-1.5">
                Everyone who signed up on{" "}
                <code className="text-ch bg-pl px-1 py-0.5 rounded">/launching</code>, newest
                first. Re-signups update the existing row rather than duplicating.
              </p>
            </div>
            {signups.length > 0 && (
              <a href="/admin/waitlist/export" className="btn-secondary btn-sm no-underline shrink-0">
                Export CSV
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-7">
            {summary.map(({ label, count, color }) => (
              <div key={label} className={`rounded-lg border px-4 py-3 ${color}`}>
                <p className="text-2xl font-serif text-ch tabular-nums">{count}</p>
                <p className="text-xs text-cm mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {signups.length === 0 ? (
            <div className="bg-white rounded-[10px] border border-line p-10 text-center">
              <p className="text-[14px] text-cm">
                No signups yet. They&apos;ll appear here as soon as people join from the
                launching page.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-[10px] border border-line overflow-hidden">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-line bg-pl2/60 text-cl">
                    <th className="font-medium px-4 py-2.5">Email</th>
                    <th className="font-medium px-4 py-2.5">Interest</th>
                    <th className="font-medium px-4 py-2.5">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {signups.map((s) => (
                    <tr key={s.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-2.5 text-ch">{s.email}</td>
                      <td className="px-4 py-2.5 text-cm">
                        {WAITLIST_INTEREST_LABELS[s.interest]}
                      </td>
                      <td className="px-4 py-2.5 text-cm tabular-nums">
                        {s.createdAt.toISOString().slice(0, 10)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
