-- 设置外键检查
SET FOREIGN_KEY_CHECKS=0;

-- 删除已存在的表
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS store_inventory;
DROP TABLE IF EXISTS supplier_products;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS supply_orders;
DROP TABLE IF EXISTS supply_order_items;

-- 创建用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'employee', 'manager', 'supplier') NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建商店表
CREATE TABLE stores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建员工表
CREATE TABLE employees (
    id INT PRIMARY KEY,
    store_id INT NOT NULL,
    hire_date DATE NOT NULL,
    salary DECIMAL(10,2) DEFAULT 0.00,
    position VARCHAR(50) DEFAULT '销售',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- 创建供应商表
CREATE TABLE suppliers (
    id INT PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    contact_name VARCHAR(50),
    phone VARCHAR(20),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES users(id)
);

-- 创建商品表
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),
    image_url VARCHAR(255),
    rating DECIMAL(2,1) DEFAULT 5.0,
    sales INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- 创建商店库存表
CREATE TABLE store_inventory (
    store_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (store_id, product_id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 创建供应商产品关联表
CREATE TABLE supplier_products (
    supplier_id INT NOT NULL,
    product_id INT NOT NULL,
    supply_price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (supplier_id, product_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 创建购物车表
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 创建订单表
CREATE TABLE orders (
    order_no VARCHAR(20) PRIMARY KEY,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- 创建订单项目表
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(20) NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_no) REFERENCES orders(order_no),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 创建供应订单表（供应商发货给商店的订单）
CREATE TABLE supply_orders (
    order_no VARCHAR(50) PRIMARY KEY,
    supplier_id INT NOT NULL,
    store_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'shipping', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- 创建供应订单项目表
CREATE TABLE supply_order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    supply_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_no) REFERENCES supply_orders(order_no),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 插入测试数据
-- 创建用户
INSERT INTO users (id, username, password, role, email, phone) VALUES 
(1, 'admin', '123456', 'manager', 'admin@fishing.com', '13800000001'),
(2, 'customer1', '123456', 'customer', 'customer1@example.com', '13800000002'),
(3, 'employee1', '123456', 'employee', 'employee1@fishing.com', '13800000003'),
(4, 'employee2', '123456', 'employee', 'employee2@fishing.com', '13800000004'),
(5, 'employee3', '123456', 'employee', 'employee3@fishing.com', '13800000005'),
(6, 'supplier1', '123456', 'supplier', 'supplier1@example.com', '13800000006'),
(7, 'customer2', '123456', 'customer', 'customer2@example.com', '13800000007'),
(8, 'customer3', '123456', 'customer', 'customer3@example.com', '13800000008');

-- 创建商店
INSERT INTO stores (id, name, address, phone) VALUES 
(1, '渔具总店', '北京市海淀区123号', '010-12345678'),
(2, '渔具分店1', '北京市朝阳区456号', '010-87654321'),
(3, '渔具分店2', '北京市西城区789号', '010-98765432');

-- 创建员工
INSERT INTO employees (id, store_id, hire_date, salary, position) VALUES 
(3, 1, '2023-01-01', 5000.00, '销售'),
(4, 2, '2023-02-01', 5000.00, '销售'),
(5, 3, '2023-03-01', 5000.00, '销售');

-- 创建供应商
INSERT INTO suppliers (id, company_name, contact_name, phone, address) VALUES 
(6, '渔具供应商1', '张三', '13900000001', '广州市天河区123号');

-- 创建商品
INSERT INTO products (id, name, description, price, category, image_url, rating, sales) VALUES 
(1, '专业钓鱼竿', '碳纤维材质，轻便耐用', 299.99, '鱼竿', '/images/rod1.jpg', 4.8, 150),
(2, '高级渔线', '超强拉力不易断裂', 49.99, '渔线', '/images/line1.jpg', 4.5, 300),
(3, '精致鱼钩', '日本口，锋利持久', 19.99, '鱼钩', '/images/hook1.jpg', 4.7, 450),
(4, '多功能鱼篓', '大容量，防水耐用', 159.99, '工具', '/images/basket1.jpg', 4.6, 120),
(5, '专业钓椅', '便携折叠，承重150kg', 199.99, '工具', '/images/chair1.jpg', 4.9, 200),
(6, '高级饵料', '进口配方，效果显著', 29.99, '饵料', '/images/bait1.jpg', 4.4, 600),
(7, '防晒钓鱼帽', '透气防晒，舒适耐用', 89.99, '服饰', '/images/hat1.jpg', 4.3, 80),
(8, '防水钓鱼服', '高品质防水面料', 399.99, '服饰', '/images/cloth1.jpg', 4.7, 60),
(9, '钓鱼工具箱', '多层收纳，防水防潮', 129.99, '工具', '/images/box1.jpg', 4.5, 90),
(10, '电子咬钩器', '灵敏度高，防水设计', 79.99, '工具', '/images/bite1.jpg', 4.6, 150);

-- 创建库存
INSERT INTO store_inventory (store_id, product_id, quantity) VALUES 
(1, 1, 50), (1, 2, 100), (1, 3, 200), (1, 4, 30), (1, 5, 25), (1, 6, 150), (1, 7, 50), (1, 8, 30), (1, 9, 40), (1, 10, 60),
(2, 1, 30), (2, 2, 60), (2, 3, 120), (2, 4, 20), (2, 5, 15), (2, 6, 100), (2, 7, 30), (2, 8, 20), (2, 9, 25), (2, 10, 40),
(3, 1, 25), (3, 2, 50), (3, 3, 100), (3, 4, 15), (3, 5, 10), (3, 6, 80), (3, 7, 25), (3, 8, 15), (3, 9, 20), (3, 10, 35);

-- 创建供应商产品关联
INSERT INTO supplier_products (supplier_id, product_id, supply_price) VALUES 
(6, 1, 200.00),
(6, 2, 30.00),
(6, 3, 10.00),
(6, 4, 100.00),
(6, 5, 150.00),
(6, 6, 15.00),
(6, 7, 50.00),
(6, 8, 250.00),
(6, 9, 80.00),
(6, 10, 45.00);

-- 创建购物车项目
INSERT INTO cart_items (user_id, product_id, quantity) VALUES 
(2, 1, 1),
(2, 3, 2),
(7, 2, 1),
(7, 4, 1),
(8, 5, 1);

-- 创建订单
INSERT INTO orders (order_no, user_id, store_id, total_amount, status, created_at) VALUES 
('ORD202301001', 2, 1, 369.97, 'completed', '2023-01-15 10:00:00'),
('ORD202301002', 2, 2, 249.98, 'completed', '2023-01-16 11:30:00'),
('ORD202301003', 7, 3, 179.98, 'pending', '2023-01-17 14:20:00'),
('ORD202301004', 7, 1, 459.96, 'processing', CURRENT_DATE),
('ORD202301005', 8, 2, 229.98, 'pending', CURRENT_DATE);

-- 创建订单项目
INSERT INTO order_items (order_no, product_id, quantity, price) VALUES 
('ORD202301001', 1, 1, 299.99),
('ORD202301001', 2, 1, 49.99),
('ORD202301001', 3, 1, 19.99),
('ORD202301002', 4, 1, 159.99),
('ORD202301002', 5, 1, 89.99),
('ORD202301003', 6, 6, 29.99),
('ORD202301004', 1, 1, 299.99),
('ORD202301004', 4, 1, 159.97),
('ORD202301005', 2, 2, 49.99),
('ORD202301005', 3, 5, 19.99);

-- 创建供应订单
INSERT INTO supply_orders (order_no, supplier_id, store_id, total_amount, status, created_at) VALUES 
('SUP202301001', 6, 1, 369.97, 'completed', '2023-01-15 10:00:00'),
('SUP202301002', 6, 2, 249.98, 'completed', '2023-01-16 11:30:00'),
('SUP202301003', 6, 3, 179.98, 'pending', '2023-01-17 14:20:00'),
('SUP202301004', 6, 1, 459.96, 'processing', CURRENT_DATE),
('SUP202301005', 6, 2, 229.98, 'pending', CURRENT_DATE);

-- 创建供应订单项目
INSERT INTO supply_order_items (order_no, product_id, quantity, supply_price) VALUES 
('SUP202301001', 1, 1, 200.00),
('SUP202301001', 2, 1, 30.00),
('SUP202301001', 3, 1, 10.00),
('SUP202301002', 4, 1, 100.00),
('SUP202301002', 5, 1, 150.00),
('SUP202301003', 6, 6, 15.00),
('SUP202301004', 1, 1, 50.00),
('SUP202301004', 4, 1, 250.00),
('SUP202301005', 2, 2, 80.00),
('SUP202301005', 3, 5, 45.00);

-- 删除原有的订单相关视图


-- 创建综合订单视图
CREATE OR REPLACE VIEW order_comprehensive_view AS
WITH order_base AS (
    SELECT 
        o.order_no,
        o.user_id,
        o.store_id,
        o.total_amount,
        o.status,
        o.created_at,
        o.updated_at,
        u.username as customer_name,
        s.name as store_name,
        COUNT(oi.id) as item_count,
        GROUP_CONCAT(DISTINCT p.name) as product_names,
        GROUP_CONCAT(p.name ORDER BY oi.id) as products,
        GROUP_CONCAT(oi.quantity ORDER BY oi.id) as quantities,
        GROUP_CONCAT(oi.price ORDER BY oi.id) as prices
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN stores s ON o.store_id = s.id
    LEFT JOIN order_items oi ON o.order_no = oi.order_no
    LEFT JOIN products p ON oi.product_id = p.id
    GROUP BY 
        o.order_no, 
        o.user_id, 
        o.store_id, 
        o.total_amount, 
        o.status, 
        o.created_at, 
        o.updated_at, 
        u.username, 
        s.name
)
SELECT 
    ob.*,
    oi.id as item_id,
    oi.product_id,
    p.name as product_name,
    p.image_url,
    oi.quantity,
    oi.price,
    CASE 
        WHEN u.role = 'manager' THEN 1
        WHEN u.role = 'employee' AND e.store_id = ob.store_id THEN 1
        WHEN u.role = 'customer' AND ob.user_id = u.id THEN 1
        ELSE 0
    END as has_permission,
    u.id as auth_user_id,
    u.role as auth_user_role,
    e.store_id as employee_store_id
FROM order_base ob
LEFT JOIN order_items oi ON ob.order_no = oi.order_no
LEFT JOIN products p ON oi.product_id = p.id
CROSS JOIN users u
LEFT JOIN employees e ON u.id = e.id;

-- 创建管理员仪表盘统计视图
CREATE OR REPLACE VIEW admin_dashboard_stats_view AS
WITH date_range AS (
    SELECT CURDATE() - INTERVAL (a.a + (10 * b.a) + (100 * c.a)) DAY AS date
    FROM (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS a
    CROSS JOIN (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) AS b
    CROSS JOIN (SELECT 0 AS a) AS c
    WHERE CURDATE() - INTERVAL (a.a + (10 * b.a) + (100 * c.a)) DAY >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
),
daily_stats AS (
    SELECT 
        COALESCE(dates.date, CURDATE()) as date,
        COUNT(DISTINCT o.order_no) as order_count,
        COALESCE(SUM(o.total_amount), 0) as daily_sales,
        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_completed_sales,
        COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.order_no END) as pending_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'processing' THEN o.order_no END) as processing_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.order_no END) as completed_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'cancelled' THEN o.order_no END) as cancelled_orders
    FROM date_range dates
    LEFT JOIN orders o ON DATE(o.created_at) = dates.date
    GROUP BY dates.date
),
user_stats AS (
    SELECT COUNT(DISTINCT id) as customer_count
    FROM users 
    WHERE role = 'customer'
),
store_stats AS (
    SELECT COUNT(DISTINCT id) as store_count
    FROM stores
),
total_stats AS (
    SELECT 
        CURDATE() as date,
        COUNT(DISTINCT o.order_no) as order_count,
        COALESCE(SUM(o.total_amount), 0) as daily_sales,
        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_completed_sales,
        COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.order_no END) as pending_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'processing' THEN o.order_no END) as processing_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.order_no END) as completed_orders,
        COUNT(DISTINCT CASE WHEN o.status = 'cancelled' THEN o.order_no END) as cancelled_orders
    FROM orders o
)
SELECT 
    ds.*,
    us.customer_count,
    ss.store_count
FROM (
    SELECT * FROM daily_stats
    UNION ALL
    SELECT * FROM total_stats
) ds
CROSS JOIN user_stats us
CROSS JOIN store_stats ss;

-- 创建每日订单统计视图
CREATE OR REPLACE VIEW daily_order_stats_view AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as order_count,
    SUM(total_amount) as daily_sales
FROM orders
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(created_at);

-- 创建用户认证视图
CREATE OR REPLACE VIEW user_auth_view AS
SELECT 
    u.id,
    u.username,
    u.password,
    u.role,
    u.email,
    u.phone,
    CASE 
        WHEN e.id IS NOT NULL THEN e.store_id
        ELSE NULL
    END as store_id,
    CASE 
        WHEN e.id IS NOT NULL THEN e.position
        ELSE NULL
    END as position,
    u.created_at,
    u.updated_at
FROM users u
LEFT JOIN employees e ON u.id = e.id;

-- 创建购物车管理视图（包含库存信息）
CREATE OR REPLACE VIEW cart_management_view AS
SELECT 
    p.id as product_id,
    p.name,
    p.price,
    p.stock,
    p.image_url,
    ci.id as cart_id,
    ci.user_id,
    ci.quantity as cart_quantity,
    ci.created_at,
    ci.updated_at
FROM (
    SELECT * FROM products WHERE deleted_at IS NULL
) p
LEFT JOIN cart_items ci ON p.id = ci.product_id;

-- 删除原有���员工相关视图
DROP VIEW IF EXISTS employee_orders_view;
DROP VIEW IF EXISTS employee_inventory_view;
DROP VIEW IF EXISTS employee_info_view;

-- 创建综合员工视图
CREATE OR REPLACE VIEW employee_comprehensive_view AS
WITH product_info AS (
    SELECT 
        si.store_id,
        p.id as product_id,
        p.name as product_name,
        p.description,
        p.price,
        p.category,
        si.quantity as stock
    FROM (
        SELECT * FROM products WHERE deleted_at IS NULL
    ) p
    JOIN store_inventory si ON p.id = si.product_id
),
order_info AS (
    SELECT 
        o.store_id,
        o.order_no,
        o.total_amount,
        o.status,
        o.created_at,
        u.username as customer_name,
        GROUP_CONCAT(p.name ORDER BY oi.id) as products,
        GROUP_CONCAT(oi.quantity ORDER BY oi.id) as quantities
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.order_no = oi.order_no
    LEFT JOIN (
        SELECT * FROM products WHERE deleted_at IS NULL
    ) p ON oi.product_id = p.id
    GROUP BY o.store_id, o.order_no, o.total_amount, o.status, o.created_at, u.username
),
order_stats AS (
    SELECT 
        store_id,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_orders,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN total_amount ELSE 0 END) as today_sales,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders
    FROM orders
    GROUP BY store_id
)
SELECT DISTINCT
    u.id,
    u.username,
    u.email,
    u.role,
    u.created_at as user_created_at,
    u.updated_at as user_updated_at,
    e.store_id,
    s.name as store_name,
    e.position,
    e.hire_date,
    e.salary,
    COALESCE(os.today_orders, 0) as today_orders,
    COALESCE(os.today_sales, 0) as today_sales,
    COALESCE(os.pending_orders, 0) as pending_orders,
    pi.product_id,
    pi.product_name,
    pi.description,
    pi.price,
    pi.stock,
    pi.category,
    oi.order_no,
    oi.total_amount,
    oi.status as order_status,
    oi.created_at as order_created_at,
    oi.customer_name,
    oi.products,
    oi.quantities
FROM users u
LEFT JOIN employees e ON u.id = e.id
LEFT JOIN stores s ON e.store_id = s.id
LEFT JOIN order_stats os ON e.store_id = os.store_id
LEFT JOIN order_info oi ON e.store_id = oi.store_id
LEFT JOIN product_info pi ON e.store_id = pi.store_id
WHERE u.role = 'employee';

-- 创建综合产品视图
CREATE OR REPLACE VIEW product_comprehensive_view AS
SELECT 
    p.id,
    p.name,
    p.price,
    p.description,
    p.category,
    p.image_url,
    p.stock as total_stock,
    p.rating,
    p.sales,
    p.deleted_at,
    si.store_id,
    s.name as store_name,
    si.quantity as store_quantity,
    sp.supplier_id,
    sup.company_name as supplier_name,
    sup.contact_name as supplier_contact,
    sup.phone as supplier_phone,
    sup.address as supplier_address
FROM (
    SELECT * FROM products WHERE deleted_at IS NULL
) p
LEFT JOIN (
    SELECT product_id, store_id, SUM(quantity) as quantity
    FROM store_inventory
    GROUP BY product_id, store_id
) si ON p.id = si.product_id
LEFT JOIN stores s ON si.store_id = s.id
LEFT JOIN supplier_products sp ON p.id = sp.product_id
LEFT JOIN suppliers sup ON sp.supplier_id = sup.id;

-- 创建产品管理视图
CREATE OR REPLACE VIEW product_management_view AS
WITH store_inventory_info AS (
    SELECT 
        p.id as product_id,
        GROUP_CONCAT(CONCAT(s.name, ':', si.quantity) SEPARATOR ';') as store_stocks
    FROM (
        SELECT * FROM products WHERE deleted_at IS NULL
    ) p
    LEFT JOIN store_inventory si ON p.id = si.product_id
    LEFT JOIN stores s ON si.store_id = s.id
    GROUP BY p.id
)
SELECT 
    p.id,
    p.name,
    CAST(p.price AS DECIMAL(10,2)) as price,
    p.description,
    p.category,
    p.image_url,
    p.stock,
    p.sales,
    p.rating,
    p.created_at,
    p.updated_at,
    p.deleted_at,
    si.store_stocks,
    sp.supplier_id,
    sup.company_name as supplier_name,
    sup.contact_name as supplier_contact,
    sup.phone as supplier_phone,
    sup.address as supplier_address
FROM (
    SELECT * FROM products WHERE deleted_at IS NULL
) p
LEFT JOIN store_inventory_info si ON p.id = si.product_id
LEFT JOIN supplier_products sp ON p.id = sp.product_id
LEFT JOIN suppliers sup ON sp.supplier_id = sup.id;

-- 创建商店管理视图
CREATE OR REPLACE VIEW store_management_view AS
WITH store_stats AS (
    SELECT 
        s.id as store_id,
        COUNT(DISTINCT e.id) as employee_count,
        COUNT(DISTINCT o.order_no) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_sales,
        COUNT(DISTINCT si.product_id) as product_count,
        COALESCE(SUM(si.quantity), 0) as total_inventory
FROM stores s
    LEFT JOIN employees e ON s.id = e.store_id
LEFT JOIN orders o ON s.id = o.store_id
    LEFT JOIN store_inventory si ON s.id = si.store_id
    GROUP BY s.id
)
SELECT 
    s.id,
    s.name,
    s.address,
    s.phone,
    s.created_at,
    s.updated_at,
    ss.employee_count,
    ss.order_count,
    ss.total_sales,
    ss.product_count,
    ss.total_inventory,
    GROUP_CONCAT(DISTINCT e.id) as employee_ids,
    GROUP_CONCAT(DISTINCT p.name) as product_names
FROM stores s
LEFT JOIN store_stats ss ON s.id = ss.store_id
LEFT JOIN employees e ON s.id = e.store_id
LEFT JOIN store_inventory si ON s.id = si.store_id
LEFT JOIN products p ON si.product_id = p.id
GROUP BY 
    s.id, s.name, s.address, s.phone, s.created_at, s.updated_at,
    ss.employee_count, ss.order_count, ss.total_sales, ss.product_count, ss.total_inventory;

-- 创建供应商综合视图
CREATE OR REPLACE VIEW supplier_comprehensive_view AS
WITH supplier_stats AS (
    SELECT 
        sp.supplier_id,
        COUNT(DISTINCT so.order_no) as total_orders,
        COALESCE(SUM(soi.quantity * soi.supply_price), 0) as total_revenue,
        COUNT(DISTINCT sp.product_id) as total_products,
        COUNT(DISTINCT CASE WHEN so.status = 'pending' THEN so.order_no END) as pending_orders
    FROM supplier_products sp
    LEFT JOIN products p ON sp.product_id = p.id
    LEFT JOIN supply_order_items soi ON p.id = soi.product_id
    LEFT JOIN supply_orders so ON soi.order_no = so.order_no
    WHERE p.deleted_at IS NULL
    GROUP BY sp.supplier_id
),
supplier_orders_info AS (
    SELECT 
        s.id as supplier_id,
        so.order_no,
        st.name as store_name,
        p.name as product_name,
        soi.quantity,
        soi.supply_price,
        (soi.quantity * soi.supply_price) as total_amount,
        so.status,
        so.created_at as order_created_at
    FROM suppliers s
    JOIN supply_orders so ON s.id = so.supplier_id
    JOIN supply_order_items soi ON so.order_no = soi.order_no
    JOIN products p ON soi.product_id = p.id
    JOIN stores st ON so.store_id = st.id
)
SELECT 
    u.id as supplier_id,
    u.username,
    u.email,
    u.role,
    s.company_name,
    s.contact_name,
    s.phone,
    s.address,
    ss.total_orders,
    ss.total_revenue,
    ss.total_products,
    ss.pending_orders,
    p.id as product_id,
    p.name as product_name,
    p.price as retail_price,
    p.description,
    p.category,
    p.image_url,
    sp.supply_price,
    soi.order_no,
    soi.store_name,
    soi.quantity,
    soi.total_amount,
    soi.status,
    soi.order_created_at
FROM users u
JOIN suppliers s ON u.id = s.id
LEFT JOIN supplier_stats ss ON s.id = ss.supplier_id
LEFT JOIN supplier_products sp ON s.id = sp.supplier_id
LEFT JOIN products p ON sp.product_id = p.id
LEFT JOIN supplier_orders_info soi ON s.id = soi.supplier_id
WHERE u.role = 'supplier';

-- 恢复外键检查
SET FOREIGN_KEY_CHECKS=1;