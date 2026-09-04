// Connexion / inscription Google — « Google Identity Services » (GIS).
//
// GIS valide l'ORIGINE JavaScript de la page appelante (window.location.origin)
// contre la liste « Origines JavaScript autorisées » du client OAuth. Quand
// l'origine n'y figure pas, Google n'échoue pas côté SDK : il ouvre sa fenêtre
// puis affiche « Erreur 400 : origin_mismatch ». Le `callback` ci-dessous n'est
// alors JAMAIS appelé — l'ancienne version de ce fichier laissait donc la
// promesse en suspens pour toujours (spinner infini sur le bouton Google, aucun
// message d'erreur). Toutes les issues sont désormais couvertes :
// `error_callback` pour les échecs signalés par GIS, un garde-fou temporel pour
// celles qu'il ne signale pas, et un message explicite qui nomme l'origine à
// déclarer.
//
// Origines à déclarer dans Google Cloud Console (APIs & Services →
// Identifiants → client OAuth 2.0 « Application Web ») pour cette app :
//   https://goriya.net
//   https://www.goriya.net
//   http://localhost:3000            (développement)
// plus chaque domaine de prévisualisation Vercel réellement utilisé.
// Une origine = schéma + hôte + port, sans chemin ni slash final.

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

const GIS_SRC = "https://accounts.google.com/gsi/client"

// Certaines fenêtres Google (dont la page d'erreur origin_mismatch) ne rendent
// jamais la main au parent : sur mobile la « popup » devient un onglet, et sa
// fermeture ne déclenche pas `popup_closed`. Sans plafond, la promesse resterait
// en attente. 3 minutes laissent le temps de saisir un mot de passe + 2FA.
const SIGN_IN_TIMEOUT_MS = 180_000

export interface GoogleUser {
  id: string
  email: string
  name: string
  picture: string
  given_name: string
  family_name: string
}

export const getCurrentOrigin = () =>
  typeof window === "undefined" ? "" : window.location.origin

// Le script GIS ne doit être injecté qu'une fois : en mode strict React l'effet
// de montage s'exécute deux fois, ce qui empilait deux <script> identiques (et
// deux réinitialisations concurrentes du SDK).
let gisLoader: Promise<void> | null = null

export const initializeGoogleAuth = (): Promise<void> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Auth can only be initialized in the browser"))
  }

  if (!GOOGLE_CLIENT_ID) {
    return Promise.resolve() // silently skip if not configured
  }

  if (gisLoader) return gisLoader

  gisLoader = new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`)
    const script = existing ?? document.createElement("script")

    script.addEventListener("load", () => resolve())
    script.addEventListener("error", () => {
      gisLoader = null // permet un nouvel essai (coupure réseau, bloqueur…)
      reject(new Error("Failed to load Google Identity Services"))
    })

    if (!existing) {
      script.src = GIS_SRC
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  })

  return gisLoader
}

// GIS remonte ses échecs par `type`. Seul `popup_closed` correspond à une
// annulation volontaire : le mot-clé « cancelled » est conservé dans le message
// car l'appelant (page de connexion) s'en sert pour ne pas afficher de toast.
const describeError = (type: string | undefined): string => {
  switch (type) {
    case "popup_closed":
      return "Google Sign-In was cancelled"
    case "popup_failed_to_open":
      return "La fenêtre Google a été bloquée par le navigateur. Autorise les pop-ups pour ce site puis réessaie."
    default:
      return "La connexion Google a échoué. Réessaie."
  }
}

// Message affiché quand rien ne revient de Google : c'est la signature de
// origin_mismatch (origine non déclarée) vue depuis le navigateur.
const originHelp = () =>
  `La connexion Google n'a pas abouti. Si Google affiche « Erreur 400 : origin_mismatch », l'origine ${getCurrentOrigin()} doit être ajoutée aux « Origines JavaScript autorisées » du client OAuth dans Google Cloud Console.`

// Résout avec le `credential` brut (ID token JWT) renvoyé par Google.
// Ce jeton est vérifié côté serveur (POST /auth/google) : on ne décode plus
// l'email côté client pour l'envoyer tel quel — c'était contournable.
export const signInWithGoogle = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.google?.accounts?.id) {
      reject(new Error("Google Identity Services not loaded"))
      return
    }

    if (!GOOGLE_CLIENT_ID) {
      reject(new Error("La connexion Google n'est pas configurée"))
      return
    }

    // Un seul dénouement possible, quel que soit le chemin emprunté (succès,
    // error_callback, expiration) : les autres deviennent des no-op.
    let settled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let graceTimer: ReturnType<typeof setTimeout> | undefined
    let leftPage = false
    let container: HTMLDivElement | undefined

    // Sur mobile la fenêtre Google devient un onglet plein écran : notre page
    // passe en arrière-plan. Si elle redevient visible sans qu'aucun credential
    // ne soit arrivé, c'est que l'utilisateur a fermé l'onglet — annulation, ou
    // page d'erreur origin_mismatch. Inutile d'attendre les 3 minutes du
    // garde-fou : on tranche après un court délai de grâce, le temps que le
    // callback de GIS arrive s'il est en route.
    const onVisibility = () => {
      if (settled) return
      if (document.visibilityState === "hidden") {
        leftPage = true
        return
      }
      if (!leftPage || graceTimer) return
      // Impossible de distinguer ici une annulation volontaire d'un échec
      // origin_mismatch : les deux ramènent l'utilisateur sans credential. Le
      // message reste donc neutre — mais visible : après un aller-retour vers
      // une page d'erreur Google, ne rien afficher laisserait l'utilisateur sans
      // le moindre signal. Le diagnostic actionnable, lui, part en console.
      graceTimer = setTimeout(() => fail("Connexion Google interrompue. Réessaie."), 4_000)
    }

    const cleanup = () => {
      if (timer) clearTimeout(timer)
      if (graceTimer) clearTimeout(graceTimer)
      document.removeEventListener("visibilitychange", onVisibility)
      container?.remove()
      try {
        window.google?.accounts?.id?.cancel()
      } catch {
        /* le SDK peut avoir déjà été démonté */
      }
    }

    const succeed = (credential: string) => {
      if (settled) return
      settled = true
      cleanup()
      resolve(credential)
    }

    const fail = (message: string) => {
      if (settled) return
      settled = true
      cleanup()
      // Le message affiché reste volontairement neutre : la cause exacte n'est
      // connue que de la fenêtre Google. La console, elle, porte de quoi agir.
      console.warn(`[google-auth] ${message}\n${originHelp()}`)
      reject(new Error(message))
    }

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          if (response?.credential) succeed(response.credential as string)
          else fail("Aucun identifiant Google reçu")
        },
        // Appelé pour les échecs que GIS sait nommer (pop-up bloquée, fermée…).
        // origin_mismatch n'en fait pas partie : il est intercepté par le
        // garde-fou temporel ci-dessous.
        error_callback: (error: any) => fail(describeError(error?.type)),
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      container = document.createElement("div")
      container.style.display = "none"
      document.body.appendChild(container)

      window.google.accounts.id.renderButton(container, {
        theme: "outline",
        size: "large",
        type: "standard",
      })

      const button = container.querySelector("div[role='button']") as HTMLElement | null
      if (button) {
        button.click()
      } else {
        // Fallback to prompt if button rendering fails
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
            fail("Google Sign-In was cancelled or not displayed")
          }
        })
      }

      document.addEventListener("visibilitychange", onVisibility)
      timer = setTimeout(() => fail(originHelp()), SIGN_IN_TIMEOUT_MS)
    } catch (error) {
      console.error("[google-auth] Error initializing Google Sign-In:", error)
      fail("Failed to initialize Google Sign-In")
    }
  })
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google: any
  }
}
