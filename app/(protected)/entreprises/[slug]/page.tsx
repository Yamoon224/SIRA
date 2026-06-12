"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { MapPin, Clock, Heart, Globe, Phone, Mail, Users, UserCheck } from "lucide-react"
import { companyService } from "@/lib/api/company.service"

// Fallback mock data (used when API fields are missing)
const MOCK = {
  presentation: {
    description:
      "Pitch développe des solutions technologiques de nouvelle génération pour digitaliser les administrations publiques et les services financiers en Afrique.\nDepuis plus de 10 ans, nous accompagnons les États dans leur transformation digitale avec des outils concrets, pensés pour simplifier le travail des agents publics.\nDéployés dans plus de 15 administrations, nos logiciels automatisent la collecte des recettes et la gestion des dépenses.\nRejoindre Pitch, c'est intégrer :",
    points: [
      "Une structure à taille humaine, portée par des projets à fort impact",
      "Un cadre stimulant, mêlant innovation technologique et enjeux métiers complexes",
      "De vraies perspectives d'évolution, avec une montée en compétences rapide",
    ],
  },
  recherche: {
    description:
      "Pitch recherche des profils qui veulent mettre leurs talents au service de la croissance de pays émergents avec l'envie de contribuer à des projets utiles et ambitieux.",
    values: [
      { key: "Détermination", desc: "aller au bout des sujets, identifier un problème puis trouver LA solution" },
      { key: "Ownership", desc: "prendre la responsabilité de ses missions et s'impliquer pleinement dans la réussite collective d'Pitch" },
      { key: "Engagement", desc: "être prêt à se mobiliser pour atteindre nos objectifs, en équipe" },
    ],
    note: "Nous aimons les personnes curieuses, rigoureuses, avec une vraie appétence pour la tech et les sujets publics.",
  },
  culture: [
    "Primes de performance",
    "Épargne salariale avec abondement de 800.000 FCFA par mois",
    "Couverture CNPS, prise en charge à 100%",
    "Accès à la salle de GYM du Pass Premium à 50%",
    "2 jours de télétravail par semaine",
    "Séminaires et teambuildings réguliers",
  ],
  contact: {
    website: "revolut.com",
    phone: "+225 01 02 03 04 05",
    email: "info@revolut.com",
    location: "Abidjan, Plateau",
    sector: "Fintech",
    employees: "240",
    subscribers: "9 800",
  },
  team: [
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
  ],
  similarCompanies: [
    {
      name: "Twitter",
      logo: "/placeholder.svg",
      sector: "Développement de logiciels",
      tag: "zéro",
      description: "La vie ne consiste pas à travailler, mais à donner un sens, nous croyons que le véritable changement...",
      tags: ["Marketing", "Conception"],
    },
    {
      name: "Pitch",
      logo: "/placeholder.svg",
      sector: "Édition en ligne",
      tag: "3 offres",
      description: "Pitch est la plateforme de pitch pour en un. De la création de présentations originales à la conclusion d'affaires...",
      tags: ["Marketing", "Conception"],
    },
  ],
}

export default function CompanyProfilePage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState("profil")
  const [company, setCompany] = useState<any>(null)
  const [companyJobs, setCompanyJobs] = useState<any[]>([])

  useEffect(() => {
    companyService.getCompanyById(params.slug)
      .then((res) => {
        const data = res.data as any
        setCompany(data)
        return companyService.getCompanyJobs(data.id || params.slug)
      })
      .then((res) => setCompanyJobs((res.data as any[]) || []))
      .catch(() => {})
  }, [params.slug])

  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  // Merge API data with fallbacks
  const presentation = company.presentation ?? MOCK.presentation
  const recherche = company.recherche ?? MOCK.recherche
  const culture = company.culture?.values ?? (Array.isArray(company.culture) ? company.culture : null) ?? MOCK.culture
  const contact = company.contact ?? MOCK.contact
  const teamPhotos: string[] = company.team ?? MOCK.team
  const similarCompanies: any[] = company.similarCompanies ?? MOCK.similarCompanies

  return (
    <div className="min-h-screen bg-background">
      <Header showTopBar={false} />

      <main>
        {/* Hero Section */}
        <div className="relative h-80 overflow-hidden">
          <img
            src={company.coverImage || "/placeholder.svg"}
            alt={`${company.name} office`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute bottom-6 left-6 flex items-center gap-4">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center border-4 border-white">
              <img
                src={company.logo || "/placeholder.svg"}
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
                  {company.location}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 right-6 flex gap-2">
            <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-full">
              Suivre
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
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="presentation">Présentation</TabsTrigger>
              <TabsTrigger value="team">Équipe</TabsTrigger>
            </TabsList>

            {/* ===== PROFIL TAB ===== */}
            <TabsContent value="profil" className="space-y-8">

              {/* Présentation */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Présentation</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line mb-4">
                  {presentation?.description}
                </p>
                {presentation?.points && (
                  <ul className="space-y-2">
                    {presentation.points.map((point: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-muted-foreground">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Ce qu'ils recherchent */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Ce qu'ils recherchent</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">{recherche?.description}</p>
                {recherche?.values && (
                  <>
                    <p className="text-muted-foreground mb-3">Nos valeurs clés :</p>
                    <ul className="space-y-2 mb-4">
                      {recherche.values.map((v: any, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-muted-foreground">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                          <span>
                            <strong>{typeof v === "string" ? v.split(":")?.[0] : v.key}</strong>
                            {typeof v === "string" ? (v.split(":")?.[1] ? ` : ${v.split(":").slice(1).join(":")}` : "") : (v.desc ? ` : ${v.desc}` : "")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {recherche?.note && (
                  <p className="text-muted-foreground italic">{recherche.note}</p>
                )}
              </section>

              {/* Culture et valeur */}
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Culture et valeur</h2>
                <ul className="space-y-2">
                  {(Array.isArray(culture) ? culture : []).map((v: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                      {v}
                    </li>
                  ))}
                </ul>
              </section>

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
                      <p className="text-sm font-semibold">{contact?.location ?? company.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-muted-foreground mt-0.5 flex-shrink-0 text-sm leading-4">🏢</span>
                    <div>
                      <p className="text-xs text-muted-foreground">Secteur</p>
                      <p className="text-sm font-semibold">{contact?.sector ?? company.sector}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Employés</p>
                      <p className="text-sm font-semibold">{contact?.employees ?? company.employees ?? "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <UserCheck className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Abonnés</p>
                      <p className="text-sm font-semibold">{contact?.subscribers ?? company.subscribers ?? "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Social */}
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Suivez-nous sur</h3>
                  <a
                    href={contact?.linkedin ?? "#"}
                    className="inline-flex items-center justify-center w-9 h-9 bg-[#0a66c2] text-white rounded-lg hover:bg-[#085bb5]"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Team Photos */}
              {teamPhotos?.length > 0 && (
                <section>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {teamPhotos.slice(0, 3).map((photo: string, i: number) => (
                      <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden">
                        <img src={photo || "/placeholder.svg"} alt={`Team ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  {teamPhotos[3] && (
                    <div className="flex justify-center">
                      <div className="w-1/3 aspect-[4/3] rounded-xl overflow-hidden">
                        <img src={teamPhotos[3]} alt="Team 4" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Similar Companies */}
              {similarCompanies?.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-foreground text-center mb-6">
                    Autres entreprises que vous pouvez consulter
                  </h2>
                  <div className="flex justify-center gap-4 flex-wrap">
                    {similarCompanies.map((sim: any, i: number) => (
                      <Card key={i} className="w-[220px] hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-muted">
                              <img src={sim.logo || "/placeholder.svg"} alt={sim.name} className="w-full h-full object-cover" />
                            </div>
                            <Badge variant="outline" className="text-xs">{sim.offers ?? sim.tag}</Badge>
                          </div>
                          <h3 className="font-bold text-sm text-foreground">{sim.name}</h3>
                          <p className="text-xs text-muted-foreground">{sim.sector}</p>
                          {sim.description && (
                            <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3">{sim.description}</p>
                          )}
                          {sim.tags?.length > 0 && (
                            <div className="mt-3 flex gap-1 flex-wrap">
                              {sim.tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
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
                              <Link href={`/emploi/${job.id}`} className="hover:underline">
                                <h3 className="font-semibold text-lg text-foreground mb-1">{job.title}</h3>
                              </Link>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {job.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {job.duration}
                                </div>
                                <Badge variant="secondary">{job.type}</Badge>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {job.image && (
                          <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden">
                            <img src={job.image || "/placeholder.svg"} alt="Job preview" className="w-full h-full object-cover" />
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
                <p className="text-muted-foreground mb-6 leading-relaxed whitespace-pre-line">
                  {presentation?.description}
                </p>
                {presentation?.points && (
                  <ul className="space-y-3">
                    {presentation.points.map((point: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </TabsContent>

            {/* ===== ÉQUIPE TAB ===== */}
            <TabsContent value="team" className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Notre équipe</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teamPhotos.map((image: string, index: number) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden">
                      <img src={image || "/placeholder.svg"} alt={`Team ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Autres entreprises que vous pouvez consulter
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {similarCompanies.map((sim: any, index: number) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden">
                            <img src={sim.logo || "/placeholder.svg"} alt={`${sim.name} logo`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{sim.name}</h3>
                            <p className="text-sm text-muted-foreground">{sim.sector}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">{sim.offers ?? sim.tag}</Badge>
                        </div>
                        {sim.description && (
                          <p className="text-sm text-muted-foreground mb-4">{sim.description}</p>
                        )}
                        {sim.tags?.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {sim.tags.map((tag: string, tagIndex: number) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
