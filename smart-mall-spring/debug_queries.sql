-- Kiểm tra data trong database

-- 1. Kiểm tra số lượng shops
SELECT COUNT(*) as total_shops FROM shops;

-- 2. Kiểm tra số lượng orders DELIVERED trong tháng này
SELECT COUNT(*) as delivered_orders, 
       SUM(total_amount) as total_revenue
FROM orders 
WHERE status = 'DELIVERED' 
  AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01');

-- 3. Kiểm tra top shops có doanh thu
SELECT s.id, s.name, 
       COUNT(o.id) as order_count,
       SUM(o.total_amount) as revenue
FROM shops s
LEFT JOIN orders o ON o.shop_id = s.id 
WHERE o.status = 'DELIVERED' 
  AND o.created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
GROUP BY s.id, s.name
ORDER BY revenue DESC
LIMIT 10;

-- 4. Kiểm tra users
SELECT COUNT(*) as total_users,
       SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_users
FROM users;

-- 5. Kiểm tra tất cả orders theo status
SELECT status, COUNT(*) as count
FROM orders
GROUP BY status;
