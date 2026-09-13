import OpenAI from "openai"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { CVAnalysis } from "@/lib/@types/openai"
import { BACKEND_URL } from "@/lib/backend-url"

export const runtime = "nodejs"

const BACKEND = BACKEND_URL

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function extractTextFromPDF(file: File): Promise<string> {
    const pdfjsLib = await import("pdfjs-dist")
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ""
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        fullText += textContent.items.map((item: any) => item.str).join(" ") + "\n"
    }
    return fullText.trim()
}

async function toBase64(file: File): Promise<string> {
    // Route serveur (runtime "nodejs") : FileReader n'est pas garanti disponible côté Node,
    // on utilise Buffer qui est fiable dans cet environnement.
    const buffer = Buffer.from(await file.arrayBuffer())
    return buffer.toString("base64")
}

function sanitizeAnalysis(payload: any): CVAnalysis {
    return {
        score: Math.min(100, Math.max(0, Number(payload?.score ?? 0))),
        strengths: Array.isArray(payload?.strengths) ? payload.strengths.map(String) : [],
        weaknesses: Array.isArray(payload?.weaknesses) ? payload.weaknesses.map(String) : [],
        suggestions: Array.isArray(payload?.suggestions) ? payload.suggestions.map(String) : [],
        keywords: Array.isArray(payload?.keywords) ? payload.keywords.map(String) : [],
        summary: typeof payload?.summary === "string" ? payload.summary : "Analyse terminée",
    }
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

async function consumeAnonymousUse(deviceId: string): Promise<{
    allowed: boolean; used: number; remaining: number; limit: number
}> {
    const res = await fetch(`${BACKEND}/anonymous-usage/consume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, featureKey: "cv_analysis" }),
    })
    return res.json()
}

async function checkSubscription(userId: string): Promise<{ hasSubscription: boolean }> {
    const res = await fetch(`${BACKEND}/subscriptions/check/${userId}`)
    if (!res.ok) return { hasSubscription: false }
    return res.json()
}

type UsageStatus = { allowed: boolean; used: number; remaining: number; limit: number }

/** Quota du forfait actif (Grouilleur: 2, Standard: 5, Premium: 20) — voir UserFeatureUsageService. */
async function checkAuthedUsageStatus(accessToken: string): Promise<UsageStatus> {
    const res = await fetch(`${BACKEND}/me/feature-usage/cv_analysis`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    })
    return res.json()
}

/** Consommée uniquement après le succès de l'analyse, comme le quota anonyme. */
async function consumeAuthedUsage(accessToken: string): Promise<UsageStatus> {
    const res = await fetch(`${BACKEND}/me/feature-usage/cv_analysis/consume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
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
        // Premium: 20) — vérifié avant l'appel IA, sans le consommer
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
    const fileType = file.type.toLowerCase()
    let cvText = ""
    let imageDataUrl: string | null = null

    if (fileType.includes("pdf")) {
        cvText = await extractTextFromPDF(file)
    } else if (fileType.includes("word") || fileType.includes("document")) {
        cvText = await file.text()
    } else if (fileType.includes("image")) {
        imageDataUrl = `data:${file.type};base64,${await toBase64(file)}`
    } else {
        cvText = await file.text()
    }

    if (!cvText.trim() && !imageDataUrl) {
        return NextResponse.json({ error: "Texte CV manquant après extraction" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ error: "OPENAI_API_KEY non configurée" }, { status: 500 })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const userContent = imageDataUrl
        ? [
              {
                  type: "text" as const,
                  text: "Analyse ce CV / document de candidature et réponds strictement en JSON valide avec: score (0-100), strengths (string[]), weaknesses (string[]), suggestions (string[]), keywords (string[]), summary (string).",
              },
              { type: "image_url" as const, image_url: { url: imageDataUrl } },
          ]
        : `Analyse ce CV / document de candidature:\n${cvText.slice(0, 20000)}`

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content:
                    "Tu es un expert RH. Analyse ce document et réponds strictement en JSON valide avec: score (0-100), strengths (string[]), weaknesses (string[]), suggestions (string[]), keywords (string[]), summary (string).",
            },
            { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 1400,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
        return NextResponse.json({ error: "Aucune réponse IA reçue" }, { status: 502 })
    }

    const parsed = JSON.parse(content)
    const analysis = sanitizeAnalysis(parsed)

    // Le quota (gratuit ou de forfait) n'est consommé qu'ici, une fois
    // l'analyse effectivement réussie - un échec (extraction, OpenAI,
    // parsing) ne pénalise pas l'utilisateur.
    if (anonymous) {
        const usage = await consumeAnonymousUse(anonymous.deviceId)
        return NextResponse.json({ analysis, usage })
    }

    if (authedAccessToken) {
        const usage = await consumeAuthedUsage(authedAccessToken)
        return NextResponse.json({ analysis, usage })
    }

    return NextResponse.json({ analysis })
}
