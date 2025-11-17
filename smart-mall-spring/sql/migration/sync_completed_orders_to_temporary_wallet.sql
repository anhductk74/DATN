-- Script đồng bộ các đơn hàng đã hoàn thành vào ví tạm hoặc ví chính
-- Chạy script này để xử lý các đơn hàng DELIVERED từ trước khi có hệ thống ví tạm

-- Bước 1: Kiểm tra tình trạng hiện tại
SELECT 
    'Tổng số đơn hàng DELIVERED' AS description,
    COUNT(*) AS count
FROM orders 
WHERE status = 'DELIVERED'

UNION ALL

SELECT 
    'Đơn hàng đã có transaction trong ví chính' AS description,
    COUNT(DISTINCT wt.order_id) AS count
FROM wallet_transactions wt
WHERE wt.order_id IS NOT NULL

UNION ALL

SELECT 
    'Đơn hàng đã có trong ví tạm' AS description,
    COUNT(DISTINCT tw.order_id) AS count
FROM temporary_wallets tw
WHERE tw.order_id IS NOT NULL

UNION ALL

SELECT 
    'Đơn hàng DELIVERED cần đồng bộ' AS description,
    COUNT(*) AS count
FROM orders o
WHERE o.status = 'DELIVERED'
AND NOT EXISTS (
    SELECT 1 FROM wallet_transactions wt WHERE wt.order_id = o.id
)
AND NOT EXISTS (
    SELECT 1 FROM temporary_wallets tw WHERE tw.order_id = o.id
);

-- Bước 2: Đồng bộ các đơn hàng DELIVERED vào ví tạm (cho shop chưa có ví)
INSERT INTO temporary_wallets (
    id,
    shop_id,
    order_id,
    amount,
    is_transferred,
    note,
    created_at,
    updated_at
)
SELECT 
    UUID() AS id,
    o.shop_id,
    o.id AS order_id,
    o.final_amount AS amount,
    FALSE AS is_transferred,
    CONCAT('Đồng bộ đơn hàng hoàn thành từ ', DATE_FORMAT(o.updated_at, '%Y-%m-%d')) AS note,
    o.updated_at AS created_at,
    NOW() AS updated_at
FROM orders o
WHERE o.status = 'DELIVERED'
-- Shop chưa có ví
AND NOT EXISTS (
    SELECT 1 FROM shop_wallets sw WHERE sw.shop_id = o.shop_id
)
-- Chưa có trong wallet_transactions
AND NOT EXISTS (
    SELECT 1 FROM wallet_transactions wt WHERE wt.order_id = o.id
)
-- Chưa có trong temporary_wallets
AND NOT EXISTS (
    SELECT 1 FROM temporary_wallets tw WHERE tw.order_id = o.id
);

-- Bước 3: Đồng bộ các đơn hàng DELIVERED vào ví chính (cho shop đã có ví)
-- 3a. Cập nhật số dư ví
UPDATE shop_wallets sw
SET 
    balance = balance + (
        SELECT COALESCE(SUM(o.final_amount), 0)
        FROM orders o
        WHERE o.shop_id = sw.shop_id
        AND o.status = 'DELIVERED'
        AND NOT EXISTS (
            SELECT 1 FROM wallet_transactions wt WHERE wt.order_id = o.id
        )
        AND NOT EXISTS (
            SELECT 1 FROM temporary_wallets tw WHERE tw.order_id = o.id
        )
    ),
    total_earned = total_earned + (
        SELECT COALESCE(SUM(o.final_amount), 0)
        FROM orders o
        WHERE o.shop_id = sw.shop_id
        AND o.status = 'DELIVERED'
        AND NOT EXISTS (
            SELECT 1 FROM wallet_transactions wt WHERE wt.order_id = o.id
        )
        AND NOT EXISTS (
            SELECT 1 FROM temporary_wallets tw WHERE tw.order_id = o.id
        )
    ),
    updated_at = NOW()
WHERE EXISTS (
    SELECT 1 
    FROM orders o
    WHERE o.shop_id = sw.shop_id
    AND o.status = 'DELIVERED'
    AND NOT EXISTS (
        SELECT 1 FROM wallet_transactions wt WHERE wt.order_id = o.id
    )
    AND NOT EXISTS (
        SELECT 1 FROM temporary_wallets tw WHERE tw.order_id = o.id
    )
);

-- 3b. Tạo transaction cho từng đơn hàng
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
    UUID() AS id,
    sw.id AS wallet_id,
    'ORDER_PAYMENT' AS type,
    o.final_amount AS amount,
    -- Tính balance_before bằng cách trừ đi tổng các đơn hàng trước đó
    (
        SELECT COALESCE(sw.balance, 0) - COALESCE(SUM(o2.final_amount), 0)
        FROM orders o2
        WHERE o2.shop_id = o.shop_id
        AND o2.status = 'DELIVERED'
        AND o2.updated_at <= o.updated_at
        AND o2.id != o.id
        AND NOT EXISTS (
            SELECT 1 FROM wallet_transactions wt WHERE wt.order_id = o2.id
        )
        AND NOT EXISTS (
            SELECT 1 FROM temporary_wallets tw WHERE tw.order_id = o2.id
        )
    ) AS balance_before,
    -- balance_after = balance_before + amount
    (
        SELECT COALESCE(sw.balance, 0) - COALESCE(SUM(o2.final_amount), 0)
        FROM orders o2
        WHERE o2.shop_id = o.shop_id
        AND o2.status = 'DELIVERED'
        AND o2.updated_at < o.updated_at
        AND NOT EXISTS (
            SELECT 1 FROM wallet_transactions wt WHERE wt.order_id = o2.id
        )
        AND NOT EXISTS (
            SELECT 1 FROM temporary_wallets tw WHERE tw.order_id = o2.id
        )
    ) AS balance_after,
    o.id AS order_id,
    CONCAT('Đồng bộ thanh toán từ đơn hàng #', o.id) AS description,
    o.id AS reference_code,
    o.updated_at AS created_at,
    NOW() AS updated_at
FROM orders o
INNER JOIN shop_wallets sw ON sw.shop_id = o.shop_id
WHERE o.status = 'DELIVERED'
-- Chưa có transaction
AND NOT EXISTS (
    SELECT 1 FROM wallet_transactions wt WHERE wt.order_id = o.id
)
-- Chưa có trong ví tạm
AND NOT EXISTS (
    SELECT 1 FROM temporary_wallets tw WHERE tw.order_id = o.id
)
ORDER BY o.shop_id, o.updated_at;

-- Bước 4: Kiểm tra kết quả sau khi đồng bộ
SELECT 
    'Tổng số đơn hàng DELIVERED' AS description,
    COUNT(*) AS count,
    COALESCE(SUM(final_amount), 0) AS total_amount
FROM orders 
WHERE status = 'DELIVERED'

UNION ALL

SELECT 
    'Đơn hàng đã có transaction trong ví chính' AS description,
    COUNT(DISTINCT wt.order_id) AS count,
    COALESCE(SUM(wt.amount), 0) AS total_amount
FROM wallet_transactions wt
WHERE wt.order_id IS NOT NULL

UNION ALL

SELECT 
    'Đơn hàng đã có trong ví tạm' AS description,
    COUNT(DISTINCT tw.order_id) AS count,
    COALESCE(SUM(tw.amount), 0) AS total_amount
FROM temporary_wallets tw
WHERE tw.is_transferred = FALSE

UNION ALL

SELECT 
    'Đơn hàng DELIVERED chưa đồng bộ (nếu còn)' AS description,
    COUNT(*) AS count,
    COALESCE(SUM(o.final_amount), 0) AS total_amount
FROM orders o
WHERE o.status = 'DELIVERED'
AND NOT EXISTS (
    SELECT 1 FROM wallet_transactions wt WHERE wt.order_id = o.id
)
AND NOT EXISTS (
    SELECT 1 FROM temporary_wallets tw WHERE tw.order_id = o.id
);

-- Bước 5: Chi tiết theo shop
SELECT 
    s.id AS shop_id,
    s.name AS shop_name,
    CASE 
        WHEN sw.id IS NOT NULL THEN 'Có ví chính'
        ELSE 'Chưa có ví'
    END AS wallet_status,
    COUNT(o.id) AS total_delivered_orders,
    COALESCE(SUM(o.final_amount), 0) AS total_order_amount,
    COALESCE(sw.balance, 0) AS current_wallet_balance,
    COALESCE(temp_wallet.total_temp_amount, 0) AS temporary_wallet_amount,
    COUNT(wt.id) AS synced_transactions
FROM shops s
LEFT JOIN shop_wallets sw ON sw.shop_id = s.id
LEFT JOIN orders o ON o.shop_id = s.id AND o.status = 'DELIVERED'
LEFT JOIN wallet_transactions wt ON wt.order_id = o.id
LEFT JOIN (
    SELECT shop_id, SUM(amount) AS total_temp_amount
    FROM temporary_wallets
    WHERE is_transferred = FALSE
    GROUP BY shop_id
) temp_wallet ON temp_wallet.shop_id = s.id
WHERE EXISTS (
    SELECT 1 FROM orders WHERE shop_id = s.id AND status = 'DELIVERED'
)
GROUP BY s.id, s.name, sw.id, sw.balance, temp_wallet.total_temp_amount
ORDER BY total_order_amount DESC;
