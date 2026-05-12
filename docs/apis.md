# APIs

## Gemini

Rotas:

```text
POST /api/gemini/process
POST /api/gemini/test
```

`/api/gemini/process` e a rota usada pelo frontend. Ela recebe texto livre, chama Vertex AI/Gemini no servidor e retorna uma estrutura pronta para o app.

Exemplo de entrada:

```json
{
  "text": "Ir para o armazem do MercadoLivre BRSP-04 as 23:00"
}
```

Campos esperados na resposta:

```text
tipo
prioridade
conteudo
insight
tags
dataHoraDetectada
local
mapsUrl
wazeUrl
```

O App Hosting usa Vertex AI por Application Default Credentials com a service account:

```text
firebase-app-hosting-compute@gen-lang-client-0013019253.iam.gserviceaccount.com
```

Ela precisa manter permissao:

```text
roles/aiplatform.user
```

`GEMINI_API_KEY` continua configurada como secret legado/fallback, mas o caminho funcional de producao e Vertex AI.

## OAuth Google

Rotas locais:

```text
GET /api/auth/google
GET /api/auth/callback/google
```

Usa:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
AUTH_SECRET
AUTH_URL
```

Callback de producao:

```text
https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app/api/auth/callback/google
```

## Google APIs previstas

- Calendar: o app pode criar eventos quando ha token OAuth e data detectada.
- Gmail: escopo `gmail.send` reservado para envio futuro de e-mail.
- Drive: escopo `drive.file` reservado para arquivos criados pelo app.
- Sheets: escopo `spreadsheets` reservado para logs/grid operacional futuro.

## Firestore

O frontend sincroniza registros em:

```text
users/{uid}/records
users/{uid}/stats
users/{uid}/settings/general
```

Regras publicadas em:

```text
firestore.rules
```

Banco usado:

```text
ai-studio-86450f86-9de0-45ef-bf17-0a8402310807
```

## Maps e Waze

Quando `local` existe, a API gera:

```text
mapsUrl=https://www.google.com/maps/search/?api=1&query=...
wazeUrl=https://waze.com/ul?q=...
```

O componente `src/tdah/components/RecordItem.tsx` mostra os botoes `Maps` e `Waze`.
