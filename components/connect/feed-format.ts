/** Initiales affichées quand un membre n'a pas de photo. */
export function initials(name?: string | null): string {
    return (name ?? "")
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?"
}

/** « à l'instant », « 5 min », « 3 h », « 2 j », « 3 sem. », puis la date. */
export function timeAgo(iso: string | null | undefined): string {
    if (!iso) return ""
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ""

    const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000))
    if (seconds < 60) return "à l'instant"
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) return `${minutes} min`
    const hours = Math.round(minutes / 60)
    if (hours < 24) return `${hours} h`
    const days = Math.round(hours / 24)
    if (days < 7) return `${days} j`
    if (days < 30) return `${Math.round(days / 7)} sem.`

    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
}

/** Octets → « 850 Ko », « 2,4 Mo ». */
export function formatBytes(bytes: number): string {
    if (!bytes) return ""
    const mo = bytes / (1024 * 1024)
    return mo >= 1 ? `${mo.toFixed(1).replace(".", ",")} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
    return `${count} ${count > 1 ? pluralForm : singular}`
}

/** Lien permanent d'un post, partageable. */
export function postPath(id: string): string {
    return `/connect/posts/${id}`
}
