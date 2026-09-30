import Anthropic from "@anthropic-ai/sdk"
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

/** Claude vision n'accepte que ces 4 types - fallback jpeg pour le reste (svg, etc.). */
function toClaudeMediaType(mimeType: string): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const
    return (allowed as readonly string[]).includes(mimeType)
        ? (mimeType as (typeof allowed)[number])
        : "image/jpeg"
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

/** Quota du forfait actif (Grouilleur: 2, Standard: 5, Premium: 20) - voir UserFeatureUsageService. */
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
        '{"score": <entier entre 0 et 100>, "strengths": ["..."], "weaknesses": ["..."], "suggestions": ["..."], "keywords": ["..."], "summary": "..."}'

    const content = imageDataUrl
        ? [
              { type: "text" as const, text: instructions },
              {
                  type: "image" as const,
                  source: {
                      type: "base64" as const,
                      media_type: toClaudeMediaType(file.type),
                      data: imageDataUrl.slice(imageDataUrl.indexOf(",") + 1),
                  },
              },
          ]
        : [
              {
                  type: "text" as const,
                  text: `${instructions}\n\nContenu du CV :\n---\n${cvText.slice(0, 20000)}\n---`,
              },
          ]

    const response = await anthropic.messages.create({
        model,
        max_tokens: 1400,
        temperature: 0.4,
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
