
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
      <h1 className="text-3xl font-bold mb-10 text-jam-green">Admin Dashboard (Orders Management)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-jam-green">
          <p className="text-gray-500 font-medium">Total Revenue</p>
          <p className="text-3xl font-extrabold text-gray-900">₹{stats.totalSales}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-yellow-400">
          <p className="text-gray-500 font-medium">Pending Orders</p>
          <p className="text-3xl font-extrabold text-gray-900">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-400">
          <p className="text-gray-500 font-medium">Successful Deliveries</p>
          <p className="text-3xl font-extrabold text-gray-900">{stats.delivered}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Order & Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Customer & Address</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Items</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Total</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 min-w-[180px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-mono text-sm font-bold text-gray-900">{order.id}</p>
                    <p className="text-[10px] text-gray-500">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{order.userName}</p>
                    <p className="text-[10px] text-gray-500 line-clamp-1 mb-1">{order.shippingAddress}</p>
                    {order.latitude && order.longitude && (
                      <a 
                        href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-jam-green hover:underline text-[9px] font-black flex items-center"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        PINNED LOCATION
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] text-gray-600">
                      {order.items.map((it, idx) => (
                        <div key={idx}>{it.productName} ({it.size}) x{it.quantity}</div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-jam-green">₹{order.totalAmount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {confirmingOrderId === order.id ? (
                      <div className="flex flex-col space-y-2">
                        <span className="text-[10px] font-black text-red-600 uppercase">Confirm Delete?</span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleDeleteOrder(order.id)} 
                            disabled={isDeleting}
                            className="bg-red-600 text-white px-3 py-1 rounded text-[10px] font-bold hover:bg-red-700 shadow-sm"
                          >
                            {isDeleting ? '...' : 'YES'}
                          </button>
                          <button 
                            onClick={() => setConfirmingOrderId(null)} 
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-[10px] font-bold hover:bg-gray-300 shadow-sm"
                          >
                            NO
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <select 
                          className="text-xs border rounded px-2 py-1 outline-none bg-white focus:ring-1 focus:ring-jam-green"
                          value={order.status}
                          onChange={(e) => updateStatus(order, e.target.value as OrderStatus)}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <button 
                          onClick={() => setConfirmingOrderId(order.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">No orders found.</td>
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
