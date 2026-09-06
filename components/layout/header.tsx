"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn, formatFileUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Bell, Settings, User, Menu, LogIn, Briefcase, LayoutDashboard } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageToggle } from "@/components/ui/language-toggle"
import { SearchBar } from "@/components/ui/search-bar"
import { NotificationBell } from "@/components/notification-bell"
import { useAuth } from "@/contexts/auth-context"
import { useT } from "@/contexts/i18n-context"
import { AppLogo } from "../app-logo"

const PUBLIC_NAV_LINKS = [
    { href: "/", key: "nav.home" },
    { href: "/explorer-emplois", key: "nav.jobs" },
    { href: "/explorer-entreprises", key: "nav.companies" },
    { href: "/blog", key: "nav.blog" },
] as const

interface HeaderProps {
    onToggleSidebar?: () => void
    showMobileMenuButton?: boolean
    showLogo?: boolean
}

export function Header({ onToggleSidebar, showMobileMenuButton = false, showLogo = true }: HeaderProps) {
    const [mounted, setMounted] = useState(false)
    const { user, logout, isAuthenticated } = useAuth()
    const t = useT()
    const pathname = usePathname()

    const isActiveLink = (href: string) => {
        const p = pathname ?? ""
        return href === "/" ? p === "/" : p === href || p.startsWith(href + "/")
    }

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleLogout = () => {
        logout()
    }

    return (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border px-3 sm:px-6 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3 sm:gap-6">
                    {showMobileMenuButton ? (
                        <Button variant="ghost" size="sm" className="lg:hidden" onClick={onToggleSidebar}>
                            <Menu className="w-5 h-5" />
                        </Button>
                    ) : (
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="sm" className="lg:hidden">
                                    <Menu className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72">
                                <SheetHeader>
                                    <SheetTitle>
                                        <AppLogo />
                                    </SheetTitle>
                                </SheetHeader>
                                <nav className="flex flex-col gap-1 px-4">
                                    {PUBLIC_NAV_LINKS.map((link) => (
                                        <SheetClose asChild key={link.href}>
                                            <Link
                                                href={link.href}
                                                aria-current={isActiveLink(link.href) ? "page" : undefined}
                                                className={cn(
                                                    "rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                                                    isActiveLink(link.href)
                                                        ? "bg-muted text-foreground"
                                                        : "text-foreground hover:bg-muted",
                                                )}
                                            >
                                                {t(link.key)}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                </nav>
                                {mounted && isAuthenticated && (
                                    <div className="mt-4 px-4">
                                        <SheetClose asChild>
                                            <Link href="/dashboard">
                                                <Button className="w-full rounded-full gap-2">
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    {t("nav.dashboard")}
                                                </Button>
                                            </Link>
                                        </SheetClose>
                                    </div>
                                )}
                                {mounted && !isAuthenticated && (
                                    <div className="mt-4 flex flex-col gap-2 px-4">
                                        <SheetClose asChild>
                                            <Link href="/auth/signin">
                                                <Button variant="outline" className="w-full rounded-full">{t("nav.signIn")}</Button>
                                            </Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Link href="https://entreprise.goriya.net">
                                                <Button className="w-full rounded-full">{t("nav.companySpace")}</Button>
                                            </Link>
                                        </SheetClose>
                                    </div>
                                )}
                            </SheetContent>
                        </Sheet>
                    )}

                    {showLogo && (
                        <Link href="/" className="flex items-center">
                            <AppLogo />
                        </Link>
                    )}
                    <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
                        {PUBLIC_NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={isActiveLink(link.href) ? "page" : undefined}
                                className={cn(
                                    "relative text-sm transition-colors pb-1.5",
                                    "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors after:content-['']",
                                    isActiveLink(link.href)
                                        ? "text-foreground font-medium after:bg-primary"
                                        : "text-muted-foreground hover:text-foreground after:bg-transparent",
                                )}
                            >
                                {t(link.key)}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                    <div className="hidden md:block min-w-[220px] lg:min-w-[280px]">
                        <SearchBar />
                    </div>

                    {mounted && isAuthenticated && (
                        <>
                            <Link href="/dashboard">
                                <Button size="icon" className="rounded-full bg-brand-gradient text-white hover:bg-brand-gradient-hover" aria-label={t("nav.dashboard")} title={t("nav.dashboard")}>
                                    <LayoutDashboard className="w-4 h-4" />
                                </Button>
                            </Link>
                            <LanguageToggle />
                            <ThemeToggle />
                            <NotificationBell />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user?.avatar ? formatFileUrl(user.avatar) : undefined} alt="Profile" />
                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                {user?.name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user?.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard" className="flex items-center">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            {t("nav.dashboard")}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/notifications" className="flex items-center">
                                            <Bell className="mr-2 h-4 w-4" />
                                            {t("settings.notifications")}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/parametres" className="flex items-center">
                                            <Settings className="mr-2 h-4 w-4" />
                                            {t("nav.settings")}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="flex items-center text-destructive focus:text-destructive"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        {t("nav.signOut")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}

                    {mounted && !isAuthenticated && (
                        <div className="flex items-center gap-2">
                            <LanguageToggle />
                            <ThemeToggle />
                            <Link href="/auth/signin">
                                <Button variant="outline" size="sm" className="sm:text-sm bg-transparent w-9 px-0 sm:w-auto sm:px-3 rounded-full" aria-label={t("nav.signIn")}>
                                    <LogIn className="w-4 h-4 sm:hidden" />
                                    <span className="hidden sm:inline">{t("nav.signIn")}</span>
                                </Button>
                            </Link>
                            <Link href="https://entreprise.goriya.net">
                                <Button size="sm" className="sm:text-sm w-9 px-0 sm:w-auto sm:px-3 rounded-full bg-brand-gradient hover:bg-brand-gradient-hover" aria-label={t("nav.companySpace")}>
                                    <Briefcase className="w-4 h-4 sm:hidden" />
                                    <span className="hidden sm:inline">{t("nav.companySpace")}</span>
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
