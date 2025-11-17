-- Kiểm tra trạng thái hiện tại của hệ thống

-- 1. Kiểm tra các shop và wallet của chúng
SELECT 
    s.id as shop_id,
    s.name as shop_name,
    CASE 
        WHEN sw.id IS NULL THEN 'CHƯA CÓ VÍ'
        ELSE 'ĐÃ CÓ VÍ'
    END as wallet_status,
    COALESCE(sw.balance, 0) as balance,
    COALESCE(sw.total_earned, 0) as total_earned,
    COALESCE(sw.pending_amount, 0) as pending_amount
FROM shops s
LEFT JOIN shop_wallets sw ON s.id = sw.shop_id
ORDER BY s.name;

-- 2. Kiểm tra các đơn hàng theo trạng thái
SELECT 
    status,
    COUNT(*) as total_orders,
    SUM(final_amount) as total_amount
FROM orders
GROUP BY status
ORDER BY status;

-- 3. Kiểm tra đơn hàng DELIVERED và wallet
SELECT 
    o.id as order_id,
    s.name as shop_name,
    o.status,
    o.final_amount,
    o.created_at,
    o.updated_at,
    CASE 
        WHEN sw.id IS NULL THEN 'Shop chưa có ví - TIỀN BỊ MẤT!'
        WHEN wt.id IS NULL THEN 'Chưa có transaction - CHƯA CỘNG TIỀN!'
        ELSE 'Đã cộng vào ví'
    END as payment_status,
    COALESCE(sw.balance, 0) as wallet_balance
FROM orders o
JOIN shops s ON o.shop_id = s.id
LEFT JOIN shop_wallets sw ON s.id = sw.shop_id
LEFT JOIN wallet_transactions wt ON (wt.order_id = o.id AND wt.type = 'ORDER_PAYMENT')
WHERE o.status = 'DELIVERED'
ORDER BY o.created_at DESC;

-- 4. Kiểm tra transactions trong ví
SELECT 
    s.name as shop_name,
    wt.type,
    wt.amount,
    wt.balance_before,
    wt.balance_after,
    wt.created_at,
    o.id as order_id
FROM wallet_transactions wt
JOIN shop_wallets sw ON wt.wallet_id = sw.id
JOIN shops s ON sw.shop_id = s.id
LEFT JOIN orders o ON wt.order_id = o.id
ORDER BY wt.created_at DESC
LIMIT 20;

-- 5. Tìm các đơn hàng DELIVERED nhưng CHƯA có transaction
SELECT 
    o.id as order_id,
    s.name as shop_name,
    o.final_amount,
    o.status,
    o.updated_at,
    '⚠️ ĐƠN HÀNG NÀY CHƯA ĐƯỢC CỘNG VÀO VÍ!' as warning
FROM orders o
JOIN shops s ON o.shop_id = s.id
LEFT JOIN wallet_transactions wt ON (wt.order_id = o.id AND wt.type = 'ORDER_PAYMENT')
WHERE o.status = 'DELIVERED'
AND wt.id IS NULL
ORDER BY o.updated_at DESC;
