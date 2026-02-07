
import React, { useState, useEffect } from 'react';
import { User, Product, Order, OrderItem, HeroSlide, SiteSettings, Review } from './types.ts';
import { storageService } from './services/storageService.ts';
import { supabase } from './services/supabaseClient.ts';
import Navbar from './components/Navbar.tsx';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import Cart from './pages/Cart.tsx';
import Checkout from './pages/Checkout.tsx';
import UserDashboard from './pages/UserDashboard.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import AdminProducts from './pages/AdminProducts.tsx';
import AdminHero from './pages/AdminHero.tsx';
import AdminSettings from './pages/AdminSettings.tsx';
import ProductDetail from './pages/ProductDetail.tsx';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase.from('reviews').select('*');
      if (!error && data) setReviews(data);
    } catch (e) {
      // Silent fail
    }
  };

  const fetchGlobalData = async (currentUser: User | null) => {
    const [fetchedProducts, fetchedOrders, fetchedHero, fetchedSettings] = await Promise.all([
      storageService.getProducts(),
      currentUser?.role === 'ADMIN' ? storageService.getOrders() : 
      (currentUser ? storageService.getUserOrders(currentUser.id) : Promise.resolve([])),
      storageService.getHeroSlides(),
      storageService.getSiteSettings()
    ]);

    setProducts(fetchedProducts);
    setOrders(fetchedOrders);
    setHeroSlides(fetchedHero);
    setSiteSettings(fetchedSettings);
  };

  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      await storageService.init();
      
      const currentUser = await storageService.getCurrentUser();
      setUser(currentUser);
      await fetchGlobalData(currentUser);
      await fetchReviews();
      
      const savedCart = localStorage.getItem('jam_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
      
      setLoading(false);
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u: User = {
          id: session.user.id,
          name: session.user.user_metadata.name || 'User',
          email: session.user.email || '',
          phone: session.user.user_metadata.phone || '',
          address: session.user.user_metadata.address || '',
          role: session.user.user_metadata.role || 'USER',
          createdAt: session.user.created_at
        };
        setUser(u);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const refreshData = async () => {
      if (currentPage === 'admin-dashboard' || currentPage === 'home' || currentPage === 'admin-products') {
        const p = await storageService.getProducts();
        setProducts(p);
        fetchReviews(); 
        if (user?.role === 'ADMIN') {
          const o = await storageService.getOrders();
          setOrders(o);
        }
      }
      if (currentPage === 'user-dashboard' && user) {
        const o = await storageService.getUserOrders(user.id);
        setOrders(o);
      }
      if (currentPage === 'home' || currentPage === 'admin-hero' || currentPage === 'admin-settings') {
        fetchGlobalData(user);
      }
    };
    refreshData();
  }, [currentPage, user]);

  useEffect(() => {
    localStorage.setItem('jam_cart', JSON.stringify(cart));
  }, [cart]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('home');
    showToast("Logged out successfully");
  };

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    showToast(`Welcome back, ${u.name}!`);
    if (u.role === 'ADMIN') {
      setCurrentPage('admin-dashboard');
    } else {
      setCurrentPage('home');
    }
  };

  const handleNavigateToProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentPage('product-detail');
    window.scrollTo(0, 0);
  };

  const addToCart = (product: Product, size: string, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id && item.size === size);
      if (existing) {
        showToast(`Updated quantity of ${product.name} in cart`);
        return prev.map(item => (item.productId === product.id && item.size === size) ? { ...item, quantity: item.quantity + quantity } : item);
      }
      showToast(`${product.name} (${size}) added to bag`);
      return [...prev, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image,
        size: size
      }];
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.size === size)));
    showToast("Item removed from bag");
  };

  const updateCartQuantity = (productId: string, size: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(prev => prev.map(item => 
      (item.productId === productId && item.size === size) 
      ? { ...item, quantity: newQuantity } 
      : item
    ));
  };

  const clearCart = () => setCart([]);

  const handlePlaceOrder = async (shippingAddress: string, userPhone: string, lat?: number, lng?: number) => {
    if (!user) return;
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: userPhone,
      items: [...cart],
      totalAmount: total,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      shippingAddress,
      latitude: lat,
      longitude: lng
    };
    
    try {
      await storageService.saveOrder(newOrder);
      setOrders(prev => [newOrder, ...prev]);
      clearCart();
      showToast("Order placed successfully!", 'success');
      setCurrentPage('user-dashboard');
    } catch (err) {
      showToast("Error placing order.", 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jam-green text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-bold">Connecting to Mizoram's Finest...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home products={products} reviews={reviews} heroSlides={heroSlides} onAddToCart={addToCart} onNavigate={setCurrentPage} onProductClick={handleNavigateToProduct} />;
      case 'login': return <Login onLoginSuccess={handleAuthSuccess} onNavigate={setCurrentPage} />;
      case 'signup': return <Signup onSignupSuccess={handleAuthSuccess} onNavigate={setCurrentPage} />;
      case 'cart': return <Cart cartItems={cart} onRemove={removeFromCart} onUpdateQuantity={updateCartQuantity} onCheckout={() => setCurrentPage(user ? 'checkout' : 'login')} onNavigate={setCurrentPage} />;
      case 'checkout': return <Checkout user={user} cartItems={cart} siteSettings={siteSettings} onPlaceOrder={handlePlaceOrder} onNavigate={setCurrentPage} />;
      case 'user-dashboard': return <UserDashboard user={user} orders={orders} onUserUpdate={(u) => { setUser(u); showToast("Profile updated!"); }} />;
      case 'admin-dashboard': return <AdminDashboard user={user} orders={orders} onOrderUpdate={async () => setOrders(await storageService.getOrders())} />;
      case 'admin-products': return <AdminProducts user={user} products={products} reviews={reviews} onUpdate={async () => { setProducts(await storageService.getProducts()); await fetchReviews(); }} />;
      case 'admin-hero': return <AdminHero user={user} slides={heroSlides} onUpdate={() => fetchGlobalData(user)} />;
      case 'admin-settings': return <AdminSettings user={user} onUpdate={() => fetchGlobalData(user)} />;
      case 'product-detail': {
        const product = products.find(p => p.id === selectedProductId);
        if (!product) return <Home products={products} reviews={reviews} heroSlides={heroSlides} onAddToCart={addToCart} onNavigate={setCurrentPage} onProductClick={handleNavigateToProduct} />;
        return <ProductDetail product={product} products={products} siteSettings={siteSettings} onAddToCart={addToCart} onNavigate={setCurrentPage} onProductClick={handleNavigateToProduct} />;
      }
      default: return <Home products={products} reviews={reviews} heroSlides={heroSlides} onAddToCart={addToCart} onNavigate={setCurrentPage} onProductClick={handleNavigateToProduct} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-green-100 selection:text-jam-green">
      {toast && (
        <div className={`fixed top-20 right-4 z-[100] transform transition-all duration-500 ease-in-out px-6 py-4 rounded-xl shadow-2xl border-l-4 flex items-center space-x-3 ${
          toast.type === 'success' ? 'bg-white border-jam-green text-gray-800' : 'bg-red-50 border-red-600 text-red-800'
        }`}>
          <div className={`p-1 rounded-full ${toast.type === 'success' ? 'bg-green-100 text-jam-green' : 'bg-red-100 text-red-600'}`}>
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
            )}
          </div>
          <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}

      <Navbar user={user} onNavigate={setCurrentPage} onLogout={handleLogout} cartCount={cart.reduce((a, b) => a + b.quantity, 0)} />
      
      <main className="flex-grow">
        {renderPage()}
      </main>

      <footer className="bg-gray-950 text-white py-24 px-4 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 text-center md:text-left">
          <div className="md:col-span-2">
            <h3 className="text-3xl font-black mb-6 tracking-tighter italic uppercase text-white">Jersey Apparel Mizoram</h3>
            <p className="text-gray-400 max-w-md mx-auto md:mx-0 leading-relaxed mb-8 italic whitespace-pre-line font-medium text-sm">
              {siteSettings?.aboutUs || "Mizoram's leading destination for authentic football kits. Bringing the world's most iconic jerseys to the heart of Aizawl."}
            </p>
          </div>
          
          <div>
             <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">About Us</h4>
             <div className="flex flex-col space-y-6">
                <a href={`https://instagram.com/${siteSettings?.instagramHandle || 'jerseyapparel_mizoram'}`} target="_blank" className="group flex items-center justify-center md:justify-start space-x-3 text-gray-400 hover:text-white transition-colors">
                   <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-jam-green transition-all">
                      <span className="text-[10px] font-black italic">IG</span>
                   </div>
                   <span className="text-xs font-black uppercase tracking-widest">Instagram</span>
                </a>
                <a href={`https://wa.me/${siteSettings?.whatsappNumber || '919876543210'}`} target="_blank" className="group flex items-center justify-center md:justify-start space-x-3 text-gray-400 hover:text-white transition-colors">
                   <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-jam-green transition-all">
                      <span className="text-[10px] font-black italic">WA</span>
                   </div>
                   <span className="text-xs font-black uppercase tracking-widest">WhatsApp</span>
                </a>
             </div>
          </div>

          <div>
             <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8">Store Integrity</h4>
             <p className="text-[10px] text-gray-500 font-black uppercase leading-relaxed tracking-widest whitespace-pre-line">
                {siteSettings?.footerTagline || "Authenticity and passion in every thread."}
                <br /><br />
                © 2024 JAM. <br />All Rights Reserved.
             </p>
          </div>
        </div>
        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col items-center">
          <p className="text-[8px] font-black uppercase tracking-[0.6em] text-gray-700 italic flex items-center">
            Designed & Engineered by <span className="text-jam-green ml-2">RSP</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
