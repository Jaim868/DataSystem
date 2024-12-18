-- 创建数据库
CREATE DATABASE IF NOT EXISTS fishing_store;
USE fishing_store;

-- 删除已存在的表
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS store_profits;
DROP TABLE IF EXISTS promotions;
DROP TABLE IF EXISTS store_inventory;
DROP TABLE IF EXISTS supplier_products;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 创建用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'supplier', 'employee', 'manager') NOT NULL,
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
    phone VARCHAR(20) NOT NULL,
    manager_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- 创建供应商表
CREATE TABLE suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建商品表
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    image_url VARCHAR(255),
    stock INT NOT NULL DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0,
    sales INT DEFAULT 0,
    deleted_at TIMESTAMP NULL,
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

-- 创建商店库存表
CREATE TABLE store_inventory (
    store_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    PRIMARY KEY (store_id, product_id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 创建订单表
CREATE TABLE orders (
    order_no VARCHAR(20) PRIMARY KEY,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
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

-- 创建促销表
CREATE TABLE promotions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id INT NOT NULL,
    product_id INT NOT NULL,
    discount_percentage DECIMAL(5,2) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 创建商店利润表
CREATE TABLE store_profits (
    store_id INT NOT NULL,
    year YEAR NOT NULL,
    profit DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (store_id, year),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- 插入测试数据
-- 插入用户数据
INSERT INTO users (username, password, role, email, phone) VALUES
('customer1', 'password123', 'customer', 'customer1@example.com', '13512345678'),
('supplier1', 'password123', 'supplier', 'supplier1@example.com', '13623456789'),
('employee1', 'password123', 'employee', 'employee1@example.com', '13734567890'),
('manager1', 'password123', 'manager', 'manager1@example.com', '13845678901'),
('customer2', 'password123', 'customer', 'customer2@example.com', '13512345679'),
('supplier2', 'password123', 'supplier', 'supplier2@example.com', '13623456790');

-- 插入商店数据
INSERT INTO stores (name, address, phone) VALUES
('渔具之家', '北京市朝阳区建国路88号', '010-12345678'),
('钓鱼人生', '上海市浦东新区陆家嘴1号', '021-87654321'),
('垂钓天地', '广州市天河区体育西路123号', '020-45678901');

-- 插入供应商数据
INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
('海钓用品批发商', '张三', '13812345678', 'zhangsan@example.com', '深圳市南山区科技园'),
('淡水渔具供应商', '李四', '13987654321', 'lisi@example.com', '江苏省苏州市工业园区'),
('专业���具制造商', '王五', '13567890123', 'wangwu@example.com', '浙江省杭州市滨江区');

-- 插入商品数据
INSERT INTO products (name, price, description, category, image_url, stock, rating, sales) VALUES
('碳素钓鱼竿2.7米', 299.00, '超轻超硬碳素材质，适合各种钓位', '鱼竿', '/images/rod1.jpg', 100, 4.8, 50),
('专业路亚竿套装', 599.00, '含各种假饵，全套装备一应俱全', '鱼竿', '/images/rod2.jpg', 80, 4.9, 30),
('高档渔线套装', 89.00, '进口尼龙材质，拉力强韧耐用', '渔线', '/images/line1.jpg', 200, 4.7, 100),
('精致浮漂50支装', 45.00, '灵敏度高，多种规格可选', '浮漂', '/images/float1.jpg', 500, 4.6, 200),
('高级鱼饵套装', 129.00, '多种口味，适合各类鱼种', '鱼饵', '/images/bait1.jpg', 300, 4.8, 150);

-- 插入员工数据
INSERT INTO employees (id, store_id, hire_date, salary, position) VALUES
(3, 1, '2023-01-15', 5000.00, '店长'),
(4, 2, '2023-02-01', 4500.00, '销售');

-- 插入供应商产品关联数据
INSERT INTO supplier_products (supplier_id, product_id, supply_price) VALUES
(1, 1, 200.00),
(1, 2, 400.00),
(2, 3, 50.00),
(2, 4, 25.00),
(3, 5, 80.00);

-- 插入商店库存数据
INSERT INTO store_inventory (store_id, product_id, quantity) VALUES
(1, 1, 30),
(1, 2, 20),
(1, 3, 50),
(2, 1, 25),
(2, 4, 100),
(3, 2, 15),
(3, 5, 80);

-- 插入促销数据
INSERT INTO promotions (store_id, product_id, discount_percentage, start_date, end_date) VALUES
(1, 1, 10.00, '2024-03-01', '2024-03-31'),
(2, 4, 15.00, '2024-03-01', '2024-03-31'),
(3, 5, 20.00, '2024-03-01', '2024-03-31');

-- 插入商店利润数据
INSERT INTO store_profits (store_id, year, profit) VALUES
(1, 2024, 50000.00),
(2, 2024, 45000.00),
(3, 2024, 38000.00);

-- 插入一些测试订单
INSERT INTO orders (order_no, user_id, store_id, total_amount, status) VALUES
('ORD20240301001', 1, 1, 299.00, 'completed'),
('ORD20240301002', 1, 2, 599.00, 'pending'),
('ORD20240301003', 5, 1, 89.00, 'processing');

-- 插入订单项目
INSERT INTO order_items (order_no, product_id, quantity, price) VALUES
('ORD20240301001', 1, 1, 299.00),
('ORD20240301002', 2, 1, 599.00),
('ORD20240301003', 3, 1, 89.00);

-- 插入购物车数据
INSERT INTO cart_items (user_id, product_id, quantity) VALUES
(1, 1, 1),
(1, 3, 2),
(5, 2, 1); 