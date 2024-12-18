<?php
require_once __DIR__ . '/../utils/Database.php';

class ProductController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll() {
        try {
            $storeId = $_GET['store_id'] ?? null;
            error_log("Fetching products for store_id: " . $storeId);
            
            if ($storeId) {
                // 如果选择了特定商店，使用 INNER JOIN 获取该商店的库存
                $query = "
                    SELECT 
                        p.id,
                        p.name,
                        p.price,
                        p.description,
                        p.category,
                        p.image_url,
                        si.quantity as stock,
                        p.rating,
                        s.id as store_id,
                        s.name as store_name
                    FROM products p
                    INNER JOIN store_inventory si ON p.id = si.product_id
                    INNER JOIN stores s ON si.store_id = s.id
                    WHERE p.deleted_at IS NULL 
                    AND s.id = ?
                    ORDER BY p.id
                ";
                $stmt = $this->db->prepare($query);
                $stmt->execute([$storeId]);
            } else {
                // 如果没有选择商店，显示所有商品
                $query = "
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
                    ORDER BY p.id
                ";
                $stmt = $this->db->prepare($query);
                $stmt->execute();
            }
            
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            error_log("Found " . count($products) . " products");
            error_log("SQL Query: " . $query);
            
            if (empty($products)) {
                return [];
            }
            
            $formattedProducts = [];
            foreach ($products as $product) {
                $formattedProducts[] = [
                    'id' => (int)$product['id'],
                    'name' => $product['name'],
                    'price' => (float)$product['price'],
                    'description' => $product['description'],
                    'category' => $product['category'],
                    'image_url' => $product['image_url'],
                    'stock' => (int)($product['stock'] ?? 0),
                    'rating' => (float)$product['rating'],
                    'store_id' => $product['store_id'] ? (int)$product['store_id'] : null,
                    'store_name' => $product['store_name']
                ];
            }
            
            return $formattedProducts;
        } catch (Exception $e) {
            error_log("Error in getAll: " . $e->getMessage());
            throw new Exception("获取商品列表失败: " . $e->getMessage());
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
                    p.rating,
                    s.id as store_id,
                    s.name as store_name,
                    sp.supplier_id,
                    sup.name as supplier_name
                FROM products p
                LEFT JOIN store_inventory si ON p.id = si.product_id
                LEFT JOIN stores s ON si.store_id = s.id
                LEFT JOIN supplier_products sp ON p.id = sp.product_id
                LEFT JOIN suppliers sup ON sp.supplier_id = sup.id
                WHERE p.id = ? AND p.deleted_at IS NULL
            ");
            $stmt->execute([$id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$product) {
                throw new Exception("商品不存在");
            }
            
            return [
                'id' => (int)$product['id'],
                'name' => $product['name'],
                'price' => (float)$product['price'],
                'description' => $product['description'],
                'category' => $product['category'],
                'image_url' => $product['image_url'],
                'stock' => (int)$product['stock'],
                'rating' => (float)$product['rating'],
                'store_id' => $product['store_id'] ? (int)$product['store_id'] : null,
                'store_name' => $product['store_name'],
                'supplier_id' => $product['supplier_id'] ? (int)$product['supplier_id'] : null,
                'supplier_name' => $product['supplier_name']
            ];
        } catch (Exception $e) {
            throw new Exception("获取商品详情失败: " . $e->getMessage());
        }
    }
} 