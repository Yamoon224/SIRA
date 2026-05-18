"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MoreVertical, ArrowRight, Download, Share2, Eye, FileText, Briefcase } from "lucide-react"

export default function Page() {
    const { user } = useAuth()
    const [currentDate, setCurrentDate] = useState("")

    useEffect(() => {
        const date = new Date()
        const options: Intl.DateTimeFormatOptions = {
            weekday: "long",
            month: "long",
            day: "numeric",
        }
        setCurrentDate(date.toLocaleDateString("fr-FR", options))
    }, [])

    const displayName = user?.name ?? "Utilisateur"
    const initials = displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-white p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Page Title */}
                    <div className="mb-8">
                        <h1 className="text-[24px] font-bold text-[#1b2331]">Tableau de bord</h1>
                    </div>

                    {/* Header Section */}
                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <h2 className="text-[28px] font-bold text-[#1b2331] mb-1">Bonjour, {displayName}</h2>
                            <p className="text-[13px] text-[#7f8796]">Voici un aperçu de vos candidatures et offres d'emploi</p>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-[11px] text-[#9aa3b2] mb-1">Prochaine entrevue</p>
                            <p className="text-[14px] font-semibold text-[#1b2331] mb-3">Aujourd'hui</p>
                            <Avatar className="w-10 h-10 ml-auto">
                                <AvatarImage src={user?.avatar ?? undefined} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white border border-[#e8edf6] rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] text-[#9aa3b2] mb-1">Candidatures soumises</p>
                                    <p className="text-[28px] font-bold text-[#1b2331]">45</p>
                                </div>
                                <Briefcase className="w-10 h-10 text-[#e8edf6]" />
                            </div>
                        </div>

                        <div className="bg-white border border-[#e8edf6] rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] text-[#9aa3b2] mb-1">Entretiens</p>
                                    <p className="text-[28px] font-bold text-[#1b2331]">18</p>
                                </div>
                                <Briefcase className="w-10 h-10 text-[#e8edf6]" />
                            </div>
                        </div>

                        <div className="bg-white border border-[#e8edf6] rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] text-[#9aa3b2] mb-1">Taux de réussite</p>
                                    <p className="text-[28px] font-bold text-[#1b2331]">40%</p>
                                </div>
                                <div className="w-10 h-10 bg-[#2f6de6] rounded-full flex items-center justify-center">
                                    <span className="text-white text-[14px] font-bold">📈</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-[#e8edf6] rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] text-[#9aa3b2] mb-1">Vues du profil</p>
                                    <p className="text-[28px] font-bold text-[#1b2331]">127</p>
                                </div>
                                <Eye className="w-10 h-10 text-[#e8edf6]" />
                            </div>
                        </div>
                    </div>

                    {/* Historique Section */}
                    <div className="mb-8">
                        <h3 className="text-[16px] font-bold text-[#1b2331] mb-4">Historique des identités opérationnelles</h3>

                        <div className="space-y-3">
                            {[
                                {
                                    icon: "📋",
                                    title: "Candidature aux médias sociaux",
                                    company: "Applause",
                                    date: "Onap 2025",
                                    status: "Entrevue prévue",
                                },
                                {
                                    icon: "📋",
                                    title: "Candidat en médias sociaux",
                                    company: "Applause",
                                    date: "Onap 2025",
                                    status: "Entrevue prévue",
                                },
                                {
                                    icon: "📋",
                                    title: "Candidature aux médias sociaux",
                                    company: "Applause",
                                    date: "Onap 2025",
                                    status: "Entrevue prévue",
                                },
                            ].map((item, i) => (
                                <div key={i} className="bg-white border border-[#e8edf6] rounded-xl p-4 flex items-center justify-between hover:border-[#2f6de6] transition-colors">
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className="text-[20px]">{item.icon}</span>
                                        <div>
                                            <p className="text-[13px] font-semibold text-[#1b2331]">{item.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[11px] text-[#7f8796]">{item.company}</span>
                                                <span className="text-[11px] text-[#9aa3b2]">•</span>
                                                <span className="text-[11px] text-[#7f8796]">{item.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="text-[10px] px-2 py-1 border-[#d8deeb] text-[#2f6de6]">
                                            {item.status}
                                        </Badge>
                                        <button className="p-1 hover:bg-[#f4f5f7] rounded">
                                            <MoreVertical className="w-4 h-4 text-[#9aa3b2]" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 text-center">
                            <a href="#" className="text-[12px] text-[#2f6de6] font-medium hover:underline">
                                Voir l'historique en entier de visibilité-utilisation →
                            </a>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-8 bg-[#f4f5f7] rounded-xl p-6">
                        <h3 className="text-[16px] font-bold text-[#1b2331] mb-4 text-center">Mes applications les plus récentes</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { icon: "📄", label: "Télécharger mon CV", color: "bg-[#2f6de6]" },
                                { icon: "📄", label: "Modifier mon profil", color: "bg-[#2f6de6]" },
                                { icon: "📄", label: "Voir mes favoris", color: "bg-[#2f6de6]" },
                                { icon: "📄", label: "Contacter support", color: "bg-[#2f6de6]" },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    className="bg-white border border-[#e8edf6] rounded-lg p-4 text-center hover:border-[#2f6de6] hover:bg-[#f4f7ff] transition-colors"
                                >
                                    <p className="text-[20px] mb-2">{action.icon}</p>
                                    <p className="text-[12px] font-medium text-[#1b2331]">{action.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Companies Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[16px] font-bold text-[#1b2331]">Les entreprises qui recrutent</h3>
                            <a href="#" className="text-[12px] text-[#2f6de6] font-medium hover:underline">
                                Voir plus →
                            </a>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                {
                                    logo: "🏢",
                                    name: "Radiant",
                                    description: "Technologie, informatique et internet",
                                    views: "245 vues",
                                    tags: ["Marketing", "Conception"],
                                },
                                {
                                    logo: "🏢",
                                    name: "Thrifter",
                                    description: "Technologie, informatique et internet",
                                    views: "145 vues",
                                    tags: ["Marketing"],
                                },
                                {
                                    logo: "🏢",
                                    name: "Affirm",
                                    description: "Technologie, informatique et internet",
                                    views: "98 vues",
                                    tags: ["Conception"],
                                },
                                {
                                    logo: "🏢",
                                    name: "Marketing",
                                    description: "Technologie, informatique et internet",
                                    views: "78 vues",
                                    tags: ["Marketing"],
                                },
                            ].map((company, i) => (
                                <Card key={i} className="border border-[#e8edf6] hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-10 h-10 bg-[#f0f3fb] rounded-lg flex items-center justify-center text-[18px]">
                                                {company.logo}
                                            </div>
                                            <button className="p-1 hover:bg-[#f4f5f7] rounded">
                                                <MoreVertical className="w-4 h-4 text-[#9aa3b2]" />
                                            </button>
                                        </div>
                                        <h4 className="text-[13px] font-bold text-[#1b2331] mb-1">{company.name}</h4>
                                        <p className="text-[11px] text-[#7f8796] mb-2">{company.description}</p>
                                        <p className="text-[10px] text-[#9aa3b2] mb-3">{company.views}</p>
                                        <div className="flex gap-1 flex-wrap mb-3">
                                            {company.tags.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="text-[9px] px-2 py-0.5 bg-[#eff4ff] text-[#5b6f98]"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                        <button className="w-full h-8 rounded-lg border border-[#d8deeb] text-[11px] font-medium text-[#2f6de6] hover:bg-[#f4f7ff]">
                                            Voir l'offre d'emploi
                                        </button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}

