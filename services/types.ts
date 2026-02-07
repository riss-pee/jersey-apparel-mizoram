
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  password?: string;
  role: UserRole;
  createdAt: string;
}

export type ProductStatus = 'AVAILABLE' | 'ON_SALE' | 'OUT_OF_STOCK' | 'DISCONTINUED';

export interface Product {
  id: string;
  name: string;
  team: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  stock: number;
  status: ProductStatus;
  category: 'PREMIER_LEAGUE' | 'LA_LIGA' | 'SERIE_A' | 'INTERNATIONAL' | 'OTHER';
  sizes: string[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  accentColor: string;
  displayOrder: number;
}

export interface SiteSettings {
  id: string;
  aboutUs: string;
  instagramHandle: string;
  whatsappNumber: string;
  footerTagline: string;
  paymentQrCode?: string;
  upiId?: string;
  gPayNumber?: string;
  paytmNumber?: string;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
  size: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  shippingAddress: string;
  latitude?: number;
  longitude?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
