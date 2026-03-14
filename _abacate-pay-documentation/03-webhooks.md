# Webhooks — API v1

> **Aviso:** Estes webhooks são referentes à API v1. Para a versão atual (v2), consulte a documentação de Webhooks v2 na documentação oficial.

Pense nos webhooks como **"mensagens enviadas pela AbacatePay para o seu sistema"**, sem que você precise ficar consultando a API o tempo todo.

## Como funciona

1. Você cadastra uma URL no dashboard da AbacatePay
2. A AbacatePay dispara requisições `POST` para essa URL sempre que algo importante acontece
3. Seu backend processa o evento e responde com `200 OK` quando tudo estiver certo

---

## Estrutura geral do payload v1

Na v1, o formato geral do payload segue a mesma ideia da v2, mas **sem o campo `apiVersion`**:

```json
{
  "event": "billing.paid",
  "devMode": false,
  "data": {
    "id": "bill_123456",
    "amount": 10000,
    "status": "PAID",
    "customer": {
      "id": "cust_123",
      "email": "customer@example.com"
    }
  }
}
```

### Campos principais

| Campo | Descrição |
|-------|-----------|
| `event` | Nome do evento disparado |
| `devMode` | Indica se o evento veio de ambiente de testes |
| `data` | Objeto com os detalhes do recurso afetado (cobrança, pagamento, assinatura, etc.) |

---

## Eventos comuns na v1

| Evento | Descrição |
|--------|-----------|
| `billing.created` | Quando uma cobrança/checkout é criada |
| `billing.paid` | Quando um pagamento é concluído com sucesso |
| `billing.refunded` | Quando um pagamento é totalmente reembolsado |
| `billing.failed` | Quando uma tentativa de pagamento falha |
| `subscription.created` | Quando uma assinatura é criada |
| `subscription.canceled` | Quando uma assinatura é cancelada |

> **Nota:** A lista exata de eventos pode variar conforme a época em que sua integração foi feita. Use estes nomes como referência e adapte para os eventos que você já recebe hoje no seu sistema.

---

## Exemplo de webhook `billing.paid` (v1)

```json
{
  "event": "billing.paid",
  "devMode": false,
  "data": {
    "id": "bill_abc123",
    "externalId": "pedido-123",
    "amount": 10000,
    "paidAmount": 10000,
    "status": "PAID",
    "customer": {
      "id": "cust_abc123",
      "email": "customer@example.com"
    },
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:05:00.000Z"
  }
}
```

---

## Segurança dos webhooks (v1)

Na v1 você pode (e **deve**) aplicar as mesmas recomendações da v2:

- Usar um **secret** na URL do webhook
- Validar uma assinatura **HMAC** no header (quando disponível)
- Processar cada evento de forma **idempotente**

### Fluxo típico de validação

1. Sua URL de webhook é algo como:
   ```
   https://meusite.com/webhooks/abacatepay?webhookSecret=SEU_SECRET
   ```
2. No backend, você confere o `webhookSecret` da query string
3. Em seguida, valida a assinatura HMAC do corpo (caso esteja habilitada)
4. Só depois disso você processa o evento e responde com `200 OK`

---

## Boas práticas para consumir webhooks v1

- Responda sempre com `200 OK` após processar o evento com sucesso
- Implemente **idempotência** — o mesmo evento pode ser entregue mais de uma vez
- Registre **logs** de todos os payloads recebidos
- Não dependa de validação rígida de schema — mantenha o consumo tolerante a mudanças
- Sempre trate o corpo como **append-only**: novos campos podem ser adicionados sem aviso

---

## Recomendações para integrações legadas

- Use o campo `event` como chave principal de roteamento interno
- Registre logs dos payloads recebidos para facilitar migrações futuras para a v2

### Planejando migrar para a v2?

1. Mapeie quais eventos v1 você já consome hoje
2. Consulte a documentação de Webhooks v2 para encontrar os equivalentes
3. Crie uma camada interna que traduza eventos v1 → v2 enquanto você atualiza sua lógica
