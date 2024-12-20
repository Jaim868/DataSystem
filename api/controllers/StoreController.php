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

    public function addStore() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['name']) || !isset($data['address']) || !isset($data['phone'])) {
                throw new Exception("缺少必要的字段");
            }

            // 验证手机号格式
            if (!preg_match('/^1[3-9]\d{9}$/', $data['phone'])) {
                throw new Exception("手机号格式不正确");
            }

            // 检查商店名是否已存在
            $checkStmt = $this->db->prepare("SELECT id FROM stores WHERE name = ?");
            $checkStmt->execute([$data['name']]);
            if ($checkStmt->fetch()) {
                throw new Exception("商店名称已存在");
            }

            $stmt = $this->db->prepare("
                INSERT INTO stores (name, address, phone)
                VALUES (:name, :address, :phone)
            ");

            $stmt->execute([
                ':name' => $data['name'],
                ':address' => $data['address'],
                ':phone' => $data['phone']
            ]);

            return [
                'success' => true,
                'message' => '商店添加成功',
                'id' => $this->db->lastInsertId()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function updateStore($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['name']) || !isset($data['address']) || !isset($data['phone'])) {
                throw new Exception("缺少必要的字段");
            }

            // 验证手机号格式
            if (!preg_match('/^1[3-9]\d{9}$/', $data['phone'])) {
                throw new Exception("手机号格式不正确");
            }

            // 检查商店是否存在
            $checkStmt = $this->db->prepare("SELECT id FROM stores WHERE id = ?");
            $checkStmt->execute([$id]);
            if (!$checkStmt->fetch()) {
                throw new Exception("商店不存在");
            }

            // 检查新的商店名是否与其他商店重复
            $nameCheckStmt = $this->db->prepare("SELECT id FROM stores WHERE name = ? AND id != ?");
            $nameCheckStmt->execute([$data['name'], $id]);
            if ($nameCheckStmt->fetch()) {
                throw new Exception("商店名称已存在");
            }

            $stmt = $this->db->prepare("
                UPDATE stores 
                SET name = :name, 
                    address = :address, 
                    phone = :phone
                WHERE id = :id
            ");

            $stmt->execute([
                ':id' => $id,
                ':name' => $data['name'],
                ':address' => $data['address'],
                ':phone' => $data['phone']
            ]);

            if ($stmt->rowCount() === 0) {
                throw new Exception("更新失败，请检查数据是否有变化");
            }

            return [
                'success' => true,
                'message' => '商店更新成功'
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function deleteStore($id) {
        try {
            // 开启事务
            $this->db->beginTransaction();

            // 检查商店是否存在且未被删除
            $checkStmt = $this->db->prepare("SELECT id FROM stores WHERE id = :id AND is_deleted = 0");
            $checkStmt->execute(['id' => $id]);
            $store = $checkStmt->fetch();

            if (!$store) {
                throw new Exception("商店不存在或已被删除");
            }

            // 执行逻辑删除
            $deleteStmt = $this->db->prepare("
            UPDATE stores 
            SET is_deleted = 1, deleted_at = NOW() 
            WHERE id = :id
        ");
            $deleteSuccess = $deleteStmt->execute(['id' => $id]);

            if (!$deleteSuccess) {
                throw new Exception("逻辑删除商店失败");
            }

            // 提交事务
            $this->db->commit();

            return [
                'success' => true,
                'message' => '商店已被标记为删除',
            ];
        } catch (Exception $e) {
            // 回滚事务
            $this->db->rollBack();

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
} 