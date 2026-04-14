CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    preferred_currency TEXT NOT NULL DEFAULT 'EUR',
    updated_at TEXT NOT NULL
);

INSERT INTO app_settings (id, preferred_currency, updated_at)
SELECT 1, 'EUR', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM app_settings WHERE id = 1);
