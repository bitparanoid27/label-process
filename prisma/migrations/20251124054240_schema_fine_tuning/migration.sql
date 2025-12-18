/*
  Warnings:

  - Added the required column `recipientName` to the `Shipment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "recipientName" TEXT NOT NULL,
ALTER COLUMN "shipState" DROP NOT NULL,
ALTER COLUMN "deliveryStartDate" DROP NOT NULL,
ALTER COLUMN "deliveryEndDate" DROP NOT NULL;
