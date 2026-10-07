import type { CSSProperties } from "react"

/**
 * Loader de marque : le logo Goriya se remplit du dégradé de marque, du bas
 * vers le haut, en boucle. Le remplissage est un `clip-path` animé sur une
 * copie du logo utilisée comme masque - l'alpha du PNG dessine la forme, la
 * couleur vient du calque dégradé posé dessous.
 */
export function GoriyaLogoLoader({ width = 150, label = "Analyse en cours" }: { width?: number; label?: string }) {
    const height = Math.round(width * 0.36)
    const maskStyle: CSSProperties = {
        WebkitMaskImage: "url(/images/logo.png)",
        maskImage: "url(/images/logo.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
    }

    return (
        <div role="status" aria-label={label} className="relative mx-auto" style={{ width, height }}>
            <div className="absolute inset-0 bg-[#c7cedd] opacity-50 dark:bg-border" style={maskStyle} />
            <div className="animate-goriya-fill absolute inset-0 bg-brand-gradient" style={maskStyle} />
        </div>
    )
}
