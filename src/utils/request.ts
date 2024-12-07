import { message } from 'antd';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface RequestOptions extends RequestInit {
    data?: any;
}

export async function request(endpoint: string, options: RequestOptions = {}) {
    const token = localStorage.getItem('token');
    
    const headers = new Headers({
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    });

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    if (options.data) {
        config.body = JSON.stringify(options.data);
    }

    try {
        console.log('Sending request to:', `${BASE_URL}${endpoint}`);
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        const data = await response.json();
        console.log('Response:', data);

        if (!response.ok) {
            throw new Error(data.message || data.error || '请求失败');
        }

        return data;
    } catch (error: unknown) {
        console.error('Request error:', error);
        if (error instanceof Error) {
            message.error(error.message);
            throw error;
        } else {
            const errorMessage = '请求失败，请检查网络连接';
            message.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
}

export const http = {
    get: (endpoint: string) => request(endpoint),
    post: (endpoint: string, data: any) => request(endpoint, { method: 'POST', data }),
    put: (endpoint: string, data: any) => request(endpoint, { method: 'PUT', data }),
    delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
}; 