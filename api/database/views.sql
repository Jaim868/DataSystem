-- 客户视图
CREATE VIEW customer_view AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.price,
    p.description,
    p.category,
    p.image_url,
    p.stock,
    p.rating,
    s.id AS store_id,
    s.name AS store_name,
    COALESCE(pr.discount_percentage, 0) AS discount
FROM products p
JOIN store_inventory si ON p.id = si.product_id
JOIN stores s ON si.store_id = s.id
LEFT JOIN promotions pr ON p.id = pr.product_id AND s.id = pr.store_id
WHERE p.deleted_at IS NULL;

-- 供应商视图
CREATE VIEW supplier_view AS
SELECT 
    sp.supplier_id,
    s.name AS supplier_name,
    p.id AS product_id,
    p.name AS product_name,
    p.price,
    p.stock,
    p.sales,
    si.store_id,
    st.name AS store_name,
    sp.supply_price,
    sp.last_supply_date
FROM supplier_products sp
JOIN suppliers s ON sp.supplier_id = s.id
JOIN products p ON sp.product_id = p.id
JOIN store_inventory si ON p.id = si.product_id
JOIN stores st ON si.store_id = st.id
WHERE p.deleted_at IS NULL;

-- 员工视图
CREATE VIEW employee_view AS
SELECT 
    e.id AS employee_id,
    e.name AS employee_name,
    e.position,
    e.store_id,
    s.name AS store_name,
    o.order_no,
    o.total_amount,
    o.status AS order_status,
    o.created_at AS order_date,
    c.username AS customer_name
FROM employees e
JOIN stores s ON e.store_id = s.id
LEFT JOIN orders o ON e.store_id = o.store_id
LEFT JOIN users c ON o.user_id = c.id
WHERE e.deleted_at IS NULL;

-- 管理员视图
CREATE VIEW manager_view AS
SELECT 
    s.id AS store_id,
    s.name AS store_name,
    e.id AS employee_id,
    e.name AS employee_name,
    e.position,
    e.hire_date,
    p.id AS product_id,
    p.name AS product_name,
    si.stock_quantity,
    o.order_no,
    o.total_amount,
    o.status AS order_status,
    sp.profit AS store_profit,
    sp.year AS profit_year
FROM stores s
LEFT JOIN employees e ON s.id = e.store_id
LEFT JOIN store_inventory si ON s.id = si.store_id
LEFT JOIN products p ON si.product_id = p.id
LEFT JOIN orders o ON s.id = o.store_id
LEFT JOIN store_profits sp ON s.id = sp.store_id
WHERE e.deleted_at IS NULL AND p.deleted_at IS NULL; 