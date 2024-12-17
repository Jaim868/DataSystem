-- 删除已存在的表
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS stores;

-- 创建stores表
CREATE TABLE IF NOT EXISTS stores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    manager_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- 创建employees表
CREATE TABLE IF NOT EXISTS employees (
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

-- 插入测试数据
INSERT IGNORE INTO stores (id, name, address, phone) VALUES 
(1, '渔具总店', '北京市海淀区123号', '010-12345678'),
(2, '渔具分店1', '北京市朝阳区456号', '010-87654321'),
(3, '渔具分店2', '北京市西城区789号', '010-98765432');

-- 确保有一个管理员用户
INSERT IGNORE INTO users (id, username, password, role, created_at) VALUES 
(1, 'admin', '123456', 'manager', NOW());

-- 插入一些测试员工
INSERT IGNORE INTO users (id, username, password, role, created_at) VALUES 
(3, 'employee1', '123456', 'employee', NOW()),
(4, 'employee2', '123456', 'employee', NOW()),
(5, 'employee3', '123456', 'employee', NOW());

-- 关联员工到商店
INSERT IGNORE INTO employees (id, store_id, hire_date, salary, position) VALUES 
(3, 1, '2023-01-01', 5000.00, '销售'),
(4, 2, '2023-02-01', 5000.00, '销售'),
(5, 3, '2023-03-01', 5000.00, '销售'); 