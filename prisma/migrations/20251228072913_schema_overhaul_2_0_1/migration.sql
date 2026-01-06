/*
  Warnings:

  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Shipment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_productSku_fkey";

-- DropForeignKey
ALTER TABLE "public"."Shipment" DROP CONSTRAINT "Shipment_orderId_fkey";

-- DropTable
DROP TABLE "public"."Customer";

-- DropTable
DROP TABLE "public"."Order";

-- DropTable
DROP TABLE "public"."OrderItem";

-- DropTable
DROP TABLE "public"."Product";

-- DropTable
DROP TABLE "public"."Shipment";

-- CreateTable
CREATE TABLE "Platforms" (
    "id" SERIAL NOT NULL,
    "platform_name" TEXT NOT NULL,

    CONSTRAINT "Platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterOrders" (
    "id" SERIAL NOT NULL,
    "buyer_username" TEXT,
    "buyer_email" TEXT,
    "platform_order_id" TEXT NOT NULL,
    "sale_date" DATE NOT NULL,
    "recipient_name" TEXT NOT NULL,
    "recipient_phone_number" TEXT,
    "recipient_email_address" TEXT,
    "recipient_ship_address1" TEXT NOT NULL,
    "recipient_ship_address2" TEXT,
    "recipient_ship_address3" TEXT,
    "recipient_city" TEXT NOT NULL,
    "recipient_state" TEXT NOT NULL,
    "recipient_country" TEXT NOT NULL,
    "recipient_post_code" TEXT NOT NULL,
    "delivery_instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "platform_id" INTEGER NOT NULL,

    CONSTRAINT "MasterOrders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItems" (
    "id" SERIAL NOT NULL,
    "order_item_id" TEXT,
    "product_title" TEXT NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "master_order_id" INTEGER NOT NULL,

    CONSTRAINT "OrderItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataDump" (
    "id" SERIAL NOT NULL,
    "platform_order_id" TEXT NOT NULL,
    "raw_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "master_order_id" INTEGER NOT NULL,

    CONSTRAINT "DataDump_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterOrders_platform_order_id_key" ON "MasterOrders"("platform_order_id");

-- AddForeignKey
ALTER TABLE "MasterOrders" ADD CONSTRAINT "MasterOrders_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "Platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItems" ADD CONSTRAINT "OrderItems_master_order_id_fkey" FOREIGN KEY ("master_order_id") REFERENCES "MasterOrders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataDump" ADD CONSTRAINT "DataDump_master_order_id_fkey" FOREIGN KEY ("master_order_id") REFERENCES "MasterOrders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
