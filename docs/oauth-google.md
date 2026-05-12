# OAuth Google

Cliente de producao iniciado:

```text
oauth-smartflow-automacoes-prod
```

## Desenvolvimento local

Origem JavaScript autorizada:

```text
http://localhost:3000
```

URI de redirecionamento:

```text
http://localhost:3000/api/auth/callback/google
```

## Producao Firebase App Hosting

URLs configuradas:

```text
https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app
https://smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app/api/auth/callback/google
```

Dominio autorizado no Firebase Auth:

```text
smartflow-ai--gen-lang-client-0013019253.us-central1.hosted.app
```

O frontend usa Firebase Auth com `signInWithPopup`. As rotas `/api/auth/google` e `/api/auth/callback/google` ficam mantidas para o fluxo OAuth server-side e verificacoes tecnicas.

## Escopos iniciais

Usar o menor acesso possivel:

- `openid`
- `email`
- `profile`
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/calendar.events`

## Usuario autorizado no app

O frontend limita acesso por e-mail em `AUTHORIZED_EMAILS`, dentro de `src/tdah/App.tsx`.

E-mail autorizado atualmente:

```text
braudock@gmail.com
```
