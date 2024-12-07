<?php
require_once __DIR__ . '/../utils/Database.php';

class InventoryController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getInventory() {
        try {
            $stmt = $this->db->prepare("
                SELECT p.id, p.name, p.stock, p.price, p.category,
                       p.sales, p.created_at, p.updated_at
                FROM products p
                WHERE p.deleted_at IS NULL
            ");
            $stmt->execute();
            $inventory = $stmt->fetchAll();

            header('Content-Type: application/json');
            echo json_encode($inventory);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function updateStock() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $this->db->prepare("
                UPDATE products 
                SET stock = ?, updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([
                $data['stock'],
                $data['productId']
            ]);

            header('Content-Type: application/json');
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function addProduct() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $this->db->prepare("
                INSERT INTO products (
                    name, price, description, category, 
                    image_url, stock, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");
            $stmt->execute([
                $data['name'],
                $data['price'],
                $data['description'],
                $data['category'],
                $data['imageUrl'],
                $data['stock']
            ]);

            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'id' => $this->db->lastInsertId()
            ]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
} 