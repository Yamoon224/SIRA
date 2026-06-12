"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell, Settings, User, Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { SearchBar } from "@/components/ui/search-bar"
import { useAuth } from "@/contexts/auth-context"
import { AppLogo } from "../app-logo"

interface HeaderProps {
    onToggleSidebar?: () => void
    showMobileMenuButton?: boolean
    showLogo?: boolean
    showTopBar?: boolean
}

export function Header({ onToggleSidebar, showMobileMenuButton = false, showLogo = true, showTopBar = true }: HeaderProps) {
    const [mounted, setMounted] = useState(false)
    const { user, logout, isAuthenticated } = useAuth()

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleLogout = () => {
        logout()
    }

    if (!showTopBar) {
        return null
    }

    return (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border px-3 sm:px-6 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3 sm:gap-6">
                    {showMobileMenuButton && (
                        <Button variant="ghost" size="sm" className="lg:hidden" onClick={onToggleSidebar}>
                            <Menu className="w-5 h-5" />
                        </Button>
                    )}

                    {showLogo && (
                        <Link href="/" className="flex items-center space-x-2">
                            <AppLogo />
                        </Link>
                    )}
                    <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
                        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                            Accueil
                        </Link>
                        <Link href="/emplois" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                            Emplois
                        </Link>
                        <Link
                            href="/explorer-entreprises"
                            className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                            Entreprises
                        </Link>
                        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                            Dashboard
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                    <div className="hidden md:block min-w-[220px] lg:min-w-[280px]">
                        <SearchBar />
                    </div>

                    {mounted && isAuthenticated && (
                        <>
                            <ThemeToggle />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt="Profile" />
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
                                        <Link href="/notifications" className="flex items-center">
                                            <Bell className="mr-2 h-4 w-4" />
                                            Notifications
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/parametres" className="flex items-center">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Paramètres
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="flex items-center text-destructive focus:text-destructive"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        Se déconnecter
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}

                    {mounted && !isAuthenticated && (
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <Link href="/auth/signin">
                                <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                                    Se connecter
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
