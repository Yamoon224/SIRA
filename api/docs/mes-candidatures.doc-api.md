# API Doc — mes-offres / mes candidatures (app/(protected))

## Contexte
Cette page liste les candidatures de l’utilisateur et permet de filtrer selon leur statut.

Base URL : `NEXT_PUBLIC_BACKEND_URL` (par défaut `https://goriya-api.lunion-lab.com`)

## Endpoints utilisés

### 1) Lister les candidatures
- Méthode : `GET`
- Endpoint : `/candidatures/paginate`

#### Query params
| Nom | Type | Obligatoire | Description |
|---|---:|---:|---|
| status | string | non | `pending`, `reviewed`, `interview`, `accepted`, `rejected` |

#### Réponse attendue
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "jobTitle": "string",
      "company": "string",
      "location": "string",
      "type": "CDI",
      "salary": "string",
      "status": "pending",
      "appliedDate": "2026-06-12"
    }
  ]
}
```

### 2) Détail d’une candidature
- Méthode : `GET`
- Endpoint : `/candidatures/:id`

### 3) Retirer une candidature
- Méthode : `DELETE`
- Endpoint : `/candidatures/:id`
