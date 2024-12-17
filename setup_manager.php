<?php
require_once __DIR__ . '/api/config/database.php';
require_once __DIR__ . '/api/utils/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // 禁用外键检查
    $db->exec('SET FOREIGN_KEY_CHECKS=0');
    
    // 删除表
    $db->exec('DROP TABLE IF EXISTS employees');
    $db->exec('DROP TABLE IF EXISTS stores');
    $db->exec('DROP TABLE IF EXISTS store_inventory');
    
    // 创建stores表
    $db->exec('CREATE TABLE stores (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        address VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        manager_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (manager_id) REFERENCES users(id)
    )');
    
    // 创建employees表
    $db->exec('CREATE TABLE employees (
        id INT PRIMARY KEY,
        store_id INT NOT NULL,
        hire_date DATE NOT NULL,
        salary DECIMAL(10,2) DEFAULT 0.00,
        position VARCHAR(50) DEFAULT "销售",
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (id) REFERENCES users(id),
        FOREIGN KEY (store_id) REFERENCES stores(id)
    )');
    
    // 创建store_inventory表
    $db->exec('CREATE TABLE store_inventory (
        id INT PRIMARY KEY AUTO_INCREMENT,
        store_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (store_id) REFERENCES stores(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    )');
    
    // 插入测试数据
    $db->exec("INSERT INTO stores (id, name, address, phone) VALUES 
        (1, '渔具总店', '北京市海淀区123号', '010-12345678'),
        (2, '渔具分店1', '北京市朝阳区456号', '010-87654321'),
        (3, '渔具分店2', '北京市西城区789号', '010-98765432')");
    
    $db->exec("INSERT IGNORE INTO users (id, username, password, role, created_at) VALUES 
        (1, 'admin', '123456', 'manager', NOW()),
        (3, 'employee1', '123456', 'employee', NOW()),
        (4, 'employee2', '123456', 'employee', NOW()),
        (5, 'employee3', '123456', 'employee', NOW())");
    
    $db->exec("INSERT INTO employees (id, store_id, hire_date, salary, position) VALUES 
        (3, 1, '2023-01-01', 5000.00, '销售'),
        (4, 2, '2023-02-01', 5000.00, '销售'),
        (5, 3, '2023-03-01', 5000.00, '销售')");
    
    // 启用外键检查
    $db->exec('SET FOREIGN_KEY_CHECKS=1');
    
    echo "管理员数据库设置成功！\n";
} catch (PDOException $e) {
    echo "数据库设置失败：" . $e->getMessage() . "\n";
    echo "错误详情：" . $e->getTraceAsString() . "\n";
} 