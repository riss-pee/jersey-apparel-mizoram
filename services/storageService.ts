
import { supabase } from './supabaseClient';
import { User, Product, Order } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

const mapOrderFromDB = (dbOrder: any): Order => {
  return {
    id: dbOrder.id,
    userId: dbOrder.user_id || dbOrder.userId,
    userName: dbOrder.user_name || dbOrder.userName || 'Guest User',
    userEmail: dbOrder.user_email || dbOrder.userEmail || 'No Email',
    items: dbOrder.items || [],
    totalAmount: Number(dbOrder.total_amount || dbOrder.totalAmount || 0),
    status: dbOrder.status || 'PENDING',
    createdAt: dbOrder.created_at || dbOrder.createdAt || new Date().toISOString(),
    shippingAddress: dbOrder.shipping_address || dbOrder.shippingAddress || 'No address provided',
    latitude: dbOrder.latitude ? Number(dbOrder.latitude) : undefined,
    longitude: dbOrder.longitude ? Number(dbOrder.longitude) : undefined
  };
};

export const storageService = {
  init: async () => {
    try {
      const { data: existingProducts } = await supabase.from('products').select('id').limit(1);
      if (!existingProducts || existingProducts.length === 0) {
        await supabase.from('products').insert(INITIAL_PRODUCTS);
      }
    } catch (e) {
      console.warn("Storage Init: Tables might not be fully configured yet.");
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      id: user.id,
      name: user.user_metadata.name || 'User',
      email: user.email || '',
      role: user.user_metadata.role || 'USER',
      createdAt: user.created_at
    };
  },

  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (error) throw error;
    return (data || []).map(p => ({
      ...p,
      sizes: p.sizes || []
    }));
  },

  addProduct: async (product: Product) => {
    const { error } = await supabase.from('products').insert(product);
    if (error) throw error;
  },

  updateProduct: async (product: Product) => {
    const { error } = await supabase.from('products').update(product).eq('id', product.id);
    if (error) throw error;
  },

  deleteProduct: async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  uploadImage: async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Log the full error to the console for the developer
        console.error("Supabase Storage Error:", uploadError);
        throw new Error(uploadError.message);
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err: any) {
      console.error("Upload Service Exception:", err);
      throw err;
    }
  },

  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapOrderFromDB);
  },

  getUserOrders: async (userId: string): Promise<Order[]> => {
    const { data, error } = await supabase.from('orders')
      .select('*')
      .or(`user_id.eq.${userId},userId.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapOrderFromDB);
  },

  saveOrder: async (order: Order) => {
    const dbOrder = {
      id: order.id,
      user_id: order.userId,
      user_name: order.userName,
      user_email: order.userEmail,
      items: order.items,
      total_amount: order.totalAmount,
      status: order.status,
      shipping_address: order.shippingAddress,
      created_at: order.createdAt,
      latitude: order.latitude,
      longitude: order.longitude
    };
    const { error } = await supabase.from('orders').insert(dbOrder);
    if (error) throw error;
  },

  updateOrder: async (order: Order) => {
    const { error } = await supabase.from('orders').update({ status: order.status }).eq('id', order.id);
    if (error) throw error;
  },

  deleteOrder: async (id: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
  }
};
