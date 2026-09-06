import type { ResumeSource } from "@/lib/api/resume.service"

/** Octets → « 1,2 Mo », pour la ligne d'un CV dans une liste. */
export function formatTailleFichier(octets: number): string {
    if (!octets) return ""
    const mo = octets / (1024 * 1024)
    return mo >= 1 ? `${mo.toFixed(1)} Mo` : `${Math.round(octets / 1024)} Ko`
}

/**
 * Un CV « builder » vient du créateur de CV, un CV « upload » d'un fichier
 * déposé : la liste « Mes CV » le dit, sinon deux PDF identiques en apparence
 * ne se distinguent plus.
 */
export const LIBELLE_SOURCE: Record<ResumeSource, string> = {
    builder: "Créé sur Goriya",
    upload: "Ajouté",
}

/** « 4 sept. 2026 » — date de dépôt affichée sous le nom du CV. */
export function formatDateCourte(iso: string | null | undefined): string {
    if (!iso) return ""
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ""
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
}
