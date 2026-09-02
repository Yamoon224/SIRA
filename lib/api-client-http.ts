import { resolveToken } from './utils';
import { RequestOptions } from '@/lib/@types/api';
import { BACKEND_URL, BACKEND_TIMEOUT_MS } from '@/lib/backend-url';
import axios, { AxiosRequestConfig } from 'axios';

const API_BASE_URL = BACKEND_URL;

export async function apiRequest<T>({ endpoint, method = 'GET', data, params, silent = false, skipAuth = false }: RequestOptions): Promise<T> {
    try {
        // Les endpoints publics (connexion, inscription, retour Google/LinkedIn)
        // n'ont pas de token à joindre. Y appeler resolveToken() n'est pas
        // seulement inutile : ça déclenche /api/auth/session, donc le callback
        // `jwt` de NextAuth et potentiellement un refresh côté serveur — une
        // dépendance qui n'a rien à faire dans un parcours de connexion.
        const resolvedToken = skipAuth ? undefined : await resolveToken();

        const config: AxiosRequestConfig = {
            url: `${API_BASE_URL}${endpoint}`,
            method,
            headers: {},
            data,
            params,
            timeout: BACKEND_TIMEOUT_MS,
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
