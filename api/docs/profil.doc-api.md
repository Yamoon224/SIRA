# API Doc — profil (app/(protected))

## Contexte
La page profil charge le profil utilisateur et permet la mise à jour des informations de base ainsi que l’upload d’avatar.

Base URL : `NEXT_PUBLIC_BACKEND_URL` (par défaut `https://goriya-api.lunion-lab.com`)

## Endpoints utilisés

### 1) Charger le profil utilisateur
- Méthode : `GET`
- Endpoint : `/user/profile` (fallback : `/auth/profile`)

#### Réponse attendue
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "avatar": "string | null",
    "title": "string",
    "location": "string",
    "phone": "string"
  }
}
```

### 2) Mettre à jour le profil
- Méthode : `PUT`
- Endpoint : `/user/profile`

#### Payload
```json
{
  "name": "string",
  "title": "string",
  "location": "string",
  "phone": "string"
}
```

### 3) Upload avatar
- Méthode : `POST`
- Endpoint : `/user/avatar`

#### Payload multipart/form-data
```text
avatar=<file>
```
