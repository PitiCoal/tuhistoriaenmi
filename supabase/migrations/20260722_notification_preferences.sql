-- Add new notification preference columns
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS daily_reminder BOOLEAN DEFAULT false;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS new_episodes BOOLEAN DEFAULT true;
