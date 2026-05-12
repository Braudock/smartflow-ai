# GitHub

Repositorio recomendado:

```text
smartflow-ai
```

## Deve entrar no GitHub

- Codigo do app.
- Documentacao em `docs/`.
- `.env.example`.
- `package.json` e `package-lock.json`.

## Nao deve entrar

- `.env.local`.
- Chaves reais.
- Client Secret real.
- Arquivos `client_secret*.json`.
- Arquivos de conta de servico.

## Primeiro envio sugerido

```bash
git init
git add .
git commit -m "Cria base inicial do SmartFlow AI"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/smartflow-ai.git
git push -u origin main
```
