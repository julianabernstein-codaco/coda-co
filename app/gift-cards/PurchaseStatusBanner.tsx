"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { checkGiftCardSettled } from "./actions";
import { formatCents } from "@/lib/format/giftCard";
import type { GiftCardSummary } from "@/lib/api/giftCards";

const POLL_MS = 3000;
const MAX_POLLS = 20; // ~1 minute, then stop and reassure

// Post-purchase status bar for a single gift card. The card settles
// asynchronously (Stripe webhook), so this polls checkGiftCardSettled until
// the card is active, then flips from "settling…" to a "ready" confirmation.
// Each poll also self-heals, so a slow/missed webhook still resolves.
export function PurchaseStatusBanner({
  cardId,
  initial,
}: {
  cardId: string;
  initial: GiftCardSummary;
}) {
  const [summary, setSummary] = useState<GiftCardSummary>(initial);
  const [gaveUp, setGaveUp] = useState(false);

  const settled = summary.found && summary.status !== "pending";

  useEffect(() => {
    if (settled) return;
    let active = true;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      tries += 1;
      const next = await checkGiftCardSettled(cardId);
      if (!active) return;
      setSummary(next);
      if (next.found && next.status !== "pending") return; // settled → stop
      if (tries >= MAX_POLLS) {
        setGaveUp(true);
        return;
      }
      timer = setTimeout(tick, POLL_MS);
    };

    timer = setTimeout(tick, POLL_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [cardId, settled]);

  const amount = summary.found ? formatCents(summary.amountCents) : "";
  const sentTo = summary.found
    ? summary.isSelfPurchase
      ? "to your inbox"
      : summary.recipientName
        ? `to ${summary.recipientName}`
        : "to your recipient"
    : "";

  return (
    <div
      className={`rounded-[10px] border px-5 py-4 mb-6 ${
        settled ? "bg-sg-p border-sg-l" : "bg-pl2 border-tr-l"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {settled ? <CheckIcon /> : <Spinner />}
          <p className="text-[15px] text-sg-d">
            {settled ? (
              <>
                Your {amount} gift card is ready — we&apos;ve emailed it {sentTo}. The
                balance stays on the card until it&apos;s used.
              </>
            ) : gaveUp ? (
              <span className="text-cm">
                Payment received. Your gift card is taking a little longer than usual to
                settle — it&apos;ll arrive by email shortly. You can safely leave this page.
              </span>
            ) : (
              <span className="text-cm">
                Payment received — settling your {amount && `${amount} `}gift card… this
                usually takes just a few seconds.
              </span>
            )}
          </p>
        </div>
        <Link
          href="/"
          className="btn-secondary btn-sm shrink-0 self-start sm:self-auto no-underline"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin shrink-0 mt-0.5"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="#D4876F" strokeWidth="3" strokeOpacity="0.3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="#C1634F" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="shrink-0 mt-0.5"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="#7A9E82" />
      <path
        d="M7.5 12.5l3 3 6-6.5"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
