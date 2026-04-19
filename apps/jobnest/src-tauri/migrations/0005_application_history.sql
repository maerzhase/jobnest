CREATE TABLE IF NOT EXISTS application_history_events (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    company_name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    status_from TEXT,
    status_to TEXT,
    details_json TEXT,
    snapshot_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_application_history_events_application_id
ON application_history_events(application_id);

CREATE INDEX IF NOT EXISTS idx_application_history_events_occurred_at
ON application_history_events(occurred_at DESC);
