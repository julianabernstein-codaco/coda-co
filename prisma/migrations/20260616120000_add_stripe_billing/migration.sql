-- CreateEnum
CREATE TYPE "SubscriptionInterval" AS ENUM ('unknown', 'month', 'year');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SubscriptionStatus" ADD VALUE 'incomplete';
ALTER TYPE "SubscriptionStatus" ADD VALUE 'trialing';
ALTER TYPE "SubscriptionStatus" ADD VALUE 'unpaid';

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "interval" "SubscriptionInterval" NOT NULL DEFAULT 'unknown',
ADD COLUMN     "stripe_price_id" TEXT,
ADD COLUMN     "stripe_subscription_id" TEXT;

-- AlterTable
ALTER TABLE "vendor_profile" ADD COLUMN     "stripe_customer_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_profile_stripe_customer_id_key" ON "vendor_profile"("stripe_customer_id");
