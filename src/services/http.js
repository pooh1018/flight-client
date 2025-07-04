import axios from 'axios';
import { Message } from '@/components/ui/Message';
import { getAuthToken, saveAuthToken, removeAuthToken } from '@/utils/storage';

// 创建 axios 实例
const service = axios.create({
    // 根据环境变量判断接口地址
    baseURL:
        import.meta.env.NODE_ENV === 'production'
            ? import.meta.env.VITE_API_BASE_URL // 生产环境使用正式地址
            : import.meta.env.VITE_API_DEV_URL, // 开发环境使用开发地址
    timeout: 5000 // 请求超时时间（5秒）

});

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 确保URL以'/'开头
        if (!config.url.startsWith('/')) {
            config.url = '/' + config.url;
        }
        // 添加api前缀
        config.url = '/api' + config.url;

        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = token // 让每个请求携带自定义token 请根据实际情况自行修改
        }
        config.headers['Accept-Language'] = import.meta.env.VITE_LANGUAGE || 'en';
        config.headers['Content-Type'] = 'application/json;charset=UTF-8'
        return config
    },
    error => {
        return Promise.reject(error)
    }
);

// 响应拦截器
service.interceptors.response.use(
    response => {
        // 对响应数据做点什么
        const res = response.data;
        const url = response.config.url;

        // 如果是登录请求且成功，保存token
        if (res.data?.token && res.success) {
            // 如果是登录请求且成功，保存token
            saveAuthToken(res.data.token);
            console.log('登录成功，保存token', getAuthToken());
        }

        // 如果响应中包含 success 字段，直接返回整个响应数据
        if ('success' in res) {
            return res;
        }

        // 对于其他 API 继续使用 code 判断
        // if (res.code !== 200) {
        //     // 如果是401错误，清除token
        //     if (res.code === 401) {
        //         removeAuthToken();
        //     }
        //     Message.error(res.message || '请求失败');
        //     return Promise.reject(new Error(res.message || '请求失败'));
        // }

        return res;
    },
    error => {
        // 处理响应错误
        console.error('响应错误:', error);

        // 如果是401错误，清除token
        if (error.response && error.response.status === 401) {
            removeAuthToken();
        }

        // Message.error(error.message || '请求失败');
        return Promise.reject(error);
    }
);

export default service;
