"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { lookupGiftCardAction, claimGiftCardAction } from "../actions";
import { formatCents } from "@/lib/format/giftCard";
import type { GiftCardLookup } from "@/lib/api/giftCards";

export function RedeemForm({ signedIn }: { signedIn: boolean }) {
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<GiftCardLookup | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);

  function check(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    setClaimed(false);
    startTransition(async () => {
      setResult(await lookupGiftCardAction(code));
    });
  }

  function claim() {
    setNotice(null);
    startTransition(async () => {
      const res = await claimGiftCardAction(code);
      if (res.ok) {
        setClaimed(true);
        setResult((r) =>
          r?.found ? { ...r, balanceCents: res.balanceCents, claimedByUserId: "self" } : r,
        );
      } else {
        setNotice(res.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      <form onSubmit={check} className="space-y-3">
        <label className="block">
          <span className="text-[12px] font-medium text-ch uppercase tracking-wide">
            Gift card code
          </span>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            autoCapitalize="characters"
            placeholder="XXXX-XXXX-XXXX"
            className="mt-1 w-full px-3 py-2 rounded-[8px] border border-line-bold text-[14px] tracking-[.08em] text-ch focus:border-tr outline-none"
          />
        </label>
        <button type="submit" disabled={pending} className="btn-primary btn-md w-full disabled:opacity-50">
          {pending ? "Checking…" : "Check balance"}
        </button>
      </form>

      {result && <ResultPanel result={result} signedIn={signedIn} claimed={claimed} onClaim={claim} pending={pending} />}
      {notice && <p className="text-[13px] text-tr">{notice}</p>}
    </div>
  );
}

function ResultPanel({
  result,
  signedIn,
  claimed,
  onClaim,
  pending,
}: {
  result: GiftCardLookup;
  signedIn: boolean;
  claimed: boolean;
  onClaim: () => void;
  pending: boolean;
}) {
  if (!result.found) {
    return (
      <div className="bg-white border border-line rounded-[10px] px-5 py-4">
        <p className="text-[13px] text-cm">
          We couldn't find a gift card with that code. Double-check it and try again.
        </p>
      </div>
    );
  }

  if (result.status === "pending") {
    return (
      <div className="bg-white border border-line rounded-[10px] px-5 py-4">
        <p className="text-[13px] text-cm">
          This gift card isn't active yet — its payment is still clearing. Try again in a
          moment.
        </p>
      </div>
    );
  }

  if (result.status === "void") {
    return (
      <div className="bg-white border border-line rounded-[10px] px-5 py-4">
        <p className="text-[13px] text-cm">This gift card is no longer valid.</p>
      </div>
    );
  }

  const depleted = result.status === "depleted" || result.balanceCents <= 0;
  const alreadyMine = result.claimedByUserId === "self";

  return (
    <div className="bg-sg-p border border-sg-l rounded-[10px] px-5 py-5 space-y-3">
      <div>
        <div className="text-[12px] text-sg-d uppercase tracking-wide">Balance</div>
        <div className="font-serif text-[30px] font-light text-ch">
          {formatCents(result.balanceCents)}
        </div>
      </div>

      {depleted ? (
        <p className="text-[13px] text-cm">This gift card's balance has been fully used.</p>
      ) : claimed || alreadyMine ? (
        <p className="text-[13px] text-sg-d">
          Added to your account — the balance will apply automatically at checkout.
        </p>
      ) : signedIn ? (
        <button type="button" onClick={onClaim} disabled={pending} className="btn-secondary btn-sm disabled:opacity-50">
          {pending ? "Adding…" : "Add to my account"}
        </button>
      ) : (
        <p className="text-[13px] text-cm">
          <Link href="/login?next=/gift-cards/redeem" className="text-tr underline">
            Sign in
          </Link>{" "}
          to add this balance to your account, or enter the code at checkout.
        </p>
      )}
    </div>
  );
}
