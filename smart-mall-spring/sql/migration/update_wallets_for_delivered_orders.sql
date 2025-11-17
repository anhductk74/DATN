-- Script để cập nhật wallet cho các đơn hàng đã DELIVERED
-- Chỉ cập nhật cho các shop đã có ví

-- Bước 1: Xem tổng quan các đơn hàng DELIVERED chưa được cộng vào ví
SELECT 
    o.id as order_id,
    o.shop_id,
    s.name as shop_name,
    o.final_amount,
    o.status,
    o.created_at,
    CASE 
        WHEN sw.id IS NULL THEN 'Chưa có ví'
        ELSE 'Có ví'
    END as wallet_status
FROM orders o
JOIN shops s ON o.shop_id = s.id
LEFT JOIN shop_wallets sw ON sw.shop_id = s.id
WHERE o.status = 'DELIVERED'
ORDER BY o.created_at DESC;

-- Bước 2: Thêm tiền vào wallet cho các shop đã có ví
-- Cập nhật balance, totalEarned và giảm pendingAmount
UPDATE shop_wallets sw
SET 
    balance = balance + (
        SELECT COALESCE(SUM(o.final_amount), 0)
        FROM orders o
        WHERE o.shop_id = sw.shop_id 
        AND o.status = 'DELIVERED'
        AND o.created_at > COALESCE(
            (SELECT MAX(created_at) 
             FROM wallet_transactions wt 
             WHERE wt.wallet_id = sw.id 
             AND wt.type = 'ORDER_PAYMENT'), 
            '1970-01-01'
        )
    ),
    total_earned = total_earned + (
        SELECT COALESCE(SUM(o.final_amount), 0)
        FROM orders o
        WHERE o.shop_id = sw.shop_id 
        AND o.status = 'DELIVERED'
        AND o.created_at > COALESCE(
            (SELECT MAX(created_at) 
             FROM wallet_transactions wt 
             WHERE wt.wallet_id = sw.id 
             AND wt.type = 'ORDER_PAYMENT'), 
            '1970-01-01'
        )
    ),
    pending_amount = GREATEST(0, pending_amount - (
        SELECT COALESCE(SUM(o.final_amount), 0)
        FROM orders o
        WHERE o.shop_id = sw.shop_id 
        AND o.status = 'DELIVERED'
        AND o.created_at > COALESCE(
            (SELECT MAX(created_at) 
             FROM wallet_transactions wt 
             WHERE wt.wallet_id = sw.id 
             AND wt.type = 'ORDER_PAYMENT'), 
            '1970-01-01'
        )
    )),
    updated_at = CURRENT_TIMESTAMP
WHERE EXISTS (
    SELECT 1 
    FROM orders o
    WHERE o.shop_id = sw.shop_id 
    AND o.status = 'DELIVERED'
    AND o.created_at > COALESCE(
        (SELECT MAX(created_at) 
         FROM wallet_transactions wt 
         WHERE wt.wallet_id = sw.id 
         AND wt.type = 'ORDER_PAYMENT'), 
        '1970-01-01'
    )
);

-- Bước 3: Tạo transaction records cho các đơn hàng đã DELIVERED
INSERT INTO wallet_transactions (
    id,
    wallet_id,
    type,
    amount,
    balance_before,
    balance_after,
    order_id,
    description,
    reference_code,
    created_at,
    updated_at
)
SELECT 
    UUID() as id,
    sw.id as wallet_id,
    'ORDER_PAYMENT' as type,
    o.final_amount as amount,
    -- Tính balance_before (phải trừ đi amount vì đã cộng vào rồi)
    sw.balance - o.final_amount as balance_before,
    sw.balance as balance_after,
    o.id as order_id,
    CONCAT('Thanh toán từ đơn hàng #', o.id) as description,
    CAST(o.id AS CHAR) as reference_code,
    o.updated_at as created_at,
    CURRENT_TIMESTAMP as updated_at
FROM orders o
JOIN shop_wallets sw ON sw.shop_id = o.shop_id
WHERE o.status = 'DELIVERED'
AND NOT EXISTS (
    -- Chỉ tạo transaction cho những đơn chưa có transaction
    SELECT 1 
    FROM wallet_transactions wt 
    WHERE wt.order_id = o.id 
    AND wt.type = 'ORDER_PAYMENT'
)
ORDER BY o.created_at ASC;

-- Bước 4: Kiểm tra kết quả
SELECT 
    s.name as shop_name,
    sw.balance,
    sw.total_earned,
    sw.total_withdrawn,
    sw.pending_amount,
    (SELECT COUNT(*) 
     FROM orders o 
     WHERE o.shop_id = s.id 
     AND o.status = 'DELIVERED') as total_delivered_orders,
    (SELECT COUNT(*) 
     FROM wallet_transactions wt 
     WHERE wt.wallet_id = sw.id 
     AND wt.type = 'ORDER_PAYMENT') as total_payment_transactions,
    (SELECT COALESCE(SUM(final_amount), 0) 
     FROM orders o 
     WHERE o.shop_id = s.id 
     AND o.status = 'DELIVERED') as total_order_amount
FROM shops s
JOIN shop_wallets sw ON sw.shop_id = s.id
ORDER BY sw.balance DESC;

-- Bước 5 (Optional): Xem chi tiết các transaction vừa tạo
SELECT 
    s.name as shop_name,
    wt.type,
    wt.amount,
    wt.balance_before,
    wt.balance_after,
    o.id as order_id,
    wt.description,
    wt.created_at
FROM wallet_transactions wt
JOIN shop_wallets sw ON wt.wallet_id = sw.id
JOIN shops s ON sw.shop_id = s.id
LEFT JOIN orders o ON wt.order_id = o.id
WHERE wt.type = 'ORDER_PAYMENT'
ORDER BY wt.created_at DESC;
