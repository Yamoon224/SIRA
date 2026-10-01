"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CloudOff, PlayCircle, Trash2, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { useT } from "@/contexts/i18n-context"
import { formatMinutes } from "@/lib/api/course.service"
import { formatBytes, listOfflineLessons, removeOfflineLesson, type OfflineLesson } from "@/lib/offline-lessons"
import { LessonPlayer } from "../_components/lesson-player"

/**
 * Bibliothèque hors-ligne : tout est lu depuis IndexedDB, sans appel API,
 * pour rester utilisable sans connexion (zones rurales, data limitée).
 */
export default function OfflineLessonsPage() {
    const t = useT()
    const [lessons, setLessons] = useState<OfflineLesson[]>([])
    const [loading, setLoading] = useState(true)
    const [playing, setPlaying] = useState<OfflineLesson | null>(null)
    const [online, setOnline] = useState(true)

    useEffect(() => {
        listOfflineLessons().then((list) => {
            setLessons(list)
            setLoading(false)
        })
        const update = () => setOnline(navigator.onLine)
        update()
        window.addEventListener("online", update)
        window.addEventListener("offline", update)
        return () => {
            window.removeEventListener("online", update)
            window.removeEventListener("offline", update)
        }
    }, [])

    const remove = async (lesson: OfflineLesson) => {
        await removeOfflineLesson(lesson.lessonId)
        setLessons((prev) => prev.filter((l) => l.lessonId !== lesson.lessonId))
        if (playing?.lessonId === lesson.lessonId) setPlaying(null)
    }

    const totalSize = lessons.reduce((sum, l) => sum + l.size, 0)

    return (
        <div className="space-y-4">
            <PageHeader
                title={t("training.offline.title")}
                description={t("training.offline.description")}
                actions={lessons.length > 0 ? <span className="text-[12px] text-muted-foreground">{t("training.offline.storage", { size: formatBytes(totalSize) })}</span> : null}
            />

            {!online && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                    <WifiOff className="h-4 w-4 shrink-0" />
                    {t("training.offline.offlineBanner")}
                </div>
            )}

            {playing && (
                <div className="space-y-2">
                    <LessonPlayer
                        lessonId={playing.lessonId}
                        videoUrl={null}
                        provider="FILE"
                        subtitles={[]}
                        startAt={0}
                        offline={playing}
                        noVideoLabel={t("training.player.noVideo")}
                        onPosition={() => {}}
                        onCompleted={() => {}}
                    />
                    <p className="text-[15px] font-semibold text-foreground">{playing.lessonTitle}</p>
                    <p className="text-[12px] text-muted-foreground">{playing.courseTitle}</p>
                </div>
            )}

            {loading ? null : lessons.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border py-12 text-center">
                    <CloudOff className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="mx-auto max-w-sm text-[13px] text-muted-foreground">{t("training.offline.empty")}</p>
                    {online && (
                        <Link href="/formations" className="mt-4 inline-block">
                            <Button variant="outline" className="rounded-full">{t("training.myCourses.explore")}</Button>
                        </Link>
                    )}
                </div>
            ) : (
                <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                    {lessons.map((lesson) => (
                        <li key={lesson.lessonId} className="flex items-center gap-3 px-4 py-3">
                            <button type="button" onClick={() => setPlaying(lesson)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                                <PlayCircle className={`h-8 w-8 shrink-0 ${playing?.lessonId === lesson.lessonId ? "text-primary" : "text-muted-foreground"}`} />
                                <span className="min-w-0">
                                    <span className="block truncate text-[13px] font-medium text-foreground">{lesson.lessonTitle}</span>
                                    <span className="block truncate text-[11px] text-muted-foreground">
                                        {lesson.courseTitle} · {formatMinutes(Math.ceil(lesson.durationSeconds / 60))} · {formatBytes(lesson.size)}
                                    </span>
                                </span>
                            </button>
                            <Button variant="ghost" size="icon" className="shrink-0 text-red-500" onClick={() => remove(lesson)} aria-label={t("training.offline.remove")}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
