"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { CalendarDays } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { InterviewCalendar } from "@/components/rendez-vous/interview-calendar"
import { CallEmbed } from "@/components/call-embed"
import { callSessionService } from "@/lib/api/call-session.service"
import { myInterviewsService, type IMyInterview } from "@/lib/api/my-interviews.service"

export default function Page() {
    const { user } = useAuth()
    const [interviews, setInterviews] = useState<IMyInterview[]>([])
    const [loading, setLoading] = useState(true)
    const [joiningId, setJoiningId] = useState<string | null>(null)
    const [activeCall, setActiveCall] = useState<{ interview: IMyInterview; token: string; url: string; room: string } | null>(null)

    useEffect(() => {
        myInterviewsService
            .list()
            .then(setInterviews)
            .catch((err) => console.error("[mes-rendez-vous] load error:", err))
            .finally(() => setLoading(false))
    }, [])

    const handleJoin = async (interview: IMyInterview) => {
        if (!interview.callSession) return
        setJoiningId(interview.id)
        try {
            const token = await callSessionService.join(interview.callSession.id)
            setActiveCall({ interview, token: token.token, url: token.url, room: token.room })
        } catch (err) {
            console.error("[mes-rendez-vous] join error:", err)
            toast.error("Impossible de rejoindre ce rendez-vous : il est peut-être terminé.")
        } finally {
            setJoiningId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <PageHeader
                title="Mes rendez-vous"
                description="Vos entretiens planifiés par les entreprises : GORIYA Meet ou en présentiel."
            />

            {interviews.length === 0 ? (
                <Card className="border border-border">
                    <CardContent className="p-12 text-center text-muted-foreground">
                        <CalendarDays className="mx-auto mb-3 h-12 w-12 opacity-30" />
                        <p>Aucun rendez-vous planifié pour l&apos;instant.</p>
                    </CardContent>
                </Card>
            ) : (
                <InterviewCalendar interviews={interviews} onJoin={handleJoin} joiningId={joiningId} />
            )}

            {activeCall && (
                <CallEmbed
                    token={activeCall.token}
                    url={activeCall.url}
                    room={activeCall.room}
                    name={user?.name ?? "Candidat"}
                    title={`${activeCall.interview.companyName ?? "Entretien"}${activeCall.interview.jobOfferTitle ? ` · ${activeCall.interview.jobOfferTitle}` : ""}`}
                    onClose={() => setActiveCall(null)}
                />
            )}
        </div>
    )
}
