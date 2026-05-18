"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronRight } from "lucide-react"

export default function Page() {
    const [theme, setTheme] = useState<"light" | "dark">("light")
    const [profileData, setProfileData] = useState({
        fullName: "",
        title: "",
        bio: "",
        location: "",
        email: "",
        skills: "",
    })

    const themes = [
        { name: "Light", value: "light", colors: ["bg-white", "bg-gray-100"] },
        { name: "Dark", value: "dark", colors: ["bg-black", "bg-gray-900"] },
        { name: "Purple", value: "purple", colors: ["bg-purple-500", "bg-purple-700"] },
        { name: "Pink", value: "pink", colors: ["bg-pink-500", "bg-pink-700"] },
    ]

    const projects = [
        { title: "Alloc-image", link: "Voir le projet" },
        { title: "Link Github", link: "Voir Github" },
        { title: "Consulter", link: "Consulter" },
    ]

    const socialLinks = [
        { label: "LinkedIn", value: "" },
        { label: "GitHub", value: "" },
        { label: "Twitter", value: "" },
    ]

    return (
        <div className="min-h-screen bg-white p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Page Title */}
                <h1 className="text-2xl font-bold text-[#1b2331] mb-8">Créer un portfolio</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Profil professionnel */}
                        <div>
                            <h2 className="text-lg font-bold text-[#1b2331] mb-4">Profil professionnel</h2>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-[12px] font-semibold text-[#1b2331]">Nom complet</Label>
                                    <Input
                                        placeholder="Votre nom complet"
                                        value={profileData.fullName}
                                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                        className="mt-1 h-9 text-[13px] border-[#e8edf6]"
                                    />
                                </div>
                                <div>
                                    <Label className="text-[12px] font-semibold text-[#1b2331]">Titre professionnel</Label>
                                    <Input
                                        placeholder="Votre titre professionnel"
                                        value={profileData.title}
                                        onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                                        className="mt-1 h-9 text-[13px] border-[#e8edf6]"
                                    />
                                </div>
                                <div>
                                    <Label className="text-[12px] font-semibold text-[#1b2331]">Bio / Description</Label>
                                    <Textarea
                                        placeholder="Décrivez-vous en quelques lignes..."
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                        className="mt-1 text-[13px] border-[#e8edf6] min-h-[100px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Info professionelle */}
                        <div>
                            <h3 className="font-bold text-[14px] text-[#1b2331] mb-3">Info professionelle</h3>
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-[12px] font-semibold text-[#1b2331]">Localisation</Label>
                                    <Input
                                        placeholder="Ville, Pays"
                                        value={profileData.location}
                                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                        className="mt-1 h-9 text-[13px] border-[#e8edf6]"
                                    />
                                </div>
                                <div>
                                    <Label className="text-[12px] font-semibold text-[#1b2331]">Email</Label>
                                    <Input
                                        placeholder="contact@email.com"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="mt-1 h-9 text-[13px] border-[#e8edf6]"
                                    />
                                </div>
                                <div>
                                    <Label className="text-[12px] font-semibold text-[#1b2331]">Compétences</Label>
                                    <Input
                                        placeholder="React, Node.js, JavaScript..."
                                        value={profileData.skills}
                                        onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                                        className="mt-1 h-9 text-[13px] border-[#e8edf6]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mes projets */}
                        <div>
                            <h3 className="font-bold text-[14px] text-[#1b2331] mb-3">Mes projets</h3>
                            <div className="space-y-2">
                                {projects.map((project, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between p-3 bg-[#f4f5f7] rounded-lg text-[12px]"
                                    >
                                        <span className="font-medium text-[#1b2331]">{project.title}</span>
                                        <span className="text-[#2f6de6] font-medium cursor-pointer">{project.link}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="mt-3 w-full h-9 rounded-lg border border-[#d8deeb] text-[12px] font-medium text-[#2f6de6] hover:bg-[#f4f7ff]">
                                + Ajouter un projet
                            </button>
                        </div>

                        {/* Liens et réseaux */}
                        <div>
                            <h3 className="font-bold text-[14px] text-[#1b2331] mb-3">Liens et réseaux</h3>
                            <div className="space-y-2">
                                {socialLinks.map((link, i) => (
                                    <div key={i}>
                                        <Label className="text-[12px] font-semibold text-[#1b2331]">{link.label}</Label>
                                        <Input
                                            placeholder={`Votre lien ${link.label.toLowerCase()}`}
                                            value={link.value}
                                            className="mt-1 h-9 text-[13px] border-[#e8edf6]"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Thème du portfolio */}
                        <div>
                            <h2 className="text-lg font-bold text-[#1b2331] mb-4">Thème du portfolio</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {themes.map((t) => (
                                    <button
                                        key={t.value}
                                        onClick={() => setTheme(t.value as "light" | "dark")}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                            theme === t.value
                                                ? "border-[#2f6de6] ring-2 ring-[#2f6de6]/20"
                                                : "border-[#e8edf6] hover:border-[#d8deeb]"
                                        }`}
                                    >
                                        <div className="flex gap-1.5 mb-2">
                                            <div className={`flex-1 h-6 rounded ${t.colors[0]}`} />
                                            <div className={`flex-1 h-6 rounded ${t.colors[1]}`} />
                                        </div>
                                        <p className="text-[12px] font-medium text-[#1b2331]">{t.name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Statistiques */}
                        <div>
                            <h3 className="font-bold text-[14px] text-[#1b2331] mb-3">Statistiques</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-[#f4f5f7] rounded-lg">
                                    <span className="text-[12px] text-[#7f8796]">Profils visités</span>
                                    <span className="text-[14px] font-bold text-[#1b2331]">242</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-[#f4f5f7] rounded-lg">
                                    <span className="text-[12px] text-[#7f8796]">Candidats du profil</span>
                                    <span className="text-[14px] font-bold text-[#1b2331]">12</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-[#f4f5f7] rounded-lg">
                                    <span className="text-[12px] text-[#7f8796]">Taux de conversion</span>
                                    <span className="text-[14px] font-bold text-[#1b2331]">5%</span>
                                </div>
                            </div>
                        </div>

                        {/* Consulte de l'emploi */}
                        <div>
                            <h3 className="font-bold text-[14px] text-[#1b2331] mb-3">Consulte de l'emploi</h3>
                            <div className="bg-gradient-to-br from-[#5b7eff] to-[#2f6de6] rounded-lg p-4 text-white space-y-2">
                                <p className="text-[12px] font-medium">
                                    Lien de partage vers votre portfolio candidat. Vous pouvez
                                </p>
                                <a href="#" className="text-[12px] text-blue-200 hover:underline flex items-center gap-1">
                                    Accéder au lien candidat <ChevronRight className="w-3 h-3" />
                                </a>
                                <a href="#" className="text-[12px] text-blue-200 hover:underline flex items-center gap-1">
                                    Modifier les identifiants relatifs <ChevronRight className="w-3 h-3" />
                                </a>
                                <a href="#" className="text-[12px] text-blue-200 hover:underline flex items-center gap-1">
                                    Consulte les offres d'emploi <ChevronRight className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center mt-8">
                    <Button className="px-8 h-9 rounded-full bg-[#2f6de6] hover:bg-[#2157d3] text-white text-[12px] font-medium">
                        Modifier
                    </Button>
                    <Button variant="outline" className="px-8 h-9 rounded-full border border-[#d8deeb] text-[12px] font-medium">
                        Annuler
                    </Button>
                </div>
            </div>
        </div>
    )
}