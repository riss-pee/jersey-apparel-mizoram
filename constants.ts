
import { Product } from './types.ts';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Mizoram Home Jersey 2024',
    team: 'Mizoram FA',
    price: 1200,
    image: 'https://picsum.photos/seed/mizoram/600/800',
    images: ['https://picsum.photos/seed/mizoram/600/800'],
    description: 'The official home jersey for the pride of Mizoram. Features moisture-wicking technology and premium embroidery.',
    stock: 50,
    status: 'AVAILABLE',
    category: 'INTERNATIONAL',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: '2',
    name: 'Aizawl FC Home Jersey',
    team: 'Aizawl FC',
    price: 1500,
    image: 'https://picsum.photos/seed/aizawlfc/600/800',
    images: ['https://picsum.photos/seed/aizawlfc/600/800'],
    description: 'Official Aizawl FC home kit. Show your support for the People\'s Club.',
    stock: 30,
    status: 'ON_SALE',
    category: 'OTHER',
    sizes: ['M', 'L', 'XL', 'XXL']
  },
  {
    id: '3',
    name: 'Real Madrid 24/25 Home',
    team: 'Real Madrid',
    price: 3500,
    image: 'https://picsum.photos/seed/madrid/600/800',
    images: ['https://picsum.photos/seed/madrid/600/800'],
    description: 'Classic white Real Madrid jersey. Authentic player edition with premium fabric.',
    stock: 15,
    status: 'AVAILABLE',
    category: 'LA_LIGA',
    sizes: ['S', 'M', 'L']
  },
  {
    id: '4',
    name: 'Manchester City Away Kit',
    team: 'Manchester City',
    price: 3200,
    image: 'https://picsum.photos/seed/mancity/600/800',
    images: ['https://picsum.photos/seed/mancity/600/800'],
    description: 'Stylish away kit for the 2024 season. Built for performance and style.',
    stock: 20,
    status: 'AVAILABLE',
    category: 'PREMIER_LEAGUE',
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  }
];

export const STORAGE_KEYS = {
  USERS: 'jam_users',
  PRODUCTS: 'jam_products',
  ORDERS: 'jam_orders',
  SESSION: 'jam_session',
  CART: 'jam_cart'
};
