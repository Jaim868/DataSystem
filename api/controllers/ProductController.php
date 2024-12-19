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
                // 如果选择了特定商店，获取该商店的库存
                $query = "
                    SELECT DISTINCT
                        id,
                        name,
                        price,
                        description,
                        category,
                        image_url,
                        store_quantity as stock,
                        rating,
                        store_id,
                        store_name
                    FROM product_comprehensive_view
                    WHERE store_id = ?
                    ORDER BY id
                ";
                $stmt = $this->db->prepare($query);
                $stmt->execute([$storeId]);
            } else {
                // 如果没有选择商店，显示所有商品
                $query = "
                    SELECT DISTINCT
                        id,
                        name,
                        price,
                        description,
                        category,
                        image_url,
                        total_stock as stock,
                        rating,
                        store_id,
                        store_name
                    FROM product_comprehensive_view
                    ORDER BY id
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
                SELECT DISTINCT
                    id,
                    name,
                    price,
                    description,
                    category,
                    image_url,
                    COALESCE(store_quantity, total_stock) as stock,
                    rating,
                    sales,
                    store_id,
                    store_name,
                    supplier_id,
                    supplier_name,
                    supplier_contact
                FROM product_comprehensive_view
                WHERE id = ?
                LIMIT 1
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
                'sales' => (int)$product['sales'],
                'store_id' => $product['store_id'] ? (int)$product['store_id'] : null,
                'store_name' => $product['store_name'],
                'supplier_id' => $product['supplier_id'] ? (int)$product['supplier_id'] : null,
                'supplier_name' => $product['supplier_name'],
                'supplier_contact' => $product['supplier_contact']
            ];
        } catch (Exception $e) {
            error_log("Product detail error: " . $e->getMessage());
            throw new Exception("获取商品详情失败: " . $e->getMessage());
        }
    }
} 