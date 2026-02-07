
import React, { useState } from 'react';
import { OrderItem, User, SiteSettings } from '../types';

interface CheckoutProps {
  user: User | null;
  cartItems: OrderItem[];
  siteSettings: SiteSettings | null;
  onPlaceOrder: (address: string, phone: string, lat?: number, lng?: number) => void;
  onNavigate: (page: string) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ user, cartItems, siteSettings, onPlaceOrder, onNavigate }) => {
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied to clipboard: ${text}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      alert("Please provide a phone number for delivery.");
      return;
    }
    if (!paymentConfirmed) {
      alert("Please check the 'I have completed the payment' box before proceeding.");
      return;
    }
    setIsProcessing(true);
    // Simulate order submission
    setTimeout(() => {
      onPlaceOrder(address, phone, location?.lat, location?.lng);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-gray-900 italic tracking-tighter uppercase mb-12 text-center">Secure Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Shipping & Payment Info */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Section 1: Logistics */}
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
            <h2 className="text-xl font-black italic tracking-tighter uppercase mb-8 flex items-center">
              <span className="w-8 h-8 bg-jam-green text-white rounded-full flex items-center justify-center text-xs mr-3 shadow-md">1</span>
              Logistics & Delivery
            </h2>
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Delivery Phone</label>
                  <input 
                    type="tel" 
                    required
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-jam-green outline-none font-bold transition-all" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Live Coordinates</label>
                   <button 
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className={`flex items-center justify-center w-full py-4 px-6 rounded-2xl border-2 border-dashed font-black uppercase text-[10px] tracking-widest transition-all ${
                      location 
                      ? 'border-jam-green bg-green-50 text-jam-green' 
                      : 'border-gray-200 hover:border-jam-green text-gray-400'
                    }`}
                  >
                    {isLocating ? 'Locating...' : location ? 'GPS PIN CAPTURED' : 'Capture Location'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Address (Aizawl)</label>
                <textarea 
                  required 
                  rows={3}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-jam-green outline-none font-bold transition-all" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </form>
          </div>

          {/* Section 2: Payment Terminal */}
          <div className="bg-gray-950 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
               <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center md:items-start">
               {/* QR Card */}
               <div className="w-full max-w-[280px] bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center">
                  <div className="w-full flex justify-between items-center mb-4">
                     <span className="text-[10px] font-black italic uppercase text-gray-400 tracking-tighter">Scan to Pay</span>
                     <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-jam-green animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-75"></div>
                     </div>
                  </div>
                  <div className="w-full aspect-square rounded-2xl border-2 border-gray-50 flex items-center justify-center overflow-hidden mb-6 bg-gray-50">
                    {siteSettings?.paymentQrCode ? (
                      <img src={siteSettings.paymentQrCode} className="w-full h-full object-contain" alt="Store QR" />
                    ) : (
                      <div className="text-center p-4">
                        <p className="text-[10px] font-black text-gray-300 uppercase">QR Pending Admin Upload</p>
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] font-black text-jam-green uppercase tracking-widest text-center">JAM Verified Merchant</p>
               </div>

               {/* Payment Details */}
               <div className="flex-grow space-y-8">
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white mb-2 flex items-center">
                    <span className="w-8 h-8 bg-jam-green text-white rounded-full flex items-center justify-center text-xs mr-3 shadow-md border-2 border-white/10">2</span>
                    Payment Instructions
                  </h2>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-sm">
                    Scan the QR code or use the payment IDs below. Please include <strong>"{phone}"</strong> in the payment note for verification.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {siteSettings?.upiId && (
                        <div 
                          onClick={() => copyToClipboard(siteSettings.upiId!)}
                          className="bg-white/5 border border-white/10 p-4 rounded-2xl cursor-pointer hover:bg-white/10 transition group"
                        >
                          <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Official UPI ID</p>
                          <p className="text-white font-bold group-hover:text-jam-green transition-colors">{siteSettings.upiId}</p>
                        </div>
                     )}
                     {siteSettings?.gPayNumber && (
                        <div 
                          onClick={() => copyToClipboard(siteSettings.gPayNumber!)}
                          className="bg-white/5 border border-white/10 p-4 rounded-2xl cursor-pointer hover:bg-white/10 transition group"
                        >
                          <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Google Pay</p>
                          <p className="text-white font-bold group-hover:text-blue-400 transition-colors">{siteSettings.gPayNumber}</p>
                        </div>
                     )}
                  </div>

                  <div className="pt-6">
                    <label className="flex items-center space-x-4 cursor-pointer p-4 bg-jam-green/10 rounded-2xl border border-jam-green/20">
                       <input 
                         type="checkbox" 
                         checked={paymentConfirmed} 
                         onChange={() => setPaymentConfirmed(!paymentConfirmed)}
                         className="w-6 h-6 rounded-lg text-jam-green focus:ring-jam-green cursor-pointer" 
                       />
                       <span className="text-xs font-black text-white uppercase tracking-widest">I have completed the transaction</span>
                    </label>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 sticky top-28">
            <h2 className="text-xl font-black italic tracking-tighter uppercase mb-8">Summary</h2>
            <div className="space-y-4 mb-8">
              {cartItems.map(item => (
                <div key={`${item.productId}-${item.size}`} className="flex justify-between items-start text-sm pb-4 border-b border-gray-50">
                  <div className="flex items-center space-x-3">
                     <img src={item.image} className="w-10 h-10 rounded-lg object-cover" />
                     <div className="flex flex-col">
                        <span className="font-black text-gray-900 uppercase italic leading-none">{item.productName}</span>
                        <span className="text-[10px] text-gray-400 font-bold mt-1">SZ {item.size} × {item.quantity}</span>
                     </div>
                  </div>
                  <span className="font-black text-gray-950">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 p-6 rounded-2xl mb-8 space-y-3">
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>SUBTOTAL</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>DELIVERY</span>
                <span className="text-jam-green">FREE</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between font-black text-2xl italic tracking-tighter">
                <span className="text-gray-400">TOTAL</span>
                <span className="text-jam-green">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              type="submit" 
              form="checkout-form"
              disabled={isProcessing || !paymentConfirmed}
              className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xs text-white shadow-2xl transition-all active:scale-95 ${
                isProcessing ? 'bg-gray-400' : 
                !paymentConfirmed ? 'bg-gray-900 opacity-50 cursor-not-allowed' : 
                'bg-jam-green hover:bg-green-800'
              }`}
            >
              {isProcessing ? 'Deploying Logistics...' : paymentConfirmed ? 'Finish Purchase' : 'Pay to Proceed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
