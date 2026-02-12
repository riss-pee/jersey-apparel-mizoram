
import { supabase } from './supabaseClient.ts';
import { User, Product, Order, HeroSlide, SiteSettings, Review } from '../types.ts';
import { INITIAL_PRODUCTS } from '../constants.ts';

const mapOrderFromDB = (dbOrder: any): Order => {
  return {
    id: dbOrder.id,
    userId: dbOrder.user_id || dbOrder.userId,
    userName: dbOrder.user_name || dbOrder.userName || 'Guest User',
    userEmail: dbOrder.user_email || dbOrder.userEmail || 'No Email',
    userPhone: dbOrder.user_phone || dbOrder.userPhone,
    items: dbOrder.items || [],
    totalAmount: Number(dbOrder.total_amount || dbOrder.totalAmount || 0),
    status: dbOrder.status || 'PENDING',
    createdAt: dbOrder.created_at || dbOrder.createdAt || new Date().toISOString(),
    shippingAddress: dbOrder.shipping_address || dbOrder.shippingAddress || 'No address provided',
    latitude: dbOrder.latitude ? Number(dbOrder.latitude) : undefined,
    longitude: dbOrder.longitude ? Number(dbOrder.longitude) : undefined
  };
};

const prepareProductForDB = (product: Product) => {
  return {
    id: product.id,
    name: product.name,
    team: product.team,
    price: Number(product.price),
    image: product.image,
    images: Array.isArray(product.images) ? product.images : [product.image],
    description: product.description,
    stock: Number(product.stock),
    status: product.status,
    version: product.version || 'FAN',
    category: product.category,
    sizes: Array.isArray(product.sizes) ? product.sizes : []
  };
};

export const storageService = {
  init: async () => {
    try {
      const { data: existingProducts, error } = await supabase.from('products').select('id').limit(1);
      if (error) {
        console.warn("Products table not found. Please run the SQL schema in Supabase.");
        return;
      }
      if (!existingProducts || existingProducts.length === 0) {
        // Fix: Simplified initialization by removing redundant type overrides
        const payload = INITIAL_PRODUCTS.map(p => prepareProductForDB(p));
        await supabase.from('products').insert(payload);
      }
    } catch (e) {
      // Fail silently
    }
  },

  getSiteSettings: async (): Promise<SiteSettings> => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'global').single();
      if (error || !data) throw error;
      return data;
    } catch (e) {
      return {
        id: 'global',
        aboutUs: "Mizoram's leading destination for authentic football kits. Bringing the world's most iconic jerseys to the heart of Aizawl.",
        instagramHandle: 'jerseyapparel_mizoram',
        whatsappNumber: '919876543210',
        footerTagline: "Authenticity and passion in every thread.",
        upiId: 'jerseyapparel@okaxis',
        gPayNumber: '9876543210',
        paytmNumber: '9876543210'
      };
    }
  },

  updateSiteSettings: async (settings: SiteSettings) => {
    const { error } = await supabase.from('site_settings').upsert(settings);
    if (error) throw error;
  },

  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      id: user.id,
      name: user.user_metadata.name || 'User',
      email: user.email || '',
      phone: user.user_metadata.phone || '',
      address: user.user_metadata.address || '',
      role: user.user_metadata.role || 'USER',
      createdAt: user.created_at
    };
  },

  updateUserProfile: async (data: { name: string; phone: string; address: string }): Promise<User> => {
    const { data: { user }, error } = await supabase.auth.updateUser({
      data: { 
        name: data.name,
        phone: data.phone,
        address: data.address
      }
    });

    if (error) throw error;
    if (!user) throw new Error("Update failed");

    return {
      id: user.id,
      name: user.user_metadata.name,
      email: user.email || '',
      phone: user.user_metadata.phone,
      address: user.user_metadata.address,
      role: user.user_metadata.role || 'USER',
      createdAt: user.created_at
    };
  },

  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (error) return [];
    return (data || []).map(p => ({
      ...p,
      sizes: p.sizes || [],
      images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
      version: p.version || 'FAN'
    }));
  },

  addProduct: async (product: Product) => {
    const payload = prepareProductForDB(product);
    const { error } = await supabase.from('products').insert(payload);
    if (error) throw error;
  },

  updateProduct: async (product: Product) => {
    const payload = prepareProductForDB(product);
    const { error } = await supabase.from('products').update(payload).eq('id', product.id);
    if (error) throw error;
  },

  deleteProduct: async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  getHeroSlides: async (): Promise<HeroSlide[]> => {
    const { data, error } = await supabase.from('hero_slides').select('*').order('displayOrder');
    if (error) {
      return [
        { id: '1', badge: "2024/25 Season Dropped", title: "Authentic Kits \nFor True Fans.", description: "Experience the finest moisture-wicking technology.", buttonText: "Shop Collection", accentColor: "#064e3b", displayOrder: 1 },
        { id: '2', badge: "Local Pride", title: "The Spirit \nOf Aizawl.", description: "Support your local heroes with official kits.", buttonText: "View Local Kits", accentColor: "#b91c1c", displayOrder: 2 }
      ];
    }
    return data || [];
  },

  saveHeroSlide: async (slide: HeroSlide) => {
    const { error } = await supabase.from('hero_slides').upsert(slide);
    if (error) throw error;
  },

  deleteHeroSlide: async (id: string) => {
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (error) throw error;
  },

  uploadImage: async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `site/${fileName}`; 

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
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
    if (error) return [];
    return (data || []).map(mapOrderFromDB);
  },

  getUserOrders: async (userId: string): Promise<Order[]> => {
    const { data, error } = await supabase.from('orders')
      .select('*')
      .or(`user_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(mapOrderFromDB);
  },

  saveOrder: async (order: Order) => {
    const dbOrder = {
      id: order.id,
      user_id: order.userId,
      user_name: order.userName,
      user_email: order.userEmail,
      user_phone: order.userPhone,
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
  },

  getReviewsByProduct: async (productId: string): Promise<Review[]> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('productId', productId)
        .order('createdAt', { ascending: false });
      
      if (error) return []; 
      return data || [];
    } catch (e) {
      return [];
    }
  },

  addReview: async (review: Review) => {
    const { error } = await supabase.from('reviews').insert({
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    });
    if (error) throw error;
  }
};
