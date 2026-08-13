-- AlterTable
ALTER TABLE "vendor_inquiries" ADD COLUMN     "client_user_id" TEXT;

-- CreateIndex
CREATE INDEX "vendor_inquiries_client_user_id_idx" ON "vendor_inquiries"("client_user_id");

-- AddForeignKey
ALTER TABLE "vendor_inquiries" ADD CONSTRAINT "vendor_inquiries_client_user_id_fkey" FOREIGN KEY ("client_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
