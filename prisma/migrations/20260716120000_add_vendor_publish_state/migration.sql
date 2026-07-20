-- CreateEnum
-- Public listing lifecycle for a vendor. See docs/go-live-plan.md.
CREATE TYPE "VendorPublishState" AS ENUM ('unknown', 'pre_launch', 'live', 'suspended');

-- AlterTable
-- New vendors default to `pre_launch` (hidden from public pages until the
-- go-live switch flips them). listed_at is stamped when a vendor goes live.
ALTER TABLE "vendor_profile" ADD COLUMN     "publish_state" "VendorPublishState" NOT NULL DEFAULT 'pre_launch',
ADD COLUMN     "listed_at" TIMESTAMP(3);

-- Backfill: every vendor that exists at migration time predates the go-live
-- gate and should stay publicly visible, so mark them `live` and treat their
-- creation time as their listing time. Only new applications default to
-- `pre_launch`.
UPDATE "vendor_profile" SET "publish_state" = 'live', "listed_at" = "created_at";
