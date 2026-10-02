import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * Cerveau de la simulation d'entretien : à chaque tour, Claude lit tout
 * l'échange et décide de creuser la dernière réponse ou d'ouvrir un nouveau
 * thème, plus exigeant. Remplace la liste de questions figée d'origine.
 */

type Tour = { role: "assistant" | "user"; content: string }

interface Corps {
    action?: "question" | "feedback"
    config?: { poste?: string; entreprise?: string; niveau?: string; duree?: number; mode?: string }
    messages?: Tour[]
    /** Secondes restantes au chrono, pour amener la clôture au bon moment. */
    remaining?: number
}

const NIVEAUX: Record<string, string> = {
    debutant: "débutant (jeune diplômé ou première expérience) : questions accessibles, bienveillantes mais précises",
    intermediaire: "intermédiaire (quelques années d'expérience) : questions de mise en situation et d'arbitrage",
    avance: "avancé (profil senior) : questions exigeantes sur les décisions, le leadership, les résultats chiffrés et les cas complexes",
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")

/** Ne garde que des tours valides, bornés, et alternés comme l'attend l'API Messages. */
function nettoyer(messages: unknown): Tour[] {
    if (!Array.isArray(messages)) return []
    const tours: Tour[] = []
    for (const m of messages.slice(-40)) {
        const role = m?.role === "user" ? "user" : m?.role === "assistant" ? "assistant" : null
        const content = str(m?.content, 4000)
        if (!role || !content) continue
        const dernier = tours[tours.length - 1]
        if (dernier?.role === role) dernier.content += `\n${content}`
        else tours.push({ role, content })
    }
    return tours
}

function cadre(config: Corps["config"]): string {
    const poste = str(config?.poste, 150)
    const entreprise = str(config?.entreprise, 150)
    const niveau = NIVEAUX[str(config?.niveau, 20)] ?? "non précisé : adapte-toi aux réponses du candidat"
    return [
        `Poste visé : ${poste || "non précisé (entretien généraliste)"}`,
        `Entreprise : ${entreprise || "non précisée"}`,
        `Niveau de difficulté : ${niveau}`,
    ].join("\n")
}

function systemQuestion(corps: Corps): string {
    const duree = Number(corps.config?.duree) || 10
    const restant = Math.max(0, Math.round(Number(corps.remaining) || 0))
    const oral = corps.config?.mode === "video"

    const tempo =
        restant <= 75
            ? "Il reste moins d'une minute : pose UNE dernière question de clôture, courte (par exemple inviter le candidat à poser ses propres questions ou à dire ce qu'il veut qu'on retienne de lui)."
            : `Il reste environ ${Math.round(restant / 60)} minute(s) sur ${duree}. Répartis les thèmes sur le temps disponible.`

    return `Tu es Goriya, un recruteur expérimenté qui mène un entretien d'embauche simulé, en français, en tutoyant le candidat.

${cadre(corps.config)}

Ta manière de mener l'entretien :
- Lis attentivement la dernière réponse du candidat et rebondis dessus. Reprends un élément précis de ce qu'il a dit (un projet, un chiffre, un outil, une difficulté, un choix) et creuse : demande un exemple concret, son rôle exact, le résultat obtenu, ce qu'il ferait différemment, ou confronte-le à une objection réaliste.
- Quand un sujet a été creusé (une ou deux relances), passe à un nouveau thème, plus exigeant que le précédent. La difficulté doit monter au fil de l'entretien.
- Si la réponse est vague, trop courte, hors sujet ou générique, ne passe pas à autre chose : dis-le avec tact et redemande en précisant ce que tu attends.
- Si la réponse est solide, élève le niveau : mise en situation propre au poste, cas pratique, arbitrage entre deux contraintes, question technique du métier, gestion d'un conflit ou d'un échec.
- Couvre au fil de l'entretien : la motivation pour ce poste et cette entreprise, les compétences clés du métier (questions techniques adaptées au poste), des mises en situation, le comportement en équipe et sous pression, le projet professionnel.
- Rends les questions spécifiques au poste et à l'entreprise indiqués, jamais interchangeables d'un métier à l'autre.
- Ne pose jamais deux fois la même question et ne reprends pas les formulations toutes faites des entretiens types.
- Une seule question par message. Deux à quatre phrases au maximum : une courte transition qui montre que tu as écouté, puis la question.
- Tu es le recruteur, pas un coach : pas de conseils, pas de note ni d'évaluation pendant l'entretien (le feedback vient après). Pas de markdown, pas de liste.
${oral ? "- Le candidat répond à l'oral et ses réponses ne sont pas transcrites : tu ne peux pas les citer. Enchaîne donc des questions variées, de difficulté croissante, sans prétendre avoir entendu son contenu." : ""}
- ${tempo}

Réponds uniquement avec ton prochain message de recruteur.`
}

function systemFeedback(corps: Corps): string {
    return `Tu es un coach en recrutement. Tu analyses un entretien d'embauche simulé qui vient de se terminer et tu donnes au candidat un retour honnête, précis et utile, en français, en le tutoyant.

${cadre(corps.config)}

Base-toi uniquement sur ce que le candidat a réellement écrit. Cite ou paraphrase ses réponses pour justifier chaque point. Un entretien avec des réponses courtes, vagues ou incomplètes doit recevoir une note basse : ne sois pas complaisant.

Réponds UNIQUEMENT en JSON valide, sans markdown, avec exactement cette structure :
{"score": <entier de 0 à 100>, "summary": "<2 phrases de synthèse>", "strengths": ["..."], "improvements": ["..."], "recommendations": ["..."]}
strengths, improvements et recommendations : 2 à 4 éléments chacun, une phrase courte et concrète par élément. Les recommandations sont des actions à faire avant le prochain entretien.`
}

function extraireJson(text: string): any {
    const match = text.replace(/```(?:json)?\s*|```/g, "").match(/\{[\s\S]*\}/)
    if (!match) throw new Error("JSON introuvable")
    return JSON.parse(match[0])
}

const liste = (v: unknown) =>
    Array.isArray(v) ? v.map((x) => str(x, 400)).filter(Boolean).slice(0, 4) : []

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!(session?.user as any)?.id) {
            return NextResponse.json({ error: "Connecte-toi pour lancer une simulation." }, { status: 401 })
        }
        if (!process.env.ANTHROPIC_API_KEY) {
            return NextResponse.json({ error: "ANTHROPIC_API_KEY non configurée" }, { status: 500 })
        }

        const corps = (await request.json()) as Corps
        const tours = nettoyer(corps.messages)
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
        const model = process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001"

        if (corps.action === "feedback") {
            if (!tours.some((t) => t.role === "user")) {
                return NextResponse.json({ error: "Aucune réponse à analyser." }, { status: 400 })
            }
            const transcription = tours
                .map((t) => `${t.role === "user" ? "CANDIDAT" : "RECRUTEUR"} : ${t.content}`)
                .join("\n\n")
            const response = await anthropic.messages.create({
                model,
                max_tokens: 1200,
                system: systemFeedback(corps),
                messages: [{ role: "user", content: `Voici l'entretien :\n---\n${transcription.slice(0, 30000)}\n---` }],
            })
            const bloc = response.content.find((b) => b.type === "text")
            const brut = extraireJson(bloc && bloc.type === "text" ? bloc.text : "")
            return NextResponse.json({
                feedback: {
                    score: Math.min(100, Math.max(0, Math.round(Number(brut?.score) || 0))),
                    summary: str(brut?.summary, 800),
                    strengths: liste(brut?.strengths),
                    improvements: liste(brut?.improvements),
                    recommendations: liste(brut?.recommendations),
                },
            })
        }

        // L'API Messages exige un premier tour « user » : l'accueil de Goriya
        // (premier message, côté assistant) est précédé d'une amorce.
        const messages: Tour[] = tours[0]?.role === "assistant" ? [{ role: "user", content: "Bonjour, je suis prêt pour l'entretien." }, ...tours] : tours
        if (messages[messages.length - 1]?.role !== "user") {
            return NextResponse.json({ error: "En attente de la réponse du candidat." }, { status: 400 })
        }

        const response = await anthropic.messages.create({
            model,
            max_tokens: 400,
            system: systemQuestion(corps),
            messages,
        })
        const bloc = response.content.find((b) => b.type === "text")
        const question = bloc && bloc.type === "text" ? bloc.text.trim() : ""
        if (!question) {
            return NextResponse.json({ error: "Aucune réponse IA reçue" }, { status: 502 })
        }
        return NextResponse.json({ question })
    } catch (error) {
        console.error("Erreur API simulation-entretien:", error)
        return NextResponse.json({ error: "La simulation est momentanément indisponible." }, { status: 500 })
    }
}
