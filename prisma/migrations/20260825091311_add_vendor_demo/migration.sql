-- AlterTable
ALTER TABLE "platform_config" ADD COLUMN     "demo_vendors_hidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "vendor_profile" ADD COLUMN     "demo" BOOLEAN NOT NULL DEFAULT false;

