<?php
echo "<h2>PHP PDO 检查</h2>";
echo "<pre>";

// 检查 PDO 是否可用
if (class_exists('PDO')) {
    echo "PDO 已安装\n";
    echo "已安装的 PDO 驱动:\n";
    print_r(PDO::getAvailableDrivers());
} else {
    echo "PDO 未安装\n";
}

// 检查 MySQL PDO 驱动
if (in_array("mysql", PDO::getAvailableDrivers())) {
    echo "MySQL PDO 驱动已安装\n";
} else {
    echo "MySQL PDO 驱动未安装\n";
}

echo "</pre>"; 