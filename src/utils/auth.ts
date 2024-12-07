import axios from 'axios';

export const setupAuthInterceptor = () => {
  // 响应拦截器
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('userRole');
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
}; 