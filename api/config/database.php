<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'fishing_shop');
define('DB_USER', 'root');
define('DB_PASS', '123456');  // 使用您的MySQL root用户实际密码
define('DB_CHARSET', 'utf8mb4');

// 添加错误报告
error_reporting(E_ALL);
ini_set('display_errors', 1);
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);