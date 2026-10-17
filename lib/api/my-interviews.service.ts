import { apiRequest } from "@/lib/api-client-http"

/**
 * Entretiens du candidat authentifié (GORIYA Meet ou présentiel), tous
 * recruteurs confondus - lecture seule, pour le calendrier « Mes rendez-vous ».
 */

export type MyInterviewType = "PHONE" | "VIDEO" | "ONSITE"
export type MyInterviewStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"

export interface IMyInterview {
    id: string
    type: MyInterviewType
    typeLabel: string
    /** Date-heure ISO avec décalage : à afficher en heure locale. */
    scheduledAt: string
    endsAt: string
    durationMinutes: number
    location: string | null
    status: MyInterviewStatus
    companyName: string | null
    jobOfferTitle: string | null
    /** Entretien en visio : salle GORIYA Meet, rejointe via /calls/{id}/join. */
    callSession: { id: string; status: "SCHEDULED" | "ACTIVE" | "ENDED" } | null
}

const unwrap = <T,>(res: unknown): T => ((res as { data?: T })?.data ?? res) as T

export const myInterviewsService = {
    list: async () => unwrap<IMyInterview[]>(await apiRequest({ endpoint: "/me/interviews", method: "GET" })),
}
