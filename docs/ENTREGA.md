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
- Layout mobile ajustado para nao espremer logo, abas e acoes.
- Cards com local agora exibem botoes `Maps` e `Waze`.
- Botao flutuante `+` abre a aba Captura.
- Microfone mantem a escuta ativa e reinicia automaticamente quando o navegador encerra uma sessao de fala.
- Transcricao do microfone deduplica trechos repetidos enviados pelo navegador.
- Microfone para limpo quando a aba fica oculta, evitando travamento do Chrome mobile.
- Horarios falados sao preservados no fuso local do navegador, evitando deslocamento indevido de horas.
- Compromissos disparam alertas em camadas: preparo, saida sugerida, falta pouco, horario exato e atraso.
- Alertas fortes agora ocupam a tela inteira, piscam o titulo da aba, repetem som/vibracao e destacam Maps/Waze quando houver local.
- Salvamento ficou tolerante a falha da IA/Calendar e mostra erro de sincronizacao quando Firestore falha.
- Commit da correcao mobile: `12d6c7d Improve mobile layout and map actions`.

## Frontend publicado

Arquivos principais:

```text
src/app/page.tsx
src/tdah/App.tsx
src/tdah/components/RecordItem.tsx
src/tdah/components/Dashboard.tsx
src/tdah/components/FocusMode.tsx
src/tdah/components/Logo.tsx
```

Melhorias de mobile:

```text
Header em duas linhas no celular.
Cards menos apertados.
Texto quebra linha dentro do card.
Maps e Waze aparecem como botoes clicaveis.
Microfone continua captando ate o usuario tocar novamente para parar.
Alertas mostram preparo, rota, contagem de urgencia e atraso enquanto o app estiver aberto/ativo.
```

## Gemini/OAuth

Secrets configurados no Firebase App Hosting:

```text
GEMINI_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
AUTH_SECRET
```

Gemini de producao:

```text
Vertex AI
Modelo: gemini-2.5-flash
Regiao: us-central1
Service account: firebase-app-hosting-compute@gen-lang-client-0013019253.iam.gserviceaccount.com
Permissao: roles/aiplatform.user
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

## Validacoes finais

```text
npm run typecheck: passou
npm run build: passou
Deploy Firebase App Hosting: passou
GET /: 200
POST /api/gemini/process: ok com mapsUrl e wazeUrl
POST /api/gemini/test: ok
Botao Salvar: registra primeiro no Firestore e cria Calendar em segundo plano.
POST /api/gemini/process: preserva 20h50 como 20:50 no fuso local, sem converter para 17:50.
```
