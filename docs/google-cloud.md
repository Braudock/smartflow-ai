# Google Cloud

Projeto em uso:

| Ambiente | Projeto | ID |
|---|---|---|
| Producao | APIPSICOLOGIA / SmartFlow AI | gen-lang-client-0013019253 |

APIs usadas/publicadas:

- Vertex AI API
- Firebase App Hosting
- Firestore
- Firebase Auth / Identity Toolkit
- Secret Manager

APIs com escopo OAuth preparado:

- Gmail API
- Google Drive API
- Google Sheets API
- Google Calendar API

## Vertex AI

Gemini em producao usa Vertex AI com:

```text
model: gemini-2.5-flash
location: us-central1
```

Service account autorizada:

```text
firebase-app-hosting-compute@gen-lang-client-0013019253.iam.gserviceaccount.com
```

Permissao:

```text
roles/aiplatform.user
```
