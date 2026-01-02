import React, { useState, useEffect } from 'react';
import { getOrdersByAgent } from '../../shared/api/orders';
import { getAgentData } from '../../shared/api/agent';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const agentData = getAgentData();

  const loadOrders = async () => {
    if (!agentData?.phone) return;

    setLoading(true);
    setError('');

    try {
      const items = await getOrdersByAgent(agentData.phone);
      setOrders(items || []);
      setFilteredOrders(items || []);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [agentData?.phone]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [agentData?.phone]);

  // Filter orders based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = orders.filter(order => 
        order.phoneNumber?.toLowerCase().includes(query) ||
        order.orderId?.toLowerCase().includes(query) ||
        order.networkName?.toLowerCase().includes(query) ||
        order.deliveryStatus?.toLowerCase().includes(query)
      );
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-900">Your Orders</h1>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="text-sm text-blue-600 hover:underline disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by phone, order ID, network..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 mb-3">{error}</div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-sm text-gray-500">
          {searchQuery ? 'No orders match your search.' : 'No orders yet.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id || order.orderId} order={order} />
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        Auto-refreshes every 30 seconds
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const deliveryStatus = order.deliveryStatus || 'pending';
  const paymentStatus = order.paymentStatus || 'pending';

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500">
          {order.orderId || `#${order.id}`}
        </span>
        {order.createdAt && (
          <span className="text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Network</span>
          <span className="font-medium text-gray-900">{order.networkName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Data</span>
          <span className="font-medium text-gray-900">{order.sizeGb}GB</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Recipient</span>
          <span className="text-gray-900">{order.phoneNumber}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Amount</span>
          <span className="font-medium text-gray-900">₵{Number(order.amount).toFixed(2)}</span>
        </div>
      </div>

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

  return (
    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getColors()}`}>
      {label}
    </span>
  );
}
