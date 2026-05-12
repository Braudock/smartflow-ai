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

Depois do deploy, trocar `SEU-PROJETO` pela URL real:

```text
https://SEU-PROJETO.web.app
https://SEU-PROJETO.web.app/api/auth/callback/google
```

## Escopos iniciais

Usar o menor acesso possivel:

- `openid`
- `email`
- `profile`
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/calendar.events`
