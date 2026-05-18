"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bookmark, Share2, ChevronDown } from "lucide-react"

const jobDetails = {
    id: "1",
    title: "Senior Consultant & Business Developer (H/F)",
    company: "Pitch",
    logo: "/pitch-logo-black.jpg",
    experience: "2-3 ans d'expérience",
    sector: "Informatique - Télécoms",
    contract: "CDI - Télétravail occasionnel",
    salary: "2 500 - 4 500 €",
    posted: "Il y a 3 jours",
    tags: ["Apprentissage"],
    image: "/international-business-team.jpg",
    description: `Rejoignez l'équipe PITCH Instandable Innovation pour un rôle d'impact direct.

Vous soutenir depuis l'Innovation durable 'O.HD jouant d'Ixfahe Pitsa via sa la iles tissages organisant avec ces ressources relatives de reconnaissance avec l'autofinancement de la civilisation.

Si ces enjeux vous intéressent, avez cette opportunité est faite pour vous !

Votre rôle

Nous accueillons un Consultant Senior & Business Developer pour consolidate votre equipe de Konsult Strategique.

Voici après des une solide expérience en conseil et fondant une nouvelle équipe - afin des millions cet conseil ! le petit impact avec rassemblement commercial impact ! Vous recherchez un enjeu de débobination industrielle, de la transition énergétique, de l'immense innovation, ou encore de l'énergie et la motorité.

Vous excellez dans l'urbanisation de nouvelles opportunités, la réponse aux appels d'offres et le développement de relations à long terme — en relish parte du métier qui vous serez détecti.

Nous nous remercions sur le paysage pour vous! en détail. Nous venons s'apercevoir le comparer vos compétences pour approcher l'intérêt professionnel et une telle appétence pour la développement commercial et au partenaires.`,
    
    background: `Vous justifiez d'au moins 7 ans d'expérience en conseil, ou performance dans les domaines de l'énergie, de l'industrie ou de la transition énergétique.
    
Formation en Ingénierie ou en sciences, idéalement complétée par un diplôme ou une expérience en business development ou achat.

Expérience confirmée des enjeux de la transition énergétique et l'adaptation climatique, avec connaissances spécifiques en énergies renouvelables ou efficacité énergétique.

Expérience confirmée dans la gestion de projets commerciaux ou de partenariats stratégiques.`,

    faqs: [
        {
            q: "J'avrai d'un CV d'élégibilité pour postuler à cette offre ?",
            a: "Cette question est très pertinente. Veuillez retrouver la documentation complète sur nos conditions..."
        },
        {
            q: "Le télétravail est-il possible pour ce poste ?",
            a: "Oui, le télétravail est possible..."
        },
        {
            q: "Quel est le type de contrat pour ce poste ?",
            a: "Il s'agit d'un CDI..."
        },
        {
            q: "Une lettre de motivation est-elle obligatoire pour postuler à cette offre ?",
            a: "Non, mais elle est fortement recommandée..."
        },
        {
            q: "Quelle est la date de début du contrat ?",
            a: "La date de début est flexible..."
        },
    ],

    interviewProcess: `Autorisir indien CV est l'éligibilité pour evaluated votre personne et motivations. Indicatif étude 'Open'Assistant' pour évaluer votre compétences en critique et site évaluation.

Autorisir technique (ROI) - Evaluation en français et en anglais de vous compétences et de site évaluation avec assurance du cursus de recrutement dans des modes d'évaluation réalistes.

Interview finale - Présentation moiselure avec l'équipe PITCH - Une occasion pour discuter vos ambitions, les motivations, l'alité une indication de votre soucis humain très projets.`,

    scoreDetails: {
        score: 90,
        items: [
            { label: "Création de valeur client", value: 40 },
            { label: "Expérience antérieure est développement", value: 20 },
            { label: "Cursus de code protéinien", value: 16 },
            { label: "Aptitude à l'innovation et à l'amélioraton", value: 14 }
        ]
    }
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="min-h-screen bg-[#f4f5f7]">
            <header className="bg-white border-b border-[#e8eef6]">
                <div className="mx-auto max-w-[1180px] px-4 h-[56px] sm:h-[64px] md:h-[72px] flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <img src="/images/logo.png" alt="Goriya" className="h-8 w-auto" />
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-[12px] text-[#7a8495] font-medium">
                        <Link href="/" className="text-[#2f6de6]">Accueil</Link>
                        <Link href="/emplois" className="hover:text-[#2f6de6]">Trouve un emploi</Link>
                        <Link href="/offres" className="hover:text-[#2f6de6]">Tarifs d'abonnement</Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        <Link href="/auth/signin">
                            <Button variant="outline" className="h-8 px-4 rounded-full text-[11px] border-[#b9c8ec] text-[#2f6de6] bg-white">
                                Connexion
                            </Button>
                        </Link>
                        <Button className="h-8 px-4 rounded-full text-[11px] bg-[#2157d3] hover:bg-[#1d4cb9]">Espace entreprise</Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1180px] px-4 py-8">
                <section className="bg-white rounded-xl p-6 sm:p-8 border border-[#e8eef6]">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#f0f3fb]">
                                    <img src={jobDetails.logo} alt={jobDetails.company} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-[10px] font-semibold text-[#1b2331]">{jobDetails.company}</span>
                            </div>

                            <h1 className="text-[32px] sm:text-[40px] leading-tight font-extrabold text-[#1b2331] mb-4">
                                {jobDetails.title}
                            </h1>

                            <div className="space-y-2 mb-6 text-[12px]">
                                <div className="flex flex-wrap gap-4 text-[#7f8796]">
                                    <span>📍 {jobDetails.sector} • 3 ans</span>
                                    <span>📋 {jobDetails.contract}</span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-[#7f8796]">
                                    <span>💰 {jobDetails.salary}</span>
                                    <span>📅 {jobDetails.posted}</span>
                                </div>
                                <div className="flex gap-2">
                                    {jobDetails.tags.map((tag) => (
                                        <span key={tag} className="text-[10px] rounded-full bg-[#eff4ff] text-[#5b6f98] px-3 py-1">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 flex-wrap">
                                <Button className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba] h-10 px-6 text-[12px] font-semibold">
                                    Postuler
                                </Button>
                                <Button variant="outline" className="rounded-full border-[#d8deeb] h-10 px-4">
                                    <Bookmark className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" className="rounded-full border-[#d8deeb] h-10 px-4">
                                    <Share2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="lg:w-[280px]">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-[11px] font-bold text-[#7f8796] uppercase mb-3">Infos</h3>
                                    <div className="space-y-3 text-[12px]">
                                        <div className="flex gap-2">
                                            <span className="font-semibold text-[#1b2331]">Entreprise:</span>
                                            <span className="text-[#7f8796]">{jobDetails.company}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-semibold text-[#1b2331]">Secteur:</span>
                                            <span className="text-[#7f8796]">Technologie</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-[#e8eef6] pt-6">
                                    <h3 className="text-[11px] font-bold text-[#7f8796] uppercase mb-3">Type</h3>
                                    <div className="text-[12px] font-semibold text-[#1b2331]">CDI Temps pleins</div>
                                </div>

                                <div className="border-t border-[#e8eef6] pt-6">
                                    <h3 className="text-[11px] font-bold text-[#7f8796] uppercase mb-3">Lieu détaillé</h3>
                                    <div className="text-[12px] text-[#7f8796]">Abidjan, Côte d'ivoire</div>
                                </div>

                                <div className="border-t border-[#e8eef6] pt-6">
                                    <h3 className="text-[11px] font-bold text-[#7f8796] uppercase mb-3">Salaire</h3>
                                    <div className="text-[14px] font-extrabold text-[#2f6de6]">{jobDetails.salary}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-[#e8eef6]">
                        <img src={jobDetails.image} alt={jobDetails.title} className="w-full h-64 rounded-xl object-cover mb-6" />
                        
                        <div className="bg-gradient-to-r from-[#2b7cf0] to-[#1e5ed4] text-white rounded-xl p-6 text-center">
                            <h3 className="text-[18px] font-bold mb-2">Découvrez l'entreprise</h3>
                            <p className="text-[12px] text-[#c8e0ff] mb-4">Apprenez à connaître la culture, les valeurs et l'équipe derrière cette offre</p>
                            <Button className="bg-white text-[#2b7cf0] hover:bg-[#f0f3fb] rounded-full text-[12px] font-semibold">
                                Découvrir
                            </Button>
                            <Button variant="outline" className="ml-2 border-white text-white hover:bg-white/10 rounded-full text-[12px]">
                                Candidatures
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-xl p-6 border border-[#e8eef6]">
                            <h2 className="text-[24px] font-extrabold text-[#1b2331] mb-4">Le poste</h2>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-[13px] leading-6 text-[#7f8796] whitespace-pre-wrap">{jobDetails.description}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-[#e8eef6]">
                            <h2 className="text-[24px] font-extrabold text-[#1b2331] mb-4">Profil recherché</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-[#1b2331] mb-2">Background</h3>
                                    <p className="text-[13px] leading-6 text-[#7f8796]">{jobDetails.background.split('\n')[0]}</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1b2331] mb-2">Formation</h3>
                                    <ul className="text-[13px] leading-6 text-[#7f8796] space-y-1">
                                        {jobDetails.background.split('\n').slice(1).map((line, i) => (
                                            <li key={i}>{line.trim()}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-[#e8eef6]">
                            <h2 className="text-[24px] font-extrabold text-[#1b2331] mb-6">Décroulement des entretiens</h2>
                            <p className="text-[13px] leading-6 text-[#7f8796] whitespace-pre-wrap">{jobDetails.interviewProcess}</p>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-[#e8eef6]">
                            <h2 className="text-[24px] font-extrabold text-[#1b2331] mb-6">Questions et réponses sur l'offre</h2>
                            <div className="space-y-3">
                                {jobDetails.faqs.map((faq, index) => (
                                    <details key={index} className="border border-[#e8eef6] rounded-lg">
                                        <summary className="cursor-pointer px-4 py-3 flex items-center justify-between font-semibold text-[#1b2331] text-[12px]">
                                            <span>{faq.q}</span>
                                            <ChevronDown className="w-4 h-4" />
                                        </summary>
                                        <div className="px-4 py-3 border-t border-[#e8eef6] text-[12px] text-[#7f8796]">
                                            {faq.a}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 border border-[#e8eef6] sticky top-4">
                            <h3 className="text-[18px] font-extrabold text-[#1b2331] mb-2">Votre profil correspond à cette offre</h3>
                            <p className="text-[12px] text-[#7f8796] mb-4">Chat IA compatible avec assistance 24/24 et 24/7. Merci de me relancer si vous n'êtes pas à l'aisé !</p>
                            
                            <div className="bg-[#2f6de6] rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4 relative">
                                <div className="text-center">
                                    <div className="text-[32px] font-extrabold text-white">{jobDetails.scoreDetails.score}%</div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                {jobDetails.scoreDetails.items.map((item, i) => (
                                    <div key={i} className="text-[11px]">
                                        <div className="flex justify-between text-[#7f8796] mb-1">
                                            <span>{item.label}</span>
                                            <span className="font-semibold">{item.value}%</span>
                                        </div>
                                        <div className="h-2 bg-[#e8eef6] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#2f6de6]" style={{ width: `${item.value}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button className="w-full rounded-full bg-[#2f6de6] hover:bg-[#2458ba] h-10 text-[12px] font-semibold">
                                Postuler
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-[#06080d] text-white pt-10 sm:pt-14 pb-8 mt-16">
                <div className="mx-auto max-w-[1180px] px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
                        <div>
                            <img src="/images/logo.png" alt="Goriya" className="h-10 sm:h-12 w-auto brightness-0 invert mb-4" />
                            <p className="text-sm text-[#9098a7]">
                                Goriya est une plateforme web intelligente qui permet aux utilisateurs d'uploader leur CV, lettre de motivation ou tout autre document professionnel afin d'obtenir une analyse intelligente par IA.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Concept</h4>
                            <ul className="space-y-2 text-[#9098a7] text-sm">
                                <li><Link href="/emplois">Trouve un emploi</Link></li>
                                <li><Link href="/offres">Tarification</Link></li>
                                <li><Link href="/auth/settings">Politique de confidentialité</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-3">Recevoir les notifications d'emploi</h4>
                            <p className="text-sm text-[#9098a7] mb-4">Les dernières nouvelles sur l'emploi, les articles, envoyés dans votre boîte de réception chaque semaine.</p>
                            <div className="flex gap-2">
                                <Input className="h-10 rounded-full border-[#2a2f3a] bg-[#0f121a] text-white text-[12px]" placeholder="Adresse e-mail" />
                                <Button className="rounded-full bg-[#2f6de6] hover:bg-[#2458ba] px-4">S'abonner</Button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-[#1c202a] flex flex-col md:flex-row items-center justify-between gap-3">
                        <p className="text-xs sm:text-sm text-[#6f7887]">2026 © Goriya. Tous droits réservés.</p>
                        <div className="flex items-center gap-2">
                            <Link href="/auth/signin"><Button variant="outline" className="h-8 rounded-full border-[#374153] text-[#d9e5ff] bg-transparent text-[12px]">Connexion</Button></Link>
                            <Button className="h-8 rounded-full bg-[#2f6de6] hover:bg-[#2458ba] text-[12px]">Espace entreprise</Button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
