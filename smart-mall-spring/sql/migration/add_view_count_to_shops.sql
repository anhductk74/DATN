-- Migration: Add view_count column to shops table
-- Date: 2025-11-02

-- Add view_count column to shops table
ALTER TABLE shops 
ADD COLUMN view_count BIGINT NOT NULL DEFAULT 0;

-- Add index on view_count for better query performance
CREATE INDEX idx_shops_view_count ON shops(view_count);

-- Optional: Add comment to explain the column
COMMENT ON COLUMN shops.view_count IS 'Số lượt xem shop (tăng khi khách xem shop hoặc xem sản phẩm của shop)';
