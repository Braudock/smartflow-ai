# Entrega do Projeto SmartFlow AI

## Local do projeto

```text
C:\CODEX\smartflow-ai
```

## URLs

```text
App publicado:
https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app

Repositorio GitHub:
https://github.com/Braudock/smartflow-ai

Firebase Console:
https://console.firebase.google.com/project/gen-lang-client-0013019253/overview
```

## Projeto Firebase

```text
Nome: APIPSICOLOGIA
Project ID: gen-lang-client-0013019253
Backend App Hosting: smartflow-ai
Regiao: us-central1
```

## Comandos principais

```powershell
cd C:\CODEX\smartflow-ai
npm install
npm run dev
npm run build
firebase deploy --only apphosting:smartflow-ai
```

## Status atual

- Projeto Next.js salvo localmente.
- Documentacao salva em `docs`.
- Repositorio Git configurado e enviado ao GitHub.
- Firebase App Hosting configurado.
- Deploy publicado e validado com HTTP 200.
- `/api/health` publicado e respondendo.

## Pendencias para ativar Gemini/OAuth

Configure estes secrets reais no Firebase App Hosting ou Secret Manager:

```text
GEMINI_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
AUTH_SECRET
```

Depois disso, adicione a URL de callback no Google OAuth:

```text
https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app/api/auth/callback/google
```
