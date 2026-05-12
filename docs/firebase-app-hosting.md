# Firebase App Hosting

## Deploy inicial

1. Criar repositorio GitHub `smartflow-ai`.
2. Enviar o codigo.
3. Fazer login no Firebase CLI.
4. Criar um backend App Hosting pelo CLI ou pelo Firebase Console.
5. Criar os secrets no Google Cloud Secret Manager.
6. Atualizar `AUTH_URL` em `apphosting.yaml` com a URL publica gerada.
7. Atualizar OAuth Google com a URL publica.

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
firebase deploy --only apphosting:smartflow-ai
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

## Variaveis

```text
AUTH_URL=https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app
GOOGLE_OAUTH_SCOPES=openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar.events
```

## Callback OAuth

```text
https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app/api/auth/callback/google
```
