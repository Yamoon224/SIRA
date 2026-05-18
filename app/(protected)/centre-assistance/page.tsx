"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Mail, Phone, ChevronDown, ChevronRight } from "lucide-react"
import { TawkToChat } from "@/components/tawk-to-chat"

export default function Page() {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

    const contactMethods = [
        {
            icon: MessageCircle,
            title: "Chat en direct",
            description: "Chatez avec nos experts",
            action: "Démarrer la conversation",
            color: "bg-blue-50 text-blue-600",
        },
        {
            icon: Mail,
            title: "Envoyer un email",
            description: "Écrivez-nous votre demande",
            action: "Ouvrir l'email",
            color: "bg-green-50 text-green-600",
        },
        {
            icon: Phone,
            title: "Téléphone",
            description: "Appelez notre équipe",
            action: "+227 01 02 03 04 05",
            color: "bg-orange-50 text-orange-600",
        },
    ]

    const categories = [
        { name: "Candidatures", color: "bg-blue-500", count: "4 articles" },
        { name: "CV & Profil", color: "bg-green-500", count: "5 articles" },
        { name: "Entreprises", color: "bg-orange-500", count: "3 articles" },
        { name: "Facturation", color: "bg-red-500", count: "2 articles" },
    ]

    const faqItems = [
        {
            question: "Comment am plifier l'aide d'effort pour le ? ",
            views: "89 vues",
        },
        {
            question: "Comment télécharger le carnet de candidats ?",
            views: "67 vues",
        },
        {
            question: "Puis-je modifier mes infos après inscription ?",
            views: "Actualités",
        },
        {
            question: "Comment annuler mon abonnement ?",
            views: "Fonctionnalités",
        },
    ]

    const resources = [
        {
            title: "Guide de démarrage rapide",
            description: "Apprenez les étapes clés pour bien commencer",
            badge: "Nouveau",
        },
        {
            title: "Optimiser son profil Goriya",
            description: "Conseils pour améliorer votre visibilité",
            badge: "Populaire",
        },
    ]

    return (
        <>
            <TawkToChat />

            <div className="min-h-screen bg-white">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    {/* Header */}
                    <h1 className="text-xl font-bold text-[#1b2331] mb-8">Centre d'assistance</h1>

                    {/* Hero Section */}
                    <div className="bg-gradient-to-r from-[#1d4db8] to-[#2566d9] rounded-2xl p-8 text-white mb-12">
                        <h2 className="text-3xl font-bold mb-2">Comment pouvons-nous vous aider ?</h2>
                        <p className="text-white/90 mb-6">
                            Trouvez rapidement des réponses à vos questions ou consultez nos ressources
                        </p>

                        {/* Contact Methods */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {contactMethods.map((method, i) => {
                                const Icon = method.icon
                                return (
                                    <button
                                        key={i}
                                        className={`${method.color} rounded-xl p-4 text-left hover:opacity-90 transition-opacity`}
                                    >
                                        <Icon className="w-6 h-6 mb-2" />
                                        <h3 className="font-semibold text-[13px]">{method.title}</h3>
                                        <p className="text-[11px] opacity-75">{method.description}</p>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="mb-12">
                        <h3 className="text-lg font-bold text-[#1b2331] mb-4">Parcourir par catégorie</h3>
                        <div className="flex justify-center gap-6 flex-wrap">
                            {categories.map((cat, i) => (
                                <button
                                    key={i}
                                    className="flex flex-col items-center gap-2 hover:opacity-75 transition-opacity"
                                >
                                    <div
                                        className={`w-14 h-14 ${cat.color} rounded-full flex items-center justify-center text-white font-bold text-xl hover:shadow-lg transition-shadow cursor-pointer`}
                                    >
                                        {cat.name.charAt(0)}
                                    </div>
                                    <p className="text-[12px] font-medium text-[#1b2331]">{cat.name}</p>
                                    <p className="text-[11px] text-[#9aa3b2]">{cat.count}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mb-12">
                        <h3 className="text-lg font-bold text-[#1b2331] mb-4">Réponses aux questions</h3>
                        <div className="space-y-3">
                            {faqItems.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                                    className="w-full bg-white border border-[#e8edf6] rounded-xl p-4 hover:border-[#2f6de6] transition-colors text-left"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium text-[13px] text-[#1b2331] mb-1">{item.question}</p>
                                            <p className="text-[11px] text-[#9aa3b2]">{item.views}</p>
                                        </div>
                                        <ChevronDown
                                            className={`w-5 h-5 text-[#9aa3b2] transition-transform ${
                                                openFaqIndex === i ? "rotate-180" : ""
                                            }`}
                                        />
                                    </div>

                                    {/* Expanded content */}
                                    {openFaqIndex === i && (
                                        <div className="mt-4 pt-4 border-t border-[#e8edf6]">
                                            <p className="text-[12px] text-[#4e5a6e] leading-relaxed">
                                                Réponse détaillée à la question...
                                            </p>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Resources Section */}
                    <div className="mb-12">
                        <h3 className="text-lg font-bold text-[#1b2331] mb-4">Ressources utiles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {resources.map((resource, i) => (
                                <Card key={i} className="border border-[#e8edf6] hover:shadow-md transition-shadow">
                                    <CardContent className="p-4 flex items-start gap-3">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-[13px] text-[#1b2331] mb-1">{resource.title}</h4>
                                            <p className="text-[12px] text-[#7f8796] mb-2">{resource.description}</p>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#5b6f98]">
                                                {resource.badge}
                                            </span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-[#9aa3b2] flex-shrink-0" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-white border border-[#e8edf6] rounded-2xl p-8 text-center mb-12">
                        <h3 className="text-lg font-bold text-[#1b2331] mb-2">Besoin d'aide personnalisée ?</h3>
                        <p className="text-[13px] text-[#7f8796] mb-6">
                            N'avez pas trouvé ce que vous cherchiez ? Notre équipe support est disponible pour vous aider
                        </p>
                        <div className="flex gap-3 justify-center flex-wrap">
                            <button className="px-6 h-9 rounded-full bg-[#2f6de6] hover:bg-[#2157d3] text-white text-[12px] font-medium">
                                Contacter le support
                            </button>
                            <button className="px-6 h-9 rounded-full border border-[#d8deeb] text-[#2f6de6] text-[12px] font-medium hover:bg-[#f4f7ff]">
                                Parcourir les ressources
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}