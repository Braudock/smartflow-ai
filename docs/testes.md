# Testes

## Build local

```bash
npm run typecheck
npm run build
```

## Health check

```bash
curl http://localhost:3000/api/health
```

Producao:

```bash
curl https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app/api/health
```

## Gemini

```bash
curl -X POST http://localhost:3000/api/gemini/process ^
  -H "content-type: application/json" ^
  -d "{\"text\":\"Ir para o armazem do MercadoLivre BRSP-04 as 23:00\"}"
```

Producao:

```bash
curl -X POST https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app/api/gemini/process ^
  -H "content-type: application/json" ^
  -d "{\"text\":\"Ir para o armazem do MercadoLivre BRSP-04 as 23:00\"}"
```

A resposta deve conter:

```text
ok=true
data.local
data.mapsUrl
data.wazeUrl
```

## OAuth

Abrir:

```text
http://localhost:3000/api/auth/google
```

O callback esperado e:

```text
http://localhost:3000/api/auth/callback/google
```

Producao:

```text
https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app/api/auth/google
https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app/api/auth/callback/google
```

## Frontend mobile

Checklist visual no celular:

- Header em duas linhas: logo/acoes em cima, abas embaixo.
- Aba `Hoje` nao deve espremer o logo.
- Botao flutuante `+` abre Captura.
- Card com local deve mostrar botoes `Maps` e `Waze`.
- Texto do card deve quebrar linha sem sair da area branca.

## Microfone

Checklist manual no Chrome mobile:

- Abrir a aba Captura.
- Tocar no botao de microfone.
- Falar por mais tempo, incluindo pausas curtas.
- Confirmar que o texto continua acumulando.
- Tocar no microfone novamente para parar.
