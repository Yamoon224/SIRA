import "./globals.css"
import type React from "react"
import { Suspense } from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SessionProvider } from "@/components/session-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "sonner"

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
    display: "swap",
})

export const metadata: Metadata = {
    title: "Goriya - Plateforme de recrutement",
    description: "Trouve ton emploi idéal avec Goriya",
    // generator: "v0.app",
    icons: {
        icon: [
            {
                url: '/favicon.png',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: '/favicon.png',
                media: '(prefers-color-scheme: dark)',
            },
            {
                url: '/favicon.png',
                type: 'image/png',
            },
        ],
        apple: '/apple-icon.png',
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body className={poppins.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <SessionProvider>
                        <AuthProvider>
                            <Suspense fallback={null}>
                                {children}
                            </Suspense>
                        </AuthProvider>
                    </SessionProvider>
                </ThemeProvider>
                <Analytics />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        className: "text-sm",
                    }}
                    richColors
                />
            </body>
        </html>
    )
}