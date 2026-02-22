/*
  Warnings:

  - You are about to drop the column `attended` on the `activity_record` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `activity_record` DROP COLUMN `attended`,
    ADD COLUMN `attendance` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `monthly_preview` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `monthly_project` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `monthly_report` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `is_makeup` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `report1` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `report2` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `admin` MODIFY `is_active` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `book_rental` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NOT NULL,
    `bookTitle` VARCHAR(255) NOT NULL,
    `borrowed_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `returned_at` TIMESTAMP(0) NULL,
    `due_date` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `FK_book_rental_student`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `book_rental` ADD CONSTRAINT `FK_book_rental_student` FOREIGN KEY (`student_id`) REFERENCES `student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
