/** Formats de CV acceptés par l'analyse IA : PDF et Word (.docx) uniquement. */
export const CV_ACCEPT = ".pdf,.docx"

/**
 * Plafond d'envoi : au-delà de ~4,5 Mo, l'hébergeur rejette la requête avant
 * même qu'elle n'atteigne /api/analyse-cv.
 */
export const CV_MAX_SIZE = 4 * 1024 * 1024

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

/**
 * Message d'erreur si le fichier ne peut pas être analysé, `null` s'il convient.
 * L'extension sert de repli : certains mobiles envoient un type MIME vide.
 */
export function cvFileError(file: File): string | null {
    const type = file.type.toLowerCase()
    const name = file.name.toLowerCase()
    const isPdf = type === "application/pdf" || name.endsWith(".pdf")
    const isDocx = type === DOCX_MIME || name.endsWith(".docx")

    if (!isPdf && !isDocx) {
        return type === "application/msword" || name.endsWith(".doc")
            ? "L'ancien format Word (.doc) n'est pas lisible. Enregistre ton CV en .docx ou en PDF."
            : "Format non supporté. Utilise un CV au format PDF ou Word (.docx)."
    }
    if (file.size > CV_MAX_SIZE) {
        return "Le fichier est trop volumineux (4 Mo maximum)."
    }
    return null
}

/**
 * Message à afficher quand l'appel d'analyse échoue. Une coupure réseau fait
 * lever à `fetch` une TypeError au message technique (« Failed to fetch »).
 */
export function analysisErrorMessage(error: unknown): string {
    if (error instanceof TypeError) {
        return "La connexion a été interrompue pendant l'analyse. Vérifie ta connexion et réessaie."
    }
    // Réponse non JSON (page d'erreur de l'hébergeur) : le détail technique n'aide pas l'utilisateur.
    if (error instanceof SyntaxError) {
        return "L'analyse n'a pas abouti. Réessaie dans un instant."
    }
    return error instanceof Error && error.message ? error.message : "L'analyse n'a pas abouti. Réessaie dans un instant."
}
