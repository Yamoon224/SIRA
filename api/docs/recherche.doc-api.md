# API Doc — recherche

## Contexte
La page de recherche s’appuie sur l’API des offres d’emploi avec filtres et pagination.

Base URL : `NEXT_PUBLIC_BACKEND_URL` (par défaut `https://goriya-api.lunion-lab.com`)

## Endpoint principal

### Lister les offres selon les filtres
- Méthode : `GET`
- Endpoint : `/job-offers/paginate`

#### Query params
| Nom | Type | Obligatoire | Description |
|---|---:|---:|---|
| search | string | non | Mot-clé de recherche |
| location | string | non | Ville / région |
| jobType | string[] | non | CDI, CDD, Stage, Freelance |
| experience | string[] | non | Junior, Confirmé, Senior |
| salary | string[] | non | Tranche salariale |
| page | number | non | Numéro de page |
| limit | number | non | Taille de la page |

Exemple
```http
GET /job-offers/paginate?search=dev&location=Abidjan&jobType=CDI&page=1&limit=10
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
      "publishDate": "2026-06-12T00:00:00.000Z",
      "company": {
        "id": "string",
        "name": "string",
        "logo": "string | null"
      }
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```
