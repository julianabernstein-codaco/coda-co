-- AlterTable
-- Soft trial window for a services subscription. Both null until the go-live
-- switch starts the trial (status -> trialing, endsAt = startedAt + 3 months).
-- No backfill: existing subscriptions carry no trial. See docs/go-live-plan.md.
ALTER TABLE "subscriptions" ADD COLUMN     "trial_started_at" TIMESTAMP(3),
ADD COLUMN     "trial_ends_at" TIMESTAMP(3);
