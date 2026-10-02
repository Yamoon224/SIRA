"use client"

import { forwardRef, useMemo } from "react"
import type { ISchemaEdge, ISchemaNode } from "@/lib/api/presentation.service"

/** Une teinte par niveau du schéma : le regard suit le flux de haut en bas. */
const PALETTE = [
    { fond: "#2f6de6", bord: "#1f4ec2", texte: "#ffffff" },
    { fond: "#ede9fe", bord: "#7c3aed", texte: "#4c1d95" },
    { fond: "#ccfbf1", bord: "#0d9488", texte: "#115e59" },
    { fond: "#fef3c7", bord: "#d97706", texte: "#92400e" },
    { fond: "#ffe4e6", bord: "#e11d48", texte: "#9f1239" },
    { fond: "#e0f2fe", bord: "#0284c7", texte: "#075985" },
]

const NOEUD_L = 176
const NOEUD_H = 58
const ECART_X = 36
const ECART_Y = 84
const MARGE = 28
const MAX_PAR_LIGNE = 4

/** Coupe un libellé en lignes d'environ `max` caractères (3 lignes au plus). */
function couper(label: string, max = 22): string[] {
    const lignes: string[] = []
    let courante = ""
    for (const mot of label.split(/\s+/).filter(Boolean)) {
        if (courante && (courante + " " + mot).length > max) {
            lignes.push(courante)
            courante = mot
        } else {
            courante = courante ? `${courante} ${mot}` : mot
        }
    }
    if (courante) lignes.push(courante)
    if (lignes.length > 3) {
        lignes.length = 3
        lignes[2] = `${lignes[2].slice(0, max - 1)}…`
    }
    return lignes
}

interface Place {
    node: ISchemaNode
    niveau: number
    x: number
    y: number
}

/**
 * Disposition en niveaux : un nœud se place sous le plus bas de ses parents.
 * Le nombre de passes est borné pour qu'un cycle ne boucle pas indéfiniment.
 */
function disposer(nodes: ISchemaNode[], edges: ISchemaEdge[]) {
    const niveau = new Map(nodes.map((n) => [n.id, 0]))
    for (let passe = 0; passe < nodes.length; passe += 1) {
        let change = false
        for (const e of edges) {
            const de = niveau.get(e.from)
            const vers = niveau.get(e.to)
            if (de === undefined || vers === undefined || e.from === e.to) continue
            if (vers < de + 1 && de + 1 < nodes.length) {
                niveau.set(e.to, de + 1)
                change = true
            }
        }
        if (!change) break
    }

    // Regroupe par niveau, puis scinde les niveaux trop larges en plusieurs rangées.
    const parNiveau = new Map<number, ISchemaNode[]>()
    for (const n of nodes) {
        const k = niveau.get(n.id) ?? 0
        parNiveau.set(k, [...(parNiveau.get(k) ?? []), n])
    }
    const rangees: { niveau: number; nodes: ISchemaNode[] }[] = []
    for (const k of [...parNiveau.keys()].sort((a, b) => a - b)) {
        const liste = parNiveau.get(k) ?? []
        for (let i = 0; i < liste.length; i += MAX_PAR_LIGNE) {
            rangees.push({ niveau: k, nodes: liste.slice(i, i + MAX_PAR_LIGNE) })
        }
    }

    const plusLarge = Math.max(1, ...rangees.map((r) => r.nodes.length))
    const largeur = MARGE * 2 + plusLarge * NOEUD_L + (plusLarge - 1) * ECART_X
    const hauteur = MARGE * 2 + rangees.length * NOEUD_H + Math.max(rangees.length - 1, 0) * ECART_Y

    const places = new Map<string, Place>()
    rangees.forEach((rangee, r) => {
        const total = rangee.nodes.length * NOEUD_L + (rangee.nodes.length - 1) * ECART_X
        const depart = (largeur - total) / 2
        rangee.nodes.forEach((node, i) => {
            places.set(node.id, {
                node,
                niveau: rangee.niveau,
                x: depart + i * (NOEUD_L + ECART_X),
                y: MARGE + r * (NOEUD_H + ECART_Y),
            })
        })
    })

    return { places, largeur, hauteur }
}

interface Props {
    nodes: ISchemaNode[]
    edges: ISchemaEdge[]
}

/**
 * Schéma nœuds/arêtes rendu en SVG. Les couleurs sont écrites en dur (pas de
 * classes Tailwind) pour que l'export PNG, qui sérialise le SVG seul, soit
 * identique à l'affichage.
 */
export const SchemaDiagram = forwardRef<SVGSVGElement, Props>(function SchemaDiagram({ nodes, edges }, ref) {
    const { places, largeur, hauteur } = useMemo(() => disposer(nodes, edges), [nodes, edges])

    const liens = edges
        .map((e) => ({ edge: e, de: places.get(e.from), vers: places.get(e.to) }))
        .filter((l): l is { edge: ISchemaEdge; de: Place; vers: Place } => !!l.de && !!l.vers && l.de !== l.vers)

    return (
        <svg
            ref={ref}
            viewBox={`0 0 ${largeur} ${hauteur}`}
            role="img"
            aria-label="Schéma"
            style={{ width: "100%", maxWidth: largeur, minWidth: Math.min(largeur, 560), height: "auto", fontFamily: "Inter, Helvetica, Arial, sans-serif" }}
        >
            <defs>
                <marker id="schema-fleche" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M0 0 L10 5 L0 10 z" fill="#94a3b8" />
                </marker>
            </defs>
            <rect x="0" y="0" width={largeur} height={hauteur} rx="14" fill="#f8fafc" />

            {liens.map(({ edge, de, vers }, i) => {
                const descend = vers.y > de.y
                const memeRangee = vers.y === de.y
                // Vers le bas : du pied du parent à la tête de l'enfant. Sinon
                // (retour, même rangée) : on relie les flancs.
                const aDroite = vers.x >= de.x
                const x1 = memeRangee ? de.x + (aDroite ? NOEUD_L : 0) : de.x + NOEUD_L / 2
                const y1 = memeRangee ? de.y + NOEUD_H / 2 : descend ? de.y + NOEUD_H : de.y
                const x2 = memeRangee ? vers.x + (aDroite ? 0 : NOEUD_L) : vers.x + NOEUD_L / 2
                const y2 = memeRangee ? vers.y + NOEUD_H / 2 : descend ? vers.y : vers.y + NOEUD_H
                const my = (y1 + y2) / 2
                const d = memeRangee
                    ? `M${x1} ${y1} L${x2} ${y2}`
                    : `M${x1} ${y1} C${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`
                const libelle = edge.label?.trim()
                const largeurLibelle = libelle ? Math.min(libelle.length, 26) * 5.6 + 14 : 0

                return (
                    <g key={i}>
                        <path d={d} fill="none" stroke="#94a3b8" strokeWidth="1.6" markerEnd="url(#schema-fleche)" />
                        {libelle && (
                            <>
                                <rect
                                    x={(x1 + x2) / 2 - largeurLibelle / 2}
                                    y={my - 9}
                                    width={largeurLibelle}
                                    height="18"
                                    rx="9"
                                    fill="#ffffff"
                                    stroke="#e2e8f0"
                                />
                                <text x={(x1 + x2) / 2} y={my + 3.5} textAnchor="middle" fontSize="10" fill="#475569">
                                    {libelle.length > 26 ? `${libelle.slice(0, 25)}…` : libelle}
                                </text>
                            </>
                        )}
                    </g>
                )
            })}

            {[...places.values()].map(({ node, niveau, x, y }) => {
                const couleur = PALETTE[niveau % PALETTE.length]
                const lignes = couper(node.label)
                const premiere = y + NOEUD_H / 2 - ((lignes.length - 1) * 14) / 2 + 4
                return (
                    <g key={node.id}>
                        <rect x={x + 1.5} y={y + 3} width={NOEUD_L} height={NOEUD_H} rx="12" fill="#0f172a" opacity="0.08" />
                        <rect x={x} y={y} width={NOEUD_L} height={NOEUD_H} rx="12" fill={couleur.fond} stroke={couleur.bord} strokeWidth="1.5" />
                        <text textAnchor="middle" fontSize="12" fontWeight="600" fill={couleur.texte}>
                            {lignes.map((ligne, k) => (
                                <tspan key={k} x={x + NOEUD_L / 2} y={premiere + k * 14}>
                                    {ligne}
                                </tspan>
                            ))}
                        </text>
                    </g>
                )
            })}
        </svg>
    )
})
