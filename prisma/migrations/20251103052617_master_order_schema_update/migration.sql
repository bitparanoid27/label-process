-- CreateTable
CREATE TABLE "MasterOrder" (
    "id" SERIAL NOT NULL,
    "order-id" TEXT NOT NULL,
    "purchase-date" TIMESTAMP(3) NOT NULL,
    "buyer-name" TEXT NOT NULL,
    "product-name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "quantity-purchased" INTEGER NOT NULL,
    "item-price" INTEGER NOT NULL,
    "shipping-price" INTEGER NOT NULL,
    "item-tax" INTEGER NOT NULL,
    "order-total" INTEGER NOT NULL,
    "ship-to-city" TEXT NOT NULL,
    "ship-to-state" TEXT NOT NULL,
    "ship-to-postal-code" INTEGER NOT NULL,
    "order-status" TEXT NOT NULL,

    CONSTRAINT "MasterOrder_pkey" PRIMARY KEY ("id")
);
