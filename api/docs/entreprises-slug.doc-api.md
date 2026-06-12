# API Doc — entreprises/[slug]

## Contexte
Cette vue détail d’entreprise consomme les endpoints de récupération d’une entreprise et de ses offres.

Base URL : `NEXT_PUBLIC_BACKEND_URL` (par défaut `https://goriya-api.lunion-lab.com`)

## Endpoints

### 1) Détail d’une entreprise
- Méthode : `GET`
- Endpoint : `/companies/:id`

Exemple
```http
GET /companies/123
```

#### Réponse attendue
```json
{
  "success": true,
  "message": "Entreprise chargée",
  "data": {
    "id": "string",
    "name": "string",
    "sector": "string",
    "about": "string | null",
    "website": "string | null",
    "location": "string | null",
    "logo": "string | null",
    "coverImage": "string | null",
    "email": "string | null",
    "phone": "string | null"
  }
}
```

### 2) Offres associées à l’entreprise
- Méthode : `GET`
- Endpoint : `/companies/:id/jobs`

Exemple
```http
GET /companies/123/jobs
```

#### Réponse attendue
```json
{
  "success": true,
  "message": "Offres récupérées",
  "data": [
    {
      "id": "string",
      "title": "string",
      "location": "string",
      "type": "CDI",
      "salary": "string",
      "publishDate": "2026-06-12T00:00:00.000Z"
    }
  ]
}
```
