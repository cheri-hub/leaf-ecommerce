# Autenticação

Todas as requisições à API da AbacatePay devem ser autenticadas usando uma chave de API (API Key) no formato **Bearer Token**.

## Header de Autenticação

Inclua o seguinte header em todas as requisições:

```
Authorization: Bearer <abacatepay-api-key>
```

Onde `<abacatepay-api-key>` é a sua chave de API obtida no dashboard da AbacatePay.

## Exemplo

```bash
curl --request GET \
  --url https://api.abacatepay.com/v1/customer/list \
  --header 'Authorization: Bearer sk_live_abc123...'
```

## Respostas de erro de autenticação

Caso a chave seja inválida ou ausente, a API retorna o status HTTP **401 Unauthorized**.

## Boas práticas

- **Nunca** exponha sua chave de API no frontend ou em repositórios públicos
- Use variáveis de ambiente para armazenar a chave
- Gere chaves separadas para ambientes de desenvolvimento e produção
- Revogue chaves comprometidas imediatamente no dashboard
