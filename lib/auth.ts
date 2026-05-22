import { JWT } from "next-auth/jwt"
import { authService } from "./api/auth.service";
import CredentialsProvider from "next-auth/providers/credentials";
import { DefaultUser, DefaultSession, User, Session } from "next-auth";

const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.NEXT_AUTH_SECRET;

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
    }

    interface User extends DefaultUser {
        id: string
        name: string
        email: string
        role: string
        access_token: string
    }
}

// 🔹 NextAuth options (tu peux aussi les mettre dans un fichier séparé `auth.ts`)
export const authOptions = {
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
            if (user) {
                token.access_token = user.access_token
                token.role = user.role
                token.id = user.id
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
            return session
        },
    }
};