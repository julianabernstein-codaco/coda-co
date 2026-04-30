interface StarsProps {
  rating: number;
  reviewCount?: number;
  className?: string;
}

export function Stars({ rating, reviewCount, className = "" }: StarsProps) {
  const filled = Math.round(rating);
  const empty = Math.max(0, 5 - filled);
  const stars = "★".repeat(filled) + "☆".repeat(empty);
  const label =
    reviewCount != null
      ? `${rating} out of 5 stars, ${reviewCount} reviews`
      : `${rating} out of 5 stars`;

  return (
    <span className={`text-tr ${className}`.trim()} aria-label={label}>
      {stars}
      {reviewCount != null && ` · ${reviewCount} reviews`}
    </span>
  );
}
