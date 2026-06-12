# API Doc — explorer-entreprises

## Contexte
Cette page peut récupérer les entreprises via l’API backend existante déjà utilisée par le client.

Base URL : `NEXT_PUBLIC_BACKEND_URL` (par défaut `https://goriya-api.lunion-lab.com`)

## Endpoints à utiliser

### 1) Lister les entreprises
- Méthode : `GET`
- Endpoint : `/companies/paginate`
- Usage côté client : `companyService.getCompanies(filters)`

#### Query params (payload de filtrage)
| Nom | Type | Obligatoire | Description |
|---|---:|---:|---|
| search | string | non | Recherche libre par nom / secteur / ville |
| industry | string[] | non | Liste des secteurs d’activité |
| size | string[] | non | Tailles d’entreprise |
| location | string[] | non | Localisations |
| page | number | non | Numéro de page |
| limit | number | non | Nombre d’éléments par page |

Exemple
```http
GET /companies/paginate?search=tech&page=1&limit=12
```

#### Réponse attendue
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "sector": "string",
      "logo": "string | null",
      "coverImage": "string | null",
      "location": "string | null",
      "country": "string | null",
      "companySize": "string | null",
      "website": "string | null",
      "email": "string | null",
      "phone": "string | null",
      "status": "string",
      "createdAt": "2026-06-12T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 120,
    "page": 1,
    "limit": 12,
    "totalPages": 10
  }
}
```

### 2) Détail d’une entreprise
- Méthode : `GET`
- Endpoint : `/companies/:id`
- Usage côté client : `companyService.getCompanyById(id)`

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
    "country": "string | null",
    "headquarters": "string | null",
    "email": "string | null",
    "phone": "string | null"
  }
}
```

### 3) Offres d’une entreprise
- Méthode : `GET`
- Endpoint : `/companies/:id/jobs`
- Usage côté client : `companyService.getCompanyJobs(companyId)`

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
      "type": "CDI | CDD | Stage | Freelance",
      "salary": "string",
      "publishDate": "2026-06-12T00:00:00.000Z",
      "company": {
        "id": "string",
        "name": "string",
        "logo": "string | null"
      }
    }
  ]
}
```
