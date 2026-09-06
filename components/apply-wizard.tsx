"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    Check,
    CheckCircle2,
    FileText,
    Loader2,
    Star,
    Trash2,
    Upload,
} from "lucide-react"
import { toast } from "sonner"
import { jobService, type JobApplicationPayload } from "@/lib/api/job.service"
import {
    RESUME_ACCEPT,
    RESUME_MAX_SIZE_BYTES,
    resumeService,
    type IResume,
} from "@/lib/api/resume.service"
import { userService } from "@/lib/api/user.service"
import type { IJobOffer, IJobOfferQuestion } from "@/lib/@types/entities"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    job: IJobOffer
    onApplied: () => void
}

/** Réponse en cours de saisie : tableau pour MULTI_CHOICE, chaîne sinon. */
type AnswerDraft = string | string[]

type Coordonnees = {
    name: string
    email: string
    phone: string
    location: string
    coverLetter: string
}

const ETAPES = ["Coordonnées", "Questions", "CV", "Récapitulatif"] as const

const CHOIX_MULTIPLE = "MULTI_CHOICE"

const valeurVide = (valeur: AnswerDraft | undefined) =>
    valeur === undefined || (Array.isArray(valeur) ? valeur.length === 0 : valeur.trim() === "")

/** Octets → « 1,2 Mo », pour la ligne d'un CV dans la liste. */
function formatTaille(octets: number) {
    if (!octets) return ""
    const mo = octets / (1024 * 1024)
    return mo >= 1 ? `${mo.toFixed(1)} Mo` : `${Math.round(octets / 1024)} Ko`
}

/**
 * Candidature en plusieurs étapes, façon LinkedIn : coordonnées pré-remplies,
 * questions configurées par l'entreprise, choix du CV, puis récapitulatif.
 *
 * Les étapes sans contenu sont sautées : une offre sans question passe
 * directement des coordonnées au CV.
 */
export function ApplyWizard({ open, onOpenChange, job, onApplied }: Props) {
    const questions = useMemo<IJobOfferQuestion[]>(
        () => (Array.isArray(job.questions) ? job.questions : []),
        [job.questions],
    )

    const [etape, setEtape] = useState(0)
    const [chargement, setChargement] = useState(true)
    const [envoi, setEnvoi] = useState(false)

    const [coordonnees, setCoordonnees] = useState<Coordonnees>({
        name: "",
        email: "",
        phone: "",
        location: "",
        coverLetter: "",
    })
    const [erreursCoordonnees, setErreursCoordonnees] = useState<Partial<Record<keyof Coordonnees, string>>>({})

    const [reponses, setReponses] = useState<Record<string, AnswerDraft>>({})
    const [erreursReponses, setErreursReponses] = useState<Record<string, string>>({})

    const [cvs, setCvs] = useState<IResume[]>([])
    const [cvChoisi, setCvChoisi] = useState<string | null>(null)
    const [televersement, setTeleversement] = useState(false)
    const [erreurCv, setErreurCv] = useState<string | null>(null)
    const inputFichier = useRef<HTMLInputElement>(null)

    // Le profil et la bibliothèque de CV ne sont chargés qu'à l'ouverture :
    // inutile d'appeler l'API pour tous les visiteurs de la fiche d'offre.
    useEffect(() => {
        if (!open) return
        let annule = false

        setEtape(0)
        setChargement(true)
        setErreursCoordonnees({})
        setErreursReponses({})
        setErreurCv(null)

        Promise.all([
            userService.getMyProfile().catch(() => null),
            resumeService.list().catch(() => null),
        ])
            .then(([profil, listeCv]) => {
                if (annule) return

                if (profil) {
                    setCoordonnees({
                        name: profil.name ?? "",
                        email: profil.email ?? "",
                        phone: profil.phone ?? "",
                        location: profil.location ?? "",
                        coverLetter: "",
                    })
                }

                const items = ((listeCv as any)?.data ?? listeCv ?? []) as IResume[]
                const liste = Array.isArray(items) ? items : []
                setCvs(liste)
                setCvChoisi(liste.find((cv) => cv.isDefault)?.id ?? liste[0]?.id ?? null)
            })
            .finally(() => !annule && setChargement(false))

        return () => {
            annule = true
        }
    }, [open])

    // Une offre sans question n'a pas d'étape 2 : elle est masquée plutôt que
    // présentée vide, sinon le candidat traverse un écran qui ne lui demande rien.
    const etapesActives = useMemo(
        () => ETAPES.filter((_, index) => index !== 1 || questions.length > 0),
        [questions.length],
    )
    const indexEtape = ETAPES.indexOf(etapesActives[etape])

    const setReponse = useCallback((questionId: string, valeur: AnswerDraft) => {
        setReponses((prev) => ({ ...prev, [questionId]: valeur }))
        setErreursReponses((prev) => {
            if (!prev[questionId]) return prev
            const copie = { ...prev }
            delete copie[questionId]
            return copie
        })
    }, [])

    const validerCoordonnees = () => {
        const erreurs: Partial<Record<keyof Coordonnees, string>> = {}
        if (coordonnees.name.trim() === "") erreurs.name = "Indique ton nom."
        if (coordonnees.email.trim() === "") erreurs.email = "Indique ton adresse e-mail."
        setErreursCoordonnees(erreurs)
        return Object.keys(erreurs).length === 0
    }

    const validerReponses = () => {
        const erreurs: Record<string, string> = {}

        questions.forEach((question) => {
            const valeur = reponses[question.id]
            if (question.required && valeurVide(valeur)) {
                erreurs[question.id] = "Cette question est obligatoire."
                return
            }
            if (question.type === "NUMBER" && !valeurVide(valeur) && Number.isNaN(Number(valeur))) {
                erreurs[question.id] = "Saisis un nombre."
            }
        })

        setErreursReponses(erreurs)
        return Object.keys(erreurs).length === 0
    }

    const validerEtape = () => {
        if (indexEtape === 0) return validerCoordonnees()
        if (indexEtape === 1) return validerReponses()
        return true
    }

    const suivant = () => {
        if (!validerEtape()) return
        setEtape((prev) => Math.min(prev + 1, etapesActives.length - 1))
    }

    const precedent = () => setEtape((prev) => Math.max(prev - 1, 0))

    const televerser = async (fichier: File) => {
        if (fichier.size > RESUME_MAX_SIZE_BYTES) {
            setErreurCv("Le CV ne doit pas dépasser 5 Mo.")
            return
        }

        setErreurCv(null)
        setTeleversement(true)
        try {
            const res = await resumeService.upload(fichier)
            const cv = ((res as any)?.data ?? res) as IResume
            setCvs((prev) => [cv, ...prev])
            setCvChoisi(cv.id)
        } catch (err: any) {
            setErreurCv(err?.message ?? "Le téléversement du CV a échoué.")
        } finally {
            setTeleversement(false)
            if (inputFichier.current) inputFichier.current.value = ""
        }
    }

    const supprimerCv = async (id: string) => {
        const precedente = cvs
        setCvs((prev) => prev.filter((cv) => cv.id !== id))
        if (cvChoisi === id) setCvChoisi(precedente.find((cv) => cv.id !== id)?.id ?? null)
        try {
            await resumeService.remove(id)
        } catch {
            setCvs(precedente)
            toast.error("La suppression du CV a échoué.")
        }
    }

    /** Convertit les brouillons de réponses au format attendu par l'API. */
    const payloadReponses = (): JobApplicationPayload["answers"] =>
        questions
            .filter((question) => !valeurVide(reponses[question.id]))
            .map((question) => ({ questionId: question.id, value: reponses[question.id] }))

    const envoyer = async () => {
        // Re-contrôlé ici : on peut atteindre le récapitulatif puis revenir
        // vider un champ obligatoire avant de cliquer sur « Postuler ».
        if (!validerCoordonnees()) {
            setEtape(0)
            return
        }
        if (!validerReponses()) {
            setEtape(etapesActives.indexOf("Questions"))
            return
        }

        setEnvoi(true)
        try {
            await jobService.applyToJob(job.id, {
                phone: coordonnees.phone.trim() || undefined,
                location: coordonnees.location.trim() || undefined,
                coverLetter: coordonnees.coverLetter.trim() || undefined,
                resumeId: cvChoisi,
                answers: payloadReponses(),
            })
            toast.success("Candidature envoyée.")
            onApplied()
        } catch (err: any) {
            toast.error(err?.message ?? "L'envoi de ta candidature a échoué.")
        } finally {
            setEnvoi(false)
        }
    }

    const cvSelectionne = cvs.find((cv) => cv.id === cvChoisi) ?? null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[88vh] max-w-xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-[16px]">
                        Postuler - {job.title}
                    </DialogTitle>
                    <p className="text-[12px] text-muted-foreground">
                        {job.company?.name ?? "Entreprise"}
                    </p>
                </DialogHeader>

                <Stepper etapes={etapesActives} courante={etape} />

                {chargement ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-[#2f6de6] dark:text-primary" />
                    </div>
                ) : (
                    <div className="space-y-4 py-1">
                        {indexEtape === 0 && (
                            <EtapeCoordonnees
                                valeurs={coordonnees}
                                erreurs={erreursCoordonnees}
                                onChange={(champ, valeur) => {
                                    setCoordonnees((prev) => ({ ...prev, [champ]: valeur }))
                                    setErreursCoordonnees((prev) =>
                                        prev[champ] ? { ...prev, [champ]: undefined } : prev,
                                    )
                                }}
                            />
                        )}

                        {indexEtape === 1 && (
                            <EtapeQuestions
                                questions={questions}
                                reponses={reponses}
                                erreurs={erreursReponses}
                                onChange={setReponse}
                            />
                        )}

                        {indexEtape === 2 && (
                            <EtapeCv
                                cvs={cvs}
                                choisi={cvChoisi}
                                onChoisir={setCvChoisi}
                                onSupprimer={supprimerCv}
                                onTeleverser={televerser}
                                televersement={televersement}
                                erreur={erreurCv}
                                inputRef={inputFichier}
                            />
                        )}

                        {indexEtape === 3 && (
                            <EtapeRecapitulatif
                                coordonnees={coordonnees}
                                questions={questions}
                                reponses={reponses}
                                cv={cvSelectionne}
                            />
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                    <Button
                        variant="ghost"
                        className="rounded-full text-[12px]"
                        disabled={etape === 0 || envoi}
                        onClick={precedent}
                    >
                        Retour
                    </Button>

                    <span className="text-[11px] text-muted-foreground">
                        Étape {etape + 1} sur {etapesActives.length}
                    </span>

                    {etape < etapesActives.length - 1 ? (
                        <Button
                            className="rounded-full bg-brand-gradient hover:bg-brand-gradient-hover text-[12px]"
                            disabled={chargement}
                            onClick={suivant}
                        >
                            Continuer
                        </Button>
                    ) : (
                        <Button
                            className="rounded-full bg-brand-gradient hover:bg-brand-gradient-hover text-[12px]"
                            disabled={envoi}
                            onClick={envoyer}
                        >
                            {envoi ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Postuler
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function Stepper({ etapes, courante }: { etapes: readonly string[]; courante: number }) {
    return (
        <ol className="flex items-center gap-1.5">
            {etapes.map((etape, index) => {
                const faite = index < courante
                const active = index === courante
                return (
                    <li key={etape} className="flex flex-1 flex-col gap-1.5">
                        <span
                            className={`h-1 rounded-full ${
                                faite || active ? "bg-brand-gradient" : "bg-[#e8eef6] dark:bg-muted"
                            }`}
                        />
                        <span
                            className={`text-[10px] ${
                                active
                                    ? "font-semibold text-[#1b2331] dark:text-foreground"
                                    : "text-muted-foreground"
                            }`}
                        >
                            {faite ? <Check className="mr-0.5 inline h-3 w-3" /> : null}
                            {etape}
                        </span>
                    </li>
                )
            })}
        </ol>
    )
}

function EtapeCoordonnees({
    valeurs,
    erreurs,
    onChange,
}: {
    valeurs: Coordonnees
    erreurs: Partial<Record<keyof Coordonnees, string>>
    onChange: (champ: keyof Coordonnees, valeur: string) => void
}) {
    return (
        <div className="space-y-3">
            <p className="text-[12px] text-muted-foreground">
                Ces informations viennent de ton profil Goriya. Corrige-les si besoin : elles ne
                seront transmises qu&apos;à cette entreprise.
            </p>

            <Champ label="Nom complet" required error={erreurs.name}>
                <Input
                    value={valeurs.name}
                    aria-invalid={!!erreurs.name}
                    onChange={(e) => onChange("name", e.target.value)}
                />
            </Champ>

            <Champ label="Adresse e-mail" required error={erreurs.email}>
                <Input
                    type="email"
                    value={valeurs.email}
                    aria-invalid={!!erreurs.email}
                    onChange={(e) => onChange("email", e.target.value)}
                />
            </Champ>

            <Champ label="Téléphone">
                <Input
                    value={valeurs.phone}
                    placeholder="+225 ..."
                    onChange={(e) => onChange("phone", e.target.value)}
                />
            </Champ>

            <Champ label="Localisation">
                <Input
                    value={valeurs.location}
                    placeholder="Abidjan, Côte d'Ivoire"
                    onChange={(e) => onChange("location", e.target.value)}
                />
            </Champ>

            <Champ label="Message au recruteur" hint="Facultatif">
                <Textarea
                    rows={4}
                    value={valeurs.coverLetter}
                    placeholder="Quelques lignes sur ta motivation pour ce poste..."
                    onChange={(e) => onChange("coverLetter", e.target.value)}
                />
            </Champ>
        </div>
    )
}

function EtapeQuestions({
    questions,
    reponses,
    erreurs,
    onChange,
}: {
    questions: IJobOfferQuestion[]
    reponses: Record<string, AnswerDraft>
    erreurs: Record<string, string>
    onChange: (questionId: string, valeur: AnswerDraft) => void
}) {
    return (
        <div className="space-y-4">
            <p className="text-[12px] text-muted-foreground">
                L&apos;entreprise souhaite en savoir plus avant d&apos;étudier ta candidature.
            </p>

            {questions.map((question) => {
                const valeur = reponses[question.id]
                const erreur = erreurs[question.id]

                return (
                    <Champ
                        key={question.id}
                        label={question.label}
                        required={question.required}
                        error={erreur}
                    >
                        {question.type === "TEXTAREA" && (
                            <Textarea
                                rows={3}
                                value={(valeur as string) ?? ""}
                                aria-invalid={!!erreur}
                                onChange={(e) => onChange(question.id, e.target.value)}
                            />
                        )}

                        {question.type === "TEXT" && (
                            <Input
                                value={(valeur as string) ?? ""}
                                aria-invalid={!!erreur}
                                onChange={(e) => onChange(question.id, e.target.value)}
                            />
                        )}

                        {question.type === "NUMBER" && (
                            <Input
                                type="number"
                                inputMode="numeric"
                                value={(valeur as string) ?? ""}
                                aria-invalid={!!erreur}
                                onChange={(e) => onChange(question.id, e.target.value)}
                            />
                        )}

                        {question.type === "BOOLEAN" && (
                            <RadioGroup
                                value={(valeur as string) ?? ""}
                                onValueChange={(v) => onChange(question.id, v)}
                                className="flex gap-4"
                            >
                                {[
                                    { value: "true", label: "Oui" },
                                    { value: "false", label: "Non" },
                                ].map((option) => (
                                    <label
                                        key={option.value}
                                        className="flex items-center gap-2 text-[13px] text-foreground"
                                    >
                                        <RadioGroupItem value={option.value} />
                                        {option.label}
                                    </label>
                                ))}
                            </RadioGroup>
                        )}

                        {question.type === "SINGLE_CHOICE" && (
                            <RadioGroup
                                value={(valeur as string) ?? ""}
                                onValueChange={(v) => onChange(question.id, v)}
                                className="space-y-1.5"
                            >
                                {(question.options ?? []).map((option) => (
                                    <label
                                        key={option}
                                        className="flex items-center gap-2 text-[13px] text-foreground"
                                    >
                                        <RadioGroupItem value={option} />
                                        {option}
                                    </label>
                                ))}
                            </RadioGroup>
                        )}

                        {question.type === CHOIX_MULTIPLE && (
                            <div className="space-y-1.5">
                                {(question.options ?? []).map((option) => {
                                    const cochees = Array.isArray(valeur) ? valeur : []
                                    return (
                                        <label
                                            key={option}
                                            className="flex items-center gap-2 text-[13px] text-foreground"
                                        >
                                            <Checkbox
                                                checked={cochees.includes(option)}
                                                onCheckedChange={(checked) =>
                                                    onChange(
                                                        question.id,
                                                        checked
                                                            ? [...cochees, option]
                                                            : cochees.filter((o) => o !== option),
                                                    )
                                                }
                                            />
                                            {option}
                                        </label>
                                    )
                                })}
                            </div>
                        )}
                    </Champ>
                )
            })}
        </div>
    )
}

function EtapeCv({
    cvs,
    choisi,
    onChoisir,
    onSupprimer,
    onTeleverser,
    televersement,
    erreur,
    inputRef,
}: {
    cvs: IResume[]
    choisi: string | null
    onChoisir: (id: string) => void
    onSupprimer: (id: string) => void
    onTeleverser: (fichier: File) => void
    televersement: boolean
    erreur: string | null
    inputRef: React.RefObject<HTMLInputElement | null>
}) {
    return (
        <div className="space-y-3">
            <p className="text-[12px] text-muted-foreground">
                Choisis le CV à joindre à cette candidature. Tu peux en conserver plusieurs et
                sélectionner le plus pertinent à chaque offre.
            </p>

            {cvs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center">
                    <FileText className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                    <p className="text-[12px] text-muted-foreground">
                        Aucun CV enregistré. Ajoute-en un pour que le recruteur puisse te lire.
                    </p>
                </div>
            ) : (
                <RadioGroup value={choisi ?? ""} onValueChange={onChoisir} className="space-y-2">
                    {cvs.map((cv) => (
                        <label
                            key={cv.id}
                            className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                                choisi === cv.id
                                    ? "border-[#2f6de6] bg-[#f4f7ff] dark:border-primary dark:bg-muted"
                                    : "border-border"
                            }`}
                        >
                            <RadioGroupItem value={cv.id} />
                            <FileText className="h-4 w-4 shrink-0 text-[#2f6de6] dark:text-primary" />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13px] font-medium text-foreground">
                                    {cv.name}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    {formatTaille(cv.size)}
                                    {cv.isDefault && (
                                        <span className="ml-2 inline-flex items-center gap-0.5 text-[#2f6de6] dark:text-primary">
                                            <Star className="h-3 w-3 fill-current" />
                                            Par défaut
                                        </span>
                                    )}
                                </span>
                            </span>
                            <button
                                type="button"
                                className="text-muted-foreground transition-colors hover:text-destructive"
                                aria-label={`Supprimer ${cv.name}`}
                                onClick={(e) => {
                                    e.preventDefault()
                                    onSupprimer(cv.id)
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </label>
                    ))}
                </RadioGroup>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={RESUME_ACCEPT}
                className="hidden"
                onChange={(e) => {
                    const fichier = e.target.files?.[0]
                    if (fichier) onTeleverser(fichier)
                }}
            />

            <Button
                variant="outline"
                className="w-full rounded-full text-[12px]"
                disabled={televersement}
                onClick={() => inputRef.current?.click()}
            >
                {televersement ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Upload className="mr-2 h-4 w-4" />
                )}
                Ajouter un CV
            </Button>
            <p className="text-[11px] text-muted-foreground">PDF ou Word, 5 Mo maximum.</p>
            {erreur && <p className="text-[11px] text-destructive">{erreur}</p>}
        </div>
    )
}

function EtapeRecapitulatif({
    coordonnees,
    questions,
    reponses,
    cv,
}: {
    coordonnees: Coordonnees
    questions: IJobOfferQuestion[]
    reponses: Record<string, AnswerDraft>
    cv: IResume | null
}) {
    const afficher = (question: IJobOfferQuestion) => {
        const valeur = reponses[question.id]
        if (valeurVide(valeur)) return "Sans réponse"
        if (question.type === "BOOLEAN") return valeur === "true" ? "Oui" : "Non"
        return Array.isArray(valeur) ? valeur.join(", ") : valeur
    }

    return (
        <div className="space-y-4">
            <p className="text-[12px] text-muted-foreground">
                Vérifie une dernière fois : ta candidature ne pourra pas être renvoyée pour cette
                offre.
            </p>

            <Bloc titre="Coordonnées">
                <Ligne libelle="Nom" valeur={coordonnees.name} />
                <Ligne libelle="E-mail" valeur={coordonnees.email} />
                <Ligne libelle="Téléphone" valeur={coordonnees.phone || "Non renseigné"} />
                <Ligne libelle="Localisation" valeur={coordonnees.location || "Non renseignée"} />
            </Bloc>

            {questions.length > 0 && (
                <Bloc titre="Réponses aux questions">
                    {questions.map((question) => (
                        <Ligne key={question.id} libelle={question.label} valeur={afficher(question)} />
                    ))}
                </Bloc>
            )}

            {coordonnees.coverLetter.trim() !== "" && (
                <Bloc titre="Message au recruteur">
                    <p className="whitespace-pre-wrap text-[12px] text-muted-foreground">
                        {coordonnees.coverLetter}
                    </p>
                </Bloc>
            )}

            <Bloc titre="CV joint">
                {cv ? (
                    <p className="flex items-center gap-2 text-[12px] text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-[#22a05b]" />
                        {cv.name}
                    </p>
                ) : (
                    <p className="text-[12px] text-muted-foreground">
                        Aucun CV joint - reviens à l&apos;étape précédente pour en ajouter un.
                    </p>
                )}
            </Bloc>
        </div>
    )
}

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-border p-3">
            <p className="mb-2 text-[12px] font-semibold text-foreground">{titre}</p>
            <div className="space-y-1">{children}</div>
        </div>
    )
}

function Ligne({ libelle, valeur }: { libelle: string; valeur: string }) {
    return (
        <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[11px] text-muted-foreground">{libelle}</span>
            <span className="text-[12px] font-medium text-foreground">{valeur}</span>
        </div>
    )
}

function Champ({
    label,
    children,
    required,
    hint,
    error,
}: {
    label: string
    children: React.ReactNode
    required?: boolean
    hint?: string
    error?: string
}) {
    return (
        <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <Label className="text-[12px] font-medium text-foreground">
                    {label}
                    {required && <span className="ml-0.5 text-destructive">*</span>}
                </Label>
                {hint && !error && <span className="text-[11px] text-muted-foreground">{hint}</span>}
            </div>
            {children}
            {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
        </div>
    )
}
