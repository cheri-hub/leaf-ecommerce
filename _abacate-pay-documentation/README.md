# Documentação AbacatePay - API v1

Documentação completa da API v1 da AbacatePay para integração de pagamentos.

## Índice

1. [Introdução](01-introducao.md) — Visão geral da API v1 e diferenças em relação à v2
2. [Autenticação](02-autenticacao.md) — Como autenticar suas requisições
3. [Webhooks](03-webhooks.md) — Eventos, payloads e boas práticas
4. **API Reference**
   - [Clientes](api-reference/01-clientes.md) — Criar e listar clientes
   - [Cupons](api-reference/02-cupons.md) — Criar e listar cupons de desconto
   - [Cobranças](api-reference/03-cobrancas.md) — Criar e listar cobranças (billing)
   - [PIX QR Code](api-reference/04-pix-qrcode.md) — Criar QR Code PIX, checar status e simular pagamento
   - [Saques](api-reference/05-saques.md) — Criar, buscar e listar saques (withdraw)
   - [Loja / Merchant](api-reference/06-loja-merchant.md) — Detalhes da loja, merchant info, MRR e receita

## Base URL

```
https://api.abacatepay.com/v1
```

## Formato de Resposta Padrão

Todas as respostas seguem o padrão:

```json
{
  "data": { ... },
  "error": null
}
```

Em caso de erro:

```json
{
  "data": null,
  "error": "Mensagem de erro"
}
```

## Links Úteis

- [Site oficial](https://abacatepay.com)
- [Documentação oficial](https://docs.abacatepay.com)
- [GitHub](https://github.com/AbacatePay)
- [Discord](https://discord.com/invite/CP57mm7EFk)
