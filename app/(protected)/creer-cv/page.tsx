"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileBadge2, Download, Plus, Save, Sparkles, Trash2 } from "lucide-react"
import { generatePDF } from "@/lib/document-generator"
import { SubscriptionGate } from "@/components/subscription-gate"
import { useAuth } from "@/contexts/auth-context"
import { cvService, type CvCompetence, type CvContent, type CvExperience, type CvFormation } from "@/lib/api/cv.service"

const EMPTY_EXPERIENCE: CvExperience = { entreprise: "", poste: "", dateDebut: "", dateFin: "", description: "" }
const EMPTY_FORMATION: CvFormation = { etablissement: "", diplome: "", dateDebut: "", dateFin: "" }
const EMPTY_COMPETENCE: CvCompetence = { nom: "", niveau: "Débutant" }

const NIVEAUX = ["Débutant", "Intermédiaire", "Avancé", "Expert"]

const EMPTY_CV: CvContent = {
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    profil: "",
    experiences: [],
    formations: [],
    competences: [],
}

const STEPS = [
    { id: "perso", label: "Informations personnelles", icon: "🧍" },
    { id: "experience", label: "Expérience professionnelle", icon: "👨‍💼" },
    { id: "formation", label: "Formation", icon: "📘" },
    { id: "competences", label: "Compétences", icon: "🏅" },
]

type ListKey = "experiences" | "formations" | "competences"

const str = (v: unknown) => (typeof v === "string" ? v : "")

const rows = (value: unknown): Record<string, unknown>[] =>
    Array.isArray(value) ? value.filter((r): r is Record<string, unknown> => !!r && typeof r === "object") : []

/**
 * Remet un brouillon relu (backend ou localStorage) dans la forme attendue par
 * le formulaire. Gère aussi les brouillons de la version précédente, où
 * expérience / formation / compétences étaient de simples zones de texte.
 */
function normalize(raw: Record<string, unknown> | null | undefined): CvContent {
    const src = raw ?? {}

    const experiences: CvExperience[] = rows(src.experiences).map((row) => ({
        entreprise: str(row.entreprise),
        poste: str(row.poste),
        dateDebut: str(row.dateDebut),
        dateFin: str(row.dateFin),
        description: str(row.description),
    }))
    const formations: CvFormation[] = rows(src.formations).map((row) => ({
        etablissement: str(row.etablissement),
        diplome: str(row.diplome),
        dateDebut: str(row.dateDebut),
        dateFin: str(row.dateFin),
    }))
    const competences: CvCompetence[] = rows(src.competences).map((row) => ({
        nom: str(row.nom),
        niveau: str(row.niveau) || "Débutant",
    }))

    // Reprise des anciens brouillons en texte libre.
    if (!experiences.length && str(src.experience).trim()) {
        experiences.push({ ...EMPTY_EXPERIENCE, description: str(src.experience).trim() })
    }
    if (!formations.length && str(src.formation).trim()) {
        formations.push({ ...EMPTY_FORMATION, diplome: str(src.formation).trim() })
    }
    if (!competences.length && typeof src.competences === "string") {
        for (const nom of src.competences.split(/[,\n;]/).map((c) => c.trim()).filter(Boolean)) {
            competences.push({ ...EMPTY_COMPETENCE, nom })
        }
    }

    return {
        nom: str(src.nom),
        email: str(src.email),
        telephone: str(src.telephone),
        adresse: str(src.adresse),
        profil: str(src.profil),
        experiences,
        formations,
        competences,
    }
}

const isEmptyCv = (cv: CvContent) =>
    !cv.nom.trim() &&
    !cv.email.trim() &&
    !cv.telephone.trim() &&
    !cv.adresse.trim() &&
    !cv.profil.trim() &&
    !cv.experiences.length &&
    !cv.formations.length &&
    !cv.competences.length

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div>
            <label className="mb-1 block text-[11px] text-[#8b93a3]">{label}</label>
            {children}
        </div>
    )
}

const inputCls = "h-8 rounded-[7px] border-0 bg-[#f1f2f5] text-[12px] shadow-none focus-visible:ring-0"
const areaCls = "resize-none rounded-[7px] border-0 bg-[#f1f2f5] text-[12px] shadow-none focus-visible:ring-0"

/** En-tête discret d'une entrée répétable : n° d'ordre + suppression. */
function EntryHeader({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8b93a3]">{label}</span>
            <button
                type="button"
                onClick={onRemove}
                aria-label={`Supprimer ${label}`}
                className="text-[#b6bdcb] transition-colors hover:text-[#e0685f]"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        </div>
    )
}

/** État vide d'une étape répétable (frame « Aucune expérience ajoutée »). */
function EmptyList({ title, hint }: { title: string; hint: string }) {
    return (
        <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
            <p className="text-[12px] text-[#8b93a3]">{title}</p>
            <p className="mt-1 text-[12px] text-[#8b93a3]">{hint}</p>
        </div>
    )
}

/** Bouton « Ajouter … » posé sous la carte, aligné à droite. */
function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <div className="mt-3 flex justify-end">
            <Button
                type="button"
                onClick={onClick}
                className="h-8 rounded-full bg-[#9aa1b1] px-4 text-[11px] text-white hover:bg-[#8a91a1]"
            >
                <Plus className="mr-1 h-3.5 w-3.5" />
                {label}
            </Button>
        </div>
    )
}

function ScoreGauge({ value }: { value: number }) {
    const radius = 42
    const circumference = 2 * Math.PI * radius
    const pct = Math.min(Math.max(value, 0), 100)
    return (
        <div className="relative mx-auto h-[110px] w-[110px]">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e7f3" strokeWidth="7" />
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#2e6fe9"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - pct / 100)}
                    className="transition-[stroke-dashoffset] duration-300"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[30px] font-bold leading-none text-[#2e6fe9]">
                {pct}%
            </div>
        </div>
    )
}

function CreerCVContent() {
    const { user } = useAuth()
    const storageKey = `goriya:cv-draft:${user?.id ?? "anon"}`

    const [analysisProgress, setAnalysisProgress] = useState(0)
    const [step, setStep] = useState(0)
    const [formData, setFormData] = useState<CvContent>(EMPTY_CV)
    const [savedAt, setSavedAt] = useState<string | null>(null)
    const hydrated = useRef(false)

    const writeLocal = useCallback(
        (data: CvContent, s: number, at: string) => {
            try {
                localStorage.setItem(storageKey, JSON.stringify({ data, step: s, savedAt: at }))
            } catch {
                /* quota / navigation privée : on ignore, le backend reste la source de vérité */
            }
        },
        [storageKey],
    )

    // ── Restauration du brouillon au montage (backend prioritaire, cache local
    //    en repli hors-ligne / non authentifié) ───────────────────────────────
    useEffect(() => {
        let cancelled = false

        const readLocal = () => {
            try {
                const raw = localStorage.getItem(storageKey)
                if (!raw) return null
                return JSON.parse(raw) as { data?: Record<string, unknown>; step?: number; savedAt?: string }
            } catch {
                return null
            }
        }

        const apply = (data: Record<string, unknown> | null | undefined, s?: number, at?: string | null) => {
            setFormData(normalize(data))
            if (typeof s === "number") setStep(Math.min(Math.max(s, 0), STEPS.length - 1))
            if (at) setSavedAt(at)
        }

        cvService
            .get()
            .then((res) => {
                if (cancelled) return
                const draft = res?.data
                const remote = (draft?.data ?? undefined) as Record<string, unknown> | undefined
                apply(remote, draft?.step, draft?.updatedAt ?? null)
                if (remote) writeLocal(normalize(remote), draft?.step ?? 0, draft?.updatedAt ?? new Date().toISOString())
            })
            .catch(() => {
                if (cancelled) return
                const local = readLocal()
                if (local) apply(local.data, local.step, local.savedAt ?? null)
            })
            .finally(() => {
                if (!cancelled) hydrated.current = true
            })

        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey])

    // ── Sauvegarde automatique (après hydratation) : cache local immédiat +
    //    persistance backend débouncée ───────────────────────────────────────
    useEffect(() => {
        if (!hydrated.current) return
        try {
            if (isEmptyCv(formData) && !localStorage.getItem(storageKey)) return
        } catch {
            return
        }

        const id = setTimeout(() => {
            const at = new Date().toISOString()
            writeLocal(formData, step, at)
            cvService
                .save({ data: formData, step })
                .then((res) => setSavedAt(res?.data?.updatedAt ?? at))
                .catch(() => {
                    // Hors-ligne : le cache local a déjà été écrit, resync au prochain chargement.
                    setSavedAt(at)
                })
        }, 800)
        return () => clearTimeout(id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData, step, writeLocal])

    const handleInputChange = (field: "nom" | "email" | "telephone" | "adresse" | "profil", value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    // ── Helpers des trois listes répétables ──────────────────────────────────
    const addExperience = () => setFormData((p) => ({ ...p, experiences: [...p.experiences, { ...EMPTY_EXPERIENCE }] }))
    const addFormation = () => setFormData((p) => ({ ...p, formations: [...p.formations, { ...EMPTY_FORMATION }] }))
    const addCompetence = () => setFormData((p) => ({ ...p, competences: [...p.competences, { ...EMPTY_COMPETENCE }] }))

    const removeEntry = (key: ListKey, index: number) =>
        setFormData((p) => {
            const drop = <T,>(list: T[]) => list.filter((_, i) => i !== index)
            if (key === "experiences") return { ...p, experiences: drop(p.experiences) }
            if (key === "formations") return { ...p, formations: drop(p.formations) }
            return { ...p, competences: drop(p.competences) }
        })

    const updateExperience = (i: number, field: keyof CvExperience, value: string) =>
        setFormData((p) => ({
            ...p,
            experiences: p.experiences.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)),
        }))

    const updateFormation = (i: number, field: keyof CvFormation, value: string) =>
        setFormData((p) => ({
            ...p,
            formations: p.formations.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)),
        }))

    const updateCompetence = (i: number, field: keyof CvCompetence, value: string) =>
        setFormData((p) => ({
            ...p,
            competences: p.competences.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)),
        }))

    const handleManualSave = async () => {
        const at = new Date().toISOString()
        writeLocal(formData, step, at)
        try {
            const res = await cvService.save({ data: formData, step })
            setSavedAt(res?.data?.updatedAt ?? at)
            toast.success("Brouillon enregistré")
        } catch {
            setSavedAt(at)
            toast.error("Enregistré localement — la synchronisation avec le serveur a échoué")
        }
    }

    const handleAnalyze = () => {
        setAnalysisProgress(0)
        let progress = 0
        const timer = setInterval(() => {
            progress += 10
            setAnalysisProgress(progress)
            if (progress >= 100) clearInterval(timer)
        }, 180)
    }

    const handleDownloadPDF = () => {
        const filename = `cv-${formData.nom.toLowerCase().replace(/\s+/g, "-") || "document"}.pdf`
        const periode = (debut: string, fin: string) => [debut, fin].filter(Boolean).join(" – ")
        const section = (title: string, body: string) => (body.trim() ? `\n${title.toUpperCase()}\n${body.trim()}\n` : "")

        const experiences = formData.experiences
            .map((e) =>
                [[e.poste, e.entreprise].filter(Boolean).join(" — "), periode(e.dateDebut, e.dateFin), e.description]
                    .filter(Boolean)
                    .join("\n"),
            )
            .filter(Boolean)
            .join("\n\n")

        const formations = formData.formations
            .map((f) =>
                [[f.diplome, f.etablissement].filter(Boolean).join(" — "), periode(f.dateDebut, f.dateFin)]
                    .filter(Boolean)
                    .join("\n"),
            )
            .filter(Boolean)
            .join("\n\n")

        const competences = formData.competences
            .filter((c) => c.nom.trim())
            .map((c) => `• ${c.nom}${c.niveau ? ` (${c.niveau})` : ""}`)
            .join("\n")

        const content =
            `${formData.nom || "Votre nom"}\n` +
            `${[formData.email, formData.telephone, formData.adresse].filter(Boolean).join(" · ")}\n` +
            section("Profil", formData.profil) +
            section("Expérience professionnelle", experiences) +
            section("Formation", formations) +
            section("Compétences", competences)
        generatePDF(content, filename)
    }

    return (
        <div className="min-h-[calc(100vh-80px)]">
            <div className="border-b border-[#d9dfea] px-4 py-4 sm:px-6">
                <h1 className="text-2xl sm:text-[32px] font-semibold leading-none text-[#1b2331]">Créer CV Intelligent</h1>
            </div>

            <div className="mx-auto w-full max-w-[1240px] px-4 py-4 sm:px-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
                    <div className="space-y-4">
                        <Card className="overflow-hidden rounded-[12px] border-[#dfe5f1] bg-[#edf0ff]">
                            <CardContent className="p-4">
                                <div className="mb-4 text-center">
                                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-white/80 text-[#2f6de6]">
                                        <FileBadge2 className="h-6 w-6" />
                                    </div>
                                    <p className="text-[15px] font-semibold text-[#1f4ec2]">Créateur de CV</p>
                                    <p className="mt-1 text-[11px] text-[#7d86a0]">Construisez votre CV professionnel</p>
                                </div>

                                <div className="space-y-2">
                                    {STEPS.map((s, i) => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setStep(i)}
                                            aria-current={i === step ? "step" : undefined}
                                            className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-[12px] transition-colors ${
                                                i === step
                                                    ? "bg-[#b8bfce] font-medium text-white"
                                                    : "text-[#8b94ab] hover:bg-white/60"
                                            }`}
                                        >
                                            <span>{s.icon}</span>
                                            <span>{s.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden rounded-[12px] border-[#e1e6f1] bg-[#f2f4fb]">
                            <CardContent className="p-4">
                                <div className="mb-2 flex justify-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2e6fe9] text-[20px] font-semibold leading-none text-white">
                                        g
                                    </div>
                                </div>
                                <p className="text-center text-[13px] font-semibold text-[#2e6fe9]">Analyse avec Goriya</p>
                                <p className="mb-3 text-center text-[11px] text-[#8b94ab]">Score d&apos;optimisation de votre CV</p>

                                <ScoreGauge value={analysisProgress} />

                                <div className="mt-3 space-y-2 text-[10px] text-[#99a3b8]">
                                    <div className="flex items-center justify-between">
                                        <span>Structure</span>
                                        <span className="text-[#8dc79b]">Excellent</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Mots-clés</span>
                                        <span className="text-[#c9b26f]">Moyen</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Expérience</span>
                                        <span className="text-[#8dc79b]">Très bon</span>
                                    </div>
                                </div>

                                <Button onClick={handleAnalyze} className="mt-3 h-8 w-full rounded-full bg-[#2e6fe9] text-[11px] hover:bg-[#275ec6]">
                                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                                    Analyser avec Goriya
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card className="rounded-[12px] border-[#dfe5f1] bg-white">
                            <CardContent className="p-4">
                                <h2 className="mb-3 text-[15px] font-semibold text-[#2a3242]">{STEPS[step].label}</h2>

                                {step === 0 && (
                                    <>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <Field label="Nom complet">
                                                <Input value={formData.nom} onChange={(e) => handleInputChange("nom", e.target.value)} placeholder="Votre nom complet" className={inputCls} />
                                            </Field>
                                            <Field label="Email">
                                                <Input value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="votre.email@exemple.com" className={inputCls} />
                                            </Field>
                                            <Field label="Téléphone">
                                                <Input value={formData.telephone} onChange={(e) => handleInputChange("telephone", e.target.value)} placeholder="+229 XX XX XX XX" className={inputCls} />
                                            </Field>
                                            <Field label="Adresse">
                                                <Input value={formData.adresse} onChange={(e) => handleInputChange("adresse", e.target.value)} placeholder="Ville, Pays" className={inputCls} />
                                            </Field>
                                        </div>
                                        <div className="mt-3">
                                            <Field label="Résumé professionnel">
                                                <Textarea value={formData.profil} onChange={(e) => handleInputChange("profil", e.target.value)} placeholder="Décrivez brièvement votre profil professionnel..." className={`min-h-[112px] ${areaCls}`} />
                                            </Field>
                                        </div>
                                    </>
                                )}

                                {step === 1 &&
                                    (formData.experiences.length === 0 ? (
                                        <EmptyList title="Aucune expérience ajoutée" hint={'Cliquez sur "Ajouter une expérience" pour commencer'} />
                                    ) : (
                                        <div className="space-y-4">
                                            {formData.experiences.map((exp, i) => (
                                                <div key={i} className={i > 0 ? "border-t border-[#eef1f7] pt-4" : undefined}>
                                                    <EntryHeader label={`Expérience ${i + 1}`} onRemove={() => removeEntry("experiences", i)} />
                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                        <Field label="Nom de l'entreprise">
                                                            <Input value={exp.entreprise} onChange={(e) => updateExperience(i, "entreprise", e.target.value)} placeholder="Nom de l'entreprise" className={inputCls} />
                                                        </Field>
                                                        <Field label="Poste">
                                                            <Input value={exp.poste} onChange={(e) => updateExperience(i, "poste", e.target.value)} placeholder="Intitulé du poste" className={inputCls} />
                                                        </Field>
                                                        <Field label="Date de début">
                                                            <Input value={exp.dateDebut} onChange={(e) => updateExperience(i, "dateDebut", e.target.value)} placeholder="jj/mm/aaaa" className={inputCls} />
                                                        </Field>
                                                        <Field label="Date de fin">
                                                            <Input value={exp.dateFin} onChange={(e) => updateExperience(i, "dateFin", e.target.value)} placeholder="jj/mm/aaaa" className={inputCls} />
                                                        </Field>
                                                    </div>
                                                    <div className="mt-3">
                                                        <Field label="Description">
                                                            <Textarea value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} placeholder="Décrivez vos missions et vos réalisations..." className={`min-h-[92px] ${areaCls}`} />
                                                        </Field>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}

                                {step === 2 &&
                                    (formData.formations.length === 0 ? (
                                        <EmptyList title="Aucune formation ajoutée" hint={'Cliquez sur "Ajouter une formation" pour commencer'} />
                                    ) : (
                                        <div className="space-y-4">
                                            {formData.formations.map((f, i) => (
                                                <div key={i} className={i > 0 ? "border-t border-[#eef1f7] pt-4" : undefined}>
                                                    <EntryHeader label={`Formation ${i + 1}`} onRemove={() => removeEntry("formations", i)} />
                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                        <Field label="Etablissement">
                                                            <Input value={f.etablissement} onChange={(e) => updateFormation(i, "etablissement", e.target.value)} placeholder="Nom de l'établissement" className={inputCls} />
                                                        </Field>
                                                        <Field label="Diplome/Formation">
                                                            <Input value={f.diplome} onChange={(e) => updateFormation(i, "diplome", e.target.value)} placeholder="Intitulé du diplôme" className={inputCls} />
                                                        </Field>
                                                        <Field label="Date de début">
                                                            <Input value={f.dateDebut} onChange={(e) => updateFormation(i, "dateDebut", e.target.value)} placeholder="jj/mm/aaaa" className={inputCls} />
                                                        </Field>
                                                        <Field label="Date de fin">
                                                            <Input value={f.dateFin} onChange={(e) => updateFormation(i, "dateFin", e.target.value)} placeholder="jj/mm/aaaa" className={inputCls} />
                                                        </Field>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}

                                {step === 3 &&
                                    (formData.competences.length === 0 ? (
                                        <EmptyList title="Aucune compétence ajoutée" hint={'Cliquez sur "Ajouter une compétence" pour commencer'} />
                                    ) : (
                                        <div className="space-y-4">
                                            {formData.competences.map((c, i) => (
                                                <div key={i} className={i > 0 ? "border-t border-[#eef1f7] pt-4" : undefined}>
                                                    <EntryHeader label={`Compétence ${i + 1}`} onRemove={() => removeEntry("competences", i)} />
                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                        <Field label="Compétence">
                                                            <Input value={c.nom} onChange={(e) => updateCompetence(i, "nom", e.target.value)} placeholder="Ex : React" className={inputCls} />
                                                        </Field>
                                                        <Field label="Niveau">
                                                            <Select value={c.niveau || "Débutant"} onValueChange={(v) => updateCompetence(i, "niveau", v)}>
                                                                <SelectTrigger className={`${inputCls} px-3`}>
                                                                    <SelectValue placeholder="Débutant" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {NIVEAUX.map((n) => (
                                                                        <SelectItem key={n} value={n} className="text-[12px]">
                                                                            {n}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </Field>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                            </CardContent>
                        </Card>

                        {step === 1 && <AddButton label="Ajouter une expérience" onClick={addExperience} />}
                        {step === 2 && <AddButton label="Ajouter une formation" onClick={addFormation} />}
                        {step === 3 && <AddButton label="Ajouter une compétence" onClick={addCompetence} />}
                    </div>
                </div>

                <div className="mx-auto mt-6 flex w-full max-w-[720px] flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button
                        variant="ghost"
                        onClick={handleManualSave}
                        className="h-9 w-full sm:min-w-[230px] sm:w-auto rounded-full bg-[#f0f2f8] text-[12px] text-[#5b6474] hover:bg-[#e6eaf4]"
                    >
                        <Save className="mr-1.5 h-3.5 w-3.5" />
                        Sauvegarder
                    </Button>
                    <Button
                        onClick={handleDownloadPDF}
                        className="h-9 w-full sm:min-w-[330px] sm:w-auto rounded-full bg-[#7fa6e8] text-[12px] text-white hover:bg-[#6f96d8]"
                    >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Télécharger
                    </Button>
                </div>

                {savedAt && (
                    <p className="mt-2 text-center text-[10px] text-[#aab2c2]">Brouillon enregistré automatiquement</p>
                )}
            </div>
        </div>
    )
}

export default function Page() {
    return (
        <SubscriptionGate featureLabel="la création de CV assistée par IA">
            <CreerCVContent />
        </SubscriptionGate>
    )
}
