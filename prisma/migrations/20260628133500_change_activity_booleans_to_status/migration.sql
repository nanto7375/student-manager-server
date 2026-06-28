-- AlterTable: Convert boolean columns to varchar status strings
ALTER TABLE `activity_record`
  ADD COLUMN `attendance_new` VARCHAR(20) NOT NULL DEFAULT 'pending',
  ADD COLUMN `report1_new` VARCHAR(20) NOT NULL DEFAULT 'pending',
  ADD COLUMN `report2_new` VARCHAR(20) NOT NULL DEFAULT 'pending';

-- Migrate existing data
UPDATE `activity_record` SET `attendance_new` = CASE WHEN `attendance` = 1 THEN 'completed' ELSE 'pending' END;
UPDATE `activity_record` SET `report1_new` = CASE WHEN `report1` = 1 THEN 'completed' ELSE 'pending' END;
UPDATE `activity_record` SET `report2_new` = CASE WHEN `report2` = 1 THEN 'completed' ELSE 'pending' END;

-- Drop old columns and rename new ones
ALTER TABLE `activity_record`
  DROP COLUMN `attendance`,
  DROP COLUMN `report1`,
  DROP COLUMN `report2`;

ALTER TABLE `activity_record`
  CHANGE COLUMN `attendance_new` `attendance` VARCHAR(20) NOT NULL DEFAULT 'pending',
  CHANGE COLUMN `report1_new` `report1` VARCHAR(20) NOT NULL DEFAULT 'pending',
  CHANGE COLUMN `report2_new` `report2` VARCHAR(20) NOT NULL DEFAULT 'pending';
