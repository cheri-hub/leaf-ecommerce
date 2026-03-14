# Clientes — API Reference

## Criar um novo cliente

Permite que você crie um novo cliente para a sua loja.

```
POST /v1/customer/create
```

### Autenticação

| Header | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `Authorization` | string | Sim | `Bearer <abacatepay-api-key>` |

### Body (`application/json`)

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|-------|------|-------------|-----------|---------|
| `name` | string | Sim | Nome completo do cliente | `"Daniel Lima"` |
| `cellphone` | string | Sim | Celular do cliente | `"(11) 4002-8922"` |
| `email` | string | Sim | E-mail do cliente | `"daniel_lima@abacatepay.com"` |
| `taxId` | string | Sim | CPF ou CNPJ válido do cliente | `"123.456.789-01"` |

### Exemplo de requisição

```bash
curl --request POST \
  --url https://api.abacatepay.com/v1/customer/create \
  --header 'Authorization: Bearer <token>' \
  --header 'Content-Type: application/json' \
  --data '
{
  "name": "Daniel Lima",
  "cellphone": "(11) 4002-8922",
  "email": "daniel_lima@abacatepay.com",
  "taxId": "123.456.789-01"
}
'
```

### Resposta — `200 OK`

```json
{
  "data": {
    "id": "bill_123456",
    "metadata": {
      "name": "Daniel Lima",
      "cellphone": "(11) 4002-8922",
      "email": "daniel_lima@abacatepay.com",
      "taxId": "123.456.789-01"
    }
  },
  "error": null
}
```

### Erros

| Status | Descrição |
|--------|-----------|
| `401` | Não autorizado — chave de API inválida ou ausente |

---

## Listar clientes

Permite que você recupere uma lista de todos os seus clientes.

```
GET /v1/customer/list
```

### Autenticação

| Header | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `Authorization` | string | Sim | `Bearer <abacatepay-api-key>` |

### Exemplo de requisição

```bash
curl --request GET \
  --url https://api.abacatepay.com/v1/customer/list \
  --header 'Authorization: Bearer <token>'
```

### Resposta — `200 OK`

```json
{
  "data": [
    {
      "id": "bill_123456",
      "metadata": {
        "name": "Daniel Lima",
        "cellphone": "(11) 4002-8922",
        "email": "daniel_lima@abacatepay.com",
        "taxId": "123.456.789-01"
      }
    }
  ],
  "error": null
}
```

### Erros

| Status | Descrição |
|--------|-----------|
| `401` | Não autorizado — chave de API inválida ou ausente |
