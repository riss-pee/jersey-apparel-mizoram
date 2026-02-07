
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
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
  description: string;
  stock: number;
  status: ProductStatus;
  category: 'PREMIER_LEAGUE' | 'LA_LIGA' | 'SERIE_A' | 'INTERNATIONAL' | 'OTHER';
  sizes: string[]; // Added sizes field
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
  size: string; // Added size field
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
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
