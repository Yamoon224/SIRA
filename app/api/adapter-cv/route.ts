import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { BACKEND_URL } from "@/lib/backend-url"
import { extractDocxText } from "@/lib/docx-text"
import { detectFormat, extractJson, fetchLibraryResume, str, toBase64 } from "@/lib/library-resume"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * « Adapter son CV » à une offre d'emploi (réservé au forfait Premium) :
 * reformule le CV de la bibliothèque pour l'aligner sur les TDR de l'offre,
 * sans rien inventer. Renvoie le contenu au format du créateur de CV
 * (`CvContent`) ; le navigateur en produit le PDF et l'ajoute à « Mes CV ».
 */
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        const accessToken = (session?.user as any)?.access_token as string | undefined
        if (!accessToken) {
            return NextResponse.json({ error: "Connecte-toi pour adapter ton CV." }, { status: 401 })
        }

        // Garde côté backend (middleware plan.feature) : le forfait ACTIF doit
        // inclure `adaptation_cv` — l'affichage du bouton ne suffit pas.
        const gate = await fetch(`${BACKEND_URL}/me/plan-features/adaptation_cv`, {
            headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
        })
        if (!gate.ok) {
            return NextResponse.json(
                { error: "Adapter son CV à une offre est réservé au forfait Premium.", requiresUpgrade: true },
                { status: gate.status === 401 ? 401 : 403 },
            )
        }

        const body = await request.json().catch(() => null)
        const resumeId = str(body?.resumeId)
        const job = body?.job ?? {}
        const titre = str(job.title)
        const description = str(job.description).slice(0, 8000)
        const exigences: string[] = Array.isArray(job.requirements)
            ? job.requirements.map(str).filter(Boolean).slice(0, 40)
            : []
        if (!resumeId) return NextResponse.json({ error: "Choisis d'abord un CV de ta bibliothèque." }, { status: 400 })
        if (!titre || (!description && exigences.length === 0)) {
            return NextResponse.json({ error: "Les termes de référence de l'offre sont introuvables." }, { status: 400 })
        }

        if (!process.env.ANTHROPIC_API_KEY) {
            return NextResponse.json({ error: "ANTHROPIC_API_KEY non configurée" }, { status: 500 })
        }

        const file = await fetchLibraryResume(accessToken, resumeId)
        if (!file) return NextResponse.json({ error: "Ce CV est introuvable dans ta bibliothèque." }, { status: 404 })

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

        const instructions =
            "Tu es un expert RH et recruteur. Adapte le CV fourni aux termes de référence (TDR) de l'offre ci-dessous pour maximiser " +
            "ses chances d'être retenu, et réponds UNIQUEMENT en JSON valide (sans markdown, sans texte avant ou après), avec exactement cette structure : " +
            '{"nom": "", "email": "", "telephone": "", "adresse": "", "profil": "", ' +
            '"experiences": [{"entreprise": "", "poste": "", "dateDebut": "", "dateFin": "", "enCours": false, "description": ""}], ' +
            '"formations": [{"etablissement": "", "diplome": "", "dateDebut": "", "dateFin": ""}], ' +
            '"competences": [{"nom": "", "niveau": ""}], "adaptations": [""]}. ' +
            "RÈGLE ABSOLUE : n'invente AUCUNE expérience, entreprise, diplôme, date, compétence, chiffre ou résultat absent du CV d'origine. " +
            "Tu peux seulement : reformuler et réordonner ; mettre en avant les missions et réalisations qui répondent aux TDR ; reprendre le vocabulaire et les mots-clés " +
            "des TDR lorsque l'expérience correspondante est réellement dans le CV ; réécrire le profil en accroche ciblée sur le poste ; " +
            "placer en tête les compétences les plus pertinentes pour l'offre ; condenser ce qui est hors sujet. " +
            "Coordonnées, entreprises, intitulés de poste, dates et diplômes restent ceux du CV d'origine. " +
            "nom = prénom et nom ; telephone = numéro avec son indicatif s'il figure ; adresse = ville ou adresse indiquée. " +
            "Dates au format AAAA-MM-JJ (mois seul : 1er du mois ; année seule : 1er janvier). enCours = true pour un poste toujours occupé, avec dateFin vide. " +
            "description = missions et réalisations du poste, une par ligne. " +
            "etablissement = intitulé du diplôme suivi de l'établissement ; diplome = Bac, BTS, Licence, Master, Doctorat, Professorat, ou \"\". " +
            "niveau d'une compétence = Débutant, Intermédiaire, Avancé ou Expert s'il est indiqué, sinon \"Intermédiaire\". " +
            "experiences et formations de la plus récente à la plus ancienne. " +
            "adaptations = 3 à 6 phrases courtes, en français, décrivant ce que tu as ajusté.\n\n" +
            `OFFRE : ${titre}\n` +
            (description ? `Description / missions :\n${description}\n` : "") +
            (exigences.length ? `Profil et exigences :\n- ${exigences.join("\n- ")}\n` : "")

        let content: Anthropic.MessageParam["content"]
        if (format === "pdf") {
            content = [
                { type: "document", source: { type: "base64", media_type: "application/pdf", data: await toBase64(file) } },
                { type: "text", text: instructions },
            ]
        } else {
            let cvText = ""
            try {
                cvText = extractDocxText(Buffer.from(await file.arrayBuffer()))
            } catch {
                // traité ci-dessous comme un document sans texte
            }
            if (!cvText.trim()) {
                return NextResponse.json(
                    { error: "Ce document Word est illisible. Remplace-le par une version .docx ou PDF, puis réessaie." },
                    { status: 400 },
                )
            }
            content = [{ type: "text", text: `${instructions}\n\nCV D'ORIGINE :\n---\n${cvText.slice(0, 20000)}\n---` }]
        }

        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
        const response = await anthropic.messages.create({
            model: process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001",
            max_tokens: 5000,
            messages: [{ role: "user", content }],
        })

        const textBlock = response.content.find((block) => block.type === "text")
        if (!textBlock || textBlock.type !== "text") {
            return NextResponse.json({ error: "Aucune réponse IA reçue" }, { status: 502 })
        }

        try {
            const { adaptations, ...cv } = extractJson(textBlock.text) as Record<string, unknown>
            if (!cv || typeof cv !== "object") throw new Error("JSON inattendu")
            return NextResponse.json({
                cv,
                adaptations: Array.isArray(adaptations) ? adaptations.map(str).filter(Boolean) : [],
            })
        } catch {
            return NextResponse.json({ error: "Ton CV n'a pas pu être adapté. Réessaie dans un instant." }, { status: 502 })
        }
    } catch (error) {
        console.error("Erreur API adapter-cv:", error)
        return NextResponse.json({ error: "Impossible d'adapter le CV pour le moment." }, { status: 500 })
    }
}
