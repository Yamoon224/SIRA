import type { CvContent } from "@/lib/api/cv.service"
import { CV_MODELE_PAR_DEFAUT, cvPdfFile } from "@/lib/cv-pdf"
import { INDICATIF_PAR_DEFAUT, separerIndicatif } from "@/lib/data/afrique"
import { resumeService, type IResume } from "@/lib/api/resume.service"
import type { IJobOffer } from "@/lib/@types/entities"

/** Erreur portant le drapeau « forfait insuffisant » renvoyé par /api/adapter-cv. */
export class AdaptationError extends Error {
    constructor(message: string, readonly requiresUpgrade = false) {
        super(message)
    }
}

const DIPLOMES = ["Bac", "BTS", "Licence", "Master", "Doctorat", "Professorat"]
const str = (v: unknown) => (typeof v === "string" ? v : "")
const rows = (v: unknown): Record<string, unknown>[] =>
    Array.isArray(v) ? v.filter((r): r is Record<string, unknown> => !!r && typeof r === "object") : []
const dateIso = (v: unknown) => (/^\d{4}-\d{2}-\d{2}$/.test(str(v).trim()) ? str(v).trim() : "")

/** Met la réponse de l'IA dans la forme `CvContent` attendue par le générateur de PDF. */
function toCvContent(raw: Record<string, unknown>): CvContent {
    const tel = separerIndicatif(str(raw.telephone))
    return {
        nom: str(raw.nom),
        email: str(raw.email),
        indicatif: tel.indicatif ?? INDICATIF_PAR_DEFAUT,
        telephone: tel.numero,
        adresse: str(raw.adresse),
        profil: str(raw.profil),
        experiences: rows(raw.experiences).map((r) => {
            const enCours = r.enCours === true
            return {
                entreprise: str(r.entreprise),
                poste: str(r.poste),
                dateDebut: dateIso(r.dateDebut),
                dateFin: enCours ? "" : dateIso(r.dateFin),
                enCours,
                description: str(r.description),
            }
        }),
        formations: rows(raw.formations).map((r) => ({
            etablissement: str(r.etablissement),
            diplome: DIPLOMES.includes(str(r.diplome)) ? str(r.diplome) : "",
            dateDebut: dateIso(r.dateDebut),
            dateFin: dateIso(r.dateFin),
        })),
        competences: rows(raw.competences).map((r) => ({ nom: str(r.nom), niveau: str(r.niveau) || "Intermédiaire" })),
        modele: CV_MODELE_PAR_DEFAUT,
    }
}

export interface AdaptedResume {
    resume: IResume
    adaptations: string[]
}

/**
 * Adapte le CV `resumeId` aux TDR de `job`, produit le PDF et l'ajoute à la
 * bibliothèque « Mes CV » sous « <CV> - <offre> » (le CV d'origine est conservé).
 */
export async function adaptResumeToJob(resumeId: string, resumeName: string, job: IJobOffer): Promise<AdaptedResume> {
    const reponse = await fetch("/api/adapter-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            resumeId,
            job: { title: job.title, description: job.description, requirements: job.requirements },
        }),
    })
    const payload = (await reponse.json().catch(() => ({}))) as {
        cv?: Record<string, unknown>
        adaptations?: string[]
        error?: string
        requiresUpgrade?: boolean
    }
    if (!reponse.ok || !payload.cv) {
        throw new AdaptationError(payload.error || "Ton CV n'a pas pu être adapté. Réessaie dans un instant.", payload.requiresUpgrade)
    }

    const cv = toCvContent(payload.cv)
    const base = resumeName.replace(/\.(pdf|docx?)$/i, "")
    const nom = `${base} - ${job.title}`.slice(0, 120)
    const fichier = await cvPdfFile(cv, cv.modele, `${nom.replace(/[^\w\-]+/g, "-").toLowerCase()}.pdf`)
    const res = await resumeService.upload(fichier, nom, "builder")
    return { resume: ((res as any)?.data ?? res) as IResume, adaptations: payload.adaptations ?? [] }
}
