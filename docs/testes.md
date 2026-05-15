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
  -d "{\"text\":\"Ir para o armazem do MercadoLivre BRSP-04 as 23:00\",\"timeZone\":\"America/Sao_Paulo\"}"
```

Producao:

```bash
curl -X POST https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app/api/gemini/process ^
  -H "content-type: application/json" ^
  -d "{\"text\":\"Ir para o armazem do MercadoLivre BRSP-04 as 23:00\",\"timeZone\":\"America/Sao_Paulo\"}"
```

A resposta deve conter:

```text
ok=true
data.local
data.mapsUrl
data.wazeUrl
data.dataHoraDetectada com offset local explicito
```

Teste especifico de fuso:

```bash
curl -X POST http://localhost:3000/api/gemini/process ^
  -H "content-type: application/json" ^
  -d "{\"text\":\"Compromisso hoje as 20h50\",\"timeZone\":\"America/Sao_Paulo\"}"
```

O horario retornado deve manter `20:50` no fuso local, por exemplo:

```text
2026-05-15T20:50:00-03:00
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

## Salvamento

Checklist manual:

- Entrar com a conta autorizada.
- Abrir Captura.
- Digitar um compromisso com horario e local.
- Tocar `SALVAR`.
- Confirmar que o app muda para Historico e o item aparece.
- Se o Calendar falhar, o registro ainda deve ficar salvo.
- Se Firestore falhar, o app deve mostrar mensagem de erro na aba Captura.

## Microfone

Checklist manual no Chrome mobile:

- Abrir a aba Captura.
- Tocar no botao de microfone.
- Falar por mais tempo, incluindo pausas curtas.
- Confirmar que o texto continua acumulando.
- Confirmar que as palavras/frases nao aparecem duplicadas depois de pausas.
- Colocar a aba em segundo plano e voltar; o microfone deve parar limpo em vez de travar a pagina.
- Tocar no microfone novamente para parar.

## Alerta forte de compromisso

Checklist manual no Chrome mobile:

- Criar uma captura com compromisso e local para 20 a 30 minutos no futuro.
- Manter o app aberto.
- Confirmar aviso de `Saida sugerida` com botoes `Abrir Maps` e `Abrir Waze`.
- Confirmar alerta `Falta pouco` nos 10 minutos finais.
- Confirmar que, no horario, abre o alerta em tela cheia `Alerta maximo`.
- Confirmar som repetido, vibracao e titulo da aba piscando.
- Confirmar que apos o horario o estado muda para `Atrasado`.
- Testar os botoes `Adiar 10 min`, `Vi o alerta`, `Focar agora` e `Marcar feito`.

Limite importante: sem push notification/service worker dedicado, navegadores moveis podem suspender JavaScript se o app estiver fechado, em segundo plano profundo ou com economia de bateria agressiva. O alerta forte atual e confiavel com o app aberto/ativo.
