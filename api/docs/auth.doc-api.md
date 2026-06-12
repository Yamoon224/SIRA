# API Doc — authentification (app/auth/signin/page.tsx)

## Contexte
La page d’authentification permet la connexion, l’inscription et la vérification OTP ainsi que la connexion Google.

Base URL : `NEXT_PUBLIC_BACKEND_URL` (par défaut `https://goriya-api.lunion-lab.com`)

## Endpoints utilisés

### 1) Inscription
- Méthode : `POST`
- Endpoint : `/auth/register`

#### Payload
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "USER"
}
```

### 2) Connexion par email/mot de passe
- Méthode : `POST`
- Endpoint : `/auth/login`

#### Payload
```json
{
  "email": "string",
  "password": "string"
}
```

### 3) Vérification OTP
- Méthode : `POST`
- Endpoint : `/auth/verify-otp`

#### Payload
```json
{
  "email": "string",
  "otp": "string"
}
```

### 4) Connexion Google
- Méthode : `POST`
- Endpoint : `/auth/google`

#### Payload
```json
{
  "googleId": "string",
  "email": "string",
  "name": "string",
  "firstName": "string",
  "lastName": "string",
  "picture": "string"
}
```
