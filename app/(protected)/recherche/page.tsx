"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, Building2, Filter, Loader2, Heart } from "lucide-react"
import { jobService } from "@/lib/api/job.service"
import { IJobOffer } from "@/lib/@types/entities"
import { capitalizeFirst } from "@/lib/utils"

function formatPosted(date: Date | string) {
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Aujourd'hui"
  if (days < 7) return `Il y a ${days} jour${days > 1 ? "s" : ""}`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`
  return `Il y a ${Math.floor(days / 30)} mois`
}

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [locationFilter, setLocationFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [jobs, setJobs] = useState<IJobOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([])

  const fetchResults = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await jobService.getJobs({
        search: query || undefined,
        location: locationFilter || undefined,
        jobType: typeFilter !== "all" ? typeFilter : undefined,
        page: p,
        limit: 10,
      }) as any
      const data: IJobOffer[] = res?.data?.data ?? res?.data ?? []
      const meta = res?.data?.meta ?? res?.meta
      setJobs(Array.isArray(data) ? data : [])
      setPage(p)
      setTotalPages(meta?.totalPages ?? 1)
      setTotal(meta?.total ?? data.length)
    } catch {
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [query, locationFilter, typeFilter])

  useEffect(() => {
    fetchResults(1)
  }, [query])

  useEffect(() => {
    jobService.getSavedJobIds()
      .then((res: any) => setBookmarkedJobs(res?.data?.jobIds ?? res?.jobIds ?? []))
      .catch(() => {})
  }, [])

  const toggleBookmark = (jobId: string) => {
    const isSaved = bookmarkedJobs.includes(jobId)
    setBookmarkedJobs(prev => isSaved ? prev.filter(id => id !== jobId) : [...prev, jobId])
    const action = isSaved ? jobService.unsaveJob(jobId) : jobService.saveJob(jobId)
    action.catch(() => setBookmarkedJobs(prev => isSaved ? [...prev, jobId] : prev.filter(id => id !== jobId)))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Résultats de recherche pour "{query}"</h1>
          <p className="text-muted-foreground">{total} résultat{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Filter className="w-5 h-5" />
                  <h3 className="font-semibold">Filtres</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Localisation</label>
                    <Input
                      placeholder="Ville, région..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Type de contrat</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        <SelectItem value="CDI">CDI</SelectItem>
                        <SelectItem value="CDD">CDD</SelectItem>
                        <SelectItem value="FREELANCE">Freelance</SelectItem>
                        <SelectItem value="STAGE">Stage</SelectItem>
                        <SelectItem value="ALTERNANCE">Alternance</SelectItem>
                        <SelectItem value="TEMPS_PARTIEL">Temps partiel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" onClick={() => fetchResults(1)}>Appliquer les filtres</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">Aucune offre ne correspond à ta recherche.</div>
            ) : (
              <div className="space-y-6">
                {jobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                            {job.image || job.company?.logo
                              ? <img src={job.image || job.company?.logo || ""} alt={job.company?.name ?? job.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
                              : <Building2 className="w-6 h-6 text-blue-600 dark:text-primary" />
                            }
                          </div>
                          <div>
                            <Link href={`/explorer-emplois/${job.id}`} className="hover:underline">
                              <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                            </Link>
                            <p className="text-muted-foreground mb-2">{job.company?.name ?? "—"}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              {job.location && (
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {capitalizeFirst(job.location)}
                                </div>
                              )}
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {formatPosted(job.publishDate)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">{job.type}</Badge>
                      </div>

                      <p className="text-muted-foreground mb-4 line-clamp-2">{job.description}</p>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-blue-600 dark:text-primary">{job.salary || "—"}</span>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm" onClick={() => toggleBookmark(job.id)}>
                            <Heart className={`w-4 h-4 mr-1 ${bookmarkedJobs.includes(job.id) ? "fill-current text-primary" : ""}`} />
                            Sauvegarder
                          </Button>
                          <Link href={`/explorer-emplois/${job.id}`}>
                            <Button size="sm">Postuler</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => fetchResults(page - 1)}>
                    Précédent
                  </Button>
                  {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => (
                    <Button key={i} size="sm" variant={page === i + 1 ? "default" : "outline"} onClick={() => fetchResults(i + 1)}>
                      {i + 1}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => fetchResults(page + 1)}>
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <SearchResults />
    </Suspense>
  )
}
