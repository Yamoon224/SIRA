import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
    title: "Hors ligne - Goriya",
    description: "Vous êtes actuellement hors ligne",
}

export default function OfflinePage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
            <Image src="/images/logo.png" alt="Goriya" width={140} height={40} priority className="dark:hidden" />
            <Image src="/images/logo-blanc.png" alt="Goriya" width={140} height={40} priority className="hidden dark:block" />
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold">Vous êtes hors ligne</h1>
                <p className="text-muted-foreground max-w-md text-sm">
                    Impossible de joindre Goriya pour le moment. Vérifiez votre connexion
                    internet, la page se rechargera automatiquement une fois de retour en ligne.
                </p>
            </div>
            <a href="/formations/hors-ligne" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                Voir mes leçons téléchargées
            </a>
        </div>
    )
}
