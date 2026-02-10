/*
  Warnings:

  - You are about to drop the column `courier_box_name` on the `Couriers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[courier_name,service_name]` on the table `Couriers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courier_name` to the `Couriers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_name` to the `Couriers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Couriers" DROP COLUMN "courier_box_name",
ADD COLUMN     "courier_name" TEXT NOT NULL,
ADD COLUMN     "service_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Couriers_courier_name_service_name_key" ON "Couriers"("courier_name", "service_name");
