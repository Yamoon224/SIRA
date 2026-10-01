import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { CVAnalysis, CVProfile } from "@/lib/@types/openai"
import { BACKEND_URL } from "@/lib/backend-url"
import { extractDocxText } from "@/lib/docx-text"

export const runtime = "nodejs"
// L'analyse (lecture du CV + extraction du profil) dépasse la durée par défaut
// d'une fonction : sans marge, la requête est coupée avant la réponse.
export const maxDuration = 60

const BACKEND = BACKEND_URL

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function toBase64(file: File): Promise<string> {
    // Route serveur (runtime "nodejs") : FileReader n'est pas garanti disponible côté Node,
    // on utilise Buffer qui est fiable dans cet environnement.
    const buffer = Buffer.from(await file.arrayBuffer())
    return buffer.toString("base64")
}

const str = (value: unknown) => (typeof value === "string" ? value.trim() : "")
const strList = (value: unknown) => (Array.isArray(value) ? value.map(str).filter(Boolean) : [])

function sanitizeProfile(payload: any): CVProfile {
    const gender = str(payload?.gender)
    const birthDate = str(payload?.birthDate)
    return {
        firstName: str(payload?.firstName),
        fullName: str(payload?.fullName),
        title: str(payload?.title),
        phone: str(payload?.phone),
        email: str(payload?.email),
        birthDate: /^\d{4}-\d{2}-\d{2}$/.test(birthDate) ? birthDate : "",
        gender: gender === "Homme" || gender === "Femme" ? gender : "",
        desiredJob: str(payload?.desiredJob),
        experiences: (Array.isArray(payload?.experiences) ? payload.experiences : []).map((e: any) => ({
            position: str(e?.position),
            company: str(e?.company),
            location: str(e?.location),
            date: str(e?.date),
            skills: strList(e?.skills),
            missions: strList(e?.missions),
        })),
        skills: strList(payload?.skills),
        educations: (Array.isArray(payload?.educations) ? payload.educations : []).map((e: any) => ({
            title: str(e?.title),
            level: str(e?.level),
            school: str(e?.school),
            date: str(e?.date),
            skills: strList(e?.skills),
        })),
        hobbies: strList(payload?.hobbies),
        linkedin: str(payload?.linkedin),
        website: str(payload?.website),
    }
}

function sanitizeAnalysis(payload: any): CVAnalysis {
    return {
        profile: sanitizeProfile(payload?.profile),
        score: Math.min(100, Math.max(0, Number(payload?.score ?? 0))),
        strengths: Array.isArray(payload?.strengths) ? payload.strengths.map(String) : [],
        weaknesses: Array.isArray(payload?.weaknesses) ? payload.weaknesses.map(String) : [],
        suggestions: Array.isArray(payload?.suggestions) ? payload.suggestions.map(String) : [],
        keywords: Array.isArray(payload?.keywords) ? payload.keywords.map(String) : [],
        summary: typeof payload?.summary === "string" ? payload.summary : "Analyse terminée",
    }
}

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

/**
 * Seuls PDF et Word (.docx) sont acceptés. L'extension sert de repli : certains
 * navigateurs mobiles envoient un type MIME vide ou générique.
 */
function detectFormat(file: File): "pdf" | "docx" | "doc" | null {
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
function extractJson(text: string): unknown {
    const cleaned = text.replace(/```(?:json)?\s*|```/g, "").trim()
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) {
        throw new Error("Aucun JSON trouvé dans la réponse IA")
    }
    return JSON.parse(match[0])
}

// ─── Gate helpers ─────────────────────────────────────────────────────────────

async function checkAnonymousStatus(deviceId: string): Promise<{
    allowed: boolean; used: number; remaining: number; limit: number
}> {
    const res = await fetch(
        `${BACKEND}/anonymous-usage/status?deviceId=${encodeURIComponent(deviceId)}&featureKey=cv_analysis`,
    )
    return res.json()
}

/** `log` (nom du fichier, score) alimente le journal des analyses lu par le backoffice admin. */
type AnalysisLog = { filename: string; score: number; recommendations: string[] }

async function consumeAnonymousUse(deviceId: string, log: AnalysisLog): Promise<{
    allowed: boolean; used: number; remaining: number; limit: number
}> {
    const res = await fetch(`${BACKEND}/anonymous-usage/consume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, featureKey: "cv_analysis", ...log }),
    })
    return res.json()
}

async function checkSubscription(userId: string): Promise<{ hasSubscription: boolean }> {
    const res = await fetch(`${BACKEND}/subscriptions/check/${userId}`)
    if (!res.ok) return { hasSubscription: false }
    return res.json()
}

type UsageStatus = { allowed: boolean; used: number; remaining: number; limit: number }

/** Quota du forfait actif (Grouilleur: 2, Standard: 5, Premium: 20) - voir UserFeatureUsageService. */
async function checkAuthedUsageStatus(accessToken: string): Promise<UsageStatus> {
    const res = await fetch(`${BACKEND}/me/feature-usage/cv_analysis`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    })
    return res.json()
}

/** Consommée uniquement après le succès de l'analyse, comme le quota anonyme. */
async function consumeAuthedUsage(accessToken: string, log: AnalysisLog): Promise<UsageStatus> {
    const res = await fetch(`${BACKEND}/me/feature-usage/cv_analysis/consume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(log),
    })
    return res.json()
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get("file")
        const deviceId = request.headers.get("x-device-id") ?? "unknown"

        if (!(file instanceof File) || !file.name) {
            return NextResponse.json({ error: "Fichier CV manquant" }, { status: 400 })
        }

        // Vérifié avant tout appel au backend : un format refusé ne coûte rien.
        const format = detectFormat(file)
        if (format === "doc") {
            return NextResponse.json(
                { error: "L'ancien format Word (.doc) n'est pas lisible. Enregistre ton CV en .docx ou en PDF, puis réessaie." },
                { status: 400 },
            )
        }
        if (!format) {
            return NextResponse.json({ error: "Format non supporté. Utilise un CV au format PDF ou Word (.docx)." }, { status: 400 })
        }

        // ── AUTH CHECK ────────────────────────────────────────────────────────
        // Session NextAuth httpOnly = unique source de vérité (plus de cookie "auth" custom).
        const session = await getServerSession(authOptions)
        const authedUserId = (session?.user as any)?.id ?? null

        // ── GATING ───────────────────────────────────────────────────────────
        if (!authedUserId) {
            // Anonymous: check free tier WITHOUT consuming it yet.
            const status = await checkAnonymousStatus(deviceId)
            if (!status.allowed) {
                return NextResponse.json(
                    {
                        error: "Tu as utilisé tes 3 analyses gratuites. Connecte-toi pour continuer.",
                        requiresAuth: true,
                        used: status.used,
                        remaining: 0,
                        limit: status.limit,
                    },
                    { status: 403 },
                )
            }
            // Le quota n'est consommé qu'après le succès de l'analyse (voir runAnalysis).
            return await runAnalysis(file, { deviceId })
        }

        // Authenticated: check subscription
        const { hasSubscription } = await checkSubscription(authedUserId)
        if (!hasSubscription) {
            return NextResponse.json(
                {
                    error: "Un abonnement actif est requis pour utiliser l'analyse IA.",
                    requiresSubscription: true,
                },
                { status: 402 },
            )
        }

        // Quota du forfait actif (Grouilleur: 2/mois, Standard: 5,
        // Premium: 20) - vérifié avant l'appel IA, sans le consommer
        // (voir consumeAuthedUsage, appelée seulement après succès).
        const accessToken = (session?.user as any)?.access_token as string | undefined
        if (accessToken) {
            const usage = await checkAuthedUsageStatus(accessToken)
            if (!usage.allowed) {
                return NextResponse.json(
                    {
                        error:
                            usage.limit > 0
                                ? `Tu as utilisé tes ${usage.limit} analyses de CV incluses dans ton forfait ce mois-ci.`
                                : "L'analyse de CV n'est pas incluse dans ton forfait actuel.",
                        requiresReset: usage.limit > 0,
                        used: usage.used,
                        remaining: usage.remaining,
                        limit: usage.limit,
                    },
                    { status: 403 },
                )
            }
        }

        return await runAnalysis(file, null, accessToken)
    } catch (error) {
        console.error("Erreur API analyse-cv:", error)
        return NextResponse.json({ error: "Impossible d'analyser le CV pour le moment." }, { status: 500 })
    }
}

async function runAnalysis(
    file: File,
    anonymous: { deviceId: string } | null,
    authedAccessToken?: string,
) {
    let cvText = ""
    let pdfBase64: string | null = null

    if (detectFormat(file) === "pdf") {
        // Le PDF est transmis tel quel à Claude (bloc "document") : pdfjs-dist
        // ne se charge pas côté Node (DOMMatrix absent), et la lecture native
        // gère aussi les CV scannés, sans couche texte.
        pdfBase64 = await toBase64(file)
    } else {
        try {
            cvText = extractDocxText(Buffer.from(await file.arrayBuffer()))
        } catch {
            return NextResponse.json(
                { error: "Ce document Word est illisible. Enregistre-le de nouveau en .docx ou en PDF, puis réessaie." },
                { status: 400 },
            )
        }
        if (!cvText.trim()) {
            return NextResponse.json(
                { error: "Aucun texte trouvé dans ce document Word. S'il contient une image de ton CV, exporte-le plutôt en PDF." },
                { status: 400 },
            )
        }
    }

    if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json({ error: "ANTHROPIC_API_KEY non configurée" }, { status: 500 })
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    // Mirroir de backend/config/services.php (services.anthropic.model) - même
    // modèle par défaut des deux côtés du monorepo.
    const model = process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001"

    const instructions =
        "Tu es un expert RH. Analyse ce CV / document de candidature et réponds UNIQUEMENT en JSON valide " +
        "(sans markdown, sans texte avant ou après), avec exactement cette structure : " +
        '{"score": <entier entre 0 et 100>, "strengths": ["..."], "weaknesses": ["..."], "suggestions": ["..."], "keywords": ["..."], "summary": "...", ' +
        '"profile": {"firstName": "", "fullName": "", "title": "", "phone": "", "email": "", "birthDate": "", "gender": "", "desiredJob": "", ' +
        '"experiences": [{"position": "", "company": "", "location": "", "date": "", "skills": [""], "missions": [""]}], ' +
        '"skills": [""], "educations": [{"title": "", "level": "", "school": "", "date": "", "skills": [""]}], ' +
        '"hobbies": [""], "linkedin": "", "website": ""}}. ' +
        "strengths, weaknesses et suggestions : 5 éléments maximum chacun, une phrase courte par élément. " +
        "\"profile\" reprend uniquement ce qui est écrit dans le CV : n'invente rien, laisse \"\" ou [] quand l'information est absente. " +
        "firstName = prénom seul ; title = intitulé professionnel affiché en tête du CV ; phone = numéro avec son indicatif s'il figure ; " +
        "birthDate au format AAAA-MM-JJ ; gender = \"Homme\" ou \"Femme\" seulement s'il est indiqué explicitement ; " +
        "desiredJob = poste recherché s'il est mentionné ; date = période telle qu'écrite (ex. \"2022 - 2024\") ; " +
        "experiences et educations de la plus récente à la plus ancienne."

    const content = pdfBase64
        ? [
              {
                  type: "document" as const,
                  source: {
                      type: "base64" as const,
                      media_type: "application/pdf" as const,
                      data: pdfBase64,
                  },
              },
              { type: "text" as const, text: instructions },
          ]
        : [
              {
                  type: "text" as const,
                  text: `${instructions}\n\nContenu du CV :\n---\n${cvText.slice(0, 20000)}\n---`,
              },
          ]

    const response = await anthropic.messages.create({
        model,
        max_tokens: 4000,
        messages: [{ role: "user", content }],
    })

    const textBlock = response.content.find((block) => block.type === "text")
    if (!textBlock || textBlock.type !== "text") {
        return NextResponse.json({ error: "Aucune réponse IA reçue" }, { status: 502 })
    }

    let parsed: unknown
    try {
        parsed = extractJson(textBlock.text)
    } catch {
        return NextResponse.json({ error: "Réponse IA invalide" }, { status: 502 })
    }

    const analysis = sanitizeAnalysis(parsed)

    // Le quota (gratuit ou de forfait) n'est consommé qu'ici, une fois
    // l'analyse effectivement réussie - un échec (extraction, IA,
    // parsing) ne pénalise pas l'utilisateur.
    const log: AnalysisLog = { filename: file.name, score: analysis.score, recommendations: analysis.suggestions }

    if (anonymous) {
        const usage = await consumeAnonymousUse(anonymous.deviceId, log)
        return NextResponse.json({ analysis, usage })
    }

    if (authedAccessToken) {
        const usage = await consumeAuthedUsage(authedAccessToken, log)
        return NextResponse.json({ analysis, usage })
    }

    return NextResponse.json({ analysis })
}
