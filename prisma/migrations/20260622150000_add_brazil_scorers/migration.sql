CREATE TABLE `Player` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Player_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `BetScorer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `betId` INTEGER NOT NULL,
    `playerId` INTEGER NOT NULL,
    `position` INTEGER NOT NULL,

    INDEX `BetScorer_playerId_idx`(`playerId`),
    UNIQUE INDEX `BetScorer_betId_position_key`(`betId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `MatchScorer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `matchId` INTEGER NOT NULL,
    `playerId` INTEGER NOT NULL,
    `position` INTEGER NOT NULL,

    INDEX `MatchScorer_playerId_idx`(`playerId`),
    UNIQUE INDEX `MatchScorer_matchId_position_key`(`matchId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `BetScorer` ADD CONSTRAINT `BetScorer_betId_fkey` FOREIGN KEY (`betId`) REFERENCES `Bet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `BetScorer` ADD CONSTRAINT `BetScorer_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `MatchScorer` ADD CONSTRAINT `MatchScorer_matchId_fkey` FOREIGN KEY (`matchId`) REFERENCES `Match`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `MatchScorer` ADD CONSTRAINT `MatchScorer_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
