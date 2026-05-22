import { getToken } from 'next-auth/jwt';
import { NextResponse, NextRequest } from 'next/server';
import { isPublicRoute, redirectToLogin } from '@/lib/utils';

const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.NEXT_AUTH_SECRET;

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ✅ routes publiques
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    // ✅ récupérer le token JWT côté middleware
    const token = await getToken({
        req: request,
        secret: authSecret,
    });

    // ✅ si pas de token, redirige vers /auth/signin
    if (!token) {
        return redirectToLogin(request);
    }

    return NextResponse.next();
}

// ✅ Config matcher pour exclure les fichiers statiques et routes auth
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|manifest.json|service-worker.js|icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|auth|api/auth|auth/signout).*)',
    ],
};