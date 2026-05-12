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
firebase deploy --only firestore,apphosting:smartflow-ai
```

## Status atual

- Projeto Next.js salvo localmente.
- Documentacao salva em `docs`.
- Repositorio Git configurado e enviado ao GitHub.
- Firebase App Hosting configurado.
- Deploy publicado e validado com HTTP 200.
- `/api/health` publicado e respondendo.
- Secrets de Gemini e OAuth configurados no Secret Manager.
- Gemini validado em `/api/gemini/process`.
- App Hosting usa Vertex AI com a service account `firebase-app-hosting-compute@gen-lang-client-0013019253.iam.gserviceaccount.com`.
- Inicio do login Google validado com redirecionamento OAuth.
- Frontend original do AI Studio incorporado ao Next.js em `src/tdah`.
- Interface publicada como app `2o Cerebro TDAH`, com captura, hoje, dashboard, historico e modo foco.
- Regras do Firestore copiadas e publicadas para o banco `ai-studio-86450f86-9de0-45ef-bf17-0a8402310807`.
- Rota `/api/gemini/process` criada para usar Gemini no servidor sem expor a chave no navegador.

## Gemini/OAuth

Secrets configurados no Firebase App Hosting:

```text
GEMINI_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
AUTH_SECRET
```

URL de callback adicionada no OAuth Google:

```text
https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app/api/auth/callback/google
```

Observacao: a tela de consentimento OAuth pode limitar logins enquanto o app estiver em modo de teste ou sem verificacao do Google.

## Pasta completa

Uma copia do projeto, sem `node_modules`, `.next` e `.git`, fica em:

```text
C:\CODEX\SMARTFLOW_AI_PROJETO_COMPLETO_2026-05-12
```
