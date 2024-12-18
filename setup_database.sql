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
    stock INT NOT NULL DEFAULT 0,
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
    last_supply_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
INSERT INTO products (id, name, description, price, category, image_url, stock, rating, sales) VALUES 
(1, '专业钓鱼竿', '碳纤维材质，轻便耐用', 299.99, '鱼竿', '/images/rod1.jpg', 100, 4.8, 150),
(2, '高级渔线', '超强拉力不易断裂', 49.99, '渔线', '/images/line1.jpg', 200, 4.5, 300),
(3, '精致鱼钩', '日本进口，锋利持久', 19.99, '鱼钩', '/images/hook1.jpg', 500, 4.7, 450),
(4, '多功能鱼篓', '大容量，防水耐用', 159.99, '工具', '/images/basket1.jpg', 80, 4.6, 120),
(5, '专业钓椅', '便携折叠，承重150kg', 199.99, '工具', '/images/chair1.jpg', 60, 4.9, 200),
(6, '高级饵料', '进口配方，效果显著', 29.99, '饵料', '/images/bait1.jpg', 400, 4.4, 600),
(7, '防晒钓鱼帽', '透气防晒，舒适耐用', 89.99, '服饰', '/images/hat1.jpg', 150, 4.3, 80),
(8, '防水钓鱼服', '高品质防水面料', 399.99, '服饰', '/images/cloth1.jpg', 100, 4.7, 60),
(9, '钓鱼工具箱', '多层收纳，防水防潮', 129.99, '工具', '/images/box1.jpg', 120, 4.5, 90),
(10, '电子咬钩器', '灵敏度高，防水设计', 79.99, '工具', '/images/bite1.jpg', 200, 4.6, 150);

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

-- 创建视图
-- 库存视图
CREATE OR REPLACE VIEW inventory_view AS
SELECT 
    p.id,
    p.name AS product_name,
    p.description,
    p.price,
    si.quantity,
    s.name AS store_name,
    s.id AS store_id,
    si.updated_at
FROM products p
LEFT JOIN store_inventory si ON p.id = si.product_id
LEFT JOIN stores s ON si.store_id = s.id
WHERE p.deleted_at IS NULL;

-- 销售统计视图
CREATE OR REPLACE VIEW sales_statistics_view AS
SELECT 
    s.id AS store_id,
    s.name AS store_name,
    COUNT(o.order_no) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_sales,
    COUNT(CASE WHEN o.status = 'pending' THEN 1 END) AS pending_orders,
    COUNT(CASE WHEN DATE(o.created_at) = CURRENT_DATE THEN 1 END) AS today_orders,
    COALESCE(SUM(CASE WHEN DATE(o.created_at) = CURRENT_DATE THEN o.total_amount ELSE 0 END), 0) AS today_sales
FROM stores s
LEFT JOIN orders o ON s.id = o.store_id
GROUP BY s.id, s.name;

-- 商品销售排行视图
CREATE OR REPLACE VIEW product_sales_ranking_view AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    COUNT(oi.order_no) AS total_orders,
    SUM(oi.quantity) AS total_quantity_sold,
    COALESCE(SUM(oi.quantity * oi.price), 0) AS total_sales_amount
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_no = o.order_no
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.name
ORDER BY total_sales_amount DESC;

-- 供应商销售统计视图
CREATE OR REPLACE VIEW supplier_sales_view AS
SELECT 
    sp.supplier_id,
    COUNT(DISTINCT oi.order_no) as total_orders,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.quantity * sp.supply_price) as total_revenue,
    COUNT(CASE WHEN p.stock < 10 THEN 1 END) as low_stock_products,
    COUNT(DISTINCT p.id) as total_products
FROM supplier_products sp
LEFT JOIN products p ON sp.product_id = p.id
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_no = o.order_no
WHERE p.deleted_at IS NULL
GROUP BY sp.supplier_id;

-- 恢复外键检查
SET FOREIGN_KEY_CHECKS=1;