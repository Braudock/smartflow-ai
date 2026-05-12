# Arquitetura

O SmartFlow AI comeca como um app Next.js no Firebase App Hosting.

## Camadas

- Interface: `src/app/page.tsx`.
- APIs internas: `src/app/api/**/route.ts`.
- Configuracao de ambiente: `src/lib/env.ts`.
- OAuth Google: `src/lib/oauth.ts`.
- Documentacao operacional: `docs/`.

## Principios

- Separar SANDBOX e PRODUCAO.
- Nunca misturar chaves de teste com producao.
- Usar o menor escopo OAuth possivel.
- Validar localmente antes de publicar no Firebase App Hosting.
- Guardar logs primeiro em Google Sheets e migrar para banco quando necessario.
