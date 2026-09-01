"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { FileBadge2, Download, Save, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { generatePDF } from "@/lib/document-generator"
import { SubscriptionGate } from "@/components/subscription-gate"
import { useAuth } from "@/contexts/auth-context"
import { cvService } from "@/lib/api/cv.service"

// `type` (et non `interface`) pour rester assignable à Record<string, string>
// attendu par cvService.save().
type CVData = {
    nom: string
    email: string
    telephone: string
    adresse: string
    profil: string
    competences: string
    experience: string
    formation: string
    langues: string
}

const EMPTY_CV: CVData = {
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    profil: "",
    competences: "",
    experience: "",
    formation: "",
    langues: "",
}

const STEPS = [
    { id: "perso", label: "Informations personnelles", icon: "🧍" },
    { id: "experience", label: "Expériences professionnelle", icon: "👨‍💼" },
    { id: "formation", label: "Formation", icon: "📘" },
    { id: "competences", label: "Compétences", icon: "🏅" },
]

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

function CreerCVContent() {
    const { user } = useAuth()
    const storageKey = `goriya:cv-draft:${user?.id ?? "anon"}`

    const [analysisProgress, setAnalysisProgress] = useState(0)
    const [step, setStep] = useState(0)
    const [formData, setFormData] = useState<CVData>(EMPTY_CV)
    const [savedAt, setSavedAt] = useState<string | null>(null)
    const hydrated = useRef(false)

    const writeLocal = useCallback(
        (data: CVData, s: number, at: string) => {
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
                return JSON.parse(raw) as { data?: Partial<CVData>; step?: number; savedAt?: string }
            } catch {
                return null
            }
        }

        const apply = (data?: Partial<CVData>, s?: number, at?: string | null) => {
            setFormData({ ...EMPTY_CV, ...(data ?? {}) })
            if (typeof s === "number") setStep(Math.min(Math.max(s, 0), STEPS.length - 1))
            if (at) setSavedAt(at)
        }

        cvService
            .get()
            .then((res) => {
                if (cancelled) return
                const draft = res?.data
                const remote = (draft?.data ?? undefined) as Partial<CVData> | undefined
                apply(remote, draft?.step, draft?.updatedAt ?? null)
                if (remote) writeLocal({ ...EMPTY_CV, ...remote }, draft?.step ?? 0, draft?.updatedAt ?? new Date().toISOString())
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
        const allEmpty = Object.values(formData).every((v) => v.trim() === "")
        try {
            if (allEmpty && !localStorage.getItem(storageKey)) return
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

    const handleInputChange = (field: keyof CVData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

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
        const section = (title: string, body: string) => (body.trim() ? `\n${title.toUpperCase()}\n${body.trim()}\n` : "")
        const content =
            `${formData.nom || "Ton nom"}\n` +
            `${[formData.email, formData.telephone, formData.adresse].filter(Boolean).join(" · ")}\n` +
            section("Profil", formData.profil) +
            section("Expérience professionnelle", formData.experience) +
            section("Formation", formData.formation) +
            section("Compétences", formData.competences) +
            section("Langues", formData.langues)
        generatePDF(content, filename)
    }

    const isLast = step === STEPS.length - 1

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
                                    <p className="mt-1 text-[11px] text-[#7d86a0]">Construis ton CV professionnel</p>
                                </div>

                                <div className="space-y-2">
                                    {STEPS.map((s, i) => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => setStep(i)}
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
                                <div className="relative mb-2 flex justify-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2e6fe9] text-white">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                </div>
                                <p className="text-center text-[13px] font-semibold text-[#2e6fe9]">Analyse avec Goriya</p>
                                <p className="mb-2 text-center text-[11px] text-[#8b94ab]">Score d'optimisation de ton CV</p>

                                <div className="text-center text-[38px] font-bold leading-none text-[#2e6fe9]">{analysisProgress}%</div>
                                <Progress value={analysisProgress} className="mt-2 h-1.5 bg-[#e6eaf4]" />

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

                    <Card className="rounded-[12px] border-[#dfe5f1] bg-white">
                        <CardContent className="p-4">
                            <h2 className="mb-3 text-[15px] font-semibold text-[#2a3242]">{STEPS[step].label}</h2>

                            {step === 0 && (
                                <>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <Field label="Nom complet">
                                            <Input value={formData.nom} onChange={(e) => handleInputChange("nom", e.target.value)} placeholder="Ton nom complet" className={inputCls} />
                                        </Field>
                                        <Field label="Email">
                                            <Input value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="ton.email@exemple.com" className={inputCls} />
                                        </Field>
                                        <Field label="Téléphone">
                                            <Input value={formData.telephone} onChange={(e) => handleInputChange("telephone", e.target.value)} placeholder="+229 97 39 47 82" className={inputCls} />
                                        </Field>
                                        <Field label="Adresse">
                                            <Input value={formData.adresse} onChange={(e) => handleInputChange("adresse", e.target.value)} placeholder="Ville, Pays" className={inputCls} />
                                        </Field>
                                    </div>
                                    <div className="mt-3">
                                        <Field label="Résumé professionnel">
                                            <Textarea value={formData.profil} onChange={(e) => handleInputChange("profil", e.target.value)} placeholder="Décris brièvement ton profil professionnel..." className={`min-h-[112px] ${areaCls}`} />
                                        </Field>
                                    </div>
                                </>
                            )}

                            {step === 1 && (
                                <Field label="Expériences professionnelles">
                                    <Textarea
                                        value={formData.experience}
                                        onChange={(e) => handleInputChange("experience", e.target.value)}
                                        placeholder={"Poste — Entreprise (dates)\n• Réalisation 1\n• Réalisation 2\n\nPoste précédent — Entreprise (dates)\n• ..."}
                                        className={`min-h-[280px] ${areaCls}`}
                                    />
                                </Field>
                            )}

                            {step === 2 && (
                                <Field label="Formation">
                                    <Textarea
                                        value={formData.formation}
                                        onChange={(e) => handleInputChange("formation", e.target.value)}
                                        placeholder={"Diplôme — Établissement (année)\nDiplôme — Établissement (année)"}
                                        className={`min-h-[220px] ${areaCls}`}
                                    />
                                </Field>
                            )}

                            {step === 3 && (
                                <div className="space-y-3">
                                    <Field label="Compétences">
                                        <Textarea
                                            value={formData.competences}
                                            onChange={(e) => handleInputChange("competences", e.target.value)}
                                            placeholder="Ex : Gestion de projet, React, Communication, Analyse de données..."
                                            className={`min-h-[140px] ${areaCls}`}
                                        />
                                    </Field>
                                    <Field label="Langues">
                                        <Textarea
                                            value={formData.langues}
                                            onChange={(e) => handleInputChange("langues", e.target.value)}
                                            placeholder="Ex : Français (natif), Anglais (courant), Espagnol (notions)"
                                            className={`min-h-[90px] ${areaCls}`}
                                        />
                                    </Field>
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-between border-t border-[#eef1f7] pt-3">
                                <button
                                    type="button"
                                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                                    disabled={step === 0}
                                    className="inline-flex items-center gap-1 text-[12px] text-[#8b93a3] transition-colors hover:text-[#2a3242] disabled:opacity-40"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" /> Précédent
                                </button>
                                {!isLast && (
                                    <button
                                        type="button"
                                        onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                                        className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2f6de6] transition-colors hover:text-[#275ec6]"
                                    >
                                        Suivant <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
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
