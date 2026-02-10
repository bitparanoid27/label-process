/*
  Warnings:

  - Added the required column `height_mm` to the `Boxes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `length_mm` to the `Boxes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width_mm` to the `Boxes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Boxes" ADD COLUMN     "height_mm" INTEGER NOT NULL,
ADD COLUMN     "length_mm" INTEGER NOT NULL,
ADD COLUMN     "width_mm" INTEGER NOT NULL;
