"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Mic, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useT } from "@/contexts/i18n-context"
import {
    courseService,
    enrollmentService,
    type CourseLevel,
    type ICourse,
    type ICourseAccess,
    type ICourseCategory,
    type IEnrollment,
} from "@/lib/api/course.service"
import { CourseCard, CourseGridSkeleton } from "./_components/course-card"
import { PassBanner } from "./_components/pass-banner"

const PAGE_SIZE = 12
const ALL = "all"
const LEVELS: CourseLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"]
const LANGUAGES = ["fr", "en", "es", "pt", "ar"] as const

export default function DiscoverPage() {
    const t = useT()
    const [categories, setCategories] = useState<ICourseCategory[]>([])
    const [inProgress, setInProgress] = useState<IEnrollment[]>([])
    const [access, setAccess] = useState<ICourseAccess | null>(null)

    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [category, setCategory] = useState(ALL)
    const [level, setLevel] = useState(ALL)
    const [language, setLanguage] = useState(ALL)
    const [freeOnly, setFreeOnly] = useState(false)

    const [courses, setCourses] = useState<ICourse[]>([])
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [listening, setListening] = useState(false)
    const [speechSupported, setSpeechSupported] = useState(false)
    const requestId = useRef(0)

    useEffect(() => {
        courseService.categories().then((res) => setCategories(Array.isArray(res) ? res : [])).catch(() => {})
        courseService.access().then(setAccess).catch(() => {})
        enrollmentService
            .list()
            .then((res) => setInProgress((Array.isArray(res) ? res : []).filter((e) => e.status === "IN_PROGRESS" && e.course).slice(0, 3)))
            .catch(() => {})
        setSpeechSupported(typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window))
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350)
        return () => clearTimeout(timer)
    }, [search])

    const fetchPage = async (targetPage: number) => {
        const id = ++requestId.current
        const res = await courseService.paginate({
            page: targetPage,
            limit: PAGE_SIZE,
            search: debouncedSearch || undefined,
            category: category === ALL ? undefined : category,
            level: level === ALL ? undefined : (level as CourseLevel),
            language: language === ALL ? undefined : language,
            isFree: freeOnly ? true : undefined,
        })
        // Une frappe plus récente a relancé la recherche : on ignore la réponse périmée.
        if (id !== requestId.current) return null
        return res
    }

    useEffect(() => {
        setLoading(true)
        fetchPage(1)
            .then((res) => {
                if (!res) return
                setCourses(res.data ?? [])
                setPage(1)
                setTotal(res.meta?.total ?? 0)
                setTotalPages(res.meta?.totalPages ?? 1)
            })
            .catch((err) => console.error("[formations] catalogue error:", err))
            .finally(() => setLoading(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, category, level, language, freeOnly])

    const loadMore = async () => {
        setLoadingMore(true)
        try {
            const res = await fetchPage(page + 1)
            if (!res) return
            setCourses((prev) => [...prev, ...(res.data ?? [])])
            setPage(page + 1)
        } finally {
            setLoadingMore(false)
        }
    }

    const startVoiceSearch = () => {
        const Recognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
        if (!Recognition) return
        const recognition = new Recognition()
        recognition.lang = document.documentElement.lang === "en" ? "en-US" : "fr-FR"
        recognition.interimResults = false
        recognition.onresult = (event: any) => setSearch(event.results[0][0].transcript)
        recognition.onend = () => setListening(false)
        recognition.onerror = () => setListening(false)
        setListening(true)
        recognition.start()
    }

    const chip = (active: boolean) =>
        cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors",
            active ? "border-transparent bg-brand-gradient text-white" : "border-border bg-card text-muted-foreground hover:text-foreground",
        )

    return (
        <div className="space-y-6">
            {/* Accroche + recherche, comme l'écran d'accueil de la maquette */}
            <section className="rounded-3xl bg-brand-gradient px-5 py-8 text-center text-white sm:px-10 sm:py-12">
                <h1 className="text-[28px] font-bold leading-tight sm:text-[40px]">{t("training.title")}</h1>
                <p className="mx-auto mt-2 max-w-xl text-[13px] text-white/85 sm:text-[15px]">{t("training.subtitle")}</p>
                <div className="relative mx-auto mt-6 max-w-xl">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t("training.searchPlaceholder")}
                        className="h-12 w-full rounded-full border-0 bg-white pl-11 pr-12 text-[14px] text-[#1b2331] shadow-lg outline-none placeholder:text-[#8a92a3] focus:ring-2 focus:ring-white/60"
                    />
                    {speechSupported && (
                        <button
                            type="button"
                            onClick={startVoiceSearch}
                            className={cn("absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full", listening ? "bg-red-500 text-white" : "text-[#5d6475] hover:bg-secondary")}
                            aria-label="Recherche vocale"
                        >
                            <Mic className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </section>

            <PassBanner access={access} onChange={setAccess} />

            {inProgress.length > 0 && !debouncedSearch && (
                <section>
                    <h2 className="mb-3 text-[18px] font-semibold text-foreground">{t("training.continueTitle")}</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {inProgress.map((e) => (
                            <CourseCard
                                key={e.id}
                                course={e.course!}
                                progress={e.progress}
                                href={`/formations/${e.course!.slug ?? e.course!.id}/apprendre${e.lastLessonId ? `?lecon=${e.lastLessonId}` : ""}`}
                            />
                        ))}
                    </div>
                </section>
            )}

            <section className="space-y-3">
                <h2 className="text-[18px] font-semibold text-foreground">{t("training.categories")}</h2>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                    <button type="button" className={chip(category === ALL)} onClick={() => setCategory(ALL)}>
                        {t("training.allCategories")}
                    </button>
                    {categories.map((c) => (
                        <button key={c.id} type="button" className={chip(category === c.slug)} onClick={() => setCategory(c.slug)}>
                            {c.name}
                            {c.coursesCount ? <span className="ml-1 opacity-70">{c.coursesCount}</span> : null}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={level} onValueChange={setLevel}>
                        <SelectTrigger className="h-9 w-auto min-w-[140px] rounded-full text-[12px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>{t("training.allLevels")}</SelectItem>
                            {LEVELS.map((l) => <SelectItem key={l} value={l}>{t(`training.levels.${l}`)}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="h-9 w-auto min-w-[140px] rounded-full text-[12px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>{t("training.allLanguages")}</SelectItem>
                            {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{t(`training.languages.${l}`)}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <button type="button" className={chip(freeOnly)} onClick={() => setFreeOnly((v) => !v)}>
                        {t("training.freeOnly")}
                    </button>
                </div>
            </section>

            <section>
                <div className="mb-3 flex items-baseline justify-between">
                    <h2 className="text-[18px] font-semibold text-foreground">{t("training.catalogTitle")}</h2>
                    {!loading && <span className="text-[12px] text-muted-foreground">{t("training.resultsCount", { count: total })}</span>}
                </div>
                {loading ? (
                    <CourseGridSkeleton />
                ) : courses.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-border py-12 text-center text-[13px] text-muted-foreground">{t("training.noCourses")}</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {courses.map((course) => <CourseCard key={course.id} course={course} />)}
                        </div>
                        {page < totalPages && (
                            <div className="mt-6 flex justify-center">
                                <Button variant="outline" className="rounded-full" onClick={loadMore} disabled={loadingMore}>
                                    {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {t("training.loadMore")}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    )
}
