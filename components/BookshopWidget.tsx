"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type BookshopWidgetProps = {
  /** Book ISBN-13 / SKU to feature. */
  sku: string;
  /** Bookshop widget layout. Defaults to "featured". */
  type?: string;
  /** Render the expanded card with full book info. */
  fullInfo?: boolean;
  /** Bookshop affiliate id earnings are attributed to. */
  affiliateId: string;
  /**
   * Shown until the widget injects its markup. If `widgets.js` is blocked
   * (ad/tracker blockers commonly block bookshop.org) or fails, this stays
   * visible so the slot is never empty.
   */
  fallback?: ReactNode;
  className?: string;
};

/**
 * Renders a Bookshop.org affiliate widget.
 *
 * Bookshop's `widgets.js` injects the widget markup at the location of its
 * own <script> tag (it self-locates via `document.currentScript`), so the
 * script has to live in the DOM where we want the widget. That can't be a
 * plain <script> in an RSC, and a `createElement` + `appendChild` injection
 * runs too late / loses `currentScript` for some embeds. Parsing the markup
 * with `createContextualFragment` produces an *executable* script element
 * (unlike `innerHTML`) that runs with `currentScript` set correctly — the
 * closest client-side equivalent to a parser-inserted tag.
 *
 * A MutationObserver watches the slot; once the widget injects any non-script
 * node we hide the fallback. The cleanup clears the slot so we stay safe
 * under React Strict Mode's double-invoke.
 */
export function BookshopWidget({
  sku,
  type = "featured",
  fullInfo = true,
  affiliateId,
  fallback,
  className,
}: BookshopWidgetProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [widgetRendered, setWidgetRendered] = useState(false);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;

    const markup =
      `<script src="https://bookshop.org/widgets.js"` +
      ` data-type="${type}"` +
      ` data-full-info="${fullInfo}"` +
      ` data-affiliate-id="${affiliateId}"` +
      ` data-sku="${sku}"></script>`;
    slot.appendChild(document.createRange().createContextualFragment(markup));

    const observer = new MutationObserver(() => {
      const hasWidget = Array.from(slot.childNodes).some(
        (node) => !(node instanceof HTMLScriptElement),
      );
      if (hasWidget) {
        setWidgetRendered(true);
        observer.disconnect();
      }
    });
    observer.observe(slot, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      slot.innerHTML = "";
      setWidgetRendered(false);
    };
  }, [sku, type, fullInfo, affiliateId]);

  return (
    <div className={className}>
      <div ref={slotRef} />
      {!widgetRendered && fallback}
    </div>
  );
}
