import { AppLogoProps } from "@/lib/@types/props";


export function AppLogo({ width = 80, height = "auto", className }: AppLogoProps) {
    return (
        <img
            src="/images/logo.png"
            alt="LOGO"
            style={{ width, height }}
            className={className ? `object-contain ${className}` : "object-contain"}
        />
    )
}