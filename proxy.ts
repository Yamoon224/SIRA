import { getToken } from 'next-auth/jwt';
import { NextResponse, NextRequest } from 'next/server';
import { isPublicRoute, redirectToLogin } from '@/lib/utils';

const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.NEXT_AUTH_SECRET;

// Next.js 16 a renommé la convention "middleware" en "proxy" (le nom de fichier "middleware.ts"
// est désormais déprécié — voir https://nextjs.org/docs/messages/middleware-to-proxy). Ce fichier
// doit donc s'appeler proxy.ts et exporter une fonction nommée "proxy" pour être exécuté.
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ✅ routes publiques
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    // ✅ récupérer le token JWT côté proxy (session NextAuth, source unique de vérité)
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

// ✅ Config matcher pour exclure les fichiers statiques, les routes auth et TOUTES les routes API
// (les routes /api/* gèrent elles-mêmes leur authentification en interne, via getServerSession)
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|manifest.json|service-worker.js|icon|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mov|m4v|mp3)$|auth|auth/signout).*)',
    ],
};