-- Add reminder time columns to notification_preferences
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS reminder_hour INTEGER DEFAULT 8;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS reminder_minute INTEGER DEFAULT 0;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS verse_hour INTEGER DEFAULT 6;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS verse_minute INTEGER DEFAULT 0;
