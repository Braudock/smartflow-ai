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

## Secrets

```text
gemini-api-key
google-client-id
google-client-secret
auth-secret
```

## Variaveis

```text
AUTH_URL=https://SEU-PROJETO.web.app
GOOGLE_OAUTH_SCOPES=openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar.events
```

## Callback OAuth

```text
https://SEU-PROJETO.web.app/api/auth/callback/google
```
