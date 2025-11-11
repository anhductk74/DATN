-- Add status column to categories table
ALTER TABLE categories ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

-- Create index for status column for better query performance
CREATE INDEX idx_categories_status ON categories(status);

-- Update existing records to have ACTIVE status (if needed)
UPDATE categories SET status = 'ACTIVE' WHERE status IS NULL;
