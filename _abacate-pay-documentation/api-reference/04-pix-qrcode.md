# PIX QR Code — API Reference

## Criar QRCode PIX

Permite que você crie um código copia-e-cola e um QRCode PIX para seu cliente fazer o pagamento.

```
POST /v1/pixQrCode/create
```

### Autenticação

| Header | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `Authorization` | string | Sim | `Bearer <abacatepay-api-key>` |

### Body (`application/json`)

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|-------|------|-------------|-----------|---------|
| `amount` | number | Sim | Valor da cobrança em centavos | `123` |
| `expiresIn` | number | Não | Tempo de expiração em segundos | `123` |
| `description` | string | Não | Mensagem que aparecerá no pagamento do PIX (máx. 37 caracteres) | `"Pagamento pedido #123"` |
| `customer` | object | Não | Dados do cliente (ver abaixo) | — |
| `metadata` | object | Não | Metadados opcionais | `{"externalId": "123"}` |

> **Nota:** O objeto `customer` não é obrigatório, mas ao informar qualquer informação do `customer`, todos os campos (`name`, `cellphone`, `email` e `taxId`) são obrigatórios.

### Objeto `customer` (opcional)

| Campo | Tipo | Obrigatório* | Descrição | Exemplo |
|-------|------|-------------|-----------|---------|
| `name` | string | Sim | Nome completo do cliente | `"Daniel Lima"` |
| `cellphone` | string | Sim | Celular do cliente | `"(11) 4002-8922"` |
| `email` | string | Sim | E-mail do cliente | `"daniel_lima@abacatepay.com"` |
| `taxId` | string | Sim | CPF ou CNPJ válido | `"123.456.789-01"` |

\* Obrigatório apenas quando o objeto `customer` é enviado.

### Exemplo de requisição

```bash
curl --request POST \
  --url https://api.abacatepay.com/v1/pixQrCode/create \
  --header 'Authorization: Bearer <token>' \
  --header 'Content-Type: application/json' \
  --data '
{
  "amount": 123,
  "expiresIn": 123,
  "description": "Pagamento pedido #123",
  "customer": {
    "name": "Daniel Lima",
    "cellphone": "(11) 4002-8922",
    "email": "daniel_lima@abacatepay.com",
    "taxId": "123.456.789-01"
  },
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
    "id": "pix_char_123456",
    "amount": 100,
    "status": "PENDING",
    "devMode": true,
    "brCode": "00020101021226950014br.gov.bcb.pix",
    "brCodeBase64": "data:image/png;base64,iVBORw0KGgoAAA",
    "platformFee": 80,
    "createdAt": "2025-03-24T21:50:20.772Z",
    "updatedAt": "2025-03-24T21:50:20.772Z",
    "expiresAt": "2025-03-25T21:50:20.772Z"
  },
  "error": null
}
```

### Campos da resposta

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID único do QRCode PIX |
| `amount` | number | Valor em centavos |
| `status` | string | Status do pagamento (`PENDING`, `PAID`, etc.) |
| `devMode` | boolean | Indica se está em modo de desenvolvimento |
| `brCode` | string | Código PIX copia-e-cola |
| `brCodeBase64` | string | QR Code em formato Base64 (imagem PNG) |
| `platformFee` | number | Taxa da plataforma em centavos |
| `createdAt` | string | Data de criação (ISO 8601) |
| `updatedAt` | string | Data da última atualização (ISO 8601) |
| `expiresAt` | string | Data de expiração (ISO 8601) |

### Erros

| Status | Descrição |
|--------|-----------|
| `401` | Não autorizado — chave de API inválida ou ausente |

---

## Checar Status

Checar status do pagamento de um QRCode PIX.

```
GET /v1/pixQrCode/check
```

### Autenticação

| Header | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `Authorization` | string | Sim | `Bearer <abacatepay-api-key>` |

### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição | Exemplo |
|-----------|------|-------------|-----------|---------|
| `id` | string | Sim | ID do QRCode PIX | `"pix_char_123456"` |

### Exemplo de requisição

```bash
curl --request GET \
  --url 'https://api.abacatepay.com/v1/pixQrCode/check?id=pix_char_123456' \
  --header 'Authorization: Bearer <token>'
```

### Resposta — `200 OK`

```json
{
  "data": {
    "status": "PENDING",
    "expiresAt": "2025-03-25T21:50:20.772Z"
  },
  "error": null
}
```

### Campos da resposta

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `status` | string | Status atual do pagamento (`PENDING`, `PAID`, `EXPIRED`, etc.) |
| `expiresAt` | string | Data de expiração (ISO 8601) |

### Erros

| Status | Descrição |
|--------|-----------|
| `401` | Não autorizado — chave de API inválida ou ausente |

---

## Simular Pagamento

Simula o pagamento de um QRCode PIX criado no **modo de desenvolvimento**.

> **Importante:** Este endpoint funciona apenas em modo de desenvolvimento (`devMode: true`).

```
POST /v1/pixQrCode/simulate-payment
```

### Autenticação

| Header | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `Authorization` | string | Sim | `Bearer <abacatepay-api-key>` |

### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição | Exemplo |
|-----------|------|-------------|-----------|---------|
| `id` | string | Sim | ID do QRCode PIX | `"pix_char_123456"` |

### Body (`application/json`)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `metadata` | object | Não | Metadados opcionais para a requisição |

### Exemplo de requisição

```bash
curl --request POST \
  --url 'https://api.abacatepay.com/v1/pixQrCode/simulate-payment?id=pix_char_123456' \
  --header 'Authorization: Bearer <token>' \
  --header 'Content-Type: application/json' \
  --data '{
  "metadata": {}
}'
```

### Resposta — `200 OK`

```json
{
  "data": {
    "id": "pix_char_123456",
    "amount": 100,
    "status": "PENDING",
    "devMode": true,
    "brCode": "00020101021226950014br.gov.bcb.pix",
    "brCodeBase64": "data:image/png;base64,iVBORw0KGgoAAA",
    "platformFee": 80,
    "createdAt": "2025-03-24T21:50:20.772Z",
    "updatedAt": "2025-03-24T21:50:20.772Z",
    "expiresAt": "2025-03-25T21:50:20.772Z"
  },
  "error": null
}
```

### Erros

| Status | Descrição |
|--------|-----------|
| `401` | Não autorizado — chave de API inválida ou ausente |
