/*
  Warnings:

  - You are about to drop the `MasterOrder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."MasterOrder";

-- CreateTable
CREATE TABLE "FileUpload" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "result" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "channel" TEXT NOT NULL,
    "channelOrderId" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3),
    "orderTotal" DECIMAL(10,2) NOT NULL,
    "currencyCode" CHAR(3) NOT NULL,
    "salesChannel" TEXT,
    "orderChannel" TEXT,
    "orderChannelInstance" TEXT,
    "isBusinessOrder" BOOLEAN DEFAULT false,
    "isPrime" BOOLEAN DEFAULT false,
    "isTransparency" BOOLEAN DEFAULT false,
    "isIba" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerPhoneNumber" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "sku" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "priceDesignation" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("sku")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" SERIAL NOT NULL,
    "shipAddress1" TEXT NOT NULL,
    "shipAddress2" TEXT NOT NULL,
    "shipAddress3" TEXT,
    "shipCity" TEXT NOT NULL,
    "shipState" TEXT NOT NULL,
    "shipPostalCode" TEXT NOT NULL,
    "shipCountry" TEXT NOT NULL,
    "shipPhoneNumber" TEXT NOT NULL,
    "shipServiceLevel" TEXT,
    "shippingPrice" DECIMAL(10,2) NOT NULL,
    "shippingTax" DECIMAL(10,2) NOT NULL,
    "promotionDiscount" DECIMAL(10,2) NOT NULL,
    "promotionId" TEXT,
    "deliveryStartDate" TIMESTAMP(3) NOT NULL,
    "deliveryEndDate" TIMESTAMP(3) NOT NULL,
    "deliveryTimeZone" TEXT,
    "deliveryInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "channelOrderItemId" TEXT NOT NULL,
    "quantityPurchased" INTEGER NOT NULL,
    "itemPrice" DECIMAL(10,2) NOT NULL,
    "itemTax" DECIMAL(10,2),
    "promotionDiscount" DECIMAL(10,2),
    "promotionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productSku" TEXT NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_channel_channelOrderId_key" ON "Order"("channel", "channelOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_buyerEmail_key" ON "Customer"("buyerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_channelOrderItemId_key" ON "OrderItem"("channelOrderItemId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productSku_fkey" FOREIGN KEY ("productSku") REFERENCES "Product"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;
