"use client";

import { useEffect, useRef } from "react";

type BookshopWidgetProps = {
  /** Book ISBN-13 / SKU to feature. */
  sku: string;
  /** Bookshop widget layout. Defaults to "featured". */
  type?: string;
  /** Render the expanded card with full book info. */
  fullInfo?: boolean;
  /** Bookshop affiliate id earnings are attributed to. */
  affiliateId: string;
  className?: string;
};

/**
 * Renders a Bookshop.org affiliate widget.
 *
 * Bookshop's `widgets.js` injects the widget markup adjacent to its own
 * <script> tag, so the script has to live in the DOM at the spot we want
 * the widget. That can't be expressed as a plain <script> in an RSC, so we
 * append it to a container ref on the client. The cleanup clears the
 * container to stay safe under React Strict Mode's double-invoke.
 */
export function BookshopWidget({
  sku,
  type = "featured",
  fullInfo = true,
  affiliateId,
  className,
}: BookshopWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const script = document.createElement("script");
    script.src = "https://bookshop.org/widgets.js";
    script.async = true;
    script.setAttribute("data-type", type);
    script.setAttribute("data-full-info", String(fullInfo));
    script.setAttribute("data-affiliate-id", affiliateId);
    script.setAttribute("data-sku", sku);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [sku, type, fullInfo, affiliateId]);

  return <div ref={ref} className={className} />;
}
