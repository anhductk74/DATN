-- Add login code columns for mobile email authentication
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS logincode VARCHAR(6),
ADD COLUMN IF NOT EXISTS logincodecreationtime DATETIME;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_logincode ON users(logincode);
