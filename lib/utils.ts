import { twMerge } from 'tailwind-merge'
import { IUser } from '@/lib/@types/entities'
import { clsx, type ClassValue } from 'clsx'
import { NextRequest, NextResponse } from 'next/server'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Détermine si une route est publique (accessible sans authentification)
 */
export function isPublicRoute(pathname: string) {
    const exactPublicRoutes = [
        '/',
        '/emplois',
        '/explorer-entreprises',
        '/manifest.json',
        '/service-worker.js',
        '/favicon.ico',
    ];

    const publicPrefixes = [
        '/auth',
        '/explorer-entreprises',
        '/images',
        '/icon',
    ];

    if (
        pathname.startsWith('/_next/static') ||
        pathname.startsWith('/_next/image')
    ) {
        return true;
    }

    if (exactPublicRoutes.includes(pathname)) {
        return true;
    }

    return publicPrefixes.some(prefix =>
        pathname.startsWith(prefix + '/')
    );
}

export function redirectToLogin(request: NextRequest) {
    const response = NextResponse.redirect(new URL('/auth/signin', request.url))

    // ❌ Supprime le cookie invalide
    response.cookies.delete('access_token')

    return response
}

export const getAuth = (): { token: string; user: IUser } | null => {
    const stored = localStorage.getItem("auth")
    if (!stored) return null
    return JSON.parse(stored)
}

/** Résout le token JWT : priorité au token explicite, sinon localStorage (client) ou cookie (server). */
export async function resolveToken(): Promise<string | undefined> {
    // Côté client → localStorage
    if (typeof window !== 'undefined') {
        return getAuth()?.token ?? undefined;
    }

    // Côté serveur → cookie "auth" (import dynamique pour éviter next/headers côté client)
    try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const authCookie = cookieStore.get('auth')?.value;
        if (authCookie) {
            const auth = JSON.parse(authCookie);
            return auth.token ?? undefined;
        }
    } catch {}

    return undefined;
}

export function formatDate(
    value: string | Date,
    type: 'date' | 'datetime' | 'time' = 'date',
    locale: string = 'fr-FR'
): string {
    if (!value) return ''

    const date = new Date(value)

    if (isNaN(date.getTime())) {
        return ''
    }

    const optionsMap: Record<typeof type, Intl.DateTimeFormatOptions> = {
        date: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        },
        datetime: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        },
        time: {
            hour: '2-digit',
            minute: '2-digit',
        },
    }

    return new Intl.DateTimeFormat(locale, optionsMap[type]).format(date)
}


export function formatFileUrl(file: string | null | undefined): string {
    if (!file) return ''
    if (file.startsWith('http://') || file.startsWith('https://')) return file
    return `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://goriya-backend-production.up.railway.app'}/storage/${file}`
}

export function formatAmount(
    value: number | string,
    currency: string = 'XOF',   // Devise par défaut
    locale: string = 'fr-FR',  // Localisation par défaut
    minimumFractionDigits: number = 0,
    maximumFractionDigits: number = 0
): string {
    if (value === null || value === undefined || value === '') return ''

    const amount = typeof value === 'string' ? parseFloat(value) : value

    if (isNaN(amount)) return ''

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits,
        maximumFractionDigits
    }).format(amount)
}