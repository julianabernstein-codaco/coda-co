"use client";

import { useState, useTransition } from "react";
import type { SubscriptionPlanId } from "@prisma/client";
import {
  openBillingPortal,
  startGoodsSetupCheckout,
  startServiceSubscriptionCheckout,
  type CheckoutResult,
} from "./actions";

// Run a checkout/portal action, then send the browser to the Stripe-hosted
// URL it returns. Errors surface inline.
function useCheckout() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const go = (action: () => Promise<CheckoutResult>) => {
    setError(null);
    startTransition(async () => {
      const res = await action();
      if (res.url) window.location.href = res.url;
      else setError(res.error ?? "Something went wrong.");
    });
  };
  return { go, pending, error };
}

export function SubscribeButton({
  planId,
  label,
  primary,
}: {
  planId: SubscriptionPlanId;
  label: string;
  primary?: boolean;
}) {
  const { go, pending, error } = useCheckout();
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => go(() => startServiceSubscriptionCheckout(planId))}
        className={`${primary ? "btn-primary" : "btn-secondary"} btn-md disabled:opacity-60`}
      >
        {pending ? "Starting…" : label}
      </button>
      {error && <p className="text-[12px] text-tr mt-1.5">{error}</p>}
    </div>
  );
}

export function SetupFeeButton({ label }: { label: string }) {
  const { go, pending, error } = useCheckout();
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => go(() => startGoodsSetupCheckout())}
        className="btn-primary btn-md disabled:opacity-60"
      >
        {pending ? "Starting…" : label}
      </button>
      {error && <p className="text-[12px] text-tr mt-1.5">{error}</p>}
    </div>
  );
}

export function PortalButton() {
  const { go, pending, error } = useCheckout();
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => go(() => openBillingPortal())}
        className="btn-secondary btn-md disabled:opacity-60"
      >
        {pending ? "Opening…" : "Manage billing"}
      </button>
      {error && <p className="text-[12px] text-tr mt-1.5">{error}</p>}
    </div>
  );
}
