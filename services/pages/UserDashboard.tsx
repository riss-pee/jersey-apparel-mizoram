
import React, { useState } from 'react';
import { User, Order, Review, OrderItem } from '../types';
import { storageService } from '../services/storageService';

interface UserDashboardProps {
  user: User | null;
  orders: Order[];
  onUserUpdate: (updatedUser: User) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, orders, onUserUpdate }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  // Review state
  const [reviewingItem, setReviewingItem] = useState<{orderId: string, item: OrderItem} | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  if (!user) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedUser = await storageService.updateUserProfile(formData);
      onUserUpdate(updatedUser);
      setIsEditingProfile(false);
    } catch (err) {
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingItem || !user) return;
    setIsSubmittingReview(true);
    
    try {
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        productId: reviewingItem.item.productId,
        userId: user.id,
        userName: user.name,
        rating: reviewRating,
        comment: reviewComment,
        createdAt: new Date().toISOString()
      };
      
      await storageService.addReview(newReview);
      alert("Field report submitted! Thank you for the feedback.");
      setReviewingItem(null);
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      console.error(err);
      alert("Supabase Error: Reviews table not configured or connection failed.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 bg-jam-green rounded-full flex items-center justify-center text-white text-4xl font-black mb-4 shadow-xl">
              {user.name.charAt(0)}
            </div>
            <h1 className="text-2xl font-black text-gray-900 italic tracking-tighter">{user.name}</h1>
            <p className="text-gray-500 font-medium mb-4">{user.email}</p>
            <span className="inline-block bg-green-100 text-jam-green text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-6">
              Member Since {user.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
            </span>
            
            <button 
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="w-full bg-gray-50 text-gray-700 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 border border-gray-100 transition-all"
            >
              {isEditingProfile ? 'Cancel Editing' : 'Edit Profile Settings'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {isEditingProfile ? (
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-black italic tracking-tighter uppercase mb-6">Profile Settings</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-jam-green outline-none font-bold"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+91 XXXX XXX XXX"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-jam-green outline-none font-bold"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Default Shipping Address</label>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-jam-green outline-none font-bold"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full bg-jam-green text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-green-800 disabled:bg-gray-300 transition-all"
                >
                  {isSaving ? 'Updating...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          ) : reviewingItem ? (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-2 border-jam-green/20 animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase text-gray-900">Field Report</h2>
                    <p className="text-[10px] font-black text-jam-green uppercase tracking-widest">Rate your {reviewingItem.item.productName}</p>
                  </div>
                  <button onClick={() => setReviewingItem(null)} className="text-gray-400 hover:text-red-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
               </div>
               
               <form onSubmit={handleSubmitReview} className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Tactical Performance (Rating)</label>
                    <div className="flex space-x-2">
                       {[1, 2, 3, 4, 5].map(star => (
                         <button 
                          key={star} 
                          type="button" 
                          onClick={() => setReviewRating(star)}
                          className={`w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center ${reviewRating >= star ? 'border-jam-green bg-jam-green text-white shadow-lg scale-110' : 'border-gray-100 text-gray-300'}`}
                         >
                           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                         </button>
                       ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Your Assessment (Comment)</label>
                    <textarea 
                      required
                      rows={4}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-jam-green outline-none font-bold transition-all"
                      placeholder="How's the fit? Fabric quality? Sizing accuracy?..."
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full bg-jam-green text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-green-800 disabled:bg-gray-300 transition-all active:scale-95"
                  >
                    {isSubmittingReview ? 'Reporting...' : 'Publish Field Report'}
                  </button>
               </form>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-black italic tracking-tighter uppercase mb-6">Recent Orders</h2>
              {orders.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold italic">No orders found. Once you place an order, it will appear here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="bg-gray-50/50 px-6 py-4 border-b flex flex-wrap justify-between items-center gap-4">
                        <div>
                          <p className="text-[9px] text-gray-400 font-black uppercase">Order ID</p>
                          <p className="font-mono text-xs font-bold">{order.id}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-400 font-black uppercase">Placed On</p>
                          <p className="text-xs font-bold">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-right font-black text-jam-green">
                          ₹{order.totalAmount || 0}
                        </div>
                      </div>
                      <div className="px-6 py-4">
                        <div className="flex flex-wrap gap-3">
                          {order.items && order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-3 bg-gray-50/50 p-2 rounded-lg pr-4 border border-gray-100 group">
                              <img src={item.image} alt={item.productName} className="w-10 h-10 rounded object-cover shadow-sm" />
                              <div className="flex-grow">
                                <p className="text-[10px] font-black text-gray-900 uppercase leading-none">{item.productName}</p>
                                <p className="text-[8px] text-gray-500 font-bold uppercase mt-1">Siz {item.size} • Qty {item.quantity}</p>
                              </div>
                              <button 
                                onClick={() => setReviewingItem({orderId: order.id, item})}
                                className="ml-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[8px] font-black text-jam-green uppercase tracking-widest hover:bg-jam-green hover:text-white transition-all shadow-sm"
                              >
                                Review
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t flex flex-col md:flex-row justify-between items-start gap-4">
                          <div className="text-[10px] text-gray-600">
                            <span className="font-black text-gray-900 uppercase tracking-widest block mb-1">Shipping To:</span>
                            <p className="font-medium text-gray-500 leading-relaxed max-w-sm">{order.shippingAddress}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
