-- 先删除 order_items 表的外键约束
ALTER TABLE order_items
DROP FOREIGN KEY order_items_ibfk_1;

-- 删除 order_items 表中的 order_id 列
ALTER TABLE order_items
DROP COLUMN order_id;

-- 修改 orders 表，确保 order_no 是唯一的
ALTER TABLE orders
ADD UNIQUE KEY unique_order_no (order_no);

-- 在 order_items 表中添加 order_no 列
ALTER TABLE order_items
ADD COLUMN order_no VARCHAR(20) NOT NULL AFTER id;

-- 添加新的外键约束
ALTER TABLE order_items
ADD CONSTRAINT order_items_order_no_fk
FOREIGN KEY (order_no) REFERENCES orders(order_no); 