"use client"

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"

interface AutocompleteInputProps {
    value: string
    onChange: (value: string) => void
    /** Suggestions filtrées sur la saisie ; le champ reste libre. */
    options: readonly string[]
    placeholder?: string
    className?: string
    maxSuggestions?: number
    /** Repris tels quels sur l'`<input>` (association au `<Label>`, formulaires). */
    id?: string
    name?: string
    "aria-label"?: string
}

/**
 * Minuscules sans diacritiques : « Côte d'Ivoire » doit sortir sur « cote ».
 */
function normalise(v: string) {
    return v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

/**
 * Champ texte libre avec liste de suggestions (ville, intitulé de poste…).
 * Volontairement sans dépendance : la saisie manuelle doit toujours passer,
 * les référentiels n'étant pas exhaustifs.
 */
export function AutocompleteInput({
    value,
    onChange,
    options,
    placeholder,
    className,
    maxSuggestions = 8,
    id,
    name,
    ...aria
}: AutocompleteInputProps) {
    const [open, setOpen] = useState(false)
    const [highlight, setHighlight] = useState(0)
    const wrapper = useRef<HTMLDivElement>(null)

    const suggestions = useMemo(() => {
        const q = normalise(value.trim())
        const pool = q ? options.filter((o) => normalise(o).includes(q)) : options
        // Saisie déjà égale à l'unique correspondance : plus rien à proposer.
        if (pool.length === 1 && normalise(pool[0]) === q) return []
        return pool.slice(0, maxSuggestions)
    }, [value, options, maxSuggestions])

    useEffect(() => {
        if (!open) return
        const onPointerDown = (e: MouseEvent) => {
            if (!wrapper.current?.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", onPointerDown)
        return () => document.removeEventListener("mousedown", onPointerDown)
    }, [open])

    const commit = (v: string) => {
        onChange(v)
        setOpen(false)
    }

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            setOpen(false)
            return
        }
        if (!open || suggestions.length === 0) return
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setHighlight((h) => (h + 1) % suggestions.length)
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length)
        } else if (e.key === "Enter") {
            e.preventDefault()
            commit(suggestions[highlight] ?? value)
        }
    }

    return (
        <div ref={wrapper} className="relative">
            <Input
                id={id}
                name={name}
                value={value}
                placeholder={placeholder}
                className={className}
                autoComplete="off"
                role="combobox"
                aria-expanded={open}
                aria-autocomplete="list"
                aria-label={aria["aria-label"]}
                onChange={(e) => {
                    onChange(e.target.value)
                    setHighlight(0)
                    setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={onKeyDown}
            />

            {open && suggestions.length > 0 && (
                <ul
                    role="listbox"
                    className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-[7px] border border-border bg-popover py-1 shadow-lg"
                >
                    {suggestions.map((s, i) => (
                        <li key={s} role="option" aria-selected={i === highlight}>
                            <button
                                type="button"
                                // Empêche le blur du champ avant la prise en compte du clic.
                                onMouseDown={(e) => e.preventDefault()}
                                onMouseEnter={() => setHighlight(i)}
                                onClick={() => commit(s)}
                                className={`block w-full px-3 py-1.5 text-left text-[12px] transition-colors ${
                                    i === highlight
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted-foreground"
                                }`}
                            >
                                {s}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
