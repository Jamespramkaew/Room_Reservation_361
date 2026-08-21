import axios from 'axios'
import type { AxiosInstance } from 'axios'


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10)
const ENABLE_DEBUG = import.meta.env.VITE_ENABLE_DEBUG === 'true'


export const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})


axiosInstance.interceptors.request.use(
    (config) => {
        // Add auth token if exists
        const token = localStorage.getItem('authToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Debug logging
        if (ENABLE_DEBUG) {
            console.log('📤 Request:', {
                url: config.url,
                method: config.method,
                data: config.data,
            })
        }

        return config
    },
    (error) => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
    }
)

axiosInstance.interceptors.response.use(
    (response) => {

        if (ENABLE_DEBUG) {
            console.log('📥 Response:', {
                url: response.config.url,
                status: response.status,
                data: response.data,
            })
        }

        return response
    },
    (error) => {

        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('authToken')
            window.location.href = '/login'
        }

        if (error.response?.status === 403) {
            // Forbidden
            console.error('❌ Access Denied:', error.response.data)
        }

        if (error.response?.status === 404) {
            // Not Found
            console.error('❌ Resource Not Found:', error.response.data)
        }

        if (error.response?.status >= 500) {
            // Server Error
            console.error('❌ Server Error:', error.response.data)
        }

        if (ENABLE_DEBUG) {
            console.error('❌ Response Error:', {
                status: error.response?.status,
                url: error.config?.url,
                data: error.response?.data,
            })
        }

        return Promise.reject(error)
    }
)

export default axiosInstance
