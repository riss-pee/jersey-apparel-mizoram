
import React, { useState } from 'react';
import { User } from '../types.ts';

interface NavbarProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, onLogout, cartCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleMobileNav = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setIsMenuOpen(false);
  };

  const isAdmin = user?.role === 'ADMIN';

  const handleLogoClick = () => {
    if (isAdmin) {
      onNavigate('admin-dashboard');
    } else {
      onNavigate('home');
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-jam-green text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Area */}
          <div className="flex items-center">
            <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
              <span className="text-xl font-black italic uppercase tracking-tighter">Jersey Apparel Mizoram</span>
            </div>
            
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-1">
                {isAdmin && (
                  <>
                    <button onClick={() => onNavigate('admin-dashboard')} className="px-3 py-2 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition">Orders</button>
                    <button onClick={() => onNavigate('admin-products')} className="px-3 py-2 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition">Inventory</button>
                    <button onClick={() => onNavigate('admin-hero')} className="px-3 py-2 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition">Banners</button>
                    <button onClick={() => onNavigate('admin-settings')} className="px-3 py-2 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition">Settings</button>
                  </>
                )}
                {!isAdmin && user && (
                  <button onClick={() => onNavigate('user-dashboard')} className="px-3 py-2 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition">My Locker</button>
                )}
              </div>
            </div>
          </div>

          {/* Right Side Cluster: Home, Cart, Auth */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => onNavigate('home')} 
                className="hidden md:block px-3 py-2 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition border border-transparent hover:border-white/20"
              >
                Home
              </button>
              
              {!isAdmin && (
                <button onClick={() => handleMobileNav('cart')} className="relative p-2 rounded-full hover:bg-green-700 transition group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-[10px] text-white rounded-full h-5 w-5 flex items-center justify-center font-black animate-in zoom-in duration-300">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
            </div>
            
            <div className="hidden md:flex items-center space-x-4 ml-4">
              {user ? (
                <div className="flex items-center space-x-4 border-l border-white/10 pl-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-green-200">{user.name}</span>
                  <button onClick={onLogout} className="bg-white text-jam-green px-4 py-1.5 rounded-lg text-[10px] font-black hover:bg-gray-100 transition uppercase tracking-widest">Logout</button>
                </div>
              ) : (
                <div className="space-x-2">
                  <button onClick={() => onNavigate('login')} className="bg-white text-jam-green px-6 py-1.5 rounded-lg text-[10px] font-black hover:bg-gray-100 transition uppercase tracking-widest shadow-xl">Login</button>
                </div>
              )}
            </div>

            <button 
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-green-700 focus:outline-none transition"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-green-950 border-t border-white/5 ${
          isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-4 pt-4 pb-8 space-y-2">
          <button onClick={() => handleMobileNav('home')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-green-800 transition">Home</button>
          
          {isAdmin ? (
            <>
              <button onClick={() => handleMobileNav('admin-dashboard')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-green-800 transition">Orders</button>
              <button onClick={() => handleMobileNav('admin-products')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-green-800 transition">Inventory</button>
              <button onClick={() => handleMobileNav('admin-hero')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-green-800 transition">Banners</button>
              <button onClick={() => handleMobileNav('admin-settings')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-green-800 transition">Settings</button>
            </>
          ) : (
            user && <button onClick={() => handleMobileNav('user-dashboard')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-green-800 transition">My Locker</button>
          )}

          <div className="pt-4 border-t border-white/10 mt-4 space-y-4 text-center">
            {user ? (
              <button onClick={handleLogout} className="w-full bg-white text-jam-green py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition shadow-xl">Logout</button>
            ) : (
              <button onClick={() => onNavigate('login')} className="w-full py-4 text-xs font-black bg-white text-jam-green rounded-2xl hover:bg-gray-100 transition shadow-2xl">Login</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
