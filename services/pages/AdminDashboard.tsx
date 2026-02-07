
import React, { useState } from 'react';
import { User, Order, OrderStatus } from '../types';
import { storageService } from '../services/storageService';

interface AdminDashboardProps {
  user: User | null;
  orders: Order[];
  onOrderUpdate: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, orders, onOrderUpdate }) => {
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (user?.role !== 'ADMIN') return <div className="p-20 text-center text-red-600 font-bold">Unauthorized Access</div>;

  const updateStatus = async (order: Order, status: OrderStatus) => {
    try {
      await storageService.updateOrder({ ...order, status });
      onOrderUpdate();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setIsDeleting(true);
    try {
      await storageService.deleteOrder(orderId);
      setConfirmingOrderId(null);
      onOrderUpdate();
    } catch (err) {
      console.error("Delete Order Error:", err);
      alert("Failed to delete order. Database error.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleContactCustomer = (order: Order) => {
    const phoneNumber = order.userPhone?.replace(/[^0-9]/g, '') || '919876543210';
    const message = `Hello ${order.userName}, this is the Admin from Jersey Apparel Mizoram. I am contacting you regarding your order #${order.id}.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');
  };

  const stats = {
    totalSales: orders.reduce((a, b) => a + (b.status !== 'CANCELLED' ? Number(b.totalAmount || 0) : 0), 0),
    pending: orders.filter(o => o.status === 'PENDING').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-jam-green italic uppercase tracking-tighter mb-2">Order Command Center</h1>
        <p className="text-gray-500 font-medium">Manage logistics and customer fulfillment for Jersey Apparel Mizoram.</p>
      </div>
      
      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-jam-green opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Gross Revenue</p>
          <p className="text-4xl font-black text-gray-900 italic">₹{stats.totalSales.toLocaleString()}</p>
          <div className="mt-4 flex items-center text-[10px] font-bold text-jam-green">
             <span className="mr-1">▲</span> 12% vs last month
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-400 opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Pending Shipment</p>
          <p className="text-4xl font-black text-gray-900 italic">{stats.pending}</p>
          <div className="mt-4 flex items-center text-[10px] font-bold text-yellow-600">
             <span className="mr-1">●</span> Action required
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-400 opacity-5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Fulfilled Orders</p>
          <p className="text-4xl font-black text-gray-900 italic">{stats.delivered}</p>
          <div className="mt-4 flex items-center text-[10px] font-bold text-blue-600">
             <span className="mr-1">✓</span> 100% Customer satisfaction
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Order & Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Customer Details</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Purchased Items</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Lifecycle</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-mono text-xs font-black text-jam-green mb-1">{order.id}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-gray-900 text-sm italic uppercase mb-1">{order.userName}</p>
                    <p className="text-[10px] text-jam-green font-black mb-1">{order.userPhone || 'No Phone'}</p>
                    <p className="text-[10px] text-gray-400 font-medium line-clamp-1 mb-2 italic">{order.shippingAddress}</p>
                    <div className="flex space-x-2">
                      {order.latitude && order.longitude && (
                        <a 
                          href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-jam-green/10 text-jam-green hover:bg-jam-green hover:text-white px-2 py-1 rounded-md text-[8px] font-black transition-all flex items-center"
                        >
                          <svg className="w-2.5 h-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          MAPS PIN
                        </a>
                      )}
                      <button 
                        onClick={() => handleContactCustomer(order)}
                        className="bg-green-100 text-green-700 hover:bg-green-600 hover:text-white px-2 py-1 rounded-md text-[8px] font-black transition-all"
                      >
                        WHATSAPP
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col space-y-3">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center space-x-3 group/item">
                          <div className="w-10 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                             <img src={it.image} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-900 line-clamp-1 leading-tight">{it.productName}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                               Size {it.size} <span className="text-jam-green mx-1">×</span> {it.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <p className="text-lg font-black text-gray-900 italic">₹{order.totalAmount.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {confirmingOrderId === order.id ? (
                      <div className="flex flex-col space-y-2">
                        <span className="text-[8px] font-black text-red-600 uppercase tracking-widest">Wipe Entry?</span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleDeleteOrder(order.id)} 
                            disabled={isDeleting}
                            className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black hover:bg-red-700 shadow-md transition-all active:scale-95"
                          >
                            {isDeleting ? '...' : 'YES'}
                          </button>
                          <button 
                            onClick={() => setConfirmingOrderId(null)} 
                            className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-[9px] font-black hover:bg-gray-300 transition-all"
                          >
                            NO
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <select 
                          className="text-[10px] font-black uppercase tracking-widest border-2 border-gray-100 rounded-xl px-3 py-2 outline-none bg-white focus:ring-4 focus:ring-jam-green/10 focus:border-jam-green transition-all"
                          value={order.status}
                          onChange={(e) => updateStatus(order, e.target.value as OrderStatus)}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Process</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Void</option>
                        </select>
                        <button 
                          onClick={() => setConfirmingOrderId(order.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="text-4xl mb-4 opacity-20">📦</div>
                    <p className="text-gray-400 font-bold italic">No orders recorded in the catalog.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
