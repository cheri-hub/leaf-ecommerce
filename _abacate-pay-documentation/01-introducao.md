# Introdução — API v1

> **Aviso:** Esta página documenta a API v1. Para novos projetos, recomendamos usar a v2 — você pode alternar entre versões usando o seletor de versão no topo da documentação oficial.

## O que é a API v1?

A API v1 foi a primeira versão pública da AbacatePay. Ela continua disponível para projetos legados, mas toda a evolução da plataforma acontece na v2.

Em termos de conceito, a v1 já seguia as mesmas ideias centrais:

- Cobranças baseadas em intenção
- Checkout de pagamento via URL compartilhável
- Suporte a PIX (e, em alguns casos, cartão)
- Webhooks para manter seu sistema sincronizado com o que acontece na AbacatePay

## Diferenças principais em relação à v2

De forma geral:

- A v1 expõe os endpoints sob o prefixo `https://api.abacatepay.com/v1`
- Alguns caminhos e payloads são diferentes da v2
- Os webhooks podem ter eventos e estruturas ligeiramente distintas

Use a documentação da v1 quando estiver:

- Mantendo uma integração existente que ainda não migrou para a v2
- Precisando consultar webhooks legados ou rotas específicas da v1

## Estrutura da documentação v1

Nesta documentação você encontra:

| Seção | Descrição |
|-------|-----------|
| **Introdução** (esta página) | Contexto e diferenças gerais |
| **Autenticação** | Como autenticar requisições na API |
| **Webhooks (v1)** | Eventos, payloads e boas práticas específicas da v1 |
| **API Reference (v1)** | Lista das rotas disponíveis na v1, agrupadas por recurso |

Para detalhes mais completos, consulte também a documentação principal da v2 — muitos conceitos (como autenticação, idempotência e estrutura `{data, error}`) são compartilhados entre as versões.
