"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Calendar, MapPin, Eye, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { candidatureService } from "@/lib/api/candidature.service"
import { useApi } from "@/lib/hooks/useApi"
import { capitalizeFirst } from "@/lib/utils"

export default function MyApplicationsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  const {
    data: applications,
    loading,
    error,
    refetch,
  } = useApi(() => candidatureService.getCandidatures(selectedStatus === "all" ? undefined : selectedStatus), {
    immediate: true,
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
      reviewed: { label: "Examiné", className: "bg-blue-100 text-blue-800" },
      interview: { label: "Entretien", className: "bg-purple-100 text-purple-800" },
      accepted: { label: "Accepté", className: "bg-green-100 text-green-800" },
      rejected: { label: "Refusé", className: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const displayApplications = (applications?.data as any[]) || []

  return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes candidatures</h1>
          <p className="text-gray-600">Suis l'état de tes candidatures et gère tes offres</p>
        </div>

        <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="space-y-6">
          <div className="overflow-x-auto pb-1">
            <TabsList className="flex min-w-max h-auto flex-wrap sm:grid sm:w-full sm:grid-cols-6">
              <TabsTrigger value="all" className="flex-1 text-xs sm:text-sm">Toutes</TabsTrigger>
              <TabsTrigger value="pending" className="flex-1 text-xs sm:text-sm">En attente</TabsTrigger>
              <TabsTrigger value="reviewed" className="flex-1 text-xs sm:text-sm">Examinées</TabsTrigger>
              <TabsTrigger value="interview" className="flex-1 text-xs sm:text-sm">Entretiens</TabsTrigger>
              <TabsTrigger value="accepted" className="flex-1 text-xs sm:text-sm">Acceptées</TabsTrigger>
              <TabsTrigger value="rejected" className="flex-1 text-xs sm:text-sm">Refusées</TabsTrigger>
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
              displayApplications.map((application: any) => (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">{application.jobTitle}</h3>
                          <p className="text-gray-600 mb-2">{application.company}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                              {capitalizeFirst(application.location)}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                              Candidature envoyée le {application.appliedDate}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{application.type}</Badge>
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              {application.salary}
                            </Badge>
                            {getStatusBadge(application.status)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 self-start">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
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
                      : `Aucune candidature avec le statut "${selectedStatus}".`}
                  </p>
                  <Button>Parcourir les offres</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
  )
}
