-- DropIndex
DROP INDEX "gift_cards_stripe_payment_intent_id_key";

-- AlterTable
ALTER TABLE "gift_cards" DROP COLUMN "stripe_payment_intent_id",
ADD COLUMN     "contribute_token" TEXT,
ADD COLUMN     "delivered_at" TIMESTAMP(3),
ADD COLUMN     "organizer_token" TEXT;

-- AlterTable
ALTER TABLE "gift_card_ledger_entries" ADD COLUMN     "contributor_email" TEXT,
ADD COLUMN     "contributor_name" TEXT,
ADD COLUMN     "stripe_payment_intent_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "gift_cards_contribute_token_key" ON "gift_cards"("contribute_token");

-- CreateIndex
CREATE UNIQUE INDEX "gift_cards_organizer_token_key" ON "gift_cards"("organizer_token");

-- CreateIndex
CREATE UNIQUE INDEX "gift_card_ledger_entries_stripe_payment_intent_id_key" ON "gift_card_ledger_entries"("stripe_payment_intent_id");

