# Arquitetura

O SmartFlow AI / 2o Cerebro TDAH e um app Next.js publicado no Firebase App Hosting.

## Camadas

- Shell Next.js: `src/app/page.tsx`.
- Frontend principal: `src/tdah/App.tsx`.
- Componentes do app: `src/tdah/components`.
- Firebase cliente: `src/tdah/services/firebase.ts`.
- Cliente Gemini do frontend: `src/tdah/services/geminiService.ts`.
- APIs internas: `src/app/api/**/route.ts`.
- Configuracao de ambiente: `src/lib/env.ts`.
- OAuth Google: `src/lib/oauth.ts`.
- Regras Firestore: `firestore.rules`.
- Configuracao App Hosting: `apphosting.yaml`.
- Documentacao operacional: `docs/`.

## Fluxo principal

1. Usuario entra pelo Firebase Auth com Google.
2. Frontend salva e sincroniza dados no Firestore.
3. Usuario captura um texto na aba Captura.
4. `src/tdah/services/geminiService.ts` chama `/api/gemini/process`.
5. A rota server-side chama Vertex AI/Gemini.
6. A resposta volta com tipo, prioridade, insight, data, local, `mapsUrl` e `wazeUrl`.
7. `RecordItem` mostra a tarefa e os botoes `Maps`, `Waze`, `+ Agenda` e `Focar`.

## Principios

- Separar SANDBOX e PRODUCAO quando houver ambiente secundario ativo.
- Nunca misturar chaves de teste com producao.
- Usar o menor escopo OAuth possivel.
- Validar localmente antes de publicar no Firebase App Hosting.
- Nao expor chaves Gemini no navegador.
- Usar Vertex AI no servidor para IA de producao.
- Manter Firestore como fonte principal de registros do app.
