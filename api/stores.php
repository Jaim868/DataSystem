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
    
    $stmt = $db->prepare("SELECT id, name FROM stores");
    $stmt->execute();
    $stores = $stmt->fetchAll();
    
    echo json_encode($stores);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} 