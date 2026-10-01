import type { CVProfile } from "@/lib/@types/openai"
import { cvProfileService } from "@/lib/api/cv-profile.service"
import { notificationService } from "@/lib/api/notification.service"
import { userService } from "@/lib/api/user.service"

/**
 * Parcours « analyse de CV → notifications → inscription » : le visiteur n'a
 * pas encore de compte quand il valide son profil et ses préférences. On les
 * garde dans le navigateur, puis on les envoie au backend dès qu'une session
 * existe (voir syncPendingOnboarding, appelée après chaque connexion).
 */
const PROFILE_KEY = "goriya_cv_profile"
const NOTIFICATIONS_KEY = "goriya_cv_notifications"
const PHOTO_KEY = "goriya_cv_photo"

export type NotificationPrefs = { applications: boolean; emplois: boolean; recommandations: boolean }

function read<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key)
        return raw ? (JSON.parse(raw) as T) : null
    } catch {
        return null
    }
}

/** Stockage indisponible ou plein (navigation privée, photo trop lourde) : le parcours continue sans. */
function write(key: string, value: unknown): boolean {
    try {
        localStorage.setItem(key, JSON.stringify(value))
        return true
    } catch {
        return false
    }
}

function remove(key: string) {
    try {
        localStorage.removeItem(key)
    } catch {
        // rien à nettoyer
    }
}

export const getPendingProfile = () => read<CVProfile>(PROFILE_KEY)
export const setPendingProfile = (profile: CVProfile) => write(PROFILE_KEY, profile)
export const setPendingNotifications = (prefs: NotificationPrefs) => write(NOTIFICATIONS_KEY, prefs)

export function setPendingPhoto(file: File): Promise<boolean> {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(write(PHOTO_KEY, { name: file.name, dataUrl: reader.result }))
        reader.onerror = () => resolve(false)
        reader.readAsDataURL(file)
    })
}

export function clearPendingOnboarding() {
    remove(PROFILE_KEY)
    remove(NOTIFICATIONS_KEY)
    remove(PHOTO_KEY)
}

/**
 * Envoie au backend ce que le visiteur a validé avant d'avoir un compte.
 * Chaque élément n'est retiré du navigateur qu'une fois enregistré : un échec
 * sera retenté à la prochaine connexion. Ne lève jamais - la connexion ne doit
 * pas échouer à cause de cette étape.
 */
export async function syncPendingOnboarding(): Promise<void> {
    const profile = getPendingProfile()
    if (profile) {
        try {
            await cvProfileService.save(profile)
            const identity: { name?: string; title?: string; phone?: string } = {}
            if (profile.fullName) identity.name = profile.fullName
            if (profile.title) identity.title = profile.title
            if (profile.phone) identity.phone = profile.phone
            if (Object.keys(identity).length > 0) await userService.updateMyProfile(identity)
            remove(PROFILE_KEY)
        } catch (error) {
            console.error("[cv-onboarding] profil non enregistré:", error)
        }
    }

    const prefs = read<NotificationPrefs>(NOTIFICATIONS_KEY)
    if (prefs) {
        try {
            await notificationService.updateSettings(prefs)
            remove(NOTIFICATIONS_KEY)
        } catch (error) {
            console.error("[cv-onboarding] préférences de notification non enregistrées:", error)
        }
    }

    const photo = read<{ name: string; dataUrl: string }>(PHOTO_KEY)
    if (photo?.dataUrl) {
        try {
            const blob = await (await fetch(photo.dataUrl)).blob()
            await userService.uploadAvatar(new File([blob], photo.name || "photo", { type: blob.type }))
            remove(PHOTO_KEY)
        } catch (error) {
            console.error("[cv-onboarding] photo de profil non enregistrée:", error)
        }
    }
}
