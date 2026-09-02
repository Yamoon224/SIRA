import { Method } from "axios";

export interface IPaginationMeta {
    total: number
    page: number
    limit: number
    totalPages: number
}

// Types pour les réponses API
export interface ApiResponse<T> {
    data: T
    message?: string
    success: boolean
}

export interface IPaginatedResponse<T> {
    data: T[]
    meta: IPaginationMeta
}

export interface RequestOptions {
    endpoint: string;
    method?: Method; // GET, POST, PUT, PATCH, DELETE
    data?: any;      // body data pour POST/PUT/PATCH
    params?: any;    // query params pour GET
    silent?: boolean; // désactive les logs d'erreur pour les tentatives de fallback
    skipAuth?: boolean; // endpoint public : n'essaie pas de résoudre la session NextAuth
}