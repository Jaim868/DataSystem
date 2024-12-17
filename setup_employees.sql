-- 创建employees表（如果不存在）
CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY,  -- 对应users表的id
    store_id INT NOT NULL,
    hire_date DATE NOT NULL,
    FOREIGN KEY (id) REFERENCES users(id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- 确保stores表存在
CREATE TABLE IF NOT EXISTS stores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入测试商店（如果不存在）
INSERT IGNORE INTO stores (id, name, address) VALUES 
(1, '渔具总店', '北京市海淀区123号');

-- 确保employee1用户存在并且是员工角色
INSERT IGNORE INTO users (id, username, password, role, created_at) VALUES 
(3, 'employee1', '123456', 'employee', NOW());

-- 将employee1关联到商店
INSERT IGNORE INTO employees (id, store_id, hire_date) VALUES 
(3, 1, CURRENT_DATE); 