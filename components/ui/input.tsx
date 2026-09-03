import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Types dont la saisie passe par un sélecteur natif (calendrier / horloge).
 * Chrome n'ouvre ce sélecteur que si l'on clique sur sa petite icône : le reste
 * du champ ne réagit pas, et l'utilisateur croit le champ inerte. On force donc
 * l'ouverture au clic, quel que soit l'endroit cliqué.
 */
const TYPES_A_SELECTEUR = new Set(['date', 'datetime-local', 'month', 'week', 'time'])

function Input({ className, type, onClick, ...props }: React.ComponentProps<'input'>) {
    const aUnSelecteur = !!type && TYPES_A_SELECTEUR.has(type)

    const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
        onClick?.(event)

        if (!aUnSelecteur || event.defaultPrevented) return

        const champ = event.currentTarget as HTMLInputElement & { showPicker?: () => void }
        if (champ.disabled || champ.readOnly || typeof champ.showPicker !== 'function') return

        try {
            champ.showPicker()
        } catch {
            // Firefox/Safari ou iframe cross-origin : le comportement natif prend le relais.
        }
    }

    return (
        <input
            type={type}
            data-slot="input"
            onClick={handleClick}
            className={cn(
                'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-full border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                aUnSelecteur && 'cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer',
                className,
            )}
            {...props}
        />
    )
}

export { Input }
