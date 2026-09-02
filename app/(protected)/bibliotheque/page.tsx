"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileText, Zap, Download, MoreVertical, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { cvService } from "@/lib/api/cv.service"
import { brouillonNonVide, formatDerniereSauvegarde } from "@/lib/cv-draft"

export default function BibliothequePage() {
    const router = useRouter()
    const [selectedTab, setSelectedTab] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    /** Date de dernière modification du brouillon de CV, `null` s'il n'y en a pas. */
    const [cvDraftAt, setCvDraftAt] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        cvService
            .get()
            .then((res) => {
                if (cancelled) return
                const draft = res?.data
                // La ligne est créée par le GET : seul le contenu dit s'il y a
                // quelque chose à reprendre.
                if (brouillonNonVide(draft)) setCvDraftAt(draft?.updatedAt ?? null)
            })
            .catch(() => {
                // Sans brouillon lisible, la carte garde son libellé « Créer ».
            })
        return () => {
            cancelled = true
        }
    }, [])

    const tabs = [
        { id: "all", label: "Tous (29)", count: 29 },
        { id: "interviews", label: "Entretiens (8)", count: 8 },
        { id: "applications", label: "Candidatures (26)", count: 26 },
        { id: "favorites", label: "Favoris (2)", count: 2 },
        { id: "hired", label: "Embauche (0)", count: 0 },
    ]

    const quickActions = [
        cvDraftAt
            ? {
                  icon: FileText,
                  title: "Reprendre mon CV",
                  description: `Brouillon modifié ${formatDerniereSauvegarde(cvDraftAt)}`,
                  action: "Reprendre",
                  href: "/creer-cv",
              }
            : {
                  icon: FileText,
                  title: "Créer un CV",
                  description: "Créer un CV à partir de ton profil",
                  action: "Créer mon CV",
                  href: "/creer-cv",
              },
        {
            icon: Zap,
            title: "Simulation d'entretien",
            description: "Prépare-toi pour l'entretien",
            action: "Lancer une simulation",
            href: "/simulation-entretien-config",
        },
        {
            icon: FileText,
            title: "Nouveau document",
            description: "Créer un nouveau document",
            action: "Nouveau document",
            href: "/nouveau-document",
        },
        {
            icon: Download,
            title: "Créer un portfolio",
            description: "Créer ton portfolio professionnel",
            action: "Créer un portfolio",
            href: "/creer-portfolio",
        },
    ]

    const applications = [
        {
            id: 1,
            company: "Nomade",
            logo: "🌍",
            role: "Assistant des médias sociaux",
            date: "24 Juillet 2021",
            status: "Entrevue prévue",
            statusColor: "orange",
        },
        {
            id: 2,
            company: "Uberly",
            logo: "🚗",
            role: "Assistante en médias sociaux",
            date: "20 Juillet 2021",
            status: "Entrevue prévue",
            statusColor: "orange",
        },
        {
            id: 3,
            company: "Emsouetteur",
            logo: "📱",
            role: "Assistant des médias sociaux",
            date: "16 Juillet 2021",
            status: "Entrevue prévue",
            statusColor: "orange",
        },
        {
            id: 4,
            company: "Sépurir",
            logo: "🏢",
            role: "Assistant de médias sociaux",
            date: "14 Juillet 2021",
            status: "Refusé",
            statusColor: "pink",
        },
        {
            id: 5,
            company: "DigitalOcean",
            logo: "☁️",
            role: "Assistant en médias sociaux",
            date: "10 Juillet 2021",
            status: "Entrevue prévue",
            statusColor: "orange",
        },
    ]

    return (
        <div className="bg-white dark:bg-card">
            <div className="mx-auto max-w-6xl">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#1b2331] dark:text-foreground">Bibliothèque</h1>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-[16px] font-bold text-[#1b2331] dark:text-foreground mb-4">Nouvelles fonctionnalités</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, i) => {
                            const Icon = action.icon
                            return (
                                <Card key={i} className="border border-[#e8edf6] dark:border-border hover:shadow-md transition-shadow">
                                    <CardContent className="p-6 flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-[#eff4ff] dark:bg-primary/10 flex items-center justify-center mb-3">
                                            <Icon className="w-8 h-8 text-[#2f6de6] dark:text-primary" />
                                        </div>
                                        <h3 className="font-bold text-[13px] text-[#1b2331] dark:text-foreground mb-1">{action.title}</h3>
                                        <p className="text-[11px] text-[#7f8796] dark:text-muted-foreground mb-4">{action.description}</p>
                                        <button
                                            onClick={() => router.push(action.href)}
                                            className="h-8 px-4 rounded-full bg-[#1b2331] text-white text-[11px] font-medium hover:bg-[#2d3e4f]"
                                        >
                                            {action.action}
                                        </button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                {/* Tabs & Search */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-wrap gap-2 border-b border-[#e8edf6] dark:border-border">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id)}
                                className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors ${
                                    selectedTab === tab.id
                                        ? "text-[#2f6de6] dark:text-primary border-[#2f6de6]"
                                        : "text-[#7f8796] dark:text-muted-foreground border-transparent hover:text-[#1b2331] dark:hover:text-foreground"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1 md:flex-initial">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9aa3b2] dark:text-muted-foreground" />
                            <Input
                                placeholder="Rechercher"
                                className="pl-9 h-9 text-[13px] border-[#e8edf6] dark:border-border bg-white dark:bg-card"
                            />
                        </div>
                        <button className="h-9 px-3 rounded-lg border border-[#e8edf6] dark:border-border text-[#1b2331] dark:text-foreground hover:bg-[#f4f5f7] dark:hover:bg-muted flex items-center gap-2 text-[12px]">
                            <Filter className="w-4 h-4" />
                            Filtrer
                        </button>
                    </div>
                </div>

                {/* Applications Table */}
                <div className="bg-white dark:bg-card rounded-lg border border-[#e8edf6] dark:border-border overflow-x-auto">
                    <table className="w-full min-w-[720px]">
                        <thead>
                            <tr className="border-b border-[#e8edf6] dark:border-border">
                                <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#7f8796] dark:text-muted-foreground">#</th>
                                <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#7f8796] dark:text-muted-foreground">Nom de l'entreprise</th>
                                <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#7f8796] dark:text-muted-foreground">Rôles</th>
                                <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#7f8796] dark:text-muted-foreground">Date de la demande</th>
                                <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#7f8796] dark:text-muted-foreground">État</th>
                                <th className="px-4 py-3 text-center text-[12px] font-semibold text-[#7f8796] dark:text-muted-foreground"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app, index) => (
                                <tr key={app.id} className="border-b border-[#e8edf6] dark:border-border hover:bg-[#f9fafb] dark:hover:bg-muted transition-colors">
                                    <td className="px-4 py-4 text-[13px] text-[#1b2331] dark:text-foreground font-medium">{index + 1}</td>
                                    <td className="px-4 py-4 text-[13px]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-[#e8edf6] dark:bg-muted flex items-center justify-center text-[14px]">
                                                {app.logo}
                                            </div>
                                            <span className="text-[#1b2331] dark:text-foreground font-medium">{app.company}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-[13px] text-[#7f8796] dark:text-muted-foreground">{app.role}</td>
                                    <td className="px-4 py-4 text-[13px] text-[#7f8796] dark:text-muted-foreground">{app.date}</td>
                                    <td className="px-4 py-4">
                                        <Badge
                                            variant="outline"
                                            className={`text-[11px] px-3 py-1 ${
                                                app.statusColor === "orange"
                                                    ? "bg-[#fff3e0] dark:bg-muted border-[#ffe0b2] dark:border-[#6a5026] text-[#f57c00]"
                                                    : "bg-[#fce4ec] dark:bg-muted border-[#f8bbd0] dark:border-[#764356] text-[#c2185b] dark:text-[#ff88a8]"
                                            }`}
                                        >
                                            {app.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <button className="p-1 hover:bg-[#e8edf6] dark:hover:bg-muted rounded">
                                            <MoreVertical className="w-4 h-4 text-[#9aa3b2] dark:text-muted-foreground" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-center gap-2">
                    <button className="h-8 w-8 rounded-lg border border-[#e8edf6] dark:border-border flex items-center justify-center hover:bg-[#f4f5f7] dark:hover:bg-muted">
                        <ChevronLeft className="w-4 h-4 text-[#7f8796] dark:text-muted-foreground" />
                    </button>
                    {[1, 2, 3, 4, 5].map((page) => (
                        <button
                            key={page}
                            className={`h-8 w-8 rounded-lg flex items-center justify-center text-[12px] font-medium transition-colors ${
                                page === 1
                                    ? "bg-[#2f6de6] text-white"
                                    : "border border-[#e8edf6] dark:border-border text-[#1b2331] dark:text-foreground hover:bg-[#f4f5f7] dark:hover:bg-muted"
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button className="h-8 w-8 rounded-lg border border-[#e8edf6] dark:border-border flex items-center justify-center hover:bg-[#f4f5f7] dark:hover:bg-muted">
                        <ChevronRight className="w-4 h-4 text-[#7f8796] dark:text-muted-foreground" />
                    </button>
                </div>
            </div>
        </div>
    )
}
