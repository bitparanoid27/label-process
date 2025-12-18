-- AlterTable
ALTER TABLE "Shipment" ALTER COLUMN "shippingPrice" DROP NOT NULL,
ALTER COLUMN "shippingTax" DROP NOT NULL,
ALTER COLUMN "promotionDiscount" DROP NOT NULL;
