"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

type BookCoverProps = {
  isbn: string;
  title: string;
  author: string;
  /** Fallback spine color, used when no cover image is available. */
  bg: string;
  /** Fallback geometric overlay, used when no cover image is available. */
  overlay: ReactNode;
};

/**
 * Book cover for a /books tile. Loads the cover from Open Library by ISBN
 * (`?default=false` makes a missing cover 404 rather than return a blank
 * pixel, so `onError` fires). On any miss or load failure it falls back to
 * the original colored spine + geometric overlay, so the tile is never a
 * broken image.
 */
export function BookCover({ isbn, title, author, bg, overlay }: BookCoverProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="h-[168px] flex items-end p-3.5 relative overflow-hidden"
        style={{ background: bg }}
      >
        <div className="absolute inset-0 opacity-[.13]">{overlay}</div>
        <div className="relative z-10">
          <div className="font-serif text-[17px] font-normal text-white/95 leading-[1.2]">
            {title}
          </div>
          <div className="text-[11px] text-white/70 mt-1 italic">{author}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[168px] relative overflow-hidden bg-white">
      <Image
        src={`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`}
        alt={`${title} by ${author}`}
        fill
        sizes="(max-width: 768px) 50vw, 220px"
        className="object-contain p-2"
        onError={() => setFailed(true)}
        unoptimized
      />
    </div>
  );
}
