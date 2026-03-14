export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceInCents: number;
  stock: number;
  isActive: boolean;
  categoryId: string;
  categoryName: string;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  displayOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  status: string;
  totalInCents: number;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  paidAt: string | null;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceInCents: number;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  priceInCents: number;
  quantity: number;
  imageUrl: string | null;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  taxId: string | null;
  roles?: string[];
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export interface CreateOrderRequest {
  items: { productId: string; quantity: number }[];
  customer: {
    name: string;
    email: string;
    phone?: string;
    taxId?: string;
  };
}

export interface CreateOrderResponse {
  orderId: string;
  checkoutUrl: string | null;
}

export interface CouponInfo {
  code: string;
  discountKind: "PERCENTAGE" | "FIXED";
  discount: number;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  taxId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ErrorResponse {
  message: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  paidOrders: number;
  totalRevenueCents: number;
}
