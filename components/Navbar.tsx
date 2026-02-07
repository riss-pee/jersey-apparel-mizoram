
import React from 'react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, onLogout, cartCount }) => {
  return (
    <nav className="bg-jam-green text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <span className="text-xl font-bold tracking-tight">JERSEY APPAREL MIZORAM</span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button onClick={() => onNavigate('home')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700">Home</button>
              {user?.role === 'ADMIN' ? (
                <>
                  <button onClick={() => onNavigate('admin-dashboard')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700">Orders</button>
                  <button onClick={() => onNavigate('admin-products')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700">Products</button>
                </>
              ) : (
                <>
                  {user && <button onClick={() => onNavigate('user-dashboard')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700">My Orders</button>}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={() => onNavigate('cart')} className="relative p-2 rounded-full hover:bg-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-xs text-white rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium hidden lg:inline">{user.name}</span>
                <button onClick={onLogout} className="bg-white text-jam-green px-4 py-1.5 rounded-md text-sm font-bold hover:bg-gray-100 transition">Logout</button>
              </div>
            ) : (
              <div className="space-x-2">
                <button onClick={() => onNavigate('login')} className="px-3 py-2 text-sm font-medium hover:text-gray-200">Login</button>
                <button onClick={() => onNavigate('signup')} className="bg-white text-jam-green px-4 py-1.5 rounded-md text-sm font-bold hover:bg-gray-100 transition">Sign Up</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
