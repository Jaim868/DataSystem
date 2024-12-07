<?php
require_once __DIR__ . '/../utils/Database.php';

class ProductManagementController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getProducts() {
        try {
            $stmt = $this->db->prepare("
                SELECT id, name, price, description, category, 
                       image_url, stock, sales, rating,
                       created_at, updated_at
                FROM products
                WHERE deleted_at IS NULL
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $products = $stmt->fetchAll();

            header('Content-Type: application/json');
            echo json_encode($products);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function addProduct() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // 处理图片上传
            $imageUrl = $this->handleImageUpload($_FILES['image'] ?? null);
            
            $stmt = $this->db->prepare("
                INSERT INTO products (
                    name, price, description, category,
                    image_url, stock, rating, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
            ");
            $stmt->execute([
                $data['name'],
                $data['price'],
                $data['description'],
                $data['category'],
                $imageUrl,
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

    public function updateProduct($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // 处理图片上传
            $imageUrl = $this->handleImageUpload($_FILES['image'] ?? null);
            
            $updateFields = [];
            $params = [];
            
            // 动态构建更新字段
            foreach(['name', 'price', 'description', 'category', 'stock'] as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "$field = ?";
                    $params[] = $data[$field];
                }
            }
            
            if ($imageUrl) {
                $updateFields[] = "image_url = ?";
                $params[] = $imageUrl;
            }
            
            $updateFields[] = "updated_at = NOW()";
            $params[] = $id;

            $stmt = $this->db->prepare("
                UPDATE products 
                SET " . implode(', ', $updateFields) . "
                WHERE id = ?
            ");
            $stmt->execute($params);

            header('Content-Type: application/json');
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function deleteProduct($id) {
        try {
            $stmt = $this->db->prepare("
                UPDATE products 
                SET deleted_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$id]);

            header('Content-Type: application/json');
            echo json_encode(['success' => true]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    private function handleImageUpload($file) {
        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            return null;
        }

        $uploadDir = __DIR__ . '/../../public/uploads/products/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '.' . $extension;
        $filepath = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            return '/uploads/products/' . $filename;
        }

        return null;
    }
} 