"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileText, Zap, Download, MoreVertical, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"

export default function BibliothequePage() {
    const [selectedTab, setSelectedTab] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)

    const tabs = [
        { id: "all", label: "Tous (29)", count: 29 },
        { id: "interviews", label: "Entretiens (8)", count: 8 },
        { id: "applications", label: "Candidatures (26)", count: 26 },
        { id: "favorites", label: "Favoris (2)", count: 2 },
        { id: "hired", label: "Embauche (0)", count: 0 },
    ]

    const quickActions = [
        {
            icon: FileText,
            title: "Commander une CV",
            description: "Créer une CV à partir de ton profil",
            action: "Commander notre CV",
        },
        {
            icon: Zap,
            title: "Télécharger une simulation",
            description: "Prépare-toi pour l'entretien",
            action: "Lancer une simulation",
        },
        {
            icon: FileText,
            title: "Nouveau document",
            description: "Créer un nouveau document",
            action: "Nouveau document",
        },
        {
            icon: Download,
            title: "Créer un portfolio",
            description: "Créer ton portfolio professionnel",
            action: "Créer un portfolio",
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
        <div className="min-h-screen bg-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#1b2331]">Bibliothèque</h1>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-[16px] font-bold text-[#1b2331] mb-4">Nouvelles fonctionnalités</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, i) => {
                            const Icon = action.icon
                            return (
                                <Card key={i} className="border border-[#e8edf6] hover:shadow-md transition-shadow">
                                    <CardContent className="p-6 flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-[#eff4ff] flex items-center justify-center mb-3">
                                            <Icon className="w-8 h-8 text-[#2f6de6]" />
                                        </div>
                                        <h3 className="font-bold text-[13px] text-[#1b2331] mb-1">{action.title}</h3>
                                        <p className="text-[11px] text-[#7f8796] mb-4">{action.description}</p>
                                        <button className="h-8 px-4 rounded-full bg-[#1b2331] text-white text-[11px] font-medium hover:bg-[#2d3e4f]">
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
                    <div className="flex flex-wrap gap-2 border-b border-[#e8edf6]">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id)}
                                className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors ${
                                    selectedTab === tab.id
                                        ? "text-[#2f6de6] border-[#2f6de6]"
                                        : "text-[#7f8796] border-transparent hover:text-[#1b2331]"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1 md:flex-initial">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9aa3b2]" />
                            <Input
                                placeholder="Rechercher"
                                className="pl-9 h-9 text-[13px] border-[#e8edf6] bg-white"
                            />
                        </div>
                        <button className="h-9 px-3 rounded-lg border border-[#e8edf6] text-[#1b2331] hover:bg-[#f4f5f7] flex items-center gap-2 text-[12px]">
                            <Filter className="w-4 h-4" />
                            Filtrer
                        </button>
                    </div>
                </div>

                {/* Applications Table */}
                <div className="bg-white rounded-lg border border-[#e8edf6] overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#e8edf6]">
                                <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#7f8796]">#</th>
                                <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#7f8796]">Nom de l'entreprise</th>
                                <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#7f8796]">Rôles</th>
                                <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#7f8796]">Date de la demande</th>
                                <th className="px-4 py-3 text-left text-[12px] font-semibold text-[#7f8796]">État</th>
                                <th className="px-4 py-3 text-center text-[12px] font-semibold text-[#7f8796]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app, index) => (
                                <tr key={app.id} className="border-b border-[#e8edf6] hover:bg-[#f9fafb] transition-colors">
                                    <td className="px-4 py-4 text-[13px] text-[#1b2331] font-medium">{index + 1}</td>
                                    <td className="px-4 py-4 text-[13px]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-[#e8edf6] flex items-center justify-center text-[14px]">
                                                {app.logo}
                                            </div>
                                            <span className="text-[#1b2331] font-medium">{app.company}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-[13px] text-[#7f8796]">{app.role}</td>
                                    <td className="px-4 py-4 text-[13px] text-[#7f8796]">{app.date}</td>
                                    <td className="px-4 py-4">
                                        <Badge
                                            variant="outline"
                                            className={`text-[11px] px-3 py-1 ${
                                                app.statusColor === "orange"
                                                    ? "bg-[#fff3e0] border-[#ffe0b2] text-[#f57c00]"
                                                    : "bg-[#fce4ec] border-[#f8bbd0] text-[#c2185b]"
                                            }`}
                                        >
                                            {app.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <button className="p-1 hover:bg-[#e8edf6] rounded">
                                            <MoreVertical className="w-4 h-4 text-[#9aa3b2]" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex items-center justify-center gap-2">
                    <button className="h-8 w-8 rounded-lg border border-[#e8edf6] flex items-center justify-center hover:bg-[#f4f5f7]">
                        <ChevronLeft className="w-4 h-4 text-[#7f8796]" />
                    </button>
                    {[1, 2, 3, 4, 5].map((page) => (
                        <button
                            key={page}
                            className={`h-8 w-8 rounded-lg flex items-center justify-center text-[12px] font-medium transition-colors ${
                                page === 1
                                    ? "bg-[#2f6de6] text-white"
                                    : "border border-[#e8edf6] text-[#1b2331] hover:bg-[#f4f5f7]"
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button className="h-8 w-8 rounded-lg border border-[#e8edf6] flex items-center justify-center hover:bg-[#f4f5f7]">
                        <ChevronRight className="w-4 h-4 text-[#7f8796]" />
                    </button>
                </div>
            </div>
        </div>
    )
}
