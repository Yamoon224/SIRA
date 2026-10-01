import { Facebook, Github, Globe, Instagram, Linkedin, MessageCircle, Music2, Send, Twitter, Youtube, type LucideIcon } from "lucide-react"

type SocialNetwork = { label: string; hosts: string[]; icon: LucideIcon; className: string }

const NETWORKS: SocialNetwork[] = [
    { label: "LinkedIn", hosts: ["linkedin.com", "lnkd.in"], icon: Linkedin, className: "bg-[#0a66c2] hover:bg-[#085bb5]" },
    { label: "Facebook", hosts: ["facebook.com", "fb.com", "fb.me"], icon: Facebook, className: "bg-[#1877f2] hover:bg-[#1466d6]" },
    { label: "Instagram", hosts: ["instagram.com", "instagr.am"], icon: Instagram, className: "bg-[#e1306c] hover:bg-[#c92a60]" },
    { label: "X (Twitter)", hosts: ["twitter.com", "x.com", "t.co"], icon: Twitter, className: "bg-[#0f1419] hover:bg-[#272c30]" },
    { label: "YouTube", hosts: ["youtube.com", "youtu.be"], icon: Youtube, className: "bg-[#ff0000] hover:bg-[#d90000]" },
    { label: "TikTok", hosts: ["tiktok.com"], icon: Music2, className: "bg-[#010101] hover:bg-[#262626]" },
    { label: "WhatsApp", hosts: ["whatsapp.com", "wa.me"], icon: MessageCircle, className: "bg-[#25d366] hover:bg-[#1fb857]" },
    { label: "Telegram", hosts: ["telegram.org", "telegram.me", "t.me"], icon: Send, className: "bg-[#229ed9] hover:bg-[#1c8bc0]" },
    { label: "GitHub", hosts: ["github.com"], icon: Github, className: "bg-[#24292f] hover:bg-[#3a4047]" },
]

const FALLBACK: SocialNetwork = { label: "Site web", hosts: [], icon: Globe, className: "bg-[#64748b] hover:bg-[#526073]" }

// Les liens sont saisis librement côté entreprise : le schéma peut manquer.
function withProtocol(link: string) {
    const trimmed = link.trim()
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function detectNetwork(href: string): SocialNetwork {
    let host: string
    try {
        host = new URL(href).hostname.toLowerCase()
    } catch {
        return FALLBACK
    }
    return NETWORKS.find((n) => n.hosts.some((h) => host === h || host.endsWith(`.${h}`))) ?? FALLBACK
}

export function SocialLinkIcon({ link }: { link: string }) {
    const href = withProtocol(link)
    const network = detectNetwork(href)
    const Icon = network.icon
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={network.label}
            aria-label={network.label}
            className={`inline-flex items-center justify-center w-9 h-9 text-white rounded-lg transition-colors ${network.className}`}
        >
            <Icon className="w-4 h-4" />
        </a>
    )
}
