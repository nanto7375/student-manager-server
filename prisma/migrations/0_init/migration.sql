-- CreateTable
CREATE TABLE `activity_generation_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `generated_activity_month` CHAR(6) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_record` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_id` INTEGER NOT NULL,
    `date` CHAR(8) NOT NULL,
    `is_makeup` TINYINT NOT NULL DEFAULT 0,
    `attended` TINYINT NOT NULL DEFAULT 0,
    `report1` TINYINT NOT NULL DEFAULT 0,
    `report2` TINYINT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `FK_af5423ecbecaf2606b909307ca8`(`student_id`),
    INDEX `IDX_979544e3d084794e13c2d14a39`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_record_generation_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `generated_activity_year_month` CHAR(6) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_record_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `activity_record_id` INTEGER NOT NULL,
    `admin_id` INTEGER NOT NULL,
    `key` VARCHAR(255) NOT NULL,
    `value` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `FK_19c9c39aa43bdb5ef49ed5fefca`(`activity_record_id`),
    INDEX `FK_b5267e703f03876c725e05a2e01`(`admin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(30) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'staff',
    `is_active` TINYINT NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `deleted_at` TIMESTAMP(6) NULL,

    UNIQUE INDEX `IDX_de87485f6489f5d0995f584195`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banned_ip` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ip` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `IDX_70671f15d0b5eca41ad754d94e`(`ip`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lesson` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` CHAR(3) NOT NULL,
    `name` VARCHAR(30) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `deleted_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start_time` CHAR(4) NOT NULL,
    `end_time` CHAR(4) NOT NULL,
    `lesson_id` INTEGER NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `deleted_at` TIMESTAMP(6) NULL,
    `day_of_week` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_6c8c0c369dc1fa673c88bb6381a`(`lesson_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(30) NOT NULL,
    `birth_year` CHAR(4) NULL,
    `birth_date` CHAR(4) NULL,
    `school_level` INTEGER UNSIGNED NULL,
    `school_grade` INTEGER UNSIGNED NULL,
    `school_name` VARCHAR(30) NULL,
    `note` VARCHAR(255) NULL,
    `schedule_id` INTEGER NULL,
    `phone` VARCHAR(20) NULL,
    `parent_phone` VARCHAR(20) NULL,
    `registered_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `deleted_at` TIMESTAMP(6) NULL,

    INDEX `FK_e81b27777dd4e1ee3ad42e3aea4`(`schedule_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `activity_record` ADD CONSTRAINT `FK_af5423ecbecaf2606b909307ca8` FOREIGN KEY (`student_id`) REFERENCES `student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_record_log` ADD CONSTRAINT `FK_19c9c39aa43bdb5ef49ed5fefca` FOREIGN KEY (`activity_record_id`) REFERENCES `activity_record`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_record_log` ADD CONSTRAINT `FK_b5267e703f03876c725e05a2e01` FOREIGN KEY (`admin_id`) REFERENCES `admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schedule` ADD CONSTRAINT `FK_6c8c0c369dc1fa673c88bb6381a` FOREIGN KEY (`lesson_id`) REFERENCES `lesson`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student` ADD CONSTRAINT `FK_e81b27777dd4e1ee3ad42e3aea4` FOREIGN KEY (`schedule_id`) REFERENCES `schedule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

