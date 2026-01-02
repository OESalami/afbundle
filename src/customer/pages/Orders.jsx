import React, { useState, useEffect } from 'react';
import { getOrders as getLocalOrders, deleteOrderFromStorage, saveOrders } from '../../shared/utils/storage';
import { getOrderStatus } from '../../shared/api/orders';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load orders from localStorage and sync with backend
  useEffect(() => {
    const syncOrders = async () => {
      setLoading(true);
      const localOrders = getLocalOrders();
      
      if (localOrders.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Fetch latest status for each order from backend
      const updatedOrders = await Promise.all(
        localOrders.map(async (order) => {
          try {
            const freshOrder = await getOrderStatus(order.orderId || order.id);
            return {
              ...order,
              deliveryStatus: freshOrder.deliveryStatus,
              paymentStatus: freshOrder.paymentStatus,
            };
          } catch (err) {
            // If order not found in backend, keep local data
            return order;
          }
        })
      );

      // Update localStorage with fresh statuses
      saveOrders(updatedOrders);
      setOrders(updatedOrders);
      setLoading(false);
    };

    syncOrders();
  }, []);

  const handleDelete = (orderId) => {
    if (!window.confirm('Remove this order from your list?')) return;
    const updated = deleteOrderFromStorage(orderId);
    setOrders(updated);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-lg font-semibold text-gray-900 mb-3">Your Orders</h1>
        <div className="text-sm text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-lg font-semibold text-gray-900 mb-3">Your Orders</h1>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-sm text-gray-500">
          No orders yet. Place an order to see it here.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard 
              key={order.id || order.orderId} 
              order={order} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onDelete }) {
  const deliveryStatus = order.deliveryStatus || order.status || 'pending';
  const orderId = order.orderId || order.id;
  
  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4">
      {/* Order ID & Date */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500">
          #{orderId}
        </span>
        <div className="flex items-center gap-2">
          {order.createdAt && (
            <span className="text-xs text-gray-400">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          )}
          <button
            onClick={() => onDelete(orderId)}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Remove from list"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Order Details */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Network</span>
          <span className="text-gray-900 font-medium">{order.networkName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Data</span>
          <span className="text-gray-900 font-medium">
            {order.sizeGb || order.dataSize}GB
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Recipient</span>
          <span className="text-gray-900">{order.phoneNumber || order.recipient}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Amount</span>
          <span className="text-gray-900 font-medium">
            ₵{Number(order.amount || order.price).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <StatusBadge label={deliveryStatus} type="delivery" />
      </div>
    </div>
  );
}

function StatusBadge({ label, type }) {
  const getColors = () => {
    if (type === 'payment') {
      switch (label) {
        case 'paid': return 'bg-green-100 text-green-800';
        case 'failed': return 'bg-red-100 text-red-800';
        default: return 'bg-yellow-100 text-yellow-800';
      }
    } else {
      switch (label) {
        case 'delivered': return 'bg-green-100 text-green-800';
        case 'processing': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  };

  const getIcon = () => {
    if (type === 'delivery') {
      switch (label) {
        case 'delivered':
          return (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          );
        case 'processing':
          // return (
          //   <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          //     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          //     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          //   </svg>
          // );
        default:

          return (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          );
      }
    }
    return null;
  };

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getColors()}`}>
      {getIcon()}
      <span className="capitalize">{label}</span>
    </span>
  );
}