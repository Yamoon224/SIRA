/**
 * URLs publiques des fiches entreprise et offre.
 *
 * Le backend expose désormais un `slug` sur les deux entités et ses routes de
 * détail acceptent indifféremment le slug ou l'uuid : on privilégie le slug,
 * et on retombe sur l'id quand l'objet vient d'une réponse antérieure au slug
 * (ou d'un endpoint qui ne le renvoie pas encore).
 */

type Identifiable = { id?: string | null; slug?: string | null } | null | undefined

/** Segment d'URL à utiliser pour une entité : son slug, sinon son uuid. */
export function publicRef(entity: Identifiable): string | null {
    return entity?.slug || entity?.id || null
}

export function companyHref(company: Identifiable): string {
    const ref = publicRef(company)
    return ref ? `/explorer-entreprises/${ref}` : "/explorer-entreprises"
}

export function jobHref(job: Identifiable): string {
    const ref = publicRef(job)
    return ref ? `/explorer-emplois/${ref}` : "/explorer-emplois"
}
