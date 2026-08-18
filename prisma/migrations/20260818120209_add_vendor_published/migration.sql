-- AlterTable
ALTER TABLE "vendor_profile" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;

-- Every vendor that existed before this column was added was already
-- visible on the public site, so backfill them as published. Only vendors
-- created from here on start unpublished and wait for approval.
UPDATE "vendor_profile" SET "published" = true;
