"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { approveListing, rejectListing } from "./actions";

export interface Listing {
  id: string;
  title: string;
  slug: string;
  productType: string;
  priceLabel: string;
  description: string;
  coverImageUrl: string | null;
  // Extra photos the seller added from the product editor (the signup
  // wizard only collects a cover).
  gallery: { id: string; url: string; alt: string | null }[];
  vendorName: string;
  vendorEmail: string;
  vendorLocation: string;
  submittedAt: string;
}

export function ListingReviewCard({ listing }: { listing: Listing }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: (id: string) => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await fn(listing.id);
      if (!result.ok) setError(result.error ?? "Something went wrong.");
    });
  }

  return (
    <div className="bg-white rounded-[10px] border border-line p-5 flex flex-col md:flex-row gap-5">
      {/* Photo — the whole point of the review */}
      <div className="shrink-0">
        {listing.coverImageUrl ? (
          <a
            href={listing.coverImageUrl}
            target="_blank"
            rel="noreferrer"
            className="block relative w-full md:w-[220px] aspect-square rounded-[8px] overflow-hidden border border-line bg-pl2"
          >
            <Image
              src={listing.coverImageUrl}
              alt={listing.title}
              fill
              sizes="220px"
              className="object-cover"
            />
          </a>
        ) : (
          <div className="w-full md:w-[220px] aspect-square rounded-[8px] border border-tr-l bg-tr-p flex items-center justify-center px-4">
            <span className="text-[14px] text-tr-d text-center">
              No cover photo — this listing can&apos;t be published until the
              seller adds one.
            </span>
          </div>
        )}
        {listing.gallery.length > 0 && (
          <div className="flex gap-2 mt-2">
            {listing.gallery.map((img) => (
              <a
                key={img.id}
                href={img.url}
                target="_blank"
                rel="noreferrer"
                className="relative w-[52px] h-[52px] rounded-[6px] overflow-hidden border border-line bg-pl2"
              >
                <Image
                  src={img.url}
                  alt={img.alt ?? ""}
                  fill
                  sizes="52px"
                  className="object-cover"
                />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-serif text-[22px] font-light text-ch leading-tight">
          {listing.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[14px] text-cm">
          <span>{listing.productType}</span>
          <span className="text-cl">·</span>
          <span className="tabular-nums">{listing.priceLabel}</span>
          <span className="text-cl">·</span>
          <span className="text-cl">Submitted {listing.submittedAt}</span>
        </div>

        <p className="text-[15px] text-cm leading-relaxed mt-3 whitespace-pre-line">
          {listing.description || (
            <span className="text-cl italic">No description.</span>
          )}
        </p>

        <div className="mt-4 pt-4 border-t border-line text-[14px]">
          <div className="text-[13px] tracking-[.08em] uppercase text-cl mb-1">
            Seller
          </div>
          <div className="text-ch">
            {listing.vendorName}{" "}
            <span className="text-cl">· {listing.vendorLocation}</span>
          </div>
          <a
            href={`mailto:${listing.vendorEmail}`}
            className="text-tr no-underline hover:underline"
          >
            {listing.vendorEmail}
          </a>
          <div className="text-[13px] text-cl mt-1">slug: {listing.slug}</div>
        </div>

        <div className="flex flex-wrap gap-3 items-center mt-5">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(approveListing)}
            className="btn-primary btn-sm disabled:opacity-60"
          >
            {pending ? "…" : "Approve & publish"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(rejectListing)}
            className="btn-ghost btn-sm disabled:opacity-60"
          >
            Send back to draft
          </button>
          {error && <span className="text-[14px] text-tr-d">{error}</span>}
        </div>
      </div>
    </div>
  );
}
