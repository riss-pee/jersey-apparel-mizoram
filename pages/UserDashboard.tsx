
import React, { useState, useMemo } from 'react';
import { User, Order, Review, OrderItem, OrderStatus } from '../types';
import { storageService } from '../services/storageService';

interface UserDashboardProps {
  user: User | null;
  orders: Order[];
  onUserUpdate: (updatedUser: User) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, orders, onUserUpdate }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
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
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
      alert("Review submitted! Thank you for the feedback.");
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

  const userStats = useMemo(() => {
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
    const totalSpent = orders.reduce((acc, o) => acc + (o.status !== 'CANCELLED' ? o.totalAmount : 0), 0);
    const kitsCount = orders.reduce((acc, o) => {
      if (o.status === 'CANCELLED') return acc;
      return acc + o.items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);

    return { totalSpent, kitsCount, orderCount: orders.length };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (filterStatus === 'ALL') return orders;
    return orders.filter(o => o.status === filterStatus);
  }, [orders, filterStatus]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="h-24 w-24 bg-jam-green rounded-full flex items-center justify-center text-white text-4xl font-black mb-4 shadow-xl border-4 border-white">
              {user.name.charAt(0)}
            </div>
            <h1 className="text-2xl font-black text-gray-900 italic tracking-tighter uppercase">{user.name}</h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-6">{user.email}</p>
            
            <button 
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="w-full bg-gray-50 text-gray-700 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 border border-gray-100 transition-all"
            >
              {isEditingProfile ? 'Close Settings' : 'Account Settings'}
            </button>
          </div>

          <div className="bg-gray-950 text-white p-8 rounded-[2rem] shadow-xl overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 opacity-10">
               <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45L18.8 19H5.2L12 5.45z"/></svg>
            </div>
            <h3 className="text-[10px] font-black text-jam-green uppercase tracking-[0.2em] mb-4">Member Perk</h3>
            <p className="text-sm font-medium leading-relaxed italic">"Wear the passion of Mizoram. Your support keeps the local football spirit alive."</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {isEditingProfile ? (
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-8">Edit Profile</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-jam-green outline-none font-bold text-sm"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Contact Number</label>
                    <input 
                      type="tel" 
                      className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-jam-green outline-none font-bold text-sm"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Shipping Address (Aizawl)</label>
                  <textarea 
                    rows={3}
                    className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-jam-green outline-none font-bold text-sm"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-jam-green text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-green-800 disabled:bg-gray-300 transition-all"
                  >
                    {isSaving ? 'Updating...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          ) : reviewingItem ? (
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border-2 border-jam-green/20 animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase text-gray-900">Share Feedback</h2>
                    <p className="text-[10px] font-black text-jam-green uppercase tracking-widest">Reviewing: {reviewingItem.item.productName}</p>
                  </div>
                  <button onClick={() => setReviewingItem(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
               </div>
               
               <form onSubmit={handleSubmitReview} className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Kit Rating</label>
                    <div className="flex space-x-3">
                       {[1, 2, 3, 4, 5].map(star => (
                         <button 
                          key={star} 
                          type="button" 
                          onClick={() => setReviewRating(star)}
                          className={`w-14 h-14 rounded-2xl border-2 transition-all flex items-center justify-center ${reviewRating >= star ? 'border-jam-green bg-jam-green text-white shadow-lg scale-110' : 'border-gray-100 text-gray-300 hover:border-jam-green/30'}`}
                         >
                           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                         </button>
                       ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Product Review</label>
                    <textarea 
                      required
                      rows={4}
                      className="w-full px-6 py-4 rounded-3xl border-2 border-gray-100 focus:border-jam-green outline-none font-medium transition-all text-sm leading-relaxed"
                      placeholder="Was the fit perfect? How is the embroidery quality?"
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full bg-jam-green text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-green-800 disabled:bg-gray-300 transition-all active:scale-95"
                  >
                    {isSubmittingReview ? 'Submitting Review...' : 'Post Review'}
                  </button>
               </form>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-center">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
                    <p className="text-2xl font-black italic text-gray-900">{userStats.orderCount}</p>
                 </div>
                 <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-center">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Kits Collected</p>
                    <p className="text-2xl font-black italic text-jam-green">{userStats.kitsCount}</p>
                 </div>
                 <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-center col-span-2">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Lifetime Investment</p>
                    <p className="text-2xl font-black italic text-gray-900">₹{userStats.totalSpent.toLocaleString()}</p>
                 </div>
              </div>

              {/* Order History List */}
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase text-gray-900">Order History</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Timeline of your JAM authentic collection</p>
                  </div>
                  
                  <div className="flex bg-gray-100 p-1.5 rounded-2xl overflow-x-auto max-w-full">
                     {['ALL', 'PENDING', 'SHIPPED', 'DELIVERED'].map(status => (
                       <button
                         key={status}
                         onClick={() => setFilterStatus(status)}
                         className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                           filterStatus === status 
                           ? 'bg-white text-jam-green shadow-sm' 
                           : 'text-gray-400 hover:text-gray-600'
                         }`}
                       >
                         {status}
                       </button>
                     ))}
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="bg-gray-50 rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-200">
                    <div className="text-4xl mb-4 opacity-20">⚽</div>
                    <p className="text-gray-400 font-black italic uppercase tracking-tighter">No orders found in this category.</p>
                    <p className="text-[9px] text-gray-400 font-black uppercase mt-2">Time to add something new to the squad.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {filteredOrders.map(order => (
                      <div key={order.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-500">
                        {/* Order Header */}
                        <div className="bg-gray-50/50 px-8 py-6 border-b flex flex-wrap justify-between items-center gap-6">
                          <div className="flex items-center space-x-8">
                            <div>
                              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Order Ref</p>
                              <p className="font-mono text-xs font-black text-jam-green">{order.id}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Placed On</p>
                              <p className="text-xs font-black italic text-gray-900">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                               <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Status</p>
                               <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Investment</p>
                             <p className="text-xl font-black text-gray-900 italic">₹{order.totalAmount.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="p-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {order.items && order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center space-x-5 p-4 rounded-3xl border border-gray-50 bg-gray-50/30 hover:bg-white hover:border-jam-green/20 transition-all">
                                <div className="w-16 h-20 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                                  <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-grow">
                                  <p className="text-xs font-black text-gray-900 uppercase italic leading-tight mb-1">
                                    {item.productName}
                                    <span className="ml-2 inline-block text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                      ({item.version})
                                    </span>
                                  </p>
                                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
                                    Size <span className="text-jam-green">{item.size}</span> • Qty <span className="text-jam-green">{item.quantity}</span>
                                  </p>
                                  <p className="text-xs font-black text-gray-900 mt-2">₹{item.price.toLocaleString()}</p>
                                </div>
                                {order.status === 'DELIVERED' && (
                                  <button 
                                    onClick={() => setReviewingItem({orderId: order.id, item})}
                                    className="px-4 py-2 bg-white border-2 border-jam-green text-[9px] font-black text-jam-green rounded-xl uppercase tracking-widest hover:bg-jam-green hover:text-white transition-all shadow-sm"
                                  >
                                    Review
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Footer Details */}
                          <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-start space-x-3 max-w-md">
                               <svg className="w-4 h-4 text-jam-green mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                               <div>
                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Shipping Terminal</p>
                                  <p className="text-[11px] font-medium text-gray-600 leading-relaxed italic">{order.shippingAddress}</p>
                               </div>
                            </div>
                            
                            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                               <div className="flex items-center space-x-3 bg-jam-green/5 px-4 py-2 rounded-2xl border border-jam-green/10">
                                  <div className="w-2 h-2 rounded-full bg-jam-green animate-pulse"></div>
                                  <p className="text-[9px] font-black text-jam-green uppercase tracking-widest">Processing In Logistics</p>
                               </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
