# Ambientes

## Local

```text
http://localhost:3000
```

Usado para desenvolvimento e teste inicial.

## Sandbox

```text
Nao ativo neste momento.
```

Quando criado, deve usar projeto, OAuth, secrets e Firestore separados.

## Producao

```text
https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app
```

ou dominio futuro:

```text
https://app.smartflowai.com.br
```

## Variaveis por ambiente

Cada ambiente deve ter sua propria chave Gemini, OAuth e URL `AUTH_URL`.

Variaveis de producao atuais:

```text
AUTH_URL=https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app
VERTEX_AI_LOCATION=us-central1
GOOGLE_OAUTH_SCOPES=openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar.events
```

Secrets de producao no App Hosting:

```text
gemini-api-key
google-client-id
google-client-secret
auth-secret
```
