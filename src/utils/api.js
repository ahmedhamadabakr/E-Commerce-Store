import axios from 'axios';

// إنشاء instance محسن لـ axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor للطلبات
api.interceptors.request.use(
  (config) => {
    // إضافة timestamp للتحكم في التخزين المؤقت
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor للاستجابات
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // معالجة الأخطاء بشكل أفضل
    if (error.response?.status === 401) {
      // إعادة توجيه للصفحة الرئيسية في حالة عدم المصادقة
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions مع تحسين الأداء
export const productsAPI = {
  // الحصول على جميع المنتجات
  getAll: async () => {
    const response = await api.get('/api/products');
    return response.data;
  },

  // الحصول على منتج واحد
  getById: async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  // إنشاء منتج جديد
  create: async (productData) => {
    const response = await api.post('/api/products', productData);
    return response.data;
  },

  // تحديث منتج
  update: async (id, productData) => {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
  },

  // حذف منتج
  delete: async (id) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },
};

// API للمصادقة
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/api/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/api/auth/signin', credentials);
    return response.data;
  },
};

// API للسلة
export const cartAPI = {
  getCart: async () => {
    const response = await api.get('/api/cart');
    return response.data;
  },

  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/api/cart/add', { productId, quantity });
    return response.data;
  },

  removeFromCart: async (productId) => {
    const response = await api.delete(`/api/cart/remove/${productId}`);
    return response.data;
  },

  updateQuantity: async (productId, quantity) => {
    const response = await api.put(`/api/cart/update/${productId}`, { quantity });
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/api/cart/clear');
    return response.data;
  },
};

export default api; 