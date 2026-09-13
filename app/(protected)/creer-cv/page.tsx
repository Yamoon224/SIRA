"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useIsMobile } from "@/components/ui/use-mobile"
import { FileBadge2, ChevronDown, CloudOff, Download, FolderPlus, Loader2, Plus, Save, Sparkles, Trash2 } from "lucide-react"
import { generatePDF, generatePDFFile } from "@/lib/document-generator"
import { SubscriptionGate } from "@/components/subscription-gate"
import { AutocompleteInput } from "@/components/autocomplete-input"
import { useAuth } from "@/contexts/auth-context"
import { cvService, type CvCompetence, type CvContent, type CvExperience, type CvFormation } from "@/lib/api/cv.service"
import { resumeService } from "@/lib/api/resume.service"
import { formatDerniereSauvegarde } from "@/lib/cv-draft"
import { featureUsageService } from "@/lib/api/feature-usage.service"
import { QuotaExceededNotice } from "@/components/feature-usage/quota-exceeded-notice"
import {
    INDICATIF_PAR_DEFAUT,
    LOCALISATIONS,
    PAYS_AFRICAINS,
    PAYS_PAR_DEFAUT,
    drapeau,
    separerIndicatif,
} from "@/lib/data/afrique"
import { POSTES } from "@/lib/data/postes"

const EMPTY_EXPERIENCE: CvExperience = { entreprise: "", poste: "", dateDebut: "", dateFin: "", enCours: false, description: "" }
const EMPTY_FORMATION: CvFormation = { etablissement: "", diplome: "", dateDebut: "", dateFin: "" }
const EMPTY_COMPETENCE: CvCompetence = { nom: "", niveau: "Débutant" }

const NIVEAUX = ["Débutant", "Intermédiaire", "Avancé", "Expert"]
const DIPLOMES = ["Bac", "BTS", "Licence", "Master", "Doctorat", "Professorat"]

const EMPTY_CV: CvContent = {
    nom: "",
    email: "",
    indicatif: INDICATIF_PAR_DEFAUT,
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

/**
 * État de l'auto-sauvegarde. `local` distingue explicitement « écrit sur cet
 * appareil » de « synchronisé » : sans ça on promettrait une reprise depuis un
 * autre appareil qui n'aurait pas lieu.
 */
type SaveState = "idle" | "saving" | "saved" | "local"

const str = (v: unknown) => (typeof v === "string" ? v : "")

const bool = (v: unknown) => v === true || v === 1 || v === "1" || v === "true"

/**
 * Ramène une date au format attendu par `<input type="date">`. Les anciens
 * brouillons contenaient du texte libre ; ce qui n'est pas reconnu est perdu
 * plutôt que d'afficher un champ date vide sur une valeur invisible.
 */
const toIsoDate = (v: unknown): string => {
    const raw = str(v).trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
    const fr = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (fr) return `${fr[3]}-${fr[2]}-${fr[1]}`
    return ""
}

const rows = (value: unknown): Record<string, unknown>[] =>
    Array.isArray(value) ? value.filter((r): r is Record<string, unknown> => !!r && typeof r === "object") : []

/**
 * Remet un brouillon relu (backend ou localStorage) dans la forme attendue par
 * le formulaire. Gère aussi les brouillons de la version précédente, où
 * expérience / formation / compétences étaient de simples zones de texte.
 */
function normalize(raw: Record<string, unknown> | null | undefined): CvContent {
    const src = raw ?? {}

    const experiences: CvExperience[] = rows(src.experiences).map((row) => {
        const enCours = bool(row.enCours)
        return {
            entreprise: str(row.entreprise),
            poste: str(row.poste),
            dateDebut: toIsoDate(row.dateDebut),
            dateFin: enCours ? "" : toIsoDate(row.dateFin),
            enCours,
            description: str(row.description),
        }
    })
    const formations: CvFormation[] = rows(src.formations).map((row) => ({
        etablissement: str(row.etablissement),
        // Le diplôme est désormais contraint : une valeur hors liste est ignorée.
        diplome: DIPLOMES.includes(str(row.diplome)) ? str(row.diplome) : "",
        dateDebut: toIsoDate(row.dateDebut),
        dateFin: toIsoDate(row.dateFin),
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
        // Le diplôme étant maintenant une liste fermée, le texte libre hérité
        // atterrit dans l'établissement plutôt que d'être perdu.
        formations.push({ ...EMPTY_FORMATION, etablissement: str(src.formation).trim() })
    }
    if (!competences.length && typeof src.competences === "string") {
        for (const nom of src.competences.split(/[,\n;]/).map((c) => c.trim()).filter(Boolean)) {
            competences.push({ ...EMPTY_COMPETENCE, nom })
        }
    }

    // Anciens brouillons : le numéro était saisi d'un bloc, indicatif compris.
    const separe = separerIndicatif(str(src.telephone))
    const indicatif = str(src.indicatif) || separe.indicatif || INDICATIF_PAR_DEFAUT

    return {
        nom: str(src.nom),
        email: str(src.email),
        indicatif,
        telephone: str(src.indicatif) ? str(src.telephone) : separe.numero,
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
    // `min-w-0` : sans ça un champ à largeur intrinsèque (date natif) refuse de
    // rétrécir sous la largeur de sa colonne et déborde sur mobile.
    return (
        <div className="min-w-0">
            <label className="mb-1 block text-[11px] text-[#8b93a3] dark:text-muted-foreground">{label}</label>
            {children}
        </div>
    )
}

const inputCls = "h-8 rounded-[7px] border-0 bg-[#f1f2f5] dark:bg-muted text-[12px] shadow-none focus-visible:ring-0"
const areaCls = "resize-none rounded-[7px] border-0 bg-[#f1f2f5] dark:bg-muted text-[12px] shadow-none focus-visible:ring-0"

/** En-tête discret d'une entrée répétable : n° d'ordre + suppression. */
function EntryHeader({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8b93a3] dark:text-muted-foreground">{label}</span>
            <button
                type="button"
                onClick={onRemove}
                aria-label={`Supprimer ${label}`}
                className="text-[#b6bdcb] dark:text-muted-foreground transition-colors hover:text-[#e0685f]"
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
            <p className="text-[12px] text-[#8b93a3] dark:text-muted-foreground">{title}</p>
            <p className="mt-1 text-[12px] text-[#8b93a3] dark:text-muted-foreground">{hint}</p>
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
            <div className="absolute inset-0 flex items-center justify-center text-[22px] font-bold leading-none text-[#2e6fe9] dark:text-primary">
                {pct}%
            </div>
        </div>
    )
}

function CreerCVContent() {
    const { user } = useAuth()
    const storageKey = `goriya:cv-draft:${user?.id ?? "anon"}`
    // Sous 768px les étapes deviennent un accordéon ; au-dessus, sidebar + carte.
    const isMobile = useIsMobile()

    const [analysisProgress, setAnalysisProgress] = useState(0)
    const [step, setStep] = useState(0)
    const [formData, setFormData] = useState<CvContent>(EMPTY_CV)
    const [savedAt, setSavedAt] = useState<string | null>(null)
    const [saveState, setSaveState] = useState<SaveState>("idle")
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [enregistrementBibliotheque, setEnregistrementBibliotheque] = useState(false)
    const [quotaLimit, setQuotaLimit] = useState<number | null>(null)
    const router = useRouter()
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

        const apply = (
            data: Record<string, unknown> | null | undefined,
            s: number | undefined,
            at: string | null | undefined,
            etat: SaveState,
        ) => {
            setFormData(normalize(data))
            if (typeof s === "number") setStep(Math.min(Math.max(s, 0), STEPS.length - 1))
            if (at) {
                setSavedAt(at)
                setSaveState(etat)
            }
        }

        cvService
            .get()
            .then((res) => {
                if (cancelled) return
                const draft = res?.data
                const remote = (draft?.data ?? undefined) as Record<string, unknown> | undefined
                apply(remote, draft?.step, draft?.updatedAt ?? null, "saved")
                if (remote) writeLocal(normalize(remote), draft?.step ?? 0, draft?.updatedAt ?? new Date().toISOString())
            })
            .catch(() => {
                if (cancelled) return
                // Repli hors-ligne : ce brouillon n'est pas (encore) sur le serveur.
                const local = readLocal()
                if (local) apply(local.data, local.step, local.savedAt ?? null, "local")
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

        setSaveState("saving")
        const id = setTimeout(() => {
            const at = new Date().toISOString()
            writeLocal(formData, step, at)
            cvService
                .save({ data: formData, step })
                .then((res) => {
                    setSavedAt(res?.data?.updatedAt ?? at)
                    setSaveState("saved")
                })
                .catch(() => {
                    // Hors-ligne : le cache local a déjà été écrit, resync au prochain chargement.
                    setSavedAt(at)
                    setSaveState("local")
                })
        }, 800)
        return () => clearTimeout(id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData, step, writeLocal])

    const handleInputChange = (
        field: "nom" | "email" | "indicatif" | "telephone" | "adresse" | "profil",
        value: string,
    ) => {
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

    const updateExperience = (i: number, field: keyof CvExperience, value: string | boolean) =>
        setFormData((p) => ({
            ...p,
            experiences: p.experiences.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)),
        }))

    /** « Je travaille actuellement ici » : coché, la date de fin est vidée. */
    const toggleExperienceEnCours = (i: number, enCours: boolean) =>
        setFormData((p) => ({
            ...p,
            experiences: p.experiences.map((row, idx) =>
                idx === i ? { ...row, enCours, dateFin: enCours ? "" : row.dateFin } : row,
            ),
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
        setSaveState("saving")
        writeLocal(formData, step, at)
        try {
            const res = await cvService.save({ data: formData, step })
            setSavedAt(res?.data?.updatedAt ?? at)
            setSaveState("saved")
            toast.success("Brouillon enregistré")
        } catch {
            setSavedAt(at)
            setSaveState("local")
            toast.error("Enregistré localement - la synchronisation avec le serveur a échoué")
        }
    }

    /** Repart d'un formulaire vierge : serveur + cache local. */
    const handleDeleteDraft = async () => {
        setConfirmDelete(false)
        try {
            localStorage.removeItem(storageKey)
        } catch {
            /* navigation privée : rien à nettoyer */
        }
        // L'état est remis à zéro avant l'appel : le garde de l'auto-sauvegarde
        // (CV vide + plus de cache local) empêche une réécriture immédiate.
        setFormData(EMPTY_CV)
        setStep(0)
        setSavedAt(null)
        setSaveState("idle")
        try {
            await cvService.remove()
            toast.success("Brouillon supprimé")
        } catch {
            toast.error("Brouillon effacé sur cet appareil - la suppression côté serveur a échoué")
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

    const indicatif = formData.indicatif || INDICATIF_PAR_DEFAUT
    const paysIndicatif = PAYS_AFRICAINS.find((p) => p.indicatif === indicatif) ?? PAYS_PAR_DEFAUT

    /**
     * Texte du CV et nom de fichier, partagés par le téléchargement et par
     * l'enregistrement dans « Mes CV » : les deux doivent produire le même PDF.
     */
    const construireCv = () => {
        const filename = `cv-${formData.nom.toLowerCase().replace(/\s+/g, "-") || "document"}.pdf`
        // Les dates sont stockées en ISO ; le PDF les rend au format français.
        const fr = (iso: string) => {
            const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
            return m ? `${m[3]}/${m[2]}/${m[1]}` : iso
        }
        const periode = (debut: string, fin: string) => [fr(debut), fr(fin)].filter(Boolean).join(" – ")
        const section = (title: string, body: string) => (body.trim() ? `\n${title.toUpperCase()}\n${body.trim()}\n` : "")

        const experiences = formData.experiences
            .map((e) =>
                [
                    [e.poste, e.entreprise].filter(Boolean).join(" - "),
                    e.enCours ? periode(e.dateDebut, "") + (e.dateDebut ? " – En cours" : "En cours") : periode(e.dateDebut, e.dateFin),
                    e.description,
                ]
                    .filter(Boolean)
                    .join("\n"),
            )
            .filter(Boolean)
            .join("\n\n")

        const formations = formData.formations
            .map((f) =>
                [[f.diplome, f.etablissement].filter(Boolean).join(" - "), periode(f.dateDebut, f.dateFin)]
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
            `${[formData.email, formData.telephone ? `${indicatif} ${formData.telephone}` : "", formData.adresse].filter(Boolean).join(" · ")}\n` +
            section("Profil", formData.profil) +
            section("Expérience professionnelle", experiences) +
            section("Formation", formations) +
            section("Compétences", competences)

        return { content, filename }
    }

    const handleDownloadPDF = () => {
        const { content, filename } = construireCv()
        generatePDF(content, filename)
    }

    /**
     * Dépose le CV du formulaire dans la bibliothèque « Mes CV », d'où il peut
     * être joint à une candidature. Le backend remplace le PDF déjà produit par
     * le créateur plutôt que d'en empiler une nouvelle version.
     */
    const handleSaveToLibrary = async () => {
        if (!formData.nom.trim()) {
            toast.error("Indiquez votre nom avant d'enregistrer le CV.")
            setStep(0)
            return
        }

        setEnregistrementBibliotheque(true)
        setQuotaLimit(null)
        try {
            // Pré-vérification : le créateur de CV est une fonctionnalité
            // "Limité" (Standard: 5, Premium: 20) - voir UserFeatureUsageService.
            // Le backend revalide (et consomme) au moment de l'upload, cette
            // vérification n'est qu'un confort évitant de générer le PDF pour rien.
            const usage = await featureUsageService.status("cv_creation")
            if (!usage.allowed) {
                setQuotaLimit(usage.limit)
                return
            }

            const { content, filename } = construireCv()
            const nom = `CV ${formData.nom.trim()}`
            await resumeService.upload(generatePDFFile(content, filename), nom, "builder")
            toast.success("CV enregistré dans « Mes CV »", {
                action: { label: "Voir", onClick: () => router.push("/mes-cv") },
            })
        } catch (err: any) {
            toast.error(err?.message ?? "L'enregistrement du CV a échoué.")
        } finally {
            setEnregistrementBibliotheque(false)
        }
    }

    /**
     * Champs d'une étape, partagés par les deux mises en page (carte sur
     * desktop, panneau d'accordéon sur mobile).
     */
    const champsEtape = (i: number) => (
        <>
            {i === 0 && (
                <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Nom complet">
                            <Input value={formData.nom} onChange={(e) => handleInputChange("nom", e.target.value)} placeholder="Votre nom complet" className={inputCls} />
                        </Field>
                        <Field label="Email">
                            <Input value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="votre.email@exemple.com" className={inputCls} />
                        </Field>
                        <Field label="Téléphone">
                            <div className="flex gap-2">
                                <Select value={indicatif} onValueChange={(v) => handleInputChange("indicatif", v)}>
                                    {/* Contenu du déclencheur écrit à la main : SelectValue reprendrait
                                        le libellé complet de l'item (drapeau + indicatif + pays). */}
                                    <SelectTrigger className={`${inputCls} w-[104px] shrink-0 px-2`} aria-label="Indicatif pays">
                                        <span className="flex items-center gap-1">
                                            <span>{drapeau(paysIndicatif.iso)}</span>
                                            <span>{paysIndicatif.indicatif}</span>
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64">
                                        {PAYS_AFRICAINS.map((p) => (
                                            <SelectItem key={p.iso} value={p.indicatif} className="text-[12px]">
                                                <span className="mr-1.5">{drapeau(p.iso)}</span>
                                                {p.indicatif}
                                                <span className="ml-1.5 text-[#8b93a3] dark:text-muted-foreground">{p.nom}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="tel"
                                    inputMode="tel"
                                    value={formData.telephone}
                                    onChange={(e) => handleInputChange("telephone", e.target.value)}
                                    placeholder="07 39 47 82"
                                    className={inputCls}
                                />
                            </div>
                        </Field>
                        <Field label="Adresse">
                            <AutocompleteInput
                                value={formData.adresse}
                                onChange={(v) => handleInputChange("adresse", v)}
                                options={LOCALISATIONS}
                                placeholder="Ville, Pays"
                                className={inputCls}
                                aria-label="Adresse ou localisation"
                            />
                        </Field>
                    </div>
                    <div className="mt-3">
                        <Field label="Résumé professionnel">
                            <Textarea value={formData.profil} onChange={(e) => handleInputChange("profil", e.target.value)} placeholder="Décrivez brièvement votre profil professionnel..." className={`min-h-[112px] ${areaCls}`} />
                        </Field>
                    </div>
                </>
            )}

            {i === 1 &&
                (formData.experiences.length === 0 ? (
                    <EmptyList title="Aucune expérience ajoutée" hint={'Cliquez sur "Ajouter une expérience" pour commencer'} />
                ) : (
                    <div className="space-y-4">
                        {formData.experiences.map((exp, idx) => (
                            <div key={idx} className={idx > 0 ? "border-t border-[#eef1f7] dark:border-border pt-4" : undefined}>
                                <EntryHeader label={`Expérience ${idx + 1}`} onRemove={() => removeEntry("experiences", idx)} />
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <Field label="Nom de l'entreprise">
                                        <Input value={exp.entreprise} onChange={(e) => updateExperience(idx, "entreprise", e.target.value)} placeholder="Nom de l'entreprise" className={inputCls} />
                                    </Field>
                                    <Field label="Poste">
                                        <AutocompleteInput
                                            value={exp.poste}
                                            onChange={(v) => updateExperience(idx, "poste", v)}
                                            options={POSTES}
                                            placeholder="Intitulé du poste"
                                            className={inputCls}
                                            aria-label="Intitulé du poste"
                                        />
                                    </Field>
                                    <Field label="Date de début">
                                        <Input
                                            type="date"
                                            value={exp.dateDebut}
                                            max={exp.dateFin || undefined}
                                            onChange={(e) => updateExperience(idx, "dateDebut", e.target.value)}
                                            className={inputCls}
                                        />
                                    </Field>
                                    <Field label="Date de fin">
                                        {exp.enCours ? (
                                            <div className="flex h-8 items-center rounded-[7px] bg-[#f1f2f5] dark:bg-muted px-3 text-[12px] text-[#8b93a3] dark:text-muted-foreground">
                                                En cours
                                            </div>
                                        ) : (
                                            <Input
                                                type="date"
                                                value={exp.dateFin}
                                                min={exp.dateDebut || undefined}
                                                onChange={(e) => updateExperience(idx, "dateFin", e.target.value)}
                                                className={inputCls}
                                            />
                                        )}
                                    </Field>
                                </div>
                                <label className="mt-2 flex cursor-pointer items-center gap-2 text-[12px] text-[#5b6474] dark:text-muted-foreground">
                                    <Checkbox
                                        checked={exp.enCours}
                                        onCheckedChange={(c) => toggleExperienceEnCours(idx, c === true)}
                                    />
                                    J&apos;occupe actuellement ce poste
                                </label>
                                <div className="mt-3">
                                    <Field label="Description">
                                        <Textarea value={exp.description} onChange={(e) => updateExperience(idx, "description", e.target.value)} placeholder="Décrivez vos missions et vos réalisations..." className={`min-h-[92px] ${areaCls}`} />
                                    </Field>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

            {i === 2 &&
                (formData.formations.length === 0 ? (
                    <EmptyList title="Aucune formation ajoutée" hint={'Cliquez sur "Ajouter une formation" pour commencer'} />
                ) : (
                    <div className="space-y-4">
                        {formData.formations.map((f, idx) => (
                            <div key={idx} className={idx > 0 ? "border-t border-[#eef1f7] dark:border-border pt-4" : undefined}>
                                <EntryHeader label={`Formation ${idx + 1}`} onRemove={() => removeEntry("formations", idx)} />
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <Field label="Etablissement">
                                        <Input value={f.etablissement} onChange={(e) => updateFormation(idx, "etablissement", e.target.value)} placeholder="Nom de l'établissement" className={inputCls} />
                                    </Field>
                                    <Field label="Diplome/Formation">
                                        {/* Radix affiche le placeholder tant que la valeur vaut "". */}
                                        <Select value={f.diplome} onValueChange={(v) => updateFormation(idx, "diplome", v)}>
                                            <SelectTrigger className={`${inputCls} px-3`} aria-label="Diplôme">
                                                <SelectValue placeholder="Sélectionnez un diplôme" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DIPLOMES.map((d) => (
                                                    <SelectItem key={d} value={d} className="text-[12px]">
                                                        {d}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field label="Date de début">
                                        <Input
                                            type="date"
                                            value={f.dateDebut}
                                            max={f.dateFin || undefined}
                                            onChange={(e) => updateFormation(idx, "dateDebut", e.target.value)}
                                            className={inputCls}
                                        />
                                    </Field>
                                    <Field label="Date de fin">
                                        <Input
                                            type="date"
                                            value={f.dateFin}
                                            min={f.dateDebut || undefined}
                                            onChange={(e) => updateFormation(idx, "dateFin", e.target.value)}
                                            className={inputCls}
                                        />
                                    </Field>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

            {i === 3 &&
                (formData.competences.length === 0 ? (
                    <EmptyList title="Aucune compétence ajoutée" hint={'Cliquez sur "Ajouter une compétence" pour commencer'} />
                ) : (
                    <div className="space-y-4">
                        {formData.competences.map((c, idx) => (
                            <div key={idx} className={idx > 0 ? "border-t border-[#eef1f7] dark:border-border pt-4" : undefined}>
                                <EntryHeader label={`Compétence ${idx + 1}`} onRemove={() => removeEntry("competences", idx)} />
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <Field label="Compétence">
                                        <Input value={c.nom} onChange={(e) => updateCompetence(idx, "nom", e.target.value)} placeholder="Ex : React" className={inputCls} />
                                    </Field>
                                    <Field label="Niveau">
                                        <Select value={c.niveau || "Débutant"} onValueChange={(v) => updateCompetence(idx, "niveau", v)}>
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
        </>
    )

    /** Bouton « Ajouter … » propre aux étapes répétables. */
    const boutonAjout = (i: number) => {
        if (i === 1) return <AddButton label="Ajouter une expérience" onClick={addExperience} />
        if (i === 2) return <AddButton label="Ajouter une formation" onClick={addFormation} />
        if (i === 3) return <AddButton label="Ajouter une compétence" onClick={addCompetence} />
        return null
    }

    const carteAnalyse = (
        <Card className="overflow-hidden rounded-[12px] border-[#e1e6f1] dark:border-border bg-[#f2f4fb] dark:bg-muted">
            <CardContent className="p-4">
                <div className="mb-2 flex justify-center">
                    <img src="/goriya-logo-mark.png" alt="" aria-hidden className="h-10 w-10 object-contain dark:brightness-0 dark:invert" />
                </div>
                <p className="text-center text-[13px] font-semibold text-[#2e6fe9] dark:text-primary">Analyse avec Goriya</p>
                <p className="mb-3 text-center text-[11px] text-[#8b94ab] dark:text-muted-foreground">Score d&apos;optimisation de votre CV</p>

                <ScoreGauge value={analysisProgress} />

                <div className="mt-3 space-y-2 text-[10px] text-[#99a3b8] dark:text-muted-foreground">
                    <div className="flex items-center justify-between">
                        <span>Structure</span>
                        <span className="text-[#8dc79b] dark:text-muted-foreground">Excellent</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Mots-clés</span>
                        <span className="text-[#c9b26f]">Moyen</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Expérience</span>
                        <span className="text-[#8dc79b] dark:text-muted-foreground">Très bon</span>
                    </div>
                </div>

                <Button onClick={handleAnalyze} className="mt-3 h-8 w-full rounded-full bg-brand-gradient text-[11px] hover:bg-brand-gradient-hover">
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    Analyser avec Goriya
                </Button>
            </CardContent>
        </Card>
    )

    return (
        <div className="min-h-[calc(100vh-80px)]">
            <div className="border-b border-[#d9dfea] dark:border-border px-4 py-4 sm:px-6">
                <h1 className="text-2xl sm:text-[32px] font-semibold leading-none text-[#1b2331] dark:text-foreground">Créer CV Intelligent</h1>
            </div>

            <div className="mx-auto w-full max-w-[1240px] px-4 py-4 sm:px-6">
                {isMobile ? (
                    // ── Mobile : une étape = un panneau d'accordéon. `step` pilote
                    //    l'ouverture, donc un seul panneau est ouvert à la fois et
                    //    il le reste tant qu'on remplit ses champs.
                    <div className="space-y-3">
                        {STEPS.map((s, i) => {
                            const ouvert = i === step
                            return (
                                <div
                                    key={s.id}
                                    className={`rounded-[12px] border bg-white dark:bg-card ${ouvert ? "border-[#c9d5f2] dark:border-border" : "border-[#dfe5f1] dark:border-border"}`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setStep(i)}
                                        aria-expanded={ouvert}
                                        aria-controls={`cv-section-${s.id}`}
                                        className={`flex w-full items-center gap-2 rounded-t-[12px] px-4 py-3 text-left text-[13px] transition-colors ${
                                            ouvert ? "font-medium text-[#1f4ec2] dark:text-primary" : "text-[#5b6474] dark:text-muted-foreground"
                                        }`}
                                    >
                                        <span>{s.icon}</span>
                                        <span className="flex-1">{s.label}</span>
                                        <ChevronDown
                                            className={`h-4 w-4 shrink-0 text-[#8b93a3] dark:text-muted-foreground transition-transform duration-200 ${ouvert ? "rotate-180" : ""}`}
                                        />
                                    </button>
                                    {ouvert && (
                                        <div id={`cv-section-${s.id}`} className="border-t border-[#eef1f7] dark:border-border p-4">
                                            {champsEtape(i)}
                                            {boutonAjout(i)}
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {carteAnalyse}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
                        <div className="space-y-4">
                            <Card className="overflow-hidden rounded-[12px] border-[#dfe5f1] dark:border-border bg-[#edf0ff] dark:bg-primary/10">
                                <CardContent className="p-4">
                                    <div className="mb-4 text-center">
                                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-white/80 text-[#2f6de6] dark:text-primary">
                                            <FileBadge2 className="h-6 w-6" />
                                        </div>
                                        <p className="text-[15px] font-semibold text-[#1f4ec2] dark:text-primary">Créateur de CV</p>
                                        <p className="mt-1 text-[11px] text-[#7d86a0] dark:text-muted-foreground">Construisez votre CV professionnel</p>
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
                                                        ? "bg-[#b8bfce] dark:bg-primary/10 font-medium text-white"
                                                        : "text-[#8b94ab] dark:text-muted-foreground hover:bg-white/60"
                                                }`}
                                            >
                                                <span>{s.icon}</span>
                                                <span>{s.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {carteAnalyse}
                        </div>

                        <div>
                            <Card className="rounded-[12px] border-[#dfe5f1] dark:border-border bg-white dark:bg-card">
                                <CardContent className="p-4">
                                    <h2 className="mb-3 text-[15px] font-semibold text-[#2a3242] dark:text-foreground">{STEPS[step].label}</h2>
                                    {champsEtape(step)}
                                </CardContent>
                            </Card>

                            {boutonAjout(step)}
                        </div>
                    </div>
                )}

                <div className="mx-auto mt-6 flex w-full max-w-[720px] flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button
                        variant="ghost"
                        onClick={handleManualSave}
                        className="h-9 w-full sm:min-w-[230px] sm:w-auto rounded-full bg-[#f0f2f8] dark:bg-muted text-[12px] text-[#5b6474] dark:text-muted-foreground hover:bg-[#e6eaf4] dark:hover:bg-muted"
                    >
                        <Save className="mr-1.5 h-3.5 w-3.5" />
                        Sauvegarder
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleSaveToLibrary}
                        disabled={enregistrementBibliotheque}
                        className="h-9 w-full sm:min-w-[230px] sm:w-auto rounded-full bg-[#f0f2f8] dark:bg-muted text-[12px] text-[#5b6474] dark:text-muted-foreground hover:bg-[#e6eaf4] dark:hover:bg-muted"
                    >
                        {enregistrementBibliotheque ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <FolderPlus className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Enregistrer dans Mes CV
                    </Button>
                    <Button
                        onClick={handleDownloadPDF}
                        className="h-9 w-full sm:min-w-[330px] sm:w-auto rounded-full bg-brand-gradient text-[12px] text-white hover:bg-brand-gradient-hover"
                    >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Télécharger
                    </Button>
                </div>

                {quotaLimit !== null && (
                    <div className="mx-auto mt-4 w-full max-w-[520px]">
                        <QuotaExceededNotice featureKey="cv_creation" limit={quotaLimit} featureLabel="CV créés" />
                    </div>
                )}

                <div className="mt-3 flex flex-col items-center gap-1">
                    {saveState === "saving" && <p className="text-[11px] text-[#aab2c2] dark:text-muted-foreground">Enregistrement…</p>}

                    {saveState === "saved" && savedAt && (
                        <p className="text-[11px] text-[#aab2c2] dark:text-muted-foreground">
                            Brouillon enregistré {formatDerniereSauvegarde(savedAt)}
                        </p>
                    )}

                    {saveState === "local" && (
                        <p className="flex items-center gap-1.5 text-[11px] text-[#b8860b]">
                            <CloudOff className="h-3.5 w-3.5 shrink-0" />
                            Enregistré sur cet appareil uniquement - synchronisation impossible
                        </p>
                    )}

                    {savedAt && (
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                            className="text-[11px] text-[#aab2c2] dark:text-muted-foreground underline-offset-2 transition-colors hover:text-[#e0685f] hover:underline"
                        >
                            Supprimer le brouillon
                        </button>
                    )}
                </div>

                <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer le brouillon ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Le contenu saisi sera effacé de ce navigateur et de votre compte. Cette action est
                                irréversible - pensez à télécharger votre CV avant si vous souhaitez le conserver.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteDraft} className="bg-[#e0685f] hover:bg-[#cc5a51]">
                                Supprimer
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
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
