import { alertToast } from '@/helper';
import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import Router from 'next/router';

export const JWT_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const TOKEN_PREFIX = 'Bearer ';

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
axios.defaults.withCredentials = false;
axios.defaults.timeout = 60000;

declare module 'axios' {
  export interface AxiosRequestConfig {
    _withAuth?: boolean;
    _retry?: boolean;
  }
}

axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config._withAuth) {
      const token = localStorage.getItem(JWT_KEY);
      if (token) {
        config.headers.Authorization = TOKEN_PREFIX + token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }[] = [];

const processQueue = (error: never | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      alertToast('error', "Network error, can't reach the server this time", 'NETWORK_ERROR');
      return Promise.reject(error);
    }

    if (!error.response) {
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    if (
      status === 401 &&
      !originalRequest._retry &&
      originalRequest._withAuth &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = TOKEN_PREFIX + token;
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (refreshToken) {
        try {
          const response = await axios.post(
            endpointUrl('/v1/auth/refresh'),
            {
              refreshToken,
            },
            { _withAuth: false },
          );

          if (response.data?.accessToken) {
            const { accessToken, refreshToken: newRefreshToken } = response.data;
            localStorage.setItem(JWT_KEY, accessToken);
            if (newRefreshToken) {
              localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
            }
            processQueue(null, accessToken);
            isRefreshing = false;
            originalRequest.headers.Authorization = TOKEN_PREFIX + accessToken;
            return axios(originalRequest);
          }
        } catch (refreshError: any) {
          const errorData = refreshError?.response?.data;
          processQueue(refreshError, null);
          isRefreshing = false;
          if (errorData?.message === 'INVALID_REFRESH_TOKEN' || refreshError.response?.status === 401) {
            localStorage.removeItem(JWT_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            Router.replace('/auth/login');
            return Promise.reject(refreshError);
          }
        }
      }

      isRefreshing = false;
      const token = localStorage.getItem(JWT_KEY);
      if (token || refreshToken) {
        localStorage.removeItem(JWT_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        Router.replace('/auth/login');
      }
      return Promise.reject(error);
    }

    let errorMsg: null | string = null;

    if (data?.message) {
      errorMsg = data.message;
    }

    if (errorMsg === null) {
      switch (status) {
        case 400:
          errorMsg = 'Bad Request. Please check your input.';
          break;
        case 404:
          errorMsg = 'The requested resource was not found.';
          break;
        case 500:
          errorMsg = 'Internal Server Error. Please try again later.';
          break;
        case 502:
          errorMsg = 'Bad Gateway. Please try again later.';
          break;
        case 503:
          errorMsg = 'Service Unavailable. Please try again later.';
          break;
        case 504:
          errorMsg = 'Gateway Timeout. Please try again later.';
          break;
        default:
          errorMsg = `An unexpected error occurred (Status Code: ${status}).`;
      }
    }

    if (status === 403) {
      return Promise.reject(error);
    }

    if (Array.isArray(errorMsg)) {
      errorMsg.forEach((msg) => {
        alertToast('error', msg, msg);
      });
    } else {
      alertToast('error', errorMsg, errorMsg);
    }

    return Promise.reject(error);
  },
);

export function endpointUrl(url = '') {
  return `${process.env.NEXT_PUBLIC_API_URL}${url.toString().replace(/^\//, '')}`;
}

export function getStaticEndpoint(url = '') {
  return `${process.env.NEXT_PUBLIC_STATIC_URL}${url.toString().replace(/^\//, '')}`;
}

export function httpGet(url: string, withAuth = false, params = {}, configs: AxiosRequestConfig = {}) {
  return axios.get(url, { ...configs, params, _withAuth: withAuth });
}

export const httpPost = (url: string, data: unknown, withAuth = false, configs: AxiosRequestConfig = {}) => {
  return axios.post(url, data, { ...configs, _withAuth: withAuth });
};

export const httpPut = (url: string, data: unknown, withAuth = false, configs: AxiosRequestConfig = {}) => {
  return axios.put(url, data, { ...configs, _withAuth: withAuth });
};

export const httpPatch = (url: string, data: unknown, withAuth = false, configs: AxiosRequestConfig = {}) => {
  return axios.patch(url, data, { ...configs, _withAuth: withAuth });
};

export function httpDelete(url: string, withAuth = false, params = {}, configs: AxiosRequestConfig = {}) {
  return axios.delete(url, { ...configs, params, _withAuth: withAuth });
}

export default axios;
