import { useEffect, useState } from 'react';
import { listOrders, updateOrder, deleteOrderById } from '../../shared/api/orders';

export default function AdminOrders() {
  const [tab, setTab] = useState('pending');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    setLoading(true);
    try {
      const items = await listOrders(tab);
      setOrders(items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [tab]);

  async function updateStatus(id, deliveryStatus) {
    try {
      await updateOrder(id, { deliveryStatus });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this order?')) return;
    try {
      await deleteOrderById(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  const tabs = [
    { key: 'pending', label: 'Pending' },
    { key: 'processing', label: 'Processing' },
    { key: 'delivered', label: 'Delivered' }
  ];

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold text-gray-900 mb-3">Orders</h1>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`px-3 py-1.5 text-xs rounded border ${
              tab === t.key 
                ? 'bg-gray-900 text-white border-gray-900' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      
      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-sm text-gray-500">No {tab} orders.</div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onUpdateStatus={updateStatus}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onUpdateStatus, onDelete }) {
  // Only show delete button for delivered orders
  const canDelete = order.deliveryStatus === 'delivered';

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900">
            {order.networkName} • {order.sizeGb ? `${order.sizeGb}GB` : order.packageTitle}
          </div>
          <div className="text-xs text-gray-600 mt-0.5">
            {order.phoneNumber}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            ₵{Number(order.amount).toFixed(2)} • {order.orderId}
          </div>
          <div className="mt-1">
            <StatusBadge label={order.deliveryStatus} type="delivery" />
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          {order.deliveryStatus === 'pending' && (
            <button 
              className="text-xs px-2 py-1 rounded border border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => onUpdateStatus(order.id, 'processing')}
            >
              Start Processing
            </button>
          )}
          {order.deliveryStatus === 'processing' && (
            <button 
              className="text-xs px-2 py-1 rounded border border-green-300 text-green-700 hover:bg-green-50"
              onClick={() => onUpdateStatus(order.id, 'delivered')}
            >
              Mark Delivered
            </button>
          )}
          {canDelete && (
            <button 
              className="text-xs px-2 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50"
              onClick={() => onDelete(order.id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label, type }) {
  const colors = {
    payment: {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    },
    delivery: {
      pending: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800'
    }
  };
  
  const colorClass = colors[type]?.[label] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${colorClass}`}>
      {label}
    </span>
  );
}