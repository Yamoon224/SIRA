// Source unique de l'URL du backend Laravel.
//
// Elle était dupliquée dans six fichiers avec des valeurs de repli
// DIFFÉRENTES : les appels API partaient sur goriya-api.lunion-lab.com pendant
// que NextAuth (validation du token, refresh) tapait sur un ancien hôte
// Railway — et l'hôte réel est backend.goriya.net. Quand
// NEXT_PUBLIC_BACKEND_URL n'est pas défini, la moitié de l'app parlait donc à
// un backend hors service — et comme aucun de ces appels n'avait de timeout,
// ça se traduisait par des requêtes suspendues indéfiniment plutôt que par une
// erreur (spinner infini sur le retour LinkedIn).
export const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://backend.goriya.net"

// Aucun appel réseau ne doit pouvoir rester en attente pour toujours : sans
// plafond, un backend injoignable bloque l'UI sans jamais déclencher de
// gestionnaire d'erreur.
export const BACKEND_TIMEOUT_MS = 20_000
