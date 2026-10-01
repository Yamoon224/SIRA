"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import {
    ArrowLeft,
    Award,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CloudDownload,
    CloudOff,
    ExternalLink,
    Loader2,
    Lock,
    PlayCircle,
    Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useT } from "@/contexts/i18n-context"
import {
    courseService,
    enrollmentService,
    formatMinutes,
    type ICourseAccess,
    type ICourseDetail,
    type ICourseLesson,
    type IEnrollment,
} from "@/lib/api/course.service"
import { downloadLesson, getOfflineLesson, removeOfflineLesson, type OfflineLesson } from "@/lib/offline-lessons"
import { LessonPlayer } from "../../_components/lesson-player"
import { PassBanner } from "../../_components/pass-banner"

export default function LearnPage() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }
        >
            <Learn />
        </Suspense>
    )
}

function Learn() {
    const t = useT()
    const router = useRouter()
    const { slug } = useParams<{ slug: string }>()
    const searchParams = useSearchParams()
    const requestedLessonId = searchParams.get("lecon")

    const [course, setCourse] = useState<ICourseDetail | null>(null)
    const [access, setAccess] = useState<ICourseAccess | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadFailed, setLoadFailed] = useState(false)
    const [offlineCopy, setOfflineCopy] = useState<OfflineLesson | null>(null)
    const [downloadPercent, setDownloadPercent] = useState<number | null>(null)
    const [savingComplete, setSavingComplete] = useState(false)

    const load = useCallback(async () => {
        try {
            setCourse(await courseService.get(slug))
            setLoadFailed(false)
        } catch {
            setLoadFailed(true)
        } finally {
            setLoading(false)
        }
    }, [slug])

    useEffect(() => {
        load()
        courseService.access().then(setAccess).catch(() => {})
    }, [load])

    const lesson: ICourseLesson | undefined = useMemo(() => {
        if (!course) return undefined
        return (
            course.lessons.find((l) => l.id === requestedLessonId) ??
            course.lessons.find((l) => !l.locked && !l.progress?.completed) ??
            course.lessons[0]
        )
    }, [course, requestedLessonId])

    const lessonId = lesson?.id ?? requestedLessonId

    useEffect(() => {
        setOfflineCopy(null)
        if (lessonId) getOfflineLesson(lessonId).then(setOfflineCopy)
    }, [lessonId])

    const index = course && lesson ? course.lessons.findIndex((l) => l.id === lesson.id) : -1
    const previous = index > 0 ? course!.lessons[index - 1] : undefined
    const next = course && index >= 0 && index < course.lessons.length - 1 ? course.lessons[index + 1] : undefined

    const goTo = (target: ICourseLesson) => router.replace(`/formations/${slug}/apprendre?lecon=${target.id}`, { scroll: false })

    const applyProgress = (lessonIdDone: string, completed: boolean, position: number, enrollment: IEnrollment) => {
        setCourse((prev) => {
            if (!prev) return prev
            const wasCompleted = prev.viewer.enrollment?.status === "COMPLETED"
            if (!wasCompleted && enrollment.status === "COMPLETED") toast.success(t("training.player.courseCompleted"))
            return {
                ...prev,
                lessons: prev.lessons.map((l) =>
                    l.id === lessonIdDone ? { ...l, progress: { lastPositionSeconds: position, completed: completed || !!l.progress?.completed } } : l,
                ),
                viewer: { ...prev.viewer, enrollment },
            }
        })
    }

    const savePosition = (seconds: number) => {
        if (!lesson || lesson.locked || !navigator.onLine) return
        courseService
            .recordProgress(lesson.id, { positionSeconds: seconds })
            .then((res) => applyProgress(res.lessonId, res.completed, res.lastPositionSeconds, res.enrollment))
            .catch(() => {})
    }

    const markComplete = async (auto = false) => {
        if (!lesson || lesson.locked || lesson.progress?.completed) return
        if (!navigator.onLine) return
        setSavingComplete(!auto)
        try {
            const res = await courseService.recordProgress(lesson.id, { completed: true })
            applyProgress(res.lessonId, true, res.lastPositionSeconds, res.enrollment)
            if (!auto) toast.success(t("training.player.completed"))
        } catch (err: any) {
            if (!auto) toast.error(err?.message || t("common.error"))
        } finally {
            setSavingComplete(false)
        }
    }

    const handleDownload = async () => {
        if (!course || !lesson?.videoUrl) return
        setDownloadPercent(0)
        try {
            const saved = await downloadLesson(
                {
                    lessonId: lesson.id,
                    courseId: course.id,
                    courseSlug: course.slug,
                    courseTitle: course.title,
                    lessonTitle: lesson.title,
                    durationSeconds: lesson.durationSeconds,
                },
                lesson.videoUrl,
                lesson.subtitles,
                setDownloadPercent,
            )
            setOfflineCopy(saved)
            router.prefetch("/formations/hors-ligne")
            toast.success(t("training.offline.downloaded"))
        } catch (err) {
            console.error("[formations] download error:", err)
            toast.error(t("training.offline.failed"))
        } finally {
            setDownloadPercent(null)
        }
    }

    const handleRemoveDownload = async () => {
        if (!lessonId) return
        await removeOfflineLesson(lessonId)
        setOfflineCopy(null)
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Hors connexion : on rejoue la copie locale si la leçon a été téléchargée.
    if (loadFailed || !course || !lesson) {
        if (offlineCopy) {
            return (
                <div className="space-y-4">
                    <Link href="/formations/hors-ligne" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        {t("training.offline.title")}
                    </Link>
                    <LessonPlayer
                        lessonId={offlineCopy.lessonId}
                        videoUrl={null}
                        provider="FILE"
                        subtitles={[]}
                        startAt={0}
                        offline={offlineCopy}
                        noVideoLabel={t("training.player.noVideo")}
                        onPosition={() => {}}
                        onCompleted={() => {}}
                    />
                    <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                        <CloudOff className="h-4 w-4" />
                        {t("training.player.playingOffline")}
                    </p>
                    <h1 className="text-[20px] font-semibold text-foreground">{offlineCopy.lessonTitle}</h1>
                    <p className="text-[13px] text-muted-foreground">{offlineCopy.courseTitle}</p>
                </div>
            )
        }
        return (
            <div className="py-20 text-center">
                <p className="mb-4 text-muted-foreground">{t("training.course.notFound")}</p>
                <Link href="/formations"><Button variant="outline">{t("common.back")}</Button></Link>
            </div>
        )
    }

    const enrollment = course.viewer.enrollment
    const canDownload = !lesson.locked && lesson.videoProvider === "FILE" && !!lesson.videoUrl

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <Link href={`/formations/${slug}`} className="inline-flex min-w-0 items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    <span className="truncate">{course.title}</span>
                </Link>
                {enrollment && (
                    <div className="hidden w-48 shrink-0 sm:block">
                        <Progress value={enrollment.progress} className="h-1.5" />
                        <p className="mt-0.5 text-right text-[11px] text-muted-foreground">{t("training.course.progress", { progress: enrollment.progress })}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
                <div className="min-w-0 space-y-4">
                    {lesson.locked ? (
                        <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl bg-[#0b1324] px-6 text-center text-white">
                            <Lock className="h-10 w-10 text-white/70" />
                            <p className="text-[17px] font-semibold">{t("training.player.lockedTitle")}</p>
                            <p className="max-w-md text-[13px] text-white/75">{t("training.player.lockedText")}</p>
                            <Link href="/auth/plan">
                                <Button className="rounded-full bg-white text-[#0b2ca8] hover:bg-white/90">{t("training.player.seePlans")}</Button>
                            </Link>
                        </div>
                    ) : (
                        <LessonPlayer
                            lessonId={lesson.id}
                            videoUrl={lesson.videoUrl}
                            provider={lesson.videoProvider}
                            subtitles={lesson.subtitles}
                            startAt={lesson.progress?.completed ? 0 : (lesson.progress?.lastPositionSeconds ?? 0)}
                            offline={offlineCopy}
                            noVideoLabel={t("training.player.noVideo")}
                            onPosition={savePosition}
                            onCompleted={() => markComplete(true)}
                        />
                    )}

                    {lesson.locked && <PassBanner access={access} onChange={(a) => { setAccess(a); load() }} compact />}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            {lesson.section && <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{lesson.section}</p>}
                            <h1 className="text-[20px] font-semibold leading-snug text-foreground">{lesson.title}</h1>
                            {offlineCopy && (
                                <p className="mt-1 flex items-center gap-1.5 text-[12px] text-emerald-600 dark:text-emerald-400">
                                    <CloudOff className="h-3.5 w-3.5" />
                                    {t("training.offline.downloaded")}
                                </p>
                            )}
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                            {!lesson.locked && (
                                lesson.progress?.completed ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                        <CheckCircle2 className="h-4 w-4" />
                                        {t("training.player.completed")}
                                    </span>
                                ) : (
                                    <Button variant="outline" className="rounded-full" onClick={() => markComplete(false)} disabled={savingComplete}>
                                        {savingComplete ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                        {t("training.player.markComplete")}
                                    </Button>
                                )
                            )}
                            {canDownload && (
                                offlineCopy ? (
                                    <Button variant="outline" className="rounded-full" onClick={handleRemoveDownload}>
                                        <Trash2 className="h-4 w-4" />
                                        {t("training.offline.remove")}
                                    </Button>
                                ) : (
                                    <Button variant="outline" className="rounded-full" onClick={handleDownload} disabled={downloadPercent !== null}>
                                        {downloadPercent !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudDownload className="h-4 w-4" />}
                                        {downloadPercent !== null ? t("training.offline.downloading", { percent: downloadPercent }) : t("training.offline.download")}
                                    </Button>
                                )
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between gap-2">
                        <Button variant="ghost" className="rounded-full" disabled={!previous} onClick={() => previous && goTo(previous)}>
                            <ChevronLeft className="h-4 w-4" />
                            {t("training.player.previous")}
                        </Button>
                        <Button className="rounded-full bg-brand-gradient text-white hover:opacity-95" disabled={!next} onClick={() => next && goTo(next)}>
                            {t("training.player.next")}
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {enrollment?.hasCertificate && (
                        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-emerald-900 dark:bg-emerald-950/30">
                            <p className="flex items-center gap-2 text-[14px] font-medium text-emerald-800 dark:text-emerald-300">
                                <Award className="h-5 w-5" />
                                {t("training.player.courseCompleted")}
                            </p>
                            <Button
                                variant="outline"
                                className="rounded-full"
                                onClick={() => enrollmentService.downloadCertificate(enrollment.id, `certificat-${course.slug ?? course.id}.docx`).catch(() => toast.error(t("common.error")))}
                            >
                                {t("training.course.certificate")}
                            </Button>
                        </div>
                    )}

                    {!lesson.locked && lesson.description && (
                        <section className="rounded-2xl border border-border bg-card p-4">
                            <h2 className="mb-2 text-[15px] font-semibold text-foreground">{t("training.player.notes")}</h2>
                            <p className="whitespace-pre-line text-[13px] leading-relaxed text-muted-foreground">{lesson.description}</p>
                        </section>
                    )}

                    {lesson.resources.length > 0 && (
                        <section className="rounded-2xl border border-border bg-card p-4">
                            <h2 className="mb-2 text-[15px] font-semibold text-foreground">{t("training.player.resources")}</h2>
                            <ul className="space-y-1.5">
                                {lesson.resources.map((r, i) => (
                                    <li key={i}>
                                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[13px] text-primary hover:underline">
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            {r.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <aside className="lg:sticky lg:top-0 lg:max-h-[calc(100dvh-8rem)] lg:self-start lg:overflow-y-auto">
                    <div className="overflow-hidden rounded-2xl border border-border bg-card">
                        <p className="border-b border-border px-4 py-3 text-[14px] font-semibold text-foreground">
                            {t("training.course.program")} · {t("training.lessonsCount", { count: course.lessons.length })}
                        </p>
                        <ul>
                            {course.lessons.map((l, i) => {
                                const active = l.id === lesson.id
                                const showSection = l.section && l.section !== course.lessons[i - 1]?.section
                                return (
                                    <li key={l.id}>
                                        {showSection && <p className="bg-secondary/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{l.section}</p>}
                                        <button
                                            type="button"
                                            onClick={() => goTo(l)}
                                            className={cn("flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-secondary", active && "bg-primary/10")}
                                        >
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                                                {l.progress?.completed ? (
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                ) : l.locked ? (
                                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <PlayCircle className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                                                )}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className={cn("block truncate text-[13px]", active ? "font-semibold text-foreground" : "text-foreground")}>{l.title}</span>
                                                <span className="text-[11px] text-muted-foreground">{formatMinutes(Math.ceil(l.durationSeconds / 60))}</span>
                                            </span>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    )
}
