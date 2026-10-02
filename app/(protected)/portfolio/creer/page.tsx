"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    ArrowLeft,
    CheckCircle2,
    Circle,
    ExternalLink,
    Eye,
    Github,
    Globe,
    Heart,
    Linkedin,
    Loader2,
    Pencil,
    Plus,
    Save,
    Send,
    Trash2,
    Twitter,
    Upload,
    User,
    Users,
    X,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { PortfolioPreview, PORTFOLIO_THEMES, type PortfolioPreviewData } from "@/components/portfolio/portfolio-preview"
import { PORTFOLIO_PHOTO_ACCEPT, PORTFOLIO_PHOTO_MAX_BYTES, portfolioService } from "@/lib/api/portfolio.service"
import { findPortfolioTemplate } from "@/lib/portfolio-templates"
import { userService } from "@/lib/api/user.service"
import { connectionService } from "@/lib/api/connect.service"
import type { IPortfolio, PortfolioProjectStatus, PortfolioStatus, PortfolioTheme } from "@/lib/@types/entities"
import { cn, formatFileUrl } from "@/lib/utils"

interface SkillDraft {
    name: string
    level: number
}

interface ProjectDraft {
    id: string
    title: string
    status: PortfolioProjectStatus
    description: string
    previewUrl: string
    codeUrl: string
}

type LinkKey = "linkedin" | "github" | "twitter" | "website"

const LINK_FIELDS: { key: LinkKey; label: string; placeholder: string; icon: typeof Globe }[] = [
    { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/…", icon: Linkedin },
    { key: "github", label: "GitHub", placeholder: "https://github.com/…", icon: Github },
    { key: "twitter", label: "X / Twitter", placeholder: "https://x.com/…", icon: Twitter },
    { key: "website", label: "Site web", placeholder: "https://…", icon: Globe },
]

const MAX_PROJECTS = 20

const newId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `p-${Date.now()}-${Math.random().toString(36).slice(2)}`

const emptyProject = (): ProjectDraft => ({ id: newId(), title: "", status: "EN_COURS", description: "", previewUrl: "", codeUrl: "" })

/** Vide = valide : seuls les liens renseignés sont contrôlés. */
const isHttpUrl = (value: string) => {
    if (!value.trim()) return true
    try {
        const url = new URL(value.trim())
        return url.protocol === "http:" || url.protocol === "https:"
    } catch {
        return false
    }
}

const isEmail = (value: string) => !value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

const nullable = (value: string) => value.trim() || null

function PortfolioEditor() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const editId = searchParams.get("id")
    const photoInput = useRef<HTMLInputElement>(null)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<PortfolioStatus | null>(null)
    const [uploading, setUploading] = useState(false)
    const [portfolioId, setPortfolioId] = useState<string | null>(editId)
    const [status, setStatus] = useState<PortfolioStatus>("DRAFT")
    const [stats, setStats] = useState({ views: 0, likes: 0 })
    const [followers, setFollowers] = useState<number | null>(null)

    const [title, setTitle] = useState("")
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [location, setLocation] = useState("")
    const [bio, setBio] = useState("")
    const [photo, setPhoto] = useState<{ path: string | null; url: string | null }>({ path: null, url: null })
    const [skills, setSkills] = useState<SkillDraft[]>([])
    const [newSkill, setNewSkill] = useState("")
    const [newLevel, setNewLevel] = useState(70)
    const [projects, setProjects] = useState<ProjectDraft[]>([])
    const [projectDraft, setProjectDraft] = useState<ProjectDraft | null>(null)
    const [links, setLinks] = useState<Record<LinkKey, string>>({ linkedin: "", github: "", twitter: "", website: "" })
    const [theme, setTheme] = useState<PortfolioTheme>("default")
    const [previewOpen, setPreviewOpen] = useState(false)

    const hydrate = (portfolio: IPortfolio) => {
        const details = portfolio.details ?? {}
        setPortfolioId(portfolio.id)
        setStatus(portfolio.status ?? "PUBLISHED")
        setStats({ views: portfolio.views ?? 0, likes: portfolio.likes ?? 0 })
        setTitle(portfolio.title ?? "")
        setBio(portfolio.description ?? "")
        setTheme(portfolio.theme && portfolio.theme in PORTFOLIO_THEMES ? portfolio.theme : "default")
        setPhoto({ path: portfolio.photoPath ?? null, url: portfolio.photo ?? null })
        setFullName(details.fullName ?? portfolio.user?.name ?? "")
        setEmail(details.email ?? "")
        setPhone(details.phone ?? "")
        setLocation(details.location ?? "")
        setSkills((portfolio.skills ?? []).map((name) => ({ name, level: details.skillLevels?.[name] ?? 70 })))
        setProjects(
            (details.projects ?? []).map((project) => ({
                id: project.id || newId(),
                title: project.title,
                status: project.status ?? "EN_COURS",
                description: project.description ?? "",
                previewUrl: project.previewUrl ?? "",
                codeUrl: project.codeUrl ?? "",
            })),
        )
        setLinks({
            linkedin: details.links?.linkedin ?? "",
            github: details.links?.github ?? "",
            twitter: details.links?.twitter ?? "",
            website: details.links?.website ?? "",
        })
    }

    useEffect(() => {
        let cancelled = false

        connectionService
            .followers()
            .then((res) => {
                const list = (res as any)?.data ?? res
                if (!cancelled && Array.isArray(list)) setFollowers(list.length)
            })
            .catch(() => {})

        if (!editId) {
            const template = findPortfolioTemplate(searchParams.get("modele"))
            if (template) {
                setTheme(template.theme)
                setSkills(template.skills.map((skill) => ({ ...skill })))
            }
            // Nouveau portfolio : on part du profil du membre plutôt que d'un formulaire vide.
            userService
                .getProfile()
                .then((res: any) => {
                    if (cancelled) return
                    const profile = res?.data ?? res
                    setFullName(profile?.name ?? "")
                    setEmail(profile?.email ?? "")
                    setPhone(profile?.phone ?? "")
                    setLocation(profile?.location ?? "")
                    // Modèle choisi sur /portfolio/nouveau : sa trame ne comble
                    // que ce que le profil ne renseigne pas déjà.
                    setTitle(profile?.title || template?.title || "")
                    setBio(profile?.bio || template?.bio || "")
                })
                .catch(() => {
                    if (cancelled || !template) return
                    setTitle(template.title)
                    setBio(template.bio)
                })
                .finally(() => !cancelled && setLoading(false))
            return () => {
                cancelled = true
            }
        }

        portfolioService
            .getPortfolioById(editId)
            .then((res: any) => {
                const portfolio = (res?.data?.id ? res.data : res) as IPortfolio
                if (!portfolio?.id) throw new Error("Portfolio introuvable")
                if (!cancelled) hydrate(portfolio)
            })
            .catch(() => {
                if (cancelled) return
                toast.error("Portfolio introuvable.")
                router.replace("/portfolio")
            })
            .finally(() => !cancelled && setLoading(false))

        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editId])

    const uploadPhoto = async (file?: File) => {
        if (!file) return
        if (!PORTFOLIO_PHOTO_ACCEPT.split(",").includes(file.type)) {
            toast.error("Choisis une image JPG, PNG ou WebP.")
            return
        }
        if (file.size > PORTFOLIO_PHOTO_MAX_BYTES) {
            toast.error("La photo ne doit pas dépasser 5 Mo.")
            return
        }
        setUploading(true)
        try {
            const res: any = await portfolioService.uploadPhoto(file)
            const data = res?.data ?? res
            setPhoto({ path: data.path, url: data.url })
            toast.success("Photo ajoutée - enregistre le portfolio pour la conserver.")
        } catch (err: any) {
            toast.error(err?.message ?? "Le téléversement de la photo a échoué.")
        } finally {
            setUploading(false)
            if (photoInput.current) photoInput.current.value = ""
        }
    }

    const addSkill = () => {
        const name = newSkill.trim()
        if (!name) return
        if (name.length > 100) {
            toast.error("100 caractères au maximum par compétence.")
            return
        }
        if (skills.some((skill) => skill.name.toLowerCase() === name.toLowerCase())) {
            toast.error("Cette compétence est déjà dans la liste.")
            return
        }
        setSkills((prev) => [...prev, { name, level: newLevel }])
        setNewSkill("")
    }

    const saveProject = () => {
        if (!projectDraft) return
        if (!projectDraft.title.trim()) {
            toast.error("Donne un titre au projet.")
            return
        }
        if (!isHttpUrl(projectDraft.previewUrl) || !isHttpUrl(projectDraft.codeUrl)) {
            toast.error("Les liens doivent commencer par http:// ou https://.")
            return
        }
        const draft = { ...projectDraft, title: projectDraft.title.trim() }
        setProjects((prev) => (prev.some((p) => p.id === draft.id) ? prev.map((p) => (p.id === draft.id ? draft : p)) : [...prev, draft]))
        setProjectDraft(null)
    }

    const tips = [
        { done: !!photo.url, label: "Ajoute une photo professionnelle" },
        { done: bio.trim().length >= 120, label: "Rédige une bio détaillée (120 caractères au moins)" },
        { done: skills.length >= 3, label: "Liste au moins trois compétences" },
        { done: projects.length > 0 && projects.every((p) => p.description.trim().length >= 40), label: "Décris tes projets et tes réalisations" },
        { done: projects.some((p) => p.previewUrl.trim() || p.codeUrl.trim()), label: "Ajoute des liens de démo ou de code à tes projets" },
        { done: Object.values(links).some((value) => value.trim()), label: "Relie tes réseaux professionnels" },
    ]
    const completion = Math.round((tips.filter((tip) => tip.done).length / tips.length) * 100)

    const previewData: PortfolioPreviewData = {
        title: title.trim() || "Titre professionnel",
        description: bio,
        theme,
        photo: photo.url,
        skills: skills.map((skill) => ({ name: skill.name, level: skill.level })),
        details: {
            fullName: nullable(fullName),
            email: nullable(email),
            phone: nullable(phone),
            location: nullable(location),
            projects: projects.map((p) => ({ ...p, previewUrl: nullable(p.previewUrl), codeUrl: nullable(p.codeUrl) })),
            links: { linkedin: nullable(links.linkedin), github: nullable(links.github), twitter: nullable(links.twitter), website: nullable(links.website) },
        },
    }

    const save = async (target: PortfolioStatus) => {
        if (!title.trim()) {
            toast.error("Renseigne ton titre professionnel.")
            return
        }
        if (!isEmail(email)) {
            toast.error("L'adresse e-mail n'est pas valide.")
            return
        }
        const badLink = LINK_FIELDS.find(({ key }) => !isHttpUrl(links[key]))
        if (badLink) {
            toast.error(`Le lien ${badLink.label} doit commencer par http:// ou https://.`)
            return
        }
        if (target === "PUBLISHED") {
            if (!bio.trim()) {
                toast.error("Ajoute une bio professionnelle avant de publier.")
                return
            }
            if (skills.length === 0) {
                toast.error("Ajoute au moins une compétence avant de publier.")
                return
            }
        }

        const payload = {
            title: title.trim(),
            description: bio.trim(),
            skills: skills.map((skill) => skill.name),
            theme,
            status: target,
            photo: photo.path,
            details: {
                fullName: nullable(fullName),
                email: nullable(email),
                phone: nullable(phone),
                location: nullable(location),
                skillLevels: Object.fromEntries(skills.map((skill) => [skill.name, skill.level])),
                projects: projects.map((p) => ({
                    id: p.id,
                    title: p.title,
                    status: p.status,
                    description: nullable(p.description),
                    previewUrl: nullable(p.previewUrl),
                    codeUrl: nullable(p.codeUrl),
                })),
                links: { linkedin: nullable(links.linkedin), github: nullable(links.github), twitter: nullable(links.twitter), website: nullable(links.website) },
            },
        }

        const wasPublished = status === "PUBLISHED" && !!portfolioId
        setSaving(target)
        try {
            const res: any = portfolioId ? await portfolioService.updatePortfolio(portfolioId, payload) : await portfolioService.createPortfolio(payload)
            const saved = (res?.data?.id ? res.data : res) as IPortfolio
            setStatus(saved.status ?? target)
            setPhoto({ path: saved.photoPath ?? photo.path, url: saved.photo ?? photo.url })
            if (!portfolioId && saved.id) {
                setPortfolioId(saved.id)
                router.replace(`/portfolio/creer?id=${saved.id}`, { scroll: false })
            }
            toast.success(
                target === "DRAFT"
                    ? wasPublished
                        ? "Portfolio repassé en brouillon : il n'est plus visible sur ton profil public."
                        : "Brouillon enregistré."
                    : wasPublished
                      ? "Portfolio mis à jour."
                      : "Portfolio publié : il apparaît sur ton profil public.",
            )
        } catch (err: any) {
            toast.error(err?.message ?? "L'enregistrement du portfolio a échoué.")
        } finally {
            setSaving(null)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
        )
    }

    const published = status === "PUBLISHED" && !!portfolioId

    return (
        <div className="mx-auto max-w-7xl">
            <PageHeader
                title={portfolioId ? "Modifier le portfolio" : "Créer un portfolio"}
                description="Présente ton profil, tes compétences et tes projets aux recruteurs."
                actions={
                    <>
                        <Badge variant={published ? "default" : "secondary"}>{published ? "Publié" : "Brouillon"}</Badge>
                        <Button asChild variant="ghost" size="sm" className="gap-1.5">
                            <Link href="/portfolio">
                                <ArrowLeft className="h-4 w-4" />
                                Mes portfolios
                            </Link>
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    {/* Profil professionnel */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profil professionnel
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="mb-2 flex flex-wrap items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-muted">
                                    {photo.url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={formatFileUrl(photo.url)} alt="Photo du portfolio" className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-8 w-8 text-gray-400 dark:text-muted-foreground" />
                                    )}
                                </div>
                                <input ref={photoInput} type="file" accept={PORTFOLIO_PHOTO_ACCEPT} className="hidden" onChange={(e) => uploadPhoto(e.target.files?.[0])} />
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline" size="sm" onClick={() => photoInput.current?.click()} disabled={uploading}>
                                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                        {photo.url ? "Changer la photo" : "Télécharger une photo"}
                                    </Button>
                                    {photo.url && (
                                        <Button variant="ghost" size="sm" onClick={() => setPhoto({ path: null, url: null })} className="text-muted-foreground">
                                            <X className="mr-1 h-4 w-4" />
                                            Retirer
                                        </Button>
                                    )}
                                </div>
                                <p className="w-full text-xs text-muted-foreground">JPG, PNG ou WebP, 5 Mo maximum.</p>
                            </div>

                            <div>
                                <Label htmlFor="title">Titre professionnel *</Label>
                                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Développeuse Full-Stack" maxLength={255} className="mt-1" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="fullName">Nom</Label>
                                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ton nom complet" maxLength={255} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ton@email.com" maxLength={255} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Téléphone</Label>
                                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+225 07 00 00 00 00" maxLength={50} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="location">Localisation</Label>
                                    <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Abidjan, Côte d'Ivoire" maxLength={255} className="mt-1" />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="bio">Bio professionnelle</Label>
                                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Décris ton profil professionnel…" rows={4} className="mt-1" />
                                <p className="mt-1 text-right text-xs text-muted-foreground">{bio.trim().length} caractères</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Compétences */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Compétences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <Input
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    placeholder="Ajouter une compétence"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault()
                                            addSkill()
                                        }
                                    }}
                                    aria-label="Nouvelle compétence"
                                />
                                <div className="flex items-center gap-2 sm:w-56">
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        step={5}
                                        value={newLevel}
                                        onChange={(e) => setNewLevel(Number(e.target.value))}
                                        aria-label="Niveau de la compétence"
                                        className="flex-1 accent-[#2f6de6]"
                                    />
                                    <span className="w-10 text-right text-sm tabular-nums text-muted-foreground">{newLevel}%</span>
                                </div>
                                <Button onClick={addSkill} size="sm" disabled={!newSkill.trim()} aria-label="Ajouter la compétence">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {skills.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Aucune compétence pour le moment.</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {skills.map((skill, index) => (
                                        <div key={skill.name}>
                                            <div className="mb-1 flex items-center justify-between gap-2">
                                                <span className="truncate text-sm font-medium text-gray-700 dark:text-foreground">{skill.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setSkills((prev) => prev.filter((_, i) => i !== index))}
                                                    className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                                                    aria-label={`Retirer ${skill.name}`}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="relative h-2 flex-1 rounded-full bg-gray-200 dark:bg-muted">
                                                    <div className={cn("h-2 rounded-full", PORTFOLIO_THEMES[theme].bar)} style={{ width: `${skill.level}%` }} />
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={100}
                                                        step={5}
                                                        value={skill.level}
                                                        onChange={(e) => {
                                                            const level = Number(e.target.value)
                                                            setSkills((prev) => prev.map((s, i) => (i === index ? { ...s, level } : s)))
                                                        }}
                                                        aria-label={`Niveau en ${skill.name}`}
                                                        className="absolute inset-0 h-2 w-full cursor-pointer opacity-0"
                                                    />
                                                </div>
                                                <span className="w-10 text-right text-sm tabular-nums text-gray-600 dark:text-muted-foreground">{skill.level}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Mes projets */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Mes projets
                                <Button size="sm" onClick={() => setProjectDraft(emptyProject())} disabled={projects.length >= MAX_PROJECTS}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {projects.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Aucun projet. Ajoute tes réalisations pour montrer ce que tu sais faire.</p>
                            ) : (
                                <div className="space-y-4">
                                    {projects.map((project) => (
                                        <div key={project.id} className="rounded-lg border p-4">
                                            <div className="mb-2 flex items-start justify-between gap-2">
                                                <h4 className="font-medium">{project.title}</h4>
                                                <Badge variant="secondary">{project.status === "TERMINE" ? "Terminé" : "En cours"}</Badge>
                                            </div>
                                            {project.description && <p className="mb-3 whitespace-pre-line text-sm text-gray-600 dark:text-muted-foreground">{project.description}</p>}
                                            <div className="flex flex-wrap gap-2">
                                                <Button asChild={!!project.previewUrl} variant="outline" size="sm" disabled={!project.previewUrl}>
                                                    {project.previewUrl ? (
                                                        <a href={project.previewUrl} target="_blank" rel="noopener noreferrer">
                                                            <Eye className="mr-1 h-4 w-4" />
                                                            Aperçu
                                                        </a>
                                                    ) : (
                                                        <span>
                                                            <Eye className="mr-1 inline h-4 w-4" />
                                                            Aperçu
                                                        </span>
                                                    )}
                                                </Button>
                                                <Button asChild={!!project.codeUrl} variant="outline" size="sm" disabled={!project.codeUrl}>
                                                    {project.codeUrl ? (
                                                        <a href={project.codeUrl} target="_blank" rel="noopener noreferrer">
                                                            <Github className="mr-1 h-4 w-4" />
                                                            Code
                                                        </a>
                                                    ) : (
                                                        <span>
                                                            <Github className="mr-1 inline h-4 w-4" />
                                                            Code
                                                        </span>
                                                    )}
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setProjectDraft(project)}>
                                                    <Pencil className="mr-1 h-4 w-4" />
                                                    Modifier
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => setProjects((prev) => prev.filter((p) => p.id !== project.id))}
                                                >
                                                    <Trash2 className="mr-1 h-4 w-4" />
                                                    Supprimer
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Liens et réseaux */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Liens et réseaux</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {LINK_FIELDS.map(({ key, label, placeholder, icon: Icon }) => (
                                    <div key={key}>
                                        <Label htmlFor={`link-${key}`} className="flex items-center gap-1.5">
                                            <Icon className="h-4 w-4" />
                                            {label}
                                        </Label>
                                        <Input
                                            id={`link-${key}`}
                                            value={links[key]}
                                            onChange={(e) => setLinks((prev) => ({ ...prev, [key]: e.target.value }))}
                                            placeholder={placeholder}
                                            className={cn("mt-1", !isHttpUrl(links[key]) && "border-destructive")}
                                            maxLength={500}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Thème du portfolio */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thème du portfolio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div role="radiogroup" aria-label="Thème du portfolio" className="grid grid-cols-2 gap-3">
                                {(Object.keys(PORTFOLIO_THEMES) as PortfolioTheme[]).map((id) => (
                                    <button
                                        key={id}
                                        type="button"
                                        role="radio"
                                        aria-checked={theme === id}
                                        onClick={() => setTheme(id)}
                                        className={cn(
                                            "rounded-lg border p-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                            theme === id ? "border-blue-500 bg-blue-50 dark:bg-primary/10" : "border-gray-200 dark:border-border",
                                        )}
                                    >
                                        <div className={cn("mb-2 h-8 w-full rounded", PORTFOLIO_THEMES[id].swatch)} />
                                        <p className="text-center text-sm font-medium">{PORTFOLIO_THEMES[id].label}</p>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistiques */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistiques</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                                    <span className="text-sm">Vues du portfolio</span>
                                </div>
                                <span className="font-medium tabular-nums">{stats.views.toLocaleString("fr-FR")}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                                    <span className="text-sm">J'aime</span>
                                </div>
                                <span className="font-medium tabular-nums">{stats.likes.toLocaleString("fr-FR")}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                                    <span className="text-sm">Abonnés</span>
                                </div>
                                <span className="font-medium tabular-nums">{followers === null ? "-" : followers.toLocaleString("fr-FR")}</span>
                            </div>
                            {!published && <p className="text-xs text-muted-foreground">Les vues sont comptées dès que le portfolio est publié sur ton profil public.</p>}
                        </CardContent>
                    </Card>

                    {/* Conseils de Goriya */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Avatar className="h-6 w-6 bg-brand-gradient">
                                    <AvatarFallback className="bg-transparent text-xs font-bold text-white">G</AvatarFallback>
                                </Avatar>
                                Conseils de Goriya
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="mb-1 flex justify-between text-xs">
                                    <span className="text-muted-foreground">Portfolio complété</span>
                                    <span className="font-semibold text-foreground">{completion}%</span>
                                </div>
                                <Progress value={completion} className="h-1.5" />
                            </div>
                            <ul className="space-y-2 text-sm">
                                {tips.map((tip) => (
                                    <li key={tip.label} className={cn("flex items-start gap-2", tip.done ? "text-muted-foreground line-through" : "text-foreground")}>
                                        {tip.done ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />}
                                        {tip.label}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col-reverse justify-center gap-3 sm:flex-row">
                <Button variant="outline" onClick={() => setPreviewOpen(true)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Aperçu
                </Button>
                <Button variant="outline" onClick={() => save("DRAFT")} disabled={saving !== null}>
                    {saving === "DRAFT" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {published ? "Repasser en brouillon" : "Enregistrer le brouillon"}
                </Button>
                <Button onClick={() => save("PUBLISHED")} disabled={saving !== null} className="bg-brand-gradient text-white hover:bg-brand-gradient-hover">
                    {saving === "PUBLISHED" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {published ? "Mettre à jour" : "Publier"}
                </Button>
            </div>

            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Aperçu du portfolio</DialogTitle>
                        <DialogDescription>Voici ce que verront les visiteurs de ton profil public.</DialogDescription>
                    </DialogHeader>
                    <PortfolioPreview data={previewData} />
                </DialogContent>
            </Dialog>

            <Dialog open={projectDraft !== null} onOpenChange={(open) => !open && setProjectDraft(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{projects.some((p) => p.id === projectDraft?.id) ? "Modifier le projet" : "Nouveau projet"}</DialogTitle>
                        <DialogDescription>Décris la réalisation et ajoute un lien de démo ou de code si possible.</DialogDescription>
                    </DialogHeader>
                    {projectDraft && (
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="project-title">Titre *</Label>
                                <Input id="project-title" value={projectDraft.title} onChange={(e) => setProjectDraft({ ...projectDraft, title: e.target.value })} maxLength={150} className="mt-1" autoFocus />
                            </div>
                            <div>
                                <Label>Statut</Label>
                                <Select value={projectDraft.status} onValueChange={(value) => setProjectDraft({ ...projectDraft, status: value as PortfolioProjectStatus })}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EN_COURS">En cours</SelectItem>
                                        <SelectItem value="TERMINE">Terminé</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="project-description">Description</Label>
                                <Textarea id="project-description" value={projectDraft.description} onChange={(e) => setProjectDraft({ ...projectDraft, description: e.target.value })} maxLength={2000} rows={4} className="mt-1" />
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="project-preview" className="flex items-center gap-1.5">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        Lien de démo
                                    </Label>
                                    <Input id="project-preview" value={projectDraft.previewUrl} onChange={(e) => setProjectDraft({ ...projectDraft, previewUrl: e.target.value })} placeholder="https://…" maxLength={500} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="project-code" className="flex items-center gap-1.5">
                                        <Github className="h-3.5 w-3.5" />
                                        Lien du code
                                    </Label>
                                    <Input id="project-code" value={projectDraft.codeUrl} onChange={(e) => setProjectDraft({ ...projectDraft, codeUrl: e.target.value })} placeholder="https://github.com/…" maxLength={500} className="mt-1" />
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setProjectDraft(null)}>
                            Annuler
                        </Button>
                        <Button onClick={saveProject}>Enregistrer le projet</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function CreerPortfolioDetailPage() {
    return (
        // useSearchParams exige une frontière Suspense au prérendu.
        <Suspense fallback={null}>
            <PortfolioEditor />
        </Suspense>
    )
}
