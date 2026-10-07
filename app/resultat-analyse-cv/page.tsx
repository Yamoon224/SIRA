"use client"

import type React from "react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Poppins } from "next/font/google"
import { AtSign, ChevronLeft, FileText, Globe, ImageIcon, Linkedin, Loader2, Rocket, Sparkles, Target, UserSearch } from "lucide-react"
import { toast } from "sonner"
import { AppLogo } from "@/components/app-logo"
import { Footer } from "@/components/layout/footer"
import { clearPendingOnboarding, setPendingPhoto, setPendingProfile } from "@/lib/cv-onboarding"
import { clearExtractedPhoto, loadExtractedPhoto } from "@/lib/cv-photo"
import { INDICATIF_PAR_DEFAUT, PAYS_AFRICAINS, separerIndicatif } from "@/lib/data/afrique"
import type { CVAnalysis, CVProfile, CVProfileEducation, CVProfileExperience } from "@/lib/@types/openai"

// La maquette de cette page est composée en Poppins, le reste de l'app en Inter.
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" })

const RESULT_KEY = "goriya_cv_analysis_result"
const MAX_PHOTO_SIZE = 5 * 1024 * 1024

type StoredAnalysis = {
    fileName: string
    analyzedAt: string
    analysis: CVAnalysis
}

type SectionKey = "job" | "experiences" | "skills" | "educations" | "divers"

const EMPTY_PROFILE: CVProfile = {
    firstName: "",
    fullName: "",
    title: "",
    phone: "",
    email: "",
    birthDate: "",
    gender: "",
    desiredJob: "",
    experiences: [],
    skills: [],
    educations: [],
    hobbies: [],
    linkedin: "",
    website: "",
}

const BENEFITS = [
    { icon: UserSearch, label: "Faites-vous remarquer par les recruteurs" },
    { icon: AtSign, label: "Recevez des offres ciblées chaque jour" },
    { icon: Rocket, label: "Candidature simple et rapide" },
]

const inputClass =
    "h-10 w-full rounded-lg border border-[#e3e6ec] dark:border-border bg-white dark:bg-background px-3 text-[13px] text-[#1b2331] dark:text-foreground placeholder:text-[#a5acb9] outline-none focus:border-[#0b2ca8] dark:focus:border-primary"
const labelClass = "mb-1.5 block text-[12px] text-[#4a5262] dark:text-muted-foreground"

const toLines = (value: string) => value.split("\n").map((v) => v.trim()).filter(Boolean)
const toList = (value: string) => value.split(",").map((v) => v.trim()).filter(Boolean)

function Section({
    title,
    subtitle,
    flag,
    editing,
    onToggle,
    children,
}: {
    title: string
    subtitle: string
    flag?: string
    editing: boolean
    onToggle: () => void
    children?: React.ReactNode
}) {
    return (
        <section className="border-t border-[#e6e8ee] dark:border-border py-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[14px] font-semibold text-[#1b2331] dark:text-foreground">{title}</h2>
                        {flag && <span className="text-[11px] italic text-[#e5484d]">{flag}</span>}
                    </div>
                    <p className="mt-1 text-[12px] text-[#5b6474] dark:text-muted-foreground">{subtitle}</p>
                </div>
                <button
                    type="button"
                    onClick={onToggle}
                    className="h-9 shrink-0 rounded-full bg-[#0b0b0f] px-6 text-[12px] font-medium text-white transition-colors hover:bg-[#26262d] dark:bg-foreground dark:text-background"
                >
                    {editing ? "Terminer" : "Modifier"}
                </button>
            </div>
            {children}
        </section>
    )
}

function Panel({ children, generated = true }: { children: React.ReactNode; generated?: boolean }) {
    return (
        <div className="mt-3 rounded-lg bg-[#f4f4f6] dark:bg-muted p-4">
            {children}
            {generated && (
                <span className="mt-4 inline-flex items-center gap-1.5 rounded bg-[#0b0b0f] px-2.5 py-1.5 text-[10px] font-medium text-white">
                    <Sparkles className="h-3 w-3 text-[#4f8bff]" />
                    Goriya a généré à partir du CV
                </span>
            )}
        </div>
    )
}

function Row({ label, value }: { label: string; value: string | string[] }) {
    const lines = (Array.isArray(value) ? value : [value]).filter(Boolean)
    return (
        <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-[170px_1fr] sm:gap-4">
            <p className="text-[13px] text-[#3d4554] dark:text-muted-foreground">{label}</p>
            {lines.length > 0 ? (
                <div className="space-y-1">
                    {lines.map((line, i) => (
                        <p key={i} className="text-[13px] font-semibold text-[#1b2331] dark:text-foreground">{line}</p>
                    ))}
                </div>
            ) : (
                <p className="text-[13px] text-[#a5acb9]">Aucune information</p>
            )}
        </div>
    )
}

function EditRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 items-start gap-1 py-1.5 sm:grid-cols-[170px_1fr] sm:gap-4">
            <p className="text-[13px] text-[#3d4554] dark:text-muted-foreground sm:pt-2.5">{label}</p>
            {children}
        </div>
    )
}

export default function ResultatAnalyseCVPage() {
    const router = useRouter()
    const photoInputRef = useRef<HTMLInputElement>(null)

    const [loaded, setLoaded] = useState(false)
    const [result, setResult] = useState<StoredAnalysis | null>(null)
    const [profile, setProfile] = useState<CVProfile>(EMPTY_PROFILE)
    const [dialCode, setDialCode] = useState(INDICATIF_PAR_DEFAUT)
    const [localPhone, setLocalPhone] = useState("")
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [photoUrl, setPhotoUrl] = useState<string | null>(null)
    const [photoFromCv, setPhotoFromCv] = useState(false)
    const [editing, setEditing] = useState<SectionKey | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(RESULT_KEY)
            if (raw) {
                const parsed = JSON.parse(raw) as StoredAnalysis
                const extracted = { ...EMPTY_PROFILE, ...(parsed.analysis?.profile ?? {}) }
                const phone = separerIndicatif(extracted.phone)
                setResult(parsed)
                setProfile(extracted)
                setDialCode(phone.indicatif ?? INDICATIF_PAR_DEFAUT)
                setLocalPhone(phone.numero)
            }
        } catch {
            setResult(null)
        }
        setLoaded(true)

        // Photo trouvée dans le CV au moment de l'envoi (lib/cv-photo.ts) : elle
        // est proposée par défaut, sans écraser un choix déjà fait à l'écran.
        let cancelled = false
        loadExtractedPhoto().then((photo) => {
            if (cancelled || !photo) return
            setPhotoFile((current) => current ?? photo)
            setPhotoFromCv(true)
        })
        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        if (!photoFile) {
            setPhotoUrl(null)
            return
        }
        const url = URL.createObjectURL(photoFile)
        setPhotoUrl(url)
        return () => URL.revokeObjectURL(url)
    }, [photoFile])

    const update = <K extends keyof CVProfile>(key: K, value: CVProfile[K]) =>
        setProfile((prev) => ({ ...prev, [key]: value }))

    const updateExperience = (index: number, patch: Partial<CVProfileExperience>) =>
        update("experiences", profile.experiences.map((e, i) => (i === index ? { ...e, ...patch } : e)))

    const updateEducation = (index: number, patch: Partial<CVProfileEducation>) =>
        update("educations", profile.educations.map((e, i) => (i === index ? { ...e, ...patch } : e)))

    const toggle = (key: SectionKey) => setEditing((current) => (current === key ? null : key))

    const pickPhoto = (file: File | undefined) => {
        if (!file) return
        if (!file.type.startsWith("image/")) {
            toast.error("Choisis une image (SVG, PNG, JPG ou GIF).")
            return
        }
        if (file.size > MAX_PHOTO_SIZE) {
            toast.error("L'image est trop volumineuse (5 Mo maximum).")
            return
        }
        setPhotoFile(file)
        setPhotoFromCv(false)
    }

    const removePhoto = () => {
        setPhotoFile(null)
        setPhotoFromCv(false)
        clearExtractedPhoto()
    }

    const handleReject = () => {
        sessionStorage.removeItem(RESULT_KEY)
        clearExtractedPhoto()
        clearPendingOnboarding()
        router.push("/")
    }

    // Le profil validé est mis de côté ; il est envoyé au backend à la fin du
    // parcours (page des notifications si connecté, sinon après l'inscription).
    const handleAccept = async () => {
        if (!result) return
        const confirmed: CVProfile = { ...profile, phone: localPhone ? `${dialCode}${localPhone.replace(/\s+/g, "")}` : "" }

        setSaving(true)
        setPendingProfile(confirmed)
        if (photoFile) await setPendingPhoto(photoFile)
        try {
            // Un retour depuis l'étape suivante retrouve les corrections saisies ici.
            sessionStorage.setItem(RESULT_KEY, JSON.stringify({ ...result, analysis: { ...result.analysis, profile: confirmed } }))
        } catch {
            // stockage indisponible : seules les corrections à l'écran sont perdues au retour
        }
        router.push("/auth/settings")
    }

    if (!loaded) return <div className="min-h-screen bg-white dark:bg-background" />

    if (!result) {
        return (
            <div className={`${poppins.className} min-h-screen bg-white dark:bg-background px-4 py-10`}>
                <div className="mx-auto max-w-xl rounded-2xl border border-[#e6e8ee] dark:border-border p-6 text-center">
                    <h1 className="text-2xl font-bold text-[#1b2331] dark:text-foreground">Aucun résultat trouvé</h1>
                    <p className="mt-2 text-sm text-[#5b6474] dark:text-muted-foreground">
                        Téléverse ton CV depuis la page d'accueil pour lancer l'analyse.
                    </p>
                    <Link
                        href="/"
                        className="mt-5 inline-flex h-10 items-center rounded-full bg-[#0b2ca8] px-6 text-[13px] font-medium text-white hover:bg-[#09248a]"
                    >
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        )
    }

    const firstName = profile.firstName || profile.fullName.split(" ")[0] || ""

    return (
        <div className={`${poppins.className} min-h-screen bg-white dark:bg-background`}>
            <header className="mx-auto flex max-w-[1180px] items-center gap-5 px-4 py-4">
                <Link
                    href="/"
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-[#0b2ca8] dark:border-primary px-3 text-[12px] text-[#0b2ca8] dark:text-primary hover:bg-[#f1f4ff] dark:hover:bg-primary/10"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    retour
                </Link>
                <Link href="/" aria-label="Accueil Goriya">
                    <AppLogo width={110} />
                </Link>
            </header>

            <main className="mx-auto max-w-[620px] px-4 pb-16 pt-6">
                <h1 className="text-center text-[24px] font-bold leading-tight text-[#0b0b0f] dark:text-foreground sm:text-[30px]">
                    Super{firstName ? ` ${firstName}` : ""},{" "}
                    <span className="text-[#0b2ca8] dark:text-primary">votre score est de {result.analysis.score}%</span>
                </h1>
                <p className="mt-5 text-center text-[13px] text-[#3d4554] dark:text-muted-foreground">
                    Un petit effort maintenant pour un grand bond dans votre carrière.
                </p>

                {(result.analysis.strengths.length > 0 || result.analysis.weaknesses.length > 0 || result.analysis.suggestions.length > 0) && (
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {result.analysis.strengths.length > 0 && (
                            <div className="rounded-xl border border-[#e6e8ee] dark:border-border bg-white dark:bg-card p-5">
                                <h2 className="text-[13px] font-semibold text-[#1b2331] dark:text-foreground">Points forts</h2>
                                <ul className="mt-3 space-y-2.5">
                                    {result.analysis.strengths.map((s, i) => (
                                        <li key={i} className="border-l-2 border-[#1f9d63] pl-3 text-[12px] leading-relaxed text-[#5b6474] dark:text-muted-foreground">
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {result.analysis.weaknesses.length > 0 && (
                            <div className="rounded-xl border border-[#e6e8ee] dark:border-border bg-white dark:bg-card p-5">
                                <h2 className="text-[13px] font-semibold text-[#1b2331] dark:text-foreground">À améliorer</h2>
                                <ul className="mt-3 space-y-2.5">
                                    {result.analysis.weaknesses.map((w, i) => (
                                        <li key={i} className="border-l-2 border-[#d9544d] pl-3 text-[12px] leading-relaxed text-[#5b6474] dark:text-muted-foreground">
                                            {w}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {result.analysis.suggestions.length > 0 && (
                            <div className="rounded-xl border border-[#e6e8ee] dark:border-border bg-white dark:bg-card p-5">
                                <h2 className="text-[13px] font-semibold text-[#1b2331] dark:text-foreground">Ce que tu peux corriger</h2>
                                <ul className="mt-3 space-y-3">
                                    {result.analysis.suggestions.map((s, i) => (
                                        <li key={i} className="flex gap-2.5">
                                            <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0b2ca8] dark:text-primary" strokeWidth={1.8} />
                                            <span className="text-[12px] leading-relaxed text-[#5b6474] dark:text-muted-foreground">{s}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-12">
                    {BENEFITS.map(({ icon: Icon, label }) => (
                        <div
                            key={label}
                            className="flex flex-col items-center rounded-xl border border-[#e6e8ee] dark:border-border px-3 py-4 text-center"
                        >
                            <Icon className="h-7 w-7 text-[#0b2ca8] dark:text-primary" strokeWidth={1.7} />
                            <p className="mt-3 text-[12px] leading-snug text-[#1b2331] dark:text-foreground">{label}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-6 rounded-2xl bg-[#f1f4fd] dark:bg-primary/10 p-3 text-center">
                    <Link
                        href="/"
                        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white dark:bg-card text-[13px] text-[#8b93a3] dark:text-muted-foreground hover:text-[#0b2ca8]"
                    >
                        <FileText className="h-4 w-4" />
                        Complétez rapidement votre profil avec votre CV
                    </Link>
                    <p className="mt-3 pb-1 text-[12px] text-[#3d4554] dark:text-muted-foreground">
                        Vos expériences, vos compétences et votre formation seront ajoutées à votre profil depuis votre CV.
                    </p>
                </div>

                {/* Photo de profil */}
                <section className="mt-8 grid grid-cols-1 gap-5 pb-5 sm:grid-cols-[150px_auto_1fr] sm:gap-6">
                    <div>
                        <h2 className="text-[13px] font-semibold text-[#1b2331] dark:text-foreground">Photo de profil</h2>
                        <p className="mt-1 text-[10px] leading-snug text-[#5b6474] dark:text-muted-foreground">
                            Cette image sera affichée publiquement comme votre photo de profil, cela aidera les recruteurs à vous reconnaître !
                        </p>
                    </div>
                    <div className="shrink-0">
                        <div className="h-[88px] w-[88px] overflow-hidden rounded-full bg-[#eceef3] dark:bg-muted">
                        {photoUrl ? (
                            <img src={photoUrl} alt="Photo de profil" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-[26px] font-semibold text-[#a5acb9]">
                                {(firstName[0] ?? "?").toUpperCase()}
                            </div>
                        )}
                        </div>
                        {photoUrl && (
                            <button
                                type="button"
                                onClick={removePhoto}
                                className="mt-2 w-full text-center text-[10px] text-[#5b6474] underline hover:text-[#0b2ca8] dark:text-muted-foreground"
                            >
                                Retirer
                            </button>
                        )}
                    </div>
                    <div>
                        {photoFromCv && photoUrl && (
                            <p className="mb-2 text-[10px] text-[#0b2ca8] dark:text-primary">
                                Photo récupérée depuis votre CV. Vous pouvez la remplacer ou la retirer.
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={() => photoInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault()
                                pickPhoto(e.dataTransfer.files?.[0])
                            }}
                            className="flex w-full flex-col items-center rounded-lg border border-dashed border-[#9aa6d8] bg-[#f6f7fd] dark:border-border dark:bg-muted px-4 py-5 text-center"
                        >
                            <ImageIcon className="h-5 w-5 text-[#1b2331] dark:text-foreground" strokeWidth={1.6} />
                            <span className="mt-2 text-[12px] font-semibold text-[#1b2331] dark:text-foreground">
                                Cliquez pour remplacer ou glissez-déposez
                            </span>
                            <span className="mt-0.5 text-[10px] text-[#8b93a3] dark:text-muted-foreground">
                                SVG, PNG, JPG ou GIF (max. 400 x 400px)
                            </span>
                        </button>
                        <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/svg+xml,image/png,image/jpeg,image/gif"
                            className="hidden"
                            onChange={(e) => {
                                pickPhoto(e.target.files?.[0])
                                e.target.value = ""
                            }}
                        />
                        <label className="mt-4 block">
                            <span className={labelClass}>Titre du profil</span>
                            <input
                                value={profile.title}
                                onChange={(e) => update("title", e.target.value)}
                                placeholder="Je suis..."
                                className={inputClass}
                            />
                        </label>
                    </div>
                </section>

                {/* Détails personnels */}
                <section className="grid grid-cols-1 gap-4 border-t border-[#e6e8ee] dark:border-border py-5 sm:grid-cols-[1fr_1.6fr] sm:gap-6">
                    <h2 className="text-[13px] font-semibold text-[#1b2331] dark:text-foreground">Détails personnels</h2>
                    <div className="space-y-4">
                        <label className="block">
                            <span className={labelClass}>Nom complet *</span>
                            <input value={profile.fullName} onChange={(e) => update("fullName", e.target.value)} className={inputClass} />
                        </label>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <span className={labelClass}>Numéro de téléphone *</span>
                                <div className="flex h-10 items-center rounded-lg border border-[#e3e6ec] dark:border-border bg-white dark:bg-background focus-within:border-[#0b2ca8]">
                                    <select
                                        aria-label="Indicatif"
                                        value={dialCode}
                                        onChange={(e) => setDialCode(e.target.value)}
                                        className="h-full rounded-l-lg bg-transparent pl-2 text-[13px] font-semibold text-[#1b2331] dark:text-foreground outline-none"
                                    >
                                        {PAYS_AFRICAINS.map((p) => (
                                            <option key={p.iso} value={p.indicatif}>{p.indicatif}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="tel"
                                        aria-label="Numéro de téléphone"
                                        value={localPhone}
                                        onChange={(e) => setLocalPhone(e.target.value)}
                                        className="h-full w-full min-w-0 rounded-r-lg bg-transparent px-2 text-[13px] text-[#1b2331] dark:text-foreground outline-none"
                                    />
                                </div>
                            </div>
                            <label className="block">
                                <span className={labelClass}>Email *</span>
                                <input type="email" value={profile.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />
                            </label>
                            <label className="block">
                                <span className={labelClass}>Date de naissance *</span>
                                <input type="date" value={profile.birthDate} onChange={(e) => update("birthDate", e.target.value)} className={inputClass} />
                            </label>
                            <label className="block">
                                <span className={labelClass}>Genre *</span>
                                <select
                                    value={profile.gender}
                                    onChange={(e) => update("gender", e.target.value as CVProfile["gender"])}
                                    className={inputClass}
                                >
                                    <option value="">Sélectionner</option>
                                    <option value="Homme">Homme</option>
                                    <option value="Femme">Femme</option>
                                </select>
                            </label>
                        </div>
                    </div>
                </section>

                <Section
                    title="Job recherché"
                    subtitle="Dites-en plus aux recruteurs sur le job que vous recherchez."
                    flag={profile.desiredJob ? undefined : "Incomplet"}
                    editing={editing === "job"}
                    onToggle={() => toggle("job")}
                >
                    {editing === "job" ? (
                        <input
                            autoFocus
                            value={profile.desiredJob}
                            onChange={(e) => update("desiredJob", e.target.value)}
                            placeholder="Ex. Designer graphique"
                            className={`${inputClass} mt-3`}
                        />
                    ) : (
                        profile.desiredJob && (
                            <p className="mt-3 text-[13px] font-semibold text-[#1b2331] dark:text-foreground">{profile.desiredJob}</p>
                        )
                    )}
                </Section>

                <Section
                    title="Expériences"
                    subtitle="Parlez-nous de vos expériences passées et actuelles, de vos projets."
                    editing={editing === "experiences"}
                    onToggle={() => toggle("experiences")}
                >
                    {profile.experiences.map((exp, i) => (
                        // La clé inclut la longueur : les champs non contrôlés se réinitialisent après un ajout ou une suppression.
                        <Panel key={`${i}-${profile.experiences.length}`}>
                            {editing === "experiences" ? (
                                <>
                                    <EditRow label="Intitulé de poste">
                                        <input value={exp.position} onChange={(e) => updateExperience(i, { position: e.target.value })} className={inputClass} />
                                    </EditRow>
                                    <EditRow label="Entreprise">
                                        <input value={exp.company} onChange={(e) => updateExperience(i, { company: e.target.value })} className={inputClass} />
                                    </EditRow>
                                    <EditRow label="Siège">
                                        <input value={exp.location} onChange={(e) => updateExperience(i, { location: e.target.value })} className={inputClass} />
                                    </EditRow>
                                    <EditRow label="Date">
                                        <input value={exp.date} onChange={(e) => updateExperience(i, { date: e.target.value })} className={inputClass} />
                                    </EditRow>
                                    <EditRow label="Compétences">
                                        <input
                                            defaultValue={exp.skills.join(", ")}
                                            onBlur={(e) => updateExperience(i, { skills: toList(e.target.value) })}
                                            placeholder="Séparées par des virgules"
                                            className={inputClass}
                                        />
                                    </EditRow>
                                    <EditRow label="Missions">
                                        <textarea
                                            defaultValue={exp.missions.join("\n")}
                                            onBlur={(e) => updateExperience(i, { missions: toLines(e.target.value) })}
                                            rows={3}
                                            placeholder="Une mission par ligne"
                                            className={`${inputClass} h-auto py-2`}
                                        />
                                    </EditRow>
                                    <button
                                        type="button"
                                        onClick={() => update("experiences", profile.experiences.filter((_, j) => j !== i))}
                                        className="mt-2 block text-[12px] text-[#e5484d] hover:underline"
                                    >
                                        Supprimer cette expérience
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Row label="Intitulé de poste" value={exp.position} />
                                    <Row label="Entreprise" value={exp.company} />
                                    <Row label="Siège" value={exp.location} />
                                    <Row label="Date" value={exp.date} />
                                    <Row label="Compétences" value={exp.skills.join(", ")} />
                                    <Row label="Missions" value={exp.missions} />
                                </>
                            )}
                        </Panel>
                    ))}
                    {editing === "experiences" && (
                        <button
                            type="button"
                            onClick={() =>
                                update("experiences", [
                                    ...profile.experiences,
                                    { position: "", company: "", location: "", date: "", skills: [], missions: [] },
                                ])
                            }
                            className="mt-3 text-[12px] font-medium text-[#0b2ca8] dark:text-primary hover:underline"
                        >
                            + Ajouter une expérience
                        </button>
                    )}
                </Section>

                <Section
                    title="Compétences & expertises"
                    subtitle="Mettez en avant les compétences et expertises qui vous différencient."
                    editing={editing === "skills"}
                    onToggle={() => toggle("skills")}
                >
                    <Panel>
                        {editing === "skills" ? (
                            <textarea
                                autoFocus
                                defaultValue={profile.skills.join("\n")}
                                onBlur={(e) => update("skills", toLines(e.target.value))}
                                rows={6}
                                placeholder="Une compétence par ligne"
                                className={`${inputClass} h-auto py-2`}
                            />
                        ) : profile.skills.length > 0 ? (
                            <ul className="space-y-3">
                                {profile.skills.map((skill, i) => (
                                    <li key={i} className="text-[13px] font-semibold text-[#1b2331] dark:text-foreground">{skill}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-[13px] text-[#a5acb9]">Aucune information</p>
                        )}
                    </Panel>
                </Section>

                <Section
                    title="Diplômes & formations"
                    subtitle="Listez vos diplômes, formations et certifications pertinents."
                    editing={editing === "educations"}
                    onToggle={() => toggle("educations")}
                >
                    {profile.educations.map((edu, i) => (
                        <Panel key={`${i}-${profile.educations.length}`}>
                            {editing === "educations" ? (
                                <>
                                    <EditRow label="Titre">
                                        <input value={edu.title} onChange={(e) => updateEducation(i, { title: e.target.value })} className={inputClass} />
                                    </EditRow>
                                    <EditRow label="Niveau">
                                        <input value={edu.level} onChange={(e) => updateEducation(i, { level: e.target.value })} className={inputClass} />
                                    </EditRow>
                                    <EditRow label="École">
                                        <input value={edu.school} onChange={(e) => updateEducation(i, { school: e.target.value })} className={inputClass} />
                                    </EditRow>
                                    <EditRow label="Date">
                                        <input value={edu.date} onChange={(e) => updateEducation(i, { date: e.target.value })} className={inputClass} />
                                    </EditRow>
                                    <EditRow label="Compétences">
                                        <input
                                            defaultValue={edu.skills.join(", ")}
                                            onBlur={(e) => updateEducation(i, { skills: toList(e.target.value) })}
                                            placeholder="Séparées par des virgules"
                                            className={inputClass}
                                        />
                                    </EditRow>
                                    <button
                                        type="button"
                                        onClick={() => update("educations", profile.educations.filter((_, j) => j !== i))}
                                        className="mt-2 block text-[12px] text-[#e5484d] hover:underline"
                                    >
                                        Supprimer cette formation
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Row label="Titre" value={edu.title} />
                                    <Row label="Niveau" value={edu.level} />
                                    <Row label="École" value={edu.school} />
                                    <Row label="Date" value={edu.date} />
                                    <Row label="Compétences" value={edu.skills.join(", ")} />
                                </>
                            )}
                        </Panel>
                    ))}
                    {editing === "educations" && (
                        <button
                            type="button"
                            onClick={() =>
                                update("educations", [...profile.educations, { title: "", level: "", school: "", date: "", skills: [] }])
                            }
                            className="mt-3 text-[12px] font-medium text-[#0b2ca8] dark:text-primary hover:underline"
                        >
                            + Ajouter une formation
                        </button>
                    )}
                </Section>

                <Section
                    title="Divers"
                    subtitle="Ajoutez des fichiers et des liens pour soutenir et accélérer vos candidatures."
                    editing={editing === "divers"}
                    onToggle={() => toggle("divers")}
                >
                    <Panel>
                        <p className="text-[13px] text-[#3d4554] dark:text-muted-foreground">Loisirs</p>
                        {editing === "divers" ? (
                            <textarea
                                defaultValue={profile.hobbies.join("\n")}
                                onBlur={(e) => update("hobbies", toLines(e.target.value))}
                                rows={4}
                                placeholder="Un loisir par ligne"
                                className={`${inputClass} mt-2 h-auto py-2`}
                            />
                        ) : profile.hobbies.length > 0 ? (
                            <ul className="mt-3 space-y-3">
                                {profile.hobbies.map((hobby, i) => (
                                    <li key={i} className="text-[13px] font-semibold text-[#1b2331] dark:text-foreground">{hobby}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-2 text-[13px] text-[#a5acb9]">Aucune information</p>
                        )}

                        <div className="-mx-4 mt-4 border-t border-[#dfe2e9] dark:border-border px-4 pt-4">
                            <p className="text-[13px] text-[#3d4554] dark:text-muted-foreground">Liens</p>
                            {(
                                [
                                    { key: "linkedin", icon: Linkedin, placeholder: "https://linkedin.com/in/..." },
                                    { key: "website", icon: Globe, placeholder: "https://..." },
                                ] as const
                            ).map(({ key, icon: Icon, placeholder }) => (
                                <div key={key} className="mt-3 flex items-center gap-2">
                                    <Icon className="h-3.5 w-3.5 shrink-0 text-[#5b6474] dark:text-muted-foreground" />
                                    {editing === "divers" ? (
                                        <input
                                            value={profile[key]}
                                            onChange={(e) => update(key, e.target.value)}
                                            placeholder={placeholder}
                                            className={inputClass}
                                        />
                                    ) : profile[key] ? (
                                        <span className="break-all text-[13px] font-semibold text-[#1b2331] dark:text-foreground">{profile[key]}</span>
                                    ) : (
                                        <span className="text-[13px] text-[#a5acb9]">Aucune information</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Panel>
                </Section>

                <div className="mt-10 grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto] sm:gap-8">
                    <button
                        type="button"
                        onClick={handleReject}
                        disabled={saving}
                        className="h-11 text-[13px] text-[#3d4554] dark:text-muted-foreground hover:underline sm:justify-self-end"
                    >
                        Non je rejette ces informations
                    </button>
                    <button
                        type="button"
                        onClick={handleAccept}
                        disabled={saving}
                        className="inline-flex h-11 items-center justify-center rounded-lg bg-[#0b2ca8] px-8 text-[13px] font-semibold text-white transition-colors hover:bg-[#09248a] disabled:opacity-70 sm:w-[260px]"
                    >
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Je suis d'accord
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    )
}
