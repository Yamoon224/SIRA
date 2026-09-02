import type { CvDraft } from "@/lib/api/cv.service"

/**
 * Clés qui ne comptent pas comme du contenu saisi : elles sont pré-remplies par
 * le formulaire, leur seule présence ne signifie pas que l'utilisateur a
 * commencé son CV.
 */
const CLES_NON_SIGNIFIANTES = new Set(["indicatif"])

/**
 * `GET /me/cv` crée la ligne si elle n'existe pas : la présence d'un brouillon
 * ne suffit donc pas à conclure qu'il y a quelque chose à reprendre, il faut
 * regarder le contenu.
 */
export function brouillonNonVide(draft: CvDraft | null | undefined): boolean {
    const data = draft?.data
    if (!data) return false

    return Object.entries(data).some(([cle, valeur]) => {
        if (CLES_NON_SIGNIFIANTES.has(cle)) return false
        if (typeof valeur === "string") return valeur.trim() !== ""
        if (Array.isArray(valeur)) return valeur.length > 0
        return false
    })
}

/**
 * « à 14:32 » le jour même, « le 2 sept. à 14:32 » au-delà : afficher une heure
 * seule sur un brouillon vieux de plusieurs jours induirait en erreur.
 */
export function formatDerniereSauvegarde(iso: string | null | undefined): string {
    if (!iso) return ""
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ""

    const heure = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    const memeJour = date.toDateString() === new Date().toDateString()
    if (memeJour) return `à ${heure}`

    return `le ${date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} à ${heure}`
}
