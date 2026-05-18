"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Image from "next/image"

export default function Page() {
  const projects = [
    {
      id: 1,
      name: "Growthity",
      description: "Site web d'analyse et de vente SaaS",
      image: "/images/portfolio.png",
    },
    {
      id: 2,
      name: "Pionna",
      description: "Application de gestion de projet",
      image: "/images/creer-portfolio.png",
    },
    {
      id: 3,
      name: "Furino",
      description: "Landing Page pour magasin de meubles",
      image: "/images/portfolio.png",
    },
  ]

  return (
    <div className="min-h-screen bg-[#fafbfc] flex">
      <div className="flex-1 flex flex-col items-center w-full">
        <div className="w-full max-w-4xl mx-auto pt-6 sm:pt-8 px-4 sm:px-0">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1b2331] mb-4 sm:mb-6">Créer un portfolio</h1>
          <div className="bg-white border border-[#e8edf6] rounded-xl p-0 sm:p-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
              <div>
                <h2 className="text-lg font-semibold text-[#1b2331]">Votre portfolio</h2>
                <div className="text-[15px] text-[#7f8796] mt-1">CV</div>
              </div>
              <Button className="bg-[#2f6de6] hover:bg-[#2554b8] text-white font-medium rounded-full px-4 py-2 text-sm flex items-center justify-center gap-2 shadow-none w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
            </div>
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
              <div className="space-y-3">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center gap-3 sm:gap-4 bg-white rounded-lg border border-[#e8edf6] p-3">
                    <div className="w-16 h-16 bg-[#f4f5f7] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <Image
                        src={project.image || "/placeholder.svg"}
                        alt={project.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#1b2331] text-sm sm:text-base leading-5">{project.name} <span className="font-normal text-[#7f8796]">– {project.description}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
