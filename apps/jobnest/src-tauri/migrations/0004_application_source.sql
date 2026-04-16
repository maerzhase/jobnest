ALTER TABLE roles
ADD COLUMN application_source TEXT NOT NULL DEFAULT 'direct_application';
