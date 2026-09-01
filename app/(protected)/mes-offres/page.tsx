"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Calendar, MapPin, BriefcaseBusiness, XCircle, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { candidatureService } from "@/lib/api/candidature.service"
import { useApi } from "@/lib/hooks/useApi"
import { capitalizeFirst, formatFileUrl } from "@/lib/utils"
import { CompanyLogo } from "@/components/company-logo"
import type { ICandidature } from "@/lib/@types/entities"

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  EN_ATTENTE: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
  EN_COURS: { label: "Entretien", className: "bg-purple-100 text-purple-800" },
  APPROUVEE: { label: "Accepté", className: "bg-green-100 text-green-800" },
  ACCEPTEE: { label: "Accepté", className: "bg-green-100 text-green-800" },
  REJETEE: { label: "Refusé", className: "bg-red-100 text-red-800" },
  REFUSEE: { label: "Refusé", className: "bg-red-100 text-red-800" },
}

const TABS = [
  { value: "all", label: "Toutes" },
  { value: "EN_ATTENTE", label: "En attente" },
  { value: "EN_COURS", label: "Entretiens" },
  { value: "ACCEPTEE", label: "Acceptées" },
  { value: "REFUSEE", label: "Refusées" },
]

export default function MyApplicationsPage() {
  const router = useRouter()
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)

  const {
    data: applications,
    loading,
    refetch,
  } = useApi(() => candidatureService.getCandidatures(selectedStatus === "all" ? undefined : selectedStatus), {
    immediate: true,
  })

  // useApi() ne relance sa requête qu'au montage - on déclenche nous-mêmes le
  // refetch quand l'onglet de statut change (le premier appel est déjà
  // couvert par immediate: true, donc on l'ignore ici via un flag de montage).
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      return
    }
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus])

  const getStatusBadge = (status: string) => {
    const config = STATUS_LABEL[status] ?? STATUS_LABEL.EN_ATTENTE
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const handleWithdraw = async (id: string) => {
    setWithdrawingId(id)
    try {
      await candidatureService.withdrawCandidature(id)
      toast.success("Candidature retirée")
      refetch()
    } catch (err) {
      console.error("[mes-offres] withdraw error:", err)
      toast.error("Échec du retrait de la candidature")
    } finally {
      setWithdrawingId(null)
    }
  }

  const displayApplications = ((applications?.data as ICandidature[]) || [])

  return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes candidatures</h1>
          <p className="text-gray-600">Suis l'état de tes candidatures et gère tes offres</p>
        </div>

        <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="space-y-6">
          <div className="overflow-x-auto pb-1">
            <TabsList className="flex min-w-max h-auto flex-wrap sm:grid sm:w-full sm:grid-cols-5">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex-1 text-xs sm:text-sm">{tab.label}</TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={selectedStatus} className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : displayApplications.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {displayApplications.map((application) => {
                  const job = application.jobOffer
                  const cover = formatFileUrl(job?.image || job?.company?.coverImage)
                  return (
                    <Link
                      key={application.id}
                      href={job?.id ? `/explorer-emplois/${job.id}` : "/mes-offres"}
                      className="group block rounded-[14px] border border-[#b9c8ec] dark:border-border bg-white dark:bg-card p-3 sm:p-4 hover:border-[#8eb4ff] transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-[17px] font-extrabold text-[#1b2331] dark:text-foreground group-hover:underline">{job?.title ?? "Offre"}</h3>
                            {getStatusBadge(application.status)}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#7f8796] dark:text-muted-foreground">
                            {job?.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{capitalizeFirst(job.location)}</span>}
                            {job?.company?.name && <span className="inline-flex items-center gap-1"><BriefcaseBusiness className="w-3 h-3" />{job.company.name}</span>}
                            {job?.type && <span className="inline-flex items-center gap-1 rounded-full border border-[#d8deeb] dark:border-border px-2 py-0.5">{job.type}</span>}
                          </div>
                          <p className="mt-1 text-[11px] text-[#9aa3b2] dark:text-muted-foreground inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />Envoyée le {new Date(application.appliedDate).toLocaleDateString("fr-FR")}
                          </p>
                          {job?.description && (
                            <p className="mt-2 text-[12px] leading-5 text-[#5b6474] dark:text-muted-foreground line-clamp-2">
                              {job.description}{" "}
                              <span className="text-[#2f6de6] dark:text-primary font-semibold whitespace-nowrap">Plus de détails</span>
                            </p>
                          )}
                          <div className="mt-3 flex items-center gap-3">
                            <CompanyLogo name={job?.company?.name ?? "?"} logo={job?.company?.logo} className="w-6 h-6 text-[12px]" />
                            <button
                              type="button"
                              disabled={withdrawingId === application.id}
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleWithdraw(application.id) }}
                              className="inline-flex items-center gap-1 text-[11px] text-[#e0526a] hover:text-[#c53f56] disabled:opacity-40"
                            >
                              {withdrawingId === application.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                              Retirer
                            </button>
                            {job?.salary && <span className="text-[11px] font-semibold text-[#2f6de6] dark:text-primary ml-auto">{job.salary}</span>}
                          </div>
                        </div>
                        {(job?.image || job?.company?.coverImage) && (
                          <div className="w-full sm:w-[150px] md:w-[180px] h-[95px] rounded-xl overflow-hidden bg-[#f0f3fb] dark:bg-muted shrink-0">
                            <img src={cover} alt={job?.title ?? ""} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune candidature trouvée</h3>
                  <p className="text-gray-600 mb-4">
                    {selectedStatus === "all"
                      ? "Tu n'as pas encore postulé à des offres d'emploi."
                      : `Aucune candidature avec ce statut.`}
                  </p>
                  <Button onClick={() => router.push("/chercher-emploi")}>Parcourir les offres</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
  )
}
