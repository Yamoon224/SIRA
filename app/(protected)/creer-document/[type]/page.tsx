"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { generateDocumentContent, type DocumentData } from "@/lib/document-generator"

type TemplateField = {
  id: string
  label: string
  required: boolean
  split?: boolean
}

type TemplateConfig = {
  title: string
  fields: TemplateField[]
}

const documentTemplates: Record<string, TemplateConfig> = {
  motivation: {
    title: "Lettre de motivation",
    fields: [
      { id: "nom", label: "Votre nom", required: true, split: true },
      { id: "titre", label: "Votre titre", required: false, split: true },
      { id: "destinataire", label: "Nom du destinataire", required: false, split: true },
      { id: "titreDestinataire", label: "Titre du destinataire", required: false, split: true },
      { id: "entreprise", label: "Nom de l'entreprise", required: true },
      { id: "poste", label: "Poste visé", required: true },
      { id: "date", label: "Date", required: false },
    ],
  },
  demission: {
    title: "Lettre de démission",
    fields: [
      { id: "nom", label: "Votre nom", required: true, split: true },
      { id: "poste", label: "Votre poste", required: true, split: true },
      { id: "manager", label: "Nom du destinataire", required: false, split: true },
      { id: "entreprise", label: "Nom de l'entreprise", required: true, split: true },
      { id: "dateFin", label: "Date de fin souhaitée", required: true },
      { id: "date", label: "Date", required: false },
    ],
  },
  recommandation: {
    title: "Lettre de recommandation",
    fields: [
      { id: "nom", label: "Votre nom", required: true, split: true },
      { id: "poste", label: "Votre titre", required: true, split: true },
      { id: "candidat", label: "Nom du destinataire", required: true, split: true },
      { id: "posteCandidatActuel", label: "Titre du destinataire", required: false, split: true },
      { id: "posteCandidatVise", label: "Poste visé", required: false },
      { id: "date", label: "Date", required: false },
    ],
  },
}

function getFallbackPreview(formData: DocumentData): string {
  const nom = formData.nom || "kkkk kkkk"
  const entreprise = formData.entreprise || "kkkkk"
  const poste = formData.poste || "Inejflier"

  return `Objet : Candidature pour le poste de ${poste}

${nom},

J'ai l'honneur de vous adresser ma candidature pour le poste de ${poste} au sein de ${entreprise}.

Diplômé(e) et fort(e) de mon expérience professionnelle, je suis convaincu(e) que mon profil correspond aux exigences de ce poste. Mes compétences en [compétences clés] et ma motivation pour [domaine d'activité] me permettront de contribuer efficacement aux objectifs de votre équipe.

[Développez ici vos expériences pertinentes et vos motivations spécifiques pour l'entreprise]

Je serais ravi(e) de vous rencontrer pour discuter de ma candidature et vous démontrer ma motivation. Je reste à votre disposition pour tout entretien à votre convenance.

Dans l'attente de votre retour, je vous prie d'agréer, kkkkk kkkk, l'expression de mes salutations distinguées.

kk,
kk`
}

export default function Page() {
  const params = useParams()
  const documentType = params.type as string
  const template = documentTemplates[documentType]

  const [formData, setFormData] = useState<DocumentData>({})
  const [previewContent, setPreviewContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const defaultPreview = useMemo(() => getFallbackPreview(formData), [formData])

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: "" }))
    }
  }

  const validateForm = (): boolean => {
    if (!template) return false

    const newErrors: Record<string, string> = {}
    template.fields.forEach((field) => {
      if (field.required && !formData[field.id]?.trim()) {
        newErrors[field.id] = "Ce champ est requis"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateDocument = async () => {
    if (!validateForm()) return

    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 400))
    setPreviewContent(generateDocumentContent(documentType, formData))
    setIsGenerating(false)
  }

  const handleClear = () => {
    setFormData({})
    setErrors({})
    setPreviewContent("")
  }

  const handleRegenerate = () => {
    if (!validateForm()) return
    setPreviewContent(generateDocumentContent(documentType, formData))
  }

  if (!template) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>Type de document non trouvé. Veuillez sélectionner un type de document valide.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const splitFields = template.fields.filter((field) => field.split)
  const singleFields = template.fields.filter((field) => !field.split)

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="border-b border-[#d9dfea] px-4 py-4 sm:px-6">
        <h1 className="text-2xl sm:text-[32px] font-semibold leading-none text-[#1b2331]">Nouveau document</h1>
      </div>

      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[1.62fr_1fr]">
        <section className="flex min-h-0 lg:min-h-[548px] flex-col rounded-[12px] border border-[#e5e9f2] bg-white p-4 sm:p-5">
          <h2 className="mb-3 text-[14px] font-semibold text-[#1d2433]">{template.title}</h2>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {splitFields.map((field) => (
              <div key={field.id}>
                <label className="mb-1 block text-[11px] text-[#8b93a3]">{field.label}</label>
                <Input
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.label}
                  className={`h-8 rounded-[7px] border-0 bg-[#f1f2f5] text-[12px] shadow-none focus-visible:ring-0 ${
                    errors[field.id] ? "ring-1 ring-red-400" : ""
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="mt-2 space-y-2">
            {singleFields.map((field) => (
              <div key={field.id}>
                <label className="mb-1 block text-[11px] text-[#8b93a3]">{field.label}</label>
                <Input
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.label}
                  className={`h-8 rounded-[7px] border-0 bg-[#f1f2f5] text-[12px] shadow-none focus-visible:ring-0 ${
                    errors[field.id] ? "ring-1 ring-red-400" : ""
                  }`}
                />
              </div>
            ))}
          </div>

          <Button
            onClick={generateDocument}
            disabled={isGenerating}
            className="mt-5 lg:mt-auto h-9 w-full sm:w-fit rounded-full bg-[#1d57d4] px-11 text-[12px] font-semibold text-white hover:bg-[#1949b2]"
          >
            {isGenerating ? "Génération..." : "Générer le document"}
          </Button>
        </section>

        <section className="flex min-h-0 lg:min-h-[548px] flex-col rounded-[12px] border border-[#e5e9f2] bg-white p-4 sm:p-5">
          <h2 className="mb-3 text-[14px] font-semibold text-[#1d2433]">Aperçu du document</h2>

          <div className="relative h-[320px] sm:h-[418px] overflow-hidden rounded-[12px] bg-[#f2f5fb] p-4">
            <div className="pointer-events-none absolute -left-14 bottom-3 h-48 w-48 rounded-full border-[22px] border-[#dce4f4] opacity-70" />
            <div className="pointer-events-none absolute left-4 bottom-7 h-12 w-12 rounded-full bg-[#dce4f4] opacity-80" />
            <div className="pointer-events-none absolute left-16 bottom-0 h-4 w-4 rounded-full bg-[#dce4f4] opacity-80" />

            <pre className="relative z-10 h-full whitespace-pre-wrap text-[10.5px] leading-[1.55] text-[#7d8595]">
              {previewContent || defaultPreview}
            </pre>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button
              variant="ghost"
              onClick={handleClear}
              className="h-9 rounded-full bg-[#eaedf8] text-[12px] font-medium text-[#646d80] hover:bg-[#dfe4f4]"
            >
              Effacer
            </Button>
            <Button
              variant="ghost"
              onClick={handleRegenerate}
              className="h-9 rounded-full bg-[#eaedf8] text-[12px] font-medium text-[#646d80] hover:bg-[#dfe4f4]"
            >
              Régénérer
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
