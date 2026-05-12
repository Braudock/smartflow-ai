# APIs

## Gemini

Rota local:

```text
POST /api/gemini/test
```

Usa `GEMINI_API_KEY`.

## OAuth Google

Rotas locais:

```text
GET /api/auth/google
GET /api/auth/callback/google
```

Usa:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
AUTH_SECRET
AUTH_URL
```

## Google APIs previstas

- Gmail: enviar e-mail primeiro com `gmail.send`.
- Drive: arquivos criados pelo app com `drive.file`.
- Sheets: logs e grid operacional com `spreadsheets`.
- Calendar: eventos com `calendar.events`.

As rotas operacionais dessas APIs devem ser criadas depois que o login OAuth estiver validado.
