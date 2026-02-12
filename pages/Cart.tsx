
import React from 'react';
import { OrderItem } from '../types';

interface CartProps {
  cartItems: OrderItem[];
  onRemove: (id: string, size: string) => void;
  onUpdateQuantity: (id: string, size: string, newQty: number) => void;
  onCheckout: () => void;
  onNavigate: (page: string) => void;
}

const Cart: React.FC<CartProps> = ({ cartItems, onRemove, onUpdateQuantity, onCheckout, onNavigate }) => {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="mb-8 flex justify-center">
          <div className="bg-gray-100 p-8 rounded-full">
            <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900 mb-4">Your bag is empty</h2>
        <p className="text-gray-500 font-medium mb-10 max-w-xs mx-auto uppercase text-[10px] tracking-widest">The stadium is waiting. Grab your kit and join the squad.</p>
        <button 
          onClick={() => onNavigate('home')} 
          className="bg-jam-green text-white font-black py-4 px-12 rounded-2xl hover:bg-green-800 transition shadow-xl uppercase tracking-widest text-xs"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-gray-900">Your Selection</h1>
        <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mt-1">{cartItems.length} Authentic Items Prepared</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
          {cartItems.map((item, idx) => (
            <div key={`${item.productId}-${item.size}-${idx}`} className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-500">
              <div className="w-24 h-32 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                <img src={item.image} alt={item.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              
              <div className="flex-grow text-center sm:text-left">
                <h3 className="text-lg font-black italic uppercase text-gray-900 leading-tight mb-1">
                  {item.productName}
                  <span className="ml-2 inline-block text-[9px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-tighter">
                    {item.version} Ed.
                  </span>
                </h3>
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 mt-1 mb-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Size <span className="text-jam-green ml-1">{item.size}</span></span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price <span className="text-gray-900 ml-1">₹{item.price}</span></span>
                </div>
                
                {/* Quantity Controller */}
                <div className="flex items-center justify-center sm:justify-start">
                  <div className="flex items-center bg-gray-950 p-1.5 rounded-2xl border border-gray-800 shadow-inner">
                    <button 
                      onClick={() => onUpdateQuantity(item.productId, item.size, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center bg-gray-800 text-white rounded-xl hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4"/></svg>
                    </button>
                    <span className="w-10 text-center text-sm font-black text-white tabular-nums">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-jam-green text-white rounded-xl hover:bg-green-700 transition-all active:scale-90"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-end justify-between self-stretch pt-2">
                <p className="text-xl font-black text-gray-900 italic">₹{(item.price * item.quantity).toLocaleString()}</p>
                <button 
                  onClick={() => onRemove(item.productId, item.size)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50"
                  title="Remove from bag"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 h-fit sticky top-28">
            <h2 className="text-xl font-black italic tracking-tighter uppercase mb-8">Investment Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span className="text-gray-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
                <span>Logistics</span>
                <span className="text-jam-green">FREE</span>
              </div>
              <div className="border-t border-gray-50 pt-6 flex justify-between font-black text-2xl italic tracking-tighter">
                <span className="text-gray-400 uppercase">Total</span>
                <span className="text-jam-green">₹{subtotal.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-2xl mb-8 flex items-start space-x-3">
               <svg className="w-5 h-5 text-jam-green flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
               <p className="text-[10px] font-medium text-gray-500 italic leading-relaxed">
                 All orders are verified by the JAM team. Shipping coordinates are captured at checkout for Aizawl delivery.
               </p>
            </div>

            <button 
              onClick={onCheckout}
              className="w-full bg-jam-green text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-800 transition shadow-2xl shadow-green-900/20 active:scale-95 transform-gpu duration-300"
            >
              Secure Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
