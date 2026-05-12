# Testes

## Health check

```bash
curl http://localhost:3000/api/health
```

## Gemini

```bash
curl -X POST http://localhost:3000/api/gemini/test ^
  -H "content-type: application/json" ^
  -d "{\"prompt\":\"Confirme a conexao do SmartFlow AI.\"}"
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
