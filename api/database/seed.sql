-- 插入商店数据
INSERT INTO stores (name, address, phone) VALUES
('渔具之家', '北京市朝阳区建国路88号', '010-12345678'),
('钓鱼人生', '上海市浦东新区陆家嘴1号', '021-87654321'),
('垂钓天地', '广州市天河区体育西路123号', '020-45678901');

-- 插入供应商数据
INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
('海钓用品批发商', '张三', '13812345678', 'zhangsan@example.com', '深圳市南山区科技园'),
('淡水渔具供应商', '李四', '13987654321', 'lisi@example.com', '江苏省苏州市工业园区'),
('专业渔具制造商', '王五', '13567890123', 'wangwu@example.com', '浙江省杭州市滨江区');

-- 插入商品数据
INSERT INTO products (name, price, description, category, image_url, stock, rating, sales) VALUES
('碳素钓鱼竿2.7米', 299.00, '超轻超硬碳素材质，适合各种钓位', '鱼竿', '/images/rod1.jpg', 100, 4.8, 50),
('专业路亚竿套装', 599.00, '含各种假饵，全套装备一应俱全', '鱼竿', '/images/rod2.jpg', 80, 4.9, 30),
('高档渔线套装', 89.00, '进口尼龙材质，拉力强韧耐用', '渔线', '/images/line1.jpg', 200, 4.7, 100),
('精致浮漂50支装', 45.00, '灵敏度高，多种规格可选', '浮漂', '/images/float1.jpg', 500, 4.6, 200),
('高级鱼饵套装', 129.00, '多种口味，适合各类鱼种', '鱼饵', '/images/bait1.jpg', 300, 4.8, 150);

-- 插入供应商产品关联数据
INSERT INTO supplier_products (supplier_id, product_id, supply_price, last_supply_date) VALUES
(1, 1, 200.00, '2024-03-01'),
(1, 2, 400.00, '2024-03-01'),
(2, 3, 50.00, '2024-03-02'),
(2, 4, 25.00, '2024-03-02'),
(3, 5, 80.00, '2024-03-03');

-- 插入商店库存数据
INSERT INTO store_inventory (store_id, product_id, stock_quantity) VALUES
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

-- 插入员工数据
INSERT INTO employees (name, position, store_id, phone, email, hire_date) VALUES
('赵六', '店长', 1, '13598765432', 'zhaoliu@example.com', '2023-01-15'),
('钱七', '销售员', 1, '13687654321', 'qianqi@example.com', '2023-02-01'),
('孙八', '店长', 2, '13776543210', 'sunba@example.com', '2023-01-20'),
('周九', '销售员', 2, '13865432109', 'zhoujiu@example.com', '2023-02-15'),
('吴十', '店长', 3, '13954321098', 'wushi@example.com', '2023-01-25');

-- 插入用户数据（用于测试登录功能）
INSERT INTO users (username, password, role, email, phone) VALUES
('customer1', 'password123', 'customer', 'customer1@example.com', '13512345678'),
('supplier1', 'password123', 'supplier', 'supplier1@example.com', '13623456789'),
('employee1', 'password123', 'employee', 'employee1@example.com', '13734567890'),
('manager1', 'password123', 'manager', 'manager1@example.com', '13845678901');

-- 添加供应商订单测试数据
INSERT INTO orders (order_no, user_id, store_id, total_amount, status, created_at) VALUES
('ORD20240316001', 2, 1, 599.00, 'pending', NOW()),
('ORD20240316002', 2, 2, 299.00, 'completed', NOW());

INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 2, 299.50),
(1, 2, 1, 599.00),
(2, 3, 3, 89.00);

-- 确保供应商产品关联存在
INSERT INTO supplier_products (supplier_id, product_id, supply_price) VALUES
(2, 1, 200.00),
(2, 2, 400.00),
(2, 3, 50.00);

-- 确保用户角色正确
UPDATE users SET role = 'supplier' WHERE username = 'supplier1'; 