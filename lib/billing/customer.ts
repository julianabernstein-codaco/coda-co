import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { log } from "@/lib/log";

// Ensure the vendor has a Stripe Customer, creating one on first use and
// persisting the id on vendor_profile. One Customer per vendor, reused for
// both the services subscription and the goods set-up fee.
export async function ensureStripeCustomer(vendorId: string): Promise<string> {
  const vendor = await prisma.vendorProfile.findUnique({
    where: { id: vendorId },
    select: {
      id: true,
      stripeCustomerId: true,
      displayName: true,
      user: { select: { email: true } },
    },
  });
  if (!vendor) throw new Error("Vendor not found");
  if (vendor.stripeCustomerId) return vendor.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: vendor.user.email,
    name: vendor.displayName,
    metadata: { vendorId: vendor.id },
  });

  await prisma.vendorProfile.update({
    where: { id: vendor.id },
    data: { stripeCustomerId: customer.id },
  });
  log.info("billing.customer_created", { vendorId: vendor.id, customerId: customer.id });
  return customer.id;
}
