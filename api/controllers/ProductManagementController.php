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
                    price, 
                    description, 
                    category,
                    image_url, 
                    stock,
                    sales,
                    rating,
                    created_at,
                    updated_at
                FROM product_management_view
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 处理数据格式
            $formattedProducts = array_map(function($product) {
                return [
                    'id' => (int)$product['id'],
                    'name' => $product['name'],
                    'price' => (float)$product['price'],
                    'description' => $product['description'],
                    'category' => $product['category'],
                    'image_url' => $product['image_url'],
                    'stock' => (int)$product['stock'],
                    'sales' => (int)$product['sales'],
                    'rating' => (float)$product['rating'],
                    'created_at' => $product['created_at'],
                    'updated_at' => $product['updated_at']
                ];
            }, $products);

            return $formattedProducts;
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
                    price, 
                    description, 
                    category,
                    image_url, 
                    stock,
                    sales,
                    rating,
                    created_at,
                    updated_at
                FROM product_management_view
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 处理数据格式
            $formattedProducts = array_map(function($product) {
                return [
                    'id' => (int)$product['id'],
                    'name' => $product['name'],
                    'price' => (float)$product['price'],
                    'description' => $product['description'],
                    'category' => $product['category'],
                    'image_url' => $product['image_url'],
                    'stock' => (int)$product['stock'],
                    'sales' => (int)$product['sales'],
                    'rating' => (float)$product['rating'],
                    'created_at' => $product['created_at'],
                    'updated_at' => $product['updated_at']
                ];
            }, $products);

            header('Content-Type: application/json');
            echo json_encode($formattedProducts ?: []);
        } catch(PDOException $e) {
            error_log('Get products error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => '获取商品列表失败']);
        }
    }

    public function addProduct() {
        try {
            // 获取POST数据
            $name = $_POST['name'] ?? null;
            $price = $_POST['price'] ?? null;
            $description = $_POST['description'] ?? null;
            $category = $_POST['category'] ?? null;
            $stock = $_POST['stock'] ?? null;

            // 验证必填字段
            if (!$name || !$price || !$category || !$stock) {
                throw new Exception('缺少必要的字段');
            }

            // 处理图片上传
            $imageUrl = $this->handleImageUpload($_FILES['image'] ?? null);
            if (!$imageUrl) {
                $imageUrl = '/images/default.jpg'; // 设置默认图片
            }

            // 开始事务
            $this->db->beginTransaction();

            try {
                // 插入商品记录
                $stmt = $this->db->prepare("
                    INSERT INTO products (
                        name, price, description, category,
                        image_url, stock, rating, sales,
                        created_at, updated_at
                    ) VALUES (
                        :name, :price, :description, :category,
                        :image_url, :stock, 5.0, 0,
                        NOW(), NOW()
                    )
                ");

                $stmt->execute([
                    ':name' => $name,
                    ':price' => floatval($price),
                    ':description' => $description,
                    ':category' => $category,
                    ':image_url' => $imageUrl,
                    ':stock' => intval($stock)
                ]);

                $productId = $this->db->lastInsertId();

                // 提交事务
                $this->db->commit();

                // 返回成功响应
                echo json_encode([
                    'success' => true,
                    'message' => '商品添加成功',
                    'data' => [
                        'id' => $productId,
                        'name' => $name,
                        'price' => floatval($price),
                        'description' => $description,
                        'category' => $category,
                        'image_url' => $imageUrl,
                        'stock' => intval($stock),
                        'rating' => 5.0,
                        'sales' => 0
                    ]
                ]);
            } catch (Exception $e) {
                $this->db->rollBack();
                throw $e;
            }
        } catch (Exception $e) {
            error_log('Add product error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => '添加商品失败',
                'message' => $e->getMessage()
            ]);
        }
    }

    public function updateProduct($id) {
        try {
            // 开启调试日志
            error_log('Updating product ' . $id . ' with data: ' . print_r($_POST, true));
            error_log('Files: ' . print_r($_FILES, true));

            // 检查商品是否存在
            $stmt = $this->db->prepare("
                SELECT id FROM products 
                WHERE id = ? AND deleted_at IS NULL
            ");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                throw new Exception('商品不存在或已被删除');
            }

            // 开始事务
            $this->db->beginTransaction();

            try {
                // 处理图片上传
                $imageUrl = null;
                if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                    $imageUrl = $this->handleImageUpload($_FILES['image']);
                }

                // 构建更新SQL
                $updateFields = [];
                $params = [];
                
                // 可更新的字段列表
                $allowedFields = [
                    'name' => 'string',
                    'price' => 'float',
                    'description' => 'string',
                    'category' => 'string',
                    'stock' => 'int'
                ];
                
                // 处理每个字段
                foreach ($allowedFields as $field => $type) {
                    if (isset($_POST[$field]) && $_POST[$field] !== '') {
                        $updateFields[] = "`$field` = ?";
                        // 根据字段类型转换数据
                        switch ($type) {
                            case 'float':
                                $params[] = floatval($_POST[$field]);
                                break;
                            case 'int':
                                $params[] = intval($_POST[$field]);
                                break;
                            default:
                                $params[] = $_POST[$field];
                        }
                    }
                }

                // 如果有新图片，添加到更新字段中
                if ($imageUrl) {
                    $updateFields[] = "image_url = ?";
                    $params[] = $imageUrl;
                }

                // 添加更新时间
                $updateFields[] = "updated_at = NOW()";
                
                // 添加ID到参数数组
                $params[] = $id;

                if (empty($updateFields)) {
                    throw new Exception('没有要更新的字段');
                }

                // 执行更新
                $sql = "UPDATE products SET " . implode(', ', $updateFields) . " WHERE id = ? AND deleted_at IS NULL";
                error_log('Executing SQL: ' . $sql);
                error_log('Parameters: ' . print_r($params, true));
                
                $stmt = $this->db->prepare($sql);
                $result = $stmt->execute($params);

                if ($result) {
                    // 获取更新后的商品数据
                    $stmt = $this->db->prepare("
                        SELECT * FROM product_management_view 
                        WHERE id = ?
                    ");
                    $stmt->execute([$id]);
                    $updatedProduct = $stmt->fetch(PDO::FETCH_ASSOC);

                    // 提交事务
                    $this->db->commit();

                    header('Content-Type: application/json');
                    echo json_encode([
                        'success' => true,
                        'message' => '商品更新成功',
                        'data' => $updatedProduct
                    ]);
                } else {
                    throw new Exception('更新失败');
                }
            } catch (Exception $e) {
                // 回滚事务
                $this->db->rollBack();
                throw $e;
            }
        } catch (Exception $e) {
            error_log('Update product error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => '更新商品失败',
                'message' => $e->getMessage()
            ]);
        }
    }

    public function deleteProduct($id) {
        try {
            // 检查商品是否存在
            $stmt = $this->db->prepare("
                SELECT id FROM products 
                WHERE id = ? AND deleted_at IS NULL
            ");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                throw new Exception('商品不存在或已被删除');
            }

            // 开始事务
            $this->db->beginTransaction();

            try {
                // 软删除商品
                $stmt = $this->db->prepare("
                    UPDATE products 
                    SET deleted_at = NOW()
                    WHERE id = ?
                ");
                $stmt->execute([$id]);

                // 清理购物车中的相关项目
                $stmt = $this->db->prepare("
                    DELETE FROM cart_items 
                    WHERE product_id = ?
                ");
                $stmt->execute([$id]);

                // 提交事务
                $this->db->commit();

                header('Content-Type: application/json');
                echo json_encode([
                    'success' => true,
                    'message' => '商品删除成功'
                ]);
            } catch (Exception $e) {
                // 回滚事务
                $this->db->rollBack();
                throw $e;
            }
        } catch (Exception $e) {
            error_log('Delete product error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => '删除商品失败',
                'message' => $e->getMessage()
            ]);
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
                    id,
                    name,
                    description,
                    price,
                    category,
                    stock as total_stock,
                    store_stocks
                FROM product_management_view
                ORDER BY category, name
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