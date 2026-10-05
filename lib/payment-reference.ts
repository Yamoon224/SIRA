/**
 * Référence d'un paiement Paiement Pro au retour sur /auth/payment-success.
 *
 * L'URL de retour passe par le prestataire, qui peut l'abîmer (paramètres
 * accolés à la suite, URL tronquée) : on ne se fie donc pas au seul paramètre
 * `ref`. La référence est aussi mémorisée dans le navigateur avant de partir
 * payer, et toutes les pistes sont essayées dans l'ordre.
 */
const STORAGE_KEY = "goriya_payment_reference"
const MAX_AGE_MS = 24 * 60 * 60 * 1000

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
// Nos deux formats : « GRY » + ULID (actuel) et « userId_planId_timestamp ».
const REFERENCE_PATTERNS = [/GRY[0-9A-Z]{26}/, new RegExp(`${UUID}_(?:${UUID}|reset-[a-z_]+)_\\d{13}`, "i")]

type Params = { get: (name: string) => string | null }

export function rememberPaymentReference(reference: string | undefined | null) {
    if (!reference) return
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ reference, at: Date.now() }))
    } catch {
        // Stockage indisponible (navigation privée) : l'URL de retour suffira.
    }
}

function rememberedPaymentReference(): string | null {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")
        return saved?.reference && Date.now() - saved.at < MAX_AGE_MS ? String(saved.reference) : null
    } catch {
        return null
    }
}

export function forgetPaymentReference() {
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch {
        // Rien à nettoyer.
    }
}

/** Vrai si l'on revient d'une session Paiement Pro, même si `gateway` a été abîmé. */
export function isPaiementProReturn(params: Params): boolean {
    return (params.get("gateway") ?? "").startsWith("paiementpro") || !!params.get("ref") || !!params.get("referenceNumber")
}

/** Références à essayer, de la plus fiable à la moins fiable, sans doublon. */
export function paymentReferenceCandidates(params: Params): string[] {
    const candidates: (string | null | undefined)[] = []

    let href = window.location.href
    try {
        href = decodeURIComponent(href)
    } catch {
        // URL mal encodée : on cherche dans sa forme brute.
    }
    for (const pattern of REFERENCE_PATTERNS) candidates.push(href.match(pattern)?.[0])

    candidates.push(params.get("ref")?.split(/[?&#\s]/)[0], params.get("referenceNumber"), rememberedPaymentReference())

    return [...new Set(candidates.filter((c): c is string => !!c && c.trim() !== "").map((c) => c.trim()))]
}
