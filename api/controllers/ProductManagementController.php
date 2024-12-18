<?php
require_once __DIR__ . '/../utils/Database.php';

class ProductManagementController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll() {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    id, 
                    name, 
                    CAST(price AS FLOAT) as price, 
                    description, 
                    category,
                    image_url, 
                    stock,
                    sales,
                    rating,
                    created_at,
                    updated_at
                FROM products
                WHERE deleted_at IS NULL
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            error_log('Get products error: ' . $e->getMessage());
            http_response_code(500);
            throw new Exception('获取商品列表失败');
        }
    }

    private function checkManagerAuth() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            throw new Exception('用户未登录');
        }

        $stmt = $this->db->prepare("
            SELECT role 
            FROM users 
            WHERE id = ? AND role = 'manager'
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            throw new Exception('非管理员用户');
        }

        return $userId;
    }

    public function getProducts() {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    id, 
                    name, 
                    CAST(price AS FLOAT) as price, 
                    description, 
                    category,
                    image_url, 
                    stock,
                    sales,
                    rating,
                    created_at,
                    updated_at
                FROM products
                WHERE deleted_at IS NULL
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

            header('Content-Type: application/json');
            echo json_encode($products ?: []);
        } catch(PDOException $e) {
            error_log('Get products error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => '获取商品列表失败']);
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
            // 获取表单数据
            $data = $_POST;
            
            // 开启调试日志
            error_log('Updating product ' . $id . ' with data: ' . print_r($data, true));
            error_log('Files: ' . print_r($_FILES, true));

            // 处理图片上传
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $imageUrl = $this->handleImageUpload($_FILES['image']);
                if ($imageUrl) {
                    $data['image_url'] = $imageUrl;
                }
            }

            // 验证必要字段
            if (!isset($data['name']) || !isset($data['price']) || !isset($data['category'])) {
                throw new Exception('缺少必要字段');
            }

            // 构建更新SQL
            $updateFields = [];
            $params = [];
            
            // 可更新的字段列表
            $allowedFields = ['name', 'price', 'description', 'category', 'stock', 'image_url'];
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field]) && $data[$field] !== '') {
                    $updateFields[] = "`$field` = ?";
                    $params[] = $field === 'price' ? floatval($data[$field]) : $data[$field];
                }
            }
            
            if (empty($updateFields)) {
                throw new Exception('没有要更新的字段');
            }

            // 添加更新时间
            $updateFields[] = "updated_at = NOW()";
            
            // 添加ID到参数数组
            $params[] = $id;

            // 执行更新
            $sql = "UPDATE products SET " . implode(', ', $updateFields) . " WHERE id = ? AND deleted_at IS NULL";
            $stmt = $this->db->prepare($sql);
            
            error_log('Executing SQL: ' . $sql);
            error_log('Parameters: ' . print_r($params, true));
            
            $result = $stmt->execute($params);

            if ($result) {
                // 获取更新后的商品数据
                $stmt = $this->db->prepare("SELECT * FROM products WHERE id = ?");
                $stmt->execute([$id]);
                $updatedProduct = $stmt->fetch(PDO::FETCH_ASSOC);

                header('Content-Type: application/json');
                echo json_encode([
                    'success' => true,
                    'message' => '商品更新成功',
                    'data' => $updatedProduct
                ]);
            } else {
                throw new Exception('更新失败');
            }
        } catch(Exception $e) {
            error_log('Update product error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'error' => '更新商品失败',
                'message' => $e->getMessage()
            ]);
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

        $uploadDir = __DIR__ . '/../uploads/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '.' . $extension;
        $filepath = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            return '/api/uploads/' . $filename;
        }

        return null;
    }

    public function getInventory() {
        try {
            // 验证管理员权限
            $this->checkManagerAuth();

            // 获取所有商店的库存信息
            $stmt = $this->db->prepare("
                SELECT 
                    p.id,
                    p.name,
                    p.description,
                    CAST(p.price AS DECIMAL(10,2)) as price,
                    p.category,
                    p.stock as total_stock,
                    GROUP_CONCAT(CONCAT(s.name, ':', si.quantity) SEPARATOR ';') as store_stocks
                FROM products p
                LEFT JOIN store_inventory si ON p.id = si.product_id
                LEFT JOIN stores s ON si.store_id = s.id
                WHERE p.deleted_at IS NULL
                GROUP BY p.id, p.name, p.description, p.price, p.category, p.stock
                ORDER BY p.category, p.name
            ");
            
            $stmt->execute();
            $inventory = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 处理数据格式
            $formattedInventory = array_map(function($item) {
                // 处理每个商店的库存
                $storeStocks = [];
                if ($item['store_stocks']) {
                    foreach (explode(';', $item['store_stocks']) as $storeStock) {
                        if ($storeStock) {
                            list($storeName, $quantity) = explode(':', $storeStock);
                            $storeStocks[$storeName] = (int)$quantity;
                        }
                    }
                }

                return [
                    'key' => $item['id'],
                    'id' => (int)$item['id'],
                    'name' => $item['name'],
                    'description' => $item['description'],
                    'price' => (float)$item['price'],
                    'category' => $item['category'],
                    'total_stock' => (int)$item['total_stock'],
                    'store_stocks' => $storeStocks
                ];
            }, $inventory);

            echo json_encode([
                'success' => true,
                'data' => $formattedInventory
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }
} 