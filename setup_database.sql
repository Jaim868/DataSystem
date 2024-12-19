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
INSERT INTO users (id, username, password, role, email, phone) 
VALUES 
(1, 'admin', 'admin123', 'manager', 'admin@fishing.com', '13800000001'),
(2, 'customer1', 'customer123', 'customer', 'customer1@example.com', '13800000002'),
(3, 'customer2', 'customer321', 'customer', 'customer2@example.com', '13800000003'),
(4, 'customer3', 'customer234', 'customer', 'customer3@example.com', '13800000004'),
(5, 'customer4', 'cust4pass', 'customer', 'customer4@example.com', '13800000005'),
(6, 'customer5', 'cust5pass', 'customer', 'customer5@example.com', '13800000006'),
(7, 'customer6', 'cust6pass', 'customer', 'customer6@example.com', '13800000007'),
(8, 'customer7', 'cust7pass', 'customer', 'customer7@example.com', '13800000008'),
(9, 'customer8', 'cust8pass', 'customer', 'customer8@example.com', '13800000009'),
(10, 'customer9', 'cust9pass', 'customer', 'customer9@example.com', '13800000010'),
(11, 'customer10', 'cust10pass', 'customer', 'customer10@example.com', '13800000011'),
(12, 'customer11', 'cust111pass', 'customer', 'customer11@example.com', '13800000012'),
(13, 'customer12', 'cust12pass', 'customer', 'customer12@example.com', '13800000013'),
(14, 'customer13', 'cust13pass', 'customer', 'customer13@example.com', '13800000014'),
(15, 'customer14', 'cust14pass', 'customer', 'customer14@example.com', '13800000015'),
(16, 'customer15', 'cust15pass', 'customer', 'customer15@example.com', '13800000016'),
(17, 'customer16', 'cust16pass', 'customer', 'customer16@example.com', '13800000017'),
(18, 'customer17', 'cust17pass', 'customer', 'customer17@example.com', '13800000018'),
(19, 'customer18', 'cust18pass', 'customer', 'customer18@example.com', '13800000019'),
(20, 'customer19', 'cust19pass', 'customer', 'customer19@example.com', '13800000020'),
(21, 'customer20', 'cust20pass', 'customer', 'customer20@example.com', '13800000021'),
(22, 'customer21', 'cust21pass', 'customer', 'customer21@example.com', '13800000022'),
(23, 'customer22', 'cust22pass', 'customer', 'customer22@example.com', '13800000023'),
(24, 'customer23', 'cust23pass', 'customer', 'customer23@example.com', '13800000024'),
(25, 'customer24', 'cust24pass', 'customer', 'customer24@example.com', '13800000025'),
(26, 'customer25', 'cust25pass', 'customer', 'customer25@example.com', '13800000026'),
(27, 'customer26', 'cust26pass', 'customer', 'customer26@example.com', '13800000027'),
(28, 'customer27', 'cust27pass', 'customer', 'customer27@example.com', '13800000028'),
(29, 'customer28', 'cust28pass', 'customer', 'customer28@example.com', '13800000029'),
(30, 'supplier1', 'supplier123', 'supplier', 'supplier1@example.com', '13800000030'),
(31, 'supplier2', 'supplier234', 'supplier', 'supplier2@example.com', '13800000031'),
(32, 'supplier3', 'supplier345', 'supplier', 'supplier3@example.com', '13800000032'),
(33, 'supplier4', 'supplier456', 'supplier', 'supplier4@example.com', '13800000033'),
(34, 'supplier5', 'supplier567', 'supplier', 'supplier5@example.com', '13800000034'),
(35, 'supplier6', 'supplier678', 'supplier', 'supplier6@example.com', '13800000035'),
(36, 'supplier7', 'supplier789', 'supplier', 'supplier7@example.com', '13800000036'),
(37, 'supplier8', 'supplier890', 'supplier', 'supplier8@example.com', '13800000037'),
(38, 'supplier9', 'supplier901', 'supplier', 'supplier9@example.com', '13800000038'),
(39, 'supplier10', 'supplier012', 'supplier', 'supplier10@example.com', '13800000039'),
(40, 'supplier11', 'supplier1234', 'supplier', 'supplier11@example.com', '13800000040'),
(41, 'supplier12', 'supplier2345', 'supplier', 'supplier12@example.com', '13800000041'),
(42, 'supplier13', 'supplier3456', 'supplier', 'supplier13@example.com', '13800000042'),
(43, 'supplier14', 'supplier4567', 'supplier', 'supplier14@example.com', '13800000043'),
(44, 'supplier15', 'supplier5678', 'supplier', 'supplier15@example.com', '13800000044'),
(45, 'supplier16', 'supplier6789', 'supplier', 'supplier16@example.com', '13800000045'),
(46, 'supplier17', 'supplier7890', 'supplier', 'supplier17@example.com', '13800000046'),
(47, 'supplier18', 'supplier8901', 'supplier', 'supplier18@example.com', '13800000047'),
(48, 'supplier19', 'supplier9012', 'supplier', 'supplier19@example.com', '13800000048'),
(49, 'supplier20', 'supplier0123', 'supplier', 'supplier20@example.com', '13800000049'),
(50, 'employee1', 'emp1pass', 'employee', 'employee1@fishing.com', '13800000050'),
(51, 'employee2', 'emp2pass', 'employee', 'employee2@fishing.com', '13800000051'),
(52, 'employee3', 'emp3pass', 'employee', 'employee3@fishing.com', '13800000052'),
(53, 'employee4', 'emp4pass', 'employee', 'employee4@fishing.com', '13800000053'),
(54, 'employee5', 'emp5pass', 'employee', 'employee5@fishing.com', '13800000054'),
(55, 'employee6', 'emp6pass', 'employee', 'employee6@fishing.com', '13800000055'),
(56, 'employee7', 'emp7pass', 'employee', 'employee7@fishing.com', '13800000056'),
(57, 'employee8', 'emp8pass', 'employee', 'employee8@fishing.com', '13800000057'),
(58, 'employee9', 'emp9pass', 'employee', 'employee9@fishing.com', '13800000058'),
(59, 'employee10', 'emp10pass', 'employee', 'employee10@fishing.com', '13800000059'),
(60, 'employee11', 'emp11pass', 'employee', 'employee11@fishing.com', '13800000060'),
(61, 'employee12', 'emp12pass', 'employee', 'employee12@fishing.com', '13800000061'),
(62, 'employee13', 'emp13pass', 'employee', 'employee13@fishing.com', '13800000062'),
(63, 'employee14', 'emp14pass', 'employee', 'employee14@fishing.com', '13800000063'),
(64, 'employee15', 'emp15pass', 'employee', 'employee15@fishing.com', '13800000064'),
(65, 'employee16', 'emp16pass', 'employee', 'employee16@fishing.com', '13800000065'),
(66, 'employee17', 'emp17pass', 'employee', 'employee17@fishing.com', '13800000066'),
(67, 'employee18', 'emp18pass', 'employee', 'employee18@fishing.com', '13800000067'),
(68, 'employee19', 'emp19pass', 'employee', 'employee19@fishing.com', '13800000068'),
(69, 'employee20', 'emp20pass', 'employee', 'employee20@fishing.com', '13800000069'),
(70, 'employee21', 'emp21pass', 'employee', 'employee21@fishing.com', '13800000070'),
(71, 'employee22', 'emp22pass', 'employee', 'employee22@fishing.com', '13800000071'),
(72, 'employee23', 'emp23pass', 'employee', 'employee23@fishing.com', '13800000072'),
(73, 'employee24', 'emp24pass', 'employee', 'employee24@fishing.com', '13800000073'),
(74, 'employee25', 'emp25pass', 'employee', 'employee25@fishing.com', '13800000074'),
(75, 'employee26', 'emp26pass', 'employee', 'employee26@fishing.com', '13800000075'),
(76, 'employee27', 'emp27pass', 'employee', 'employee27@fishing.com', '13800000076'),
(77, 'employee28', 'emp28pass', 'employee', 'employee28@fishing.com', '13800000077'),
(78, 'employee29', 'emp29pass', 'employee', 'employee29@fishing.com', '13800000078'),
(79, 'employee30', 'emp30pass', 'employee', 'employee30@fishing.com', '13800000079'),
(80, 'employee31', 'emp31pass', 'employee', 'employee31@fishing.com', '13800000080'),
(81, 'employee32', 'emp32pass', 'employee', 'employee32@fishing.com', '13800000081'),
(82, 'employee33', 'emp33pass', 'employee', 'employee33@fishing.com', '13800000082'),
(83, 'employee34', 'emp34pass', 'employee', 'employee34@fishing.com', '13800000083'),
(84, 'employee35', 'emp35pass', 'employee', 'employee35@fishing.com', '13800000084'),
(85, 'employee36', 'emp36pass', 'employee', 'employee36@fishing.com', '13800000085'),
(86, 'employee37', 'emp37pass', 'employee', 'employee37@fishing.com', '13800000086'),
(87, 'employee38', 'emp38pass', 'employee', 'employee38@fishing.com', '13800000087'),
(88, 'employee39', 'emp39pass', 'employee', 'employee39@fishing.com', '13800000088'),
(89, 'employee40', 'emp40pass', 'employee', 'employee40@fishing.com', '13800000089'),
(90, 'employee41', 'emp41pass', 'employee', 'employee41@fishing.com', '13800000090'),
(91, 'employee42', 'emp42pass', 'employee', 'employee42@fishing.com', '13800000091'),
(92, 'employee43', 'emp43pass', 'employee', 'employee43@fishing.com', '13800000092'),
(93, 'employee44', 'emp44pass', 'employee', 'employee44@fishing.com', '13800000093'),
(94, 'employee45', 'emp45pass', 'employee', 'employee45@fishing.com', '13800000094'),
(95, 'employee46', 'emp46pass', 'employee', 'employee46@fishing.com', '13800000095'),
(96, 'employee47', 'emp47pass', 'employee', 'employee47@fishing.com', '13800000096'),
(97, 'employee48', 'emp48pass', 'employee', 'employee48@fishing.com', '13800000097'),
(98, 'employee49', 'emp49pass', 'employee', 'employee49@fishing.com', '13800000098'),
(99, 'employee50', 'emp50pass', 'employee', 'employee50@fishing.com', '13800000099'),
(100, 'customer29', 'customer0123', 'customer', 'customer29@example.com', '13800000100');


-- 创建商店
INSERT INTO stores (id, name, address, phone) 
VALUES
(1, '渔具分店1', '北京市朝阳区1号', '010-12345678'),
(2, '渔具分店2', '天津市和平区2号', '022-23456789'),
(3, '渔具分店3', '上海市浦东新区123号', '021-12345678'),
(4, '渔具分店4', '广州市越秀区456号', '020-87654321'),
(5, '渔具分店5', '深圳市南山区789号', '0755-56789012'),
(6, '渔具分店6', '杭州市西湖区10号', '0571-34567890'),
(7, '渔具分店7', '成都市锦江区11号', '028-12389012'),
(8, '渔具分店8', '南京市玄武区12号', '025-34567812'),
(9, '渔具分店9', '苏州市工业园区13号', '0512-12345689'),
(10, '渔具分店10', '武汉市江汉区14号', '027-56789013'),
(11, '渔具分店11', '西安市未央区15号', '029-23456780'),
(12, '渔具分店12', '长沙市岳麓区16号', '0731-67890123'),
(13, '渔具分店13', '重庆市渝北区17号', '023-98765432'),
(14, '渔具分店14', '郑州市中原区18号', '0371-12389045'),
(15, '渔具分店15', '青岛市崂山区19号', '0532-23456781'),
(16, '渔具分店16', '福州市鼓楼区20号', '0591-67890134'),
(17, '渔具分店17', '厦门市思明区21号', '0592-34567891'),
(18, '渔具分店18', '合肥市庐阳区22号', '0551-56789014'),
(19, '渔具分店19', '南昌市东湖区23号', '0791-67890145'),
(20, '渔具分店20', '昆明市盘龙区24号', '0871-12345690');


-- 创建员工
INSERT INTO employees (id, store_id, hire_date, salary, position) 
VALUES
(50, 1, '2022-01-01', 6000.00, '店长'),
(51, 4, '2022-06-01', 5500.00, '副店长'),
(52, 2, '2023-01-01', 5000.00, '销售'),
(53, 19, '2023-02-01', 5000.00, '销售'),
(54, 12, '2023-03-01', 5000.00, '销售'),
(55, 15, '2022-07-01', 6000.00, '店长'),
(56, 10, '2023-04-01', 5500.00, '副店长'),
(57, 8, '2023-04-01', 4500.00, '收银员'),
(58, 7, '2023-05-01', 5000.00, '销售'),
(59, 6, '2023-06-01', 4000.00, '收银员'),
(60, 14, '2022-09-01', 6500.00, '店长'),
(61, 1, '2023-07-01', 5500.00, '副店长'),
(62, 9, '2022-10-01', 6000.00, '店长'),
(63, 16, '2023-08-01', 5000.00, '销售'),
(64, 5, '2023-09-01', 4500.00, '收银员'),
(65, 11, '2023-10-01', 5000.00, '销售'),
(66, 3, '2022-11-01', 6000.00, '店长'),
(67, 18, '2023-11-01', 5500.00, '副店长'),
(68, 4, '2022-12-01', 6000.00, '店长'),
(69, 13, '2023-12-01', 5000.00, '销售'),
(70, 2, '2022-01-01', 7000.00, '店长'),
(71, 6, '2022-06-01', 6000.00, '副店长'),
(72, 3, '2023-01-01', 5500.00, '销售'),
(73, 19, '2023-02-01', 5000.00, '销售'),
(74, 10, '2023-03-01', 5000.00, '销售'),
(75, 13, '2022-07-01', 7000.00, '店长'),
(76, 8, '2022-08-01', 6500.00, '副店长'),
(77, 7, '2023-04-01', 4500.00, '收银员'),
(78, 18, '2023-05-01', 5000.00, '销售'),
(79, 12, '2023-06-01', 4000.00, '收银员'),
(80, 5, '2022-09-01', 7500.00, '店长'),
(81, 14, '2023-07-01', 6500.00, '副店长'),
(82, 3, '2022-10-01', 6000.00, '店长'),
(83, 8, '2023-08-01', 5000.00, '销售'),
(84, 2, '2023-09-01', 4500.00, '收银员'),
(85, 16, '2023-10-01', 5000.00, '销售'),
(86, 9, '2022-11-01', 7000.00, '店长'),
(87, 13, '2023-11-01', 6500.00, '副店长'),
(88, 1, '2022-12-01', 6000.00, '店长'),
(89, 4, '2023-12-01', 5000.00, '销售'),
(90, 12, '2022-01-01', 8000.00, '店长'),
(91, 10, '2022-06-01', 7000.00, '副店长'),
(92, 16, '2023-01-01', 6000.00, '销售'),
(93, 15, '2023-02-01', 5500.00, '销售'),
(94, 2, '2023-03-01', 5000.00, '销售'),
(95, 5, '2022-07-01', 8000.00, '店长'),
(96, 20, '2022-08-01', 7500.00, '副店长'),
(97, 17, '2023-04-01', 4500.00, '收银员'),
(98, 18, '2023-05-01', 5000.00, '销售'),
(99, 14, '2023-06-01', 4000.00, '收银员');


-- 创建供应商
INSERT INTO suppliers (id, company_name, contact_name, phone, address) 
VALUES
(1, '渔具供应商1', '张三', '13900000001', '广州市天河区123号'),
(2, '渔具供应商2', '李四', '13900000002', '北京市朝阳区456号'),
(3, '渔具供应商3', '王五', '13900000003', '上海市徐汇区789号'),
(4, '渔具供应商4', '赵六', '13900000004', '深圳市南山区101号'),
(5, '渔具供应商5', '孙七', '13900000005', '杭州市西湖区202号'),
(6, '渔具供应商6', '周八', '13900000006', '成都市锦江区303号'),
(7, '渔具供应商7', '吴九', '13900000007', '南京市玄武区404号'),
(8, '渔具供应商8', '郑十', '13900000008', '武汉市江汉区505号'),
(9, '渔具供应商9', '钱十一', '13900000009', '长沙市岳麓区606号'),
(10, '渔具供应商10', '冯十二', '13900000010', '青岛市崂山区707号'),
(11, '渔具供应商11', '陈十三', '13900000011', '西安市未央区808号'),
(12, '渔具供应商12', '褚十四', '13900000012', '郑州市中原区909号'),
(13, '渔具供应商13', '卫十五', '13900000013', '重庆市渝北区100号'),
(14, '渔具供应商14', '蒋十六', '13900000014', '南昌市东湖区111号'),
(15, '渔具供应商15', '沈十七', '13900000015', '昆明市盘龙区222号'),
(16, '渔具供应商16', '韩十八', '13900000016', '贵阳市云岩区333号'),
(17, '渔具供应商17', '杨十九', '13900000017', '南宁市青秀区444号'),
(18, '渔具供应商18', '朱二十', '13900000018', '哈尔滨市道里区555号'),
(19, '渔具供应商19', '秦二十一', '13900000019', '长春市朝阳区666号'),
(20, '渔具供应商20', '尤二十二', '13900000020', '沈阳市和平区777号');



-- 创建商品
INSERT INTO products (id, name, description, price, category, image_url, stock, rating, sales) 
VALUES
(1, '专业钓鱼竿', '碳纤维材质，轻便耐用', 299.99, '鱼竿', '/images/rod1.jpg', 100, 4.8, 100),
(2, '高级渔线', '超强拉力不易断裂', 49.99, '渔线', '/images/line1.jpg', 200, 4.5, 150),
(3, '精致鱼钩', '日本进口，锋利持久', 19.99, '鱼钩', '/images/hook1.jpg', 500, 4.7, 50),
(4, '多功能鱼篓', '大容量，防水耐用', 159.99, '工具', '/images/basket1.jpg', 80, 4.6, 125),
(5, '专业钓椅', '便携折叠，承重150kg', 199.99, '工具', '/images/chair1.jpg', 60, 4.9, 100),
(6, '高级饵料', '进口配方，效果显著', 29.99, '饵料', '/images/bait1.jpg', 400, 4.4, 130),
(7, '防晒钓鱼帽', '透气防晒，舒适耐用', 89.99, '服饰', '/images/hat1.jpg', 150, 4.3, 150),
(8, '防水钓鱼服', '高品质防水面料', 399.99, '服饰', '/images/cloth1.jpg', 100, 4.7, 50),
(9, '钓鱼工具箱', '多层收纳，防水防潮', 129.99, '工具', '/images/box1.jpg', 120, 4.5, 100),
(10, '电子咬钩器', '灵敏度高，防水设计', 79.99, '工具', '/images/bite1.jpg', 200, 4.6, 135),
(11, '便携鱼竿包', '防水耐磨，轻便便携', 59.99, '工具', '/images/bag1.jpg', 140, 4.2, 115),
(12, '专业鱼线轮', '金属材质，操作流畅', 349.99, '工具', '/images/reel1.jpg', 90, 4.8, 100),
(13, '钓鱼太阳镜', '防紫外线，高清视野', 199.99, '服饰', '/images/sunglasses1.jpg', 75, 4.6, 90),
(14, '户外钓鱼鞋', '防滑防水，舒适透气', 299.99, '服饰', '/images/shoes1.jpg', 65, 4.7, 100),
(15, '夜光浮漂', '高亮度，灵敏度高', 39.99, '工具', '/images/floater1.jpg', 300, 4.5, 125),
(16, '多功能鱼竿支架', '高度可调，稳固耐用', 99.99, '工具', '/images/stand1.jpg', 110, 4.4, 105),
(17, '折叠钓鱼伞', '防晒防雨，便携耐用', 159.99, '工具', '/images/umbrella1.jpg', 100, 4.5, 50),
(18, '小型鱼探仪', '高精度探测，操作便捷', 899.99, '电子', '/images/fishfinder1.jpg', 30, 4.9, 45),
(19, '防水钓鱼背包', '多隔层设计，容量大', 199.99, '工具', '/images/backpack1.jpg', 120, 4.6, 105),
(20, '户外水壶', '保温保冷，轻便携带', 89.99, '工具', '/images/bottle1.jpg', 180, 4.3, 80),
(21, '夜光鱼钩', '高亮夜光，锋利耐用', 24.99, '鱼钩', '/images/glowhook1.jpg', 350, 4.6, 150),
(22, '智能咬钩报警器', '声音报警，操作简便', 99.99, '电子', '/images/alarm1.jpg', 90, 4.7, 135),
(23, '高灵敏度浮漂', '精准检测，灵敏度高', 49.99, '工具', '/images/float2.jpg', 250, 4.5, 115),
(24, '防蚊钓鱼服', '防蚊透气，舒适耐用', 349.99, '服饰', '/images/cloth2.jpg', 85, 4.4, 75),
(25, '户外多功能刀', '锋利便携，多功能用途', 129.99, '工具', '/images/knife1.jpg', 140, 4.8, 110),
(26, '大号钓鱼桶', '防水保温，坚固耐用', 99.99, '工具', '/images/bucket1.jpg', 95, 4.5, 80),
(27, '鱼饵保存盒', '密封防潮，携带方便', 39.99, '工具', '/images/baitbox1.jpg', 320, 4.4, 25),
(28, '轻量鱼竿', '碳纤维材质，便携耐用', 249.99, '鱼竿', '/images/rod2.jpg', 80, 4.7, 75),
(29, '竞技鱼线', '高强度，低延展性', 59.99, '渔线', '/images/line2.jpg', 180, 4.6, 30),
(30, '鱼竿保护套', '柔软耐磨，保护鱼竿', 29.99, '工具', '/images/case1.jpg', 210, 4.3, 90),
(31, '折叠鱼篓', '轻便易收纳，大容量', 79.99, '工具', '/images/basket2.jpg', 120, 4.4, 90),
(32, '户外钓鱼帽', '防风防晒，透气设计', 99.99, '服饰', '/images/hat2.jpg', 150, 4.3, 140),
(33, 'LED鱼漂灯', '节能高亮，夜钓必备', 19.99, '工具', '/images/led1.jpg', 400, 4.5, 60),
(34, '鱼饵干燥剂', '高效吸湿，保持饵料干燥', 9.99, '工具', '/images/dry1.jpg', 500, 4.3, 130),
(35, '防水手机套', '保护手机，便捷使用', 39.99, '工具', '/images/case2.jpg', 150, 4.4, 150),
(36, '鱼线切割器', '锋利耐用，安全便捷', 29.99, '工具', '/images/cutter1.jpg', 250, 4.6, 60),
(37, '钓鱼护目镜', '防眩光，高清视野', 179.99, '服饰', '/images/glasses1.jpg', 60, 4.5, 90),
(38, '钓鱼坐垫', '柔软舒适，轻便耐用', 89.99, '工具', '/images/cushion1.jpg', 100, 4.4, 90),
(39, '高级鱼饵', '营养丰富，吸引力强', 39.99, '饵料', '/images/bait2.jpg', 350, 4.5, 80),
(40, '水下摄像头', '高清画质，操作便捷', 1199.99, '电子', '/images/camera1.jpg', 20, 4.8, 85),
(41, '钓鱼头灯', '多档调节，防水设计', 59.99, '工具', '/images/headlight1.jpg', 140, 4.6, 60),
(42, '冰钓工具套装', '全套装备，一站式服务', 899.99, '工具', '/images/icekit1.jpg', 25, 4.9, 80),
(43, '防晒冰袖', '透气舒适，防晒效果佳', 19.99, '服饰', '/images/sleeve1.jpg', 180, 4.3, 40),
(44, '高级夜钓漂', '灵敏高亮，夜钓利器', 29.99, '工具', '/images/float3.jpg', 250, 4.5, 135),
(45, '钓鱼手套', '防滑耐磨，舒适贴合', 49.99, '服饰', '/images/glove1.jpg', 120, 4.4, 60),
(46, '海钓钓具套装', '专业配置，海钓必备', 1599.99, '工具', '/images/seakit1.jpg', 15, 4.9, 100),
(47, '便携折叠水桶', '轻便耐用，防水设计', 29.99, '工具', '/images/bucket2.jpg', 200, 4.3, 50),
(48, '鱼饵搅拌机', '高效均匀，便捷省力', 199.99, '工具', '/images/mixer1.jpg', 45, 4.6, 85),
(49, '户外折叠桌', '轻便实用，承重耐用', 129.99, '工具', '/images/table1.jpg', 75, 4.5, 70),
(50, '鱼钩磨刀器', '小巧便携，锋利持久', 49.99, '工具', '/images/sharpener1.jpg', 300, 4.6, 85);


-- 创建库存
INSERT INTO store_inventory (store_id, product_id, quantity) 
VALUES
(1, 1, 50), (1, 2, 100), (1, 3, 200), (1, 4, 30), (1, 5, 25),
(1, 6, 150), (1, 7, 50), (1, 8, 30), (1, 9, 40), (1, 10, 60),
(2, 11, 30), (2, 12, 60), (2, 13, 120), (2, 14, 20), (2, 15, 15),
(3, 16, 25), (3, 17, 50), (3, 18, 100), (3, 19, 15), (3, 20, 10),
(4, 21, 150), (4, 22, 120), (4, 23, 50), (4, 24, 30), (4, 25, 25),
(5, 26, 200), (5, 27, 30), (5, 28, 150), (5, 29, 80), (5, 30, 60),
(6, 31, 100), (6, 32, 200), (6, 33, 120), (6, 34, 50), (6, 35, 25),
(7, 36, 40), (7, 37, 60), (7, 38, 100), (7, 39, 30), (7, 40, 40),
(8, 41, 80), (8, 42, 120), (8, 43, 60), (8, 44, 50), (8, 45, 20),
(9, 46, 25), (9, 47, 75), (9, 48, 80), (9, 49, 30), (9, 50, 50),
(10, 1, 200), (10, 2, 150), (10, 3, 120), (10, 4, 40), (10, 5, 30),
(11, 6, 50), (11, 7, 60), (11, 8, 90), (11, 9, 40), (11, 10, 25),
(12, 11, 30), (12, 12, 100), (12, 13, 150), (12, 14, 60), (12, 15, 20),
(13, 16, 120), (13, 17, 80), (13, 18, 100), (13, 19, 40), (13, 20, 60),
(14, 21, 30), (14, 22, 50), (14, 23, 70), (14, 24, 30), (14, 25, 90),
(15, 26, 60), (15, 27, 40), (15, 28, 50), (15, 29, 10), (15, 30, 70),
(16, 31, 120), (16, 32, 100), (16, 33, 60), (16, 34, 50), (16, 35, 80),
(17, 36, 150), (17, 37, 100), (17, 38, 120), (17, 39, 30), (17, 40, 50),
(18, 41, 100), (18, 42, 200), (18, 43, 30), (18, 44, 60), (18, 45, 90),
(19, 46, 50), (19, 47, 120), (19, 48, 200), (19, 49, 40), (19, 50, 60),
(20, 1, 200), (20, 2, 80), (20, 3, 50), (20, 4, 100), (20, 5, 30),
(1, 11, 40), (1, 12, 25), (1, 13, 15), (1, 14, 10), (1, 15, 50),
(2, 16, 20), (2, 17, 15), (2, 18, 10), (2, 19, 5), (2, 20, 30),
(3, 21, 10), (3, 22, 10), (3, 23, 5), (3, 24, 3), (3, 25, 20),
(4, 26, 30), (4, 27, 25), (4, 28, 15), (4, 29, 10), (4, 30, 50),
(5, 31, 20), (5, 32, 30), (5, 33, 10), (5, 34, 5), (5, 35, 20);




-- 创建供应商产品关联
INSERT INTO supplier_products (supplier_id, product_id, supply_price) 
VALUES
(1, 12, 200.00), (1, 23, 150.00), (1, 5, 120.00), (1, 17, 90.00), (1, 8, 80.00),
(2, 30, 110.00), (2, 19, 95.00), (2, 11, 130.00), (2, 7, 60.00), (2, 25, 55.00),
(3, 14, 45.00), (3, 22, 75.00), (3, 6, 120.00), (3, 34, 65.00), (3, 9, 50.00),
(4, 16, 60.00), (4, 10, 85.00), (4, 18, 125.00), (4, 33, 40.00), (4, 2, 95.00),
(5, 41, 70.00), (5, 31, 105.00), (5, 37, 95.00), (5, 27, 90.00), (5, 13, 110.00),
(6, 28, 80.00), (6, 3, 100.00), (6, 43, 150.00), (6, 15, 140.00), (6, 50, 130.00),
(7, 45, 75.00), (7, 32, 110.00), (7, 44, 85.00), (7, 38, 105.00), (7, 48, 120.00),
(8, 29, 90.00), (8, 47, 75.00), (8, 21, 50.00), (8, 36, 60.00), (8, 39, 135.00),
(9, 46, 100.00), (9, 40, 80.00), (9, 24, 60.00), (9, 26, 90.00), (9, 16, 130.00),
(10, 8, 70.00), (10, 49, 120.00), (10, 32, 75.00), (10, 11, 105.00), (10, 13, 95.00),
(11, 12, 110.00), (11, 44, 125.00), (11, 14, 80.00), (11, 50, 70.00), (11, 18, 140.00),
(12, 2, 50.00), (12, 3, 135.00), (12, 17, 95.00), (12, 19, 110.00), (12, 23, 140.00),
(13, 21, 120.00), (13, 1, 100.00), (13, 36, 110.00), (13, 30, 85.00), (13, 25, 95.00),
(14, 24, 105.00), (14, 33, 95.00), (14, 8, 125.00), (14, 5, 80.00), (14, 37, 65.00),
(15, 10, 100.00), (15, 7, 85.00), (15, 38, 70.00), (15, 46, 50.00), (15, 16, 115.00),
(16, 29, 125.00), (16, 42, 85.00), (16, 5, 90.00), (16, 17, 50.00), (16, 20, 70.00),
(17, 13, 95.00), (17, 41, 75.00), (17, 22, 105.00), (17, 49, 120.00), (17, 14, 80.00),
(18, 3, 110.00), (18, 6, 95.00), (18, 31, 120.00), (18, 32, 125.00), (18, 9, 130.00),
(19, 43, 95.00), (19, 25, 90.00), (19, 28, 100.00), (19, 35, 80.00), (19, 39, 110.00),
(20, 8, 120.00), (20, 2, 110.00), (20, 50, 125.00), (20, 46, 75.00), (20, 44, 135.00);


-- 创建购物车项目
INSERT INTO cart_items (user_id, product_id, quantity) 
VALUES
(23, 37, 2),
(25, 8, 1),
(29, 19, 3),
(16, 3, 2),
(22, 14, 1),
(24, 5, 1),
(19, 12, 1),
(26, 2, 2),
(28, 6, 1),
(20, 11, 3),
(21, 17, 2),
(27, 10, 1),
(29, 18, 1),
(18, 29, 2),
(15, 20, 3),
(13, 9, 1),
(8, 50, 1),
(6, 21, 1),
(7, 16, 2),
(12, 33, 2),
(5, 40, 3),
(17, 13, 1),
(14, 22, 2),
(4, 48, 1),
(9, 35, 3),
(10, 1, 1),
(11, 25, 1),
(3, 42, 2),
(2, 27, 1),
(13, 47, 1),
(26, 39, 2),
(15, 4, 1),
(17, 34, 2),
(19, 7, 1),
(22, 23, 1),
(29, 24, 2),
(28, 38, 3),
(12, 30, 1),
(6, 49, 2),
(24, 32, 1),
(8, 28, 1),
(20, 46, 2),
(21, 12, 2);




-- 创建订单
INSERT INTO orders (order_no, user_id, store_id, total_amount, status, created_at) 
VALUES 
('ORD202301051', 5, 2, 500, 'completed', '2023-03-01 10:00:00'),
('ORD202301052', 6, 3, 350, 'completed', '2023-03-02 11:00:00'),
('ORD202301053', 7, 5, 460, 'completed', '2023-03-03 12:30:00'),
('ORD202301054', 8, 4, 600, 'completed', '2023-03-04 13:45:00'),
('ORD202301055', 9, 6, 400, 'completed', '2023-03-05 14:10:00'),
('ORD202301056', 10, 8, 480, 'pending', '2023-03-06 15:20:00'),
('ORD202301057', 11, 7, 460, 'completed', '2023-03-07 16:30:00'),
('ORD202301058', 12, 2, 300, 'pending', '2023-03-08 17:10:00'),
('ORD202301059', 13, 9, 460, 'completed', '2023-03-09 18:00:00'),
('ORD202301060', 14, 5, 500, 'completed', '2023-03-10 19:30:00'),
('ORD202301061', 15, 1, 370, 'completed', '2023-03-11 20:50:00'),
('ORD202301062', 16, 3, 210, 'completed', '2023-03-12 21:40:00'),
('ORD202301063', 17, 4, 150, 'completed', '2023-03-13 22:10:00'),
('ORD202301064', 18, 2, 300, 'completed', '2023-03-14 23:00:00'),
('ORD202301065', 19, 6, 460, 'completed', '2023-03-15 09:50:00'),
('ORD202301066', 20, 5, 380, 'completed', '2023-03-16 10:40:00'),
('ORD202301067', 21, 7, 150, 'pending', '2023-03-17 11:00:00'),
('ORD202301068', 22, 8, 600, 'completed', '2023-03-18 12:30:00'),
('ORD202301069', 23, 3, 330, 'completed', '2023-03-19 13:00:00'),
('ORD202301070', 24, 2, 400, 'completed', '2023-03-20 14:10:00'),
('ORD202301071', 25, 10, 390, 'completed', '2023-03-21 15:30:00'),
('ORD202301072', 26, 11, 540, 'pending', '2023-03-22 16:00:00'),
('ORD202301073', 27, 12, 270, 'completed', '2023-03-23 17:10:00'),
('ORD202301074', 28, 9, 380, 'completed', '2023-03-24 18:20:00'),
('ORD202301075', 29, 8, 470, 'completed', '2023-03-25 19:30:00'),
('ORD202301076', 30, 7, 360, 'pending', '2023-03-26 20:00:00'),
('ORD202301077', 31, 6, 430, 'completed', '2023-03-27 21:10:00'),
('ORD202301078', 32, 5, 320, 'completed', '2023-03-28 22:00:00'),
('ORD202301079', 33, 4, 560, 'completed', '2023-03-29 23:10:00'),
('ORD202301080', 34, 3, 350, 'completed', '2023-03-30 09:40:00');




-- 创建订单项目
INSERT INTO order_items (order_no, product_id, quantity, price)
VALUES
('ORD202301051', 1, 2, 200),  -- 商品1，单价100，数量2，总价200
('ORD202301051', 2, 3, 300),  -- 商品2，单价100，数量3，总价300
('ORD202301052', 3, 1, 100),  -- 商品3，单价100，数量1，总价100
('ORD202301052', 4, 5, 250),  -- 商品4，单价50，数量5，总价250
('ORD202301053', 5, 4, 200),  -- 商品5，单价50，数量4，总价200
('ORD202301053', 6, 2, 260),  -- 商品6，单价87，数量3，总价260
('ORD202301054', 7, 5, 300),  -- 商品7，单价60，数量5，总价300
('ORD202301054', 8, 2, 100),  -- 商品8，单价50，数量2，总价100
('ORD202301054', 9, 1, 200),  -- 商品9，单价200，数量1，总价200
('ORD202301055', 10, 3, 270), -- 商品10，单价90，数量3，总价270
('ORD202301055', 11, 2, 130), -- 商品11，单价65，数量2，总价130
('ORD202301056', 12, 4, 200), -- 商品12，单价50，数量4，总价200
('ORD202301056', 13, 2, 180), -- 商品13，单价90，数量2，总价180
('ORD202301056', 14, 1, 100), -- 商品14，单价100，数量1，总价100
('ORD202301057', 15, 5, 250), -- 商品15，单价50，数量5，总价250
('ORD202301057', 16, 2, 110), -- 商品16，单价55，数量2，总价110
('ORD202301057', 17, 1, 100), -- 商品17，单价100，数量1，总价100
('ORD202301058', 18, 3, 90),  -- 商品18，单价30，数量3，总价90
('ORD202301058', 19, 1, 210), -- 商品19，单价210，数量1，总价210
('ORD202301059', 20, 4, 160), -- 商品20，单价40，数量4，总价160
('ORD202301059', 21, 3, 300), -- 商品21，单价100，数量3，总价300
('ORD202301060', 22, 3, 270), -- 商品22，单价90，数量3，总价270
('ORD202301060', 23, 2, 230), -- 商品23，单价115，数量2，总价230
('ORD202301061', 24, 3, 150), -- 商品24，单价50，数量3，总价150
('ORD202301061', 25, 2, 220), -- 商品25��单价110，数量2，总价220
('ORD202301062', 26, 2, 160), -- 商品26，单价80，数量2，总价160
('ORD202301062', 27, 1, 50),  -- 商品27，单价50，数量1，总价50
('ORD202301063', 28, 2, 150), -- 商品28，单价75，数量2，总价150
('ORD202301064', 29, 3, 90),  -- 商品29，单价30，数量3，总价90
('ORD202301064', 30, 2, 210), -- 商品30，单价105，数量2，总价210
('ORD202301065', 31, 2, 180), -- 商品31，单价90，数量2，总价180
('ORD202301065', 32, 5, 280), -- 商品32，单价56，数量5，总价280
('ORD202301066', 33, 2, 120), -- 商品33，单价60，数量2，总价120
('ORD202301066', 34, 2, 260), -- 商品34，单价130，数量2，总价260
('ORD202301067', 35, 1, 150), -- 商品35，单价150，数量1，总价150
('ORD202301068', 36, 4, 240), -- 商品36，单价60，数量4，总价240
('ORD202301068', 37, 2, 180), -- 商品37，单价90，数量2，总价180
('ORD202301068', 38, 2, 180), -- 商品38，单价90，数量2，总价180
('ORD202301069', 39, 2, 160), -- 商品39，单价80，数量2，总价160
('ORD202301069', 40, 2, 170), -- 商品40，单价85，数量2，总价170
('ORD202301070', 41, 4, 240), -- 商品41，单价60，数量4，总价240
('ORD202301070', 42, 2, 160), -- 商品42，单价80，数量2，总价160
('ORD202301071', 43, 3, 120), -- 商品43，单价40，数量3，总价120
('ORD202301071', 44, 2, 270), -- 商品44，单价135，数量2，总价270
('ORD202301072', 45, 4, 240), -- 商品45，单价60，数量4，总价240
('ORD202301072', 46, 3, 300), -- 商品46，单价100，数量3，总价300
('ORD202301073', 47, 2, 100), -- 商品47，单价50，数量2，总价100
('ORD202301073', 48, 2, 170), -- 商品48，单价85，数量2，总价170
('ORD202301074', 49, 3, 210), -- 商品49，单价70，数量3，总价210
('ORD202301074', 50, 2, 170), -- 商品50，单价85，数量2，总价170
('ORD202301075', 1, 3, 300),  
('ORD202301075', 2, 2, 100),  
('ORD202301076', 3, 4, 400), 
('ORD202301076', 4, 2, 100),  
('ORD202301077', 5, 3, 150),  
('ORD202301077', 6, 2, 260),  
('ORD202301078', 7, 2, 120),  
('ORD202301078', 8, 4, 200),  
('ORD202301079', 9, 5, 1000), 
('ORD202301079', 10, 3, 270), 
('ORD202301079', 11, 2, 130), 
('ORD202301080', 12, 2, 100), 
('ORD202301080', 13, 2, 180); 



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
SELECT 
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
JOIN employees e ON u.id = e.id
JOIN stores s ON e.store_id = s.id
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