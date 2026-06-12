# API Doc — explorer-emplois

## Contexte
Cette page utilise l’API des offres d’emploi pour lister les postes disponibles et afficher les détails de chaque emploi.

Base URL : `NEXT_PUBLIC_BACKEND_URL` (par défaut `https://goriya-api.lunion-lab.com`)

## Endpoints à utiliser

### 1) Lister les offres d’emploi
- Méthode : `GET`
- Endpoint : `/job-offers/paginate`
- Usage côté client : `jobService.getJobs(filters)`

#### Query params
| Nom | Type | Obligatoire | Description |
|---|---:|---:|---|
| search | string | non | Recherche par intitulé, entreprise ou mot-clé |
| location | string | non | Ville / région |
| jobType | string[] | non | Types de contrat |
| experience | string[] | non | Niveaux d’expérience |
| salary | string[] | non | Plages salariales |
| page | number | non | Page courante |
| limit | number | non | Taille de page |

Exemple
```http
GET /job-offers/paginate?search=developpeur&location=Abidjan&page=1&limit=12
```

#### Réponse attendue
```json
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "location": "string",
      "type": "CDI",
      "experience": "Junior",
      "salary": "string",
      "description": "string",
      "requirements": ["string"],
      "publishDate": "2026-06-12T00:00:00.000Z",
      "company": {
        "id": "string",
        "name": "string",
        "logo": "string | null"
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 12,
    "totalPages": 5
  }
}
```

### 2) Détail d’une offre
- Méthode : `GET`
- Endpoint : `/job-offers/:id`
- Usage côté client : `jobService.getJobById(id)`

Exemple
```http
GET /job-offers/123
```

#### Réponse attendue
```json
{
  "success": true,
  "message": "Offre chargée",
  "data": {
    "id": "string",
    "title": "string",
    "location": "string",
    "type": "CDI",
    "salary": "string",
    "description": "string",
    "requirements": ["string"],
    "benefits": "string",
    "company": {
      "id": "string",
      "name": "string",
      "logo": "string | null"
    }
  }
}
```

### 3) Postuler à une offre
- Méthode : `POST`
- Endpoint : `/job-offers/:id/apply`
- Usage côté client : `jobService.applyToJob(jobId, payload)`

#### Payload
```json
{
  "coverLetter": "string",
  "resumeUrl": "string"
}
```

#### Réponse attendue
```json
{
  "success": true,
  "message": "Candidature envoyée",
  "data": {
    "id": "string",
    "status": "PENDING",
    "candidateName": "string",
    "candidateEmail": "string"
  }
}
```
