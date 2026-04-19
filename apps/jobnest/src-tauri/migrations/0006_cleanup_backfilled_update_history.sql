DELETE FROM application_history_events
WHERE event_type = 'updated'
  AND details_json = 'Inferred from timestamps on an existing application when history tracking was added.';
