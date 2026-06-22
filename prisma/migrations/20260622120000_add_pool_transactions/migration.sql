-- CreateTable
CREATE TABLE `PoolTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kind` ENUM('ADD', 'REMOVE') NOT NULL,
    `amountCents` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` INTEGER NOT NULL,

    INDEX `PoolTransaction_createdAt_idx`(`createdAt`),
    INDEX `PoolTransaction_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PoolTransaction` ADD CONSTRAINT `PoolTransaction_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `AdminUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
