"use client"

import type React from "react"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { newsletterService } from "@/lib/api/newsletter.service"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function NewsletterForm() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!EMAIL_RE.test(email.trim())) {
            toast.error("Saisis une adresse e-mail valide.")
            return
        }

        setLoading(true)
        try {
            const res = await newsletterService.subscribe(email.trim())
            toast.success(res?.message || "Inscription confirmée !")
            setEmail("")
        } catch (err: any) {
            toast.error(err?.message || "Impossible de t'inscrire pour le moment. Réessaie.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col items-center gap-2">
            <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-full border-[#2a2f3a] bg-[#0f121a] text-white"
                placeholder="Adresse e-mail"
            />
            <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-brand-gradient hover:bg-brand-gradient-hover"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "S'abonner"}
            </Button>
        </form>
    )
}
