export const SITE_NAME = "Leaf E-commerce";

export const NAV_LINKS = [
  { label: "Início", href: "/" },
  { label: "Produtos", href: "/products" },
] as const;

export const TRUST_ITEMS = [
  { icon: "Truck", title: "Frete Grátis", description: "Em compras acima de R$ 400" },
  { icon: "CreditCard", title: "Parcele em até 12x", description: "4x sem juros" },
  { icon: "Shield", title: "Site Seguro", description: "Seus dados protegidos" },
  { icon: "RefreshCw", title: "Troca Garantida", description: "Até 30 dias para trocar" },
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  Pending: "Pendente",
  Paid: "Pago",
  Refunded: "Reembolsado",
  Failed: "Falhou",
  Cancelled: "Cancelado",
};

export const ITEMS_PER_PAGE = 12;
