import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, MoreHorizontal } from "lucide-react"
import { ICandidature } from "@/lib/@types/entities"
import { CandidatureStatus } from "@/lib/@types/enums"

interface DashboardRecentApplicationsProps {
    applications: ICandidature[]
}

function StatusBadge({ status }: { status: CandidatureStatus }) {
    switch (status) {
        case CandidatureStatus.APPROUVEE:
            return <Badge className="bg-green-100 text-green-800">Accepté</Badge>
        case CandidatureStatus.REJETEE:
            return <Badge className="bg-red-100 text-red-800">Refusé</Badge>
        default:
            return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
    }
}

export function DashboardRecentApplications({ applications }: DashboardRecentApplicationsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Historique des récentes applications</span>
                    <Link href="/mes-offres">
                        <Button variant="ghost" size="sm" className="text-primary">
                            Voir tout
                        </Button>
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {applications.map((application) => (
                    <div
                        key={application.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border border-border rounded-sm"
                    >
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-medium text-foreground truncate">
                                    {application.jobOffer?.company?.name ?? "-"}
                                </h4>
                                <p className="text-sm text-muted-foreground truncate">
                                    {application.jobOffer?.title ?? "-"}
                                </p>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                    {application.jobOffer?.location ?? "-"}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 self-start sm:self-center">
                            <StatusBadge status={application.status} />
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
