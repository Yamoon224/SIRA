import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Users } from "lucide-react"
import { ICompany } from "@/lib/@types/entities"
import { capitalizeFirst } from "@/lib/utils"

interface DashboardCompaniesProps {
    companies: ICompany[]
}

export function DashboardCompanies({ companies }: DashboardCompaniesProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Les entreprises qui recrutent</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {companies.map((company) => (
                        <div
                            key={company.id}
                            className="border border-border rounded-md p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">{company.name}</h4>
                                        <p className="text-sm text-muted-foreground">{company.sector}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                {company.companySize && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Users className="w-4 h-4 mr-2" />
                                        {company.companySize} employés
                                    </div>
                                )}
                                {company.location && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Building2 className="w-4 h-4 mr-2" />
                                        {capitalizeFirst(company.location)}
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-2">
                                <Link href="/chercher-emploi" className="flex-1">
                                    <Button size="sm" className="w-full">
                                        Voir les offres
                                    </Button>
                                </Link>
                                <Button size="sm" variant="outline">
                                    Suivre
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
