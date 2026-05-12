# SmartFlow AI

App SmartFlow AI / 2o Cerebro TDAH publicado em Firebase App Hosting com login Google, Firestore e Gemini.

## Como rodar localmente

```bash
npm install
npm run dev
```

Depois abra:

```text
http://localhost:3000
```

## Variaveis

Copie `.env.example` para `.env.local` e preencha somente no computador local ou no Firebase App Hosting.

Nunca commite `.env.local`, chaves reais, `client_secret*.json` ou arquivos de conta de servico.

## Rotas principais

- `/` frontend principal do app 2o Cerebro TDAH.
- `/api/gemini/process` processa capturas do app com Gemini.
- `/api/health` verifica configuracao basica.
- `/api/gemini/test` testa Gemini via POST.
- `/api/auth/google` inicia OAuth Google.
- `/api/auth/callback/google` recebe retorno OAuth Google.

## Deploy no Firebase App Hosting

Este app e Next.js com rotas API. Por isso, use Firebase App Hosting, nao apenas Firebase Hosting estatico.

1. Crie ou conecte o repositorio GitHub `smartflow-ai`.
2. No Firebase Console, abra o projeto e entre em App Hosting.
3. Crie um backend conectado ao repositorio e branch principal.
4. Crie os secrets no Google Cloud Secret Manager:
   - `gemini-api-key`
   - `google-client-id`
   - `google-client-secret`
   - `auth-secret`
5. Em `apphosting.yaml`, troque `AUTH_URL` pela URL real do backend Firebase.
6. No Google Cloud Console, adicione a URL de callback OAuth:

```text
https://SEU-BACKEND.web.app/api/auth/callback/google
```

Para publicar App Hosting e regras do Firestore:

```bash
firebase deploy --only firestore,apphosting:smartflow-ai
```

O App Hosting roda `npm run build` com `next build`; este projeto nao usa pasta `dist`.
