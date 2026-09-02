# -*- coding: utf-8 -*-
"""Genere app/theme-dark-bridge.css.

Les pages ont ete ecrites avec une palette claire en dur (bg-white,
text-[#1b2331], border-[#e8edf6]...). Ce script releve tous ces utilitaires
dans app/ et components/, les classe par role (surface, bordure, encre,
texte secondaire, marque, statut) et emet les regles qui les remappent
sur les jetons du theme quand .dark est actif.

    python scripts/gen-theme-dark-bridge.py   (depuis standard/)
"""
import colorsys
import os
import re

TOKEN = re.compile(
    r'(?:[a-z-]+:)*(?:bg|text|border|placeholder|divide|ring|from|to|via)'
    r'-(?:\[#[0-9a-fA-F]{3,8}\]|white|black|gray-\d{2,3})(?:/\d{1,3})?')


def collect():
    toks = {}
    for base in ('app', 'components'):
        for root, dirs, files in os.walk(base):
            dirs[:] = [d for d in dirs if d not in ('node_modules', '.next')]
            for name in files:
                if name.endswith(('.tsx', '.ts')):
                    src = open(os.path.join(root, name), encoding='utf-8').read()
                    for m in TOKEN.finditer(src):
                        toks[m.group(0)] = toks.get(m.group(0), 0) + 1
    return toks


def hsl(value):
    if len(value) == 3:
        value = ''.join(c * 2 for c in value)
    value = value[:6]
    r, g, b = [int(value[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return h * 360, s, l


def tohex(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h / 360, l, s)
    return '#%02x%02x%02x' % tuple(round(c * 255) for c in (r, g, b))


def is_blue(h):
    return 200 <= h <= 262


def classify(prop, value):
    """Retourne (groupe, valeur css), ou None si la couleur doit rester telle quelle."""
    if value in ('white', 'black') or value.startswith('gray-'):
        shade = int(value.split('-')[1]) if value.startswith('gray-') else None
        if value == 'black':
            return None
        if prop == 'bg':
            if shade and shade >= 700:
                return None  # aplat deja sombre
            if value == 'white':
                return ('surface', 'var(--card)')
            return ('surface-2', 'var(--muted)')  # gray-50..200
        if prop in ('text', 'placeholder'):
            if value == 'white':
                return None
            if shade >= 700:
                return ('ink', 'var(--foreground)')
            return ('ink-muted', 'var(--muted-foreground)')
        if prop in ('border', 'divide'):
            if value == 'white' or shade >= 500:
                return None
            return ('line', 'var(--border)')
        return None

    if not value.startswith('#'):
        return None
    h, s, l = hsl(value[1:])

    if prop == 'bg':
        if l >= 0.965 and s < 0.6:
            return ('surface', 'var(--card)')
        if l >= 0.86:
            if s >= 0.55 and is_blue(h):
                return ('surface-brand', 'var(--surface-brand)')
            if s >= 0.25 and not is_blue(h):
                return ('surface-status', tohex(h, min(s, 0.32), 0.22))
            return ('surface-2', 'var(--muted)')
        if l <= 0.35:
            return ('surface-deep', 'var(--secondary)')
        return None  # aplats de marque : lisibles tels quels

    if prop in ('border', 'divide'):
        if l >= 0.82 and s < 0.55:
            return ('line', 'var(--border)')
        if l >= 0.62 and is_blue(h):
            return ('line-brand', 'var(--line-brand)')
        return None

    if prop in ('text', 'placeholder'):
        if l > 0.82:
            return None  # texte deja clair, pose sur un fond colore
        if l < 0.28:
            return ('ink', 'var(--foreground)')  # quasi noir, meme tres teinte
        if s < 0.35:
            if l <= 0.5:
                return ('ink', 'var(--foreground)')
            return ('ink-muted', 'var(--muted-foreground)')
        if is_blue(h) and l < 0.7:
            return ('ink-brand', 'var(--ink-brand)')
        if l < 0.7:
            return ('ink-status', tohex(h, min(s, 0.8), 0.74))
    return None


ESCAPE = re.compile(r'([:\[\]#/.%])')
PSEUDO = {
    'hover': ':hover',
    'focus': ':focus',
    'focus-visible': ':focus-visible',
    'active': ':active',
    'disabled': ':disabled',
    'placeholder': '::placeholder',
}


def selector(token):
    """`.dark :where(.classe)<pseudos>`.

    :where() annule la specificite de la classe : la regle pese autant qu'un
    utilitaire simple (et passe apres, donc gagne) mais moins qu'un `dark:*`
    ecrit a la main dans un composant, qui reste prioritaire.
    """
    parts = token.split(':')
    variants, base = parts[:-1], parts[-1]
    if any(v not in PSEUDO for v in variants):
        return None  # dark:, md:, group-* ... : hors perimetre
    pseudo = ''.join(PSEUDO[v] for v in variants)
    if base.startswith('placeholder-'):
        pseudo += '::placeholder'
    return '.dark :where(.%s)%s' % (ESCAPE.sub(r'\\\1', token), pseudo)


PROPERTY = {'bg': 'background-color', 'text': 'color', 'border': 'border-color',
            'divide': 'border-color', 'placeholder': 'color'}
LABEL = {
    'surface': 'Surfaces blanches -> surface de carte',
    'surface-2': 'Aplats gris ou bleutes clairs -> surface secondaire',
    'surface-brand': 'Aplats bleu pale (badges, survols) -> teinte de marque',
    'surface-status': 'Aplats pastel de statut -> teinte sombre de meme famille',
    'surface-deep': 'Aplats deja sombres -> surface elevee (sinon invisibles)',
    'line': 'Bordures gris clair -> bordure du theme',
    'line-brand': 'Bordures bleu pale (etats selectionnes) -> bordure de marque',
    'ink': 'Textes encre -> couleur de premier plan',
    'ink-muted': 'Textes gris -> couleur secondaire',
    'ink-brand': 'Textes bleu marque -> bleu eclairci (contraste sur fond sombre)',
    'ink-status': 'Textes de statut -> version eclaircie',
}
ORDER = ['surface', 'surface-2', 'surface-brand', 'surface-status', 'surface-deep',
         'line', 'line-brand', 'ink', 'ink-muted', 'ink-brand', 'ink-status']

HEADER = """/* ---------------------------------------------------------------------------
   Pont de theme sombre - FICHIER GENERE, ne pas editer a la main.

   Les pages de l'app ont ete ecrites avec une palette claire en dur
   (bg-white, text-[#1b2331], border-[#e8edf6]...). En mode sombre ces valeurs
   restaient claires : cartes blanches eblouissantes, textes encre illisibles,
   bordures invisibles. Les regles ci-dessous remappent ces utilitaires sur les
   jetons du theme, groupes par role.

   Priorite : `:where()` annule la specificite de la classe, la regle pese donc
   autant qu'un utilitaire simple (elle passe apres, donc elle gagne) mais moins
   qu'un `dark:*` ecrit a la main dans un composant, qui reste prioritaire.

   A terme, remplacer ces utilitaires par les jetons semantiques (bg-card,
   text-foreground, border-border...) et supprimer ce fichier.

   Regeneration : python scripts/gen-theme-dark-bridge.py
   --------------------------------------------------------------------------- */

@layer utilities {"""


def main():
    rules = {}
    skipped = []
    for token, count in sorted(collect().items()):
        base = token.split(':')[-1]
        m = re.match(r'(bg|text|border|placeholder|divide|ring|from|to|via)'
                     r'-(.+?)(?:/(\d{1,3}))?$', base)
        prop, raw, alpha = m.group(1), m.group(2), m.group(3)
        if prop in ('ring', 'from', 'to', 'via'):
            continue  # degrades et anneaux de focus : deja de marque
        if alpha and int(alpha) < 50:
            continue  # voiles translucides sur fond colore : intentionnels
        value = raw[1:-1] if raw.startswith('[') else raw
        result = classify(prop, value)
        sel = selector(token) if result else None
        if not result or not sel:
            skipped.append(token)
            continue
        group, css = result
        if alpha:
            css = 'color-mix(in oklab, %s %s%%, transparent)' % (css, alpha)
        rules.setdefault((group, PROPERTY[prop], css), []).append((sel, count))

    out = [HEADER]
    for group in ORDER:
        items = [(key, sels) for key, sels in rules.items() if key[0] == group]
        if not items:
            continue
        usages = sum(n for _, sels in items for _, n in sels)
        out.append('\n  /* %s (%d usages) */' % (LABEL[group], usages))
        for (_, prop, css), sels in sorted(items, key=lambda kv: -sum(n for _, n in kv[1])):
            selectors = ',\n  '.join(sel for sel, _ in sorted(sels))
            out.append('  %s {\n    %s: %s;\n  }' % (selectors, prop, css))
    out.append('}\n')
    open('app/theme-dark-bridge.css', 'w', encoding='utf-8').write('\n'.join(out))

    print('regles: %d | classes remappees: %d | laissees telles quelles: %d'
          % (sum(len(v) for v in rules.values()),
             sum(n for sels in rules.values() for _, n in sels), len(skipped)))
    print('laissees telles quelles: ' + ' '.join(sorted(skipped)))


if __name__ == '__main__':
    main()
