"use client";

import { useState, useTransition } from "react";
import { contributeToPool } from "../../actions";
import {
  GIFT_CARD_PRESETS_CENTS,
  GIFT_CARD_MIN_CENTS,
  GIFT_CARD_MAX_CENTS,
  formatCents,
} from "@/lib/format/giftCard";

export function ContributeForm({ token }: { token: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [preset, setPreset] = useState<number | "custom">(GIFT_CARD_PRESETS_CENTS[0]);
  const [customDollars, setCustomDollars] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function resolveAmountCents(): number | null {
    if (preset !== "custom") return preset;
    const dollars = Number.parseFloat(customDollars);
    if (!Number.isFinite(dollars)) return null;
    return Math.round(dollars * 100);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const amountCents = resolveAmountCents();
    if (amountCents == null || amountCents < GIFT_CARD_MIN_CENTS || amountCents > GIFT_CARD_MAX_CENTS) {
      setError(
        `Choose an amount between ${formatCents(GIFT_CARD_MIN_CENTS)} and ${formatCents(GIFT_CARD_MAX_CENTS)}.`,
      );
      return;
    }

    startTransition(async () => {
      const res = await contributeToPool(token, {
        amountCents,
        contributorName: name || undefined,
        contributorEmail: email || undefined,
      });
      if (res.url) {
        window.location.href = res.url;
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-[14px] font-medium text-ch uppercase tracking-wide mb-1">
          Your contribution
        </legend>
        <div className="grid-auto-130">
          {GIFT_CARD_PRESETS_CENTS.map((cents) => (
            <button
              key={cents}
              type="button"
              onClick={() => setPreset(cents)}
              aria-pressed={preset === cents}
              className={`py-2.5 rounded-[10px] border text-[17px] font-medium transition-colors ${
                preset === cents
                  ? "border-tr bg-tr-p text-tr-d"
                  : "border-line-bold text-ch hover:border-tr-l"
              }`}
            >
              {formatCents(cents)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPreset("custom")}
            aria-pressed={preset === "custom"}
            className={`py-2.5 rounded-[10px] border text-[17px] font-medium transition-colors ${
              preset === "custom"
                ? "border-tr bg-tr-p text-tr-d"
                : "border-line-bold text-ch hover:border-tr-l"
            }`}
          >
            Custom
          </button>
        </div>
        {preset === "custom" && (
          <label className="block max-w-[200px]">
            <span className="text-[14px] text-cl">Custom amount (USD)</span>
            <div className="mt-1 flex items-center rounded-[8px] border border-line-bold focus-within:border-tr px-3">
              <span className="text-[16px] text-cl">$</span>
              <input
                type="number"
                min={GIFT_CARD_MIN_CENTS / 100}
                max={GIFT_CARD_MAX_CENTS / 100}
                step="1"
                value={customDollars}
                onChange={(e) => setCustomDollars(e.target.value)}
                className="w-full py-2 pl-1 text-[16px] text-ch outline-none bg-transparent"
                placeholder="25"
              />
            </div>
          </label>
        )}
      </fieldset>

      <label className="block">
        <span className="text-[14px] font-medium text-ch uppercase tracking-wide">
          Your name (optional)
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-[8px] border border-line-bold text-[16px] text-ch focus:border-tr outline-none"
          placeholder="So the organizer knows who chipped in"
        />
      </label>

      <label className="block">
        <span className="text-[14px] font-medium text-ch uppercase tracking-wide">
          Your email (optional)
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-[8px] border border-line-bold text-[16px] text-ch focus:border-tr outline-none"
          placeholder="For your Stripe receipt"
        />
      </label>

      {error && <p className="text-[15px] text-tr">{error}</p>}

      <button type="submit" disabled={pending} className="btn-primary btn-md w-full disabled:opacity-50">
        {pending ? "Starting checkout…" : "Contribute"}
      </button>
      <p className="text-[14px] text-cl text-center">
        No account needed — you'll pay securely through Stripe.
      </p>
    </form>
  );
}
