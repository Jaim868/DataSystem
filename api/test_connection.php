<?php
$config = require __DIR__ . '/config/database.php';
echo "<pre>";
print_r($config);

try {
    $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['dbname']};charset={$config['charset']}";
    $pdo = new PDO(
        $dsn,
        $config['username'],
        $config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]
    );
    echo "连接成功！\n";
} catch(PDOException $e) {
    echo "连接失败：" . $e->getMessage() . "\n";
}
echo "</pre>"; 