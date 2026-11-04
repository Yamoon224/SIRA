import { BACKEND_URL } from "@/lib/backend-url"

/**
 * Lecture d'un CV côté serveur (routes /api/analyse-cv et /api/adapter-cv) :
 * récupération dans la bibliothèque « Mes CV », détection du format, JSON de l'IA.
 */

export async function toBase64(file: File): Promise<string> {
    // Route serveur (runtime "nodejs") : FileReader n'est pas garanti disponible côté Node,
    // on utilise Buffer qui est fiable dans cet environnement.
    const buffer = Buffer.from(await file.arrayBuffer())
    return buffer.toString("base64")
}

export const str = (value: unknown) => (typeof value === "string" ? value.trim() : "")

export const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

/**
 * Seuls PDF et Word (.docx) sont acceptés. L'extension sert de repli : certains
 * navigateurs mobiles envoient un type MIME vide ou générique.
 */
export function detectFormat(file: File): "pdf" | "docx" | "doc" | null {
    const type = file.type.toLowerCase()
    const name = file.name.toLowerCase()
    if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf"
    if (type === DOCX_MIME || name.endsWith(".docx")) return "docx"
    if (type === "application/msword" || name.endsWith(".doc")) return "doc"
    return null
}

/**
 * Claude n'a pas de mode "JSON forcé" équivalent à response_format d'OpenAI -
 * on extrait le premier bloc JSON de la réponse, en tolérant un habillage
 * markdown malgré la consigne. Mirroir de parseClaudeJson (backend PHP).
 */
export function extractJson(text: string): unknown {
    const cleaned = text.replace(/```(?:json)?\s*|```/g, "").trim()
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) {
        throw new Error("Aucun JSON trouvé dans la réponse IA")
    }
    return JSON.parse(match[0])
}

/**
 * Récupère un CV de la bibliothèque « Mes CV » côté serveur : le navigateur ne
 * peut pas relire le fichier lui-même (stockage public sans CORS). Passer par
 * `/me/resumes` garantit au passage que le CV appartient bien à l'utilisateur.
 */
export async function fetchLibraryResume(accessToken: string, resumeId: string): Promise<File | null> {
    const res = await fetch(`${BACKEND_URL}/me/resumes`, {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    })
    if (!res.ok) return null

    const payload = await res.json()
    const resumes: any[] = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : []
    const resume = resumes.find((r) => String(r?.id) === resumeId)
    if (!resume?.url) return null

    const fileRes = await fetch(resume.url)
    if (!fileRes.ok) return null

    // Le nom affiché (« CV Ange Axel ») n'a pas toujours d'extension : on
    // reprend celle du fichier stocké, dont dépend la détection du format.
    const extension = new URL(resume.url).pathname.match(/\.[a-z0-9]+$/i)?.[0] ?? ""
    const name = str(resume.name) || "CV"
    const filename = name.toLowerCase().endsWith(extension.toLowerCase()) ? name : `${name}${extension}`

    return new File([await fileRes.arrayBuffer()], filename, { type: str(resume.mimeType) })
}

