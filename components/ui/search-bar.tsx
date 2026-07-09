"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, MapPin, Briefcase, Building2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { jobService } from "@/lib/api/job.service"
import { companyService } from "@/lib/api/company.service"

interface SearchSuggestion {
  id: string
  type: "job" | "company" | "location"
  title: string
  subtitle?: string
  icon: React.ReactNode
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (query.trim().length === 0) {
      setFilteredSuggestions([])
      setIsOpen(false)
      return
    }

    let cancelled = false
    const timer = setTimeout(() => {
      Promise.all([
        jobService.getJobs({ search: query, limit: 4 }),
        companyService.getCompanies({ search: query, limit: 3 }),
      ])
        .then(([jobsRes, companiesRes]: any) => {
          if (cancelled) return
          const jobs = jobsRes?.data?.data ?? jobsRes?.data ?? []
          const companies = companiesRes?.data?.data ?? companiesRes?.data ?? []

          const suggestions: SearchSuggestion[] = [
            ...jobs.map((job: any) => ({
              id: `job-${job.id}`,
              type: "job" as const,
              title: job.title,
              subtitle: job.company?.name,
              icon: <Briefcase className="w-4 h-4" />,
            })),
            ...companies.map((company: any) => ({
              id: `company-${company.id}`,
              type: "company" as const,
              title: company.name,
              subtitle: company.sector || "Entreprise",
              icon: <Building2 className="w-4 h-4" />,
            })),
          ]

          setFilteredSuggestions(suggestions)
          setIsOpen(suggestions.length > 0)
        })
        .catch(() => {
          if (!cancelled) {
            setFilteredSuggestions([])
            setIsOpen(false)
          }
        })
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (searchQuery?: string) => {
    const searchTerm = searchQuery || query
    if (searchTerm.trim()) {
      router.push(`/explorer-emplois?q=${encodeURIComponent(searchTerm.trim())}`)
      setIsOpen(false)
      setQuery("")
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setIsOpen(false)
    setQuery("")

    if (suggestion.type === "company") {
      router.push(`/explorer-entreprises/${suggestion.id.replace("company-", "")}`)
      return
    }

    handleSearch(suggestion.title)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
    if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "job":
        return "Emploi"
      case "company":
        return "Entreprise"
      case "location":
        return "Lieu"
      default:
        return ""
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "job":
        return "bg-blue-100 text-blue-800"
      case "company":
        return "bg-green-100 text-green-800"
      case "location":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div ref={searchRef} className="relative">
      <div className="relative w-full min-w-0 sm:w-80">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Rechercher emplois, entreprises, lieux..."
          className="pl-10 w-full min-w-0"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
        />
        {query && (
          <Button
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2"
            onClick={() => handleSearch()}
          >
            <Search className="w-3 h-3" />
          </Button>
        )}
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 w-[calc(100vw-1rem)] max-w-sm overflow-y-auto shadow-xl sm:w-full">
          <CardContent className="p-0">
            {filteredSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="flex items-center space-x-3 p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="text-muted-foreground">{suggestion.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{suggestion.title}</span>
                    <Badge variant="secondary" className={`text-xs ${getTypeColor(suggestion.type)}`}>
                      {getTypeLabel(suggestion.type)}
                    </Badge>
                  </div>
                  {suggestion.subtitle && <p className="text-xs text-muted-foreground">{suggestion.subtitle}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
