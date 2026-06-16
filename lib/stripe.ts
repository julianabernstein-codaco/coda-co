import Stripe from "stripe";
import { log } from "./log";

// Lazy Stripe client, mirroring lib/db.ts. STRIPE_SECRET_KEY is read on
// first use rather than at module load so `next build`'s page-data
// collection (which imports route modules transitively) never crashes on
// a missing key. Swap test/live by swapping the env var.
let client: Stripe | undefined;

function buildClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    log.error("stripe.missing_secret_key");
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  // Omit apiVersion so the SDK pins the version it was built against;
  // upgrading the package is the deliberate way to move API versions.
  return new Stripe(key);
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    client ??= buildClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

// True when a Stripe key is configured. Lets the dashboard degrade
// gracefully (show "billing not configured" instead of throwing) before
// the keys are wired into an environment.
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
