/**
 * Destination d'une notification.
 *
 * Le backend porte désormais un `link` — un chemin relatif pointant sur la page
 * concernée, par exemple `/messages?conversation=<uuid>`. Les notifications
 * créées avant cette colonne n'en ont pas : on retombe alors sur le type, qui
 * suffit à atteindre la bonne page, à défaut du bon élément.
 */

const FALLBACK_PAR_TYPE: Record<string, string> = {
    MESSAGE: "/messages",
    APPLICATION_STATUS: "/mes-offres",
}

export function notificationHref(notification: { link?: string | null; type?: string | null }): string | null {
    const link = notification.link?.trim()
    // Un lien absolu venu d'ailleurs n'a rien à faire dans un router.push :
    // on n'accepte que les chemins internes.
    if (link && link.startsWith("/")) return link

    const type = (notification.type ?? "").toUpperCase()
    if (FALLBACK_PAR_TYPE[type]) return FALLBACK_PAR_TYPE[type]

    // Un type "SYSTEM" (ou inconnu) ne désigne aucune page : le clic se
    // contente alors de marquer la notification comme lue.
    return null
}
