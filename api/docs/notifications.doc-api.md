# API Doc — notifications

## Contexte
Cette page est actuellement alimentée par des données mockées côté front ; le backend à brancher serait un service de notifications utilisateur.

Base URL : `NEXT_PUBLIC_BACKEND_URL` (par défaut `https://goriya-api.lunion-lab.com`)

## Endpoints proposés

### 1) Lister les notifications utilisateur
- Méthode : `GET`
- Endpoint : `/notifications`

#### Réponse attendue
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "type": "job | message | system",
      "title": "string",
      "description": "string",
      "isRead": false,
      "createdAt": "2026-06-12T00:00:00.000Z"
    }
  ]
}
```

### 2) Marquer une notification comme lue
- Méthode : `PATCH`
- Endpoint : `/notifications/:id/read`

#### Réponse attendue
```json
{
  "success": true,
  "message": "Notification marquée comme lue",
  "data": null
}
```

### 3) Supprimer plusieurs notifications
- Méthode : `DELETE`
- Endpoint : `/notifications/bulk`

#### Payload
```json
{
  "ids": ["string"]
}
```
