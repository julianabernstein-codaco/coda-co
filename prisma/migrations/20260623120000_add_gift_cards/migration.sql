
-- CreateEnum
CREATE TYPE "GiftCardStatus" AS ENUM ('unknown', 'pending', 'active', 'depleted', 'void');

-- CreateEnum
CREATE TYPE "GiftCardEntryType" AS ENUM ('unknown', 'purchase', 'redemption', 'refund', 'adjustment');

-- CreateTable
CREATE TABLE "gift_cards" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "initial_amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "GiftCardStatus" NOT NULL DEFAULT 'unknown',
    "purchaser_user_id" TEXT,
    "purchaser_email" TEXT NOT NULL,
    "recipient_email" TEXT,
    "recipient_name" TEXT,
    "gift_message" TEXT,
    "deliver_at" TIMESTAMP(3),
    "stripe_payment_intent_id" TEXT,
    "funded_at" TIMESTAMP(3),
    "claimed_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_card_ledger_entries" (
    "id" TEXT NOT NULL,
    "gift_card_id" TEXT NOT NULL,
    "type" "GiftCardEntryType" NOT NULL DEFAULT 'unknown',
    "amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "order_id" TEXT,
    "invoice_payment_id" TEXT,
    "created_by_user_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gift_card_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gift_cards_code_key" ON "gift_cards"("code");

-- CreateIndex
CREATE UNIQUE INDEX "gift_cards_stripe_payment_intent_id_key" ON "gift_cards"("stripe_payment_intent_id");

-- CreateIndex
CREATE INDEX "gift_cards_purchaser_user_id_idx" ON "gift_cards"("purchaser_user_id");

-- CreateIndex
CREATE INDEX "gift_cards_claimed_by_user_id_idx" ON "gift_cards"("claimed_by_user_id");

-- CreateIndex
CREATE INDEX "gift_cards_status_idx" ON "gift_cards"("status");

-- CreateIndex
CREATE INDEX "gift_card_ledger_entries_gift_card_id_idx" ON "gift_card_ledger_entries"("gift_card_id");

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_purchaser_user_id_fkey" FOREIGN KEY ("purchaser_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_claimed_by_user_id_fkey" FOREIGN KEY ("claimed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_card_ledger_entries" ADD CONSTRAINT "gift_card_ledger_entries_gift_card_id_fkey" FOREIGN KEY ("gift_card_id") REFERENCES "gift_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

