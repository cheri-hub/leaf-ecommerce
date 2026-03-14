# Saques (Withdraw) — API Reference

## Criar um novo saque

Permite que você crie um novo saque para transferir valores da sua conta para uma chave PIX.

```
POST /v1/withdraw/create
```

### Autenticação

| Header | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `Authorization` | string | Sim | `Bearer <abacatepay-api-key>` |

### Body (`application/json`)

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|-------|------|-------------|-----------|---------|
| `externalId` | string | Sim | Identificador único do saque no seu sistema | `"withdraw-1234"` |
| `method` | enum\<string\> | Sim | Método de saque | `"PIX"` |
| `amount` | number | Sim | Valor do saque em centavos (mín. 350) | `5000` |
| `pix` | object | Sim | Dados da chave PIX para receber o saque | ver abaixo |
| `description` | string | Não | Descrição opcional do saque | `"Saque para conta principal"` |

### Valores de `method`

| Valor | Descrição |
|-------|-----------|
| `PIX` | Saque via PIX |

### Objeto `pix`

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|-------|------|-------------|-----------|---------|
| `type` | string | Sim | Tipo de chave PIX (`CPF`, `CNPJ`, `EMAIL`, `PHONE`, `RANDOM`) | `"CPF"` |
| `key` | string | Sim | Valor da chave PIX | `"123.456.789-01"` |

### Exemplo de requisição

```bash
curl --request POST \
  --url https://api.abacatepay.com/v1/withdraw/create \
  --header 'Authorization: Bearer <token>' \
  --header 'Content-Type: application/json' \
  --data '
{
  "externalId": "withdraw-1234",
  "method": "PIX",
  "amount": 5000,
  "pix": {
    "type": "CPF",
    "key": "123.456.789-01"
  },
  "description": "Saque para conta principal"
}
'
```

### Resposta — `200 OK`

```json
{
  "data": {
    "id": "tran_123456",
    "status": "PENDING",
    "devMode": true,
    "receiptUrl": "https://abacatepay.com/receipt/tran_123456",
    "kind": "WITHDRAW",
    "amount": 5000,
    "platformFee": 80,
    "createdAt": "2025-03-24T21:50:20.772Z",
    "updatedAt": "2025-03-24T21:50:20.772Z",
    "externalId": "withdraw-1234"
  },
  "error": null
}
```

### Campos da resposta

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID único da transação |
| `status` | string | Status do saque (`PENDING`, `COMPLETED`, etc.) |
| `devMode` | boolean | Indica se está em modo de desenvolvimento |
| `receiptUrl` | string | URL do recibo da transação |
| `kind` | string | Tipo da transação (`WITHDRAW`) |
| `amount` | number | Valor em centavos |
| `platformFee` | number | Taxa da plataforma em centavos |
| `createdAt` | string | Data de criação (ISO 8601) |
| `updatedAt` | string | Data da última atualização (ISO 8601) |
| `externalId` | string | ID externo fornecido na criação |

### Erros

| Status | Descrição |
|--------|-----------|
| `401` | Não autorizado — chave de API inválida ou ausente |

---

## Buscar saque

Permite que você recupere os detalhes de um saque específico usando o `externalId`.

```
GET /v1/withdraw/get
```

### Autenticação

| Header | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `Authorization` | string | Sim | `Bearer <abacatepay-api-key>` |

### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição | Exemplo |
|-----------|------|-------------|-----------|---------|
| `externalId` | string | Sim | Identificador único do saque no seu sistema | `"withdraw-1234"` |

### Exemplo de requisição

```bash
curl --request GET \
  --url 'https://api.abacatepay.com/v1/withdraw/get?externalId=withdraw-1234' \
  --header 'Authorization: Bearer <token>'
```

### Resposta — `200 OK`

```json
{
  "data": {
    "id": "tran_123456",
    "status": "PENDING",
    "devMode": true,
    "receiptUrl": "https://abacatepay.com/receipt/tran_123456",
    "kind": "WITHDRAW",
    "amount": 5000,
    "platformFee": 80,
    "createdAt": "2025-03-24T21:50:20.772Z",
    "updatedAt": "2025-03-24T21:50:20.772Z",
    "externalId": "withdraw-1234"
  },
  "error": null
}
```

### Erros

| Status | Descrição |
|--------|-----------|
| `401` | Não autorizado — chave de API inválida ou ausente |
| `404` | Saque não encontrado |

---

## Listar saques

Permite que você recupere uma lista de todos os saques criados.

```
GET /v1/withdraw/list
```

### Autenticação

| Header | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `Authorization` | string | Sim | `Bearer <abacatepay-api-key>` |

### Exemplo de requisição

```bash
curl --request GET \
  --url https://api.abacatepay.com/v1/withdraw/list \
  --header 'Authorization: Bearer <token>'
```

### Resposta — `200 OK`

```json
{
  "data": [
    {
      "id": "tran_123456",
      "status": "PENDING",
      "devMode": true,
      "receiptUrl": "https://abacatepay.com/receipt/tran_123456",
      "kind": "WITHDRAW",
      "amount": 5000,
      "platformFee": 80,
      "createdAt": "2025-03-24T21:50:20.772Z",
      "updatedAt": "2025-03-24T21:50:20.772Z",
      "externalId": "withdraw-1234"
    }
  ],
  "error": null
}
```

### Erros

| Status | Descrição |
|--------|-----------|
| `401` | Não autorizado — chave de API inválida ou ausente |
