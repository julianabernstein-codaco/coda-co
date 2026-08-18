-- AlterTable
ALTER TABLE "vendor_applications" ADD COLUMN     "requires_custom_order" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "vendor_profile" ADD COLUMN     "requires_custom_order" BOOLEAN NOT NULL DEFAULT false;
