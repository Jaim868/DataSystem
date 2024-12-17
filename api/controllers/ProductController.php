<?php
require_once __DIR__ . '/../utils/Database.php';

class ProductController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll() {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    p.id,
                    p.name,
                    CAST(p.price AS DECIMAL(10,2)) as price,
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
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($products as &$product) {
                $product['price'] = (float)$product['price'];
            }
            
            return $products;
        } catch (Exception $e) {
            throw new Exception("Error fetching products: " . $e->getMessage());
        }
    }

    public function getProduct($id) {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    p.id,
                    p.name,
                    CAST(p.price AS DECIMAL(10,2)) as price,
                    p.description,
                    p.category,
                    p.image_url,
                    p.stock,
                    p.rating,
                    s.id as store_id,
                    s.name as store_name,
                    p.created_at,
                    p.updated_at,
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
                throw new Exception("Product not found");
            }
            
            $product['price'] = (float)$product['price'];
            
            return $product;
        } catch (Exception $e) {
            throw new Exception("Error fetching product: " . $e->getMessage());
        }
    }
} 