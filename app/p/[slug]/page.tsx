"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2, Star } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { publicProfileService, type IPublicProfileView } from "@/lib/api/public-profile.service"

function initials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

export default function PublicProfilePage() {
    const params = useParams()
    const slug = params?.slug as string

    const [profile, setProfile] = useState<IPublicProfileView | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        if (!slug) return
        publicProfileService.showBySlug(slug)
            .then((res: any) => setProfile(res?.data ?? res))
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [slug])

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="mx-auto max-w-[860px] px-4 pt-10 pb-16">
                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#2f6de6] dark:text-primary" /></div>
                ) : error || !profile ? (
                    <p className="text-center text-sm text-muted-foreground py-16">Ce profil est introuvable ou n'est plus public.</p>
                ) : (
                    <div className="space-y-8">
                        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={profile.avatar ?? undefined} />
                                <AvatarFallback className="text-xl">{initials(profile.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
                                {profile.seoMeta?.description && <p className="mt-1 text-sm text-muted-foreground">{profile.seoMeta.description}</p>}
                            </div>
                        </div>

                        {profile.videoPitches.length > 0 && (
                            <div>
                                <h2 className="mb-3 text-lg font-semibold text-foreground">Pitchs vidéo</h2>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {profile.videoPitches.map((pitch) => (
                                        <Card key={pitch.id} className="border border-border">
                                            <CardContent className="p-3">
                                                <video src={pitch.videoUrl} controls className="w-full rounded-lg" />
                                                <div className="mt-2 flex items-center justify-between">
                                                    <Badge variant="outline" className="text-[10px]">{pitch.type}</Badge>
                                                    {typeof (pitch.score as any)?.impact === "number" && (
                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{(pitch.score as any).impact}/100
                                                        </span>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {profile.portfolios.length > 0 && (
                            <div>
                                <h2 className="mb-3 text-lg font-semibold text-foreground">Portfolio</h2>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {profile.portfolios.map((item, i) => (
                                        <Card key={i} className="border border-border">
                                            <CardContent className="p-4">
                                                <p className="font-semibold text-foreground">{item.title}</p>
                                                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                                                {item.skills?.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        {item.skills.map((skill, j) => <Badge key={j} variant="secondary" className="text-[10px]">{skill}</Badge>)}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {profile.videoPitches.length === 0 && profile.portfolios.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-8">Ce profil n'a pas encore de contenu public.</p>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
