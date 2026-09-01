"use client"

import { useState, useEffect } from "react"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { MapPin, Clock, Heart, Globe, Phone, Mail, Users } from "lucide-react"
import { companyService } from "@/lib/api/company.service"
import { jobService } from "@/lib/api/job.service"
import { capitalizeFirst, formatFileUrl } from "@/lib/utils"

export default function CompanyProfilePage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState("profil")
  const [company, setCompany] = useState<any>(null)
  const [companyJobs, setCompanyJobs] = useState<any[]>([])
  const [similarCompanies, setSimilarCompanies] = useState<any[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    companyService.getCompanyById(params.slug)
      .then((res) => {
        const data = res.data as any
        setCompany(data)

        companyService.getCompanyJobs(data.id || params.slug)
          .then((r) => setCompanyJobs((r.data as any[]) || []))
          .catch(() => {})

        companyService.getFollowedCompanyIds()
          .then((r: any) => {
            const ids: string[] = r?.data?.companyIds ?? r?.companyIds ?? []
            setIsFollowing(ids.includes(data.id))
          })
          .catch(() => {})

        jobService.getSavedJobIds()
          .then((r: any) => {
            const ids: string[] = r?.data?.jobIds ?? r?.jobIds ?? []
            setSavedJobIds(new Set(ids))
          })
          .catch(() => {})

        if (data.sector) {
          companyService.getCompanies({ sector: data.sector, limit: 5 })
            .then((r: any) => {
              const list = (r?.data?.data ?? r?.data ?? []).filter((c: any) => c.id !== data.id).slice(0, 4)
              setSimilarCompanies(list)
            })
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [params.slug])

  const handleToggleSaveJob = async (jobId: string) => {
    const isSaved = savedJobIds.has(jobId)
    setSavedJobIds((prev) => {
      const next = new Set(prev)
      isSaved ? next.delete(jobId) : next.add(jobId)
      return next
    })
    try {
      await (isSaved ? jobService.unsaveJob(jobId) : jobService.saveJob(jobId))
    } catch (err) {
      console.error("[entreprises/slug] save job error:", err)
      setSavedJobIds((prev) => {
        const next = new Set(prev)
        isSaved ? next.add(jobId) : next.delete(jobId)
        return next
      })
    }
  }

  const handleToggleFollow = async () => {
    setFollowLoading(true)
    try {
      if (isFollowing) {
        await companyService.unfollowCompany(company.id)
        setIsFollowing(false)
      } else {
        await companyService.followCompany(company.id)
        setIsFollowing(true)
      }
    } catch (err) {
      console.error("[entreprises/slug] follow toggle error:", err)
    } finally {
      setFollowLoading(false)
    }
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  // Uniquement des données réelles renvoyées par le backend - les sections
  // sans contenu réel (ce que l'entreprise recherche, culture, équipe) sont
  // masquées plutôt que remplies avec du contenu inventé.
  const presentation = capitalizeFirst(company.about) || undefined
  const contact = {
    website: company.website,
    phone: company.phone,
    email: company.email,
    location: capitalizeFirst(company.location ?? company.headquarters) || undefined,
    sector: company.sector,
    employees: company.companySize,
  }

  return (
    <div className="bg-background">
      <main>
        {/* Hero Section */}
        <div className="relative h-80 overflow-hidden">
          <img
            src={formatFileUrl(company.coverImage) || "/placeholder.svg"}
            alt={`${company.name} office`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute bottom-6 left-6 flex items-center gap-4">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center border-4 border-white">
              <img
                src={formatFileUrl(company.logo) || "/placeholder.svg"}
                alt={`${company.name} logo`}
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{company.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {company.sector}
                </Badge>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="w-4 h-4" />
                  {capitalizeFirst(company.location)}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 flex gap-2">
            <Button
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-full"
              disabled={followLoading}
              onClick={handleToggleFollow}
            >
              {isFollowing ? "Suivi" : "Suivre"}
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setActiveTab("jobs")}>
              Voir les offres
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-4 max-w-md mb-8">
              <TabsTrigger value="profil">Profil</TabsTrigger>
              <TabsTrigger value="jobs">Offres</TabsTrigger>
              <TabsTrigger value="presentation">Présentation</TabsTrigger>
              <TabsTrigger value="team">Équipe</TabsTrigger>
            </TabsList>

            {/* ===== PROFIL TAB ===== */}
            <TabsContent value="profil" className="space-y-8">

              {/* Présentation */}
              {presentation && (
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Présentation</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line mb-4">
                    {presentation}
                  </p>
                </section>
              )}

              {/* Contact + Stats + Social */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-border">
                {/* Contact */}
                <div>
                  <h3 className="font-semibold text-blue-600 mb-4">Contact</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Globe className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Site web</p>
                        <p className="text-sm font-medium">{contact?.website}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Téléphone</p>
                        <p className="text-sm font-medium">{contact?.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">E-mail</p>
                        <p className="text-sm font-medium">{contact?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 content-start">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Localisation</p>
                      <p className="text-sm font-semibold">{contact.location ?? "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-muted-foreground mt-0.5 flex-shrink-0 text-sm leading-4">🏢</span>
                    <div>
                      <p className="text-xs text-muted-foreground">Secteur</p>
                      <p className="text-sm font-semibold">{contact.sector ?? "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Taille</p>
                      <p className="text-sm font-semibold">{contact.employees ?? "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Social */}
                {company.socialLinks?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Suis-nous sur</h3>
                    <div className="flex gap-2">
                      {company.socialLinks.map((link: string, i: number) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-9 h-9 bg-[#0a66c2] text-white rounded-lg hover:bg-[#085bb5]"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Similar Companies */}
              {similarCompanies.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-foreground text-center mb-6">
                    Autres entreprises que tu peux consulter
                  </h2>
                  <div className="flex justify-center gap-4 flex-wrap">
                    {similarCompanies.map((sim: any) => (
                      <Link key={sim.id} href={`/entreprises/${sim.id}`}>
                        <Card className="w-[220px] hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-9 h-9 rounded-full overflow-hidden bg-muted">
                                <img src={sim.logo || "/placeholder.svg"} alt={sim.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/placeholder.svg" }} />
                              </div>
                              <Badge variant="outline" className="text-xs">{sim.sector}</Badge>
                            </div>
                            <h3 className="font-bold text-sm text-foreground">{sim.name}</h3>
                            {sim.about && (
                              <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3">{capitalizeFirst(sim.about)}</p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </TabsContent>

            {/* ===== JOBS TAB ===== */}
            <TabsContent value="jobs" className="space-y-6">
              <div className="space-y-4">
                {companyJobs.length === 0 && (
                  <p className="text-muted-foreground">Aucune offre disponible pour le moment.</p>
                )}
                {companyJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <Link href={`/explorer-emplois/${job.id}`} className="hover:underline">
                                <h3 className="font-semibold text-lg text-foreground mb-1">{job.title}</h3>
                              </Link>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {capitalizeFirst(job.location)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {job.duration}
                                </div>
                                <Badge variant="secondary">{job.type}</Badge>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleToggleSaveJob(job.id)}>
                              <Heart className={`w-4 h-4 ${savedJobIds.has(job.id) ? "fill-red-500 text-red-500" : ""}`} />
                            </Button>
                          </div>
                        </div>
                        {job.image && (
                          <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden">
                            <img src={job.image || "/placeholder.svg"} alt="Job preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/placeholder.svg" }} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ===== PRÉSENTATION TAB ===== */}
            <TabsContent value="presentation" className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Présentation</h2>
                {presentation ? (
                  <p className="text-muted-foreground mb-6 leading-relaxed whitespace-pre-line">
                    {presentation}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {company.name} n'a pas encore ajouté de présentation.
                  </p>
                )}
              </div>
            </TabsContent>

            {/* ===== ÉQUIPE TAB ===== */}
            <TabsContent value="team" className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Notre équipe</h2>
                <p className="text-muted-foreground text-sm">
                  {company.name} n'a pas encore ajouté de photos d'équipe.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Autres entreprises que tu peux consulter
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {similarCompanies.map((sim: any) => (
                    <Link key={sim.id} href={`/entreprises/${sim.id}`}>
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden">
                              <img src={sim.logo || "/placeholder.svg"} alt={`${sim.name} logo`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/placeholder.svg" }} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{sim.name}</h3>
                              <p className="text-sm text-muted-foreground">{sim.sector}</p>
                            </div>
                          </div>
                          {sim.about && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{capitalizeFirst(sim.about)}</p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
