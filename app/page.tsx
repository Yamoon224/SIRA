"use client"

import Link from "next/link"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Clock, Building2, Search, Heart, Bookmark, Upload, Mail, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { jobService } from "@/lib/api/job.service"
import { IJobOffer } from "@/lib/@types/entities"
import { formatAmount } from "@/lib/utils"
import { extractTextFromFile } from "@/lib/openai-cv-analyzer"
import type { CVAnalysis } from "@/lib/@types/openai"

// Mock user state - in real app this would come from auth context
const isLoggedIn = false // Change this to true to see logged in state

export default function Page() {
    const router = useRouter()
    const cvInputRef = useRef<HTMLInputElement | null>(null)
    const [savedJobs, setSavedJobs] = useState<string[]>([])
    const [popularJobs, setPopularJobs] = useState<IJobOffer[]>([])
    const [jobsLoading, setJobsLoading] = useState(true)
    const [isAnalyzingCV, setIsAnalyzingCV] = useState(false)
    const [uploadError, setUploadError] = useState("")

    useEffect(() => {
        jobService.getJobs({ limit: 6 })
            .then((res) => setPopularJobs(res.data ?? []))
            .catch(() => setPopularJobs([]))
            .finally(() => setJobsLoading(false))
    }, [])

    const toggleSaveJob = (jobId: string) => {
        setSavedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]))
    }

    const handlePickCV = () => {
        if (isAnalyzingCV) return
        cvInputRef.current?.click()
    }

    const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/png",
            "image/jpeg",
            "image/jpg",
        ]

        if (!allowedTypes.includes(file.type)) {
            setUploadError("Format non supporté. Utilisez PDF, Word ou image.")
            event.target.value = ""
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            setUploadError("Le fichier est trop volumineux (max 10MB).")
            event.target.value = ""
            return
        }

        setUploadError("")
        setIsAnalyzingCV(true)

        try {
            const cvText = await extractTextFromFile(file)
            const response = await fetch("/api/analyse-cv", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cvText }),
            })

            const payload = (await response.json()) as { analysis?: CVAnalysis; error?: string }
            if (!response.ok || !payload.analysis) {
                throw new Error(payload.error || "Analyse IA indisponible")
            }

            sessionStorage.setItem(
                "goriya_cv_analysis_result",
                JSON.stringify({
                    fileName: file.name,
                    analyzedAt: new Date().toISOString(),
                    analysis: payload.analysis,
                }),
            )

            router.push("/resultat-analyse-cv")
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : "Une erreur est survenue pendant l'analyse.")
        } finally {
            setIsAnalyzingCV(false)
            event.target.value = ""
        }
    }

    const companyCards = [
        { name: "Marketing REVOLUT", logo: "/revolut-logo.png", tag: "3 offres", location: "Technologie, télétravail" },
        { name: "Twitter", logo: "/generic-bird-logo.png", tag: "Job", location: "Développement & digital" },
        { name: "Pitch", logo: "/pitch-logo-black.jpg", tag: "3 offres", location: "Edition & média" },
        { name: "Marketing REVOLUT", logo: "/revolut-logo.png", tag: "1 offres", location: "Technologie, télétravail" },
        { name: "Pitch", logo: "/pitch-logo-black.jpg", tag: "3 offres", location: "Edition & média" },
        { name: "Marketing REVOLUT", logo: "/revolut-logo.png", tag: "3 offres", location: "Technologie, télétravail" },
        { name: "Twitter", logo: "/generic-bird-logo.png", tag: "job", location: "Développement & digital" },
        { name: "Pitch", logo: "/pitch-logo-black.jpg", tag: "3 offres", location: "Edition & média" },
        { name: "Marketing REVOLUT", logo: "/revolut-logo.png", tag: "1 offres", location: "Technologie, télétravail" },
        { name: "Pitch", logo: "/pitch-logo-black.jpg", tag: "3 offres", location: "Edition & média" },
    ]

    const featureBlocks = [
        {
            title: "Analysez votre document",
            desc: "Téléchargez votre CV, lettre de motivation ou tout autre document et obtenez une analyse intelligente de l'IA qui identifie les points forts et les zones à améliorer en fonction d'un score d'efficacité de 100%.",
            image: "/images/thesis-illustration.png",
            reverse: false,
        },
        {
            title: "Simulation d'entretien",
            desc: "Préparez-vous pour votre prochain entretien d'embauche avec Goriya, en utilisant un chatbot dynamique basé sur un modèle d'intelligence artificielle ou en prenant rendez-vous avec un professionnel des ressources humaines.",
            image: "/images/lettre-recommandation.png",
            reverse: true,
        },
        {
            title: "UNE CONNEXION PLUS FACILE AVEC LES RECRUTEURS",
            desc: "Décrivez votre disponibilité et mettez en valeur votre expérience grâce à un profil complet. Les recruteurs intéressés vous contacteront directement avec des opportunités adaptées.",
            image: "/images/remote-collab.png",
            reverse: false,
        },
        {
            title: "TRANSPARENCE TOTALE SUR LES ENTREPRISES",
            desc: "Découvrez des profils détaillés d'entreprises incluant leur mission, valeurs, environnement de travail, et équipes. Postulez en toute confiance.",
            image: "/images/search-illustration.png",
            reverse: true,
        },
    ]

    if (!isLoggedIn) {
        // Disconnected state - Landing page
        return (
            <div className="min-h-screen bg-[#f7f8fb] text-[#111827]">
                <header className="bg-white border-b border-[#edf1f6]">
                    <div className="mx-auto max-w-[1180px] px-4 h-[56px] sm:h-[64px] md:h-[72px] flex items-center justify-between">
                        <Link href="/" className="flex items-center">
                            <img src="/images/logo.png" alt="Goriya" className="h-8 w-auto" />
                        </Link>
                        <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-[13px] text-[#7a8495] font-medium">
                            <Link href="/" className="text-[#2f6de6]">Accueil</Link>
                            <Link href="/explorer-emplois" className="hover:text-[#2f6de6]">Trouver un emploi</Link>
                            <Link href="/offres" className="hover:text-[#2f6de6]">Tarifs d'abonnement</Link>
                        </nav>
                        <div className="flex items-center gap-2">
                            <Link href="/auth/signin">
                                <Button variant="outline" className="h-8 px-4 rounded-full text-[12px] border-[#b9c8ec] text-[#2f6de6] bg-white">
                                    Connexion
                                </Button>
                            </Link>
                            <Button className="h-8 px-4 rounded-full text-[12px] bg-[#2157d3] hover:bg-[#1d4cb9]">Espace entreprise</Button>
                        </div>
                    </div>
                </header>

                <section className="relative overflow-hidden bg-[#1e7df2] text-white py-10 sm:py-14 md:py-16">
                    <div className="absolute -right-8 top-0 h-full w-[220px] sm:w-[320px] md:w-[380px] hidden md:block">
                        <div className="absolute top-8 right-16 w-36 h-36 border-[18px] border-[#7ab2ff] rounded-full opacity-60" />
                        <div className="absolute top-52 right-4 w-24 h-24 border-[14px] border-[#7ab2ff] rounded-full opacity-60" />
                        <div className="absolute top-40 right-40 w-12 h-12 bg-[#7ab2ff] rounded-full opacity-70" />
                        <div className="absolute top-20 right-28 w-14 h-14 border-[10px] border-[#7ab2ff] rounded-full opacity-40" />
                    </div>
                    <div className="mx-auto max-w-[1180px] px-4 text-center relative z-10">
                        <h1 className="font-extrabold leading-tight text-2xl xs:text-3xl sm:text-4xl md:text-[40px] lg:text-[56px] max-w-[920px] mx-auto">
                            Analysez votre CV. Ameliorez-le pour augmenter vos chances.
                        </h1>
                        <div className="mt-6 sm:mt-9 flex flex-col items-center">
                            <Button
                                onClick={handlePickCV}
                                disabled={isAnalyzingCV}
                                className="h-11 sm:h-12 rounded-full bg-white text-[#20429b] hover:bg-[#f4f7ff] px-5 sm:px-8 font-semibold w-full max-w-[420px] mx-auto"
                            >
                                {isAnalyzingCV ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                                {isAnalyzingCV ? "Analyse IA en cours..." : "Telechargez votre Curriculum Vitae ici"}
                            </Button>
                            <input
                                ref={cvInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.png,.jpeg,.jpg"
                                onChange={handleCVUpload}
                                className="hidden"
                            />
                            {uploadError && <p className="mt-3 text-[12px] text-[#ffd4d4]">{uploadError}</p>}
                        </div>
                        <p className="mt-4 sm:mt-6 text-xs sm:text-[13px] text-[#b9d8ff]">Importer votre CV, lettre de motivation ou tout autre document et obtenir un score d'analyse.</p>
                    </div>
                </section>

                <section className="py-8 sm:py-12 md:py-16 bg-white">
                    <div className="mx-auto max-w-[1180px] px-2 sm:px-4">
                        <h2 className="text-center text-2xl xs:text-3xl sm:text-4xl md:text-[38px] lg:text-[46px] leading-none font-extrabold text-[#111827]">Explorer les entreprises.</h2>
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8 sm:mt-10">
                            {companyCards.map((card, index) => (
                                <article key={`${card.name}-${index}`} className="rounded-2xl border border-[#e8edf6] bg-white p-4 min-h-[140px] xs:min-h-[166px]">
                                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                                        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#f3f5fa] flex items-center justify-center overflow-hidden">
                                            <img src={card.logo} alt={card.name} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-[10px] border border-[#cfe0ff] text-[#7a8db8] rounded-full px-2 py-0.5">{card.tag}</span>
                                    </div>
                                    <h3 className="text-[13px] font-semibold text-[#1a2232]">{card.name}</h3>
                                    <p className="text-[11px] text-[#8a95a8] mt-0.5">{card.location}</p>
                                    <p className="text-[10px] text-[#9aa5b8] mt-2 leading-4">Reçoit de belles candidatures en peu de temps et offre l'expérience de postuler plus facilement.</p>
                                    <div className="mt-3 flex gap-2">
                                        <span className="text-[10px] rounded-full bg-[#f1f5ff] text-[#4f6ea4] px-2 py-0.5">Marketing</span>
                                        <span className="text-[10px] rounded-full bg-[#f1f5ff] text-[#4f6ea4] px-2 py-0.5">Categorie</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                        <div className="text-center mt-6 sm:mt-8">
                            <Link href="/explorer-entreprises">
                                <Button className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba] h-10 sm:h-11 px-6 sm:px-8">+ Decouvrir en plus</Button>
                            </Link>
                        </div>
                        <div className="mt-10 sm:mt-14 grid grid-cols-2 xs:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 items-center opacity-80">
                            <img src="/partners/oraimo.png" alt="Oraimo" className="h-12 xs:h-14 md:h-16 w-auto mx-auto" />
                            <img src="/partners/gtco.png" alt="GTCO" className="h-12 xs:h-14 md:h-16 w-auto mx-auto" />
                            <img src="/partners/te.png" alt="TE" className="h-12 xs:h-14 md:h-16 w-auto mx-auto" />
                            <img src="/partners/uba.png" alt="UBA" className="h-12 xs:h-14 md:h-16 w-auto mx-auto" />
                            <img src="/partners/gsk.png" alt="GSK" className="h-12 xs:h-14 md:h-16 w-auto mx-auto" />
                        </div>
                    </div>
                </section>

                <section className="bg-[#f2f4f8] py-10 sm:py-16">
                    <div className="mx-auto max-w-[960px] px-2 sm:px-4 text-center">
                        <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-[38px] lg:text-[58px] leading-none font-extrabold text-[#2a62d7] uppercase">TROUVEZ UN EMPLOI</h2>
                        <p className="text-xs sm:text-[14px] text-[#7d8798] mt-2 sm:mt-4">Des milliers d'opportunités d'emploi vous attendent. Etes-vous prêt(e) a décrocher le poste parfait ?</p>
                        <div className="mt-6 sm:mt-8 flex justify-center">
                            <form className="flex w-full max-w-[720px] relative">
                                <Input
                                    className="h-10 sm:h-12 rounded-full border-[#dbe4f4] bg-white pr-32 text-sm w-full"
                                    placeholder="Je recherche un emploi par industrie, poste, mot-cle ou entreprise..."
                                />
                                <Button
                                    type="submit"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 sm:h-10 rounded-full bg-[#2f6de6] hover:bg-[#2458ba] px-4 sm:px-6 text-xs sm:text-sm font-semibold shadow-md"
                                >
                                    Trouver un emploi
                                </Button>
                            </form>
                        </div>
                        <Button variant="outline" className="mt-6 sm:mt-8 h-10 sm:h-11 px-6 sm:px-8 rounded-full border-[#97b8f5] text-[#2f6de6] bg-transparent w-full sm:w-auto">
                            Recevoir plus d'offres <Mail className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </section>

                <section className="bg-white py-10 sm:py-16">
                    <div className="mx-auto max-w-[1180px] px-2 sm:px-4">
                        <h2 className="text-center text-xl xs:text-2xl sm:text-3xl md:text-[38px] lg:text-[44px] leading-none font-extrabold">Comment fonctionne Goriya?</h2>
                        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-7 mt-8 sm:mt-12 text-center">
                            <div>
                                <div className="mx-auto w-8 h-8 rounded-full border border-[#bfd0f5] text-[#2f6de6] text-sm flex items-center justify-center">1</div>
                                <h3 className="mt-4 font-semibold text-[#1c2433]">Creer un compte</h3>
                                <p className="text-sm text-[#8a95a8] mt-2">La porte d'entree est votre profil. Remplissez-le et laissez l'opportunite vous trouver.</p>
                            </div>
                            <div>
                                <div className="mx-auto w-8 h-8 rounded-full border border-[#bfd0f5] text-[#2f6de6] text-sm flex items-center justify-center">2</div>
                                <h3 className="mt-4 font-semibold text-[#1c2433]">Telecharger un CV</h3>
                                <p className="text-sm text-[#8a95a8] mt-2">Goriya met en valeur les competences qui feront ressortir votre candidature.</p>
                            </div>
                            <div>
                                <div className="mx-auto w-8 h-8 rounded-full border border-[#bfd0f5] text-[#2f6de6] text-sm flex items-center justify-center">3</div>
                                <h3 className="mt-4 font-semibold text-[#1c2433]">Faire valider votre CV par l'IA</h3>
                                <p className="text-sm text-[#8a95a8] mt-2">Prochaine etape: l'entretien. Une simulation claire et rapide pour se preparer.</p>
                            </div>
                            <div>
                                <div className="mx-auto w-8 h-8 rounded-full border border-[#bfd0f5] text-[#2f6de6] text-sm flex items-center justify-center">4</div>
                                <h3 className="mt-4 font-semibold text-[#1c2433]">Postuler pour un emploi</h3>
                                <p className="text-sm text-[#8a95a8] mt-2">Cliquez et envoyez votre candidature en quelques secondes.</p>
                            </div>
                        </div>
                        <div className="mt-8 sm:mt-12 space-y-10 sm:space-y-14">
                            {featureBlocks.map((item) => (
                                <div key={item.title} className={`grid grid-cols-1 md:grid-cols-2 items-center gap-6 sm:gap-8 ${item.reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
                                    <div className="px-1 sm:px-2 md:px-6 text-center md:text-left">
                                        <h3 className="text-lg xs:text-xl sm:text-2xl md:text-[32px] lg:text-[40px] leading-[1.05] font-extrabold text-[#2f6de6]">{item.title}</h3>
                                        <p className="mt-3 sm:mt-4 text-[#2d3545] leading-7 text-sm sm:text-base">{item.desc}</p>
                                    </div>
                                    <div className="flex justify-center mt-4 md:mt-0">
                                        <img src={item.image} alt={item.title} className="max-h-[160px] xs:max-h-[200px] sm:max-h-[240px] w-auto object-contain" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-gradient-to-r from-[#2058d6] to-[#1f4fc5] text-white py-10 sm:py-16 relative overflow-hidden">
                    <div className="absolute left-0 bottom-0 w-28 h-28 sm:w-52 sm:h-52 rounded-full border-[10px] sm:border-[20px] border-[#7cb0ff] opacity-40 -translate-x-5 sm:-translate-x-10 translate-y-5 sm:translate-y-10" />
                    <div className="mx-auto max-w-[1180px] px-2 sm:px-4 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center relative z-10">
                        <div>
                            <h3 className="text-xl xs:text-2xl sm:text-3xl md:text-[38px] lg:text-[52px] leading-none font-extrabold">Debloquer tout le potentiel de notre application</h3>
                            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
                                <Button variant="outline" className="rounded-full border-white text-white bg-transparent hover:bg-white hover:text-[#1f4fc5] w-full sm:w-auto">Trouver un emploi</Button>
                                <Button variant="outline" className="rounded-full border-white text-white bg-transparent hover:bg-white hover:text-[#1f4fc5] w-full sm:w-auto">Obtenez plus d'offres</Button>
                            </div>
                        </div>
                        <div className="flex justify-center md:justify-end mt-6 md:mt-0">
                            <img src="/images/9933453_4323022.png" alt="Application" className="h-[130px] xs:h-[170px] sm:h-[200px] md:h-[240px] w-auto object-contain" />
                        </div>
                    </div>
                </section>

                <section className="py-8 sm:py-14 bg-white">
                    <div className="mx-auto max-w-[1180px] px-2 sm:px-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                            <h3 className="text-lg xs:text-xl sm:text-2xl font-bold">Prenez votre carriere en main</h3>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-full border border-[#e2e8f5] flex items-center justify-center text-[#7d8cab]"><ChevronLeft className="w-4 h-4" /></button>
                                <button className="w-8 h-8 rounded-full border border-[#e2e8f5] flex items-center justify-center text-[#7d8cab]"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                            <article className="rounded-xl border border-[#e9eef8] p-3">
                                <img src="/ux-presentation-meeting.jpg" alt="visio" className="h-32 xs:h-36 sm:h-40 w-full object-cover rounded-md" />
                                <h4 className="mt-3 font-semibold">Presentations des revisions UX</h4>
                                <p className="text-sm text-[#8a95a8] mt-2">Comment creer des presentations convaincantes pour impressionner vos collegues et vos managers ?</p>
                            </article>
                            <article className="rounded-xl border border-[#e9eef8] p-3">
                                <img src="/team-migration-software.jpg" alt="migration" className="h-32 xs:h-36 sm:h-40 w-full object-cover rounded-md" />
                                <h4 className="mt-3 font-semibold">Migration vers linear 101</h4>
                                <p className="text-sm text-[#8a95a8] mt-2">Lancer simple: les projets, les sprints, les tickets et le suivi des bugs. Voici comment commencer.</p>
                            </article>
                            <article className="rounded-xl border border-[#e9eef8] p-3">
                                <img src="/api-development-workspace.jpg" alt="api" className="h-32 xs:h-36 sm:h-40 w-full object-cover rounded-md" />
                                <h4 className="mt-3 font-semibold">Construisez votre pile d'API.</h4>
                                <p className="text-sm text-[#8a95a8] mt-2">La proliferation des API RESTful et le container runtime ont une croissance enorme a securiser.</p>
                            </article>
                        </div>
                        <div className="text-center mt-6 sm:mt-8">
                            <Button className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba] h-10 sm:h-11 px-6 sm:px-8">+ Decouvrir plus</Button>
                        </div>
                    </div>
                </section>

                <footer className="bg-[#06080d] text-white pt-10 sm:pt-14 pb-8">
                    <div className="mx-auto max-w-[1180px] px-2 sm:px-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
                            <div>
                                <img src="/images/logo.png" alt="Goriya" className="h-10 sm:h-12 w-auto brightness-0 invert" />
                                <p className="mt-4 text-sm text-[#9098a7]">Goriya est une plateforme web intelligente qui permet aux utilisateurs d'uploader leur CV, lettre de motivation ou tout autre document professionnel afin d'obtenir une analyse intelligente par IA.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">Concept</h4>
                                <ul className="mt-4 space-y-2 text-[#9098a7] text-sm">
                                    <li><Link href="/">Trouve un emploi</Link></li>
                                    <li><Link href="/offres">Tarification</Link></li>
                                    <li><Link href="/auth/settings">Politique de confidentialite</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">Recevoir les notifications d'emploi</h4>
                                <p className="text-sm text-[#9098a7] mt-3">Les dernieres nouvelles sur l'emploi, les articles, envoyes dans votre boite de reception chaque semaine.</p>
                                <div className="mt-4 flex gap-2">
                                    <Input className="h-10 rounded-full border-[#2a2f3a] bg-[#0f121a] text-white" placeholder="Adresse e-mail" />
                                    <Button className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba]">S'abonner</Button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-[#1c202a] flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
                            <p className="text-xs sm:text-sm text-[#6f7887]">2026 © Goriya. Tous droits reserves.</p>
                            <div className="flex items-center gap-2">
                                <Link href="/auth/signin"><Button variant="outline" className="h-8 rounded-full border-[#374153] text-[#d9e5ff] bg-transparent">Connexion</Button></Link>
                                <Button className="h-8 rounded-full bg-[#2f6de6] hover:bg-[#2458ba]">Espace entreprise</Button>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        )
    }

    // Connected state - Dashboard-like homepage
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Welcome Section */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Bonjour, John!</h1>
                    <p className="text-muted-foreground">Voici les dernières opportunités pour vous</p>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                            placeholder="Recherchez un emploi par intitulé, poste, mot clé ou entreprise..."
                            className="pl-12 h-12 text-base"
                        />
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
                            <p className="text-sm text-muted-foreground">Candidatures envoyées</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-green-600 mb-1">3</div>
                            <p className="text-sm text-muted-foreground">Entretiens programmés</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-purple-600 mb-1">8</div>
                            <p className="text-sm text-muted-foreground">Offres sauvegardées</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 text-center">
                            <div className="text-2xl font-bold text-orange-600 mb-1">95%</div>
                            <p className="text-sm text-muted-foreground">Profil complété</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recommended Jobs */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Recommandé pour vous</h2>
                        <Link href="/explorer-emplois" className="text-blue-600 hover:text-blue-700 font-medium">
                            Voir tout
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {popularJobs.slice(0, 4).map((job) => (
                            <Card key={job.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                                                {job.company?.logo ? (
                                                    <img
                                                        src={job.company.logo}
                                                        alt={`${job.company.name} logo`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Building2 className="w-6 h-6 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-foreground truncate">{job.company?.name ?? "—"}</h3>
                                                <p className="text-sm text-muted-foreground truncate">{job.location}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Button variant="ghost" size="sm" onClick={() => toggleSaveJob(job.id)} className="p-2">
                                                <Bookmark
                                                    className={`w-4 h-4 ${savedJobs.includes(job.id) ? "fill-current text-blue-600" : "text-muted-foreground"}`}
                                                />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="p-2">
                                                <Heart className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    </div>

                                    <Link href={`/explorer-emplois/${job.id}`} className="hover:underline">
                                        <h4 className="font-semibold text-lg mb-2 text-foreground line-clamp-2">{job.title}</h4>
                                    </Link>

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                        <Badge variant="secondary">{job.type}</Badge>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {new Date(job.publishDate).toLocaleDateString("fr-FR")}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-blue-600 truncate mr-2">{formatAmount(job.salary)}</span>
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex-shrink-0">
                                            Postuler
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Activité récente</h2>
                    <Card>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                                    <div className="w-2 h-2 mt-2 sm:mt-0 flex-shrink-0 bg-green-500 rounded-full"></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground">Candidature acceptée</p>
                                        <p className="text-sm text-muted-foreground">
                                            Votre candidature pour "Business Developer" chez Pitch a été acceptée
                                        </p>
                                    </div>
                                    <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">Il y a 2h</span>
                                </div>
                                <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                                    <div className="w-2 h-2 mt-2 sm:mt-0 flex-shrink-0 bg-blue-500 rounded-full"></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground">Nouvelle recommandation</p>
                                        <p className="text-sm text-muted-foreground">3 nouvelles offres correspondent à votre profil</p>
                                    </div>
                                    <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">Il y a 1 jour</span>
                                </div>
                                <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                                    <div className="w-2 h-2 mt-2 sm:mt-0 flex-shrink-0 bg-orange-500 rounded-full"></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground">Profil consulté</p>
                                        <p className="text-sm text-muted-foreground">
                                            Votre profil a été consulté par 5 recruteurs cette semaine
                                        </p>
                                    </div>
                                    <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">Il y a 3 jours</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    )
}
