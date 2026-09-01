import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata = {
    title: "Mentions légales - Goriya",
    description: "Mentions légales de l'application Goriya : autorisations, propriété intellectuelle, protection des données, contact et droit applicable.",
}

const sections = [
    {
        title: "1. Objet",
        body: [
            "Les présentes mentions légales ont pour objet d'informer les utilisateurs de l'application GORIYA sur les modalités d'hébergement de l'application ainsi que les informations requises conformément à la réglementation ivoirienne applicable, notamment la loi n°2013-546 du 30 juillet 2013 relative aux transactions électroniques et dans le respect de la loi n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel.",
        ],
    },
    {
        title: "2. Autorisation ou agrément",
        body: [
            "L'éditeur de l'application s'engage à exercer ses activités dans le respect de la législation et de la réglementation en vigueur en République de Côte d'Ivoire. À ce titre, il veille notamment au respect des dispositions relatives aux transactions électroniques, à la protection des données à caractère personnel, à la cybersécurité ainsi qu'à toute autre réglementation applicable à la nature des services proposés.",
            "Lorsque l'exercice de l'activité est subordonné à l'obtention d'une autorisation, d'un agrément, d'une licence ou de toute autre habilitation administrative, l'éditeur s'engage à se conformer aux exigences légales et réglementaires en vigueur et à détenir les autorisations requises avant la mise en exploitation des services concernés.",
        ],
    },
    {
        title: "3. Propriété intellectuelle",
        body: [
            "L'ensemble des éléments composant le site, notamment les textes, images, photographies, illustrations, vidéos, logos, marques, bases de données, logiciels et tout autre contenu, est protégé par les dispositions applicables en matière de propriété intellectuelle.",
            "Toute reproduction, représentation, modification, adaptation, diffusion ou exploitation, totale ou partielle, sans autorisation écrite préalable de l'éditeur est interdite et peut donner lieu à des poursuites.",
        ],
    },
    {
        title: "4. Protection des données à caractère personnel",
        body: [
            "Les traitements de données à caractère personnel réalisés dans le cadre du présent site sont effectués conformément à la législation ivoirienne applicable, notamment la loi n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel.",
            "Les modalités de collecte, d'utilisation, de conservation et de protection des données sont détaillées dans la Politique de confidentialité accessible sur le site.",
            "Toute personne concernée dispose des droits prévus par la réglementation applicable, notamment les droits d'accès, de rectification, d'opposition et, lorsque les conditions sont réunies, de suppression de ses données.",
            "Toute demande peut être adressée à l'adresse précisée au point 5.",
        ],
    },
    {
        title: "5. Contact(s)",
        body: ["Pour toute question concernant le site ou les présentes mentions légales, vous pouvez contacter :"],
        list: ["Adresse électronique du service : support@goriya.net"],
    },
    {
        title: "6. Droit applicable",
        body: [
            "Les présentes mentions légales sont régies par le droit ivoirien.",
            "Tout litige relatif à leur interprétation ou à leur exécution relève de la compétence des juridictions ivoiriennes compétentes, sous réserve des dispositions légales impératives.",
        ],
    },
]

export default function MentionsLegalesPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="mx-auto max-w-[860px] px-4 py-10 sm:py-16">
                <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-[#111827]">Mentions légales</h1>
                <p className="mt-2 text-sm text-[#7a8495]">Application GORIYA</p>
                <p className="mt-3 text-sm text-[#7a8495]">Dernière mise à jour : 27 juillet 2026</p>

                <Accordion
                    type="single"
                    collapsible
                    defaultValue="section-0"
                    className="mt-8 sm:mt-10 w-full border-t border-[#e6e9f0]"
                >
                    {sections.map((section, idx) => (
                        <AccordionItem key={section.title} value={`section-${idx}`} className="border-[#e6e9f0]">
                            <AccordionTrigger className="text-lg sm:text-xl font-bold text-[#111827] hover:no-underline">
                                {section.title}
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-3">
                                    {section.body.map((paragraph, i) => (
                                        <p key={i} className="text-sm sm:text-[15px] leading-7 text-[#3d4658]">
                                            {paragraph}
                                        </p>
                                    ))}
                                    {"list" in section && section.list && (
                                        <ul className="list-disc space-y-1.5 pl-5">
                                            {section.list.map((item, i) => (
                                                <li key={i} className="text-sm sm:text-[15px] leading-7 text-[#3d4658]">
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </main>

            <Footer />
        </div>
    )
}
