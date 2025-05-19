-- Add migration script here
-- Insert test thread with test data
INSERT OR IGNORE INTO threads (id, name, created_at) 
VALUES (
    'test',  -- Using a fixed UUID for test thread
    'Test Thread',
    '2025-05-18 10:45:49'
);