-- Add columns for Google OAuth and Email/Password Authentication
ALTER TABLE users ADD COLUMN google_id VARCHAR;
ALTER TABLE users ADD COLUMN hashed_password VARCHAR;
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false NOT NULL;

-- Add index for google_id for faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_id ON users (google_id);
