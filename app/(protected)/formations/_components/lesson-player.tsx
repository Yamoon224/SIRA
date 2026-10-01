"use client"

import { useEffect, useMemo, useRef } from "react"
import { VideoOff } from "lucide-react"
import type { ISubtitleTrack, VideoProvider } from "@/lib/api/course.service"
import type { OfflineLesson } from "@/lib/offline-lessons"

function youtubeId(url: string): string | null {
    try {
        const u = new URL(url)
        if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("/")[0] || null
        if (u.searchParams.get("v")) return u.searchParams.get("v")
        const match = u.pathname.match(/\/(embed|shorts|live)\/([^/?]+)/)
        return match?.[2] ?? null
    } catch {
        return null
    }
}

function vimeoId(url: string): string | null {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
    return match?.[1] ?? null
}

/** Part regardée à partir de laquelle une leçon vidéo compte comme terminée. */
const COMPLETION_RATIO = 0.9
/** Fréquence d'enregistrement de la position de lecture. */
const SAVE_EVERY_SECONDS = 15

export interface LessonPlayerProps {
    lessonId: string
    videoUrl: string | null
    provider: VideoProvider
    subtitles: ISubtitleTrack[]
    startAt: number
    /** Copie locale (hors-ligne) prioritaire sur le lien distant. */
    offline?: OfflineLesson | null
    noVideoLabel: string
    onPosition: (seconds: number) => void
    onCompleted: () => void
}

/**
 * Lecteur d'une leçon. Les vidéos en lien direct passent par <video> (reprise
 * de lecture, sous-titres .vtt, complétion automatique à 90 %) ; YouTube et
 * Vimeo par leur iframe, où la complétion se fait à la main faute d'API de
 * suivi sans SDK.
 */
export function LessonPlayer({ lessonId, videoUrl, provider, subtitles, startAt, offline, noVideoLabel, onPosition, onCompleted }: LessonPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const lastSaved = useRef(0)
    const completedSent = useRef(false)

    useEffect(() => {
        lastSaved.current = 0
        completedSent.current = false
    }, [lessonId])

    // URLs objet pour la copie hors-ligne (vidéo + sous-titres), révoquées au démontage.
    const offlineUrls = useMemo(() => {
        if (!offline) return null
        return {
            video: URL.createObjectURL(offline.blob),
            tracks: offline.subtitles.map((s) => ({
                lang: s.lang,
                label: s.label,
                url: URL.createObjectURL(new Blob([s.text], { type: "text/vtt" })),
            })),
        }
    }, [offline])

    useEffect(() => {
        return () => {
            if (!offlineUrls) return
            URL.revokeObjectURL(offlineUrls.video)
            offlineUrls.tracks.forEach((t) => URL.revokeObjectURL(t.url))
        }
    }, [offlineUrls])

    const frame = "aspect-video w-full overflow-hidden rounded-2xl bg-black"

    if (!offlineUrls && !videoUrl) {
        return (
            <div className={`${frame} flex flex-col items-center justify-center gap-2 text-white/70`}>
                <VideoOff className="h-10 w-10" />
                <p className="text-[13px]">{noVideoLabel}</p>
            </div>
        )
    }

    if (!offlineUrls && provider === "YOUTUBE") {
        const id = youtubeId(videoUrl!)
        return (
            <div className={frame}>
                <iframe
                    key={lessonId}
                    src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&start=${Math.floor(startAt)}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Leçon"
                />
            </div>
        )
    }

    if (!offlineUrls && provider === "VIMEO") {
        const id = vimeoId(videoUrl!)
        return (
            <div className={frame}>
                <iframe
                    key={lessonId}
                    src={`https://player.vimeo.com/video/${id}#t=${Math.floor(startAt)}s`}
                    className="h-full w-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title="Leçon"
                />
            </div>
        )
    }

    const tracks = offlineUrls?.tracks ?? subtitles.map((s) => ({ lang: s.lang, label: s.label ?? s.lang, url: s.url }))

    const handleTimeUpdate = () => {
        const video = videoRef.current
        if (!video || !video.duration) return
        if (video.currentTime - lastSaved.current >= SAVE_EVERY_SECONDS || video.currentTime < lastSaved.current) {
            lastSaved.current = video.currentTime
            onPosition(Math.floor(video.currentTime))
        }
        if (!completedSent.current && video.currentTime / video.duration >= COMPLETION_RATIO) {
            completedSent.current = true
            onCompleted()
        }
    }

    return (
        <div className={frame}>
            <video
                key={lessonId}
                ref={videoRef}
                src={offlineUrls?.video ?? videoUrl!}
                // Les pistes .vtt distantes exigent le mode CORS ; on ne l'active
                // que si nécessaire, un hébergeur sans CORS bloquerait sinon la vidéo.
                crossOrigin={!offlineUrls && tracks.length > 0 ? "anonymous" : undefined}
                controls
                playsInline
                preload="metadata"
                controlsList="nodownload"
                className="h-full w-full"
                onLoadedMetadata={(e) => {
                    const video = e.currentTarget
                    if (startAt > 0 && startAt < video.duration - 5) video.currentTime = startAt
                }}
                onTimeUpdate={handleTimeUpdate}
                onPause={(e) => onPosition(Math.floor(e.currentTarget.currentTime))}
                onEnded={() => {
                    if (!completedSent.current) {
                        completedSent.current = true
                        onCompleted()
                    }
                }}
            >
                {tracks.map((track, i) => (
                    <track key={track.lang + i} kind="subtitles" srcLang={track.lang} label={track.label} src={track.url} />
                ))}
            </video>
        </div>
    )
}
