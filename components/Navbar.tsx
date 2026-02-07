
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
          <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
            <span className="text-xl font-bold tracking-tighter">JERSEY APPAREL MIZORAM</span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {isAdmin && (
                <>
                  <button onClick={() => onNavigate('admin-dashboard')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition">Orders</button>
                  <button onClick={() => onNavigate('admin-products')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition">Products</button>
                  <button onClick={() => onNavigate('admin-hero')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition">Hero</button>
                  <button onClick={() => onNavigate('admin-settings')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition">Settings</button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {!isAdmin && (
              <button onClick={() => handleMobileNav('cart')} className="relative p-2 rounded-full hover:bg-green-700 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-[10px] text-white rounded-full h-5 w-5 flex items-center justify-center font-black">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            
            <div className="hidden md:flex items-center space-x-1">
              {!isAdmin && (
                <>
                  <button onClick={() => onNavigate('home')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition">Home</button>
                  {user && (
                    <button onClick={() => onNavigate('user-dashboard')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition">My Orders</button>
                  )}
                </>
              )}
              
              <div className="ml-4 flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-green-200">{user.name}</span>
                    <button onClick={onLogout} className="bg-white text-jam-green px-4 py-1.5 rounded-lg text-xs font-black hover:bg-gray-100 transition uppercase tracking-widest">Logout</button>
                  </div>
                ) : (
                  <div className="space-x-2">
                    <button onClick={() => onNavigate('login')} className="bg-white text-jam-green px-6 py-1.5 rounded-lg text-xs font-black hover:bg-gray-100 transition uppercase tracking-widest">Login</button>
                  </div>
                )}
              </div>
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

      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-green-900/95 backdrop-blur-lg border-t border-white/10 ${
          isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-4 pt-4 pb-8 space-y-2">
          {!isAdmin && (
            <button onClick={() => handleMobileNav('home')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold hover:bg-green-800 transition">Home</button>
          )}
          
          {isAdmin ? (
            <>
              <button onClick={() => handleMobileNav('admin-dashboard')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold hover:bg-green-800 transition">Orders</button>
              <button onClick={() => handleMobileNav('admin-products')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold hover:bg-green-800 transition">Inventory</button>
              <button onClick={() => handleMobileNav('admin-hero')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold hover:bg-green-800 transition">Banners</button>
              <button onClick={() => handleMobileNav('admin-settings')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold hover:bg-green-800 transition">Settings</button>
            </>
          ) : (
            user && <button onClick={() => handleMobileNav('user-dashboard')} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold hover:bg-green-800 transition">My Orders</button>
          )}

          <div className="pt-4 border-t border-white/10 mt-4 space-y-4">
            {user ? (
              <div className="px-4">
                <button onClick={handleLogout} className="w-full bg-white text-jam-green py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-gray-100 transition">Logout</button>
              </div>
            ) : (
              <div className="px-2">
                <button onClick={() => onNavigate('login')} className="w-full py-3 text-sm font-black bg-white text-jam-green rounded-xl hover:bg-gray-100 transition shadow-lg">Login</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
