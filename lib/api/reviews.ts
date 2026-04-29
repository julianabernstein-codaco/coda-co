import { reviews, reviewSummaries } from "@/lib/data/reviews";
import type { Review, ReviewSummary } from "@/lib/types";

export async function getReviews(productId: string): Promise<Review[]> {
  return reviews.filter((r) => r.productId === productId);
}

export async function getReviewSummary(productId: string): Promise<ReviewSummary | null> {
  return reviewSummaries.find((s) => s.productId === productId) ?? null;
}
