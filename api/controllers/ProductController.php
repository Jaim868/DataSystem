<?php
require_once __DIR__ . '/../utils/Database.php';

class ProductController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getProducts() {
        try {
            $category = $_GET['category'] ?? null;
            
            $sql = "
                SELECT 
                    id, name, 
                    CAST(price AS DECIMAL(10,2)) as price,
                    description, category,
                    image_url, stock, sales, rating
                FROM products 
                WHERE deleted_at IS NULL
            ";
            
            if ($category) {
                $sql .= " AND category = ?";
            }
            
            $sql .= " ORDER BY created_at DESC";
            
            $stmt = $this->db->prepare($sql);
            
            if ($category) {
                $stmt->execute([$category]);
            } else {
                $stmt->execute();
            }
            
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // 确保数值类型正确
            foreach ($products as &$product) {
                $product['price'] = floatval($product['price']);
                $product['stock'] = intval($product['stock']);
                $product['sales'] = intval($product['sales']);
                $product['rating'] = floatval($product['rating']);
            }
            
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
                SELECT 
                    p.id, 
                    p.name, 
                    p.price, 
                    p.description, 
                    p.category,
                    p.image_url, 
                    p.stock,
                    p.sales,
                    p.rating,
                    GROUP_CONCAT(pf.feature) as features
                FROM products p
                LEFT JOIN product_features pf ON p.id = pf.product_id
                WHERE p.id = ? AND p.deleted_at IS NULL
                GROUP BY p.id
            ");
            
            $stmt->execute([$id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$product) {
                http_response_code(404);
                echo json_encode(['error' => '商品不存在']);
                return;
            }

            // 处理 features 字段
            $product['features'] = $product['features'] ? explode(',', $product['features']) : [];

            header('Content-Type: application/json');
            echo json_encode($product);
        } catch(PDOException $e) {
            error_log('Get product error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => '获取商品详情失败']);
        }
    }

    public function createProduct() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // 验证必要字段
            if (!isset($data['name']) || !isset($data['price']) || !isset($data['category'])) {
                http_response_code(400);
                echo json_encode(['error' => '缺少必要参数']);
                return;
            }

            // 处理图片上传
            $image_url = $this->handleImageUpload();
            
            $stmt = $this->db->prepare("
                INSERT INTO products (
                    name, price, description, category, 
                    image_url, stock, features, rating, sales
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
            ");

            $stmt->execute([
                $data['name'],
                $data['price'],
                $data['description'] ?? '',
                $data['category'],
                $image_url,
                $data['stock'] ?? 0,
                $data['features'] ? implode(',', $data['features']) : '',
                $data['rating'] ?? 5.0,
                $data['sales'] ?? 0
            ]);

            $productId = $this->db->lastInsertId();

            echo json_encode([
                'success' => true,
                'message' => '商品创建成功',
                'id' => $productId
            ]);
        } catch(PDOException $e) {
            error_log('Create product error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => '创建商品失败']);
        }
    }

    public function updateProduct($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data)) {
                http_response_code(400);
                echo json_encode(['error' => '无效的请求数据']);
                return;
            }

            // 处理新图片上传
            if (isset($_FILES['image'])) {
                $data['image_url'] = $this->handleImageUpload();
            }

            // 构建更新SQL
            $updateFields = [];
            $params = [];
            foreach ($data as $key => $value) {
                if ($key === 'features' && is_array($value)) {
                    $value = implode(',', $value);
                }
                $updateFields[] = "`$key` = ?";
                $params[] = $value;
            }
            $params[] = $id;

            $sql = "UPDATE products SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            echo json_encode([
                'success' => true,
                'message' => '商品更新成功'
            ]);
        } catch(PDOException $e) {
            error_log('Update product error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => '更新商品失败']);
        }
    }

    public function deleteProduct($id) {
        try {
            // 使用软删除
            $stmt = $this->db->prepare("
                UPDATE products 
                SET deleted_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ");
            $stmt->execute([$id]);

            echo json_encode([
                'success' => true,
                'message' => '商品删除成功'
            ]);
        } catch(PDOException $e) {
            error_log('Delete product error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => '删除商品失败']);
        }
    }

    private function handleImageUpload() {
        if (!isset($_FILES['image'])) {
            return null;
        }

        $file = $_FILES['image'];
        $fileName = uniqid() . '_' . $file['name'];
        $uploadDir = __DIR__ . '/../uploads/';
        
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $targetPath = $uploadDir . $fileName;
        
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            return '/api/uploads/' . $fileName;
        }
        
        return null;
    }
} 