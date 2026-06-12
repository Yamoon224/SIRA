# API Doc — page d’accueil (app/page.tsx)

## Contexte
La page d’accueil affiche les offres populaires et permet l’analyse IA d’un CV téléchargé via la route interne `/api/analyse-cv`.

Base URL : `NEXT_PUBLIC_BACKEND_URL` (par défaut `https://goriya-api.lunion-lab.com`)

## Endpoints utilisés

### 1) Lister les offres populaires
- Méthode : `GET`
- Endpoint : `/job-offers/paginate`

#### Query params
| Nom | Type | Obligatoire | Description |
|---|---:|---:|---|
| limit | number | non | Nombre d’offres à afficher sur la page d’accueil |

### 2) Analyse IA du CV
- Méthode : `POST`
- Endpoint : `/api/analyse-cv` (route Next.js interne)

#### Payload multipart/form-data
```text
file=<cv.pdf | cv.docx | image.png | image.jpg | image.webp>
```

#### Réponse attendue
```json
{
  "analysis": {
    "summary": "string",
    "strengths": ["string"],
    "improvements": ["string"],
    "score": 85
  }
}
```
