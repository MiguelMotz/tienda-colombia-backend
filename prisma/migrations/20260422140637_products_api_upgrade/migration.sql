-- AlterTable
ALTER TABLE `product` ADD COLUMN `images` JSON NULL,
    ADD COLUMN `seller` VARCHAR(191) NULL,
    ADD COLUMN `subcategory` VARCHAR(191) NULL;
