-- ============================================================
-- NOTIFICATION SYSTEM - DATABASE MIGRATION
-- ============================================================
-- Description: Creates notifications table and indexes
-- Author: Smart Mall Spring Team
-- Date: 2026-01-08
-- ============================================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BINARY(16) PRIMARY KEY COMMENT 'UUID of notification',
    user_id BINARY(16) NOT NULL COMMENT 'User who receives this notification',
    type VARCHAR(50) NOT NULL COMMENT 'Type of notification (ORDER_CREATED, PAYMENT_SUCCESS, etc.)',
    title VARCHAR(255) NOT NULL COMMENT 'Notification title',
    message TEXT NOT NULL COMMENT 'Notification message content',
    status VARCHAR(20) NOT NULL DEFAULT 'UNREAD' COMMENT 'Read status: UNREAD or READ',
    reference_id BINARY(16) NULL COMMENT 'Related entity ID (order_id, product_id, etc.)',
    reference_type VARCHAR(50) NULL COMMENT 'Related entity type (ORDER, PRODUCT, SHOP, etc.)',
    metadata TEXT NULL COMMENT 'Additional data in JSON format',
    image_url VARCHAR(500) NULL COMMENT 'Image/icon URL for the notification',
    deep_link VARCHAR(500) NULL COMMENT 'Deep link for mobile app navigation',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When notification was created',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When notification was last updated',
    
    -- Foreign key constraint
    CONSTRAINT fk_notifications_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Indexes for performance
    INDEX idx_user_status (user_id, status) COMMENT 'Quick lookup for user notifications by status',
    INDEX idx_created_at (created_at DESC) COMMENT 'Sort notifications by time',
    INDEX idx_reference (reference_id, reference_type) COMMENT 'Find notifications by reference entity'
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Store all user notifications for real-time and historical tracking';

-- ============================================================
-- Sample Data (Optional - for testing)
-- ============================================================

-- Uncomment below to insert sample notifications for testing
/*
-- Get a sample user ID (replace with actual user UUID)
SET @sample_user_id = (SELECT id FROM users LIMIT 1);

-- Insert sample notifications
INSERT INTO notifications (id, user_id, type, title, message, status, reference_type, created_at, updated_at) VALUES
(UUID_TO_BIN(UUID()), @sample_user_id, 'ORDER_CREATED', 'Đơn hàng mới', 'Đơn hàng #12345678 của bạn đã được tạo thành công. Tổng tiền: 250,000 đ', 'UNREAD', 'ORDER', NOW(), NOW()),
(UUID_TO_BIN(UUID()), @sample_user_id, 'ORDER_CONFIRMED', 'Đơn hàng đã xác nhận', 'Shop đã xác nhận đơn hàng #12345678 của bạn', 'UNREAD', 'ORDER', NOW(), NOW()),
(UUID_TO_BIN(UUID()), @sample_user_id, 'VOUCHER_RECEIVED', 'Voucher mới', 'Bạn nhận được voucher giảm giá 20%', 'READ', 'VOUCHER', NOW(), NOW());
*/

-- ============================================================
-- Verification Queries
-- ============================================================

-- Check if table was created successfully
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'notifications';

-- Check indexes
SHOW INDEX FROM notifications;

-- ============================================================
-- Cleanup (Run only if you want to remove notifications table)
-- ============================================================

-- DROP TABLE IF EXISTS notifications;

-- ============================================================
-- End of Migration
-- ============================================================
