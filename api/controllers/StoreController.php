<?php
require_once __DIR__ . '/../utils/Database.php';

class StoreController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll() {
        try {
            $stmt = $this->db->prepare("SELECT id, name FROM stores");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw new Exception("Error fetching stores: " . $e->getMessage());
        }
    }

    public function getAdminStores() {
        try {
            $stmt = $this->db->prepare("SELECT id, name, address, phone, created_at FROM stores");
            $stmt->execute();
            $stores = $stmt->fetchAll(PDO::FETCH_ASSOC);
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