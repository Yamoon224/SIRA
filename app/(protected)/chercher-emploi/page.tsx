"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Building2, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { jobService } from "@/lib/api/job.service"
import { IJobOffer } from "@/lib/@types/entities"
import { useState, useEffect } from "react"

export default function Page() {
    const [jobs, setJobs] = useState<IJobOffer[]>([])
    const [filters, setFilters] = useState({
        search: "",
        location: "",
        jobType: [] as string[],
        experience: [] as string[],
        salary: [] as string[],
    })
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages] = useState(5)

    useEffect(() => {
        fetchJobs()
    }, [filters, currentPage])

    const fetchJobs = async () => {
        try {
            const response = await jobService.getJobs({ ...filters, page: currentPage })
            setJobs(Array.isArray(response.data) ? response.data : [])
        } catch (error) {
            console.error("Erreur lors du chargement des offres:", error)
            setJobs([])
        }
    }

    const toDisplayText = (value: unknown, fallback = ""): string => {
        if (value === null || value === undefined) return fallback
        if (typeof value === "string" || typeof value === "number") return String(value)
        if (typeof value === "object") {
            const record = value as Record<string, unknown>
            if (typeof record.name === "string") return record.name
            if (typeof record.title === "string") return record.title
        }
        return fallback
    }

    const getPublishedDateLabel = (job: IJobOffer): string => {
        const rawDate = (job as any).postedDate ?? job.publishDate
        if (!rawDate) return "récemment"

        const parsedDate = new Date(rawDate)
        if (Number.isNaN(parsedDate.getTime())) {
            return toDisplayText(rawDate, "récemment")
        }

        return parsedDate.toLocaleDateString("fr-FR")
    }

    const handleFilterChange = (filterType: string, value: string, checked: boolean) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: checked
                ? [...(prev[filterType as keyof typeof prev] as string[]), value]
                : (prev[filterType as keyof typeof prev] as string[]).filter((item) => item !== value),
        }))
    }

    return (
            <div className="p-4 sm:p-6">
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Trouver un emploi</h1>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="relative flex-1 max-w-full sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Recherche un emploi par intitulé, poste, mot clé ou entreprise..."
                                className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Trouver un emploi</Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="w-full lg:w-64 space-y-6">
                        <Card className="bg-card border-border">
                            <CardContent className="p-4">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-card-foreground mb-3">Type d'emploi</h3>
                                        <div className="space-y-2">
                                            {["Temps plein (4)", "Temps partiel (2)", "Stage (1)", "Freelance (3)"].map((type) => (
                                                <div key={type} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={type}
                                                        onCheckedChange={(checked) => handleFilterChange("jobType", type, checked as boolean)}
                                                    />
                                                    <Label htmlFor={type} className="text-sm text-muted-foreground cursor-pointer">
                                                        {type}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-card-foreground mb-3">Niveau d'expérience</h3>
                                        <div className="space-y-2">
                                            {["Débutant (2)", "Intermédiaire (5)", "Senior (3)", "Expert (1)"].map((level) => (
                                                <div key={level} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={level}
                                                        onCheckedChange={(checked) => handleFilterChange("experience", level, checked as boolean)}
                                                    />
                                                    <Label htmlFor={level} className="text-sm text-muted-foreground cursor-pointer">
                                                        {level}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-card-foreground mb-3">Salaire</h3>
                                        <div className="space-y-2">
                                            {["0 - 30k (1)", "30k - 50k (4)", "50k - 70k (3)", "70k+ (2)"].map((range) => (
                                                <div key={range} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={range}
                                                        onCheckedChange={(checked) => handleFilterChange("salary", range, checked as boolean)}
                                                    />
                                                    <Label htmlFor={range} className="text-sm text-muted-foreground cursor-pointer">
                                                        {range}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-card-foreground mb-3">Tous les filtres</h3>
                                        <div className="space-y-2">
                                            <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                                                Localisation
                                            </Button>
                                            <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                                                Secteur d'activité
                                            </Button>
                                            <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                                                Taille de l'entreprise
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex-1">
                        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                            <p className="text-muted-foreground">
                                Tous les emplois <span className="font-medium text-foreground">({jobs.length} résultats)</span>
                            </p>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-muted-foreground">Trier par pertinence</span>
                                <Button variant="ghost" size="sm">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
                            {jobs.map((job) => (
                                <Card
                                    key={job.id}
                                    className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-card border-border"
                                >
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-lg flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-semibold text-card-foreground truncate">{job.title}</h3>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {toDisplayText(job.company, "Entreprise")}
                                                    </p>
                                                </div>
                                            </div>
                                            {(job as any).featured && (
                                                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Recommandé</Badge>
                                            )}
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span className="truncate">{toDisplayText(job.location, "Lieu non précisé")}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span>Publié {getPublishedDateLabel(job)}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline">{toDisplayText(job.type, "Type non précisé")}</Badge>
                                                <Badge
                                                    variant="outline"
                                                    className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                                                >
                                                    {toDisplayText(job.salary, "Salaire à discuter")}
                                                </Badge>
                                            </div>
                                            <div className="flex space-x-2 w-full sm:w-auto">
                                                <Button size="sm" variant="outline" className="flex-1 sm:flex-none bg-transparent">
                                                    Sauvegarder
                                                </Button>
                                                <Button size="sm" className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none">
                                                    Postuler
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            {[1, 2, 3, 4, 5].map((page) => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className={currentPage === page ? "bg-primary hover:bg-primary/90" : ""}
                                >
                                    {page}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
    )
}
