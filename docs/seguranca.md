# Seguranca

## Nunca commitar

- Chaves Gemini reais.
- Client Secret real.
- Arquivos `client_secret*.json`.
- Arquivos de conta de servico.
- `.env.local`.
- Tokens, senhas ou dumps de credenciais.

## Rotacao de chaves

A cada 90 dias:

1. Criar uma nova chave.
2. Atualizar Firebase App Hosting e ambiente local.
3. Testar `/api/health`, `/api/gemini/process` e login Google.
4. Desativar a chave antiga.
5. Excluir a chave antiga apos validacao.

## Vertex AI

Gemini de producao usa Vertex AI com a service account do App Hosting, nao uma chave exposta no navegador.

Service account:

```text
firebase-app-hosting-compute@gen-lang-client-0013019253.iam.gserviceaccount.com
```

Permissao minima:

```text
roles/aiplatform.user
```

Nao commitar credenciais de service account. O App Hosting deve usar Application Default Credentials.

## Firebase client config

`firebase-applet-config.json` contem configuracao publica do app web Firebase. Essa chave identifica o app cliente, mas nao substitui regras de seguranca. A protecao real fica em:

- Firebase Auth.
- `firestore.rules`.
- lista `AUTHORIZED_EMAILS` no frontend.

## Vazamento

1. Revogar a chave imediatamente.
2. Criar uma nova chave.
3. Atualizar variaveis.
4. Verificar logs e faturamento.
5. Revisar acessos IAM.
6. Conferir se App Hosting continua com acesso a Secret Manager e Vertex AI.
