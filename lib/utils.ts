import { twMerge } from 'tailwind-merge'
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
        '/manifest.json',
        '/service-worker.js',
        '/favicon.ico',
        '/offres',
        '/confidentialite',
        '/resultat-analyse-cv',
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


export function formatFileUrl(file: string | null | undefined): string {
    if (!file) return ''
    if (file.startsWith('http://') || file.startsWith('https://')) return file
    return `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://goriya-backend-production.up.railway.app'}/storage/${file}`
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