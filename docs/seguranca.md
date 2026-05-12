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
3. Testar Gemini e Google APIs.
4. Desativar a chave antiga.
5. Excluir a chave antiga apos validacao.

## Vazamento

1. Revogar a chave imediatamente.
2. Criar uma nova chave.
3. Atualizar variaveis.
4. Verificar logs e faturamento.
5. Revisar acessos IAM.
