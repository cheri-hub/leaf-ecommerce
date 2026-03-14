# Cobranças (Billing) — API Reference

## Criar uma nova cobrança

Permite que você crie um link de cobrança para o seu cliente pagar.

```
POST /v1/billing/create
```

### Autenticação

| Header | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `Authorization` | string | Sim | `Bearer <abacatepay-api-key>` |

### Body (`application/json`)

| Campo | Tipo | Obrigatório | Default | Descrição | Exemplo |
|-------|------|-------------|---------|-----------|---------|
| `frequency` | enum\<string\> | Sim | `ONE_TIME` | Tipo de frequência da cobrança | `"ONE_TIME"` |
| `methods` | enum\<string\>[] | Sim | — | Métodos de pagamento (1-2 elementos) | `["PIX", "CARD"]` |
| `products` | object[] | Sim | — | Lista de produtos (mín. 1 item) | ver abaixo |
| `returnUrl` | string\<uri\> | Sim | — | URL de redirecionamento ao clicar "Voltar" | `"https://example.com/billing"` |
| `completionUrl` | string\<uri\> | Sim | — | URL de redirecionamento quando o pagamento for concluído | `"https://example.com/completion"` |
| `customerId` | string | Não | — | ID de um cliente já cadastrado | `"cust_abcdefghij"` |
| `customer` | object | Não | — | Dados do cliente (será criado se não existir) | ver abaixo |
| `allowCoupons` | boolean | Não | `false` | Se verdadeiro, cupons podem ser usados na cobrança | `false` |
| `coupons` | string[] | Não | — | Lista de cupons disponíveis (máx. 50) | `["ABKT10", "ABKT5"]` |
| `externalId` | string | Não | — | Identificador único da sua aplicação | `"seu_id_123"` |
| `metadata` | object | Não | — | Metadados opcionais para a cobrança | `{"externalId": "123"}` |

### Valores de `frequency`

| Valor | Descrição |
|-------|-----------|
| `ONE_TIME` | Cobrança única |
| `MULTIPLE_PAYMENTS` | Cobrança que pode ser paga mais de uma vez |

### Valores de `methods`

| Valor | Descrição |
|-------|-----------|
| `PIX` | Pagamento via PIX |
| `CARD` | Pagamento via cartão |

### Objeto `products`

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|-------|------|-------------|-----------|---------|
| `externalId` | string | Não | ID externo do produto | `"prod-1234"` |
| `name` | string | Sim | Nome do produto | `"Assinatura de Programa Fitness"` |
| `description` | string | Não | Descrição do produto | `"Acesso ao programa fitness premium por 1 mês."` |
| `quantity` | number | Sim | Quantidade | `2` |
| `price` | number | Sim | Preço unitário em centavos | `2000` |

### Objeto `customer` (opcional)

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|-------|------|-------------|-----------|---------|
| `name` | string | Sim | Nome completo do cliente | `"Daniel Lima"` |
| `cellphone` | string | Sim | Celular do cliente | `"(11) 4002-8922"` |
| `email` | string | Sim | E-mail do cliente | `"daniel_lima@abacatepay.com"` |
| `taxId` | string | Sim | CPF ou CNPJ válido | `"123.456.789-01"` |

### Exemplo de requisição

```bash
curl --request POST \
  --url https://api.abacatepay.com/v1/billing/create \
  --header 'Authorization: Bearer <token>' \
  --header 'Content-Type: application/json' \
  --data '
{
  "frequency": "ONE_TIME",
  "methods": ["PIX", "CARD"],
  "products": [
    {
      "externalId": "prod-1234",
      "name": "Assinatura de Programa Fitness",
      "description": "Acesso ao programa fitness premium por 1 mês.",
      "quantity": 2,
      "price": 2000
    }
  ],
  "returnUrl": "https://example.com/billing",
  "completionUrl": "https://example.com/completion",
  "customerId": "cust_abcdefghij",
  "customer": {
    "name": "Daniel Lima",
    "cellphone": "(11) 4002-8922",
    "email": "daniel_lima@abacatepay.com",
    "taxId": "123.456.789-01"
  },
  "allowCoupons": false,
  "coupons": ["ABKT10", "ABKT5", "PROMO10"],
  "externalId": "seu_id_123",
  "metadata": {
    "externalId": "123"
  }
}
'
```

### Resposta — `200 OK`

```json
{
  "data": {
    "id": "bill_123456",
    "url": "https://pay.abacatepay.com/bill-5678",
    "status": "PENDING",
    "devMode": true,
    "methods": ["PIX", "CARD"],
    "products": [
      {
        "id": "prod_123456",
        "externalId": "prod-1234",
        "quantity": 2
      }
    ],
    "frequency": "ONE_TIME",
    "amount": 4000,
    "nextBilling": "null",
    "customer": {
      "id": "bill_123456",
      "metadata": {
        "name": "Daniel Lima",
        "cellphone": "(11) 4002-8922",
        "email": "daniel_lima@abacatepay.com",
        "taxId": "123.456.789-01"
      }
    },
    "allowCoupons": false,
    "coupons": []
  },
  "error": null
}
```

### Campos da resposta

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID único da cobrança |
| `url` | string | URL do checkout para enviar ao cliente |
| `status` | string | Status da cobrança (`PENDING`, `PAID`, etc.) |
| `devMode` | boolean | Indica se está em modo de desenvolvimento |
| `methods` | string[] | Métodos de pagamento aceitos |
| `products` | object[] | Produtos da cobrança |
| `frequency` | string | Frequência da cobrança |
| `amount` | number | Valor total em centavos |
| `nextBilling` | string | Próxima cobrança (para recorrentes) |
| `customer` | object | Dados do cliente |
| `allowCoupons` | boolean | Se cupons são permitidos |
| `coupons` | string[] | Cupons aplicados |

### Erros

| Status | Descrição |
|--------|-----------|
| `401` | Não autorizado — chave de API inválida ou ausente |

---

## Listar cobranças

Permite que você recupere uma lista de todas as cobranças criadas.

```
GET /v1/billing/list
```

### Autenticação

| Header | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `Authorization` | string | Sim | `Bearer <abacatepay-api-key>` |

### Exemplo de requisição

```bash
curl --request GET \
  --url https://api.abacatepay.com/v1/billing/list \
  --header 'Authorization: Bearer <token>'
```

### Resposta — `200 OK`

```json
{
  "data": [
    {
      "id": "bill_123456",
      "url": "https://pay.abacatepay.com/bill-5678",
      "status": "PENDING",
      "devMode": true,
      "methods": ["PIX", "CARD"],
      "products": [
        {
          "id": "prod_123456",
          "externalId": "prod-1234",
          "quantity": 2
        }
      ],
      "frequency": "ONE_TIME",
      "amount": 4000,
      "nextBilling": "null",
      "customer": {
        "id": "bill_123456",
        "metadata": {
          "name": "Daniel Lima",
          "cellphone": "(11) 4002-8922",
          "email": "daniel_lima@abacatepay.com",
          "taxId": "123.456.789-01"
        }
      },
      "allowCoupons": false,
      "coupons": []
    }
  ],
  "error": null
}
```

### Erros

| Status | Descrição |
|--------|-----------|
| `401` | Não autorizado — chave de API inválida ou ausente |
