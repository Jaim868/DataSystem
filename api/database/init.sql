
-- 创建数据库
CREATE DATABASE IF NOT EXISTS fishing_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE fishing_shop;

-- 创建用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建商品表
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    image_url VARCHAR(255),
    stock INT DEFAULT 0,
    sales INT DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建订单表
CREATE TABLE orders (
    order_no VARCHAR(50) PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'shipped') NOT NULL DEFAULT 'pending' COMMENT '订单状态：pending=待发货，shipped=已发货',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 创建订单明细表
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY user_product (user_id, product_id)
);

-- 创建商品特性表
CREATE TABLE product_features (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    feature VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 创建员工表
CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    position VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    hire_date DATE NOT NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入测试账号
INSERT INTO users (username, password, role) VALUES
('admin', 'admin', 'admin'),
('user', 'user', 'customer');

-- 插入商品数据
INSERT INTO products (name, price, description, category, image_url, stock, sales, rating) VALUES
('碳素鱼竿', 299.00, '高品质碳素材料，轻便耐用，适合各种钓鱼场景', '鱼竿', '/images/products/fishing_rod_carbon.jpg', 50, 120, 0),
('专业级渔线', 59.00, '日本进口材料，超强韧性，不易断裂', '鱼线', 'https://via.placeholder.com/200x200?text=专业渔线', 200, 300, 0),
('自动钓鱼竿套装', 899.00, '智能感应，自动收线，适合新手和专业钓友', '鱼竿', 'https://via.placeholder.com/200x200?text=自动钓鱼竿', 30, 80, 0),
('高灵敏鱼漂套装', 45.00, '灵敏度高，夜光设计，多种规格可选', '鱼漂', 'https://via.placeholder.com/200x200?text=鱼漂套装', 150, 200, 0),
('专业鱼钩套装', 89.00, '日本进口钢材，锋利耐用，多种型号', '鱼钩', 'https://via.placeholder.com/200x200?text=鱼钩套装', 100, 180, 0),
('多功能渔具包', 159.00, '大容量设计，防水材质，多层收纳', '配件', 'https://via.placeholder.com/200x200?text=渔具包', 40, 90, 0),
('电子咬钩报警器', 129.00, '灵敏度可调，防水设计，声光报警', '配件', 'https://via.placeholder.com/200x200?text=报警器', 60, 150, 0),
('折叠钓鱼椅', 199.00, '轻便折叠，承重强，带置物架', '配件', 'https://via.placeholder.com/200x200?text=钓鱼椅', 45, 75, 0);

-- 插入商品特性数据
INSERT INTO product_features (product_id, feature) VALUES
(1, '超轻碳素材质'),
(1, '伸缩便携设计'),
(1, '防滑手柄'),
(2, '超强韧性'),
(2, '防缠绕'),
(2, '耐磨损'),
(3, '自动收线'),
(3, '智能感应'),
(3, '配件齐全'),
(4, '夜光设计'),
(4, '多规格'),
(4, '高灵敏度'),
(5, '锋利持久'),
(5, '防锈处理'),
(5, '多型号可选'),
(6, '防水设计'),
(6, '大容量'),
(6, '多层收纳'),
(7, '声光报警'),
(7, '防水设计'),
(7, '灵敏可调'),
(8, '轻便折叠'),
(8, '高承重'),
(8, '带置物架');

-- 添加一些测试数据
INSERT INTO employees (name, position, email, phone, hire_date) VALUES
('张三', '店长', 'zhangsan@example.com', '13800138000', CURDATE()),
('李四', '销售', 'lisi@example.com', '13800138001', CURDATE()),
('王五', '仓管', 'wangwu@example.com', '13800138002', CURDATE());

