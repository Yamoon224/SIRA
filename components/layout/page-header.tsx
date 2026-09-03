import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type PageHeaderProps = {
    title: ReactNode
    /** Sous-titre facultatif, aligné sous le titre. */
    description?: ReactNode
    /** Boutons rangés à droite du titre (à gauche sur mobile, sous le titre). */
    actions?: ReactNode
    className?: string
}

/**
 * En-tête des pages de l'espace connecté : un titre souligné d'un filet, comme
 * sur /nouveau-document. Chaque page redéclarait son titre à sa façon — filet
 * pour certaines, rien pour les autres — d'où ce composant unique.
 *
 * Le filet court sur toute la largeur du contenu et le titre s'aligne dessus :
 * contrairement à /nouveau-document, l'en-tête ne rajoute pas de retrait
 * horizontal, sinon le titre serait décalé par rapport au contenu en dessous.
 */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
    return (
        <div
            className={cn(
                "mb-6 flex flex-col gap-3 border-b border-[#d9dfea] dark:border-border pb-4 sm:flex-row sm:items-center sm:justify-between",
                className,
            )}
        >
            <div className="min-w-0">
                <h1 className="text-2xl sm:text-[32px] font-semibold leading-none text-[#1b2331] dark:text-foreground">{title}</h1>
                {description ? (
                    <p className="mt-2 text-[13px] text-[#7f8796] dark:text-muted-foreground">{description}</p>
                ) : null}
            </div>
            {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
    )
}
