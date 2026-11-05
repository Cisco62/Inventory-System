-- DropIndex
DROP INDEX "Product_sku_key";

-- CreateIndex
CREATE UNIQUE INDEX "Product_userId_sku_key" ON "Product"("userId", "sku");
