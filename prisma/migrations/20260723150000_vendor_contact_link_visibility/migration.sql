-- AlterTable
-- Capture the contact links the applicant enters at signup so they carry
-- through to the vendor profile at approval time (previously discarded).
ALTER TABLE "vendor_applications" ADD COLUMN "website" TEXT;
ALTER TABLE "vendor_applications" ADD COLUMN "instagram" TEXT;

-- AlterTable
-- Per-vendor visibility switches for the public contact links, toggled by
-- the CodaCo team from /admin/vendors. Default false: a saved website /
-- Instagram stays hidden on the public profile until the team turns it on.
ALTER TABLE "vendor_profile" ADD COLUMN "show_website" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "vendor_profile" ADD COLUMN "show_instagram" BOOLEAN NOT NULL DEFAULT false;
