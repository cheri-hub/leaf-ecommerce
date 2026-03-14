# Frontend — Status & Pendências

> Última atualização: 2026-03-11
> Build: **Compila com sucesso** (0 erros TypeScript, 0 warnings)
> Rotas: **17 rotas** (8 estáticas + 9 dinâmicas)
> Completude geral: **~95%** (todas as features implementadas, pendências de integração real e polish)

---

## O que está PRONTO

### Estrutura & Configuração
- [x] Projeto Next.js 16 (App Router, TypeScript strict, Turbopack)
- [x] Estrutura de pastas conforme copilot-instructions.md
- [x] Tailwind CSS v4 com design system completo (`@theme inline`)
- [x] 16 CSS custom properties (cores, fontes, sombras)
- [x] Fontes: Inter (sans) + Playfair Display (heading) via `next/font/google`
- [x] `next.config.ts` com `output: "standalone"` e remote image patterns
- [x] Dockerfile multi-stage (node:22-alpine, build + runner)
- [x] Path alias `@/*` configurado
- [x] Middleware de proteção de rotas (auth, admin, guest)

### Lib (utilitários e infraestrutura)
- [x] `api.ts` — Fetch wrapper tipado com `ApiError`, `credentials: "include"`, `NEXT_PUBLIC_API_URL`
- [x] `utils.ts` — `cn()` (clsx), `formatCurrency(cents)` BRL, `formatInstallments()`, `slugify()`
- [x] `constants.ts` — SITE_NAME, NAV_LINKS, TRUST_ITEMS, ORDER_STATUS_LABELS, ITEMS_PER_PAGE
- [x] `schemas.ts` — Zod v4 schemas: `loginSchema`, `registerSchema`, `checkoutSchema`, `categorySchema`, `productSchema`

### Types (TypeScript)
- [x] `types/index.ts` — Product, ProductImage, Category, Order, OrderItem, CartItem, User, AuthResponse, PaginatedResponse\<T\>, CreateOrderRequest, CreateOrderResponse, RegisterRequest, LoginRequest, ErrorResponse, DashboardStats

### Stores (Zustand)
- [x] `cart-store.ts` — addItem, removeItem, updateQuantity, clear, totalCents, totalItems, persistência em localStorage
- [x] `auth-store.ts` — login, register, logout, fetchUser (sem persistência — httpOnly cookies)
- [x] `wishlist-store.ts` — toggle, has, clear, persistência em localStorage

### Hooks
- [x] `use-auth.ts` — Wrapper do auth store com auto-fetch do usuário no mount
- [x] `use-cart.ts` — Re-export do cart store
- [x] `use-debounce.ts` — Hook genérico de debounce

### Componentes de Layout (6)
- [x] `announcement-bar.tsx` — Barra verde no topo com ícone de caminhão e frete grátis
- [x] `header.tsx` — Sticky, blur no scroll, sidebar mobile, badge do carrinho, busca, mega menu desktop, categorias no mobile
- [x] `footer.tsx` — 4 colunas (Sobre, Links, Atendimento, Newsletter), badges de pagamento, copyright
- [x] `hero-banner.tsx` — Carousel multi-slide com auto-play, dots, setas, fade transition
- [x] `trust-bar.tsx` — 4 itens: Frete Grátis, Parcelamento, Site Seguro, Trocas
- [x] `search-modal.tsx` — Modal de busca full-screen com atalhos de teclado (Esc/Enter)

### Componentes de Produto (4)
- [x] `product-card.tsx` — Card com imagem, categoria, nome, preço, parcelas, wishlist funcional, overlay esgotado
- [x] `product-skeleton.tsx` — ProductCardSkeleton + ProductGridSkeleton (shimmer)
- [x] `product-detail-client.tsx` — Galeria com thumbnails, seletor de quantidade, add to cart, breadcrumb
- [x] `products-client.tsx` — Listagem com busca, filtro de categoria, grid responsivo, paginação, empty state melhorado

### Componentes de UI (2)
- [x] `pagination.tsx` — Paginação com ellipsis, prev/next
- [x] `quantity-selector.tsx` — Botões -/+ com min/max

### Componentes de Carrinho (1)
- [x] `cart-drawer.tsx` — Drawer lateral direito com overlay, lista de itens, subtotal, botão finalizar, empty state com ícone

### Componentes de Auth (2)
- [x] `login-form.tsx` — Formulário com React Hook Form + Zod, integração com auth store, redirect após login
- [x] `register-form.tsx` — Formulário com confirmação de senha, validação cruzada via `.refine()`

### Componentes de Checkout (1)
- [x] `checkout-client.tsx` — Formulário de dados + resumo do pedido, integração com cart store

### Componentes de Home (3)
- [x] `featured-products.tsx` — Server Component assíncrono com Suspense, busca 8 produtos
- [x] `newsletter-section.tsx` — Formulário de newsletter conectado à API com feedback (sonner)
- [x] `reviews-section.tsx` — Seção de avaliações de clientes com carousel e navegação por dots

### Componentes de Conta (3)
- [x] `profile-client.tsx` — Exibição de dados do usuário, link para pedidos, logout
- [x] `orders-client.tsx` — Lista de pedidos com badges de status, empty state melhorado
- [x] `order-detail-client.tsx` — Detalhe do pedido com breadcrumb, status, itens

### Componentes de Admin (2)
- [x] `product-form.tsx` — Formulário compartilhado de criar/editar produto com categorias
- [x] `image-upload.tsx` — Upload de imagens com drag-and-drop, grid, badge "Principal", remoção

### Páginas — Shop (5 rotas)
- [x] `/` — Home (Server Component): Hero carousel, Trust Bar, 2 seções de produtos destaque, reviews, newsletter
- [x] `/products` — Listagem de produtos (client) com busca e filtros
- [x] `/products/[slug]` — Detalhe do produto (Server Component + client component) com metadata dinâmico
- [x] `/checkout` — Checkout (client) com formulário e resumo
- [x] `loading.tsx` + `error.tsx` + `not-found.tsx` (produto) — Boundaries

### Páginas — Account (5 rotas)
- [x] `/login` — Login (Server wrapper + client form) com metadata
- [x] `/register` — Registro (Server wrapper + client form) com metadata
- [x] `/profile` — Perfil do usuário com metadata
- [x] `/orders` — Lista de pedidos com metadata
- [x] `/orders/[id]` — Detalhe do pedido
- [x] `loading.tsx` — Skeleton loader para rotas de conta

### Páginas — Admin (7 rotas)
- [x] `/admin` — Dashboard com 4 cards de estatísticas
- [x] `/admin/products` — Tabela de produtos com ações (editar, excluir)
- [x] `/admin/products/new` — Formulário de criar produto
- [x] `/admin/products/[id]/edit` — Formulário de editar produto
- [x] `/admin/categories` — CRUD completo de categorias (criar, editar, excluir)
- [x] `/admin/orders` — Tabela de pedidos
- [x] `/admin/orders/[id]` — Detalhe do pedido (3 cards info + tabela de itens)
- [x] `loading.tsx` — Skeleton loader para rotas admin

### Layouts
- [x] Root layout (`layout.tsx`) — `lang="pt-BR"`, metadata, fontes globais, Toaster (sonner)
- [x] Shop layout — AnnouncementBar + Header + Footer, `dynamic = "force-dynamic"`
- [x] Account layout — Mesma shell do shop, `dynamic = "force-dynamic"`
- [x] Admin layout — Header dedicado com navegação admin (Dashboard, Produtos, Categorias, Pedidos)
- [x] `not-found.tsx` global — Página 404 customizada

### SEO
- [x] Metadata estático na home, produtos, checkout, login, registro, perfil, pedidos
- [x] `generateMetadata` dinâmico em `/products/[slug]` (título, descrição, og:image)
- [x] Root metadata com título e descrição padrão

### Design System
- [x] Paleta de 16 cores (orgânica/premium) mapeada em CSS vars + Tailwind tokens
- [x] Tipografia: Playfair Display (headings) + Inter (corpo)
- [x] Sombras customizadas: card, card-hover, dropdown, drawer
- [x] Animação de shimmer para skeletons
- [x] Espaçamento e grid responsivo (2/3/4 colunas)
- [x] Mobile-first com breakpoints sm/md/lg/xl
- [x] Seção de Avaliações de clientes (carousel com estrelas, nomes, cidades)
- [x] Mega menu desktop com dropdown de categorias
- [x] Carousel hero com múltiplos slides, auto-play, dots e setas
- [x] Toast/notificações via sonner (bottom-right, richColors)

---

## O que está PENDENTE

### Pendências Funcionais (requer implementação)

| # | Item | Prioridade | Descrição |
|---|------|-----------|-----------|
| 1 | **Integração real com API** | 🔴 Alta | Componentes usam dados mock ou chamadas que dependem do backend rodando. Necessário testar fluxo completo frontend ↔ backend |
| 2 | **Banner de categoria na home** | 🟢 Baixa | Seção de banner split (imagem 50% + texto 50%) não implementada na home |

### Pendências de Polish (melhorias visuais/UX)

| # | Item | Descrição |
|---|------|-----------|
| 3 | **Imagens otimizadas** | Verificar `next/image` com `sizes` corretos e `priority` nos LCP |
| 4 | **Acessibilidade (a11y)** | Revisar aria-labels, focus management no drawer/sidebar, keyboard navigation |
| 5 | **Testes** | Nenhum teste unitário ou de integração no frontend. Considerar Vitest + Testing Library |
| 6 | **Strings hardcoded na UI** | Parcialmente centralizado — textos de páginas ainda inline |

---

## Checklist de Segurança (§8)

| Regra | Status |
|-------|--------|
| Secrets apenas em env vars do servidor | ✅ Apenas `NEXT_PUBLIC_API_URL` é exposta (URL pública, sem secrets) |
| AbacatePay NUNCA chamada do frontend | ✅ Todas as chamadas vão via backend `/api/*` |
| Tokens JWT em httpOnly cookies | ✅ `credentials: "include"` no fetch, sem localStorage para tokens |
| Input validado com Zod | ✅ Schemas para login, register, checkout, categories, products |
| Sem `any` no TypeScript | ✅ TypeScript strict, tipos em `types/index.ts` |
| Valores monetários em centavos (int) | ✅ `formatCurrency(cents)` formata apenas na UI |
| Proteção de rotas | ✅ Middleware redireciona para `/login` em rotas autenticadas |
| Sem `console.log` em produção | ⚠️ Verificar e remover antes do deploy |

---

## Checklist de Design System (§5.1)

| Elemento | Status |
|----------|--------|
| Paleta de 16 cores | ✅ Implementada em CSS vars + Tailwind tokens |
| Tipografia Playfair + Inter | ✅ Configurada via next/font |
| Announcement Bar | ✅ Implementada |
| Header/Navbar sticky + blur | ✅ Implementado com mega menu desktop e sidebar mobile com categorias |
| Footer 4 colunas | ✅ Implementado |
| Trust Bar | ✅ Implementada |
| Hero Banner | ✅ Carousel multi-slide com auto-play, dots, setas, fade |
| Product Card | ✅ Implementado conforme anatomia do design system com wishlist funcional |
| Cart Drawer | ✅ Implementado com slide-in e empty state melhorado |
| Skeletons (shimmer) | ✅ Implementados para shop, account e admin |
| Botões (5 variantes) | ✅ Estilos aplicados conforme tabela |
| Inputs de formulário | ✅ Estilo consistente com focus ring |
| Badges & Tags | ✅ Categoria, desconto, status |
| Sombras customizadas | ✅ card, card-hover, dropdown, drawer |
| Responsividade mobile-first | ✅ Grid 2/3/4 colunas, drawer, sidebar |
| Animações sutis | ✅ Hover em cards, zoom em imagens, transições, carousel |
| Seção de Avaliações | ✅ Carousel com estrelas, nomes e cidades |
| Mega menu desktop | ✅ Dropdown com categorias em 2 colunas |
| Carousel hero | ✅ Multi-slide com auto-play, navegação, dots |
| Banner de categoria split | ❌ Não implementado na home |
| Busca no header | ✅ Modal de busca com atalhos de teclado |
| Toast/notificações | ✅ Sonner com feedback visual para ações |

---

## Arquitetura de páginas

```
Rotas estáticas (8):
  ○ /                    → Home (Server Component com metadata)
  ○ /_not-found          → 404 global
  ○ /admin               → Dashboard (client component)
  ○ /admin/categories    → CRUD de categorias
  ○ /admin/orders        → Tabela de pedidos
  ○ /admin/products      → Tabela de produtos com ações
  ○ /admin/products/new  → Formulário de novo produto

Rotas dinâmicas (9):
  ƒ /checkout            → Checkout (client) com metadata
  ƒ /login               → Login (client form) com metadata
  ƒ /register            → Registro (client form) com metadata
  ƒ /profile             → Perfil (client) com metadata
  ƒ /orders              → Lista pedidos (client) com metadata
  ƒ /orders/[id]         → Detalhe pedido (client)
  ƒ /products            → Listagem (client) com metadata
  ƒ /products/[slug]     → Detalhe produto (Server + client) com generateMetadata
  ƒ /admin/orders/[id]   → Detalhe pedido admin
  ƒ /admin/products/[id]/edit → Editar produto
```

---

## Resumo de arquivos (por diretório)

| Diretório | Arquivos | Descrição |
|-----------|----------|-----------|
| `src/app/` | 3 | Root layout, globals.css, not-found |
| `src/app/(shop)/` | 8 | Layout, home, loading, error, checkout, products (list + detail + 404) |
| `src/app/(account)/` | 7 | Layout, loading, login, register, profile, orders (list + detail) |
| `src/app/(admin)/` | 9 | Layout, loading, dashboard, products (list + new + edit), categories, orders (list + detail) |
| `src/components/layout/` | 6 | Announcement, header, footer, hero, trust bar, search modal |
| `src/components/product/` | 4 | Card, skeleton, detail, listing |
| `src/components/ui/` | 2 | Pagination, quantity selector |
| `src/components/cart/` | 1 | Cart drawer |
| `src/components/auth/` | 2 | Login form, register form |
| `src/components/checkout/` | 1 | Checkout client |
| `src/components/home/` | 3 | Featured products, newsletter, reviews |
| `src/components/account/` | 3 | Profile, orders, order detail |
| `src/components/admin/` | 2 | Product form, image upload |
| `src/lib/` | 4 | API client, utils, constants, schemas |
| `src/stores/` | 3 | Cart store, auth store, wishlist store |
| `src/hooks/` | 3 | useAuth, useCart, useDebounce |
| `src/types/` | 1 | Tipos compartilhados |
| `src/` | 1 | middleware.ts |
| **Total** | **~63** | |
