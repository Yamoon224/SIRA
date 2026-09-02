import { twMerge } from 'tailwind-merge'
import { clsx, type ClassValue } from 'clsx'
import { NextRequest, NextResponse } from 'next/server'
import { BACKEND_URL } from './backend-url'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Détermine si une route est publique (accessible sans authentification)
 */
export function isPublicRoute(pathname: string) {
    const exactPublicRoutes = [
        '/',
        '/manifest.json',
        '/service-worker.js',
        '/favicon.ico',
        '/offres',
        '/confidentialite',
        '/resultat-analyse-cv',
        '/cgu',
        '/mentions-legales',
        '/politique-protection-donnees',
    ];

    const publicPrefixes = [
        '/auth',
        '/explorer-emplois',
        '/explorer-entreprises',
        '/blog',
        '/a-propos',
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
        pathname === prefix || pathname.startsWith(prefix + '/')
    );
}

export function redirectToLogin(request: NextRequest) {
    const response = NextResponse.redirect(new URL('/auth/signin', request.url))

    // ❌ Supprime le cookie de session NextAuth invalide/expiré
    response.cookies.delete('next-auth.session-token')
    response.cookies.delete('__Secure-next-auth.session-token')

    return response
}

/**
 * Résout le token JWT à partir de l'unique source de vérité : la session NextAuth (httpOnly).
 * Plus aucune dépendance à localStorage ou à un cookie "auth" custom (voir contexts/auth-context.tsx).
 */
export async function resolveToken(): Promise<string | undefined> {
    // Côté client → session NextAuth (requête vers /api/auth/session)
    if (typeof window !== 'undefined') {
        try {
            const { getSession } = await import('next-auth/react');
            const session = await getSession();
            return (session?.user as any)?.access_token ?? undefined;
        } catch {
            return undefined;
        }
    }

    // Côté serveur → session NextAuth (import dynamique pour éviter de charger next-auth côté client)
    try {
        const { getServerSession } = await import('next-auth');
        const { authOptions } = await import('@/lib/auth');
        const session = await getServerSession(authOptions);
        return (session?.user as any)?.access_token ?? undefined;
    } catch {
        return undefined;
    }
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


const MEDIA_BASE_URL = BACKEND_URL.replace(/\/+$/, '')

/**
 * Résout un chemin de média renvoyé par l'API en URL absolue et servable.
 * Gère : chemins nus (`companies/x.png`), `/companies/x.png` (ancien format en
 * base), `/storage/…`, et URLs absolues dont le host est local/interne
 * (`localhost`, `127.0.0.1`, `*.railway.app`) — dans ce cas on ré-écrit le host
 * vers le backend public en gardant le chemin. Les vraies URLs externes
 * (données seed : unsplash, etc.) passent inchangées.
 */
export function formatFileUrl(file: string | null | undefined): string {
    if (!file) return ''
    const value = file.trim()
    if (!value) return ''

    if (/^https?:\/\//i.test(value)) {
        try {
            const u = new URL(value)
            const internal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(u.hostname) || u.hostname.endsWith('.railway.app')
            if (internal) return MEDIA_BASE_URL + u.pathname + u.search
            // Évite le blocage "mixed content" : force https pour les médias de l'API.
            if (u.protocol === 'http:' && u.pathname.startsWith('/storage/')) {
                u.protocol = 'https:'
                return u.toString()
            }
        } catch { /* ignore */ }
        return value
    }

    let path = '/' + value.replace(/^\/+/, '')
    if (!path.startsWith('/storage/')) path = '/storage' + path
    return MEDIA_BASE_URL + path
}

/** Met en majuscule la première lettre d'un texte, sans toucher au reste (pas de title case). */
export function capitalizeFirst(value: string | null | undefined): string {
    if (!value) return ''
    return value.charAt(0).toUpperCase() + value.slice(1)
}

/** Retire les doublons d'une liste en comparant un nom (insensible à la casse/aux espaces). */
export function dedupeByName<T extends { name: string }>(list: T[]): T[] {
    const seen = new Set<string>()
    return list.filter((item) => {
        const key = item.name.trim().toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
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