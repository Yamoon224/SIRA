import { resolveToken } from './utils';
import { RequestOptions } from '@/lib/@types/api';
import axios, { AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://goriya-api.lunion-lab.com';

export async function apiRequest<T>({ endpoint, method = 'GET', data, params, silent = false }: RequestOptions): Promise<T> {
    try {
        const resolvedToken = await resolveToken();

        const config: AxiosRequestConfig = {
            url: `${API_BASE_URL}${endpoint}`,
            method,
            headers: {},
            data,
            params,
        };

        if (resolvedToken) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${resolvedToken}`,
            };
        }

        const response = await axios(config);
        return response.data as T;
    } catch (error: any) {
        if (!silent) {
            console.error(`[API ${method}] error on ${API_BASE_URL}${endpoint}:`, error.response?.data || error.message);
        }
        throw error.response?.data || error;
    }
}