# API Doc — dashboard (app/(protected))

## Contexte
La page tableau de bord consomme les statistiques utilisateur et les éléments récents liés aux candidatures et offres.

Base URL : `NEXT_PUBLIC_BACKEND_URL` (par défaut `https://goriya-api.lunion-lab.com`)

## Endpoints utilisés

### 1) Statistiques du tableau de bord
- Méthode : `GET`
- Endpoint : `/dashboard/stats`

#### Réponse attendue
```json
{
  "success": true,
  "data": {
    "totalApplications": 45,
    "interviews": 18,
    "profileViews": 127,
    "savedJobs": 12
  }
}
```

### 2) Candidatures récentes
- Méthode : `GET`
- Endpoint : `/dashboard/recent-applications`

#### Query params
| Nom | Type | Obligatoire | Description |
|---|---:|---:|---|
| limit | number | non | Nombre d’éléments à retourner |

### 3) Offres recommandées
- Méthode : `GET`
- Endpoint : `/dashboard/recommended-jobs`

### 4) Vues du profil
- Méthode : `GET`
- Endpoint : `/dashboard/profile-views`

#### Query params
| Nom | Type | Obligatoire | Description |
|---|---:|---:|---|
| days | number | non | Période de calcul (ex. 30 jours) |
