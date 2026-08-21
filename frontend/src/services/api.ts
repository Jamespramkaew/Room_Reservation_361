import axiosInstance from '../config/axios'
import type { AxiosRequestConfig } from 'axios'

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * Generic GET request
 */
export const get = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance.get<T>(url, config)
    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    }
  }
}

/**
 * Generic POST request
 */
export const post = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance.post<T>(url, data, config)
    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    }
  }
}

/**
 * Generic PUT request
 */
export const put = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance.put<T>(url, data, config)
    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    }
  }
}

/**
 * Generic DELETE request
 */
export const deleteRequest = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await axiosInstance.delete<T>(url, config)
    return {
      success: true,
      data: response.data,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    }
  }
}


