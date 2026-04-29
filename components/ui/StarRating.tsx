interface StarRatingProps {
  rating: number;
  className?: string;
}

export function StarRating({ rating, className = "" }: StarRatingProps) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < full) return "★";
    if (i === full && half) return "★"; // simplified — treat as full for display
    return "☆";
  });

  return (
    <span className={`text-tr ${className}`} aria-label={`${rating} out of 5 stars`}>
      {stars.join("")}
    </span>
  );
}
