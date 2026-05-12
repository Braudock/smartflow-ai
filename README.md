# SmartFlow AI

App SmartFlow AI / 2o Cerebro TDAH publicado em Firebase App Hosting com login Google, Firestore, Vertex AI/Gemini, Google Maps e Waze.

URL publicada:

```text
https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app
```

Repositorio:

```text
https://github.com/Braudock/smartflow-ai
```

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
- `/api/gemini/process` processa capturas do app com Vertex AI/Gemini e retorna local, Google Maps e Waze quando houver endereco.
- `/api/health` verifica configuracao basica.
- `/api/gemini/test` testa Vertex AI/Gemini via POST.
- `/api/auth/google` inicia OAuth Google.
- `/api/auth/callback/google` recebe retorno OAuth Google.

## Frontend

O frontend original do AI Studio foi portado para `src/tdah` e carregado por `src/app/page.tsx`.

Funcionalidades publicadas:

- Login Google com Firebase Auth.
- Captura de tarefas, compromissos, compras, lembretes e ideias.
- Sincronizacao em Firestore.
- Dashboard, Hoje, Historico e Modo Foco.
- Botao flutuante `+` abrindo a aba Captura.
- Cards mobile ajustados para nao ficarem espremidos.
- Acoes de local com botoes `Maps` e `Waze`.

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
5. Em `apphosting.yaml`, confirme `AUTH_URL` e `VERTEX_AI_LOCATION`.
6. No Google Cloud Console, adicione a URL de callback OAuth:

```text
https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app/api/auth/callback/google
```

Para publicar App Hosting e regras do Firestore:

```bash
firebase deploy --only firestore,apphosting:smartflow-ai
```

O App Hosting roda `npm run build` com `next build`; este projeto nao usa pasta `dist`.
