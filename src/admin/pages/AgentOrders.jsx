import { useEffect, useState } from 'react';
import { apiRequest } from '../../shared/api/client';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' }
];

export default function AgentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/admin/agents/orders', { auth: true });
      setOrders(data.items || []);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      setActionLoading(orderId);
      await apiRequest(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ deliveryStatus: status }),
        auth: true
      });
      await fetchOrders();
    } catch (e) {
      alert('Failed to update order: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (orderId) => {
    const confirmed = window.confirm('Delete this order permanently?');
    if (!confirmed) return;

    try {
      setActionLoading(orderId);
      await apiRequest(`/orders/${orderId}`, {
        method: 'DELETE',
        auth: true
      });
      await fetchOrders();
    } catch (e) {
      alert('Failed to delete order: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter(order => order.deliveryStatus === activeTab);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-lg font-semibold text-gray-900 mb-3">Agent Orders</h1>
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold text-gray-900 mb-3">Agent Orders</h1>

      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
        {TABS.map(tab => {
          const count = orders.filter(o => o.deliveryStatus === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-8">
          No {activeTab} agent orders found
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              activeTab={activeTab}
              onUpdateStatus={updateStatus}
              onDelete={handleDelete}
              isLoading={actionLoading === order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, activeTab, onUpdateStatus, onDelete, isLoading }) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-xs text-gray-500">#{order.orderId || order.id.slice(-6)}</span>
          <StatusBadge status={order.deliveryStatus} />
        </div>
        <span className="text-xs text-gray-400">
          {new Date(order.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Agent Info */}
      <div className="mb-2 p-2 bg-blue-50 rounded text-sm">
        <span className="text-blue-700 font-medium">Agent: </span>
        <span className="text-blue-900">{order.agentName || 'Unknown'}</span>
      </div>

      {/* Order Details */}
      <div className="mb-3">
        <div className="font-medium text-gray-900">{order.phoneNumber}</div>
        <div className="text-sm text-gray-600">
          {order.networkName} - {order.sizeGb}GB
        </div>
        <div className="text-lg font-semibold text-gray-900">
          ₵{Number(order.amount).toFixed(2)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {activeTab === 'pending' && (
          <>
            <button
              onClick={() => onUpdateStatus(order.id, 'processing')}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '...' : 'Process'}
            </button>
            <button
              onClick={() => onUpdateStatus(order.id, 'cancelled')}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        )}

        {activeTab === 'processing' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'delivered')}
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? '...' : 'Mark Delivered'}
          </button>
        )}

        {activeTab === 'cancelled' && (
          <button
            onClick={() => onDelete(order.id)}
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? '...' : 'Delete'}
          </button>
        )}

        {activeTab === 'delivered' && (
          <div className="text-sm text-green-600 text-center w-full py-2">
            ✓ Completed
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}
