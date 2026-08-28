import type { Metadata } from 'next';
import { requireAdminPage } from '@/app/admin/lib';
import { goodsPlans, servicePlans } from '@/lib/data/plans';
import { prisma } from '@/lib/db';
import { getProducts } from '@/lib/api/products';
import { getServices } from '@/lib/api/services';
import { getAccountHolders } from '@/lib/api/users';
import { getVendors } from '@/lib/api/vendors';
import { DatabaseViewer } from '@/components/admin/DatabaseViewer';

export const metadata: Metadata = {
  title: 'Database Viewer — Admin | CodaCo',
};

// Live admin view — never static-prerender. Each render reflects current DB.
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requireAdminPage('/admin');

  const plans = [...goodsPlans, ...servicePlans];
  const [products, vendors, services, accounts, reviewRows, vendorReviewRows] = await Promise.all([
    getProducts(),
    getVendors(),
    getServices(),
    getAccountHolders(),
    prisma.productReview.findMany({
      include: { product: { select: { slug: true } } },
      orderBy: { reviewedAt: "desc" },
    }),
    prisma.vendorReview.findMany({
      include: { vendor: { select: { slug: true } } },
      orderBy: { reviewedAt: "desc" },
    }),
  ]);

  const reviews = reviewRows.map((r) => ({
    id: r.id,
    productId: r.product.slug,
    reviewer: r.reviewerName,
    location: r.reviewerLocation,
    date: r.reviewedAt.toISOString().slice(0, 10),
    rating: r.rating,
    body: r.body,
  }));

  const vendorReviews = vendorReviewRows.map((r) => ({
    id: r.id,
    vendorId: r.vendor.slug,
    reviewer: r.reviewerName,
    location: r.reviewerLocation,
    date: r.reviewedAt.toISOString().slice(0, 10),
    rating: r.rating,
    body: r.body,
  }));

  const customerCount = accounts.filter((a) => a.vendorSlug === null).length;

  return (
    <div className="min-h-screen bg-pl2">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-tr mb-1.5">Admin</p>
            <h1 className="font-serif text-4xl text-ch">Database Viewer</h1>
            <p className="text-cm text-sm mt-1.5">
              Read-only view of all database records.{' '}
              <span className="text-cl">Admin-only — includes account holder emails.</span>
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <a
              href="/admin/launch"
              className="btn-secondary btn-sm no-underline"
            >
              Launch →
            </a>
            <a
              href="/admin/applications"
              className="btn-secondary btn-sm no-underline"
            >
              Vendor applications →
            </a>
            <a
              href="/admin/vendors"
              className="btn-secondary btn-sm no-underline"
            >
              Vendor contact links →
            </a>
            <a
              href="/admin/community"
              className="btn-secondary btn-sm no-underline"
            >
              Community listing →
            </a>
            <a
              href="/admin/listings"
              className="btn-secondary btn-sm no-underline"
            >
              Listing review →
            </a>
            <a
              href="/admin/email-preview"
              className="btn-secondary btn-sm no-underline"
            >
              Email preview →
            </a>
            <a
              href="/admin/waitlist"
              className="btn-secondary btn-sm no-underline"
            >
              Waitlist →
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-7">
          {[
            { label: 'Products', count: products.length, color: 'bg-tr-p border-tr-l/40' },
            { label: 'Vendors', count: vendors.length, color: 'bg-sg-p border-sg-l/40' },
            { label: 'Services', count: services.length, color: 'bg-sg-p border-sg-l/40' },
            { label: 'Reviews', count: reviews.length + vendorReviews.length, color: 'bg-pl border-pl2' },
            { label: 'Accounts', count: accounts.length, color: 'bg-pl border-pl2' },
            // Accounts with no vendor_profile — the customer side of the base.
            { label: 'Customers', count: customerCount, color: 'bg-pl border-pl2' },
          ].map(({ label, count, color }) => (
            <div key={label} className={`rounded-lg border px-4 py-3 ${color}`}>
              <p className="text-2xl font-serif text-ch tabular-nums">{count}</p>
              <p className="text-xs text-cm mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <DatabaseViewer
          products={products}
          vendors={vendors}
          services={services}
          reviews={reviews}
          vendorReviews={vendorReviews}
          plans={plans}
          accounts={accounts}
        />
      </div>
    </div>
  );
}
