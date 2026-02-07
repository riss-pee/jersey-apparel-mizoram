
import React from 'react';
import { User, Order } from '../types';

interface UserDashboardProps {
  user: User | null;
  orders: Order[];
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, orders }) => {
  if (!user) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-10 flex items-center space-x-6">
        <div className="h-20 w-20 bg-jam-green rounded-full flex items-center justify-center text-white text-3xl font-bold">
          {user.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
          <span className="inline-block mt-2 bg-green-100 text-jam-green text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
            Member Since {user.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
          </span>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6">Your Order History</h2>
      
      {orders.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-500 italic">No orders found. Once you place an order, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Order ID</p>
                  <p className="font-mono text-sm">{order.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Placed On</p>
                  <p className="text-sm font-medium">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-right font-bold text-jam-green text-lg">
                  ₹{order.totalAmount || 0}
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="flex flex-wrap gap-4">
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3 bg-gray-50 p-2 rounded-lg pr-4 border border-gray-100">
                      <img src={item.image} alt={item.productName} className="w-12 h-12 rounded object-cover shadow-sm" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.productName}</p>
                        <p className="text-xs text-gray-500">Size: <span className="font-bold">{item.size}</span> | Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-start">
                  <div className="text-sm text-gray-600">
                    <span className="font-bold text-gray-900">Shipping Address:</span>
                    <p className="mt-1">{order.shippingAddress}</p>
                  </div>
                  {order.latitude && order.longitude && (
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Pinpoint Location</span>
                      <a 
                        href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-jam-green hover:underline text-xs font-bold flex items-center justify-end"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        View Pinned Location
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
