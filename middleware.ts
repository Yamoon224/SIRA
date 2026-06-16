import { NextResponse, NextRequest } from 'next/server'

const PUBLIC_PREFIXES = [
    '/',
    '/auth',
    '/explorer-emplois',
    '/explorer-entreprises',
    '/api',
    '/_next',
    '/favicon',
    '/images',
    '/icon',
]

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow public paths
    const isPublic = PUBLIC_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
    )
    if (isPublic) return NextResponse.next()

    // Check auth cookie
    const authCookie = request.cookies.get('auth')?.value
    if (!authCookie) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/signin'
        url.searchParams.set('from', pathname)
        return NextResponse.redirect(url)
    }

    // Optionally validate role from cookie
    try {
        const auth = JSON.parse(authCookie)
        const role = auth?.user?.role
        if (role && role !== 'USER') {
            const url = request.nextUrl.clone()
            url.pathname = '/auth/signin'
            url.searchParams.set('error', 'unauthorized')
            return NextResponse.redirect(url)
        }
    } catch {
        // Cookie malformé → forcer reconnexion
        const url = request.nextUrl.clone()
        url.pathname = '/auth/signin'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.ico).*)'],
}
