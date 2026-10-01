"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    Award,
    Bookmark,
    BookmarkCheck,
    Captions,
    CheckCircle2,
    Clock,
    Layers,
    Linkedin,
    Loader2,
    Lock,
    PlayCircle,
    UserRound,
    Volume2,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useT, type TranslationKey } from "@/contexts/i18n-context"
import {
    courseService,
    enrollmentService,
    formatMinutes,
    type ICourseAccess,
    type ICourseDetail,
    type ICourseLesson,
} from "@/lib/api/course.service"
import { PassBanner } from "../_components/pass-banner"

/** Première leçon à ouvrir : la première non terminée et regardable. */
function nextLessonFor(course: ICourseDetail): ICourseLesson | undefined {
    return course.lessons.find((l) => !l.locked && !l.progress?.completed) ?? course.lessons.find((l) => !l.locked)
}

export default function CourseDetailPage() {
    const t = useT()
    const router = useRouter()
    const { slug } = useParams<{ slug: string }>()
    const [course, setCourse] = useState<ICourseDetail | null>(null)
    const [access, setAccess] = useState<ICourseAccess | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [starting, setStarting] = useState(false)
    const [bookmarking, setBookmarking] = useState(false)

    const load = async () => {
        try {
            const res = await courseService.get(slug)
            setCourse(res)
        } catch {
            setNotFound(true)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
        courseService.access().then(setAccess).catch(() => {})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug])

    const sections = useMemo(() => {
        if (!course) return []
        const groups: { title: string | null; lessons: ICourseLesson[] }[] = []
        for (const lesson of course.lessons) {
            const last = groups[groups.length - 1]
            if (last && last.title === lesson.section) last.lessons.push(lesson)
            else groups.push({ title: lesson.section, lessons: [lesson] })
        }
        return groups
    }, [course])

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (notFound || !course) {
        return (
            <div className="py-20 text-center">
                <p className="mb-4 text-muted-foreground">{t("training.course.notFound")}</p>
                <Link href="/formations"><Button variant="outline">{t("common.back")}</Button></Link>
            </div>
        )
    }

    const enrollment = course.viewer.enrollment
    const nextLesson = nextLessonFor(course)
    const lessonUrl = (lessonId: string) => `/formations/${slug}/apprendre?lecon=${lessonId}`
    const languageLabel = (code: string) => {
        const key = `training.languages.${code}` as TranslationKey
        const label = t(key)
        return label === key ? code.toUpperCase() : label
    }

    const start = async () => {
        if (!nextLesson) {
            toast.error(t("training.course.lockedHint"))
            return
        }
        setStarting(true)
        try {
            if (!enrollment) await enrollmentService.enroll(course.id)
            router.push(lessonUrl(nextLesson.id))
        } catch (err: any) {
            toast.error(err?.message || t("common.error"))
            setStarting(false)
        }
    }

    const toggleBookmark = async () => {
        setBookmarking(true)
        try {
            if (course.viewer.isBookmarked) await courseService.removeBookmark(course.id)
            else await courseService.addBookmark(course.id)
            setCourse({ ...course, viewer: { ...course.viewer, isBookmarked: !course.viewer.isBookmarked } })
        } catch (err: any) {
            toast.error(err?.message || t("common.error"))
        } finally {
            setBookmarking(false)
        }
    }

    const onAccessChange = (next: ICourseAccess) => {
        setAccess(next)
        load()
    }

    return (
        <div className="space-y-6">
            <Link href="/formations" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                {t("training.tabs.discover")}
            </Link>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
                <div className="space-y-6">
                    <div className="relative aspect-video overflow-hidden rounded-2xl bg-brand-gradient">
                        {course.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <PlayCircle className="h-16 w-16 text-white/80" />
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="mb-2 flex flex-wrap gap-1.5">
                            {(course.categoryRef?.name ?? course.category) && <Badge variant="outline">{course.categoryRef?.name ?? course.category}</Badge>}
                            {course.isFree && <Badge className="border-0 bg-emerald-500 text-white">{t("training.free")}</Badge>}
                        </div>
                        <h1 className="text-[24px] font-bold leading-tight text-foreground sm:text-[30px]">{course.title}</h1>
                        {course.subtitle && <p className="mt-1.5 text-[15px] text-muted-foreground">{course.subtitle}</p>}
                        {course.instructor && (
                            <p className="mt-3 flex items-center gap-2 text-[13px] text-muted-foreground">
                                <UserRound className="h-4 w-4" />
                                {t("training.by", { name: course.instructor.name })}
                                {course.instructor.headline && <span>— {course.instructor.headline}</span>}
                            </p>
                        )}
                    </div>

                    {course.description && (
                        <section>
                            <h2 className="mb-2 text-[17px] font-semibold text-foreground">{t("training.course.about")}</h2>
                            <p className="whitespace-pre-line text-[14px] leading-relaxed text-muted-foreground">{course.description}</p>
                        </section>
                    )}

                    {course.learningOutcomes.length > 0 && (
                        <section className="rounded-2xl border border-border bg-card p-4">
                            <h2 className="mb-3 text-[17px] font-semibold text-foreground">{t("training.course.outcomes")}</h2>
                            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {course.learningOutcomes.map((o, i) => (
                                    <li key={i} className="flex gap-2 text-[13px] text-foreground">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                        {o}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section>
                        <h2 className="mb-3 text-[17px] font-semibold text-foreground">{t("training.course.program")}</h2>
                        {!course.viewer.hasFullAccess && course.lessons.some((l) => l.locked) && (
                            <p className="mb-3 text-[12px] text-muted-foreground">{t("training.course.lockedHint")}</p>
                        )}
                        <div className="space-y-4">
                            {sections.map((section, si) => (
                                <div key={si}>
                                    {section.title && <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">{section.title}</p>}
                                    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                                        {section.lessons.map((lesson) => {
                                            const content = (
                                                <>
                                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                                                        {lesson.progress?.completed ? (
                                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                        ) : lesson.locked ? (
                                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <PlayCircle className="h-5 w-5 text-primary" />
                                                        )}
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate text-[13px] font-medium text-foreground">{lesson.title}</span>
                                                        {lesson.isFreePreview && !course.isFree && (
                                                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">{t("training.course.preview")}</span>
                                                        )}
                                                    </span>
                                                    <span className="shrink-0 text-[12px] text-muted-foreground">{formatMinutes(Math.ceil(lesson.durationSeconds / 60))}</span>
                                                </>
                                            )
                                            return lesson.locked ? (
                                                <div key={lesson.id} className="flex items-center gap-3 px-3 py-2.5 opacity-70">{content}</div>
                                            ) : (
                                                <Link key={lesson.id} href={lessonUrl(lesson.id)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary">
                                                    {content}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {course.instructor && (
                        <section className="rounded-2xl border border-border bg-card p-4">
                            <h2 className="mb-3 text-[17px] font-semibold text-foreground">{t("training.course.instructor")}</h2>
                            <div className="flex items-start gap-3">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary">
                                    {course.instructor.photoUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={course.instructor.photoUrl} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <UserRound className="h-6 w-6 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="flex items-center gap-2 text-[14px] font-semibold text-foreground">
                                        {course.instructor.name}
                                        {course.instructor.linkedinUrl && (
                                            <a href={course.instructor.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[#0a66c2]">
                                                <Linkedin className="h-4 w-4" />
                                            </a>
                                        )}
                                    </p>
                                    {course.instructor.headline && <p className="text-[12px] text-muted-foreground">{course.instructor.headline}</p>}
                                    {course.instructor.bio && <p className="mt-2 whitespace-pre-line text-[13px] text-muted-foreground">{course.instructor.bio}</p>}
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* Encadré d'action, collant sur ordinateur */}
                <aside className="lg:sticky lg:top-0 lg:self-start">
                    <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
                        <ul className="space-y-2 text-[13px] text-foreground">
                            <li className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {formatMinutes(course.totalMinutes)} / {t("training.lessonsCount", { count: course.lessonsCount })}
                            </li>
                            <li className="flex items-center gap-2">
                                <Volume2 className="h-4 w-4 text-muted-foreground" />
                                {t("training.course.audio", { lang: languageLabel(course.language) })}
                            </li>
                            {course.subtitleLanguages.length > 0 && (
                                <li className="flex items-center gap-2">
                                    <Captions className="h-4 w-4 text-muted-foreground" />
                                    {t("training.course.subtitles", { langs: course.subtitleLanguages.map(languageLabel).join(", ") })}
                                </li>
                            )}
                            <li className="flex items-center gap-2">
                                <Layers className="h-4 w-4 text-muted-foreground" />
                                {t(`training.levels.${course.level}`)}
                            </li>
                        </ul>

                        {enrollment && (
                            <div>
                                <Progress value={enrollment.progress} className="h-2" />
                                <p className="mt-1 text-[12px] text-muted-foreground">
                                    {enrollment.status === "COMPLETED" ? t("training.course.completed") : t("training.course.progress", { progress: enrollment.progress })}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button className="flex-1 rounded-full bg-brand-gradient text-white hover:opacity-95" onClick={start} disabled={starting || !nextLesson}>
                                {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                                {enrollment ? t("training.course.resume") : t("training.course.start")}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className={cn("rounded-full", course.viewer.isBookmarked && "border-primary text-primary")}
                                onClick={toggleBookmark}
                                disabled={bookmarking}
                                aria-label={course.viewer.isBookmarked ? t("training.course.saved") : t("training.course.save")}
                                title={course.viewer.isBookmarked ? t("training.course.saved") : t("training.course.save")}
                            >
                                {course.viewer.isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                            </Button>
                        </div>

                        {enrollment?.hasCertificate && (
                            <Button
                                variant="outline"
                                className="w-full rounded-full"
                                onClick={() => enrollmentService.downloadCertificate(enrollment.id, `certificat-${course.slug ?? course.id}.docx`).catch(() => toast.error(t("common.error")))}
                            >
                                <Award className="h-4 w-4" />
                                {t("training.course.certificate")}
                            </Button>
                        )}

                        {!course.viewer.hasFullAccess && <PassBanner access={access} onChange={onAccessChange} compact />}
                    </div>
                </aside>
            </div>
        </div>
    )
}
