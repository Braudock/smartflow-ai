# Firebase App Hosting

## Estado atual

Backend publicado:

```text
smartflow-ai
```

URL:

```text
https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app
```

Regiao:

```text
us-central1
```

Projeto Firebase:

```text
gen-lang-client-0013019253
```

## Comando pelo CLI

Depois de rodar `firebase login`, execute:

```powershell
.\scripts\create-apphosting-backend.ps1 -ProjectId "SEU_PROJECT_ID"
```

O script cria o backend `smartflow-ai` na regiao `us-central1`. Para trocar:

```powershell
.\scripts\create-apphosting-backend.ps1 -ProjectId "SEU_PROJECT_ID" -Backend "smartflow-ai" -Region "southamerica-east1"
```

## Deploy local

Este repositorio ja contem `firebase.json` apontando para o backend `smartflow-ai`.

```powershell
firebase deploy --only firestore,apphosting:smartflow-ai --project gen-lang-client-0013019253
```

Use apenas App Hosting quando nao houver mudanca em regras do Firestore:

```powershell
firebase deploy --only apphosting:smartflow-ai --project gen-lang-client-0013019253
```

## Secrets

Secrets configurados para producao:

```text
gemini-api-key
google-client-id
google-client-secret
auth-secret
```

O backend `smartflow-ai` tem permissao de leitura nesses secrets.

Observacao: Gemini em producao esta funcionando via Vertex AI e service account. `gemini-api-key` fica mantido como secret/fallback.

## Service account Vertex AI

Service account do App Hosting:

```text
firebase-app-hosting-compute@gen-lang-client-0013019253.iam.gserviceaccount.com
```

Permissao necessaria:

```text
roles/aiplatform.user
```

## Variaveis

```text
AUTH_URL=https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app
VERTEX_AI_LOCATION=us-central1
GOOGLE_OAUTH_SCOPES=openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar.events
```

## Callback OAuth

```text
https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app/api/auth/callback/google
```

## Frontend publicado

`src/app/page.tsx` carrega `src/tdah/App.tsx` sem SSR. O app publicado inclui:

- Login Google.
- Captura e processamento Gemini.
- Firestore offline/cache.
- Dashboard, Hoje, Historico e Modo Foco.
- Layout mobile corrigido.
- Botoes Maps/Waze nos cards com local.
