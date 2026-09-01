-- AlterTable
ALTER TABLE "platform_config" ADD COLUMN     "site_private" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "site_private_password_hash" TEXT;
