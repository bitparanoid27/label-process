-- CreateTable
CREATE TABLE "Products" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "length_cm" DECIMAL(10,2) NOT NULL,
    "width_cm" DECIMAL(10,2) NOT NULL,
    "height_cm" DECIMAL(10,2) NOT NULL,
    "length_mm" INTEGER NOT NULL,
    "width_mm" INTEGER NOT NULL,
    "height_mm" INTEGER NOT NULL,
    "weight_kg" DECIMAL(10,3) NOT NULL,
    "weight_gm" INTEGER NOT NULL,
    "volume_cm3" DECIMAL(10,4) NOT NULL,
    "packaging_strategy" TEXT NOT NULL DEFAULT 'Standard',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Boxes" (
    "id" SERIAL NOT NULL,
    "box_name" TEXT NOT NULL,
    "length_cm" DECIMAL(10,2) NOT NULL,
    "width_cm" DECIMAL(10,2) NOT NULL,
    "height_cm" DECIMAL(10,2) NOT NULL,
    "box_volume_cm3" DECIMAL(10,4) NOT NULL,
    "box_girth" INTEGER NOT NULL,
    "cost_price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Boxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Couriers" (
    "id" SERIAL NOT NULL,
    "courier_box_name" TEXT NOT NULL,
    "price_24" DECIMAL(10,2) NOT NULL,
    "price_48" DECIMAL(10,2) NOT NULL,
    "length_cm" DECIMAL(10,2) NOT NULL,
    "width_cm" DECIMAL(10,2) NOT NULL,
    "height_cm" DECIMAL(10,2) NOT NULL,
    "length_mm" INTEGER NOT NULL,
    "width_mm" INTEGER NOT NULL,
    "height_mm" INTEGER NOT NULL,
    "max_girth_cm" INTEGER NOT NULL,
    "max_volume_cm3" DECIMAL(15,4) NOT NULL,
    "max_weight_kg" DECIMAL(10,3) NOT NULL,
    "max_weight_gm" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Couriers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Products_sku_key" ON "Products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Boxes_box_name_key" ON "Boxes"("box_name");
