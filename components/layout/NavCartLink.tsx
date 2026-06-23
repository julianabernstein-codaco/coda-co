"use client";

import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";

// Client island for the server-rendered Nav: reads the localStorage-backed
// cart count and shows a badge. Lives inside CartProvider (mounted in the
// root layout), so the context is available at runtime. Count is 0 on the
// first client render (before localStorage hydrates), matching the server
// render — no hydration mismatch; the badge just appears once hydrated.
export function NavCartLink() {
  const { count } = useCart();
  return (
    <li>
      <Link
        href="/cart"
        aria-label={count > 0 ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart"}
        className="relative flex items-center text-cm hover:text-tr transition-colors duration-150"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 4h2l2.2 11.2a1.6 1.6 0 0 0 1.57 1.3h8.46a1.6 1.6 0 0 0 1.57-1.27L20.5 8H6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9.5" cy="20" r="1.25" fill="currentColor" />
          <circle cx="17" cy="20" r="1.25" fill="currentColor" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-tr text-white text-[10px] font-medium flex items-center justify-center">
            {count}
          </span>
        )}
      </Link>
    </li>
  );
}
