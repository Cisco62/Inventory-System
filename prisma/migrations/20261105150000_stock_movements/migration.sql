-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('INITIAL', 'RECEIVED', 'SOLD', 'DAMAGED', 'ADJUSTED');

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "change" INTEGER NOT NULL,
    "quantityAfter" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockMovement_userId_createdAt_idx" ON "StockMovement"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_productId_createdAt_idx" ON "StockMovement"("productId", "createdAt");

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: record each existing product's current quantity as its opening stock,
-- so every product starts with a history entry.
INSERT INTO "StockMovement" ("id", "userId", "productId", "type", "change", "quantityAfter", "note", "createdAt")
SELECT gen_random_uuid()::text, "userId", "id", 'INITIAL', "quantity", "quantity", 'Opening stock', "createdAt"
FROM "Product";
