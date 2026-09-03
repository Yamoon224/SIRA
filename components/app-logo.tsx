import { AppLogoProps } from "@/lib/@types/props";

/**
 * Le logo officiel est bleu (#0432ae) : illisible sur les surfaces du thème
 * sombre. On monte les deux variantes et on laisse le CSS choisir, plutôt que
 * de lire le thème en JS — sinon le logo change après l'hydratation, et le SSR
 * ne sait pas quel thème sera actif. La variante masquée sort aussi de l'arbre
 * d'accessibilité (display: none), le logo n'est donc annoncé qu'une fois.
 */
export function AppLogo({ width = 80, height = "auto", className }: AppLogoProps) {
    const base = className ? `object-contain ${className}` : "object-contain"
    return (
        <>
            <img
                src="/images/logo.png"
                alt="Goriya"
                style={{ width, height }}
                className={`${base} dark:hidden`}
            />
            <img
                src="/images/logo-blanc.png"
                alt="Goriya"
                style={{ width, height }}
                className={`hidden ${base} dark:block`}
            />
        </>
    )
}
