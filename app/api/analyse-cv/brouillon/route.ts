import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * Note le brouillon du créateur de CV (/creer-cv, carte « Analyse avec
 * Goriya »). Contrairement à /api/analyse-cv, il n'y a pas de fichier : le
 * contenu saisi arrive en JSON, et aucun quota d'analyse n'est consommé - la
 * page est déjà réservée aux abonnés.
 */

const APPRECIATIONS = ["Excellent", "Très bon", "Bon", "Moyen", "Faible"] as const
type Appreciation = (typeof APPRECIATIONS)[number]

const appreciation = (value: unknown): Appreciation =>
    APPRECIATIONS.find((a) => a === value) ?? "Moyen"

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!(session?.user as any)?.id) {
            return NextResponse.json({ error: "Connecte-toi pour analyser ton CV." }, { status: 401 })
        }

        const body = (await request.json().catch(() => null)) as { cv?: unknown } | null
        if (!body?.cv || typeof body.cv !== "object") {
            return NextResponse.json({ error: "Contenu du CV manquant" }, { status: 400 })
        }

        if (!process.env.ANTHROPIC_API_KEY) {
            return NextResponse.json({ error: "ANTHROPIC_API_KEY non configurée" }, { status: 500 })
        }

        const instructions =
            "Tu es un expert RH. Voici le contenu d'un CV en cours de rédaction, au format JSON. " +
            "Évalue-le avec exigence et réponds UNIQUEMENT en JSON valide (sans markdown, sans texte avant ou après), " +
            "avec exactement cette structure : " +
            '{"score": <entier entre 0 et 100>, "structure": "", "motsCles": "", "experience": "", "suggestions": ["..."]}. ' +
            "score = qualité globale du CV pour un recruteur ; un CV incomplet (rubriques vides, descriptions absentes ou " +
            "très courtes, pas de profil) doit recevoir une note basse, et 90 ou plus est réservé à un CV complet, précis et chiffré. " +
            `structure, motsCles et experience valent chacun l'une de ces appréciations : ${APPRECIATIONS.join(", ")}. ` +
            "structure = complétude et organisation des rubriques ; motsCles = présence de termes métier et de compétences recherchés ; " +
            "experience = richesse et précision des expériences décrites. " +
            "suggestions : 3 éléments maximum, une phrase courte et concrète par élément, en tutoyant le candidat."

        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
        const response = await anthropic.messages.create({
            model: process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001",
            max_tokens: 1000,
            messages: [
                {
                    role: "user",
                    content: `${instructions}\n\nContenu du CV :\n---\n${JSON.stringify(body.cv).slice(0, 20000)}\n---`,
                },
            ],
        })

        const textBlock = response.content.find((block) => block.type === "text")
        if (!textBlock || textBlock.type !== "text") {
            return NextResponse.json({ error: "Aucune réponse IA reçue" }, { status: 502 })
        }

        let parsed: any
        try {
            const match = textBlock.text.replace(/```(?:json)?\s*|```/g, "").match(/\{[\s\S]*\}/)
            if (!match) throw new Error("Aucun JSON trouvé")
            parsed = JSON.parse(match[0])
        } catch {
            return NextResponse.json({ error: "Réponse IA invalide" }, { status: 502 })
        }

        const score = Number(parsed?.score)
        if (!Number.isFinite(score)) {
            return NextResponse.json({ error: "Réponse IA invalide" }, { status: 502 })
        }

        return NextResponse.json({
            score: Math.round(Math.min(100, Math.max(0, score))),
            structure: appreciation(parsed?.structure),
            motsCles: appreciation(parsed?.motsCles),
            experience: appreciation(parsed?.experience),
            suggestions: (Array.isArray(parsed?.suggestions) ? parsed.suggestions : [])
                .filter((s: unknown): s is string => typeof s === "string" && !!s.trim())
                .slice(0, 3),
        })
    } catch (error) {
        console.error("Erreur API analyse-cv/brouillon:", error)
        return NextResponse.json({ error: "Impossible d'analyser le CV pour le moment." }, { status: 500 })
    }
}
