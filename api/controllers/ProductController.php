<?php
require_once __DIR__ . '/../utils/Database.php';

class ProductController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getProducts() {
        try {
            $stmt = $this->db->query("
                SELECT id, name, price, description, image_url, stock 
                FROM products 
                WHERE deleted_at IS NULL
            ");
            $products = $stmt->fetchAll();

            header('Content-Type: application/json');
            echo json_encode($products);
        } catch(PDOException $e) {
            error_log('Get products error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => '获取商品列表失败']);
        }
    }

    public function getProduct($id) {
        try {
            $stmt = $this->db->prepare("
                SELECT id, name, price, description, image_url, stock 
                FROM products 
                WHERE id = ? AND deleted_at IS NULL
            ");
            $stmt->execute([$id]);
            $product = $stmt->fetch();

            if (!$product) {
                http_response_code(404);
                echo json_encode(['error' => '商品不存在']);
                return;
            }

            header('Content-Type: application/json');
            echo json_encode($product);
        } catch(PDOException $e) {
            error_log('Get product error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => '获取商品详情失败']);
        }
    }
} 