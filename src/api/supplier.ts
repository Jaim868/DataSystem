import axios from 'axios';

export const getSupplierDashboard = async () => {
  const response = await axios.get('/api/supplier/dashboard');
  if (response.data.success) {
    return response.data;
  }
  throw new Error(response.data.error || '获取仪表盘数据失败');
};

export const getSupplierProducts = async () => {
  const response = await axios.get('/api/supplier/products');
  if (response.data.success) {
    return response.data;
  }
  throw new Error(response.data.error || '获取商品列表失败');
};

export const addProduct = async (formData: FormData) => {
  const response = await axios.post('/api/supplier/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  if (response.data.success) {
    return response.data;
  }
  throw new Error(response.data.error || '添加商品失败');
};

export const updateProduct = async (id: number, formData: FormData) => {
  const response = await axios.post(`/api/supplier/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  if (response.data.success) {
    return response.data;
  }
  throw new Error(response.data.error || '更新商品失败');
};

export const getSupplierOrders = async () => {
  const response = await axios.get('/api/supplier/orders');
  if (response.data.success) {
    return response.data;
  }
  throw new Error(response.data.error || '获取订单列表失败');
};

export const updateOrderStatus = async (orderNo: string, status: string) => {
  const response = await axios.put(`/api/supplier/orders/${orderNo}/status`, { status });
  if (response.data.success) {
    return response.data;
  }
  throw new Error(response.data.error || '更新订单状态失败');
}; 