
import React, { useState } from 'react';
import { OrderItem } from '../types';

interface CheckoutProps {
  cartItems: OrderItem[];
  onPlaceOrder: (address: string, lat?: number, lng?: number) => void;
  onNavigate: (page: string) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, onPlaceOrder, onNavigate }) => {
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please check your permissions.");
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      onPlaceOrder(address, location?.lat, location?.lng);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-bold mb-6">Shipping Details</h2>
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
              <textarea 
                required 
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-jam-green focus:border-transparent outline-none mb-4" 
                placeholder="Building, Street, Area, Aizawl, Mizoram - 796001"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Pin-point Location (Optional but recommended)</label>
                <button 
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className={`flex items-center justify-center w-full py-2 px-4 rounded-lg border-2 border-dashed transition-all ${
                    location 
                    ? 'border-jam-green bg-green-50 text-jam-green' 
                    : 'border-gray-300 hover:border-jam-green text-gray-600'
                  }`}
                >
                  {isLocating ? (
                    <span className="flex items-center"><div className="animate-spin mr-2 h-4 w-4 border-2 border-jam-green border-t-transparent rounded-full"></div> Locating...</span>
                  ) : location ? (
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Location Captured!
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Use My Current Location
                    </span>
                  )}
                </button>
                {location && (
                  <p className="text-[10px] text-gray-500 text-center">
                    Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure Payment
              </h3>
              <p className="text-sm text-gray-500">Pay via Google Pay, PhonePe or Cash on Delivery (COD) within Mizoram.</p>
            </div>
          </form>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-8">
            {cartItems.map(item => (
              <div key={item.productId} className="flex justify-between items-center text-sm">
                <span>{item.productName} x{item.quantity}</span>
                <span className="font-semibold text-gray-900">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 mb-8">
            <div className="flex justify-between font-bold text-xl">
              <span>Total Payable</span>
              <span className="text-jam-green">₹{total}</span>
            </div>
          </div>
          <button 
            type="submit" 
            form="checkout-form"
            disabled={isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all ${
              isProcessing ? 'bg-gray-400' : 'bg-jam-green hover:bg-green-800'
            }`}
          >
            {isProcessing ? 'Processing Payment...' : 'Confirm Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
