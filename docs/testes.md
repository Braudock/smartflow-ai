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
- Confirmar que as palavras/frases nao aparecem duplicadas depois de pausas.
- Tocar no microfone novamente para parar.

## Alerta forte de compromisso

Checklist manual no Chrome mobile:

- Criar uma captura com compromisso para 1 ou 2 minutos no futuro.
- Manter o app aberto.
- Confirmar que aparece um aviso previo antes do horario.
- Confirmar que, no horario, abre uma tela vermelha `Alerta forte`.
- Confirmar som repetido e vibracao.
- Testar os botoes `Entendi`, `Focar agora` e `Marcar feito`.

Limite importante: sem push notification/service worker dedicado, navegadores moveis podem suspender JavaScript se o app estiver fechado, em segundo plano profundo ou com economia de bateria agressiva. O alerta forte atual e confiavel com o app aberto/ativo.
