# Cupons — API Reference

## Criar um novo cupom

Permite que você crie um novo cupom que pode ser usado por seus clientes para aplicar descontos.

```
POST /v1/coupon/create
```

### Autenticação

| Header | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `Authorization` | string | Sim | `Bearer <abacatepay-api-key>` |

### Body (`application/json`)

| Campo | Tipo | Obrigatório | Default | Descrição | Exemplo |
|-------|------|-------------|---------|-----------|---------|
| `code` | string | Sim | — | Identificador único do cupom | `"DEYVIN_20"` |
| `notes` | string | Sim | — | Descrição sobre o cupom | `"Cupom de desconto pro meu público"` |
| `discountKind` | enum\<string\> | Sim | — | Tipo de desconto: `PERCENTAGE` ou `FIXED` | `"PERCENTAGE"` |
| `discount` | number | Sim | — | Valor de desconto a ser aplicado | `123` |
| `maxRedeems` | number | Não | `-1` | Quantidade de vezes que o cupom pode ser resgatado. `-1` = sem limite | `10` |
| `metadata` | object | Não | — | Objeto chave-valor para metadados do cupom | `{}` |

### Valores de `discountKind`

| Valor | Descrição |
|-------|-----------|
| `PERCENTAGE` | Desconto percentual |
| `FIXED` | Desconto com valor fixo (em centavos) |

### Exemplo de requisição

```bash
curl --request POST \
  --url https://api.abacatepay.com/v1/coupon/create \
  --header 'Authorization: Bearer <token>' \
  --header 'Content-Type: application/json' \
  --data '
{
  "code": "DEYVIN_20",
  "notes": "Cupom de desconto pro meu público",
  "discountKind": "PERCENTAGE",
  "discount": 123,
  "maxRedeems": -1,
  "metadata": {}
}
'
```

### Resposta — `200 OK`

```json
{
  "data": {
    "id": "DEYVIN_20",
    "discountKind": "PERCENTAGE",
    "discount": 123,
    "status": "ACTIVE",
    "createdAt": "2025-05-25T23:43:25.250Z",
    "updatedAt": "2025-05-25T23:43:25.250Z",
    "notes": "Cupom de desconto pro meu público",
    "maxRedeems": -1,
    "redeemsCount": 0,
    "devMode": true,
    "metadata": {}
  },
  "error": null
}
```

### Erros

| Status | Descrição |
|--------|-----------|
| `401` | Não autorizado — chave de API inválida ou ausente |

---

## Listar cupons

Permite que você recupere uma lista de todos os seus cupons.

```
GET /v1/coupon/list
```

### Autenticação

| Header | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `Authorization` | string | Sim | `Bearer <abacatepay-api-key>` |

### Exemplo de requisição

```bash
curl --request GET \
  --url https://api.abacatepay.com/v1/coupon/list \
  --header 'Authorization: Bearer <token>'
```

### Resposta — `200 OK`

```json
{
  "data": [
    {
      "id": "DEYVIN_20",
      "discountKind": "PERCENTAGE",
      "discount": 123,
      "status": "ACTIVE",
      "createdAt": "2025-05-25T23:43:25.250Z",
      "updatedAt": "2025-05-25T23:43:25.250Z",
      "notes": "Cupom de desconto pro meu público",
      "maxRedeems": -1,
      "redeemsCount": 0,
      "devMode": true,
      "metadata": {}
    }
  ],
  "error": null
}
```

### Erros

| Status | Descrição |
|--------|-----------|
| `401` | Não autorizado — chave de API inválida ou ausente |
