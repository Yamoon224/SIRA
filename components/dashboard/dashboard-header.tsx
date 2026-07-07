"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"

export function DashboardHeader() {
    const { user } = useAuth()

    const displayName = user?.name ?? "Utilisateur"
    const initials = displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Bonjour, {displayName}</h1>
                <p className="text-muted-foreground text-sm sm:text-base">Voici un aperçu de tes candidatures et offres d'emploi</p>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="text-left sm:text-right">
                    <p className="text-sm text-muted-foreground">Prochaine entrevue</p>
                    <p className="font-medium text-foreground">Aujourd'hui</p>
                </div>
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                    <AvatarImage src={user?.avatar ?? undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
            </div>
        </div>
    )
}
