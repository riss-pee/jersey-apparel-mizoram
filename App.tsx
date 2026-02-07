
import React, { useState, useEffect } from 'react';
import { User, Product, Order, OrderItem } from './types';
import { storageService } from './services/storageService';
import { supabase } from './services/supabaseClient';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import ProductDetail from './pages/ProductDetail';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Initialize Data and Auth Session
  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      await storageService.init();
      
      const currentUser = await storageService.getCurrentUser();
      setUser(currentUser);

      const [fetchedProducts, fetchedOrders] = await Promise.all([
        storageService.getProducts(),
        currentUser?.role === 'ADMIN' ? storageService.getOrders() : 
        (currentUser ? storageService.getUserOrders(currentUser.id) : Promise.resolve([]))
      ]);

      setProducts(fetchedProducts);
      setOrders(fetchedOrders);
      
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
        if (user?.role === 'ADMIN') {
          const o = await storageService.getOrders();
          setOrders(o);
        }
      }
      if (currentPage === 'user-dashboard' && user) {
        const o = await storageService.getUserOrders(user.id);
        setOrders(o);
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

  const addToCart = (product: Product, size: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id && item.size === size);
      if (existing) {
        showToast(`Increased quantity of ${product.name} in cart`);
        return prev.map(item => (item.productId === product.id && item.size === size) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      showToast(`${product.name} (${size}) added to cart`);
      return [...prev, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        size: size
      }];
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.size === size)));
    showToast("Item removed from cart");
  };

  const clearCart = () => setCart([]);

  const handlePlaceOrder = async (shippingAddress: string, lat?: number, lng?: number) => {
    if (!user) return;
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
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
      showToast("Order placed successfully! We'll contact you soon.", 'success');
      setCurrentPage('user-dashboard');
    } catch (err) {
      showToast("Error placing order. Please try again.", 'error');
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
      case 'home': return <Home products={products} onAddToCart={addToCart} onNavigate={setCurrentPage} onProductClick={handleNavigateToProduct} />;
      case 'login': return <Login onLoginSuccess={handleAuthSuccess} onNavigate={setCurrentPage} />;
      case 'signup': return <Signup onSignupSuccess={handleAuthSuccess} onNavigate={setCurrentPage} />;
      case 'cart': return <Cart cartItems={cart} onRemove={removeFromCart} onCheckout={() => setCurrentPage(user ? 'checkout' : 'login')} onNavigate={setCurrentPage} />;
      case 'checkout': return <Checkout cartItems={cart} onPlaceOrder={handlePlaceOrder} onNavigate={setCurrentPage} />;
      case 'user-dashboard': return <UserDashboard user={user} orders={orders} />;
      case 'admin-dashboard': return <AdminDashboard user={user} orders={orders} onOrderUpdate={async () => setOrders(await storageService.getOrders())} />;
      case 'admin-products': return <AdminProducts user={user} products={products} onUpdate={async () => setProducts(await storageService.getProducts())} />;
      case 'product-detail': {
        const product = products.find(p => p.id === selectedProductId);
        if (!product) return <Home products={products} onAddToCart={addToCart} onNavigate={setCurrentPage} onProductClick={handleNavigateToProduct} />;
        return <ProductDetail product={product} products={products} onAddToCart={addToCart} onNavigate={setCurrentPage} onProductClick={handleNavigateToProduct} />;
      }
      default: return <Home products={products} onAddToCart={addToCart} onNavigate={setCurrentPage} onProductClick={handleNavigateToProduct} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-green-100 selection:text-jam-green">
      {/* Toast Notifications */}
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

      <Navbar 
        user={user} 
        onNavigate={setCurrentPage} 
        onLogout={handleLogout} 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
      />
      
      <main className="flex-grow">
        {renderPage()}
      </main>

      <footer className="bg-gray-950 text-white py-16 px-4 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-black mb-4 tracking-tighter">JERSEY APPAREL MIZORAM</h3>
            <p className="text-gray-400 max-w-sm leading-relaxed">
              Mizoram's leading destination for authentic football kits. From the Mizo State League to the Champions League, we've got you covered.
            </p>
            <div className="flex space-x-4 mt-6">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-jam-green transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-jam-green transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-green-400 uppercase tracking-widest text-xs">Navigation</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><button onClick={() => setCurrentPage('home')} className="hover:text-white transition">Home</button></li>
              <li><button onClick={() => setCurrentPage('home')} className="hover:text-white transition">New Arrivals</button></li>
              <li><button onClick={() => setCurrentPage('user-dashboard')} className="hover:text-white transition">My Account</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-green-400 uppercase tracking-widest text-xs">Support</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><span className="block text-white font-medium">WhatsApp:</span> +91 98765 43210</li>
              <li><span className="block text-white font-medium">Email:</span> contact@jamizoram.com</li>
              <li><span className="block text-white font-medium">Address:</span> Chanmari, Aizawl</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs">
          <p>&copy; {new Date().getFullYear()} Jersey Apparel Mizoram. Designed in Mizoram.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="hover:text-gray-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-300 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
