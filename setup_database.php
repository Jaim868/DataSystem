<?php
require_once __DIR__ . '/api/config/database.php';
require_once __DIR__ . '/api/utils/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // 读取SQL文件内容
    $sql = file_get_contents('setup_employees.sql');
    
    // 执行SQL语句
    $db->exec($sql);
    
    echo "数据库设置成功！\n";
} catch (PDOException $e) {
    echo "数据库设置失败：" . $e->getMessage() . "\n";
    echo "错误详情：" . $e->getTraceAsString() . "\n";
} 