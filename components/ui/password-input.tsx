"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type">

/**
 * Champ mot de passe avec bouton œil pour afficher / masquer la saisie.
 * Même API qu'`Input` (hors `type`) : à utiliser pour tout champ mot de passe,
 * plutôt que de recopier le bouton et son état page par page.
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, disabled, ...props }, ref) => {
        const [visible, setVisible] = React.useState(false)

        return (
            <div className="relative">
                <Input
                    ref={ref}
                    type={visible ? "text" : "password"}
                    disabled={disabled}
                    className={cn("pr-10", className)}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    disabled={disabled}
                    aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    aria-pressed={visible}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        )
    },
)
PasswordInput.displayName = "PasswordInput"
