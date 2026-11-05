-- AlterTable
ALTER TABLE "Product" ADD COLUMN "costPrice" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN "unitPrice" DECIMAL(12,2),
ADD COLUMN "unitCost" DECIMAL(12,2);

-- Backfill: existing movements get the product's current selling price
-- (the best information available for history recorded before this change).
UPDATE "StockMovement" AS m
SET "unitPrice" = p."price"
FROM "Product" AS p
WHERE m."productId" = p."id";
