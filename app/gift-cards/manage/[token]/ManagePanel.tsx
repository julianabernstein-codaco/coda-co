"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deliverGiftCardAction } from "../../actions";

export function ShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — the input is selectable as a fallback.
    }
  }

  return (
    <div className="flex gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.target.select()}
        className="flex-1 px-3 py-2 rounded-[8px] border border-line-bold text-[13px] text-cm bg-white outline-none"
      />
      <button type="button" onClick={copy} className="btn-secondary btn-sm shrink-0">
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function DeliverForm({
  token,
  alreadyDelivered,
  defaultName,
  defaultEmail,
  defaultMessage,
}: {
  token: string;
  alreadyDelivered: boolean;
  defaultName: string;
  defaultEmail: string;
  defaultMessage: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const [recipientEmail, setRecipientEmail] = useState(defaultEmail);
  const [recipientName, setRecipientName] = useState(defaultName);
  const [giftMessage, setGiftMessage] = useState(defaultMessage);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSent(false);
    startTransition(async () => {
      const res = await deliverGiftCardAction(token, {
        recipientEmail,
        recipientName: recipientName || undefined,
        giftMessage: giftMessage || undefined,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setSent(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-[12px] font-medium text-ch uppercase tracking-wide">
          Recipient email
        </span>
        <input
          type="email"
          required
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-[8px] border border-line-bold text-[14px] text-ch focus:border-tr outline-none"
        />
      </label>
      <label className="block">
        <span className="text-[12px] font-medium text-ch uppercase tracking-wide">
          Recipient name (optional)
        </span>
        <input
          type="text"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-[8px] border border-line-bold text-[14px] text-ch focus:border-tr outline-none"
        />
      </label>
      <label className="block">
        <span className="text-[12px] font-medium text-ch uppercase tracking-wide">
          Message (optional)
        </span>
        <textarea
          value={giftMessage}
          onChange={(e) => setGiftMessage(e.target.value)}
          rows={3}
          maxLength={500}
          className="mt-1 w-full px-3 py-2 rounded-[8px] border border-line-bold text-[14px] text-ch focus:border-tr outline-none resize-none"
        />
      </label>

      {error && <p className="text-[13px] text-tr">{error}</p>}
      {sent && (
        <p className="text-[13px] text-sg-d">
          Sent — the recipient has the gift card by email. You can keep collecting top-ups.
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary btn-md disabled:opacity-50">
        {pending
          ? "Sending…"
          : alreadyDelivered
            ? "Re-send the gift"
            : "Send the gift to the recipient"}
      </button>
    </form>
  );
}
