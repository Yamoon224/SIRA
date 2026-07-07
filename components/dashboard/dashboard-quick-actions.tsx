import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, FileText, FolderPlus } from "lucide-react"

const actions = [
    {
        href: "/simulation-entretien-config",
        icon: Bot,
        label: "Simulation d'entretien",
        description: "Prépare-toi avec l'IA",
        color: "bg-primary/10",
        iconColor: "text-primary",
    },
    {
        href: "/creer-cv",
        icon: FileText,
        label: "Créer un CV",
        description: "CV intelligent avec IA",
        color: "bg-green-500/10",
        iconColor: "text-green-600 dark:text-green-400",
    },
    {
        href: "/creer-portfolio",
        icon: FolderPlus,
        label: "Portfolio",
        description: "Crée ton portfolio",
        color: "bg-purple-500/10",
        iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
        href: "/nouveau-document",
        icon: FileText,
        label: "Documents",
        description: "Lettres et documents",
        color: "bg-orange-500/10",
        iconColor: "text-orange-600 dark:text-orange-400",
    },
]

export function DashboardQuickActions() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action) => {
                const Icon = action.icon
                return (
                    <Link key={action.href} href={action.href}>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-4 text-center">
                                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                                    <Icon className={`w-6 h-6 ${action.iconColor}`} />
                                </div>
                                <h3 className="font-medium text-sm text-foreground">{action.label}</h3>
                                <p className="text-xs text-muted-foreground">{action.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                )
            })}
        </div>
    )
}
