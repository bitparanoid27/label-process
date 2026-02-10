-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "cost_price" DECIMAL(10,2),
ADD COLUMN     "projected_price" DECIMAL(10,2),
ADD COLUMN     "retail_price" DECIMAL(10,2),
ADD COLUMN     "wholesale_price" DECIMAL(10,2);
