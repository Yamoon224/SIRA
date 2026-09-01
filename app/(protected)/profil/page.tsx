"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    MapPin,
    Mail,
    Phone,
    ExternalLink,
    Edit,
    Plus,
    Globe2,
    Copy,
} from "lucide-react"
import { userService } from "@/lib/api/user.service"
import { portfolioService } from "@/lib/api/portfolio.service"
import type { IPortfolio } from "@/lib/@types/entities"
import { useRouter } from "next/navigation"
import { publicProfileService, type IPublicProfile, type ProfileTheme } from "@/lib/api/public-profile.service"
import { useAuth } from "@/contexts/auth-context"
import { capitalizeFirst, formatFileUrl } from "@/lib/utils"
import { useState, useEffect } from "react"

const THEME_LABELS: Record<ProfileTheme, string> = {
    DEFAULT: "Par défaut",
    CREATIF: "Créatif",
    TECHNIQUE: "Technique",
    COMMERCIAL: "Commercial",
    ACADEMIQUE: "Académique",
}

function PublicProfileCard() {
    const [publicProfile, setPublicProfile] = useState<IPublicProfile | null>(null)
    const [slugInput, setSlugInput] = useState("")
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        publicProfileService.me()
            .then((res) => {
                const p = ((res as any)?.data ?? res) as IPublicProfile
                setPublicProfile(p)
                setSlugInput(p.slug)
            })
            .catch((err) => console.error("[profil] public profile load error:", err))
    }, [])

    const handleToggle = async (isPublic: boolean) => {
        setSaving(true)
        try {
            const res = await publicProfileService.update({ isPublic })
            setPublicProfile((res as any)?.data ?? res)
        } catch (err) {
            console.error("[profil] public profile toggle error:", err)
        } finally {
            setSaving(false)
        }
    }

    const handleThemeChange = async (theme: ProfileTheme) => {
        setSaving(true)
        try {
            const res = await publicProfileService.update({ theme })
            setPublicProfile((res as any)?.data ?? res)
        } catch (err) {
            console.error("[profil] public profile theme error:", err)
        } finally {
            setSaving(false)
        }
    }

    const handleSlugSave = async () => {
        if (!slugInput.trim() || slugInput === publicProfile?.slug) return
        setSaving(true)
        try {
            const res = await publicProfileService.update({ slug: slugInput.trim() })
            const updated = (res as any)?.data ?? res
            setPublicProfile(updated)
            setSlugInput(updated.slug)
        } catch (err) {
            console.error("[profil] public profile slug error:", err)
        } finally {
            setSaving(false)
        }
    }

    if (!publicProfile) return null

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe2 className="w-5 h-5" />
                    Profil Public GORIYA
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Visible publiquement</p>
                        <p className="text-sm text-muted-foreground">Votre portfolio et vos pitchs vidéo publics deviennent accessibles via un lien partageable</p>
                    </div>
                    <Switch checked={publicProfile.isPublic} disabled={saving} onCheckedChange={handleToggle} />
                </div>

                <div>
                    <p className="mb-1 text-sm font-medium">Lien public</p>
                    <div className="flex items-center gap-2">
                        <Input value={slugInput} onChange={(e) => setSlugInput(e.target.value)} onBlur={handleSlugSave} className="flex-1" />
                        <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(`https://${publicProfile.publicUrl}`)}>
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{publicProfile.publicUrl}</p>
                </div>

                <div>
                    <p className="mb-1 text-sm font-medium">Thème</p>
                    <Select value={publicProfile.theme} onValueChange={(v) => handleThemeChange(v as ProfileTheme)} disabled={saving}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {(Object.keys(THEME_LABELS) as ProfileTheme[]).map((t) => (
                                <SelectItem key={t} value={t}>{THEME_LABELS[t]}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProfileData = any

function buildProfile(apiData: any, authUser: { name?: string; email?: string; avatar?: string | null } | null) {
    const nameParts = (apiData?.name || authUser?.name || "").trim().split(" ")
    return {
        firstName: apiData?.firstName || nameParts[0] || "",
        lastName: apiData?.lastName || nameParts.slice(1).join(" ") || "",
        title: apiData?.title || "",
        location: apiData?.location || "",
        email: apiData?.email || authUser?.email || "",
        phone: apiData?.phone || "",
        avatar: apiData?.avatar || authUser?.avatar || "",
        bio: apiData?.bio || "",
    }
}

export default function ProfilePage() {
    const { user } = useAuth()
    const router = useRouter()
    const [profile, setProfile] = useState<ProfileData>(null)
    const [portfolios, setPortfolios] = useState<IPortfolio[]>([])

    useEffect(() => {
        fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    useEffect(() => {
        portfolioService.getPortfolios({ page: 1, limit: 3 })
            .then((res: any) => {
                const payload = res?.data ?? res
                const items = Array.isArray(payload) ? payload : payload?.data ?? []
                setPortfolios(items)
            })
            .catch((err) => console.error("[profil] portfolios load error:", err))
    }, [])

    const fetchProfile = async () => {
        try {
            const response = await userService.getProfile()
            setProfile(buildProfile(response.data, user))
        } catch (error) {
            console.error("Erreur lors du chargement du profil:", error)
            setProfile(buildProfile(null, user))
        }
    }

    if (!profile) {
        return (
            <div>
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
                    <div className="space-y-4">
                        <div className="h-32 bg-muted rounded"></div>
                        <div className="h-32 bg-muted rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl">
            {/* Profile Header */}
            <Card className="mb-6">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                                <AvatarImage src={profile.avatar ? formatFileUrl(profile.avatar) : undefined} />
                                <AvatarFallback className="text-2xl">
                                    {profile.firstName?.[0]}
                                    {profile.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                                    {profile.firstName} {profile.lastName}
                                </h1>
                                <p className="text-base sm:text-lg text-muted-foreground mb-2">{profile.title}</p>
                                <div className="flex items-center text-muted-foreground mb-2">
                                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                    {capitalizeFirst(profile.location)}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
                                        <span className="truncate">{profile.email}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Phone className="w-4 h-4 mr-1 flex-shrink-0" />
                                        {profile.phone}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => router.push("/parametres")} className="w-full sm:w-auto">
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier le profil
                        </Button>
                    </div>
                    <p className="text-foreground">{profile.bio}</p>
                </CardContent>
            </Card>

            {/* Portfolio Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Portfolio</span>
                        <Button variant="ghost" size="sm" onClick={() => router.push("/portfolio/creer")}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {portfolios.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aucun portfolio pour le moment.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {portfolios.map((item) => (
                                <div
                                    key={item.id}
                                    className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                                    {item.skills?.length > 0 && (
                                        <div className="mb-3 flex flex-wrap gap-1.5">
                                            {item.skills.slice(0, 3).map((skill, i) => (
                                                <Badge key={i} variant="secondary" className="text-[10px]">{skill}</Badge>
                                            ))}
                                        </div>
                                    )}
                                    <Button size="sm" variant="outline" className="w-full bg-transparent" onClick={() => router.push("/portfolio")}>
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Gérer mon portfolio
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <PublicProfileCard />
        </div>
    )
}
