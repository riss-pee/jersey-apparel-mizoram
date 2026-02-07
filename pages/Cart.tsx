
import React from 'react';
import { OrderItem } from '../types';

interface CartProps {
  cartItems: OrderItem[];
  onRemove: (id: string, size: string) => void;
  onCheckout: () => void;
  onNavigate: (page: string) => void;
}

const Cart: React.FC<CartProps> = ({ cartItems, onRemove, onCheckout, onNavigate }) => {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="mb-6 flex justify-center">
          <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Looks like you haven't added any jerseys yet.</p>
        <button onClick={() => onNavigate('home')} className="bg-jam-green text-white font-bold py-3 px-8 rounded-lg hover:bg-green-800 transition">Start Shopping</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-10">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item, idx) => (
            <div key={`${item.productId}-${item.size}-${idx}`} className="flex items-center space-x-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              {/* Fixed: changed item.name to item.productName to match OrderItem interface */}
              <img src={item.image} alt={item.productName} className="w-24 h-24 object-cover rounded-lg" />
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-gray-900">{item.productName}</h3>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-sm text-gray-500">Size: <span className="font-bold text-gray-700">{item.size}</span></p>
                  <p className="text-sm text-gray-500">Quantity: <span className="font-bold text-gray-700">{item.quantity}</span></p>
                </div>
                <p className="text-lg font-bold text-jam-green mt-2">₹{item.price}</p>
              </div>
              <button 
                onClick={() => onRemove(item.productId, item.size)}
                className="text-gray-400 hover:text-red-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>₹{subtotal}</span>
            </div>
          </div>
          <button 
            onClick={onCheckout}
            className="w-full bg-jam-green text-white py-4 rounded-lg font-bold hover:bg-green-800 transition shadow-lg"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
