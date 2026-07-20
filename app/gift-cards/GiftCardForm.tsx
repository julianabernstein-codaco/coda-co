"use client";

import { useState, useTransition } from "react";
import { purchaseGiftCard } from "./actions";
import {
  GIFT_CARD_PRESETS_CENTS,
  GIFT_CARD_MIN_CENTS,
  GIFT_CARD_MAX_CENTS,
  formatCents,
} from "@/lib/format/giftCard";

type Mode = "solo" | "group";

export function GiftCardForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("solo");
  const [preset, setPreset] = useState<number | "custom">(GIFT_CARD_PRESETS_CENTS[1]);
  const [customDollars, setCustomDollars] = useState("");

  const [purchaserName, setPurchaserName] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [giftMessage, setGiftMessage] = useState("");

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

    const group = mode === "group";
    startTransition(async () => {
      const res = await purchaseGiftCard({
        amountCents,
        purchaserName,
        purchaserEmail,
        pooled: group,
        // A group gift defers the recipient to the manage page; a solo gift
        // names the recipient now (blank recipient email → sent to the buyer).
        recipientEmail: !group ? recipientEmail || undefined : undefined,
        recipientName: !group ? recipientName || undefined : undefined,
        giftMessage: giftMessage || undefined,
      });
      if (res.url) {
        window.location.href = res.url;
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* Mode */}
      <div className="grid grid-cols-2 gap-2">
        <ModeButton
          label="Just from me"
          sub="A gift card from you"
          active={mode === "solo"}
          onClick={() => setMode("solo")}
        />
        <ModeButton
          label="Group gift"
          sub="Let others chip in"
          active={mode === "group"}
          onClick={() => setMode("group")}
        />
      </div>

      {/* Recipient (solo only) — first, so it's clear upfront who it's for */}
      {mode === "solo" && (
        <div className="space-y-4">
          <p className="text-[14px] font-medium text-ch uppercase tracking-wide">Who is this for?</p>
          <Field
            label="Recipient name"
            value={recipientName}
            onChange={setRecipientName}
            required={false}
            hint="Greeted by name at the top of the gift email."
          />
          <Field
            label="Recipient email"
            type="email"
            value={recipientEmail}
            onChange={setRecipientEmail}
            required={false}
            hint="Where we send the gift card. Leave blank to email it to yourself."
          />
          <label className="block">
            <span className="text-[14px] font-medium text-ch uppercase tracking-wide">
              Message (optional)
            </span>
            <textarea
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              rows={3}
              maxLength={500}
              className="mt-1 w-full px-3 py-2 rounded-[8px] border border-line-bold text-[16px] text-ch focus:border-tr outline-none resize-none"
              placeholder="A few words to go with the gift…"
            />
          </label>
          <p className="text-[13px] text-cl leading-relaxed">
            Their email will show: <span className="text-cm">your name, this message, the
            amount, and the code to redeem.</span>
          </p>
        </div>
      )}

      {/* Amount */}
      <fieldset className="space-y-3">
        <legend className="text-[14px] font-medium text-ch uppercase tracking-wide mb-1">
          {mode === "group" ? "Your starting contribution" : "Amount"}
        </legend>
        <div className="grid-auto-130">
          {GIFT_CARD_PRESETS_CENTS.map((cents) => (
            <AmountButton
              key={cents}
              label={formatCents(cents)}
              active={preset === cents}
              onClick={() => setPreset(cents)}
            />
          ))}
          <AmountButton label="Custom" active={preset === "custom"} onClick={() => setPreset("custom")} />
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
                placeholder="75"
              />
            </div>
          </label>
        )}
      </fieldset>

      {/* Buyer */}
      <Field
        label="Your name"
        value={purchaserName}
        onChange={setPurchaserName}
        hint="Shown to the recipient as who the gift is from."
      />
      <Field
        label="Your email"
        type="email"
        value={purchaserEmail}
        onChange={setPurchaserEmail}
        hint={mode === "group" ? "We'll send your share link and manage link here." : "We'll send a receipt here."}
      />

      {mode === "group" && (
        <div className="space-y-4 border-l-2 border-tr-l pl-4">
          <p className="text-[15px] text-cm leading-relaxed">
            After you pay your starting contribution, you'll get a private link to manage the
            gift and a shareable link so others can chip in — no account needed for anyone.
            You choose the recipient and send the gift whenever you're ready.
          </p>
          <label className="block">
            <span className="text-[14px] font-medium text-ch uppercase tracking-wide">
              Message for the recipient (optional)
            </span>
            <textarea
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              rows={3}
              maxLength={500}
              className="mt-1 w-full px-3 py-2 rounded-[8px] border border-line-bold text-[16px] text-ch focus:border-tr outline-none resize-none"
              placeholder="You can edit this later before you send the gift…"
            />
          </label>
        </div>
      )}

      {error && <p className="text-[15px] text-tr">{error}</p>}

      <button type="submit" disabled={pending} className="btn-primary btn-md w-full disabled:opacity-50">
        {pending ? "Starting checkout…" : mode === "group" ? "Start the group gift" : "Continue to payment"}
      </button>
      <p className="text-[14px] text-cl text-center">
        You'll be sent to Stripe to pay securely. The gift card is issued once payment clears.
      </p>
    </form>
  );
}

function ModeButton({
  label,
  sub,
  active,
  onClick,
}: {
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-left px-4 py-3 rounded-[10px] border transition-colors ${
        active ? "border-tr bg-tr-p" : "border-line-bold hover:border-tr-l"
      }`}
    >
      <span className="block text-[16px] font-medium text-ch">{label}</span>
      <span className="block text-[14px] text-cl">{sub}</span>
    </button>
  );
}

function AmountButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`py-2.5 rounded-[10px] border text-[17px] font-medium transition-colors ${
        active ? "border-tr bg-tr-p text-tr-d" : "border-line-bold text-ch hover:border-tr-l"
      }`}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = true,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-[14px] font-medium text-ch uppercase tracking-wide">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-[8px] border border-line-bold text-[16px] text-ch focus:border-tr outline-none"
      />
      {hint && <span className="mt-1 block text-[14px] text-cl">{hint}</span>}
    </label>
  );
}
