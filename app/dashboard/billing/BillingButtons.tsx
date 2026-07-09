"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SubscriptionPlanId } from "@prisma/client";
import {
  cancelServiceSubscription,
  openBillingPortal,
  startGoodsSetupCheckout,
  startServiceSubscriptionCheckout,
  upgradeToAnnual,
  type ActionResult,
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
      {error && <p className="text-[14px] text-tr mt-1.5">{error}</p>}
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
      {error && <p className="text-[14px] text-tr mt-1.5">{error}</p>}
    </div>
  );
}

// Run an in-place action (no redirect), then refresh the page to reflect
// the new state. Errors surface inline.
function useAction() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (action: () => Promise<ActionResult>) => {
    setError(null);
    startTransition(async () => {
      const res = await action();
      if (res.error) setError(res.error);
      else router.refresh();
    });
  };
  return { run, pending, error };
}

export function UpgradeAnnualButton() {
  const { run, pending, error } = useAction();
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => upgradeToAnnual())}
        className="btn-primary btn-md disabled:opacity-60"
      >
        {pending ? "Upgrading…" : "Upgrade to annual membership"}
      </button>
      {error && <p className="text-[14px] text-tr mt-1.5">{error}</p>}
    </div>
  );
}

export function CancelSubButton() {
  const { run, pending, error } = useAction();
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (
            window.confirm(
              "Cancel your subscription? It stays active until the end of the current billing period.",
            )
          ) {
            run(() => cancelServiceSubscription());
          }
        }}
        className="btn-ghost btn-md disabled:opacity-60"
      >
        {pending ? "Cancelling…" : "Cancel subscription"}
      </button>
      {error && <p className="text-[14px] text-tr mt-1.5">{error}</p>}
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
      {error && <p className="text-[14px] text-tr mt-1.5">{error}</p>}
    </div>
  );
}
