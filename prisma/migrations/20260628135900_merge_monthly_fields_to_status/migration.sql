-- Add new monthly_status column
ALTER TABLE `activity_record` ADD COLUMN `monthly_status` VARCHAR(20) NOT NULL DEFAULT 'pending';

-- Migrate existing data
UPDATE `activity_record` SET `monthly_status` = CASE
  WHEN `monthly_report` IS NOT NULL THEN 'completed'
  WHEN `monthly_preview` IS NOT NULL THEN 'preview'
  WHEN `monthly_project` IS NOT NULL THEN 'participated'
  ELSE 'pending'
END;

-- Drop old columns
ALTER TABLE `activity_record`
  DROP COLUMN `monthly_project`,
  DROP COLUMN `monthly_preview`,
  DROP COLUMN `monthly_report`;
