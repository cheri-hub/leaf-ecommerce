# Leaf E-commerce — Instruções do Agente

> **Contexto:** Este workspace é 100% dedicado ao desenvolvimento de um e-commerce completo.
> Todo código gerado, toda decisão técnica e toda sugestão DEVE estar alinhada com este documento.
> Idioma do projeto: **Português (BR)** para UI e comentários quando necessário; **Inglês** para nomes de variáveis, classes, endpoints e código.

---

## 1. IDENTIDADE DO PROJETO

- **Nome:** Leaf E-commerce
- **Domínio:** E-commerce B2C brasileiro
- **Pagamentos:** AbacatePay (única plataforma — sem Stripe, sem Mercado Pago)
- **Moeda:** BRL, sempre em **centavos** (`int`) na API, formatado apenas na UI
- **Deploy:** VPS própria com Docker Compose

---

## 2. ARQUITETURA — DECISÕES FINAIS

```
Usuário ──► Nginx (:80/:443) ──┬── Next.js (:3003) ← Frontend
                                └── ASP.NET (:5000) ← Backend API
AbacatePay ──► POST /api/webhooks/abacatepay ──► Backend
Backend ──► PostgreSQL (:5432) + Redis (:6379)
```

Regras de arquitetura:
- Frontend **NUNCA** se comunica diretamente com AbacatePay — sempre via backend
- Backend é a **única** camada que detém API keys e secrets
- Redis é cache e fila — **NUNCA** fonte de verdade; PostgreSQL é a fonte de verdade
- Todo dado financeiro (pedidos, pagamentos, reembolsos) DEVE estar persistido no PostgreSQL

---

## 3. STACK — DECISÕES OBRIGATÓRIAS

Não sugira alternativas. Use exatamente estas tecnologias:

### Backend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| C# | 14 | Linguagem |
| .NET | 10 | Runtime |
| ASP.NET Core Minimal APIs | — | Endpoints HTTP |
| Entity Framework Core + Npgsql | 10 | ORM + PostgreSQL |
| StackExchange.Redis | — | Cache e sessões |
| Hangfire | — | Background jobs |
| ASP.NET Identity + JWT Bearer | — | Auth |
| FluentValidation | — | Validação de request/response |

### Frontend

| Tecnologia | Uso |
|------------|-----|
| Next.js (App Router) | Framework — SSR/SSG |
| TypeScript | Tipagem estrita — sem `any` |
| Tailwind CSS | Estilização |
| shadcn/ui | Componentes UI |
| Zustand | Estado global (carrinho, auth) |
| React Hook Form + Zod | Formulários + validação |

### Infraestrutura

| Tecnologia | Uso |
|------------|-----|
| PostgreSQL 16 | Banco de dados principal |
| Redis 7 | Cache, sessões, fila Hangfire |
| Docker + Docker Compose | Containerização |
| Nginx | Reverse proxy + SSL termination |
| Certbot (Let's Encrypt) | HTTPS automático |
| GitHub Actions | CI/CD (build → test → deploy via SSH) |

---

## 4. ESTRUTURA DE PASTAS — SIGA EXATAMENTE

### Backend

```
backend/
├── src/EcommerceApi/
│   ├── Program.cs                    ← Composição root + pipeline
│   ├── Endpoints/                    ← Um arquivo por recurso: ProductEndpoints.cs, OrderEndpoints.cs
│   ├── Services/                     ← Lógica de negócio + AbacatePayClient.cs
│   ├── Models/
│   │   ├── Domain/                   ← Entidades EF Core (classes mutáveis com Id)
│   │   ├── DTOs/                     ← Records imutáveis para request/response
│   │   └── AbacatePay/               ← Records que espelham payloads da AbacatePay
│   ├── Data/
│   │   ├── AppDbContext.cs
│   │   ├── Configurations/           ← IEntityTypeConfiguration<T> por entidade
│   │   └── Migrations/
│   ├── Jobs/                         ← Hangfire jobs (ProcessWebhookJob, SendEmailJob)
│   └── Validators/                   ← FluentValidation validators
├── tests/EcommerceApi.Tests/
│   ├── Unit/                         ← Testes de Services, Validators
│   └── Integration/                  ← Testes de Endpoints com WebApplicationFactory
├── Dockerfile
└── EcommerceApi.sln
```

### Frontend

```
frontend/
├── src/
│   ├── app/                          ← App Router (layout.tsx, page.tsx, rotas)
│   │   ├── (shop)/                   ← Grupo: home, products/[slug], cart, checkout
│   │   ├── (account)/                ← Grupo: login, register, orders, profile
│   │   └── (admin)/                  ← Grupo: painel admin (protegido)
│   ├── components/
│   │   ├── ui/                       ← shadcn/ui (NÃO editar manualmente)
│   │   └── [feature]/                ← Por feature: product/, cart/, checkout/, layout/
│   ├── lib/
│   │   ├── api.ts                    ← Fetch wrapper tipado para o backend
│   │   ├── utils.ts                  ← Helpers genéricos (formatCurrency, cn, etc.)
│   │   └── constants.ts              ← URLs, config pública
│   ├── stores/                       ← Zustand stores (cart-store.ts, auth-store.ts)
│   ├── hooks/                        ← Custom hooks (useCart, useAuth, useDebounce)
│   └── types/                        ← Tipos TypeScript compartilhados
├── public/                           ← Assets estáticos
├── Dockerfile
└── package.json
```

---

## 5. REGRAS DE CÓDIGO — BACKEND C#

### FAÇA

- Use **Minimal APIs** com extension methods `Map*Endpoints(this WebApplication app)` — um arquivo por recurso
- Use **primary constructors** em services e clients: `public sealed class OrderService(AppDbContext db, AbacatePayClient pay)`
- Use **records** para DTOs: `public record CreateOrderRequest(...)`
- Use **classes** para entidades de domínio (EF Core precisa de mutabilidade)
- Use **CancellationToken** em TODA operação async — propague até o banco e HTTP
- Use **ILogger<T>** com logs estruturados: `logger.LogInformation("Pedido {OrderId} confirmado", order.Id)`
- Use **Result pattern** para operações que podem falhar (não lance exceções para fluxo de negócio)
- Registre `AbacatePayClient` via `AddHttpClient<AbacatePayClient>` — NUNCA instancie HttpClient manualmente
- Configure JSON com `camelCase` por padrão (JsonSerializerOptions)
- Valide TODO input externo com FluentValidation
- Trate valores monetários como `int` (centavos) — NUNCA `decimal`/`float`/`double` para dinheiro
- Normalize comparações de webhook secret com tempo constante

### NÃO FAÇA

- ❌ Controllers / [ApiController] — este projeto usa APENAS Minimal APIs
- ❌ Repository pattern sobre EF Core — use DbContext diretamente nos Services
- ❌ `async void` — sempre `async Task`
- ❌ `Thread.Sleep` — use `await Task.Delay` se realmente necessário
- ❌ Strings mágicas para config — use `IOptions<T>` ou `IConfiguration` com seções tipadas
- ❌ `try/catch` genérico em endpoints — use middleware de exceção global
- ❌ Expor stack traces em respostas HTTP de produção
- ❌ Bloquear thread com `.Result` ou `.Wait()`
- ❌ N+1 queries — use `Include()` / `ThenInclude()` ou projections com `Select()`

### PADRÃO: AbacatePayClient

```csharp
public sealed class AbacatePayClient(HttpClient http)
{
    public async Task<AbacatePayResponse<T>> PostAsync<T>(
        string endpoint, object request, CancellationToken ct = default)
    {
        var response = await http.PostAsJsonAsync(endpoint, request, ct);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<AbacatePayResponse<T>>(ct)
            ?? throw new InvalidOperationException("Null response from AbacatePay");
    }

    public async Task<AbacatePayResponse<T>> GetAsync<T>(
        string endpoint, CancellationToken ct = default)
    {
        return await http.GetFromJsonAsync<AbacatePayResponse<T>>(endpoint, ct)
            ?? throw new InvalidOperationException("Null response from AbacatePay");
    }
}

public record AbacatePayResponse<T>
{
    public T? Data { get; init; }
    public string? Error { get; init; }
}
```

Registro no DI:
```csharp
builder.Services.AddHttpClient<AbacatePayClient>(client =>
{
    client.BaseAddress = new Uri("https://api.abacatepay.com");
    client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", builder.Configuration["AbacatePay:ApiKey"]);
});
```

### PADRÃO: Webhook Endpoint

```csharp
app.MapPost("/api/webhooks/abacatepay", async (
    [FromQuery] string? webhookSecret,
    [FromBody] WebhookPayload payload,
    IConfiguration config,
    IOrderService orderService) =>
{
    if (!CryptographicOperations.FixedTimeEquals(
        Encoding.UTF8.GetBytes(webhookSecret ?? ""),
        Encoding.UTF8.GetBytes(config["AbacatePay:WebhookSecret"] ?? "")))
        return Results.Unauthorized();

    if (payload.DevMode)
        return Results.Ok();

    return payload.Event switch
    {
        "billing.paid"     => Results.Ok(await orderService.ConfirmPaymentAsync(payload.Data)),
        "billing.refunded" => Results.Ok(await orderService.ProcessRefundAsync(payload.Data)),
        _                  => Results.Ok()
    };
});
```

### PADRÃO: Endpoint organizado

```csharp
// Endpoints/ProductEndpoints.cs
public static class ProductEndpoints
{
    public static void MapProductEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/products").WithTags("Products");

        group.MapGet("/", GetAll);
        group.MapGet("/{id:guid}", GetById);
        group.MapPost("/", Create).RequireAuthorization("Admin");
    }

    private static async Task<IResult> GetAll(AppDbContext db, CancellationToken ct) { ... }
    private static async Task<IResult> GetById(Guid id, AppDbContext db, CancellationToken ct) { ... }
    private static async Task<IResult> Create(CreateProductRequest req, AppDbContext db, CancellationToken ct) { ... }
}
```

---

## 5.1. GUIA DE ESTILO — DESIGN SYSTEM COMPLETO

> **Referências visuais:** Merge entre [In The Box Perfumes](https://www.intheboxperfumes.com.br/) e [Nuancielo](https://www.nuancielo.com.br/).
> **Estilo resultante:** Premium, minimalista, orgânico — sensação de sofisticação natural com muito respiro visual.
> **Tom:** Elegante sem ser frio. Acolhedor sem ser informal.

---

### 5.1.1. PALETA DE CORES

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg-main` | `#F3F4F1` | Fundo principal da página (off-white orgânico) |
| `--surface-card` | `#FAF3E1` | Superfície de cards, painéis, modais |
| `--primary` | `#244E2B` | Cor principal (botões CTA, links, header, elementos de destaque) |
| `--primary-hover` | `#1A3B20` | Hover de botões primários (10% mais escuro) |
| `--primary-light` | `#2F6637` | Variação clara para ícones e detalhes sutis |
| `--secondary` | `#D6DBBE` | Badges, tags, bordas suaves, fundos de destaque leve |
| `--secondary-hover` | `#C5CCA8` | Hover de elementos secundários |
| `--text-main` | `#182B1C` | Cor principal de texto (quase preto esverdeado) |
| `--text-secondary` | `#5A6B5E` | Texto secundário, descrições, placeholders |
| `--text-muted` | `#8A9A8E` | Texto muito sutil, dicas, metadados |
| `--border` | `#E2E4DF` | Bordas de cards, dividers, separadores |
| `--border-strong` | `#C8CBC4` | Bordas de inputs, dropdowns |
| `--success` | `#2E7D32` | Sucesso, estoque disponível, confirmações |
| `--warning` | `#F59E0B` | Alertas, estoque baixo |
| `--error` | `#DC2626` | Erros, validação, estoque esgotado |
| `--overlay` | `rgba(24, 43, 28, 0.5)` | Overlay de modais e drawers |

```css
/* globals.css */
:root {
  --bg-main: #F3F4F1;
  --surface-card: #FAF3E1;
  --primary: #244E2B;
  --primary-hover: #1A3B20;
  --primary-light: #2F6637;
  --secondary: #D6DBBE;
  --secondary-hover: #C5CCA8;
  --text-main: #182B1C;
  --text-secondary: #5A6B5E;
  --text-muted: #8A9A8E;
  --border: #E2E4DF;
  --border-strong: #C8CBC4;
  --success: #2E7D32;
  --warning: #F59E0B;
  --error: #DC2626;
  --overlay: rgba(24, 43, 28, 0.5);
}
```

```typescript
// tailwind.config.ts → theme.extend.colors
colors: {
  "bg-main": "var(--bg-main)",
  "surface-card": "var(--surface-card)",
  primary: {
    DEFAULT: "var(--primary)",
    hover: "var(--primary-hover)",
    light: "var(--primary-light)",
  },
  secondary: {
    DEFAULT: "var(--secondary)",
    hover: "var(--secondary-hover)",
  },
  "text-main": "var(--text-main)",
  "text-secondary": "var(--text-secondary)",
  "text-muted": "var(--text-muted)",
  border: "var(--border)",
  "border-strong": "var(--border-strong)",
  success: "var(--success)",
  warning: "var(--warning)",
  error: "var(--error)",
}
```

---

### 5.1.2. TIPOGRAFIA

> **Google Fonts:** [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) + [Inter](https://fonts.google.com/specimen/Inter)
> **Por que Cormorant Garamond?** Mais leve, arejada e orgânica que Playfair Display. Inspirada na tipografia de Claude Garamond, transmite "sofisticação natural" — perfeita para e-commerce de lifestyle/beleza. Excelente legibilidade tanto em display (hero) quanto em tamanhos menores (cards).
> **Por que Inter?** Gold standard para UI — neutralidade, legibilidade em todos os tamanhos, excelente suporte a português.

#### Fontes carregadas via `next/font/google`

```typescript
// layout.tsx
import { Inter, Cormorant_Garamond } from "next/font/google";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});
```

#### Hierarquia tipográfica completa

| Elemento | Fonte | Peso | Tamanho (desktop) | Tamanho (mobile) | Line-height | Tracking | Classe Tailwind |
|----------|-------|------|-------------------|------------------|-------------|----------|----------------|
| **Display (hero)** | `Cormorant Garamond` | 300 (light) | 3.5rem (56px) | 2.25rem (36px) | 1.1 | -0.03em | `font-heading font-light text-4xl md:text-5xl lg:text-[3.5rem]` |
| **H1 (página)** | `Cormorant Garamond` | 600 (semibold) | 2.5rem (40px) | 2rem (32px) | 1.2 | -0.02em | `font-heading font-semibold text-2xl md:text-3xl lg:text-[2.5rem]` |
| **H2 (seção)** | `Cormorant Garamond` | 600 (semibold) | 2rem (32px) | 1.5rem (24px) | 1.25 | -0.02em | `font-heading font-semibold text-2xl md:text-3xl` |
| **H3 (sub-seção)** | `Cormorant Garamond` | 600 (semibold) | 1.5rem (24px) | 1.25rem (20px) | 1.3 | -0.01em | `font-heading font-semibold text-lg md:text-xl` |
| **H4 (card title)** | `Inter` | 500 (medium) | 1.25rem (20px) | 1.125rem (18px) | 1.4 | 0 | `font-sans font-medium text-lg md:text-xl` |
| **H5** | `Inter` | 500 (medium) | 1.125rem (18px) | 1rem (16px) | 1.4 | 0 | `font-sans font-medium text-base md:text-lg` |
| **H6** | `Inter` | 500 (medium) | 1rem (16px) | 1rem (16px) | 1.4 | 0 | `font-sans font-medium text-base` |
| **Nome do produto (card)** | `Cormorant Garamond` | 600 (semibold) | 1rem (16px) | 0.875rem (14px) | 1.3 | 0 | `font-heading font-semibold text-sm md:text-base` |
| **Nome do produto (PDP)** | `Cormorant Garamond` | 600 (semibold) | 2rem (32px) | 1.5rem (24px) | 1.2 | -0.01em | `font-heading font-semibold text-2xl md:text-3xl` |
| **Body** | `Inter` | 400 (regular) | 1rem (16px) | 1rem (16px) | 1.6 | 0 | `font-sans text-base` |
| **Body small** | `Inter` | 400 (regular) | 0.875rem (14px) | 0.875rem | 1.5 | 0 | `font-sans text-sm` |
| **Caption/Meta** | `Inter` | 400 (regular) | 0.75rem (12px) | 0.75rem | 1.4 | 0 | `font-sans text-xs` |
| **UI Labels** | `Inter` | 500 (medium) | 0.75rem (12px) | 0.75rem | 1.4 | 0.05em | `font-sans font-medium text-xs uppercase tracking-wide` |
| **Botões CTA** | `Inter` | 600 (semibold) | 0.875rem (14px) | 0.875rem | 1 | 0.05em | `font-sans font-semibold text-sm uppercase tracking-wide` |
| **Botões secundários** | `Inter` | 500 (medium) | 0.875rem (14px) | 0.875rem | 1 | 0 | `font-sans font-medium text-sm` |
| **Preço atual** | `Inter` | 700 (bold) | 1.5rem (24px) | 1.25rem (20px) | 1 | -0.01em | `font-sans font-bold text-xl md:text-2xl` |
| **Preço riscado** | `Inter` | 400 (regular) | 0.875rem (14px) | 0.875rem | 1 | 0 | `font-sans text-sm line-through text-text-muted` |
| **Preço parcelado** | `Inter` | 400 (regular) | 0.75rem (12px) | 0.75rem | 1.4 | 0 | `font-sans text-xs text-text-secondary` |
| **Badge/Tag** | `Inter` | 500 (medium) | 0.75rem (12px) | 0.75rem | 1 | 0.05em | `font-sans font-medium text-xs uppercase tracking-wide` |
| **Nav links** | `Inter` | 500 (medium) | 0.875rem (14px) | 0.875rem | 1 | 0.03em | `font-sans font-medium text-sm tracking-wide` |
| **Announcement bar** | `Inter` | 400 (regular) | 0.8125rem (13px) | 0.8125rem | 1 | 0.02em | `font-sans text-[13px] tracking-wide` |
| **Input text** | `Inter` | 400 (regular) | 1rem (16px) | 1rem | 1.5 | 0 | `font-sans text-base` |
| **Input label** | `Inter` | 500 (medium) | 0.875rem (14px) | 0.875rem | 1.4 | 0 | `font-sans font-medium text-sm` |
| **Breadcrumb** | `Inter` | 400 (regular) | 0.875rem (14px) | 0.75rem | 1.4 | 0 | `font-sans text-sm text-text-muted` |

#### Configuração no Tailwind (via `@theme inline` no globals.css)

```css
@theme inline {
  --font-heading: "Cormorant Garamond", Georgia, serif;
  --font-sans: "Inter", system-ui, sans-serif;
}
```

#### Regras tipográficas

- Headings (h1-h3) usam `font-heading` — serif orgânica para elegância e respiro
- Todo o resto usa `font-sans` — sans-serif limpa para legibilidade
- Preços **NUNCA** usam serif — sempre `font-sans font-bold`
- Letras maiúsculas (`uppercase tracking-wide`) apenas em: badges, tags de categoria, announcement bar, labels de formulário, botões CTA
- Nomes de produto são `font-heading` tanto em cards quanto na página de detalhe
- No hero banner, usar peso **light (300)** para contraste dramático com tamanho grande
- Em tamanhos ≤ 14px, **NUNCA** usar Cormorant Garamond — usar apenas Inter (serif fino fica ilegível em tamanhos pequenos)
- Inputs de formulário **SEMPRE** usam `font-sans text-base` (16px mínimo para evitar zoom no iOS)
- `display: "swap"` obrigatório no `next/font` — evita FOIT (Flash of Invisible Text)

---

### 5.1.3. ESPAÇAMENTO & GRID

| Token | Valor | Uso |
|-------|-------|-----|
| **Container max** | `1280px` | Conteúdo centralizado com `mx-auto` |
| **Padding lateral** | `px-4` (mobile), `px-6` (md), `px-8` (lg) | Respiro lateral responsivo |
| **Seção vertical** | `py-12` (mobile), `py-16` (md), `py-20` (lg) | Espaço entre seções da home |
| **Gap de grid** | `gap-4` (mobile), `gap-6` (md) | Entre cards de produto |
| **Card padding** | `p-4` | Padding interno dos product cards |

**Grid de produtos:**
```
Mobile:  grid-cols-2  (2 colunas, compacto)
Tablet:  grid-cols-3  (3 colunas)
Desktop: grid-cols-4  (4 colunas, máximo)
```

**Regras de espaçamento:**
- MUITO respiro entre seções — minimalismo inspirado na Nuancielo
- Cards nunca colados — sempre `gap-4` mínimo
- Texto nunca encosta na borda do card — sempre `p-4` mínimo
- Separadores visuais entre seções: linha sutil `border-t border-border` OU espaço vazio generoso

---

### 5.1.4. COMPONENTES — ANATOMIA

#### **Announcement Bar (topo fixo)**
- Fundo: `bg-primary` | Texto: `text-white` | Fonte: 13px, tracking-wide
- Conteúdo: frete grátis, prazo de envio, promoções
- Full width, altura fixa `h-10`, texto centralizado
- Pode ter ícone à esquerda (Truck, Clock, Shield)
- Scroll horizontal em mobile se houver múltiplas mensagens

#### **Header / Navbar**
- Fundo: `bg-bg-main` (transparente sobre o hero) ou `bg-white` com `shadow-sm` ao scrollar
- Logo centralizado (mobile) ou à esquerda (desktop)
- Links de navegação: `text-text-main font-medium text-sm tracking-wide uppercase`
- Hover dos links: `text-primary` com transição suave
- Ícones à direita: Busca (Search), Conta (User), Carrinho (ShoppingBag) com badge de contagem
- Badge do carrinho: círculo `bg-primary text-white` com número, tamanho `w-5 h-5 text-xs`
- **Mobile:** hamburger menu à esquerda, logo centro, ícones à direita
- **Mega menu (desktop):** dropdown com categorias em colunas, imagem de destaque lateral
- **Sidebar (mobile):** drawer da esquerda com navegação hierárquica (como Nuancielo)
- Sticky no scroll com `backdrop-blur-md bg-bg-main/90`

#### **Hero Banner**
- Full width, aspect ratio `3:1` (desktop), `16:9` (mobile)
- Imagem de alta qualidade com overlay gradiente sutil
- Texto sobreposto: heading serif grande + CTA
- CTA: botão primário ou botão com borda branca sobre imagem escura
- Carousel se houver múltiplos banners — autoplay com indicadores de dot
- Transição suave entre slides (fade ou slide)

#### **Trust Bar (abaixo do hero)**
- Fundo: `bg-white` ou `bg-surface-card` com borda sutil
- 4 itens lado a lado (flex, distribuição uniforme)
- Cada item: ícone (24px) + título bold + descrição pequena
- Itens: Frete Grátis, Parcele em até 12x, Site Seguro, Troca Garantida
- Mobile: 2x2 grid ou carousel horizontal com scroll
- Inspiração direta: trust badges da Nuancielo

#### **Product Card**
```
┌──────────────────────┐
│                      │
│     [Imagem 1:1]     │  ← aspect-square, object-cover, rounded-lg
│                      │
│  ♡ (wishlist icon)   │  ← posição absolute top-right
│                      │
├──────────────────────┤
│ CATEGORIA            │  ← text-xs uppercase tracking-wide text-text-muted
│ Nome do Produto      │  ← font-heading text-sm font-semibold line-clamp-2
│                      │
│ ★★★★☆ (42)          │  ← estrelas amarelas + contagem text-text-muted
│                      │
│ R$ 89,90             │  ← font-sans font-bold text-lg text-text-main
│ ou 4x de R$ 22,47    │  ← text-xs text-text-secondary
│                      │
│ [ADICIONAR ◦]        │  ← botão full-width ou ícone de carrinho
└──────────────────────┘
```

**Comportamentos:**
- Hover na imagem: leve zoom (`scale-105`, `transition-transform duration-300`)
- Hover no card: sombra sutil aparece (`shadow-md`)
- Imagem secundária no hover (se disponível) — swap suave com `opacity`
- Botão "Adicionar" aparece no hover (desktop) ou sempre visível (mobile)
- Se esgotado: overlay cinza com texto "Esgotado" + botão "Avise-me"
- Tag de desconto: badge `bg-error text-white` no canto superior esquerdo com `-20%`

#### **Product Detail Page**
- Layout: galeria (esquerda 55%) + info (direita 45%) em desktop
- **Galeria:** imagem principal grande + thumbnails em coluna vertical (estilo In The Box)
- Thumbnails clicáveis com borda `border-primary` quando ativo
- Mobile: carousel horizontal com dots
- **Info:** nome (heading serif), avaliações, preço destaque, seletor de quantidade, botão CTA grande
- Breadcrumb: `Home > Categoria > Produto` com `text-text-muted text-sm`
- Seções abaixo: Descrição, Avaliações, Produtos relacionados — com tabs ou accordion

#### **Cart Drawer (sidebar)**
- Drawer desliza da direita com overlay `bg-overlay`
- Header: "Meu Carrinho (3)" + botão fechar (X)
- Lista de itens: imagem pequena (80x80) + nome + preço + seletor quantidade + remover
- Seletor quantidade: botões `-` / `+` com input entre eles
- Subtotal fixo no rodapé do drawer
- Botão "Finalizar Compra": full-width, `bg-primary`, destaque
- Animação: `transition-transform duration-300` slide-in

#### **Category Page**
- Header da categoria: nome grande (serif) + descrição curta + contagem de produtos
- Filtros laterais (desktop) ou modal de filtros (mobile)
- Filtros: Preço (range slider), Categoria, Ordenar por
- Grid de produtos com paginação ou infinite scroll
- Breadcrumb no topo

#### **Footer**
- Fundo: `bg-primary text-white`
- 4 colunas: Sobre | Links Úteis | Atendimento | Newsletter
- Logo no topo do footer (versão branca/clara)
- Input de newsletter: `bg-white/10 border-white/20` com botão "Inscrever-se"
- Redes sociais: ícones circulares com hover `bg-white/20`
- Selos de pagamento: logos de bandeiras (Visa, Mastercard, Pix, etc.)
- Selo de segurança: "Site Seguro" / "Loja Confiável"
- Copyright + CNPJ na base com `text-white/60 text-xs`
- Separador sutil `border-t border-white/10` antes do copyright

#### **Botões**

| Variante | Classes |
|----------|---------|
| **Primário** | `bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors` |
| **Secundário** | `bg-secondary hover:bg-secondary-hover text-text-main font-semibold py-3 px-6 rounded-lg transition-colors` |
| **Outline** | `border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors` |
| **Ghost** | `text-primary hover:bg-primary/5 font-medium py-2 px-4 rounded-lg transition-colors` |
| **Destructive** | `bg-error hover:bg-error/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors` |
| **Icon** | `p-2 rounded-full hover:bg-primary/5 text-text-main transition-colors` |

**Regras de botões:**
- Border radius padrão: `rounded-lg` (8px) — NUNCA `rounded-full` para botões de ação (exceto icon buttons)
- Tamanho mínimo touch target: `min-h-[44px]` para mobile
- Transição suave: `transition-colors duration-200`
- CTA principal (Adicionar ao Carrinho, Finalizar Compra): SEMPRE variante primária, `w-full` no contexto do card
- Texto dos botões: `uppercase tracking-wide text-sm` para CTAs / normal para ações secundárias

#### **Inputs de Formulário**

```
bg-white border border-border-strong rounded-lg px-4 py-3
focus:border-primary focus:ring-2 focus:ring-primary/20
placeholder:text-text-muted
```

- Labels: `text-sm font-medium text-text-main` acima do input
- Mensagens de erro: `text-sm text-error mt-1`
- Inputs NUNCA flutuam o label (no floating labels) — label sempre acima, fixo

#### **Badges & Tags**

| Tipo | Classes |
|------|---------|
| **Categoria** | `bg-secondary text-text-main text-xs font-medium uppercase tracking-wide px-2 py-1 rounded` |
| **Desconto** | `bg-error text-white text-xs font-bold px-2 py-1 rounded` |
| **Novo** | `bg-primary text-white text-xs font-medium uppercase tracking-wide px-2 py-1 rounded` |
| **Esgotado** | `bg-text-muted text-white text-xs font-medium px-2 py-1 rounded` |
| **Frete grátis** | `bg-success/10 text-success text-xs font-medium px-2 py-1 rounded` |

---

### 5.1.5. LAYOUT DE PÁGINAS

#### **Home Page — Ordem das seções**
```
1. Announcement Bar (fixo no topo)
2. Header/Navbar (sticky)
3. Hero Banner (carousel full-width)
4. Trust Bar (4 ícones: frete, parcelamento, segurança, trocas)
5. Produtos em Destaque (grid 4 cols, título serif centralizado)
6. Banner de Categoria (imagem full-width com CTA — link para coleção)
7. Novidades / Lançamentos (grid ou carousel)
8. Banner secundário (split: imagem 50% + texto 50%)
9. Avaliações de Clientes (carousel de depoimentos com estrelas)
10. Newsletter (fundo surface-card, input + botão)
11. Footer
```

#### **Estilo visual dos títulos de seção (home)**
- Texto: `font-heading text-2xl md:text-3xl font-semibold text-text-main text-center`
- Subtítulo opcional: `text-text-secondary text-base mt-2 text-center`
- Espaço abaixo: `mb-8 md:mb-12`
- Podem ter um detalhe decorativo (linha curta `w-12 h-0.5 bg-primary mx-auto mt-4`)

#### **Avaliações de Clientes (seção home)**
- Inspiração: seção "MAIS DE 50 MIL AVALIAÇÕES" da Nuancielo
- Heading impactante com número grande
- Carousel de cards de depoimento
- Cada card: estrelas + texto do review + nome do cliente + cidade
- Fundo: `bg-surface-card`, cards: `bg-white rounded-lg p-6 shadow-sm`

---

### 5.1.6. ANIMAÇÕES & TRANSIÇÕES

| Elemento | Propriedade | Duração | Easing |
|----------|-------------|---------|--------|
| Hover em links/botões | `color, background-color` | `200ms` | `ease-in-out` |
| Hover em cards | `box-shadow, transform` | `300ms` | `ease-out` |
| Hover em imagens (zoom) | `transform: scale(1.05)` | `300ms` | `ease-out` |
| Drawers (cart/menu) | `transform: translateX` | `300ms` | `ease-in-out` |
| Modais | `opacity, transform: scale` | `200ms` | `ease-out` |
| Page transitions | `opacity` | `150ms` | `ease-in` |
| Skeleton loading | `background shimmer` | `1.5s` | `infinite linear` |

**Regras:**
- NUNCA usar animações chamativas ou excessivas — movimento sutil e intencional
- Skeleton loading para todas as imagens e listas enquanto carregam
- `will-change` apenas quando necessário (carousels, drawers)
- Preferir `transform` e `opacity` (GPU-accelerated) a `width`/`height`/`margin`
- `prefers-reduced-motion`: respeitar — desabilitar animações não-essenciais

---

### 5.1.7. RESPONSIVIDADE

| Breakpoint | Tailwind | Comportamento |
|------------|----------|---------------|
| < 640px | default | Tudo mobile-first: 2 cols produto, menu hamburger, drawer cart |
| ≥ 640px | `sm` | Leve ajuste de padding |
| ≥ 768px | `md` | 3 cols produto, sidebar de filtros aparece, header expandido |
| ≥ 1024px | `lg` | 4 cols produto, mega menu, layout 2 colunas na PDP |
| ≥ 1280px | `xl` | Container max-width, espaçamentos maiores |

**Regras mobile:**
- Touch targets mínimos: 44x44px
- Fontes: body 16px mínimo (evitar zoom no iOS)
- Imagens: priorizar `loading="lazy"` e `sizes` corretos
- Cart: sempre drawer (nunca página separada no mobile)
- Menu: sempre sidebar drawer (nunca dropdown)
- Filtros: modal bottom-sheet no mobile
- Preços: sempre visíveis sem scroll horizontal

---

### 5.1.8. ÍCONES

- Biblioteca: **Lucide React** (já incluído no shadcn/ui)
- Tamanho padrão: `w-5 h-5` (20px)
- Tamanho em nav: `w-6 h-6` (24px)
- Cor padrão: `text-text-main`
- Stroke width: 1.5 (padrão Lucide)
- Ícones essenciais: `Search`, `User`, `ShoppingBag`, `Heart`, `Menu`, `X`, `ChevronRight`, `Star`, `Truck`, `Shield`, `CreditCard`, `RefreshCw`, `Minus`, `Plus`, `Trash2`

---

### 5.1.9. SOMBRAS

| Token | Valor | Uso |
|-------|-------|-----|
| `shadow-card` | `0 1px 3px rgba(0,0,0,0.06)` | Cards em repouso |
| `shadow-card-hover` | `0 4px 12px rgba(0,0,0,0.08)` | Cards em hover |
| `shadow-dropdown` | `0 4px 16px rgba(0,0,0,0.12)` | Dropdowns, menus |
| `shadow-drawer` | `-4px 0 24px rgba(0,0,0,0.15)` | Cart drawer, mobile menu |

```typescript
// tailwind.config.ts → theme.extend.boxShadow
boxShadow: {
  card: "0 1px 3px rgba(0,0,0,0.06)",
  "card-hover": "0 4px 12px rgba(0,0,0,0.08)",
  dropdown: "0 4px 16px rgba(0,0,0,0.12)",
  drawer: "-4px 0 24px rgba(0,0,0,0.15)",
}
```

---

### 5.1.10. PRINCÍPIOS DE DESIGN — RESUMO

1. **Minimalismo orgânico** — fundos off-white, cores naturais, sem excesso de elementos
2. **Tipografia contrastante** — serif nos headings para elegância, sans-serif no corpo para clareza
3. **Muito respiro** — seções generosamente espaçadas, nunca apertado
4. **Imagem como protagonista** — fotos de produto grandes e de alta qualidade são o centro da experiência
5. **Hierarquia clara** — o olho deve ir: imagem → nome → preço → CTA, nessa ordem
6. **Consistência** — mesmos border-radius, sombras e espaçamentos em toda a loja
7. **Confiança** — trust bars, selos, avaliações reais sempre visíveis
8. **Mobile-first premium** — a experiência mobile deve ser tão boa quanto a desktop

---

## 6. REGRAS DE CÓDIGO — FRONTEND NEXT.JS

### FAÇA

- Use **App Router** — Server Components por padrão
- Adicione `"use client"` APENAS quando o componente usa hooks, eventos de browser ou estado
- Coloque data fetching em **Server Components** ou **Server Actions** — nunca `useEffect` + fetch para dados iniciais
- Use `fetch` tipado em `lib/api.ts` para comunicação com o backend ASP.NET
- Formate dinheiro com: `(centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })`
- Extraia isso para `lib/utils.ts` como `formatCurrency(cents: number): string`
- Use Zustand para carrinho — persista em localStorage via middleware `persist`
- Use Zod para validar formulários — schemas em arquivo separado por feature
- Imagens de produto com `next/image` — sempre com `alt`, `width`, `height`
- Trate loading com `loading.tsx` e errors com `error.tsx` por rota
- URLs da API em variáveis de ambiente `NEXT_PUBLIC_API_URL` (apenas URL pública, sem secrets)

### NÃO FAÇA

- ❌ `"use client"` em páginas inteiras — isole Client Components no menor wrapper possível
- ❌ `any` — TypeScript estrito, defina types para tudo
- ❌ CSS modules ou styled-components — use APENAS Tailwind
- ❌ Armazenar tokens JWT em localStorage — use httpOnly cookies via backend
- ❌ Chamar AbacatePay diretamente do frontend — sempre via backend
- ❌ `console.log` em produção — remova ou use condicionalmente
- ❌ Strings hardcoded para textos da UI — centralize em constantes (preparar para i18n futuro)

### PADRÃO: API client

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function api<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
```

### PADRÃO: Zustand store

```typescript
// stores/cart-store.ts
interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  totalCents: () => number;
}
```

---

## 7. ABACATEPAY — REFERÊNCIA COMPLETA DA API

> **Base URL:** `https://api.abacatepay.com/v1`
> **Auth:** `Authorization: Bearer <key>` (key em variável de ambiente, NUNCA hardcoded)
> **Respostas:** `{ "data": T | null, "error": string | null }` — SEMPRE cheque `error` antes de usar `data`
> **Dinheiro:** centavos (int). R$ 150,00 = `15000`
> **Documentação detalhada:** `_abacate-pay-documentation/`

### Endpoints

| Método | Endpoint | Body/Query | Uso no projeto |
|--------|----------|------------|----------------|
| `POST` | `/v1/customer/create` | `{name, cellphone, email, taxId}` | Cadastro de cliente no checkout |
| `GET` | `/v1/customer/list` | — | Admin: listar clientes |
| `POST` | `/v1/coupon/create` | `{code, notes, discountKind, discount, maxRedeems?, metadata?}` | Admin: criar cupom |
| `GET` | `/v1/coupon/list` | — | Admin: listar cupons |
| `POST` | `/v1/billing/create` | `{frequency, methods[], products[], returnUrl, completionUrl, ...}` | **CORE:** criar cobrança após checkout |
| `GET` | `/v1/billing/list` | — | Admin: listar cobranças |
| `POST` | `/v1/pixQrCode/create` | `{amount, expiresIn?, description?, customer?, metadata?}` | Gerar QR PIX direto |
| `GET` | `/v1/pixQrCode/check?id=` | query `id` | Polling status PIX |
| `POST` | `/v1/pixQrCode/simulate-payment?id=` | query `id` | **DEV ONLY:** simular pagamento |
| `POST` | `/v1/withdraw/create` | `{externalId, method, amount (≥350), pix: {type, key}}` | Admin: solicitar saque |
| `GET` | `/v1/withdraw/get?externalId=` | query `externalId` | Admin: status do saque |
| `GET` | `/v1/withdraw/list` | — | Admin: listar saques |
| `GET` | `/v1/store/get` | — | Admin: saldo da loja |
| `GET` | `/v1/public-mrr/merchant-info` | — | Admin: info da loja |
| `GET` | `/v1/public-mrr/mrr` | — | Admin: MRR |
| `GET` | `/v1/public-mrr/revenue?startDate=&endDate=` | query dates `YYYY-MM-DD` | Admin: receita por período |

### Billing create — campos completos (o endpoint mais importante)

```
frequency:     "ONE_TIME" | "MULTIPLE_PAYMENTS"           (obrigatório)
methods:       ["PIX"] | ["CARD"] | ["PIX","CARD"]        (obrigatório, 1-2 itens)
products:      [{ name, quantity, price, externalId?, description? }]  (obrigatório, price em centavos)
returnUrl:     string URI                                  (obrigatório)
completionUrl: string URI                                  (obrigatório)
customerId?:   string                                      (ID de cliente existente)
customer?:     { name, cellphone, email, taxId }           (cria cliente se não existir)
allowCoupons?: boolean (default false)
coupons?:      string[] (máx 50)
externalId?:   string                                      (SEU id de pedido — use para idempotência)
metadata?:     object
```

### Webhooks

A AbacatePay envia POST para URL cadastrada. Payload:

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
    "customer": { "id": "cust_abc123", "email": "customer@example.com" },
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:05:00.000Z"
  }
}
```

**Eventos:** `billing.created`, `billing.paid`, `billing.refunded`, `billing.failed`, `subscription.created`, `subscription.canceled`

**Regras obrigatórias para webhooks:**
1. Validar `webhookSecret` com comparação de tempo constante (`CryptographicOperations.FixedTimeEquals`)
2. Ignorar `devMode: true` em produção
3. Implementar idempotência — use `data.id` como chave. Mesmo evento pode chegar 2x
4. Responder `200 OK` — qualquer outro status causa retry
5. Processar em background job (Hangfire) para operações pesadas
6. Tratar payload como append-only — novos campos podem surgir sem aviso

---

## 8. SEGURANÇA — REGRAS INVIOLÁVEIS

- ❌ NUNCA exponha `AbacatePay:ApiKey` ou `AbacatePay:WebhookSecret` no frontend, logs ou repositório
- ❌ NUNCA use `devMode: true` como transação real em produção
- ❌ NUNCA armazene senhas em plaintext — use ASP.NET Identity (bcrypt/PBKDF2)
- ❌ NUNCA confie em input do frontend — valide TUDO no backend com FluentValidation
- ❌ NUNCA retorne stack traces em respostas HTTP de produção
- ✅ SEMPRE use HTTPS em produção (Certbot/Let's Encrypt)
- ✅ SEMPRE use parameterized queries (EF Core faz isso automaticamente — nunca raw SQL interpolado)
- ✅ SEMPRE valide e sanitize input em endpoints públicos
- ✅ SEMPRE use CORS restrito — apenas o domínio do frontend
- ✅ SEMPRE use rate limiting nos endpoints de auth e webhook
- ✅ SEMPRE use httpOnly + Secure + SameSite cookies para tokens de sessão

---

## 9. CONVENÇÕES DE NOMENCLATURA

### C# (Backend)

| Elemento | Padrão | Exemplo |
|----------|--------|---------|
| Classes/Records | PascalCase | `OrderService`, `CreateOrderRequest` |
| Interfaces | I + PascalCase | `IOrderService` |
| Métodos | PascalCase async | `ConfirmPaymentAsync()` |
| Variáveis/Parâmetros | camelCase | `orderId`, `webhookSecret` |
| Constantes | PascalCase | `MaxRetries` |
| Arquivos | = Nome da classe | `OrderService.cs` |
| Endpoints | kebab-case | `/api/orders`, `/api/order-items` |
| JSON serialization | camelCase | `{ "orderId": "..." }` |

### TypeScript (Frontend)

| Elemento | Padrão | Exemplo |
|----------|--------|---------|
| Componentes | PascalCase | `ProductCard`, `CartDrawer` |
| Hooks | camelCase com use | `useCart()`, `useAuth()` |
| Stores | kebab-case arquivo | `cart-store.ts` |
| Types/Interfaces | PascalCase | `Product`, `CartItem` |
| Funções | camelCase | `formatCurrency()`, `addToCart()` |
| Variáveis env | SCREAMING_SNAKE | `NEXT_PUBLIC_API_URL` |
| CSS classes | Tailwind utilities | `className="flex items-center gap-2"` |

---

## 10. FLUXOS DE NEGÓCIO CRÍTICOS

### Checkout (fluxo principal do e-commerce)

```
1. Frontend: usuário clica "Finalizar Compra"
2. Frontend → Backend: POST /api/orders { items, customerData }
3. Backend: valida estoque, cria Order no PostgreSQL (status: PENDING)
4. Backend → AbacatePay: POST /v1/billing/create { products, customer, externalId: order.Id }
5. Backend: salva billing.id na Order, retorna billing.url para frontend
6. Frontend: redireciona para billing.url (checkout da AbacatePay)
7. AbacatePay → Backend: POST /api/webhooks/abacatepay { event: "billing.paid" }
8. Backend: atualiza Order (status: PAID), decrementa estoque, enfileira email
9. Frontend: usuário volta via completionUrl → página de confirmação
```

### Regras de negócio dos fluxos:
- Reservar estoque ao criar pedido, liberar se não pago em 30 min (Hangfire job)
- `externalId` na billing = `order.Id` — garante rastreabilidade
- Se webhook `billing.paid` chegar para pedido já pago → ignorar (idempotência)
- Se webhook `billing.failed` → marcar pedido como FAILED e liberar estoque

---

## 11. DOCKER & DEPLOY

### docker-compose.yml

```yaml
services:
  frontend:
    build: ./frontend
    ports: ["3003:3003"]
    restart: unless-stopped

  backend:
    build: ./backend
    ports: ["5000:5000"]
    depends_on: [postgres, redis]
    env_file: .env
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: ecommerce
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes: [redisdata:/data]
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./certbot:/etc/letsencrypt
    depends_on: [frontend, backend]
    restart: unless-stopped

volumes:
  pgdata:
  redisdata:
```

### Backend Dockerfile

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY *.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 5000
ENTRYPOINT ["dotnet", "EcommerceApi.dll"]
```

### Variáveis de ambiente

```env
AbacatePay__ApiKey=sk_live_...
AbacatePay__WebhookSecret=whsec_...
DB_PASSWORD=...
ConnectionStrings__DefaultConnection=Host=postgres;Database=ecommerce;Username=app;Password=...
ConnectionStrings__Redis=redis:6379
Jwt__Secret=...
Jwt__Issuer=leaf-ecommerce
Jwt__Audience=leaf-ecommerce
ASPNETCORE_URLS=http://+:5000
ASPNETCORE_ENVIRONMENT=Production
```

---

## 12. COMPORTAMENTO DO AGENTE

Ao receber qualquer tarefa neste workspace:

1. **Leia antes de escrever** — entenda o código existente antes de modificar
2. **Siga esta stack** — não sugira tecnologias alternativas
3. **Siga estes padrões** — não use Controllers, Repository pattern, ou qualquer anti-pattern listado
4. **Pense em e-commerce** — toda feature se conecta a produtos, pedidos, pagamentos ou clientes
5. **Pense em AbacatePay** — qualquer lógica de pagamento DEVE usar a API documentada aqui e em `_abacate-pay-documentation/`
6. **Implemente, não sugira** — quando pedido para criar algo, crie o código completo e funcional
7. **Teste primeiro** — ao criar uma feature, considere testabilidade. Services devem receber dependências via DI
8. **Erros claros** — mensagens de erro devem ajudar o dev a entender o que deu errado
9. **Segurança sempre** — aplique as regras da seção 8 automaticamente, sem precisar ser lembrado

---

## 13. ESTADO ATUAL DA IMPLEMENTAÇÃO

> **Atualizado em:** Março 2026

### Backend — Implementado

| Recurso | Endpoint(s) | Status |
|---------|-------------|--------|
| Produtos | `GET/POST/PUT/DELETE /api/products` | ✅ CRUD completo + filtros + paginação + slug |
| Categorias | `GET/POST/PUT/DELETE /api/categories` | ✅ CRUD completo com slug |
| Pedidos | `GET/POST /api/orders` | ✅ Criação + listagem (autenticado) |
| Pagamentos | `POST /api/webhooks/abacatepay` | ✅ Webhook com dedup Redis + billing flow |
| Cupons | `GET /api/coupons/validate?code=` | ✅ Valida via AbacatePay API |
| Auth | `POST /api/auth/login\|register\|logout`, `GET /api/auth/me`, `PUT /api/auth/profile\|password` | ✅ JWT em httpOnly cookie |
| Admin | `GET /api/admin/dashboard` | ✅ Stats (produtos, pedidos, receita) |
| Sync Payment | `POST /api/orders/{id}/sync-payment` | ✅ Admin-only: sincroniza status com AbacatePay |
| Forgot Password | `POST /api/auth/forgot-password\|reset-password` | ✅ Token-based reset |
| Seed Data | Automático em dev | ✅ 40+ perfumes + categorias + admin user |

### Frontend — Implementado

| Página/Feature | Rota | Status |
|---------------|------|--------|
| Home | `/` | ✅ Hero + Trust Bar + Destaques + Novidades + Reviews + Newsletter |
| Listagem de Produtos | `/products` | ✅ Grid + filtros (categoria, busca, ordenação) + paginação |
| Detalhe do Produto | `/products/[slug]` | ✅ Galeria + info + quantidade + adicionar ao carrinho |
| Checkout | `/checkout` | ✅ Auth flow (login/register/guest) + cupom + AbacatePay redirect |
| Confirmação | `/orders/confirmation` | ✅ Status do pedido |
| Login / Register | `/login`, `/register` | ✅ Com redirect pós-login |
| Perfil | `/profile` | ✅ Editar nome, telefone, CPF/CNPJ |
| Meus Pedidos | `/orders` | ✅ Lista + status labels |
| Favoritos | `/wishlist` | ✅ Persistido em localStorage |
| Forgot/Reset Password | `/forgot-password`, `/reset-password` | ✅ |
| Admin Dashboard | `/admin` | ✅ Stats + AdminGuard (role-based) |
| Admin Produtos | `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit` | ✅ CRUD + toggle ativo/inativo |
| Admin Categorias | `/admin/categories` | ✅ CRUD inline |
| Admin Pedidos | `/admin/orders` | ✅ Lista com status + sync payment |

### Infraestrutura

| Item | Status |
|------|--------|
| docker-compose.dev.yml | ✅ PostgreSQL 16 + Redis 7 |
| docker-compose.yml (produção) | ✅ Full stack com nginx + certbot |
| nginx/nginx.conf | ✅ Reverse proxy + SSL + security headers |
| deploy.sh | ✅ Setup + SSL + deploy + backup + logs |
| .env.example | ✅ Todas as variáveis documentadas |
| .gitignore | ✅ Node, .NET, env, volumes |
| start-dev.ps1 | ✅ Script PowerShell para dev local |
| Backend Dockerfile | ✅ Multi-stage .NET 10 |
| Frontend Dockerfile | ✅ Multi-stage Node 22 standalone |
| 57 testes unitários | ✅ Todos passando |

### Portas de Desenvolvimento

| Serviço | Porta |
|---------|-------|
| Frontend (Next.js) | 3003 |
| Backend (ASP.NET) | 5228 |
| PostgreSQL | 5432 |
| Redis | 6379 |

### Features Pendentes (TODO)

- [ ] SendEmailJob — atualmente stub (loga no console, não envia e-mail real)
- [ ] Newsletter backend endpoint — formulário funcional, sem persistência
- [ ] Imagens de produto — upload/storage (atualmente URLs externas)
- [ ] Avaliações de produto — atualmente dados estáticos na home
- [ ] SEO avançado — sitemap.xml, robots.txt
- [ ] PWA — service worker, manifest.json
- [ ] Busca avançada — Elasticsearch ou similar
- [ ] i18n — preparado mas não implementado
