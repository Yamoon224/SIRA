"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/** Tailles de page proposées partout dans l'application. */
export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100] as const

/** Taille de page par défaut des listes paginées. */
export const DEFAULT_PAGE_SIZE = 10

interface DataPaginationProps {
    /** Page courante, indexée à partir de 1. */
    page: number
    totalPages: number
    /** Nombre total d'éléments, toutes pages confondues. */
    total: number
    /** Nombre d'éléments réellement affichés sur la page courante. */
    currentCount: number
    pageSize: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
    disabled?: boolean
    className?: string
}

/**
 * Pagination unique de l'application, en trois blocs :
 * « éléments affichés / total », navigation « Page n/N », puis choix de la
 * taille de page. Le composant ne fait que restituer l'état ; c'est la page
 * appelante qui recharge ses données.
 */
export function DataPagination({
    page,
    totalPages,
    total,
    currentCount,
    pageSize,
    onPageChange,
    onPageSizeChange,
    disabled = false,
    className,
}: DataPaginationProps) {
    // Une liste vide n'a rien à paginer, mais on garde le sélecteur dès qu'il y
    // a des données : l'utilisateur doit pouvoir élargir la page.
    if (total === 0) return null

    const safeTotalPages = Math.max(1, totalPages)
    const atFirst = page <= 1
    const atLast = page >= safeTotalPages

    const navButton =
        "flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted-foreground"

    return (
        <div
            className={cn(
                "mt-6 flex flex-col items-center justify-between gap-3 text-[12px] text-muted-foreground sm:flex-row",
                className,
            )}
        >
            <span aria-label={`${currentCount} éléments affichés sur ${total}`}>
                <span className="font-medium text-foreground">{currentCount}</span> / {total}
            </span>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={disabled || atFirst}
                    aria-label="Page précédente"
                    className={navButton}
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <span aria-live="polite">
                    Page <span className="font-medium text-foreground">{page}</span>/{safeTotalPages}
                </span>

                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={disabled || atLast}
                    aria-label="Page suivante"
                    className={navButton}
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <Select
                value={String(pageSize)}
                onValueChange={(v) => onPageSizeChange(Number(v))}
                disabled={disabled}
            >
                <SelectTrigger className="h-8 w-[76px] text-[12px]" aria-label="Éléments par page">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                            {size}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
