import OpenAI from "openai"
import { NextResponse } from "next/server"
import type { CVAnalysis } from "@/lib/@types/openai"

export const runtime = "nodejs"

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

export async function POST(request: Request) {
    try {
        const { cvText } = (await request.json()) as { cvText?: string }

        if (!cvText || !cvText.trim()) {
            return NextResponse.json({ error: "Texte CV manquant" }, { status: 400 })
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "OPENAI_API_KEY non configurée" }, { status: 500 })
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "Tu es un expert RH. Analyse un CV et réponds strictement en JSON valide avec: score (0-100), strengths (string[]), weaknesses (string[]), suggestions (string[]), keywords (string[]), summary (string).",
                },
                {
                    role: "user",
                    content: `Analyse ce CV:\n${cvText.slice(0, 20000)}`,
                },
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

        return NextResponse.json({ analysis })
    } catch (error) {
        console.error("Erreur API analyse-cv:", error)
        return NextResponse.json({ error: "Impossible d'analyser le CV pour le moment." }, { status: 500 })
    }
}
