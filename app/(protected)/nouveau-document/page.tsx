"use client"

import { useRouter } from "next/navigation"
import { FilePenLine, FileSignature, FileText, PenLine } from "lucide-react"

export default function Page() {
  const router = useRouter()

  const cards = [
    {
      id: "motivation",
      title: "Lettre de motivation",
      description: "Crée une lettre de motivation personnalisée pour ta candidature",
      icon: FilePenLine,
    },
    {
      id: "demission",
      title: "Lettre de démission",
      description: "Rédige une lettre de démission professionnelle",
      icon: FileText,
    },
    {
      id: "recommandation",
      title: "Lettre de recommandation",
      description: "Demande ou rédige une lettre de recommandation",
      icon: FileSignature,
    },
  ]

  const handleSelect = (type: string) => {
    router.push(`/creer-document/${type}`)
  }

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="border-b border-[#d9dfea] px-4 py-4 sm:px-6">
        <h1 className="text-2xl sm:text-[32px] font-semibold leading-none text-[#1b2331]">Nouveau document</h1>
      </div>

      <div className="mx-auto flex w-full max-w-[980px] flex-col items-center px-4 pb-10 pt-12 sm:px-6 sm:pt-14">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[10px] border border-[#d7deeb] bg-white">
          <PenLine className="h-8 w-8 text-[#1cc6df]" strokeWidth={1.8} />
        </div>

        <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#161d2d] text-center">Créateur de documents</h2>
        <p className="mt-2 text-center text-[14px] text-[#80889a]">
          Choisis le type de document que tu souhaites créer
        </p>

        <div className="mt-10 grid w-full max-w-[680px] grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon

            return (
              // Aucune carte n'est pré-sélectionnée : l'état « sélectionné » est
              // porté par le survol (et le focus clavier, son équivalent).
              <button
                key={card.id}
                type="button"
                onClick={() => handleSelect(card.id)}
                className="rounded-[12px] border border-[#e1e6f1] bg-white px-4 py-5 text-center transition-colors hover:border-[#6a9ff3] hover:bg-[#f5f9ff] focus-visible:border-[#6a9ff3] focus-visible:bg-[#f5f9ff] focus-visible:outline-none"
              >
                <div className="mx-auto mb-3 flex h-7 w-7 items-center justify-center rounded-md bg-[#7f39fb] text-white">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                {/* `text-center` explicite : globals.css justifie tous les `main p`,
                    ce qui déchirait les libellés courts des cartes. */}
                <p className="mx-auto max-w-[145px] text-center text-[14px] font-medium leading-[1.25] text-[#161d2d]">{card.title}</p>
                <p className="mx-auto mt-2 max-w-[160px] text-center text-[11px] leading-[1.35] text-[#8b93a3]">{card.description}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
