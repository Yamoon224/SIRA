# API Doc — entreprises/[slug] (app/(protected))

## Contexte
Cette page détail d’entreprise charge les informations d’une entreprise, ses offres associées et les éléments de présentation.

Base URL : `NEXT_PUBLIC_BACKEND_URL` (par défaut `https://goriya-api.lunion-lab.com`)

## Endpoints utilisés

### 1) Détail entreprise
- Méthode : `GET`
- Endpoint : `/companies/:id`

### 2) Offres de l’entreprise
- Méthode : `GET`
- Endpoint : `/companies/:id/jobs`

#### Réponse attendue
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "location": "string",
      "type": "CDI",
      "duration": "string",
      "salary": "string"
    }
  ]
}
```
