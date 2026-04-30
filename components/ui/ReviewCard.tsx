import type { Review } from "@/lib/types";
import { Stars } from "@/components/ui/Stars";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="py-5 border-b border-line last:border-b-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13px] font-medium text-ch">{review.reviewer}</span>
        <span className="text-[12px] text-ink">{review.date}</span>
      </div>
      <div className="text-[11px] text-ink mb-2">{review.location}</div>
      <Stars rating={review.rating} className="text-[13px] mb-2 block" />
      <p className="text-[13px] text-ink leading-relaxed">{review.body}</p>
    </div>
  );
}
