import { JWT } from "next-auth/jwt"
import { authService } from "./api/auth.service";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { DefaultUser, DefaultSession, User, Session } from "next-auth";

const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.NEXT_AUTH_SECRET;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://goriya-backend-production.up.railway.app";

// 🔹 Étendre les types NextAuth
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            access_token: string;
        } & DefaultSession["user"];
        error?: "RefreshAccessTokenError";
    }

    interface User extends DefaultUser {
        id: string
        name: string
        email: string
        role: string
        access_token: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string
        role?: string
        access_token?: string
        accessTokenExpires?: number
        error?: "RefreshAccessTokenError"
    }
}

// Le token backend (tymon/jwt-auth) expire au bout de JWT_TTL (60 min par
// défaut), alors que la session NextAuth vit 30 jours : sans rotation, toute
// requête authentifiée renvoyait "Unauthorized" une heure après la connexion.
// On lit l'échéance directement dans le JWT et on le rafraîchit un peu avant.
const REFRESH_MARGIN_MS = 5 * 60 * 1000

function jwtExpiresAtMs(jwt?: string): number {
    if (!jwt) return 0
    try {
        const payload = jwt.split(".")[1]
        const json = JSON.parse(
            Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
        )
        return typeof json.exp === "number" ? json.exp * 1000 : 0
    } catch {
        return 0
    }
}

async function refreshBackendToken(currentToken: string): Promise<string> {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: "POST",
        headers: { Authorization: `Bearer ${currentToken}` },
    })
    if (!res.ok) throw new Error(`refresh failed with status ${res.status}`)
    const data = await res.json()
    const token = (data as any)?.token ?? (data as any)?.data?.token
    if (!token) throw new Error("no token in refresh response")
    return token as string
}

// 🔹 NextAuth options (tu peux aussi les mettre dans un fichier séparé `auth.ts`)
export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const data = await authService.login({
                        email: credentials.email as string,
                        password: credentials.password as string,
                    });

                    console.log("[authorize] API response:", JSON.stringify(data));

                    // Supporte { data: { access_token, user } } et { access_token, user } directement
                    const payload = (data as any)?.data ?? data as any;

                    if (!payload?.access_token || !payload?.user) {
                        console.error("[authorize] Unexpected response structure:", data);
                        return null;
                    }

                    return {
                        id: payload.user.id,
                        name: payload.user.name,
                        email: payload.user.email,
                        role: payload.user.role,
                        access_token: payload.access_token,
                    };
                } catch (error: any) {
                    console.error("[authorize] Login failed:", error?.message ?? error);
                    // Email non vérifié : on remonte un code d'erreur distinct pour
                    // que la page de connexion ouvre la modale OTP (le backend vient
                    // de renvoyer un nouveau code par email).
                    if (error?.message === "EMAIL_NOT_VERIFIED" || error?.statusCode === 403) {
                        throw new Error("EMAIL_NOT_VERIFIED");
                    }
                    return null;
                }
            },
        }),
        // 🔹 Provider "token" : permet d'établir une session NextAuth (httpOnly) pour les flux
        // qui obtiennent un access_token directement du backend sans passer par le formulaire
        // email/mot de passe (inscription, connexion Google, vérification OTP).
        // Le token est revalidé auprès du backend (jamais l'utilisateur fourni par le client) :
        // on ne fait jamais confiance à des données utilisateur envoyées telles quelles par le client.
        CredentialsProvider({
            id: "token",
            name: "Token",
            credentials: {
                token: { label: "Token", type: "text" },
            },
            async authorize(credentials) {
                const token = credentials?.token as string | undefined;
                if (!token) return null;

                try {
                    // /admin/auth/profile n'est en réalité restreinte à aucun
                    // rôle particulier (voir AdminAuthController) — /user/profile
                    // n'existe pas côté backend.
                    const res = await fetch(`${BACKEND_URL}/admin/auth/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) return null;

                    const data = await res.json();
                    const userPayload = (data as any)?.data ?? data;

                    if (!userPayload?.id) return null;

                    return {
                        id: userPayload.id,
                        name: userPayload.name,
                        email: userPayload.email,
                        role: userPayload.role,
                        access_token: token,
                    };
                } catch (error: any) {
                    console.error("[authorize:token] Token validation failed:", error?.message ?? error);
                    return null;
                }
            },
        }),
    ],
    session: { strategy: "jwt" as const },
    secret: authSecret,
    // ✅ ICI tu ajoutes les callbacks
    callbacks: {
        async jwt({
            token,
            user,
        }: {
            token: JWT
            user?: User & { access_token?: string; role?: string }
        }) {
            // 1. Connexion initiale : on hydrate le token de session.
            if (user) {
                token.access_token = user.access_token
                token.role = user.role
                token.id = user.id
                token.accessTokenExpires = jwtExpiresAtMs(user.access_token)
                delete token.error
                return token
            }

            // 2. Token backend encore valide (marge de sécurité) : rien à faire.
            const expiresAt = (token.accessTokenExpires as number) || jwtExpiresAtMs(token.access_token as string)
            if (expiresAt && Date.now() < expiresAt - REFRESH_MARGIN_MS) {
                return token
            }

            // 3. Rotation avant expiration (ou juste après, dans la fenêtre refresh_ttl).
            try {
                const fresh = await refreshBackendToken(token.access_token as string)
                token.access_token = fresh
                token.accessTokenExpires = jwtExpiresAtMs(fresh)
                delete token.error
            } catch (err) {
                console.error("[auth] échec du rafraîchissement du token backend:", err)
                token.error = "RefreshAccessTokenError"
            }
            return token
        },

        async session({
            session,
            token,
        }: {
            session: Session
            token: JWT
        }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.access_token = token.access_token as string
            }
            if (token.error === "RefreshAccessTokenError") {
                session.error = "RefreshAccessTokenError"
            }
            return session
        },
    }
};