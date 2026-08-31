-- In-progress vendor signups: who started the listing flow but hasn't
-- submitted. One row per user, updated as they advance through the form
-- and deleted on submit — so a surviving row means "started, not
-- completed". Internal tracking only.

-- CreateTable
CREATE TABLE "vendor_signup_drafts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "kind" "ApplicationKind" NOT NULL DEFAULT 'unknown',
    "data" JSONB NOT NULL DEFAULT '{}',
    "last_step" INTEGER NOT NULL DEFAULT 0,
    "org_name" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_signup_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_signup_drafts_user_id_key" ON "vendor_signup_drafts"("user_id");

-- CreateIndex
CREATE INDEX "vendor_signup_drafts_updated_at_idx" ON "vendor_signup_drafts"("updated_at");

-- AddForeignKey
ALTER TABLE "vendor_signup_drafts" ADD CONSTRAINT "vendor_signup_drafts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
