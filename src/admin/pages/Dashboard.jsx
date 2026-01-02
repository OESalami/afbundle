import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../shared/api/client';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    apiRequest('/stats', { auth: true })
      .then((data) => { 
        if (mounted) setStats(data);
      })
      .catch((e) => { 
        if (mounted) setError(e.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
      
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-lg font-semibold text-gray-900 mb-3">Dashboard</h1>
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold text-gray-900 mb-3">Dashboard</h1>
      
      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
      
      {stats && (
        <>
          {/* Customer Orders Stats */}
          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-600 mb-2">Customer Orders</h2>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Pending" value={stats.pendingCount} color="yellow" />
              <MetricCard label="Processing" value={stats.processingCount} color="blue" />
              <MetricCard label="Delivered" value={stats.deliveredCount} color="green" />
              <MetricCard label="Today" value={stats.todayOrders} color="gray" />
            </div>
          </div>

          {/* Agent Stats */}
          <div className="mb-4">
            <h2 className="text-sm font-medium text-gray-600 mb-2">Agents</h2>
            <div className="grid grid-cols-3 gap-3">
              <MetricCard label="Pending" value={stats.agentPending || 0} color="yellow" />
              <MetricCard label="Approved" value={stats.agentApproved || 0} color="green" />
              <MetricCard label="Rejected" value={stats.agentRejected || 0} color="red" />
            </div>
          </div>
          
          {/* Wallet */}
          <div className="border border-gray-200 rounded-lg bg-white p-4 mb-4">
            <div className="text-xs text-gray-600">Total Revenue</div>
            <div className="text-2xl font-bold text-gray-900">
              ₵{Number(stats.wallet).toFixed(2)}
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-2">
            <Link 
              to="/admin/orders" 
              className="block text-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium"
            >
              View Orders
            </Link>
            <Link 
              to="/admin/agents" 
              className="block text-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
            >
              Manage Agents
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, color }) {
  const colors = {
    yellow: 'border-yellow-200 bg-yellow-50',
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    red: 'border-red-200 bg-red-50',
    gray: 'border-gray-200 bg-gray-50'
  };
  
  return (
    <div className={`border rounded-lg p-3 ${colors[color] || colors.gray}`}>
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}