"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const AVATAR_COLORS = [
    "#2f6de6", "#1e5ed4", "#7c3aed", "#0891b2",
    "#059669", "#d97706", "#dc2626", "#db2777",
]

function colorForName(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function initialsForName(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean)
    if (words.length === 0) return "?"
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
    return (words[0][0] + words[1][0]).toUpperCase()
}

export function CompanyLogo({ name, logo, className = "w-6 h-6 text-[10px]" }: { name: string; logo?: string | null; className?: string }) {
    const [failed, setFailed] = useState(false)

    if (logo && !failed) {
        return (
            <div className={cn("rounded-full overflow-hidden bg-[#f0f3fb] flex items-center justify-center shrink-0", className)}>
                <img src={logo} alt={name} className="w-full h-full object-cover" onError={() => setFailed(true)} />
            </div>
        )
    }

    return (
        <div
            className={cn("rounded-full flex items-center justify-center shrink-0 font-bold text-white", className)}
            style={{ backgroundColor: colorForName(name || "?") }}
        >
            {initialsForName(name || "?")}
        </div>
    )
}
