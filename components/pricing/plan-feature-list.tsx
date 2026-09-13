import { Check, X } from "lucide-react"
import { USER_PLAN_FEATURE_MATRIX, type PlanFeatureRow } from "@/lib/pricing-feature-matrix"

interface PlanFeatureListProps {
    /** Doit correspondre à `SubscriptionPlan.name` ("Grouilleur" | "Standard" | "Premium"). */
    planName: string
    className?: string
}

/**
 * Liste complète des fonctionnalités de la grille tarifaire (voir
 * lib/pricing-feature-matrix.ts), une ligne par fonctionnalité - cochée en
 * vert si incluse dans `planName`, barrée d'une croix rouge sinon. Remplace
 * l'ancienne liste `plan.features` (qui n'affichait que les fonctionnalités
 * incluses, sans comparaison entre forfaits).
 */
export function PlanFeatureList({ planName, className }: PlanFeatureListProps) {
    const rows: PlanFeatureRow[] = USER_PLAN_FEATURE_MATRIX

    return (
        <ul className={className ?? "space-y-2.5"}>
            {rows.map((row) => {
                const value = row.values[planName as keyof PlanFeatureRow["values"]] ?? false
                const included = value !== false

                return (
                    <li
                        key={row.label}
                        className={`flex items-start gap-2 text-[13px] leading-snug ${
                            included ? "text-foreground/80" : "text-muted-foreground/50"
                        }`}
                    >
                        {included ? (
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-500" />
                        ) : (
                            <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500 dark:text-red-500/80" />
                        )}
                        <span>
                            {row.label}
                            {typeof value === "string" && (
                                <span className="text-muted-foreground"> - {value}</span>
                            )}
                        </span>
                    </li>
                )
            })}
        </ul>
    )
}
