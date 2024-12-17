<?php
require_once __DIR__ . '/../config/database.php';

try {
    // 创建PDO实例，连接到MySQL服务器
    $pdo = new PDO(
        "mysql:host=" . DB_HOST,
        DB_USER,
        DB_PASS
    );
    
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 读取并执行SQL文件
    $files = [
        __DIR__ . '/setup.sql',
        __DIR__ . '/tables.sql',
        __DIR__ . '/views.sql',
        __DIR__ . '/seed.sql'
    ];

    foreach ($files as $file) {
        $sql = file_get_contents($file);
        $pdo->exec($sql);
        echo "Successfully executed " . basename($file) . "\n";
    }

    echo "Database initialization completed successfully!\n";

} catch (PDOException $e) {
    die("Database initialization failed: " . $e->getMessage() . "\n");
} 