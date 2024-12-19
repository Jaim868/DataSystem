<?php
require_once __DIR__ . '/../utils/Database.php';

class StoreController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll() {
        try {
            $stmt = $this->db->prepare("
                SELECT DISTINCT id, name 
                FROM store_management_view
                ORDER BY name
            ");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Exception("Error fetching stores: " . $e->getMessage());
        }
    }

    public function getAdminStores() {
        try {
            $stmt = $this->db->prepare("
                SELECT DISTINCT
                    id, 
                    name, 
                    address, 
                    phone, 
                    created_at,
                    employee_count,
                    order_count,
                    total_sales,
                    product_count,
                    total_inventory
                FROM store_management_view
                ORDER BY name
            ");
            $stmt->execute();
            $stores = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 处理数据格式
            foreach ($stores as &$store) {
                $store['employee_count'] = (int)$store['employee_count'];
                $store['order_count'] = (int)$store['order_count'];
                $store['total_sales'] = (float)$store['total_sales'];
                $store['product_count'] = (int)$store['product_count'];
                $store['total_inventory'] = (int)$store['total_inventory'];
            }

            return [
                'success' => true,
                'stores' => $stores
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => "Error fetching stores: " . $e->getMessage()
            ];
        }
    }
} 