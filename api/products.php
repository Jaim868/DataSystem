<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/utils/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        SELECT 
            p.id,
            p.name,
            p.price,
            p.description,
            p.category,
            p.image_url,
            p.stock,
            p.rating,
            s.id as store_id,
            s.name as store_name
        FROM products p
        LEFT JOIN store_inventory si ON p.id = si.product_id
        LEFT JOIN stores s ON si.store_id = s.id
        WHERE p.deleted_at IS NULL
    ");
    $stmt->execute();
    $products = $stmt->fetchAll();
    
    echo json_encode($products);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} 