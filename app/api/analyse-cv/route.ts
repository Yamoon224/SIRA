import OpenAI from "openai"
import { NextResponse } from "next/server"
import type { CVAnalysis } from "@/lib/@types/openai"

export const runtime = "nodejs"

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

async function extractTextFromWord(file: File): Promise<string> {
    return await file.text()
}

function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result)?.split(",")[1] || "")
        reader.onerror = () => reject(new Error("Impossible de lire le fichier"))
        reader.readAsDataURL(file)
    })
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

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get("file")

        if (!(file instanceof File) || !file.name) {
            return NextResponse.json({ error: "Fichier CV manquant" }, { status: 400 })
        }

        const fileType = file.type.toLowerCase()
        let cvText = ""
        let imageDataUrl: string | null = null

        if (fileType.includes("pdf")) {
            cvText = await extractTextFromPDF(file)
        } else if (fileType.includes("word") || fileType.includes("document")) {
            cvText = await extractTextFromWord(file)
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
                  {
                      type: "image_url" as const,
                      image_url: { url: imageDataUrl },
                  },
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
                {
                    role: "user",
                    content: userContent,
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
