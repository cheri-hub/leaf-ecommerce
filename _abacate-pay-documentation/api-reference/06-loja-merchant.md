# Loja / Merchant — API Reference

## Obter detalhes da loja

Permite que você recupere os detalhes da sua conta/loja, incluindo informações de saldo.

```
GET /v1/store/get
```

### Autenticação

| Header | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `Authorization` | string | Sim | `Bearer <abacatepay-api-key>` |

### Exemplo de requisição

```bash
curl --request GET \
  --url https://api.abacatepay.com/v1/store/get \
  --header 'Authorization: Bearer <token>'
```

### Resposta — `200 OK`

Retorna os detalhes da loja com informações de saldo e configurações.

Em caso de erro:

```json
{
  "error": "Erro ao recuperar dados da loja.",
  "data": null
}
```

### Erros

| Status | Descrição |
|--------|-----------|
| `401` | Não autorizado — chave de API inválida ou ausente |

---

## Obter informações do merchant

Retorna informações básicas da loja (nome, website e data de criação).

```
GET /v1/public-mrr/merchant-info
```

### Autenticação

| Header | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `Authorization` | string | Sim | `Bearer <abacatepay-api-key>` |

### Exemplo de requisição

```bash
curl --request GET \
  --url https://api.abacatepay.com/v1/public-mrr/merchant-info \
  --header 'Authorization: Bearer <token>'
```

### Resposta — `200 OK`

```json
{
  "data": {
    "id": "store_123456",
    "name": "Example Tech",
    "website": "https://www.example.com",
    "createdAt": "2024-12-06T18:53:31.756Z"
  },
  "error": null
}
```

### Campos da resposta

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID único da loja |
| `name` | string | Nome da loja |
| `website` | string | Website da loja |
| `createdAt` | string | Data de criação (ISO 8601) |

### Erros

| Status | Descrição |
|--------|-----------|
| `401` | Não autorizado — chave de API inválida ou ausente |

---

## Obter MRR (Monthly Recurring Revenue)

Retorna o MRR (receita recorrente mensal) e o total de assinaturas ativas da loja.

```
GET /v1/public-mrr/mrr
```

### Autenticação

| Header | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `Authorization` | string | Sim | `Bearer <abacatepay-api-key>` |

### Exemplo de requisição

```bash
curl --request GET \
  --url https://api.abacatepay.com/v1/public-mrr/mrr \
  --header 'Authorization: Bearer <token>'
```

### Resposta — `200 OK`

```json
{
  "data": {
    "mrr": 0,
    "totalActiveSubscriptions": 0
  },
  "error": null
}
```

### Campos da resposta

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `mrr` | number | Receita recorrente mensal em centavos |
| `totalActiveSubscriptions` | number | Total de assinaturas ativas |

### Erros

| Status | Descrição |
|--------|-----------|
| `401` | Não autorizado — chave de API inválida ou ausente |

---

## Obter receita por período

Retorna a receita total, total de transações e transações por dia em um período específico.

> **Nota:** Os dados são cacheados por 1 hora (3600 segundos) para melhor performance. A data de fim deve ser posterior à data de início.

```
GET /v1/public-mrr/revenue
```

### Autenticação

| Header | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `Authorization` | string | Sim | `Bearer <abacatepay-api-key>` |

### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição | Exemplo |
|-----------|------|-------------|-----------|---------|
| `startDate` | string\<date\> | Sim | Data de início do período (formato `YYYY-MM-DD`) | `"2024-01-01"` |
| `endDate` | string\<date\> | Sim | Data de fim do período (formato `YYYY-MM-DD`) | `"2024-01-31"` |

### Exemplo de requisição

```bash
curl --request GET \
  --url 'https://api.abacatepay.com/v1/public-mrr/revenue?startDate=2024-01-01&endDate=2024-01-31' \
  --header 'Authorization: Bearer <token>'
```

### Resposta — `200 OK`

```json
{
  "data": {
    "totalRevenue": 150000,
    "totalTransactions": 45,
    "transactionsPerDay": {
      "2024-01-15": {
        "amount": 5000,
        "count": 3
      },
      "2024-01-16": {
        "amount": 3000,
        "count": 2
      }
    }
  },
  "error": null
}
```

### Campos da resposta

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `totalRevenue` | number | Receita total em centavos no período |
| `totalTransactions` | number | Total de transações no período |
| `transactionsPerDay` | object | Detalhamento por dia |
| `transactionsPerDay[date].amount` | number | Receita do dia em centavos |
| `transactionsPerDay[date].count` | number | Quantidade de transações no dia |

### Erros

| Status | Descrição |
|--------|-----------|
| `400` | Requisição inválida (datas inválidas ou data de fim anterior à de início) |
| `401` | Não autorizado — chave de API inválida ou ausente |
