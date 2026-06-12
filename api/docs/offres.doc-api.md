# API Doc — offres

## Contexte
La page des offres présente les plans et peut appeler l’API d’offres d’emploi pour lister les postes et les candidatures.

Base URL : `NEXT_PUBLIC_BACKEND_URL` (par défaut `https://goriya-api.lunion-lab.com`)

## Endpoints

### 1) Lister les offres d’emploi
- Méthode : `GET`
- Endpoint : `/job-offers/paginate`

#### Query params
| Nom | Type | Obligatoire | Description |
|---|---:|---:|---|
| page | number | non | Numéro de page |
| limit | number | non | Taille de page |
| search | string | non | Recherche libre |

Exemple
```http
GET /job-offers/paginate?page=1&limit=6
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
      "salary": "string",
      "publishDate": "2026-06-12T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 6,
    "page": 1,
    "limit": 6,
    "totalPages": 1
  }
}
```

### 2) Sauvegarder / retirer une offre
- Méthode : `POST` / `DELETE`
- Endpoint : `/job-offers/:id/save`

#### Réponse attendue
```json
{
  "success": true,
  "message": "Offre enregistrée / retirée",
  "data": null
}
```
