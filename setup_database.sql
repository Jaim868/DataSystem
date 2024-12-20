
-- Set foreign key checks
SET FOREIGN_KEY_CHECKS=0;

-- Drop existing tables
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

-- Create user table
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

-- Create store table
CREATE TABLE stores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create employee table
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

-- Create supplier table
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

-- Create product table
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

-- Create store_inventory table
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

-- Create supplier_product_association table
CREATE TABLE supplier_products (
    supplier_id INT NOT NULL,
    product_id INT NOT NULL,
    supply_price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (supplier_id, product_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create shopping_cart table
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

-- Create order table
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

-- Create order items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(20) NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_no) REFERENCES orders(order_no),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create supply order table (orders from suppliers to stores)
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

-- Create supply order item table
CREATE TABLE supply_order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    supply_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_no) REFERENCES supply_orders(order_no),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

ALTER TABLE stores
ADD COLUMN is_deleted TINYINT(1) DEFAULT 0 NOT NULL COMMENT '逻辑删除标志',
ADD COLUMN deleted_at DATETIME NULL COMMENT '逻辑删除时间';


ALTER TABLE store_inventory
ADD COLUMN is_deleted TINYINT(1) DEFAULT 0 NOT NULL COMMENT '逻辑删除标志';

ALTER TABLE orders
ADD COLUMN is_deleted TINYINT(1) DEFAULT 0 NOT NULL COMMENT '逻辑删除标志';

ALTER TABLE employees
ADD COLUMN is_deleted TINYINT(1) DEFAULT 0 NOT NULL COMMENT '逻辑删除标志';

ALTER TABLE products
ADD COLUMN is_deleted TINYINT(1) DEFAULT 0 NOT NULL COMMENT '逻辑删除标志';

ALTER TABLE cart_items
ADD COLUMN is_deleted TINYINT(1) DEFAULT 0 NOT NULL COMMENT '逻辑删除标志';


-- Insert test data  
-- Create user
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


-- Create Stores
INSERT INTO stores (id, name, address, phone) 
VALUES
(1, 'Fishing Gear Branch 1', 'No. 1, Chaoyang District, Beijing', '010-12345678'),
(2, 'Fishing Gear Branch 2', 'No. 2, Heping District, Tianjin', '022-23456789'),
(3, 'Fishing Gear Branch 3', 'No. 123, Pudong New District, Shanghai', '021-12345678'),
(4, 'Fishing Gear Branch 4', 'No. 456, Yuexiu District, Guangzhou', '020-87654321'),
(5, 'Fishing Gear Branch 5', 'No. 789, Nanshan District, Shenzhen', '0755-56789012'),
(6, 'Fishing Gear Branch 6', 'No. 10, Xihu District, Hangzhou', '0571-34567890'),
(7, 'Fishing Gear Branch 7', 'No. 11, Jinjiang District, Chengdu', '028-12389012'),
(8, 'Fishing Gear Branch 8', 'No. 12, Xuanwu District, Nanjing', '025-34567812'),
(9, 'Fishing Gear Branch 9', 'No. 13, Suzhou Industrial Park, Suzhou', '0512-12345689'),
(10, 'Fishing Gear Branch 10', 'No. 14, Jianghan District, Wuhan', '027-56789013'),
(11, 'Fishing Gear Branch 11', 'No. 15, Weiyang District, Xi\'an', '029-23456780'),
(12, 'Fishing Gear Branch 12', 'No. 16, Yuelu District, Changsha', '0731-67890123'),
(13, 'Fishing Gear Branch 13', 'No. 17, Yubei District, Chongqing', '023-98765432'),
(14, 'Fishing Gear Branch 14', 'No. 18, Zhongyuan District, Zhengzhou', '0371-12389045'),
(15, 'Fishing Gear Branch 15', 'No. 19, Laoshan District, Qingdao', '0532-23456781'),
(16, 'Fishing Gear Branch 16', 'No. 20, Gulou District, Fuzhou', '0591-67890134'),
(17, 'Fishing Gear Branch 17', 'No. 21, Siming District, Xiamen', '0592-34567891'),
(18, 'Fishing Gear Branch 18', 'No. 22, Luyang District, Hefei', '0551-56789014'),
(19, 'Fishing Gear Branch 19', 'No. 23, Donghu District, Nanchang', '0791-67890145'),
(20, 'Fishing Gear Branch 20', 'No. 24, Panlong District, Kunming', '0871-12345690');



-- Create employees
INSERT INTO employees (id, store_id, hire_date, salary, position) 
VALUES
(50, 1, '2022-01-01', 6000.00, 'Store Manager'),
(51, 4, '2022-06-01', 5500.00, 'Deputy Store Manager'),
(52, 2, '2023-01-01', 5000.00, 'Sales'),
(53, 19, '2023-02-01', 5000.00, 'Sales'),
(54, 12, '2023-03-01', 5000.00, 'Sales'),
(55, 15, '2022-07-01', 6000.00, 'Store Manager'),
(56, 10, '2023-04-01', 5500.00, 'Deputy Store Manager'),
(57, 8, '2023-04-01', 4500.00, 'Cashier'),
(58, 7, '2023-05-01', 5000.00, 'Sales'),
(59, 6, '2023-06-01', 4000.00, 'Cashier'),
(60, 14, '2022-09-01', 6500.00, 'Store Manager'),
(61, 1, '2023-07-01', 5500.00, 'Deputy Store Manager'),
(62, 9, '2022-10-01', 6000.00, 'Store Manager'),
(63, 16, '2023-08-01', 5000.00, 'Sales'),
(64, 5, '2023-09-01', 4500.00, 'Cashier'),
(65, 11, '2023-10-01', 5000.00, 'Sales'),
(66, 3, '2022-11-01', 6000.00, 'Store Manager'),
(67, 18, '2023-11-01', 5500.00, 'Deputy Store Manager'),
(68, 4, '2022-12-01', 6000.00, 'Store Manager'),
(69, 13, '2023-12-01', 5000.00, 'Sales'),
(70, 2, '2022-01-01', 7000.00, 'Store Manager'),
(71, 6, '2022-06-01', 6000.00, 'Deputy Store Manager'),
(72, 3, '2023-01-01', 5500.00, 'Sales'),
(73, 19, '2023-02-01', 5000.00, 'Sales'),
(74, 10, '2023-03-01', 5000.00, 'Sales'),
(75, 13, '2022-07-01', 7000.00, 'Store Manager'),
(76, 8, '2022-08-01', 6500.00, 'Deputy Store Manager'),
(77, 7, '2023-04-01', 4500.00, 'Cashier'),
(78, 18, '2023-05-01', 5000.00, 'Sales'),
(79, 12, '2023-06-01', 4000.00, 'Cashier'),
(80, 5, '2022-09-01', 7500.00, 'Store Manager'),
(81, 14, '2023-07-01', 6500.00, 'Deputy Store Manager'),
(82, 3, '2022-10-01', 6000.00, 'Store Manager'),
(83, 8, '2023-08-01', 5000.00, 'Sales'),
(84, 2, '2023-09-01', 4500.00, 'Cashier'),
(85, 16, '2023-10-01', 5000.00, 'Sales'),
(86, 9, '2022-11-01', 7000.00, 'Store Manager'),
(87, 13, '2023-11-01', 6500.00, 'Deputy Store Manager'),
(88, 1, '2022-12-01', 6000.00, 'Store Manager'),
(89, 4, '2023-12-01', 5000.00, 'Sales'),
(90, 12, '2022-01-01', 8000.00, 'Store Manager'),
(91, 10, '2022-06-01', 7000.00, 'Deputy Store Manager'),
(92, 16, '2023-01-01', 6000.00, 'Sales'),
(93, 15, '2023-02-01', 5500.00, 'Sales'),
(94, 2, '2023-03-01', 5000.00, 'Sales'),
(95, 5, '2022-07-01', 8000.00, 'Store Manager'),
(96, 20, '2022-08-01', 7500.00, 'Deputy Store Manager'),
(97, 17, '2023-04-01', 4500.00, 'Cashier'),
(98, 18, '2023-05-01', 5000.00, 'Sales'),
(99, 14, '2023-06-01', 4000.00, 'Cashier');

-- Create suppliers
INSERT INTO suppliers (id, company_name, contact_name, phone, address) 
VALUES
(1, 'Fishing Supplier 1', 'Zhang San', '13900000001', 'No. 123, Tianhe District, Guangzhou'),
(2, 'Fishing Supplier 2', 'Li Si', '13900000002', 'No. 456, Chaoyang District, Beijing'),
(3, 'Fishing Supplier 3', 'Wang Wu', '13900000003', 'No. 789, Xuhui District, Shanghai'),
(4, 'Fishing Supplier 4', 'Zhao Liu', '13900000004', 'No. 101, Nanshan District, Shenzhen'),
(5, 'Fishing Supplier 5', 'Sun Qi', '13900000005', 'No. 202, Xihu District, Hangzhou'),
(6, 'Fishing Supplier 6', 'Zhou Ba', '13900000006', 'No. 303, Jinjiang District, Chengdu'),
(7, 'Fishing Supplier 7', 'Wu Jiu', '13900000007', 'No. 404, Xuanwu District, Nanjing'),
(8, 'Fishing Supplier 8', 'Zheng Shi', '13900000008', 'No. 505, Jianghan District, Wuhan'),
(9, 'Fishing Supplier 9', 'Qian Shi Yi', '13900000009', 'No. 606, Yuelu District, Changsha'),
(10, 'Fishing Supplier 10', 'Feng Shi Er', '13900000010', 'No. 707, Laoshan District, Qingdao'),
(11, 'Fishing Supplier 11', 'Chen Shi San', '13900000011', 'No. 808, Weiyang District, Xi\'an'),
(12, 'Fishing Supplier 12', 'Chu Shi Si', '13900000012', 'No. 909, Zhongyuan District, Zhengzhou'),
(13, 'Fishing Supplier 13', 'Wei Shi Wu', '13900000013', 'No. 100, Yubei District, Chongqing'),
(14, 'Fishing Supplier 14', 'Jiang Shi Liu', '13900000014', 'No. 111, Donghu District, Nanchang'),
(15, 'Fishing Supplier 15', 'Shen Shi Qi', '13900000015', 'No. 222, Panlong District, Kunming'),
(16, 'Fishing Supplier 16', 'Han Shi Ba', '13900000016', 'No. 333, Yunyan District, Guiyang'),
(17, 'Fishing Supplier 17', 'Yang Shi Jiu', '13900000017', 'No. 444, Qingxiu District, Nanning'),
(18, 'Fishing Supplier 18', 'Zhu Er Shi', '13900000018', 'No. 555, Daoli District, Harbin'),
(19, 'Fishing Supplier 19', 'Qin Er Shi Yi', '13900000019', 'No. 666, Chaoyang District, Changchun'),
(20, 'Fishing Supplier 20', 'You Er Shi Er', '13900000020', 'No. 777, Heping District, Shenyang'),
(30, 'Fishing Supplier 1', 'Zhang San', '13900000001', '123 Tianhe District, Guangzhou'),
(31, 'Fishing Supplier 2', 'Li Si', '13900000002', '456 Chaoyang District, Beijing'),
(32, 'Fishing Supplier 3', 'Wang Wu', '13900000003', '789 Xuhui District, Shanghai'),
(33, 'Fishing Supplier 4', 'Zhao Liu', '13900000004', '101 Nanshan District, Shenzhen'),
(34, 'Fishing Supplier 5', 'Sun Qi', '13900000005', '202 Xihu District, Hangzhou');



-- Create products
INSERT INTO products (id, name, description, price, category, image_url, stock, rating, sales) 
VALUES
(1, 'Professional Fishing Rod', 'Made of carbon fiber, lightweight and durable', 299.99, 'Rod', '/images/rod1.jpg', 100, 4.8, 100),
(2, 'Premium Fishing Line', 'Super strong, not easy to break', 49.99, 'Line', '/images/line1.jpg', 200, 4.5, 150),
(3, 'Exquisite Fish Hook', 'Imported from Japan, sharp and durable', 19.99, 'Hook', '/images/hook1.jpg', 500, 4.7, 50),
(4, 'Multi-functional Fish Basket', 'Large capacity, waterproof and durable', 159.99, 'Tool', '/images/bascket1.jpg', 80, 4.6, 125),
(5, 'Professional Fishing Chair', 'Portable folding, weight capacity 150kg', 199.99, 'Tool', '/images/chair.jpg', 60, 4.9, 100),
(6, 'Premium Bait', 'Imported formula, effective', 29.99, 'Bait', '/images/bait1.jpg', 400, 4.4, 130),
(7, 'Sun Protection Fishing Hat', 'Breathable, sun protection, comfortable and durable', 89.99, 'Clothing', '/images/hat1.jpg', 150, 4.3, 150),
(8, 'Waterproof Fishing Suit', 'High-quality waterproof fabric', 399.99, 'Clothing', '/images/cloth1.jpg', 100, 4.7, 50),
(9, 'Fishing Tackle Box', 'Multi-layer storage, waterproof and moisture-proof', 129.99, 'Tool', '/images/box1.jpg', 120, 4.5, 100),
(10, 'Electronic Bite Alarm', 'High sensitivity, waterproof design', 79.99, 'Tool', '/images/bite1.jpg', 200, 4.6, 135),
(11, 'Portable Fishing Rod Bag', 'Waterproof, wear-resistant, lightweight and portable', 59.99, 'Tool', '/images/rod1.jpg', 140, 4.2, 115),
(12, 'Professional Fishing Reel', 'Metal material, smooth operation', 349.99, 'Tool', '/images/line1.jpg', 90, 4.8, 100),
(13, 'Fishing Sunglasses', 'UV protection, high-definition vision', 199.99, 'Clothing', '/images/hat1.jpg', 75, 4.6, 90),
(14, 'Outdoor Fishing Shoes', 'Anti-slip, waterproof, comfortable and breathable', 299.99, 'Clothing', '/images/cloth1.jpg', 65, 4.7, 100),
(15, 'Luminous Float', 'High brightness, high sensitivity', 39.99, 'Tool', '/images/bascket1.jpg', 300, 4.5, 125),
(16, 'Multi-functional Fishing Rod Holder', 'Adjustable height, stable and durable', 99.99, 'Tool', '/images/chair.jpg', 110, 4.4, 105),
(17, 'Folding Fishing Umbrella', 'Sun and rain protection, portable and durable', 159.99, 'Tool', '/images/chair.jpg', 100, 4.5, 50),
(18, 'Small Fish Finder', 'High-precision detection, easy to operate', 899.99, 'Electronics', '/images/bite1.jpg', 30, 4.9, 45),
(19, 'Waterproof Fishing Backpack', 'Multi-compartment design, large capacity', 199.99, 'Tool', '/images/box1.jpg', 120, 4.6, 105),
(20, 'Outdoor Water Bottle', 'Insulated, lightweight and portable', 89.99, 'Tool', '/images/bascket1.jpg', 180, 4.3, 80),
(21, 'Luminous Fish Hook', 'High brightness, sharp and durable', 24.99, 'Hook', '/images/hook1.jpg', 350, 4.6, 150),
(22, 'Smart Bite Alarm', 'Sound alarm, easy to operate', 99.99, 'Electronics', '/images/bite1.jpg', 90, 4.7, 135),
(23, 'High Sensitivity Float', 'Accurate detection, high sensitivity', 49.99, 'Tool', '/images/bascket1.jpg', 250, 4.5, 115),
(24, 'Mosquito-proof Fishing Suit', 'Mosquito-proof, breathable, comfortable and durable', 349.99, 'Clothing', '/images/cloth1.jpg', 85, 4.4, 75),
(25, 'Outdoor Multi-functional Knife', 'Sharp, portable, multi-purpose', 129.99, 'Tool', '/images/chair.jpg', 140, 4.8, 110),
(26, 'Large Fishing Bucket', 'Waterproof, insulated, durable', 99.99, 'Tool', '/images/chair.jpg', 95, 4.5, 80),
(27, 'Bait Storage Box', 'Sealed and moisture-proof, easy to carry', 39.99, 'Tool', '/images/bait1.jpg', 320, 4.4, 25),
(28, 'Lightweight Fishing Rod', 'Made of carbon fiber, portable and durable', 249.99, 'Rod', '/images/rod1.jpg', 80, 4.7, 75),
(29, 'Competitive Fishing Line', 'High strength, low elongation', 59.99, 'Line', '/images/line1.jpg', 180, 4.6, 30),
(30, 'Fishing Rod Protection Cover', 'Soft, wear-resistant, protects the rod', 29.99, 'Tool', '/images/box1.jpg', 210, 4.3, 90),
(31, 'Folding Fish Basket', 'Portable, easy to store, large capacity', 79.99, 'Tool', '/images/bascket1.jpg', 120, 4.4, 90),
(32, 'Outdoor Fishing Hat', 'Windproof, sun protection, breathable design', 99.99, 'Clothing', '/images/hat1.jpg', 150, 4.3, 140),
(33, 'LED Fishing Float Light', 'Energy-saving, high brightness, essential for night fishing', 19.99, 'Tool', '/images/bascket1.jpg', 400, 4.5, 60),
(34, 'Bait Dehydrator', 'Highly effective moisture absorption, keeps bait dry', 9.99, 'Tool', '/images/bait1.jpg', 500, 4.3, 130),
(35, 'Waterproof Phone Case', 'Protects phone, easy to use', 39.99, 'Tool', '/images/bascket1.jpg', 150, 4.4, 150),
(36, 'Fishing Line Cutter', 'Sharp, durable, safe and easy to use', 29.99, 'Tool', '/images/chair.jpg', 250, 4.6, 60),
(37, 'Fishing Goggles', 'Anti-glare, high-definition vision', 179.99, 'Clothing', '/images/hat1.jpg', 60, 4.5, 90),
(38, 'Fishing Seat Cushion', 'Soft, comfortable, lightweight and durable', 89.99, 'Tool', '/images/chair.jpg', 100, 4.4, 90),
(39, 'Premium Bait', 'Nutritious, highly attractive', 39.99, 'Bait', '/images/bait1.jpg', 350, 4.5, 80),
(40, 'Underwater Camera', 'High-definition image, easy to operate', 1199.99, 'Electronics', '/images/bite1.jpg', 20, 4.8, 85),
(41, 'Fishing Headlamp', 'Multi-level adjustable, waterproof design', 59.99, 'Tool', '/images/bascket1.jpg', 140, 4.6, 60),
(42, 'Ice Fishing Tool Set', 'Complete set of equipment, one-stop service', 899.99, 'Tool', '/images/chair.jpg', 25, 4.9, 80),
(43, 'Sun Protection Ice Sleeves', 'Breathable, comfortable, excellent sun protection', 19.99, 'Clothing', '/images/hat1.jpg', 180, 4.3, 40),
(44, 'High Sensitivity Night Fishing Float', 'Sensitive and bright, essential for night fishing', 29.99, 'Tool', '/images/bascket1.jpg', 250, 4.5, 135),
(45, 'Fishing Gloves', 'Non-slip, durable, comfortable fit', 49.99, 'Clothing', '/images/hat1.jpg', 120, 4.4, 60),
(46, 'Sea Fishing Tackle Set', 'Professional configuration, must-have for sea fishing', 1599.99, 'Tool', '/images/bite1.jpg', 30, 4.8, 50),
(47, 'Fishing Spear', 'Durable, lightweight, and precise', 129.99, 'Tool', '/images/rod1.jpg', 40, 4.7, 85),
(48, 'Fishing Net', 'Lightweight, portable and durable', 49.99, 'Tool', '/images/chair.jpg', 400, 4.6, 120),
(49, 'Fishing Thermos', 'Keeps warm, large capacity', 79.99, 'Tool', '/images/bascket1.jpg', 160, 4.5, 70),
(50, 'Fishing Knife', 'Sharp and durable, multipurpose', 29.99, 'Tool', '/images/box1.jpg', 180, 4.6, 95);

-- Create inventory
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




-- Create supplier-product association
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
(20, 8, 120.00), (20, 2, 110.00), (20, 50, 125.00), (20, 46, 75.00), (20, 44, 135.00),
(30, 1, 100.00), (30, 2, 80.00), (30, 3, 75.00), (30, 4, 90.00), (31, 5, 120.00),
(31, 6, 95.00), (31, 7, 72.00), (31, 8, 85.00), (32, 9, 65.00), (32, 10, 78.00),
(32, 11, 88.00), (32, 12, 92.00), (33, 13, 110.00), (33, 14, 82.00), (33, 15, 95.00),
(33, 16, 105.00), (34, 17, 89.00), (34, 18, 76.00), (34, 19, 98.00), (34, 20, 115.00);


-- Create shopping cart item
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




-- Create order
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




-- Create order items
INSERT INTO order_items (order_no, product_id, quantity, price)
VALUES
('ORD202301051', 1, 2, 200),  -- Product 1, unit price 100, quantity 2, total price 200
('ORD202301051', 2, 3, 300),  -- Product 2, unit price 100, quantity 3, total price 300
('ORD202301052', 3, 1, 100),  -- Product 3, unit price 100, quantity 1, total price 100
('ORD202301052', 4, 5, 250),  -- Product 4, unit price 50, quantity 5, total price 250
('ORD202301053', 5, 4, 200),  -- Product 5, unit price 50, quantity 4, total price 200
('ORD202301053', 6, 2, 260),  -- Product 6, unit price 87, quantity 3, total price 260
('ORD202301054', 7, 5, 300),  -- Product 7, unit price 60, quantity 5, total price 300
('ORD202301054', 8, 2, 100),  -- Product 8, unit price 50, quantity 2, total price 100
('ORD202301054', 9, 1, 200),  -- Product 9, unit price 200, quantity 1, total price 200
('ORD202301055', 10, 3, 270), -- Product 10, unit price 90, quantity 3, total price 270
('ORD202301055', 11, 2, 130), -- Product 11, unit price 65, quantity 2, total price 130
('ORD202301056', 12, 4, 200), -- Product 12, unit price 50, quantity 4, total price 200
('ORD202301056', 13, 2, 180), -- Product 13, unit price 90, quantity 2, total price 180
('ORD202301056', 14, 1, 100), -- Product 14, unit price 100, quantity 1, total price 100
('ORD202301057', 15, 5, 250), -- Product 15, unit price 50, quantity 5, total price 250
('ORD202301057', 16, 2, 110), -- Product 16, unit price 55, quantity 2, total price 110
('ORD202301057', 17, 1, 100), -- Product 17, unit price 100, quantity 1, total price 100
('ORD202301058', 18, 3, 90),  -- Product 18, unit price 30, quantity 3, total price 90
('ORD202301058', 19, 1, 210), -- Product 19, unit price 210, quantity 1, total price 210
('ORD202301059', 20, 4, 160), -- Product 20, unit price 40, quantity 4, total price 160
('ORD202301059', 21, 3, 300), -- Product 21, unit price 100, quantity 3, total price 300
('ORD202301060', 22, 3, 270), -- Product 22, unit price 90, quantity 3, total price 270
('ORD202301060', 23, 2, 230), -- Product 23, unit price 115, quantity 2, total price 230
('ORD202301061', 24, 3, 150), -- Product 24, unit price 50, quantity 3, total price 150
('ORD202301061', 25, 2, 220), -- Product 25, unit price 110, quantity 2, total price 220
('ORD202301062', 26, 2, 160), -- Product 26, unit price 80, quantity 2, total price 160
('ORD202301062', 27, 1, 50),  -- Product 27, unit price 50, quantity 1, total price 50
('ORD202301063', 28, 2, 150), -- Product 28, unit price 75, quantity 2, total price 150
('ORD202301064', 29, 3, 90),  -- Product 29, unit price 30, quantity 3, total price 90
('ORD202301064', 30, 2, 210), -- Product 30, unit price 105, quantity 2, total price 210
('ORD202301065', 31, 2, 180), -- Product 31, unit price 90, quantity 2, total price 180
('ORD202301065', 32, 5, 280), -- Product 32, unit price 56, quantity 5, total price 280
('ORD202301066', 33, 2, 120), -- Product 33, unit price 60, quantity 2, total price 120
('ORD202301066', 34, 2, 260), -- Product 34, unit price 130, quantity 2, total price 260
('ORD202301067', 35, 1, 150), -- Product 35, unit price 150, quantity 1, total price 150
('ORD202301068', 36, 4, 240), -- Product 36, unit price 60, quantity 4, total price 240
('ORD202301068', 37, 2, 180), -- Product 37, unit price 90, quantity 2, total price 180
('ORD202301068', 38, 2, 180), -- Product 38, unit price 90, quantity 2, total price 180
('ORD202301069', 39, 2, 160), -- Product 39, unit price 80, quantity 2, total price 160
('ORD202301069', 40, 2, 170), -- Product 40, unit price 85, quantity 2, total price 170
('ORD202301070', 41, 4, 240), -- Product 41, unit price 60, quantity 4, total price 240
('ORD202301070', 42, 2, 160), -- Product 42, unit price 80, quantity 2, total price 160
('ORD202301071', 43, 3, 120), -- Product 43, unit price 40, quantity 3, total price 120
('ORD202301071', 44, 2, 270), -- Product 44, unit price 135, quantity 2, total price 270
('ORD202301072', 45, 4, 240), -- Product 45, unit price 60, quantity 4, total price 240
('ORD202301072', 46, 3, 300), -- Product 46, unit price 100, quantity 3, total price 300
('ORD202301073', 47, 2, 100), -- Product 47, unit price 50, quantity 2, total price 100
('ORD202301073', 48, 2, 170), -- Product 48, unit price 85, quantity 2, total price 170
('ORD202301074', 49, 3, 210), -- Product 49, unit price 70, quantity 3, total price 210
('ORD202301074', 50, 2, 170), -- Product 50, unit price 85, quantity 2, total price 170
('ORD202301075', 1, 3, 300),  -- Product 1, unit price 100, quantity 3, total price 300
('ORD202301075', 2, 2, 100),  -- Product 2, unit price 50, quantity 2, total price 100
('ORD202301076', 3, 4, 400),  -- Product 3, unit price 100, quantity 4, total price 400
('ORD202301076', 4, 2, 100),  -- Product 4, unit price 50, quantity 2, total price 100
('ORD202301077', 5, 3, 150),  -- Product 5, unit price 50, quantity 3, total price 150
('ORD202301077', 6, 2, 260),  -- Product 6, unit price 130, quantity 2, total price 260
('ORD202301078', 7, 2, 120),  -- Product 7, unit price 60, quantity 2, total price 120
('ORD202301078', 8, 4, 200),  -- Product 8, unit price 50, quantity 4, total price 200
('ORD202301079', 9, 5, 1000), -- Product 9, unit price 200, quantity 5, total price 1000
('ORD202301079', 10, 3, 270), -- Product 10, unit price 90, quantity 3, total price 270
('ORD202301079', 11, 2, 130), -- Product 11, unit price 65, quantity 2, total price 130
('ORD202301080', 12, 2, 100), -- Product 12, unit price 50, quantity 2, total price 100
('ORD202301080', 13, 2, 180); -- Product 13, unit price 90, quantity 2, total price 180



-- Create comprehensive order view
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

-- Create administrator dashboard statistics view
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

-- Create daily order statistics view
CREATE OR REPLACE VIEW daily_order_stats_view AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as order_count,
    SUM(total_amount) as daily_sales
FROM orders
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(created_at);

-- CREATE OR REPLACE VIEW user_auth_view
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
    SELECT * FROM products WHERE is_deleted = 0 -- 排除逻辑删除的产品
) p
LEFT JOIN cart_items ci ON p.id = ci.product_id AND ci.is_deleted = 0; -- 排除逻辑删除的购物车项


-- CREATE OR REPLACE VIEW employee_comprehensive_view
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

-- CREATE OR REPLACE VIEW product_comprehensive_view
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

-- CREATE OR REPLACE VIEW product_management_view
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
    LEFT JOIN employees e ON s.id = e.store_id AND e.is_deleted = 0 -- 排除逻辑删除的员工
    LEFT JOIN orders o ON s.id = o.store_id AND o.is_deleted = 0 -- 排除逻辑删除的订单
    LEFT JOIN store_inventory si ON s.id = si.store_id AND si.is_deleted = 0 -- 排除逻辑删除的库存
    WHERE s.is_deleted = 0 -- 排除逻辑删除的商店
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
LEFT JOIN employees e ON s.id = e.store_id AND e.is_deleted = 0 -- 排除逻辑删除的员工
LEFT JOIN store_inventory si ON s.id = si.store_id AND si.is_deleted = 0 -- 排除逻辑删除的库存
LEFT JOIN products p ON si.product_id = p.id
WHERE s.is_deleted = 0 -- 排除逻辑删除的商店
GROUP BY 
    s.id, s.name, s.address, s.phone, s.created_at, s.updated_at,
    ss.employee_count, ss.order_count, ss.total_sales, ss.product_count, ss.total_inventory;




-- CREATE OR REPLACE VIEW supplier_comprehensive_view
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

-- SET FOREIGN_KEY_CHECKS
SET FOREIGN_KEY_CHECKS=1;

-- INSERT INTO supply_orders
INSERT INTO supply_orders (order_no, supplier_id, store_id, total_amount, status, created_at) 
VALUES
('SUPPLY2023120101_30', 30, 1, 2000.00, 'completed', '2023-12-01 10:00:00'),
('SUPPLY2023120102_30', 30, 2, 1500.00, 'shipping', '2023-12-01 11:00:00'),
('SUPPLY2023120103_30', 30, 3, 3000.00, 'pending', '2023-12-01 12:00:00'),
('SUPPLY2023120104_31', 31, 4, 2500.00, 'completed', '2023-12-01 13:00:00'),
('SUPPLY2023120105_31', 31, 5, 1800.00, 'shipping', '2023-12-01 14:00:00'),
('SUPPLY2023120106_31', 31, 6, 2200.00, 'pending', '2023-12-01 15:00:00'),
('SUPPLY2023120107_32', 32, 7, 3500.00, 'completed', '2023-12-01 16:00:00'),
('SUPPLY2023120108_32', 32, 8, 2800.00, 'shipping', '2023-12-01 17:00:00'),
('SUPPLY2023120109_32', 32, 9, 1900.00, 'pending', '2023-12-01 18:00:00'),
('SUPPLY2023120110_33', 33, 10, 4000.00, 'completed', '2023-12-01 19:00:00'),
('SUPPLY2023120111_33', 33, 11, 3200.00, 'shipping', '2023-12-01 20:00:00'),
('SUPPLY2023120112_33', 33, 12, 2700.00, 'pending', '2023-12-01 21:00:00'),
('SUPPLY2023120113_34', 34, 13, 3800.00, 'completed', '2023-12-02 10:00:00'),
('SUPPLY2023120114_34', 34, 14, 2900.00, 'shipping', '2023-12-02 11:00:00'),
('SUPPLY2023120115_34', 34, 15, 2100.00, 'pending', '2023-12-02 12:00:00');

-- INSERT INTO supply_order_items
INSERT INTO supply_order_items (order_no, product_id, quantity, supply_price)
VALUES
('SUPPLY2023120101_30', 1, 10, 100.00),
('SUPPLY2023120101_30', 2, 15, 80.00),
('SUPPLY2023120102_30', 3, 20, 75.00),
('SUPPLY2023120103_30', 4, 12, 90.00),
('SUPPLY2023120104_31', 5, 8, 120.00),
('SUPPLY2023120104_31', 6, 15, 95.00),
('SUPPLY2023120105_31', 7, 25, 72.00),
('SUPPLY2023120106_31', 8, 18, 85.00),
('SUPPLY2023120107_32', 9, 30, 65.00),
('SUPPLY2023120107_32', 10, 22, 78.00),
('SUPPLY2023120108_32', 11, 16, 88.00),
('SUPPLY2023120109_32', 12, 14, 92.00),
('SUPPLY2023120110_33', 13, 20, 110.00),
('SUPPLY2023120110_33', 14, 25, 82.00),
('SUPPLY2023120111_33', 15, 18, 95.00),
('SUPPLY2023120112_33', 16, 15, 105.00),
('SUPPLY2023120113_34', 17, 22, 89.00),
('SUPPLY2023120113_34', 18, 28, 76.00),
('SUPPLY2023120114_34', 19, 16, 98.00),
('SUPPLY2023120115_34', 20, 12, 115.00);