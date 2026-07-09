declare global {
    interface Window {
        openKkiapayWidget?: (options: {
            amount: number
            key?: string
            sandbox?: boolean
            data?: string
        }) => void
        addSuccessListener?: (callback: (response: { transactionId: string }) => void) => void
        addFailedListener?: (callback: (response: unknown) => void) => void
    }
}

export const KKIAPAY_WIDGET_SRC = "https://cdn.kkiapay.me/k.js"

// Le paiement Kkiapay s'initie côté client via ce widget (clé publique) —
// le backend ne fait que valider le plan et vérifier la transaction ensuite.
export function openKkiapayWidget(params: { amount: number; clientReference: string }) {
    if (typeof window === "undefined" || !window.openKkiapayWidget) {
        throw new Error("Le widget de paiement Kkiapay n'est pas encore chargé.")
    }
    window.openKkiapayWidget({
        amount: params.amount,
        key: process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY,
        sandbox: process.env.NEXT_PUBLIC_KKIAPAY_SANDBOX !== "false",
        data: params.clientReference,
    })
}
