# API Doc — notifications (app/(protected))

## Contexte
Cette page gère l’accessibilité des notifications et les préférences utilisateur liées aux applications et offres.

Base URL : `NEXT_PUBLIC_BACKEND_URL` (par défaut `https://goriya-api.lunion-lab.com`)

## Endpoints utilisés

### 1) Lister les notifications
- Méthode : `GET`
- Endpoint : `/notifications`

### 2) Marquer une notification comme lue
- Méthode : `PUT`
- Endpoint : `/notifications/:notificationId/read`

### 3) Marquer toutes les notifications comme lues
- Méthode : `PUT`
- Endpoint : `/notifications/read-all`

### 4) Mettre à jour les préférences de notification
- Méthode : `PUT`
- Endpoint : `/notifications/settings`

#### Payload
```json
{
  "applications": true,
  "emplois": true,
  "recommandations": false
}
```
