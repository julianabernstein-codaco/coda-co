-- Free, admin-curated community listing (volunteer-led end-of-life
-- resources like Death Cafés). Drives the "Community resource" badge and
-- exempts the org from billing — these vendors are published and free
-- forever, with no subscription/payment row. Set only from /admin/community.

-- AlterTable
ALTER TABLE "vendor_profile" ADD COLUMN     "community_listing" BOOLEAN NOT NULL DEFAULT false;
