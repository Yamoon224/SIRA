"use client"

import { useMemo, useState } from "react"
import { Ban, ChevronLeft, ChevronRight, Loader2, LogIn, MapPin, UserX, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { IMyInterview } from "@/lib/api/my-interviews.service"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

const STATUS_META: Record<IMyInterview["status"], { label: string; className: string } | null> = {
    SCHEDULED: null,
    COMPLETED: { label: "Passé", className: "bg-muted text-muted-foreground" },
    CANCELLED: { label: "Annulé", className: "bg-gray-200 text-gray-600 dark:bg-muted dark:text-muted-foreground" },
    NO_SHOW: { label: "Absence", className: "bg-red-100 text-red-700" },
}

function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1)
}

function sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function dayKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

/** Semaines complètes couvrant le mois, lundi en premier jour. */
function monthGrid(month: Date): Date[] {
    const first = startOfMonth(month)
    const offset = (first.getDay() + 6) % 7
    const start = new Date(first)
    start.setDate(first.getDate() - offset)
    return Array.from({ length: 42 }, (_, i) => {
        const day = new Date(start)
        day.setDate(start.getDate() + i)
        return day
    })
}

function formatTime(value: string): string {
    return new Date(value).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

interface InterviewCalendarProps {
    interviews: IMyInterview[]
    onJoin: (interview: IMyInterview) => void
    joiningId: string | null
}

/**
 * Calendrier mensuel, lecture seule, des rendez-vous du candidat (GORIYA Meet
 * ou présentiel). Cliquer un jour affiche son agenda complet en dessous.
 */
export function InterviewCalendar({ interviews, onJoin, joiningId }: InterviewCalendarProps) {
    const today = useMemo(() => new Date(), [])
    const [month, setMonth] = useState(() => startOfMonth(today))
    const [selected, setSelected] = useState<Date>(today)

    const byDay = useMemo(() => {
        const map = new Map<string, IMyInterview[]>()
        for (const interview of interviews) {
            const key = dayKey(new Date(interview.scheduledAt))
            map.set(key, [...(map.get(key) ?? []), interview])
        }
        for (const list of map.values()) list.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
        return map
    }, [interviews])

    const days = useMemo(() => monthGrid(month), [month])
    const selectedInterviews = byDay.get(dayKey(selected)) ?? []

    const goToToday = () => {
        setMonth(startOfMonth(today))
        setSelected(today)
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-white dark:bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                <h3 className="text-base font-semibold capitalize text-foreground">
                    {month.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </h3>
                <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Mois précédent">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToToday}>Aujourd&apos;hui</Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Mois suivant">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-border text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {WEEKDAYS.map((label) => <div key={label} className="py-2">{label}</div>)}
            </div>

            <div className="grid grid-cols-7">
                {days.map((day) => {
                    const inMonth = day.getMonth() === month.getMonth()
                    const isToday = sameDay(day, today)
                    const isSelected = sameDay(day, selected)
                    const dayInterviews = byDay.get(dayKey(day)) ?? []

                    return (
                        <button
                            key={day.toISOString()}
                            type="button"
                            onClick={() => setSelected(day)}
                            aria-pressed={isSelected}
                            className={cn(
                                "flex min-h-[4.5rem] flex-col items-stretch gap-1 border-b border-r border-border p-1 text-left transition-colors last:border-r-0 sm:min-h-[6.5rem] sm:p-1.5",
                                inMonth ? "bg-white hover:bg-muted/40 dark:bg-card" : "bg-muted/20 hover:bg-muted/30",
                                isSelected && "bg-secondary/60 ring-1 ring-inset ring-primary",
                            )}
                        >
                            <span
                                className={cn(
                                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                                    !inMonth && "text-muted-foreground/60",
                                    isToday && "bg-brand-gradient text-white",
                                )}
                            >
                                {day.getDate()}
                            </span>
                            <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                                {dayInterviews.slice(0, 2).map((interview) => (
                                    <EventChip key={interview.id} interview={interview} />
                                ))}
                                {dayInterviews.length > 2 && (
                                    <span className="truncate text-[10px] font-medium text-muted-foreground">
                                        +{dayInterviews.length - 2} autre{dayInterviews.length - 2 > 1 ? "s" : ""}
                                    </span>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>

            <div className="border-t border-border bg-muted/20 p-4">
                <h4 className="mb-2 text-sm font-semibold capitalize text-foreground">
                    {selected.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                </h4>
                {selectedInterviews.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border bg-white px-4 py-6 text-center text-sm text-muted-foreground dark:bg-card">
                        Aucun rendez-vous ce jour-là.
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {selectedInterviews.map((interview) => (
                            <EventCard key={interview.id} interview={interview} onJoin={onJoin} joining={joiningId === interview.id} />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

function EventChip({ interview }: { interview: IMyInterview }) {
    const video = interview.type === "VIDEO"
    const Icon = video ? Video : MapPin

    return (
        <span
            className={cn(
                "flex items-center gap-1 truncate rounded-md px-1 py-0.5 text-[10px] font-medium sm:px-1.5 sm:text-[11px]",
                video ? "bg-brand-gradient text-white" : "border border-emerald-200 bg-emerald-50 text-emerald-700",
            )}
        >
            <Icon className="h-3 w-3 shrink-0" />
            <span className="hidden truncate sm:inline">{formatTime(interview.scheduledAt)} {interview.companyName ?? ""}</span>
        </span>
    )
}

function EventCard({ interview, onJoin, joining }: { interview: IMyInterview; onJoin: (interview: IMyInterview) => void; joining: boolean }) {
    const video = interview.type === "VIDEO"
    const Icon = video ? Video : MapPin
    const status = STATUS_META[interview.status]
    const canJoin = interview.status === "SCHEDULED" && video && interview.callSession && interview.callSession.status !== "ENDED"

    return (
        <li className="flex flex-col gap-2 rounded-xl border border-border bg-white p-3.5 dark:bg-card sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <span
                        className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                            video ? "bg-brand-gradient text-white" : "border border-emerald-200 bg-emerald-50 text-emerald-700",
                        )}
                    >
                        <Icon className="h-3 w-3" />
                        {interview.typeLabel}
                    </span>
                    {status && (
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", status.className)}>
                            {interview.status === "NO_SHOW" ? <UserX className="h-3 w-3" /> : interview.status === "CANCELLED" ? <Ban className="h-3 w-3" /> : null}
                            {status.label}
                        </span>
                    )}
                </div>
                <p className="mt-1.5 truncate text-sm font-semibold text-foreground">
                    {interview.companyName ?? "Entreprise"}{interview.jobOfferTitle ? ` · ${interview.jobOfferTitle}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                    {formatTime(interview.scheduledAt)} – {formatTime(interview.endsAt)}
                </p>
                {interview.location && <p className="mt-1 text-xs text-foreground">{interview.location}</p>}
            </div>

            {canJoin && (
                <Button
                    size="sm"
                    disabled={joining}
                    onClick={() => onJoin(interview)}
                    className="shrink-0 gap-1.5 self-start bg-brand-gradient hover:bg-brand-gradient-hover sm:self-center"
                >
                    {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                    Rejoindre
                </Button>
            )}
        </li>
    )
}
