// Connexion / inscription LinkedIn — « Sign In with LinkedIn using OpenID Connect ».
//
// LinkedIn n'expose pas d'équivalent de Google Identity Services : pas de SDK
// navigateur qui renvoie un jeton d'identité (cf. lib/google-auth.ts). Le seul
// parcours supporté est la redirection OAuth 2.0 :
//
//   1. on redirige vers LinkedIn avec un `state` anti-CSRF (ci-dessous) ;
//   2. LinkedIn renvoie l'utilisateur sur /auth/linkedin/callback?code=...&state=... ;
//   3. cette page rejoue le `state`, puis poste le `code` au backend, seul
//      détenteur du client_secret, qui l'échange contre le profil LinkedIn.
//
// Le `code` seul ne prouve rien tant qu'il n'a pas été échangé côté serveur :
// aucune donnée de profil ne transite par le navigateur.

export const LINKEDIN_CLIENT_ID = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || ""

const AUTHORIZE_URL = "https://www.linkedin.com/oauth/v2/authorization"
const STATE_KEY = "linkedin_oauth_state"

// `email` n'est renvoyé par /v2/userinfo que si ce scope est accordé — sans lui
// le backend ne peut pas rattacher (ou créer) le compte.
const SCOPES = "openid profile email"

// Doit correspondre au pixel près à une entrée de LINKEDIN_REDIRECT_URIS côté
// backend *et* à une « Authorized redirect URL » de l'app LinkedIn.
export const getLinkedInRedirectUri = () =>
    typeof window === "undefined" ? "" : `${window.location.origin}/auth/linkedin/callback`

const createState = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Redirige vers LinkedIn. Ne rend jamais la main (navigation sortante).
 */
export const signInWithLinkedIn = () => {
    if (typeof window === "undefined") return
    if (!LINKEDIN_CLIENT_ID) throw new Error("La connexion LinkedIn n'est pas configurée")

    const state = createState()
    sessionStorage.setItem(STATE_KEY, state)

    // URLSearchParams encode l'espace en `+` ; LinkedIn attend `%20` dans
    // `scope`. On encode donc chaque paramètre à la main.
    const params = [
        ["response_type", "code"],
        ["client_id", LINKEDIN_CLIENT_ID],
        ["redirect_uri", getLinkedInRedirectUri()],
        ["state", state],
        ["scope", SCOPES],
    ]
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&")

    window.location.href = `${AUTHORIZE_URL}?${params}`
}

/**
 * Vérifie le `state` renvoyé par LinkedIn contre celui émis avant la
 * redirection, et le consomme (usage unique).
 */
export const consumeLinkedInState = (returnedState: string | null): boolean => {
    if (typeof window === "undefined") return false
    const expected = sessionStorage.getItem(STATE_KEY)
    sessionStorage.removeItem(STATE_KEY)
    return Boolean(expected) && expected === returnedState
}
