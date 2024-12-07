<?php
require_once './utils/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query("SELECT * FROM users");
    $users = $stmt->fetchAll();
    echo "<pre>";
    print_r($users);
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
} 