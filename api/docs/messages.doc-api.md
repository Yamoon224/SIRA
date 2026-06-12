# API Doc — messages (app/(protected))

## Contexte
La page de messagerie utilise les conversations et messages de l’utilisateur. Elle dispose d’un fallback de secours sur plusieurs variantes d’endpoint.

Base URL : `NEXT_PUBLIC_BACKEND_URL` (par défaut `https://goriya-api.lunion-lab.com`)

## Endpoints utilisés

### 1) Lister les conversations
- Méthode : `GET`
- Endpoint : `/messages/conversations` (fallback : `/conversations`, `/message/conversations`)

### 2) Lister les messages d’une conversation
- Méthode : `GET`
- Endpoint : `/messages/conversations/:conversationId/messages` (fallback : `/conversations/:conversationId/messages`, `/message/conversations/:conversationId/messages`)

### 3) Envoyer un message
- Méthode : `POST`
- Endpoint : `/messages/conversations/:conversationId/messages` (fallback : `/conversations/:conversationId/messages`, `/message/conversations/:conversationId/messages`)

#### Payload
```json
{
  "content": "string"
}
```

### 4) Marquer une conversation comme lue
- Méthode : `PUT`
- Endpoint : `/messages/conversations/:conversationId/read` (fallback : `/conversations/:conversationId/read`, `/message/conversations/:conversationId/read`)

### 5) Créer une conversation
- Méthode : `POST`
- Endpoint : `/messages/conversations` (fallback : `/conversations`, `/message/conversations`)

#### Payload
```json
{
  "participantId": "string"
}
```
