"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

const LUNION_MEET_ORIGIN = "https://meet.lunion-lab.com"

interface CallEmbedProps {
    token: string
    url: string
    room: string
    name: string
    title: string
    onClose: () => void
}

/**
 * Intègre lunion.meet via l'embed iframe + protocole postMessage documenté
 * (https://meet.lunion-lab.com/docs/integration) : le client écoute
 * "lunion:ready" puis on répond avec "lunion:config" (token/url/room/name).
 * NOTE : la forme exacte des messages (string brute vs objet {type}) n'est
 * pas confirmée par un test contre un embed réel — les deux formes sont
 * gérées défensivement ci-dessous, à revérifier avant mise en production.
 */
export function CallEmbed({ token, url, room, name, title, onClose }: CallEmbedProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)

    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            if (event.origin !== LUNION_MEET_ORIGIN) return

            const isReady = event.data === "lunion:ready" || event.data?.type === "lunion:ready"
            if (!isReady) return

            iframeRef.current?.contentWindow?.postMessage(
                { type: "lunion:config", token, url, room, name },
                LUNION_MEET_ORIGIN
            )
        }

        window.addEventListener("message", handleMessage)
        return () => window.removeEventListener("message", handleMessage)
    }, [token, url, room, name])

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
            <div className="flex items-center justify-between bg-black/80 px-4 py-2.5">
                <p className="text-sm font-medium text-white">{title}</p>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <iframe
                ref={iframeRef}
                src={`${LUNION_MEET_ORIGIN}/embed/call`}
                allow="camera; microphone; display-capture; autoplay"
                className="h-full w-full flex-1 border-0"
            />
        </div>
    )
}
