ALTER TABLE app_settings
ADD COLUMN stale_application_days INTEGER NOT NULL DEFAULT 14;

UPDATE app_settings
SET stale_application_days = 14
WHERE stale_application_days IS NULL OR stale_application_days < 1;
